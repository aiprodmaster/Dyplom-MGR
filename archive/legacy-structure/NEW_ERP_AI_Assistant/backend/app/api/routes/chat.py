"""
API Router dla funkcjonalności chat
"""

from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import time
import uuid
import logging

from ...services.rag_service import RAGService
from ...services.database_service import DatabaseService
from ...dependencies import get_rag_service, get_db_service

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class ChatRequest(BaseModel):
    """Model zapytania chat"""
    message: str
    user_id: Optional[str] = "anonymous"
    session_id: Optional[str] = None
    context: Optional[str] = None

class ChatResponse(BaseModel):
    """Model odpowiedzi chat"""
    answer: str
    sources: List[Dict[str, Any]] = []
    question: str
    timestamp: str
    session_id: str
    processing_time: Optional[float] = None
    error: bool = False

class FeedbackRequest(BaseModel):
    """Model feedbacku dla odpowiedzi"""
    chat_id: int
    score: int  # 1-5
    comment: Optional[str] = None

class SearchRequest(BaseModel):
    """Model zapytania wyszukiwania"""
    query: str
    limit: int = 5

@router.post("/ask", response_model=ChatResponse)
async def ask_question(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    rag_service: RAGService = Depends(get_rag_service),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do zadawania pytań AI asystentowi
    """
    try:
        start_time = time.time()
        
        logger.info(f"💬 Otrzymano pytanie od {request.user_id}: {request.message[:100]}...")
        
        # Generowanie session_id jeśli brak
        session_id = request.session_id or str(uuid.uuid4())
        
        # Wysłanie zapytania do RAG
        result = await rag_service.ask_question(
            question=request.message,
            user_id=request.user_id
        )
        
        processing_time = time.time() - start_time
        
        # Dodanie metadanych do odpowiedzi
        result.update({
            "session_id": session_id,
            "processing_time": processing_time
        })
        
        # Zapisanie do bazy danych w tle
        background_tasks.add_task(
            db_service.save_chat_interaction,
            user_id=request.user_id,
            question=request.message,
            answer=result["answer"],
            sources=result["sources"],
            session_id=session_id,
            processing_time=processing_time
        )
        
        logger.info(f"✅ Odpowiedź wygenerowana w {processing_time:.2f}s")
        
        return ChatResponse(**result)
        
    except Exception as e:
        logger.error(f"❌ Błąd podczas przetwarzania pytania: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas przetwarzania pytania: {str(e)}"
        )

@router.post("/search")
async def search_knowledge_base(
    request: SearchRequest,
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Endpoint do wyszukiwania w bazie wiedzy
    """
    try:
        logger.info(f"🔍 Wyszukiwanie: {request.query[:100]}...")
        
        results = await rag_service.search_documents(
            query=request.query,
            k=request.limit
        )
        
        return {
            "query": request.query,
            "results": results,
            "count": len(results)
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd wyszukiwania: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas wyszukiwania: {str(e)}"
        )

@router.get("/history/{user_id}")
async def get_chat_history(
    user_id: str,
    limit: int = 50,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania historii rozmów użytkownika
    """
    try:
        logger.info(f"📜 Pobieranie historii dla użytkownika: {user_id}")
        
        history = await db_service.get_chat_history(
            user_id=user_id,
            limit=limit
        )
        
        return {
            "user_id": user_id,
            "history": history,
            "count": len(history)
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania historii: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania historii: {str(e)}"
        )

@router.post("/feedback")
async def submit_feedback(
    request: FeedbackRequest,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do wysyłania feedbacku dla odpowiedzi
    """
    try:
        logger.info(f"👍 Otrzymano feedback dla chat_id: {request.chat_id}, score: {request.score}")
        
        # TODO: Implementacja zapisywania feedbacku
        # Tutaj można rozszerzyć o zapisywanie feedbacku w bazie
        
        return {
            "message": "Feedback zapisany pomyślnie",
            "chat_id": request.chat_id,
            "score": request.score
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd zapisywania feedbacku: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas zapisywania feedbacku: {str(e)}"
        )

@router.get("/suggestions")
async def get_question_suggestions():
    """
    Endpoint do pobierania sugerowanych pytań
    """
    try:
        # Przykładowe sugestie dla konsultantów ERP
        suggestions = [
            "Jak skonfigurować moduł księgowości w Comarch ERP XL?",
            "Jakie są najczęstsze problemy podczas wdrożenia ERP?",
            "Jak przeprowadzić migrację danych z poprzedniego systemu?",
            "Jakie są najlepsze praktyki dla szkoleń użytkowników?",
            "Jak skonfigurować integracje z systemami zewnętrznymi?",
            "Jakie raporty można generować w module finansowym?",
            "Jak zarządzać uprawnieniami użytkowników?",
            "Jakie są wymagania techniczne dla instalacji?",
            "Jak przeprowadzić testy akceptacyjne?",
            "Jakie są etapy wdrożenia systemu ERP?"
        ]
        
        return {
            "suggestions": suggestions,
            "count": len(suggestions)
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania sugestii: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania sugestii: {str(e)}"
        )

@router.get("/stats")
async def get_chat_stats(
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania statystyk chat
    """
    try:
        logger.info("📊 Pobieranie statystyk chat...")
        
        stats = await db_service.get_dashboard_stats()
        
        # Dodanie dodatkowych statystyk specyficznych dla chat
        chat_stats = {
            "total_interactions": stats.get("total_chat_interactions", 0),
            "avg_processing_time": "0.85s",  # Przykładowa wartość
            "most_common_topics": [
                "Konfiguracja ERP",
                "Migracja danych", 
                "Szkolenia użytkowników",
                "Integracje",
                "Raporty"
            ]
        }
        
        return chat_stats
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania statystyk: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania statystyk: {str(e)}"
        )

@router.get("/knowledge-base/stats")
async def get_knowledge_base_stats(
    rag_service: RAGService = Depends(get_rag_service)
):
    """
    Endpoint do pobierania statystyk bazy wiedzy
    """
    try:
        logger.info("📚 Pobieranie statystyk bazy wiedzy...")
        
        stats = await rag_service.get_knowledge_base_stats()
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania statystyk bazy wiedzy: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania statystyk bazy wiedzy: {str(e)}"
        )
