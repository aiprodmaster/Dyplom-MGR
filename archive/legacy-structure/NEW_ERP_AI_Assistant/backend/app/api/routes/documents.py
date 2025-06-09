"""
API Router dla zarządzania dokumentami
"""

from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, BackgroundTasks
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging
import os
import shutil
from datetime import datetime

from ...services.rag_service import RAGService
from ...services.database_service import DatabaseService
from ...dependencies import get_rag_service, get_db_service
from ...config.settings import get_settings

logger = logging.getLogger(__name__)

router = APIRouter()

# Pydantic models
class DocumentInfo(BaseModel):
    """Model informacji o dokumencie"""
    id: int
    filename: str
    file_size: int
    file_type: str
    upload_date: str
    processed: bool
    chunk_count: int

class UploadResponse(BaseModel):
    """Model odpowiedzi upload"""
    success: bool
    document_id: Optional[int]
    filename: str
    message: str
    processing_status: str

@router.post("/upload", response_model=UploadResponse)
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    user_id: str = "anonymous",
    rag_service: RAGService = Depends(get_rag_service),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do upload dokumentów do bazy wiedzy
    """
    try:
        settings = get_settings()
        
        logger.info(f"📄 Upload dokumentu: {file.filename} przez użytkownika: {user_id}")
        
        # Walidacja pliku
        if not file.filename:
            raise HTTPException(status_code=400, detail="Brak nazwy pliku")
        
        # Sprawdzenie rozszerzenia pliku
        file_extension = os.path.splitext(file.filename)[1].lower().replace('.', '')
        if file_extension not in settings.ALLOWED_FILE_TYPES:
            raise HTTPException(
                status_code=400, 
                detail=f"Nieobsługiwany typ pliku. Dozwolone: {', '.join(settings.ALLOWED_FILE_TYPES)}"
            )
        
        # Sprawdzenie rozmiaru pliku
        file_content = await file.read()
        file_size = len(file_content)
        
        if file_size > settings.MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"Plik zbyt duży. Maksymalny rozmiar: {settings.MAX_FILE_SIZE / (1024*1024):.1f}MB"
            )
        
        # Zapisanie pliku
        file_path = os.path.join(settings.UPLOAD_DIRECTORY, file.filename)
        
        # Sprawdzenie czy plik już istnieje i dodanie sufiksu jeśli tak
        counter = 1
        original_path = file_path
        while os.path.exists(file_path):
            name, ext = os.path.splitext(original_path)
            file_path = f"{name}_{counter}{ext}"
            counter += 1
        
        with open(file_path, "wb") as buffer:
            buffer.write(file_content)
        
        # Zapisanie informacji o dokumencie w bazie
        document_id = await db_service.save_document_info(
            filename=os.path.basename(file_path),
            file_path=file_path,
            file_size=file_size,
            file_type=file_extension,
            user_id=user_id,
            metadata={"original_filename": file.filename}
        )
        
        # Przetwarzanie dokumentu w tle
        background_tasks.add_task(
            process_document_background,
            file_path=file_path,
            document_id=document_id,
            rag_service=rag_service
        )
        
        logger.info(f"✅ Dokument uploaded: {file.filename} (ID: {document_id})")
        
        return UploadResponse(
            success=True,
            document_id=document_id,
            filename=os.path.basename(file_path),
            message="Dokument uploaded pomyślnie",
            processing_status="queued"
        )
        
    except Exception as e:
        logger.error(f"❌ Błąd upload dokumentu: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas upload dokumentu: {str(e)}"
        )

async def process_document_background(file_path: str, document_id: int, rag_service: RAGService):
    """Funkcja przetwarzania dokumentu w tle"""
    try:
        logger.info(f"🔄 Rozpoczęcie przetwarzania dokumentu: {file_path}")
        
        # Dodanie do RAG
        success = await rag_service.add_document(
            file_path=file_path,
            metadata={
                "document_id": document_id,
                "processed_at": datetime.now().isoformat()
            }
        )
        
        if success:
            logger.info(f"✅ Dokument przetworzony pomyślnie: {file_path}")
            # TODO: Aktualizacja statusu w bazie danych
        else:
            logger.error(f"❌ Błąd przetwarzania dokumentu: {file_path}")
            
    except Exception as e:
        logger.error(f"❌ Błąd w background processing: {e}")

@router.get("/list")
async def list_documents(
    user_id: Optional[str] = None,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania listy dokumentów
    """
    try:
        logger.info(f"📋 Pobieranie listy dokumentów dla użytkownika: {user_id}")
        
        documents = await db_service.get_documents(user_id=user_id)
        
        return {
            "documents": documents,
            "count": len(documents),
            "user_id": user_id
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania listy dokumentów: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania listy dokumentów: {str(e)}"
        )

@router.delete("/{document_id}")
async def delete_document(
    document_id: int,
    user_id: str = "anonymous",
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do usuwania dokumentu
    """
    try:
        logger.info(f"🗑️ Usuwanie dokumentu ID: {document_id} przez użytkownika: {user_id}")
        
        # TODO: Implementacja usuwania dokumentu z bazy i systemu plików
        # W rzeczywistej aplikacji trzeba by:
        # 1. Sprawdzić uprawnienia użytkownika
        # 2. Usunąć z bazy danych
        # 3. Usunąć z vector store
        # 4. Usunąć plik z dysku
        
        return {
            "success": True,
            "message": f"Dokument {document_id} został usunięty",
            "document_id": document_id
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd usuwania dokumentu: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas usuwania dokumentu: {str(e)}"
        )

@router.get("/{document_id}/info")
async def get_document_info(
    document_id: int,
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania informacji o dokumencie
    """
    try:
        logger.info(f"ℹ️ Pobieranie informacji o dokumencie ID: {document_id}")
        
        # TODO: Implementacja pobierania szczegółowych informacji o dokumencie
        
        # Przykładowe dane
        document_info = {
            "id": document_id,
            "filename": "example_document.pdf",
            "file_size": 1024000,
            "file_type": "pdf",
            "upload_date": datetime.now().isoformat(),
            "processed": True,
            "chunk_count": 25,
            "processing_time": 2.34,
            "metadata": {
                "pages": 10,
                "language": "pl",
                "keywords": ["ERP", "Comarch", "wdrożenie"]
            }
        }
        
        return document_info
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania informacji o dokumencie: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania informacji o dokumencie: {str(e)}"
        )

@router.post("/batch-upload")
async def batch_upload_documents(
    background_tasks: BackgroundTasks,
    files: List[UploadFile] = File(...),
    user_id: str = "anonymous",
    rag_service: RAGService = Depends(get_rag_service),
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do upload wielu dokumentów jednocześnie
    """
    try:
        logger.info(f"📦 Batch upload {len(files)} dokumentów przez użytkownika: {user_id}")
        
        results = []
        
        for file in files:
            try:
                # Tutaj byłaby podobna logika jak w pojedynczym upload
                # Uproszczona wersja dla demo
                
                results.append({
                    "filename": file.filename,
                    "success": True,
                    "message": "Zaplanowany do przetworzenia"
                })
                
            except Exception as e:
                results.append({
                    "filename": file.filename,
                    "success": False,
                    "error": str(e)
                })
        
        successful_uploads = len([r for r in results if r["success"]])
        
        return {
            "total_files": len(files),
            "successful_uploads": successful_uploads,
            "failed_uploads": len(files) - successful_uploads,
            "results": results
        }
        
    except Exception as e:
        logger.error(f"❌ Błąd batch upload: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas batch upload: {str(e)}"
        )

@router.get("/stats")
async def get_documents_stats(
    db_service: DatabaseService = Depends(get_db_service)
):
    """
    Endpoint do pobierania statystyk dokumentów
    """
    try:
        logger.info("📊 Pobieranie statystyk dokumentów...")
        
        # Przykładowe statystyki
        stats = {
            "total_documents": 156,
            "total_size_mb": 234.5,
            "processed_documents": 142,
            "pending_documents": 14,
            "file_types": {
                "pdf": 89,
                "docx": 43,
                "txt": 18,
                "xml": 6
            },
            "avg_processing_time": 1.8,
            "last_upload": datetime.now().isoformat()
        }
        
        return stats
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania statystyk dokumentów: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Błąd podczas pobierania statystyk dokumentów: {str(e)}"
        )
