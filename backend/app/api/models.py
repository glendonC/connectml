from pydantic import BaseModel
from typing import List, Dict, Optional, Literal

class SearchStep(BaseModel):
    """A single search step in the agent's process"""
    query: str
    status: Literal['loading', 'complete']
    timestamp: int
    type: Literal['web', 'think', 'generate', 'search']

class ComponentRecommendation(BaseModel):
    """A recommended component for the pipeline"""
    id: str
    name: str
    description: str
    confidence: float
    reason: str

class RecommendRequest(BaseModel):
    """Request to get component recommendations"""
    prompt: str
    mode: Literal['quick', 'agentic']

class RecommendResponse(BaseModel):
    """Response containing recommendations and any state updates"""
    recommendations: List[ComponentRecommendation]
    search_steps: Optional[List[SearchStep]] = None
    error: Optional[str] = None

class PipelineRequest(BaseModel):
    """Request to generate a pipeline"""
    prompt: str
    mode: Literal['quick', 'agentic']
    clarification_answers: Optional[Dict[str, str]] = None

class PipelineResponse(BaseModel):
    """Response containing the generated pipeline"""
    components: List[Dict]
    connections: List[Dict]
    name: str
    description: str
    search_steps: Optional[List[SearchStep]] = None
    error: Optional[str] = None
