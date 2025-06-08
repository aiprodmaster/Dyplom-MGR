"""
Dependency injection dla ERP AI Assistant
"""

from functools import lru_cache
from .services.rag_service import RAGService
from .services.database_service import DatabaseService

# Globalne instancje usług
_rag_service: RAGService = None
_db_service: DatabaseService = None

def set_services(rag_service: RAGService, db_service: DatabaseService):
    """Ustawienie globalnych instancji usług"""
    global _rag_service, _db_service
    _rag_service = rag_service
    _db_service = db_service

def get_rag_service() -> RAGService:
    """Dependency injection dla RAG service"""
    if _rag_service is None:
        raise RuntimeError("RAG Service nie jest zainicjalizowany")
    return _rag_service

def get_db_service() -> DatabaseService:
    """Dependency injection dla database service"""
    if _db_service is None:
        raise RuntimeError("Database Service nie jest zainicjalizowany")
    return _db_service
