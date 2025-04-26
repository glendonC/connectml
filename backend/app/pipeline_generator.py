from typing import List, Dict, Any, Optional
from dataclasses import dataclass
import json
from openai import AsyncOpenAI
from pydantic import BaseModel

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
    explanation: str
    code_preview: str

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

async def generate_pipeline(
    user_prompt: str,
    component_catalog: List[Component],
    client: AsyncOpenAI,
    clarification_answers: Optional[Dict[str, str]] = None
) -> PipelineResponse:
    """
    Main pipeline generation function that orchestrates the entire process.
    """
    # Include clarification answers in the component selection process
    prompt_with_context = user_prompt
    if clarification_answers:
        prompt_with_context += "\n\nAdditional Context:\n"
        for q_id, answer in clarification_answers.items():
            prompt_with_context += f"- {q_id}: {answer}\n"
    
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
    
    # 5. Generate code preview (placeholder for now)
    code_preview = "\n".join(c.code_snippet for c in selected_components)
    
    return PipelineResponse(
        components=component_dicts,
        explanation=explanation,
        code_preview=code_preview
    ) 