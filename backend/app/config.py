import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "FitPilot"
    # Use SQLite by default for development
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./fitpilot.db")
    
    # Frontend URL for CORS
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:5173")
    
    # JWT authentication settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", "09d25e094faa6ca2556c818166b7a9563b93f7099f6f0f4caa6cf63b88e8d3e7")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # OpenRouter API Key and Model
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "openrouter")
    OPENROUTER_API_KEY: str = os.getenv("OPENROUTER_API_KEY", "")
    OPENROUTER_MODEL: str = os.getenv("OPENROUTER_MODEL", "google/gemma-4-26b-a4b-it:free")

    class Config:
        env_file = ".env"

settings = Settings()
