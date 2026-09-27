import os
from pydantic_settings import BaseSettings
from dotenv import load_dotenv

# Load local .env if present
load_dotenv()

class Settings(BaseSettings):
    PROJECT_NAME: str = "AIVOA - AI-Powered Deviation Intake Module"
    VERSION: str = "1.0.0"
    API_V1_PREFIX: str = "/api"
    
    # AI / Groq Configuration
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    GROQ_MODEL: str = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
    
    # Database Configuration (PostgreSQL supported, SQLite zero-config fallback)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./deviations.db")
    
    # Environment
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    CORS_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "*"]

    class Config:
        case_sensitive = True

settings = Settings()
