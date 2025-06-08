"""
Główny plik aplikacji FastAPI dla ERP AI Assistant
"""

from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import uvicorn
import os
from contextlib import asynccontextmanager

# Import lokalnych modułów
from .api.routes.chat import router as chat_router
from .api.routes.documents import router as documents_router
from .api.routes.analytics import router as analytics_router
from .api.routes.auth import router as auth_router
from .config.settings import get_settings
from .services.rag_service import RAGService
from .services.database_service import DatabaseService
from .dependencies import set_services

# Import logowania
import logging
import structlog

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO)
logger = structlog.get_logger()

# Lifecycle management
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Zarządzanie cyklem życia aplikacji"""
    logger.info("🚀 Uruchamianie ERP AI Assistant...")
    
    # Inicjalizacja usług
    try:
        # Inicjalizacja bazy danych
        db_service = DatabaseService()
        await db_service.initialize()
        logger.info("✅ Baza danych zainicjalizowana")
        
        # Inicjalizacja RAG
        rag_service = RAGService()
        await rag_service.initialize()
        logger.info("✅ System RAG zainicjalizowany")
        
        # Ustawienie globalnych instancji usług
        set_services(rag_service, db_service)
        
    except Exception as e:
        logger.error(f"❌ Błąd inicjalizacji: {e}")
        raise
    
    logger.info("🎉 ERP AI Assistant gotowy do działania!")
    
    yield
    
    # Cleanup podczas zamykania
    logger.info("🔄 Zamykanie aplikacji...")
    try:
        from .dependencies import get_rag_service, get_db_service
        await get_rag_service().cleanup()
        await get_db_service().cleanup()
    except RuntimeError:
        pass  # Usługi nie były zainicjalizowane
    logger.info("✅ Aplikacja zamknięta pomyślnie")

# Tworzenie aplikacji FastAPI
def create_app() -> FastAPI:
    """Factory do tworzenia aplikacji FastAPI"""
    settings = get_settings()
    
    app = FastAPI(
        title="ERP AI Assistant API",
        description="Inteligentny asystent dla wdrożeń systemów ERP",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
        lifespan=lifespan
    )

    # Konfiguracja CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # Dodanie routerów API
    app.include_router(
        auth_router,
        prefix="/api/v1/auth",
        tags=["authentication"]
    )
    
    app.include_router(
        chat_router,
        prefix="/api/v1/chat",
        tags=["chat"]
    )
    
    app.include_router(
        documents_router,
        prefix="/api/v1/documents",
        tags=["documents"]
    )
    
    app.include_router(
        analytics_router,
        prefix="/api/v1/analytics",
        tags=["analytics"]
    )

    # Statyczne pliki (jeśli potrzebne)
    if os.path.exists("static"):
        app.mount("/static", StaticFiles(directory="static"), name="static")

    return app

# Tworzenie instancji aplikacji
app = create_app()

# Health check endpoint
@app.get("/health")
async def health_check():
    """Endpoint sprawdzania zdrowia aplikacji"""
    return {
        "status": "healthy",
        "service": "ERP AI Assistant",
        "version": "1.0.0"
    }

# Root endpoint
@app.get("/")
async def root():
    """Główny endpoint aplikacji"""
    return {
        "message": "🚀 ERP AI Assistant API",
        "docs": "/docs",
        "version": "1.0.0",
        "status": "running"
    }

# Error handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handler dla wyjątków HTTP"""
    logger.error(f"HTTP Exception: {exc.status_code} - {exc.detail}")
    return {
        "error": True,
        "message": exc.detail,
        "status_code": exc.status_code
    }

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handler dla ogólnych wyjątków"""
    logger.error(f"Unexpected error: {str(exc)}")
    return {
        "error": True,
        "message": "Wystąpił nieoczekiwany błąd",
        "details": str(exc) if app.debug else None
    }


if __name__ == "__main__":
    # Uruchomienie aplikacji tylko jeśli ten plik jest wykonywany bezpośrednio
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
