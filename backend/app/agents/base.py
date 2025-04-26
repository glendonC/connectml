from abc import ABC, abstractmethod
from typing import Dict, Any, List

class BaseAgent(ABC):
    """Base class for all agents"""
    
    def __init__(self):
        self.state: Dict[str, Any] = {}
    
    @abstractmethod
    async def process_request(self, message: str) -> Dict[str, Any]:
        """Process a user request and return a response"""
        pass
    
    @abstractmethod
    async def get_state_updates(self) -> List[Dict[str, Any]]:
        """Get any state updates (e.g., search progress) from the agent"""
        pass
