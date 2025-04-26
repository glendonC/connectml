from openai import AsyncOpenAI
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def get_openai_client() -> AsyncOpenAI:
    """Get an instance of the OpenAI client with API key from environment variables."""
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise ValueError("OPENAI_API_KEY environment variable is not set")
    
    return AsyncOpenAI(api_key=api_key) 