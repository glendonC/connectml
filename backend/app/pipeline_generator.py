from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
from openai import AsyncOpenAI
from pydantic import BaseModel
import time
import asyncio
from tavily import TavilyClient
from .api.models import SearchStep
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Tavily client once
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

class ComponentRequirements(BaseModel):
    dependencies: List[str]
    environments: List[str]
    min_cpu: Optional[str] = None
    min_ram: Optional[str] = None
    min_gpu: Optional[str] = None

class AgentReasoning(BaseModel):
    agent_name: str
    role: str
    quote: str
    component_title: str
    description: str
    why: str
    performance_impact: Dict[str, str]

class ClarificationQuestion(BaseModel):
    id: str
    question: str
    type: str  # 'select' | 'text' | 'number'
    options: Optional[List[str]] = None
    placeholder: Optional[str] = None

class ClarificationResponse(BaseModel):
    questions: List[ClarificationQuestion]
    context: str

class Component(BaseModel):
    id: str
    name: str
    type: str
    description: str
    code_snippet: str
    requirements: ComponentRequirements
    agent: Dict[str, str]

class PipelineResponse(BaseModel):
    components: List[Dict[str, Any]]
    connections: List[Dict[str, Any]]
    name: str
    description: str
    search_steps: Optional[List[Dict[str, Any]]] = None

async def select_components(prompt: str, catalog: List[Component], client: AsyncOpenAI) -> List[Component]:
    """
    Use GPT-4 to select appropriate components from the catalog based on the user prompt.
    """
    system_prompt = """You are an ML pipeline architect. Your task is to select appropriate components 
    from the provided catalog to build a pipeline that addresses the user's needs. Consider:
    - Required preprocessing steps
    - Appropriate model selection
    - Necessary postprocessing
    - Component compatibility and order
    
    Output a JSON array of component IDs with reasoning for each selection.
    Format: [{"id": "component_id", "reason": "explanation"}]
    """
    
    # Convert catalog to a simplified format for the prompt
    catalog_prompt = [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "description": c.description
        } for c in catalog
    ]
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"""
        User Request: {prompt}
        
        Available Components:
        {json.dumps(catalog_prompt, indent=2)}
        
        Select components and explain your choices.
        """}
    ]
    
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    # Parse the response and get selected components
    try:
        selections = json.loads(response.choices[0].message.content)
        selected_ids = [s["id"] for s in selections]
        selected_components = [c for c in catalog if c.id in selected_ids]
        return selected_components
    except json.JSONDecodeError:
        raise ValueError("Failed to parse GPT-4 response")

def validate_pipeline(components: List[Component]) -> List[str]:
    """
    Validate the pipeline composition and return any warnings or errors.
    """
    issues = []
    
    # Check component order
    has_model = any(c.type == "model" for c in components)
    has_postprocessing = any(c.type == "postprocessing" for c in components)
    
    if has_postprocessing and not has_model:
        issues.append("Error: Postprocessing components require a model component")
    
    # Check for duplicate component types in sequence
    for i in range(1, len(components)):
        if components[i].type == components[i-1].type:
            issues.append(f"Warning: Multiple {components[i].type} components in sequence may impact performance")
    
    # Check environment compatibility
    environments = [set(c.requirements.environments) for c in components]
    common_environments = set.intersection(*environments) if environments else set()
    
    if not common_environments:
        issues.append("Error: No compatible environment found across components")
    
    return issues

def generate_pipeline_explanation(components: List[Component]) -> str:
    """
    Generate a natural language explanation of the pipeline.
    """
    explanation = "This pipeline consists of the following steps:\n\n"
    
    for i, component in enumerate(components, 1):
        explanation += f"{i}. {component.name}: {component.description}\n"
        explanation += f"   Agent {component.agent['name']} ({component.agent['role']}) says: {component.agent['quote']}\n\n"
    
    return explanation

async def generate_clarification_questions(
    prompt: str,
    domain: str,
    client: AsyncOpenAI
) -> ClarificationResponse:
    """
    Use GPT to generate contextual clarification questions based on the user's prompt and domain.
    """
    system_prompt = """You are an ML pipeline assistant. Your task is to generate clarification questions 
    that will help refine the pipeline for the user's needs. The questions should:
    1. Be specific to the domain and use case
    2. Help determine technical requirements
    3. Clarify data characteristics
    4. Identify performance priorities
    
    Output a JSON object with:
    {
        "questions": [
            {
                "id": "unique_id",
                "question": "The question text",
                "type": "select|text|number",
                "options": ["option1", "option2"] // for select type only
                "placeholder": "Example input" // for text/number types
            }
        ],
        "context": "A brief explanation of why these questions are important"
    }
    
    Limit to 2-3 most important questions. Make them conversational and user-friendly.
    """
    
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"""
        Domain: {domain}
        User Request: {prompt}
        
        Generate clarification questions that will help create a better ML pipeline.
        """}
    ]
    
    response = await client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        max_tokens=1000
    )
    
    try:
        result = json.loads(response.choices[0].message.content)
        return ClarificationResponse(**result)
    except json.JSONDecodeError:
        raise ValueError("Failed to parse GPT-4 response for clarification questions")

async def generate_search_queries(prompt: str, client: AsyncOpenAI) -> List[str]:
    """Generate contextual search queries based on the user prompt."""
    system_prompt = """You are an AI research assistant. Generate 3 specific search queries to gather information about the given topic.
    The queries should:
    1. Start broad to understand the overview and main concepts
    2. Focus on recent developments and state-of-the-art approaches
    3. Look for specific implementation details and best practices
    
    Format your response as a JSON array of strings, each containing a search query."""

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": f"Generate search queries for: {prompt}"}
    ]

    response = await client.chat.completions.create(
        model="gpt-4",
        messages=messages,
        temperature=0.7,
        max_tokens=200
    )

    try:
        queries = json.loads(response.choices[0].message.content)
        return queries
    except json.JSONDecodeError:
        return [
            f"{prompt} overview and techniques",
            f"latest approaches for {prompt}",
            f"best practices for {prompt}"
        ]

async def perform_tavily_search(query: str) -> Dict[str, Any]:
    """Perform a search using Tavily API."""
    try:
        # Use synchronous search in a thread pool to avoid blocking
        loop = asyncio.get_event_loop()
        result = await loop.run_in_executor(
            None, 
            lambda: tavily_client.search(
                query,
                search_depth="advanced",
                max_results=5
            )
        )
        return result
    except Exception as e:
        print(f"Tavily search error: {e}")
        return {"error": str(e)}

async def generate_pipeline(
    user_prompt: str,
    component_catalog: List[Component],
    client: AsyncOpenAI,
    mode: str = 'quick',
    clarification_answers: Optional[Dict[str, str]] = None
) -> PipelineResponse:
    """
    Main pipeline generation function that orchestrates the entire process.
    """
    search_steps = []
    current_timestamp = int(time.time() * 1000)

    if mode == 'agentic':
        # Generate contextual search queries
        search_queries = await generate_search_queries(user_prompt, client)
        
        # Create initial search steps
        search_steps = [
            SearchStep(
                query=query,
                status='loading',
                timestamp=current_timestamp + (i * 1000),
                type='web'
            ).dict()
            for i, query in enumerate(search_queries)
        ]

        # Add analysis and generation steps
        search_steps.extend([
            SearchStep(
                query='Analyzing search results and planning approach',
                status='loading',
                timestamp=current_timestamp + (len(search_queries) * 1000),
                type='think'
            ).dict(),
            SearchStep(
                query='Generating solution architecture',
                status='loading',
                timestamp=current_timestamp + ((len(search_queries) + 1) * 1000),
                type='generate'
            ).dict()
        ])

        # Perform searches in parallel using asyncio.gather with synchronous function
        search_tasks = [
            perform_tavily_search(query)
            for query in search_queries
        ]
        search_results = await asyncio.gather(*search_tasks)

        # Update search steps with completion status
        for i in range(len(search_queries)):
            search_steps[i]['status'] = 'complete'

    # Include clarification answers in the component selection process
    prompt_with_context = user_prompt
    if clarification_answers:
        prompt_with_context += "\n\nAdditional Context:\n"
        for q_id, answer in clarification_answers.items():
            prompt_with_context += f"- {q_id}: {answer}\n"
    
    # Add search results to context if available
    if mode == 'agentic' and 'search_results' in locals():
        prompt_with_context += "\n\nSearch Results:\n"
        for i, result in enumerate(search_results):
            if 'error' not in result:
                prompt_with_context += f"\nSearch {i+1} Results:\n"
                for item in result.get('results', [])[:3]:
                    prompt_with_context += f"- {item.get('title')}: {item.get('snippet')}\n"
    
    # 1. Select components using GPT-4
    selected_components = await select_components(prompt_with_context, component_catalog, client)
    
    # 2. Validate the pipeline
    issues = validate_pipeline(selected_components)
    if any("Error:" in issue for issue in issues):
        raise ValueError("Pipeline validation failed:\n" + "\n".join(issues))
    
    # 3. Generate explanation
    explanation = generate_pipeline_explanation(selected_components)
    
    # 4. Convert components to response format
    component_dicts = [
        {
            "id": c.id,
            "name": c.name,
            "type": c.type,
            "description": c.description,
            "requirements": c.requirements.dict(),
            "agent": c.agent,
            "code_snippet": c.code_snippet
        }
        for c in selected_components
    ]

    # Mark remaining steps as complete
    if mode == 'agentic':
        for step in search_steps:
            step['status'] = 'complete'
    
    return PipelineResponse(
        components=component_dicts,
        connections=[],  # Add connection logic here
        name=f"ML Pipeline for {user_prompt[:50]}...",
        description=explanation,
        search_steps=search_steps if mode == 'agentic' else None
    ) 