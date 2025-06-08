"""
Usługa bazy danych dla ERP AI Assistant
"""

import asyncio
from typing import List, Dict, Any, Optional
import logging
from datetime import datetime
from sqlalchemy import create_engine, Column, Integer, String, DateTime, Text, Boolean, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker

from ..config.settings import get_settings

logger = logging.getLogger(__name__)

# Base model
Base = declarative_base()

# Database models
class ChatHistory(Base):
    """Model dla historii rozmów"""
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    sources = Column(Text)  # JSON string
    timestamp = Column(DateTime, default=datetime.utcnow)
    session_id = Column(String, index=True)
    feedback_score = Column(Integer, nullable=True)  # 1-5 rating
    processing_time = Column(Float, nullable=True)

class Document(Base):
    """Model dla dokumentów w bazie wiedzy"""
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_size = Column(Integer)
    file_type = Column(String)
    upload_date = Column(DateTime, default=datetime.utcnow)
    processed = Column(Boolean, default=False)
    chunk_count = Column(Integer, default=0)
    metadata = Column(Text)  # JSON string
    user_id = Column(String, index=True)

class User(Base):
    """Model użytkownika"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    full_name = Column(String)
    role = Column(String, default="user")  # user, admin, consultant
    created_at = Column(DateTime, default=datetime.utcnow)
    last_login = Column(DateTime, nullable=True)
    is_active = Column(Boolean, default=True)
    hashed_password = Column(String)

class ProjectMetrics(Base):
    """Model dla metryk projektów ERP"""
    __tablename__ = "project_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    project_name = Column(String, nullable=False)
    client_name = Column(String)
    start_date = Column(DateTime)
    end_date = Column(DateTime, nullable=True)
    status = Column(String)  # planning, implementation, testing, completed
    progress_percentage = Column(Float, default=0.0)
    budget = Column(Float, nullable=True)
    team_size = Column(Integer, default=1)
    consultant_id = Column(String, index=True)
    risk_level = Column(String, default="low")  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class DatabaseService:
    """Główna usługa bazy danych"""
    
    def __init__(self):
        self.settings = get_settings()
        self.engine = None
        self.session_factory = None
        self.initialized = False
        
    async def initialize(self):
        """Inicjalizacja bazy danych"""
        try:
            logger.info("🔧 Inicjalizacja Database Service...")
            
            # Tworzenie engine
            self.engine = create_engine(
                self.settings.DATABASE_URL,
                echo=self.settings.DATABASE_ECHO,
                pool_pre_ping=True
            )
            
            # Session factory
            self.session_factory = sessionmaker(
                bind=self.engine,
                expire_on_commit=False
            )
            
            # Tworzenie tabel
            Base.metadata.create_all(bind=self.engine)
            
            # Dodanie przykładowych danych jeśli baza jest pusta
            await self._seed_initial_data()
            
            self.initialized = True
            logger.info("✅ Database Service zainicjalizowany pomyślnie")
            
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji Database Service: {e}")
            raise
    
    def get_session(self) -> Session:
        """Pobieranie sesji bazy danych"""
        if not self.initialized:
            raise RuntimeError("Database Service nie jest zainicjalizowany")
        return self.session_factory()
    
    async def _seed_initial_data(self):
        """Dodawanie przykładowych danych do bazy"""
        try:
            with self.get_session() as session:
                # Sprawdzenie czy są już dane
                if session.query(User).count() > 0:
                    return
                
                logger.info("🌱 Dodawanie przykładowych danych...")
                
                # Przykładowi użytkownicy
                demo_users = [
                    User(
                        username="admin",
                        email="admin@erp-assistant.com",
                        full_name="Administrator",
                        role="admin",
                        hashed_password="demo_hash"
                    ),
                    User(
                        username="consultant1",
                        email="consultant@example.com",
                        full_name="Jan Kowalski",
                        role="consultant",
                        hashed_password="demo_hash"
                    )
                ]
                
                for user in demo_users:
                    session.add(user)
                
                # Przykładowe projekty
                demo_projects = [
                    ProjectMetrics(
                        project_name="Wdrożenie ERP - ABC Sp. z o.o.",
                        client_name="ABC Sp. z o.o.",
                        start_date=datetime(2024, 1, 15),
                        status="implementation",
                        progress_percentage=65.0,
                        budget=150000.0,
                        team_size=5,
                        consultant_id="consultant1",
                        risk_level="medium"
                    ),
                    ProjectMetrics(
                        project_name="Migracja ERP - XYZ Corporation",
                        client_name="XYZ Corporation", 
                        start_date=datetime(2024, 3, 1),
                        status="testing",
                        progress_percentage=85.0,
                        budget=200000.0,
                        team_size=7,
                        consultant_id="consultant1",
                        risk_level="low"
                    )
                ]
                
                for project in demo_projects:
                    session.add(project)
                
                session.commit()
                logger.info("✅ Przykładowe dane dodane pomyślnie")
                
        except Exception as e:
            logger.error(f"❌ Błąd podczas dodawania przykładowych danych: {e}")
    
    # Chat History methods
    async def save_chat_interaction(self, user_id: str, question: str, answer: str, 
                                  sources: List[Dict] = None, session_id: str = None,
                                  processing_time: float = None) -> int:
        """Zapisywanie interakcji chat"""
        try:
            with self.get_session() as session:
                chat_record = ChatHistory(
                    user_id=user_id,
                    question=question,
                    answer=answer,
                    sources=str(sources) if sources else None,
                    session_id=session_id,
                    processing_time=processing_time
                )
                session.add(chat_record)
                session.commit()
                session.refresh(chat_record)
                return chat_record.id
        except Exception as e:
            logger.error(f"❌ Błąd zapisywania chat: {e}")
            return None
    
    async def get_chat_history(self, user_id: str, limit: int = 50) -> List[Dict]:
        """Pobieranie historii chat dla użytkownika"""
        try:
            with self.get_session() as session:
                chats = session.query(ChatHistory)\
                             .filter(ChatHistory.user_id == user_id)\
                             .order_by(ChatHistory.timestamp.desc())\
                             .limit(limit)\
                             .all()
                
                return [
                    {
                        "id": chat.id,
                        "question": chat.question,
                        "answer": chat.answer,
                        "timestamp": chat.timestamp.isoformat(),
                        "session_id": chat.session_id,
                        "feedback_score": chat.feedback_score
                    }
                    for chat in chats
                ]
        except Exception as e:
            logger.error(f"❌ Błąd pobierania historii chat: {e}")
            return []
    
    # Document methods
    async def save_document_info(self, filename: str, file_path: str, 
                               file_size: int, file_type: str, user_id: str,
                               metadata: Dict = None) -> int:
        """Zapisywanie informacji o dokumencie"""
        try:
            with self.get_session() as session:
                document = Document(
                    filename=filename,
                    file_path=file_path,
                    file_size=file_size,
                    file_type=file_type,
                    user_id=user_id,
                    metadata=str(metadata) if metadata else None
                )
                session.add(document)
                session.commit()
                session.refresh(document)
                return document.id
        except Exception as e:
            logger.error(f"❌ Błąd zapisywania dokumentu: {e}")
            return None
    
    async def get_documents(self, user_id: str = None) -> List[Dict]:
        """Pobieranie listy dokumentów"""
        try:
            with self.get_session() as session:
                query = session.query(Document)
                if user_id:
                    query = query.filter(Document.user_id == user_id)
                
                documents = query.order_by(Document.upload_date.desc()).all()
                
                return [
                    {
                        "id": doc.id,
                        "filename": doc.filename,
                        "file_size": doc.file_size,
                        "file_type": doc.file_type,
                        "upload_date": doc.upload_date.isoformat(),
                        "processed": doc.processed,
                        "chunk_count": doc.chunk_count
                    }
                    for doc in documents
                ]
        except Exception as e:
            logger.error(f"❌ Błąd pobierania dokumentów: {e}")
            return []
    
    # Project metrics methods
    async def get_project_metrics(self, consultant_id: str = None) -> List[Dict]:
        """Pobieranie metryk projektów"""
        try:
            with self.get_session() as session:
                query = session.query(ProjectMetrics)
                if consultant_id:
                    query = query.filter(ProjectMetrics.consultant_id == consultant_id)
                
                projects = query.order_by(ProjectMetrics.created_at.desc()).all()
                
                return [
                    {
                        "id": project.id,
                        "project_name": project.project_name,
                        "client_name": project.client_name,
                        "status": project.status,
                        "progress_percentage": project.progress_percentage,
                        "budget": project.budget,
                        "team_size": project.team_size,
                        "risk_level": project.risk_level,
                        "start_date": project.start_date.isoformat() if project.start_date else None,
                        "updated_at": project.updated_at.isoformat()
                    }
                    for project in projects
                ]
        except Exception as e:
            logger.error(f"❌ Błąd pobierania metryk projektów: {e}")
            return []
    
    async def get_dashboard_stats(self) -> Dict[str, Any]:
        """Pobieranie statystyk dla dashboard"""
        try:
            with self.get_session() as session:
                stats = {
                    "total_users": session.query(User).count(),
                    "total_documents": session.query(Document).count(),
                    "total_projects": session.query(ProjectMetrics).count(),
                    "total_chat_interactions": session.query(ChatHistory).count(),
                    "active_projects": session.query(ProjectMetrics)\
                                            .filter(ProjectMetrics.status.in_(["planning", "implementation", "testing"]))\
                                            .count(),
                    "completed_projects": session.query(ProjectMetrics)\
                                               .filter(ProjectMetrics.status == "completed")\
                                               .count()
                }
                
                return stats
        except Exception as e:
            logger.error(f"❌ Błąd pobierania statystyk dashboard: {e}")
            return {}
    
    async def cleanup(self):
        """Cleanup zasobów bazy danych"""
        logger.info("🧹 Cleanup Database Service...")
        if self.engine:
            self.engine.dispose()
        self.initialized = False
        logger.info("✅ Database Service cleanup zakończony")
