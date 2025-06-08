"""
Konfiguracja ustawień aplikacji ERP AI Assistant
"""

from pydantic_settings import BaseSettings
from typing import List, Optional
import os
from functools import lru_cache

class Settings(BaseSettings):
    """Klasa ustawień aplikacji"""
    
    # Podstawowe ustawienia aplikacji
    APP_NAME: str = "ERP AI Assistant"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    
    # Ustawienia serwera
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    
    # Ustawienia CORS
    ALLOWED_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001"
    ]
    
    # Ustawienia bazy danych
    DATABASE_URL: str = "sqlite:///./erp_assistant.db"
    DATABASE_ECHO: bool = False
    
    # Ustawienia AI/OpenAI
    OPENAI_API_KEY: Optional[str] = None
    CLAUDE_API_KEY: Optional[str] = None
    DEFAULT_AI_MODEL: str = "gpt-3.5-turbo"
    
    # Ustawienia RAG
    CHROMA_PERSIST_DIRECTORY: str = "./data/chroma_db"
    EMBEDDINGS_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHUNK_SIZE: int = 1000
    CHUNK_OVERLAP: int = 200
    
    # Ustawienia dokumentów
    UPLOAD_DIRECTORY: str = "./data/uploads"
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    ALLOWED_FILE_TYPES: List[str] = [
        "pdf", "docx", "txt", "xml", "html"
    ]
    
    # Ustawienia security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALGORITHM: str = "HS256"
    
    # Ustawienia cache/Redis
    REDIS_URL: str = "redis://localhost:6379"
    CACHE_TTL: int = 3600  # 1 hour
    
    # Ustawienia logowania
    LOG_LEVEL: str = "INFO"
    LOG_FILE: str = "./logs/app.log"
    
    # Ustawienia rate limiting
    RATE_LIMIT_REQUESTS: int = 100
    RATE_LIMIT_WINDOW: int = 60  # sekund
    
    # Ustawienia ERP Integration
    COMARCH_API_URL: Optional[str] = None
    COMARCH_API_KEY: Optional[str] = None
    
    # Ustawienia email (dla notyfikacji)
    SMTP_SERVER: Optional[str] = None
    SMTP_PORT: int = 587
    SMTP_USERNAME: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAIL_FROM: Optional[str] = None
    
    # Ustawienia monitoring
    ENABLE_METRICS: bool = True
    METRICS_PORT: int = 9090
    
    class Config:
        """Konfiguracja Pydantic"""
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        
        # Tworzenie katalogów jeśli nie istnieją
        os.makedirs(self.UPLOAD_DIRECTORY, exist_ok=True)
        os.makedirs(self.CHROMA_PERSIST_DIRECTORY, exist_ok=True)
        os.makedirs(os.path.dirname(self.LOG_FILE), exist_ok=True)

@lru_cache()
def get_settings() -> Settings:
    """
    Pobieranie ustawień aplikacji (cached)
    """
    return Settings()

# Ustawienia dla różnych środowisk
class DevelopmentSettings(Settings):
    """Ustawienia dla środowiska development"""
    DEBUG: bool = True
    DATABASE_ECHO: bool = True
    LOG_LEVEL: str = "DEBUG"

class ProductionSettings(Settings):
    """Ustawienia dla środowiska production"""
    DEBUG: bool = False
    DATABASE_ECHO: bool = False
    LOG_LEVEL: str = "INFO"

class TestingSettings(Settings):
    """Ustawienia dla środowiska testing"""
    DATABASE_URL: str = "sqlite:///./test.db"
    DEBUG: bool = True
    LOG_LEVEL: str = "DEBUG"

def get_settings_for_environment(env: str = None) -> Settings:
    """
    Pobieranie ustawień dla konkretnego środowiska
    """
    env = env or os.getenv("ENVIRONMENT", "development").lower()
    
    if env == "production":
        return ProductionSettings()
    elif env == "testing":
        return TestingSettings()
    else:
        return DevelopmentSettings()
