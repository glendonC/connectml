from pydantic_settings import BaseSettings
from functools import lru_cache

class Settings(BaseSettings):
    """Application settings"""
    
    # API Keys
    ANTHROPIC_API_KEY: str
    TAVILY_API_KEY: str
    
    # Model Settings
    GPT4_MODEL: str = "gpt-4-1106-preview"
    CLAUDE_MODEL: str = "claude-3-sonnet-20240229"
    
    # API Settings
    CORS_ORIGINS: list[str] = ["*"]
    
    class Config:
        env_file = ".env"

@lru_cache()
def get_settings() -> Settings:
    """Get cached settings"""
    return Settings()
