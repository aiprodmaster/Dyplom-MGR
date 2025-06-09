"""
Usługa RAG (Retrieval-Augmented Generation) dla ERP AI Assistant
"""

import asyncio
from typing import List, Dict, Any, Optional
import os
import logging
from datetime import datetime

# LangChain imports
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores import Chroma
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.document_loaders import PyPDFLoader, TextLoader
from langchain.docstore.document import Document
from langchain.llms import OpenAI
from langchain.chains import RetrievalQA
from langchain.prompts import PromptTemplate

# OpenAI
import openai

from ..config.settings import get_settings

logger = logging.getLogger(__name__)

class RAGService:
    """Główna usługa RAG dla wyszukiwania i generowania odpowiedzi"""
    
    def __init__(self):
        self.settings = get_settings()
        self.embeddings = None
        self.vectorstore = None
        self.text_splitter = None
        self.qa_chain = None
        self.initialized = False
        
    async def initialize(self):
        """Inicjalizacja usługi RAG"""
        try:
            logger.info("🔧 Inicjalizacja RAG Service...")
            
            # Konfiguracja OpenAI
            if self.settings.OPENAI_API_KEY:
                openai.api_key = self.settings.OPENAI_API_KEY
                logger.info("✅ OpenAI API skonfigurowane")
            
            # Inicjalizacja embeddings
            await self._initialize_embeddings()
            
            # Inicjalizacja vector store
            await self._initialize_vectorstore()
            
            # Inicjalizacja text splitter
            self._initialize_text_splitter()
            
            # Inicjalizacja QA chain
            await self._initialize_qa_chain()
            
            self.initialized = True
            logger.info("🎉 RAG Service zainicjalizowany pomyślnie")
            
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji RAG Service: {e}")
            raise
    
    async def _initialize_embeddings(self):
        """Inicjalizacja modelu embeddings"""
        try:
            self.embeddings = HuggingFaceEmbeddings(
                model_name=self.settings.EMBEDDINGS_MODEL,
                model_kwargs={'device': 'cpu'},
                encode_kwargs={'normalize_embeddings': True}
            )
            logger.info(f"✅ Embeddings initialized: {self.settings.EMBEDDINGS_MODEL}")
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji embeddings: {e}")
            raise
    
    async def _initialize_vectorstore(self):
        """Inicjalizacja vector store (ChromaDB)"""
        try:
            self.vectorstore = Chroma(
                persist_directory=self.settings.CHROMA_PERSIST_DIRECTORY,
                embedding_function=self.embeddings,
                collection_name="erp_knowledge_base"
            )
            logger.info("✅ Vector store (ChromaDB) zainicjalizowany")
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji vector store: {e}")
            raise
    
    def _initialize_text_splitter(self):
        """Inicjalizacja text splitter"""
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.CHUNK_SIZE,
            chunk_overlap=self.settings.CHUNK_OVERLAP,
            length_function=len,
            separators=["\n\n", "\n", " ", ""]
        )
        logger.info("✅ Text splitter zainicjalizowany")
    
    async def _initialize_qa_chain(self):
        """Inicjalizacja QA chain"""
        try:
            # Custom prompt dla ERP
            prompt_template = """
            Jesteś ekspertem ds. systemów ERP, szczególnie Comarch ERP XL. 
            Odpowiadaj na pytania na podstawie podanego kontekstu, koncentrując się na praktycznych aspektach wdrożenia ERP.
            
            Kontekst: {context}
            
            Pytanie: {question}
            
            Odpowiedź (w języku polskim, praktyczna i konkretna):
            """
            
            PROMPT = PromptTemplate(
                template=prompt_template,
                input_variables=["context", "question"]
            )
            
            if self.settings.OPENAI_API_KEY:
                llm = OpenAI(
                    openai_api_key=self.settings.OPENAI_API_KEY,
                    model_name=self.settings.DEFAULT_AI_MODEL,
                    temperature=0.1
                )
                
                self.qa_chain = RetrievalQA.from_chain_type(
                    llm=llm,
                    chain_type="stuff",
                    retriever=self.vectorstore.as_retriever(
                        search_kwargs={"k": 5}
                    ),
                    chain_type_kwargs={"prompt": PROMPT},
                    return_source_documents=True
                )
                logger.info("✅ QA Chain zainicjalizowany")
            else:
                logger.warning("⚠️ Brak klucza OpenAI - QA chain nie zostanie zainicjalizowany")
                
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji QA chain: {e}")
    
    async def ask_question(self, question: str, user_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Zadawanie pytania do systemu RAG
        
        Args:
            question: Pytanie użytkownika
            user_id: ID użytkownika (opcjonalne)
            
        Returns:
            Dict z odpowiedzią i metadanymi
        """
        if not self.initialized or not self.qa_chain:
            return {
                "answer": "System RAG nie jest gotowy. Sprawdź konfigurację API.",
                "sources": [],
                "error": True
            }
        
        try:
            logger.info(f"❓ Pytanie: {question[:100]}...")
            
            # Wykonanie zapytania
            result = await asyncio.get_event_loop().run_in_executor(
                None, self.qa_chain, {"query": question}
            )
            
            # Przetworzenie źródeł
            sources = []
            if "source_documents" in result:
                for doc in result["source_documents"]:
                    sources.append({
                        "content": doc.page_content[:200] + "...",
                        "metadata": doc.metadata,
                        "relevance_score": getattr(doc, 'relevance_score', 0.0)
                    })
            
            response = {
                "answer": result.get("result", "Nie udało się wygenerować odpowiedzi."),
                "sources": sources,
                "question": question,
                "timestamp": datetime.now().isoformat(),
                "user_id": user_id,
                "error": False
            }
            
            logger.info("✅ Odpowiedź wygenerowana pomyślnie")
            return response
            
        except Exception as e:
            logger.error(f"❌ Błąd podczas generowania odpowiedzi: {e}")
            return {
                "answer": f"Wystąpił błąd podczas przetwarzania pytania: {str(e)}",
                "sources": [],
                "error": True
            }
    
    async def add_document(self, file_path: str, metadata: Optional[Dict] = None) -> bool:
        """
        Dodawanie dokumentu do bazy wiedzy
        
        Args:
            file_path: Ścieżka do pliku
            metadata: Dodatkowe metadane
            
        Returns:
            True jeśli sukces, False w przeciwnym razie
        """
        try:
            logger.info(f"📄 Dodawanie dokumentu: {file_path}")
            
            # Określenie typu pliku i wybór loadera
            file_extension = os.path.splitext(file_path)[1].lower()
            
            if file_extension == '.pdf':
                loader = PyPDFLoader(file_path)
            elif file_extension in ['.txt', '.md']:
                loader = TextLoader(file_path, encoding='utf-8')
            else:
                logger.error(f"❌ Nieobsługiwany typ pliku: {file_extension}")
                return False
            
            # Wczytanie dokumentu
            documents = loader.load()
            
            # Dodanie metadanych
            if metadata:
                for doc in documents:
                    doc.metadata.update(metadata)
            
            # Podział na chunki
            text_chunks = self.text_splitter.split_documents(documents)
            
            # Dodanie do vector store
            await asyncio.get_event_loop().run_in_executor(
                None, self.vectorstore.add_documents, text_chunks
            )
            
            # Persist
            self.vectorstore.persist()
            
            logger.info(f"✅ Dokument dodany: {len(text_chunks)} chunków")
            return True
            
        except Exception as e:
            logger.error(f"❌ Błąd podczas dodawania dokumentu: {e}")
            return False
    
    async def search_documents(self, query: str, k: int = 5) -> List[Dict]:
        """
        Wyszukiwanie dokumentów w bazie wiedzy
        
        Args:
            query: Zapytanie wyszukiwania
            k: Liczba wyników do zwrócenia
            
        Returns:
            Lista dokumentów z wynikami wyszukiwania
        """
        try:
            if not self.vectorstore:
                return []
            
            # Semantic search
            results = await asyncio.get_event_loop().run_in_executor(
                None, self.vectorstore.similarity_search_with_score, query, k
            )
            
            documents = []
            for doc, score in results:
                documents.append({
                    "content": doc.page_content,
                    "metadata": doc.metadata,
                    "similarity_score": score,
                    "relevance": 1.0 - score  # Konwersja na relevance score
                })
            
            logger.info(f"🔍 Znaleziono {len(documents)} dokumentów")
            return documents
            
        except Exception as e:
            logger.error(f"❌ Błąd wyszukiwania: {e}")
            return []
    
    async def get_knowledge_base_stats(self) -> Dict[str, Any]:
        """Pobieranie statystyk bazy wiedzy"""
        try:
            if not self.vectorstore:
                return {"error": "Vector store nie jest zainicjalizowany"}
            
            # Pobieranie podstawowych statystyk
            collection = self.vectorstore._collection
            stats = {
                "total_documents": collection.count(),
                "collection_name": collection.name,
                "embedding_model": self.settings.EMBEDDINGS_MODEL,
                "chunk_size": self.settings.CHUNK_SIZE,
                "last_updated": datetime.now().isoformat()
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"❌ Błąd pobierania statystyk: {e}")
            return {"error": str(e)}
    
    async def cleanup(self):
        """Cleanup zasobów"""
        logger.info("🧹 Cleanup RAG Service...")
        if self.vectorstore:
            self.vectorstore.persist()
        self.initialized = False
        logger.info("✅ RAG Service cleanup zakończony")
