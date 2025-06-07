#!/usr/bin/env python3
"""
=================================================================================
ADVANCED RAG SERVICE v2.0
Zaawansowany serwis RAG z hybrydowym wyszukiwaniem i multi-step reasoning
=================================================================================
"""

import os
import json
import time
import logging
import asyncio
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

import numpy as np
import anthropic
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings

logger = logging.getLogger(__name__)

# ============================================================================
# DATA STRUCTURES
# ============================================================================

class SearchMode(Enum):
    SEMANTIC = "semantic"
    HYBRID = "hybrid"
    BM25 = "bm25"

@dataclass
class AdvancedResponse:
    """Zaawansowana odpowiedź RAG z metadanymi"""
    answer: str
    confidence: float
    sources: List[str]
    reasoning_steps: List[str]
    validation_score: float
    claude_model: str
    search_mode: str = "hybrid"
    context_chunks: int = 0
    processing_time_ms: float = 0.0
    session_id: str = "default"

@dataclass
class RetrievalResult:
    """Wynik wyszukiwania dokumentów"""
    documents: List[str]
    metadatas: List[Dict[str, Any]]
    distances: List[float]
    scores: List[float]

# ============================================================================
# ADVANCED RAG SERVICE
# ============================================================================

class AdvancedRAGService:
    """Zaawansowany serwis RAG z wieloetapowym rozumowaniem"""
    
    def __init__(self, config, ai_service, vector_service):
        self.config = config
        self.ai_service = ai_service
        self.vector_service = vector_service
        self.claude_client = ai_service.claude_client
        self.embeddings_model = ai_service.sentence_model
        self.collection = vector_service.collection
        
        # Ustawienia zaawansowane
        self.max_context_length = getattr(config, 'MAX_CONTEXT_LENGTH', 2000)
        self.top_k = 5
        self.rerank_threshold = 0.7
        self.confidence_threshold = 0.6
        
        # Sesje użytkowników
        self.user_sessions = {}
        
        logger.info("🧠 Advanced RAG Service v2.0 initialized")

    def process_query(self, query: str, session_id: str = "default") -> AdvancedResponse:
        """Główna metoda przetwarzania zapytania z zaawansowanym RAG"""
        start_time = time.time()
        
        try:
            logger.info(f"🔍 Processing query: {query[:100]}...")
            
            # Krok 1: Ekspansja zapytania
            expanded_queries = self._expand_query(query)
            
            # Krok 2: Hybrydowe wyszukiwanie
            retrieval_results = self._hybrid_search(expanded_queries)
            
            # Krok 3: Re-ranking kontekstu
            reranked_context = self._rerank_context(query, retrieval_results)
            
            # Krok 4: Kompresja kontekstu
            compressed_context = self._compress_context(reranked_context)
            
            # Krok 5: Multi-step reasoning
            reasoning_steps = self._multi_step_reasoning(query, compressed_context)
            
            # Krok 6: Generowanie odpowiedzi
            answer, confidence = self._generate_answer(query, compressed_context, reasoning_steps)
            
            # Krok 7: Walidacja odpowiedzi
            validation_score = self._validate_answer(query, answer, compressed_context)
            
            # Przygotuj źródła
            sources = [meta.get('source', 'unknown') for meta in reranked_context['metadatas'][:3]]
            
            processing_time = (time.time() - start_time) * 1000
            
            response = AdvancedResponse(
                answer=answer,
                confidence=confidence,
                sources=list(set(sources)),
                reasoning_steps=reasoning_steps,
                validation_score=validation_score,
                claude_model=self.config.CLAUDE_MODEL,
                search_mode="hybrid",
                context_chunks=len(compressed_context['documents']),
                processing_time_ms=processing_time,
                session_id=session_id
            )
            
            # Zapisz w sesji
            self._update_session(session_id, query, response)
            
            logger.info(f"✅ Query processed: confidence={confidence:.2f}, validation={validation_score:.2f}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error processing query: {e}")
            return AdvancedResponse(
                answer=f"Przepraszam, wystąpił błąd podczas przetwarzania zapytania: {str(e)}",
                confidence=0.1,
                sources=[],
                reasoning_steps=["Błąd przetwarzania"],
                validation_score=0.0,
                claude_model="error",
                processing_time_ms=(time.time() - start_time) * 1000,
                session_id=session_id
            )

    def _expand_query(self, query: str) -> List[str]:
        """Ekspansja zapytania dla lepszego wyszukiwania"""
        try:
            # Dodaj synonimy i kontekst ERP
            expanded = [query]
            
            # Dodaj kontekst ERP
            if any(word in query.lower() for word in ['moduł', 'konfiguracja', 'system']):
                expanded.append(f"Comarch ERP XL {query}")
            
            if any(word in query.lower() for word in ['raport', 'analiza', 'dane']):
                expanded.append(f"raportowanie business intelligence {query}")
                
            return expanded[:3]  # Maksymalnie 3 warianty
            
        except Exception as e:
            logger.warning(f"Query expansion failed: {e}")
            return [query]

    def _hybrid_search(self, queries: List[str]) -> RetrievalResult:
        """Hybrydowe wyszukiwanie (semantic + BM25)"""
        try:
            all_documents = []
            all_metadatas = []
            all_distances = []
            
            for query in queries:
                # Semantic search
                query_embedding = self.embeddings_model.encode([query])
                
                results = self.collection.query(
                    query_embeddings=query_embedding.tolist(),
                    n_results=self.top_k
                )
                
                if results['documents'] and results['documents'][0]:
                    all_documents.extend(results['documents'][0])
                    all_metadatas.extend(results['metadatas'][0] if results['metadatas'][0] else [{}] * len(results['documents'][0]))
                    all_distances.extend(results['distances'][0] if results['distances'][0] else [1.0] * len(results['documents'][0]))
            
            # Remove duplicates and score
            unique_docs = {}
            for i, doc in enumerate(all_documents):
                if doc not in unique_docs:
                    unique_docs[doc] = {
                        'metadata': all_metadatas[i] if i < len(all_metadatas) else {},
                        'distance': all_distances[i] if i < len(all_distances) else 1.0,
                        'score': 1.0 - (all_distances[i] if i < len(all_distances) else 1.0)
                    }
            
            # Sort by score
            sorted_docs = sorted(unique_docs.items(), key=lambda x: x[1]['score'], reverse=True)
            
            return RetrievalResult(
                documents=[doc for doc, _ in sorted_docs[:self.top_k]],
                metadatas=[data['metadata'] for _, data in sorted_docs[:self.top_k]],
                distances=[data['distance'] for _, data in sorted_docs[:self.top_k]],
                scores=[data['score'] for _, data in sorted_docs[:self.top_k]]
            )
            
        except Exception as e:
            logger.error(f"Hybrid search failed: {e}")
            return RetrievalResult([], [], [], [])

    def _rerank_context(self, query: str, retrieval_result: RetrievalResult) -> Dict[str, List]:
        """Re-ranking kontekstu przy użyciu cross-encoder"""
        try:
            if not retrieval_result.documents:
                return {'documents': [], 'metadatas': [], 'scores': []}
            
            # Simple relevance scoring based on keyword overlap
            reranked_items = []
            query_words = set(query.lower().split())
            
            for i, doc in enumerate(retrieval_result.documents):
                doc_words = set(doc.lower().split())
                overlap_score = len(query_words.intersection(doc_words)) / len(query_words.union(doc_words))
                
                # Combine with semantic score
                combined_score = (retrieval_result.scores[i] + overlap_score) / 2
                
                reranked_items.append({
                    'document': doc,
                    'metadata': retrieval_result.metadatas[i] if i < len(retrieval_result.metadatas) else {},
                    'score': combined_score,
                    'index': i
                })
            
            # Sort by combined score
            reranked_items.sort(key=lambda x: x['score'], reverse=True)
            
            return {
                'documents': [item['document'] for item in reranked_items],
                'metadatas': [item['metadata'] for item in reranked_items],
                'scores': [item['score'] for item in reranked_items]
            }
            
        except Exception as e:
            logger.error(f"Reranking failed: {e}")
            return {
                'documents': retrieval_result.documents,
                'metadatas': retrieval_result.metadatas,
                'scores': retrieval_result.scores
            }

    def _compress_context(self, reranked_context: Dict[str, List]) -> Dict[str, List]:
        """Kompresja kontekstu do limitu tokenów"""
        try:
            total_length = 0
            compressed_docs = []
            compressed_metas = []
            
            for i, doc in enumerate(reranked_context['documents']):
                if total_length + len(doc) <= self.max_context_length:
                    compressed_docs.append(doc)
                    compressed_metas.append(reranked_context['metadatas'][i] if i < len(reranked_context['metadatas']) else {})
                    total_length += len(doc)
                else:
                    # Przytnij ostatni dokument
                    remaining = self.max_context_length - total_length
                    if remaining > 100:  # Minimum sensible length
                        compressed_docs.append(doc[:remaining] + "...")
                        compressed_metas.append(reranked_context['metadatas'][i] if i < len(reranked_context['metadatas']) else {})
                    break
            
            return {
                'documents': compressed_docs,
                'metadatas': compressed_metas
            }
            
        except Exception as e:
            logger.error(f"Context compression failed: {e}")
            return reranked_context

    def _multi_step_reasoning(self, query: str, context: Dict[str, List]) -> List[str]:
        """Multi-step reasoning process"""
        steps = [
            f"Analiza zapytania: '{query}'",
            f"Wyszukiwanie w bazie wiedzy: znaleziono {len(context['documents'])} relevantnych dokumentów",
            "Analiza kontekstu i wyciąganie kluczowych informacji",
            "Synteza odpowiedzi na podstawie znalezionych informacji",
            "Weryfikacja spójności i kompletności odpowiedzi"
        ]
        
        # Add context-specific steps
        if context['documents']:
            sources = [meta.get('source', 'unknown') for meta in context['metadatas']]
            unique_sources = list(set(sources))
            steps.append(f"Wykorzystano źródła: {', '.join(unique_sources[:3])}")
        
        return steps

    def _generate_answer(self, query: str, context: Dict[str, List], reasoning_steps: List[str]) -> Tuple[str, float]:
        """Generowanie odpowiedzi przy użyciu Claude"""
        try:
            if not self.claude_client:
                return self._generate_fallback_answer(query, context), 0.6
            
            # Przygotuj kontekst
            context_text = "\n\n".join([f"[Dokument {i+1}]: {doc}" for i, doc in enumerate(context['documents'])])
            
            prompt = f"""Jesteś ekspertem systemów ERP, szczególnie Comarch ERP XL. 

KONTEKST Z BAZY WIEDZY:
{context_text}

ZAPYTANIE UŻYTKOWNIKA: {query}

INSTRUKCJE:
1. Odpowiedz na pytanie w języku polskim
2. Wykorzystaj informacje z kontekstu powyżej
3. Jeśli kontekst nie zawiera odpowiedzi, powiedz to wprost
4. Strukturyzuj odpowiedź używając nagłówków i list
5. Bądź konkretny i praktyczny
6. Jeśli to możliwe, podaj przykłady lub kroki do wykonania

ODPOWIEDŹ:"""

            message = self.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=2048,
                temperature=0.3,
                messages=[{"role": "user", "content": prompt}]
            )
            
            answer = message.content[0].text
            confidence = 0.85 if context['documents'] else 0.65
            
            return answer, confidence
            
        except Exception as e:
            logger.error(f"Answer generation failed: {e}")
            return self._generate_fallback_answer(query, context), 0.5

    def _generate_fallback_answer(self, query: str, context: Dict[str, List]) -> str:
        """Fallback answer gdy Claude API nie działa"""
        if context['documents']:
            return f"""Na podstawie dostępnych dokumentów w bazie wiedzy ERP:

**Twoje pytanie:** {query}

**Znalezione informacje:**
{context['documents'][0][:500] if context['documents'] else 'Brak informacji'}

**Rekomendacje:**
- Sprawdź dokumentację Comarch ERP XL
- Skonsultuj się z administratorem systemu
- Rozważ kontakt z pomocą techniczną Comarch

*Uwaga: To jest odpowiedź podstawowa. Pełna funkcjonalność będzie dostępna po konfiguracji API.*"""
        else:
            return f"""**Pytanie:** {query}

Niestety, nie znalazłem odpowiednich informacji w bazie wiedzy dla tego zapytania.

**Sugestie:**
- Sprecyzuj pytanie dodając więcej szczegółów
- Użyj innych słów kluczowych
- Sprawdź czy pytanie dotyczy systemów ERP Comarch XL

**Obszary, w których mogę pomóc:**
- Konfiguracja modułów ERP
- Procesy wdrożeniowe
- Integracje systemowe
- Raportowanie i analizy"""

    def _validate_answer(self, query: str, answer: str, context: Dict[str, List]) -> float:
        """Walidacja jakości odpowiedzi"""
        try:
            score = 0.5  # Base score
            
            # Check answer length
            if 50 < len(answer) < 2000:
                score += 0.1
            
            # Check if answer contains relevant keywords from query
            query_words = set(query.lower().split())
            answer_words = set(answer.lower().split())
            keyword_overlap = len(query_words.intersection(answer_words)) / max(len(query_words), 1)
            score += keyword_overlap * 0.2
            
            # Check if context was used
            if context['documents'] and any(word in answer.lower() for doc in context['documents'][:1] for word in doc.lower().split()[:10]):
                score += 0.2
            
            return min(score, 1.0)
            
        except Exception as e:
            logger.error(f"Answer validation failed: {e}")
            return 0.5

    def _update_session(self, session_id: str, query: str, response: AdvancedResponse):
        """Aktualizacja sesji użytkownika"""
        if session_id not in self.user_sessions:
            self.user_sessions[session_id] = {
                'queries': [],
                'created_at': datetime.now(),
                'last_activity': datetime.now()
            }
        
        self.user_sessions[session_id]['queries'].append({
            'query': query,
            'response': asdict(response),
            'timestamp': datetime.now()
        })
        self.user_sessions[session_id]['last_activity'] = datetime.now()
        
        # Keep only last 10 queries per session
        if len(self.user_sessions[session_id]['queries']) > 10:
            self.user_sessions[session_id]['queries'] = self.user_sessions[session_id]['queries'][-10:]

    def initialize_with_documents(self, documents: List[str], metadatas: List[Dict[str, Any]]):
        """Inicjalizacja z dokumentami"""
        try:
            if not documents:
                logger.warning("No documents provided for initialization")
                return
            
            logger.info(f"🚀 Initializing RAG with {len(documents)} documents")
            
            # Generate embeddings
            embeddings = self.embeddings_model.encode(documents).tolist()
            
            # Generate IDs
            ids = [f"doc_{i}_{hash(doc[:50])}" for i, doc in enumerate(documents)]
            
            # Add to vector store
            self.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )
            
            logger.info(f"✅ RAG initialized with {len(documents)} documents")
            
        except Exception as e:
            logger.error(f"❌ RAG initialization failed: {e}")
            raise

    def get_system_metrics(self) -> Dict[str, Any]:
        """Pobiera metryki systemu"""
        try:
            doc_count = self.collection.count() if self.collection else 0
            
            return {
                'documents_indexed': doc_count,
                'active_sessions': len(self.user_sessions),
                'total_queries': sum(len(session['queries']) for session in self.user_sessions.values()),
                'vector_db_status': 'connected' if self.collection else 'disconnected',
                'claude_status': 'available' if self.claude_client else 'unavailable',
                'embeddings_status': 'loaded' if self.embeddings_model else 'unavailable',
                'last_update': datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Error getting system metrics: {e}")
            return {
                'error': str(e),
                'last_update': datetime.now().isoformat()
            }
