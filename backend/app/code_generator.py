from typing import Dict, Any, Optional
import json
from .openai_utils import get_openai_client
from fastapi import HTTPException
from openai import AsyncOpenAI
import os

# Initialize AsyncOpenAI client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

async def refactor_code(code: str, prompt: str) -> str:
    """
    Refactor code using GPT-4 based on the provided prompt.
    
    Args:
        code: The source code to refactor
        prompt: The refactoring instructions
        
    Returns:
        str: The refactored code
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are an expert code refactoring assistant. Your task is to improve code based on specific requirements while maintaining its functionality. Only respond with the refactored code, no explanations or markdown formatting."},
                {"role": "user", "content": f"Please refactor this code according to these instructions: {prompt}\n\nCode:\n{code}"}
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        
        refactored_code = response.choices[0].message.content.strip()
        
        # Remove any markdown formatting if present
        if refactored_code.startswith("```"):
            lines = refactored_code.split("\n")
            start_idx = 1 if lines[0].strip() == "```python" else 0
            end_idx = -1 if lines[-1].strip() == "```" else None
            refactored_code = "\n".join(lines[start_idx:end_idx])
        
        return refactored_code
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

async def generate_code(pipeline: Dict[str, Any], language: str, framework: str) -> str:
    """Generate code for a machine learning pipeline using GPT-4.
    
    Args:
        pipeline: The pipeline configuration
        language: The target programming language
        framework: The ML framework to use
        
    Returns:
        str: The generated code
    """
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert ML engineer. Generate clean, well-documented code for the given pipeline."
                },
                {
                    "role": "user",
                    "content": f"Generate {language} code using {framework} for this ML pipeline:\n{pipeline}"
                }
            ],
            temperature=0.2,
            max_tokens=2000
        )
        
        generated_code = response.choices[0].message.content.strip()
        
        # Remove any markdown formatting if present
        if generated_code.startswith("```"):
            lines = generated_code.split("\n")
            start_idx = 1 if lines[0].strip() == "```python" else 0
            end_idx = -1 if lines[-1].strip() == "```" else None
            generated_code = "\n".join(lines[start_idx:end_idx])
        
        return generated_code
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) 