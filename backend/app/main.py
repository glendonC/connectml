from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
from openai import AsyncOpenAI
from dotenv import load_dotenv
import httpx
from typing import Optional, Dict, Any

from .pipeline_generator import (
    Component,
    ComponentRequirements,
    PipelineResponse,
    ClarificationResponse,
    generate_pipeline,
    generate_clarification_questions
)
from .api.models import SearchStep, PipelineRequest
from .code_generator import generate_code, refactor_code

# Load environment variables
load_dotenv()

# Initialize FastAPI app
app = FastAPI(title="ML Pipeline Generator")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite's default port
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI client
client = AsyncOpenAI(
    api_key=os.getenv("OPENAI_API_KEY"),
    http_client=httpx.AsyncClient()  # Initialize without proxies
)

# Load component catalog
def load_component_catalog() -> list[Component]:
    # For now, we'll load from a static JSON file
    # Later, this could be moved to a database
    with open("app/data/component_catalog.json") as f:
        catalog_data = json.load(f)
    return [Component(**component) for component in catalog_data]

class ClarificationRequest(BaseModel):
    prompt: str
    domain: str

class GenerateCodeRequest(BaseModel):
    pipeline: Dict[str, Any]
    language: str
    framework: str

class RefactorCodeRequest(BaseModel):
    code: str
    prompt: str

class ValidatePipelineRequest(BaseModel):
    current_components: list[Dict[str, Any]]
    new_components: list[Dict[str, Any]]

@app.post("/generate-clarification", response_model=ClarificationResponse)
async def create_clarification_questions(request: ClarificationRequest) -> ClarificationResponse:
    """Generate contextual clarification questions based on the prompt and domain."""
    try:
        response = await generate_clarification_questions(
            prompt=request.prompt,
            domain=request.domain,
            client=client
        )
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.post("/generate-pipeline", response_model=PipelineResponse)
async def create_pipeline(request: PipelineRequest) -> PipelineResponse:
    try:
        # Load component catalog
        catalog = load_component_catalog()
        
        # Generate pipeline
        response = await generate_pipeline(
            user_prompt=request.prompt,
            component_catalog=catalog,
            client=client,
            mode=request.mode,
            clarification_answers=request.clarification_answers
        )
        
        return response
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@app.get("/components", response_model=list[Component])
async def get_components():
    """Get all available components in the catalog."""
    try:
        catalog = load_component_catalog()
        return catalog
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load component catalog: {str(e)}")

@app.post("/generate-code")
async def generate_code_endpoint(request: GenerateCodeRequest):
    try:
        code = await generate_code(request.pipeline, request.language, request.framework)
        return {"code": code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/refactor-code")
async def refactor_code_endpoint(request: RefactorCodeRequest):
    try:
        refactored_code = await refactor_code(request.code, request.prompt)
        return {"refactored_code": refactored_code}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/validate-pipeline")
async def validate_pipeline_endpoint(request: ValidatePipelineRequest):
    """Validate and automatically restructure pipeline components."""
    try:
        all_components = request.current_components + request.new_components
        
        # Categorize components
        preprocessing = [c for c in all_components if c["type"] in ["preprocessing", "feature", "transformation"]]
        models = [c for c in all_components if c["type"] == "model"]
        postprocessing = [c for c in all_components if c["type"] == "postprocessing"]
        monitoring = [c for c in all_components if c["type"] in ["monitoring", "explainability"]]

        # Validation checks and automatic restructuring
        issues = []
        restructuring_notes = []
        
        if not models and (postprocessing or monitoring):
            return {
                "valid": False,
                "message": "Cannot add postprocessing or monitoring components without a model component",
                "suggested_order": None,
                "restructuring_notes": ["Add a model component before adding postprocessing or monitoring components"]
            }

        # Optimal ordering
        optimal_order = []
        
        # 1. Preprocessing components
        if preprocessing:
            # Order preprocessing components by their dependencies
            optimal_order.extend(preprocessing)
            restructuring_notes.append("Preprocessing components placed at the start of the pipeline")
            
            if len(preprocessing) > 1:
                restructuring_notes.append("Multiple preprocessing components arranged in sequence - consider potential performance impact")

        # 2. Model components
        if models:
            optimal_order.extend(models)
            if len(models) > 1:
                restructuring_notes.append("Multiple model components detected - ensure this is intentional")
        
        # 3. Postprocessing components
        if postprocessing:
            optimal_order.extend(postprocessing)
            if len(postprocessing) > 1:
                restructuring_notes.append("Postprocessing components arranged after model components")

        # 4. Monitoring components
        if monitoring:
            optimal_order.extend(monitoring)
            restructuring_notes.append("Monitoring and explainability components placed at the end of the pipeline")

        # Compare current vs optimal order
        needs_restructuring = optimal_order != all_components
        
        if needs_restructuring:
            message = "Pipeline has been automatically restructured for optimal performance"
            if len(restructuring_notes) == 0:
                restructuring_notes.append("Components reordered based on standard ML pipeline flow")
        else:
            message = "Pipeline structure is already optimal"
            restructuring_notes = ["Current component order follows best practices"]

        return {
            "valid": True,
            "message": message,
            "suggested_order": optimal_order if needs_restructuring else None,
            "restructuring_notes": restructuring_notes
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 