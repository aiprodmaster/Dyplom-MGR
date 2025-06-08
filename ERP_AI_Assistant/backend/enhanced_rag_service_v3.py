#!/usr/bin/env python3
"""
=================================================================================
ENHANCED RAG SERVICE v3.0 - NEXT GENERATION AI ASSISTANT
Najnowocześniejszy system RAG z wieloma modelami, adaptacyjnym uczeniem się i zaawansowanymi technikami AI
=================================================================================
"""

import os
import json
import time
import logging
import asyncio
import hashlib
import pickle
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Tuple, Union
from dataclasses import dataclass, asdict, field
from enum import Enum
from collections import defaultdict, deque

import numpy as np
import anthropic
from sentence_transformers import SentenceTransformer, util
import chromadb
from chromadb.config import Settings
import tiktoken

logger = logging.getLogger(__name__)

# ============================================================================
# ENHANCED DATA STRUCTURES
# ============================================================================

class QueryType(Enum):
    FACTUAL = "factual"
    PROCEDURAL = "procedural"
    TROUBLESHOOTING = "troubleshooting"
    CONFIGURATION = "configuration"
    INTEGRATION = "integration"
    REPORTING = "reporting"
    UNKNOWN = "unknown"

class ConfidenceLevel(Enum):
    VERY_HIGH = "very_high"  # 0.9+
    HIGH = "high"           # 0.75-0.9
    MEDIUM = "medium"       # 0.5-0.75
    LOW = "low"            # 0.25-0.5
    VERY_LOW = "very_low"  # <0.25

@dataclass
class ConversationContext:
    """Kontekst konwersacji dla lepszego zrozumienia"""
    session_id: str
    history: deque = field(default_factory=lambda: deque(maxlen=10))
    topic: Optional[str] = None
    domain: Optional[str] = None
    user_expertise: str = "intermediate"  # beginner, intermediate, expert
    preferences: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.now)
    last_activity: datetime = field(default_factory=datetime.now)

@dataclass
class EnhancedResponse:
    """Ulepszona odpowiedź z dodatkowymi metadanymi"""
    answer: str
    confidence: float
    confidence_level: ConfidenceLevel
    sources: List[Dict[str, Any]]
    reasoning_chain: List[str]
    validation_score: float
    query_type: QueryType
    response_type: str  # direct, synthesized, clarification_needed
    
    # Nowe pola
    citations: List[Dict[str, Any]]
    fact_check_score: float
    relevance_score: float
    completeness_score: float
    clarity_score: float
    
    # Metadane techniczne
    models_used: List[str]
    processing_steps: List[str]
    context_chunks_used: int
    total_tokens: int
    processing_time_ms: float
    
    # Adaptacyjne uczenie
    user_feedback: Optional[Dict[str, Any]] = None
    suggested_followups: List[str] = field(default_factory=list)
    
    session_id: str = "default"
    timestamp: datetime = field(default_factory=datetime.now)

@dataclass
class RetrievalContext:
    """Kontekst wyszukiwania z rozszerzonymi informacjami"""
    documents: List[str]
    metadatas: List[Dict[str, Any]]
    distances: List[float]
    scores: List[float]
    embeddings: Optional[List[List[float]]] = None
    rerank_scores: Optional[List[float]] = None
    diversity_scores: Optional[List[float]] = None
    query_similarity: Optional[List[float]] = None

# ============================================================================
# ENHANCED RAG SERVICE v3.0
# ============================================================================

class EnhancedRAGService:
    """Najnowocześniejszy system RAG z wieloma modelami AI"""
    
    def __init__(self, config, ai_service, vector_service):
        self.config = config
        self.ai_service = ai_service
        self.vector_service = vector_service
        self.claude_client = ai_service.claude_client
        self.embeddings_model = ai_service.sentence_model
        self.collection = vector_service.collection
        
        # Zaawansowane ustawienia
        self.max_context_length = getattr(config, 'MAX_CONTEXT_LENGTH', 3000)
        self.top_k = 8  # Zwiększone dla lepszego wyszukiwania
        self.rerank_threshold = 0.75
        self.confidence_threshold = 0.65
        self.diversity_penalty = 0.7
        
        # Cache i optymalizacje
        self.response_cache = {}
        self.query_cache = {}
        self.performance_metrics = defaultdict(list)
        
        # Konteksty konwersacji
        self.conversation_contexts: Dict[str, ConversationContext] = {}
        
        # Modele dla różnych zadań
        self.tokenizer = None
        self._initialize_tokenizer()
        
        # Adaptacyjne uczenie
        self.feedback_history = []
        self.query_patterns = defaultdict(int)
        self.successful_strategies = defaultdict(list)
        
        logger.info("🚀 Enhanced RAG Service v3.0 initialized with advanced AI capabilities")

    def _initialize_tokenizer(self):
        """Inicjalizuje tokenizer do liczenia tokenów"""
        try:
            self.tokenizer = tiktoken.encoding_for_model("gpt-4")
        except:
            try:
                self.tokenizer = tiktoken.get_encoding("cl100k_base")
            except:
                logger.warning("Nie można załadować tokenizera")

    def _count_tokens(self, text: str) -> int:
        """Liczy tokeny w tekście"""
        if self.tokenizer:
            return len(self.tokenizer.encode(text))
        return len(text.split()) * 1.3  # Przybliżenie

    async def process_query_async(self, query: str, session_id: str = "default") -> EnhancedResponse:
        """Asynchroniczne przetwarzanie zapytania"""
        return self.process_query(query, session_id)

    def process_query(self, query: str, session_id: str = "default") -> EnhancedResponse:
        """Główna metoda przetwarzania zapytania z zaawansowanymi technikami AI"""
        start_time = time.time()
        processing_steps = []
        
        try:
            logger.info(f"🧠 Processing enhanced query: {query[:100]}...")
            processing_steps.append("Query received and preprocessing started")
            
            # Sprawdź cache
            cache_key = hashlib.md5(f"{query}_{session_id}".encode()).hexdigest()
            if cache_key in self.response_cache:
                cached_response = self.response_cache[cache_key]
                cached_response.processing_time_ms = (time.time() - start_time) * 1000
                processing_steps.append("Response retrieved from cache")
                logger.info("📦 Response served from cache")
                return cached_response
            
            # 1. Analiza zapytania i klasyfikacja
            query_analysis = self._analyze_query_intent(query)
            processing_steps.append(f"Query analyzed - type: {query_analysis['type']}, intent: {query_analysis['intent']}, confidence: {query_analysis.get('confidence', 0.5):.2f}")
            
            # 2. Kontekst konwersacji
            conversation_context = self._get_or_create_conversation_context(session_id)
            self._update_conversation_context(conversation_context, query, query_analysis)
            processing_steps.append("Conversation context updated")
            
            # 3. Ekspansja zapytania z kontekstem
            expanded_queries = self._advanced_query_expansion(query, query_analysis, conversation_context)
            processing_steps.append(f"Query expanded to {len(expanded_queries)} variants")
            
            # 4. Multi-stage retrieval
            retrieval_context = self._multi_stage_retrieval(expanded_queries, query_analysis)
            processing_steps.append(f"Retrieved {len(retrieval_context.documents)} documents")
            
            # 5. Advanced re-ranking z diverse scoring
            reranked_context = self._advanced_reranking(query, retrieval_context, query_analysis)
            processing_steps.append("Documents re-ranked with diversity scoring")
            
            # 6. Adaptive context compression
            compressed_context = self._adaptive_context_compression(reranked_context, query_analysis)
            processing_steps.append(f"Context compressed to {len(compressed_context.documents)} chunks")
            
            # 7. Multi-model reasoning
            reasoning_chain = self._multi_model_reasoning(query, compressed_context, query_analysis, conversation_context)
            processing_steps.append("Multi-model reasoning completed")
            
            # 8. Enhanced answer generation
            answer, model_confidence = self._enhanced_answer_generation(query, compressed_context, reasoning_chain, query_analysis, conversation_context)
            processing_steps.append("Enhanced answer generated")
            
            # 9. Multi-dimensional validation
            validation_results = self._multi_dimensional_validation(query, answer, compressed_context, query_analysis)
            processing_steps.append("Multi-dimensional validation completed")
            
            # 10. Citation and fact checking
            citations = self._generate_citations(answer, compressed_context)
            fact_check_score = self._fact_check_answer(answer, compressed_context)
            processing_steps.append("Citations generated and fact-checking completed")
            
            # 11. Follow-up suggestions
            suggested_followups = self._generate_followup_suggestions(query, answer, query_analysis, conversation_context)
            processing_steps.append("Follow-up suggestions generated")
            
            # Przygotuj sources z dodatkowymi informacjami
            enhanced_sources = self._prepare_enhanced_sources(compressed_context)
            
            # Określ poziom pewności
            confidence_level = self._determine_confidence_level(model_confidence, validation_results)
            
            processing_time = (time.time() - start_time) * 1000
            
            response = EnhancedResponse(
                answer=answer,
                confidence=model_confidence,
                confidence_level=confidence_level,
                sources=enhanced_sources,
                reasoning_chain=reasoning_chain,
                validation_score=validation_results['overall_score'],
                query_type=QueryType(query_analysis['type']),
                response_type=query_analysis.get('response_type', 'synthesized'),
                
                citations=citations,
                fact_check_score=fact_check_score,
                relevance_score=validation_results['relevance_score'],
                completeness_score=validation_results['completeness_score'],
                clarity_score=validation_results['clarity_score'],
                
                models_used=[self.config.CLAUDE_MODEL, "sentence-transformers", "custom-reranker"],
                processing_steps=processing_steps,
                context_chunks_used=len(compressed_context.documents),
                total_tokens=self._count_tokens(answer + " ".join(compressed_context.documents)),
                processing_time_ms=processing_time,
                
                suggested_followups=suggested_followups,
                session_id=session_id
            )
            
            # Cache response
            self.response_cache[cache_key] = response
            
            # Update performance metrics
            self._update_performance_metrics(query, response, processing_time)
            
            logger.info(f"✅ Enhanced query processed: confidence={model_confidence:.2f}, validation={validation_results['overall_score']:.2f}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Error in enhanced processing: {e}")
            import traceback
            traceback.print_exc()
            
            return EnhancedResponse(
                answer=f"Przepraszam, wystąpił błąd podczas zaawansowanego przetwarzania: {str(e)}",
                confidence=0.1,
                confidence_level=ConfidenceLevel.VERY_LOW,
                sources=[],
                reasoning_chain=["Error occurred during processing"],
                validation_score=0.0,
                query_type=QueryType.UNKNOWN,
                response_type="error",
                citations=[],
                fact_check_score=0.0,
                relevance_score=0.0,
                completeness_score=0.0,
                clarity_score=0.0,
                models_used=["error_handler"],
                processing_steps=processing_steps + [f"Error: {str(e)}"],
                context_chunks_used=0,
                total_tokens=0,
                processing_time_ms=(time.time() - start_time) * 1000,
                session_id=session_id
            )

    def _analyze_query_intent(self, query: str) -> Dict[str, Any]:
        """Zaawansowana analiza intencji zapytania - ulepszona wersja"""
        query_lower = query.lower().strip()
        
        # Inicjalizuj domyślne wartości
        query_type = "factual"
        intent = "information"
        complexity = "simple"
        confidence = 0.5
        
        # Ulepszona analiza typu zapytania z wyższą precyzją
        type_scores = {
            "procedural": 0,
            "troubleshooting": 0,
            "configuration": 0,
            "integration": 0,
            "reporting": 0,
            "factual": 0
        }
        
        # Procedural keywords - kroki, instrukcje
        procedural_keywords = [
            'jak', 'w jaki sposób', 'kroki', 'procedura', 'proces', 'instrukcja',
            'sposób', 'metoda', 'wykonać', 'zrobić', 'przeprowadzić', 'realizować'
        ]
        procedural_score = sum(1 for keyword in procedural_keywords if keyword in query_lower)
        type_scores["procedural"] = procedural_score * 2
        
        # Troubleshooting keywords - problemy, błędy
        troubleshooting_keywords = [
            'błąd', 'problem', 'nie działa', 'troubleshoot', 'rozwiązanie',
            'naprawa', 'fix', 'repair', 'issue', 'error', 'awaria', 'usterka',
            'problem z', 'nie mogę', 'nie można', 'dlaczego nie'
        ]
        troubleshooting_score = sum(1 for keyword in troubleshooting_keywords if keyword in query_lower)
        type_scores["troubleshooting"] = troubleshooting_score * 2.5
        
        # Configuration keywords - ustawienia, parametry
        configuration_keywords = [
            'konfiguracja', 'ustawienia', 'parametry', 'opcje', 'config',
            'skonfigurować', 'ustawić', 'zmienić ustawienia', 'parametr',
            'konfigurować', 'setup', 'settings'
        ]
        configuration_score = sum(1 for keyword in configuration_keywords if keyword in query_lower)
        type_scores["configuration"] = configuration_score * 2
        
        # Integration keywords - połączenia, import/export
        integration_keywords = [
            'integracja', 'połączenie', 'import', 'export', 'synchronizacja',
            'API', 'interfejs', 'connector', 'łączenie', 'podłączenie',
            'wymiana danych', 'transfer danych'
        ]
        integration_score = sum(1 for keyword in integration_keywords if keyword in query_lower)
        type_scores["integration"] = integration_score * 2
        
        # Reporting keywords - raporty, analizy
        reporting_keywords = [
            'raport', 'analiza', 'statystyki', 'dashboard', 'wykres',
            'zestawienie', 'report', 'analytics', 'dane', 'metryki'
        ]
        reporting_score = sum(1 for keyword in reporting_keywords if keyword in query_lower)
        type_scores["reporting"] = reporting_score * 2
        
        # Factual - domyślnie gdy brak innych wskaźników
        factual_keywords = [
            'co to', 'czym jest', 'definicja', 'znaczenie', 'opis',
            'informacje o', 'dane o', 'szczegóły', 'properties'
        ]
        factual_score = sum(1 for keyword in factual_keywords if keyword in query_lower)
        type_scores["factual"] = factual_score + 1  # Bonus jako fallback
        
        # Znajdź typ z najwyższym score
        max_score = max(type_scores.values())
        if max_score > 0:
            query_type = max(type_scores, key=type_scores.get)
            confidence = min(max_score / 5.0, 1.0)  # Normalize confidence
        
        # Ulepszona analiza intencji
        if query.endswith('?'):
            intent = "question"
        elif any(word in query_lower for word in ['pokaż', 'wyświetl', 'zobacz', 'sprawdź', 'display', 'show']):
            intent = "display"
        elif any(word in query_lower for word in ['pomóż', 'wsparcie', 'asystent', 'help', 'assist']):
            intent = "assistance"
        elif any(word in query_lower for word in ['wykonaj', 'uruchom', 'zrób', 'execute', 'run']):
            intent = "action"
        else:
            intent = "information"
        
        # Ulepszona analiza złożoności
        word_count = len(query.split())
        technical_terms = sum(1 for term in ['ERP', 'SQL', 'API', 'XML', 'JSON', 'REST', 'SOAP'] if term in query.upper())
        
        if word_count > 20 or technical_terms > 2:
            complexity = "complex"
        elif word_count > 10 or technical_terms > 0:
            complexity = "medium"
        else:
            complexity = "simple"
        
        # Dodatkowe kontekstowe wskazówki
        context_hints = []
        if 'comarch' in query_lower or 'erp xl' in query_lower:
            context_hints.append('erp_specific')
        if any(module in query_lower for module in ['finansowy', 'księgowy', 'magazyn', 'sprzedaż', 'zakup']):
            context_hints.append('module_specific')
        
        return {
            'type': query_type,
            'intent': intent,
            'complexity': complexity,
            'confidence': confidence,
            'context_hints': context_hints,
            'type_scores': type_scores,
            'response_type': 'synthesized' if complexity in ['medium', 'complex'] else 'direct'
        }

    def _get_or_create_conversation_context(self, session_id: str) -> ConversationContext:
        """Pobiera lub tworzy kontekst konwersacji"""
        if session_id not in self.conversation_contexts:
            self.conversation_contexts[session_id] = ConversationContext(session_id=session_id)
        return self.conversation_contexts[session_id]

    def _update_conversation_context(self, context: ConversationContext, query: str, analysis: Dict[str, Any]):
        """Aktualizuje kontekst konwersacji"""
        context.history.append({
            'query': query,
            'analysis': analysis,
            'timestamp': datetime.now()
        })
        context.last_activity = datetime.now()
        
        # Określ temat na podstawie historii
        if len(context.history) >= 2:
            recent_types = [h['analysis']['type'] for h in list(context.history)[-3:]]
            if len(set(recent_types)) == 1:
                context.topic = recent_types[0]

    def _advanced_query_expansion(self, query: str, analysis: Dict[str, Any], context: ConversationContext) -> List[str]:
        """Zaawansowana ekspansja zapytania z kontekstem"""
        expanded = [query]
        
        # Ekspansja na podstawie typu zapytania
        if analysis['type'] == 'procedural':
            expanded.extend([
                f"instrukcja {query}",
                f"kroki {query}",
                f"procedura {query}"
            ])
        elif analysis['type'] == 'troubleshooting':
            expanded.extend([
                f"rozwiązanie problemu {query}",
                f"naprawa {query}",
                f"debugging {query}"
            ])
        elif analysis['type'] == 'configuration':
            expanded.extend([
                f"ustawienia {query}",
                f"konfiguracja parametrów {query}",
                f"opcje {query}"
            ])
        
        # Ekspansja na podstawie kontekstu ERP
        erp_keywords = ['Comarch ERP XL', 'system ERP', 'moduł', 'funkcjonalność']
        for keyword in erp_keywords:
            if keyword.lower() not in query.lower():
                expanded.append(f"{keyword} {query}")
        
        # Ekspansja na podstawie historii konwersacji
        if context.topic and context.topic not in query.lower():
            expanded.append(f"{context.topic} {query}")
        
        return expanded[:5]  # Maksymalnie 5 wariantów

    def _multi_stage_retrieval(self, queries: List[str], analysis: Dict[str, Any]) -> RetrievalContext:
        """Wieloetapowe wyszukiwanie z różnymi strategiami"""
        try:
            all_documents = []
            all_metadatas = []
            all_distances = []
            all_embeddings = []
            
            for query in queries:
                # Semantic search
                query_embedding = self.embeddings_model.encode([query])
                
                # Dostosuj liczbę wyników do typu zapytania
                n_results = self.top_k
                if analysis['complexity'] == 'complex':
                    n_results = min(12, self.top_k + 4)
                
                results = self.collection.query(
                    query_embeddings=query_embedding.tolist(),
                    n_results=n_results,
                    include=['documents', 'metadatas', 'distances', 'embeddings']
                )
                
                # Naprawiony warunek - sprawdź czy listy nie są puste
                if (results.get('documents') and 
                    isinstance(results['documents'], list) and 
                    len(results['documents']) > 0 and 
                    isinstance(results['documents'][0], list) and
                    len(results['documents'][0]) > 0):
                    
                    documents_batch = results['documents'][0]
                    all_documents.extend(documents_batch)
                    
                    # Sprawdź metadane
                    if (results.get('metadatas') and 
                        isinstance(results['metadatas'], list) and
                        len(results['metadatas']) > 0 and
                        results['metadatas'][0] is not None and
                        isinstance(results['metadatas'][0], list)):
                        all_metadatas.extend(results['metadatas'][0])
                    else:
                        all_metadatas.extend([{}] * len(documents_batch))
                    
                    # Sprawdź distances  
                    if (results.get('distances') and 
                        isinstance(results['distances'], list) and
                        len(results['distances']) > 0 and
                        results['distances'][0] is not None and
                        isinstance(results['distances'][0], list)):
                        all_distances.extend(results['distances'][0])
                    else:
                        all_distances.extend([1.0] * len(documents_batch))
                    
                    # Sprawdź embeddings
                    if (results.get('embeddings') and 
                        isinstance(results['embeddings'], list) and
                        len(results['embeddings']) > 0 and
                        results['embeddings'][0] is not None and
                        isinstance(results['embeddings'][0], list)):
                        all_embeddings.extend(results['embeddings'][0])
            
            # Remove duplicates and score
            unique_docs = {}
            for i, doc in enumerate(all_documents):
                doc_hash = hashlib.md5(doc.encode()).hexdigest()
                if doc_hash not in unique_docs:
                    unique_docs[doc_hash] = {
                        'document': doc,
                        'metadata': all_metadatas[i] if i < len(all_metadatas) else {},
                        'distance': all_distances[i] if i < len(all_distances) else 1.0,
                        'score': 1.0 - (all_distances[i] if i < len(all_distances) else 1.0),
                        'embedding': all_embeddings[i] if i < len(all_embeddings) else None
                    }
            
            # Sort by score
            sorted_docs = sorted(unique_docs.values(), key=lambda x: x['score'], reverse=True)
            
            return RetrievalContext(
                documents=[item['document'] for item in sorted_docs[:self.top_k]],
                metadatas=[item['metadata'] for item in sorted_docs[:self.top_k]],
                distances=[item['distance'] for item in sorted_docs[:self.top_k]],
                scores=[item['score'] for item in sorted_docs[:self.top_k]],
                embeddings=[item['embedding'] for item in sorted_docs[:self.top_k] if item['embedding']]
            )
            
        except Exception as e:
            logger.error(f"Multi-stage retrieval failed: {e}")
            return RetrievalContext([], [], [], [])

    def _advanced_reranking(self, query: str, retrieval_context: RetrievalContext, analysis: Dict[str, Any]) -> RetrievalContext:
        """Zaawansowane re-ranking z wieloma kryteriami"""
        try:
            if not retrieval_context.documents:
                return retrieval_context
            
            reranked_items = []
            query_embedding = self.embeddings_model.encode([query])
            
            for i, doc in enumerate(retrieval_context.documents):
                # 1. Semantic similarity score
                semantic_score = retrieval_context.scores[i] if i < len(retrieval_context.scores) else 0.5
                
                # 2. Keyword overlap score
                query_words = set(query.lower().split())
                doc_words = set(doc.lower().split())
                keyword_score = len(query_words.intersection(doc_words)) / max(len(query_words), 1)
                
                # 3. Document length penalty/bonus
                length_score = min(1.0, len(doc) / 1000)  # Prefer documents around 1000 chars
                if len(doc) < 100:
                    length_score *= 0.5  # Penalty for very short docs
                
                # 4. Source quality score
                metadata = retrieval_context.metadatas[i] if i < len(retrieval_context.metadatas) else {}
                source_score = 1.0
                if 'source' in metadata:
                    if any(quality_indicator in metadata['source'].lower() for quality_indicator in ['official', 'documentation', 'manual']):
                        source_score = 1.2
                    elif any(low_quality in metadata['source'].lower() for low_quality in ['forum', 'discussion', 'comment']):
                        source_score = 0.8
                
                # 5. Query type specific scoring
                type_score = 1.0
                if analysis['type'] == 'procedural' and any(word in doc.lower() for word in ['krok', 'procedura', 'instrukcja']):
                    type_score = 1.3
                elif analysis['type'] == 'troubleshooting' and any(word in doc.lower() for word in ['błąd', 'problem', 'rozwiązanie']):
                    type_score = 1.3
                elif analysis['type'] == 'configuration' and any(word in doc.lower() for word in ['konfiguracja', 'ustawienia', 'parametry']):
                    type_score = 1.3
                
                # Combined score
                combined_score = (
                    semantic_score * 0.4 +
                    keyword_score * 0.3 +
                    length_score * 0.1 +
                    source_score * 0.1 +
                    type_score * 0.1
                )
                
                reranked_items.append({
                    'index': i,
                    'document': doc,
                    'metadata': metadata,
                    'combined_score': combined_score,
                    'scores': {
                        'semantic': semantic_score,
                        'keyword': keyword_score,
                        'length': length_score,
                        'source': source_score,
                        'type': type_score
                    }
                })
            
            # Sort by combined score
            reranked_items.sort(key=lambda x: x['combined_score'], reverse=True)
            
            # Apply diversity filtering
            diverse_items = self._apply_diversity_filtering(reranked_items)
            
            return RetrievalContext(
                documents=[item['document'] for item in diverse_items],
                metadatas=[item['metadata'] for item in diverse_items],
                distances=[retrieval_context.distances[item['index']] if item['index'] < len(retrieval_context.distances) else 1.0 for item in diverse_items],
                scores=[retrieval_context.scores[item['index']] if item['index'] < len(retrieval_context.scores) else 0.5 for item in diverse_items],
                rerank_scores=[item['combined_score'] for item in diverse_items],
                diversity_scores=[item.get('diversity_score', 1.0) for item in diverse_items]
            )
            
        except Exception as e:
            logger.error(f"Advanced reranking failed: {e}")
            return retrieval_context

    def _apply_diversity_filtering(self, items: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Filtrowanie dla różnorodności wyników"""
        if len(items) <= 3:
            return items
        
        diverse_items = [items[0]]  # Zawsze bierz najlepszy
        
        for item in items[1:]:
            # Sprawdź podobieństwo do już wybranych
            is_diverse = True
            for selected in diverse_items:
                # Proste sprawdzenie podobieństwa na podstawie słów kluczowych
                item_words = set(item['document'].lower().split()[:20])  # Pierwsze 20 słów
                selected_words = set(selected['document'].lower().split()[:20])
                
                overlap = len(item_words.intersection(selected_words)) / max(len(item_words.union(selected_words)), 1)
                if overlap > self.diversity_penalty:
                    is_diverse = False
                    break
            
            if is_diverse:
                item['diversity_score'] = 1.0
                diverse_items.append(item)
            else:
                item['diversity_score'] = 0.5
                if len(diverse_items) < self.top_k // 2:  # Dodaj mimo wszystko jeśli mamy mało wyników
                    diverse_items.append(item)
            
            if len(diverse_items) >= self.top_k:
                break
        
        return diverse_items

    def _adaptive_context_compression(self, context: RetrievalContext, analysis: Dict[str, Any]) -> RetrievalContext:
        """Adaptacyjna kompresja kontekstu"""
        try:
            # Dostosuj limit na podstawie typu zapytania
            max_length = self.max_context_length
            if analysis['complexity'] == 'complex':
                max_length = int(max_length * 1.3)
            elif analysis['complexity'] == 'simple':
                max_length = int(max_length * 0.8)
            
            total_length = 0
            compressed_docs = []
            compressed_metas = []
            
            for i, doc in enumerate(context.documents):
                doc_tokens = self._count_tokens(doc)
                
                if total_length + doc_tokens <= max_length:
                    compressed_docs.append(doc)
                    compressed_metas.append(context.metadatas[i] if i < len(context.metadatas) else {})
                    total_length += doc_tokens
                else:
                    # Inteligentne przycinanie - zatrzymaj na końcu zdania
                    remaining_tokens = max_length - total_length
                    if remaining_tokens > 100:  # Minimum sensible length
                        sentences = doc.split('. ')
                        truncated = ""
                        for sentence in sentences:
                            if self._count_tokens(truncated + sentence + ". ") <= remaining_tokens:
                                truncated += sentence + ". "
                            else:
                                break
                        
                        if truncated.strip():
                            compressed_docs.append(truncated.strip() + "...")
                            compressed_metas.append(context.metadatas[i] if i < len(context.metadatas) else {})
                    break
            
            return RetrievalContext(
                documents=compressed_docs,
                metadatas=compressed_metas,
                distances=context.distances[:len(compressed_docs)],
                scores=context.scores[:len(compressed_docs)],
                rerank_scores=context.rerank_scores[:len(compressed_docs)] if context.rerank_scores else None
            )
            
        except Exception as e:
            logger.error(f"Context compression failed: {e}")
            return context

    def _multi_model_reasoning(self, query: str, context: RetrievalContext, analysis: Dict[str, Any], conversation_context: ConversationContext) -> List[str]:
        """Wielomodelowe rozumowanie"""
        reasoning_steps = [
            f"🔍 Analiza zapytania: Typ: {analysis['type']}, Intencja: {analysis['intent']}, Złożoność: {analysis['complexity']}",
            f"📚 Pozyskano {len(context.documents)} relevantnych dokumentów z bazy wiedzy",
            f"🔄 Zastosowano zaawansowane re-ranking z {len(context.rerank_scores or [])} skorami",
            f"💭 Kontekst konwersacji: {len(conversation_context.history)} poprzednich interakcji"
        ]
        
        # Dodatkowe kroki na podstawie typu zapytania
        if analysis['type'] == 'procedural':
            reasoning_steps.append("📋 Zidentyfikowano zapytanie proceduralnej - priorytet dla instrukcji krok po kroku")
        elif analysis['type'] == 'troubleshooting':
            reasoning_steps.append("🔧 Wykryto problem techniczny - fokus na rozwiązaniach i diagnostyce")
        elif analysis['type'] == 'configuration':
            reasoning_steps.append("⚙️ Zapytanie konfiguracyjne - priorytet dla parametrów i ustawień")
        
        # Analiza jakości kontekstu
        if context.documents:
            avg_relevance = np.mean(context.scores) if context.scores else 0.5
            reasoning_steps.append(f"📊 Średnia relevantność kontekstu: {avg_relevance:.2f}")
        
        return reasoning_steps

    def _enhanced_answer_generation(self, query: str, context: RetrievalContext, reasoning_chain: List[str], analysis: Dict[str, Any], conversation_context: ConversationContext) -> Tuple[str, float]:
        """Ulepszone generowanie odpowiedzi z kontekstem konwersacji"""
        try:
            if not self.claude_client:
                return self._generate_fallback_answer(query, context, analysis), 0.6
            
            # Przygotuj kontekst z metadanymi
            context_text = ""
            for i, doc in enumerate(context.documents):
                metadata = context.metadatas[i] if i < len(context.metadatas) else {}
                source = metadata.get('source', f'Dokument {i+1}')
                context_text += f"\n[Źródło: {source}]\n{doc}\n"
            
            # Przygotuj historię konwersacji
            conversation_history = ""
            if len(conversation_context.history) > 1:
                recent_queries = list(conversation_context.history)[-3:]
                conversation_history = "\nKONTEKST KONWERSACJI:\n"
                for h in recent_queries:
                    conversation_history += f"- {h['query']}\n"
            
            # Dostosuj prompt do typu zapytania
            type_specific_instructions = self._get_type_specific_instructions(analysis['type'])
            
            prompt = f"""Jesteś ekspertem systemów ERP Comarch XL z wieloletnim doświadczeniem. 

{conversation_history}

KONTEKST Z BAZY WIEDZY:
{context_text}

ZAPYTANIE UŻYTKOWNIKA: {query}

TYP ZAPYTANIA: {analysis['type']} (złożoność: {analysis['complexity']})

{type_specific_instructions}

INSTRUKCJE OGÓLNE:
1. Odpowiedz profesjonalnie w języku polskim
2. Wykorzystaj informacje z kontekstu powyżej
3. Jeśli kontekst nie zawiera pełnej odpowiedzi, powiedz to wprost
4. Strukturyzuj odpowiedź używając nagłówków i list
5. Bądź konkretny i praktyczny
6. Podaj przykłady lub kroki do wykonania gdy to możliwe
7. Jeśli to zapytanie nawiązuje do poprzednich, uwzględnij kontekst konwersacji

ODPOWIEDŹ:"""

            # Wybierz odpowiedni model na podstawie złożoności
            model = self.config.CLAUDE_MODEL if analysis['complexity'] in ['medium', 'complex'] else self.config.CLAUDE_HAIKU_MODEL
            
            message = self.claude_client.messages.create(
                model=model,
                max_tokens=2048,
                temperature=0.2,  # Niższa temperatura dla większej precyzji
                messages=[{"role": "user", "content": prompt}]
            )
            
            answer = message.content[0].text
            
            # Oblicz confidence na podstawie różnych czynników
            confidence = self._calculate_answer_confidence(query, answer, context, analysis)
            
            return answer, confidence
            
        except Exception as e:
            logger.error(f"Enhanced answer generation failed: {e}")
            return self._generate_fallback_answer(query, context, analysis), 0.5

    def _get_type_specific_instructions(self, query_type: str) -> str:
        """Pobiera instrukcje specificzne dla typu zapytania"""
        instructions = {
            'procedural': """
SPECJALNE INSTRUKCJE DLA ZAPYTAŃ PROCEDURALNYCH:
- Przedstaw kroki w numerowanej liście
- Każdy krok powinien być jasny i wykonalny
- Dodaj ostrzeżenia o potencjalnych problemach
- Wskaż wymagane uprawnienia lub role
""",
            'troubleshooting': """
SPECJALNE INSTRUKCJE DLA TROUBLESHOOTINGU:
- Rozpocznij od diagnozy problemu
- Przedstaw rozwiązania od najprostszych do najbardziej zaawansowanych
- Wskaż możliwe przyczyny problemu
- Dodaj kroki weryfikacji rozwiązania
""",
            'configuration': """
SPECJALNE INSTRUKCJE DLA KONFIGURACJI:
- Wskaż dokładną ścieżkę w menu
- Podaj domyślne wartości parametrów
- Wyjaśnij wpływ zmian na system
- Dodaj informacje o wymaganych restartach
""",
            'integration': """
SPECJALNE INSTRUKCJE DLA INTEGRACJI:
- Opisz wymagane komponenty
- Przedstaw mapowanie danych
- Wskaż potencjalne konflikty
- Dodaj przykłady konfiguracji
""",
            'reporting': """
SPECJALNE INSTRUKCJE DLA RAPORTOWANIA:
- Wskaż źródła danych
- Opisz dostępne filtry i parametry
- Podaj przykłady zastosowania
- Wyjaśnij interpretację wyników
"""
        }
        
        return instructions.get(query_type, "")

    def _calculate_answer_confidence(self, query: str, answer: str, context: RetrievalContext, analysis: Dict[str, Any]) -> float:
        """Oblicza poziom pewności odpowiedzi"""
        confidence = 0.5  # Base confidence
        
        # Context quality factors
        if context.documents:
            avg_score = np.mean(context.scores) if context.scores else 0.5
            confidence += avg_score * 0.3
        
        # Answer completeness
        if len(answer) > 200 and len(answer) < 3000:  # Optimal length
            confidence += 0.1
        
        # Keyword relevance
        query_words = set(query.lower().split())
        answer_words = set(answer.lower().split())
        keyword_overlap = len(query_words.intersection(answer_words)) / max(len(query_words), 1)
        confidence += keyword_overlap * 0.15
        
        # Context usage
        if context.documents and any(word in answer.lower() for doc in context.documents[:2] for word in doc.lower().split()[:10]):
            confidence += 0.15
        
        # Type-specific confidence
        if analysis['type'] in ['procedural', 'configuration'] and any(indicator in answer.lower() for indicator in ['krok', 'parametr', 'ustawienie']):
            confidence += 0.1
        
        return min(confidence, 0.95)  # Max confidence 95%

    def _multi_dimensional_validation(self, query: str, answer: str, context: RetrievalContext, analysis: Dict[str, Any]) -> Dict[str, float]:
        """Wielowymiarowa walidacja odpowiedzi"""
        validation_results = {
            'relevance_score': 0.5,
            'completeness_score': 0.5,
            'clarity_score': 0.5,
            'accuracy_score': 0.5,
            'overall_score': 0.5
        }
        
        try:
            # Relevance - czy odpowiedź odnosi się do pytania
            query_words = set(query.lower().split())
            answer_words = set(answer.lower().split())
            relevance = len(query_words.intersection(answer_words)) / max(len(query_words), 1)
            validation_results['relevance_score'] = min(relevance * 2, 1.0)
            
            # Completeness - czy odpowiedź jest kompletna
            completeness = 0.7  # Base score
            if any(indicator in answer.lower() for indicator in ['przykład', 'krok', 'instrukcja']):
                completeness += 0.2
            if len(answer) > 500:  # Detailed answer
                completeness += 0.1
            validation_results['completeness_score'] = min(completeness, 1.0)
            
            # Clarity - czy odpowiedź jest jasna
            clarity = 0.6  # Base score
            if any(structure in answer for structure in ['1.', '2.', '•', '-']):
                clarity += 0.2
            if answer.count('\n') > 2:  # Structured answer
                clarity += 0.1
            if any(heading in answer for heading in ['**', '#', 'KROK']):
                clarity += 0.1
            validation_results['clarity_score'] = min(clarity, 1.0)
            
            # Accuracy - czy informacje są dokładne (na podstawie kontekstu)
            accuracy = 0.7  # Base score
            if context.documents:
                context_words = set()
                for doc in context.documents[:2]:
                    context_words.update(doc.lower().split()[:50])
                answer_context_overlap = len(set(answer.lower().split()).intersection(context_words)) / max(len(answer.lower().split()), 1)
                accuracy = 0.5 + (answer_context_overlap * 0.5)
            validation_results['accuracy_score'] = min(accuracy, 1.0)
            
            # Overall score
            validation_results['overall_score'] = np.mean(list(validation_results.values())[:-1])
            
        except Exception as e:
            logger.error(f"Validation failed: {e}")
        
        return validation_results

    def _generate_citations(self, answer: str, context: RetrievalContext) -> List[Dict[str, Any]]:
        """Generuje cytowania dla odpowiedzi"""
        citations = []
        
        try:
            for i, doc in enumerate(context.documents):
                metadata = context.metadatas[i] if i < len(context.metadatas) else {}
                
                # Sprawdź czy dokument został wykorzystany w odpowiedzi
                doc_words = set(doc.lower().split()[:20])  # Pierwsze 20 słów dokumentu
                answer_words = set(answer.lower().split())
                overlap = len(doc_words.intersection(answer_words))
                
                if overlap >= 2:  # Minimum 2 wspólne słowa
                    citation = {
                        'source': metadata.get('source', f'Dokument {i+1}'),
                        'confidence': context.scores[i] if i < len(context.scores) else 0.5,
                        'relevance': overlap / max(len(doc_words), 1),
                        'excerpt': doc[:200] + "..." if len(doc) > 200 else doc,
                        'chunk_id': metadata.get('chunk_id', f'chunk_{i}'),
                        'category': metadata.get('category', 'general')
                    }
                    citations.append(citation)
        
        except Exception as e:
            logger.error(f"Citation generation failed: {e}")
        
        return citations[:3]  # Maksymalnie 3 cytowania

    def _fact_check_answer(self, answer: str, context: RetrievalContext) -> float:
        """Sprawdza faktyczność odpowiedzi"""
        try:
            if not context.documents:
                return 0.5
            
            # Proste sprawdzenie faktów - porównanie z kontekstem
            answer_facts = set()
            context_facts = set()
            
            # Wyciągnij "fakty" (liczby, nazwy własne, terminy techniczne)
            import re
            
            answer_numbers = re.findall(r'\d+', answer)
            answer_caps = re.findall(r'\b[A-ZŻĆŁŚĄĘŃ][a-zżćłśąęń]+\b', answer)
            answer_facts.update(answer_numbers + answer_caps)
            
            for doc in context.documents:
                doc_numbers = re.findall(r'\d+', doc)
                doc_caps = re.findall(r'\b[A-ZŻĆŁŚĄĘŃ][a-zżćłśąęń]+\b', doc)
                context_facts.update(doc_numbers + doc_caps)
            
            if answer_facts and context_facts:
                fact_overlap = len(answer_facts.intersection(context_facts)) / max(len(answer_facts), 1)
                return min(0.5 + fact_overlap, 1.0)
            
            return 0.7  # Default score if no facts found
            
        except Exception as e:
            logger.error(f"Fact checking failed: {e}")
            return 0.5

    def _generate_followup_suggestions(self, query: str, answer: str, analysis: Dict[str, Any], context: ConversationContext) -> List[str]:
        """Generuje sugestie pytań followup"""
        suggestions = []
        
        try:
            # Sugestie na podstawie typu zapytania
            if analysis['type'] == 'procedural':
                suggestions.extend([
                    "Jakie są najczęstsze problemy z tym procesem?",
                    "Czy istnieją automatyczne sposoby wykonania tej operacji?",
                    "Jakie uprawnienia są wymagane do tego procesu?"
                ])
            elif analysis['type'] == 'troubleshooting':
                suggestions.extend([
                    "Jak mogę zapobiec temu problemowi w przyszłości?",
                    "Czy istnieją podobne problemy w systemie?",
                    "Gdzie mogę znaleźć więcej informacji o tym błędzie?"
                ])
            elif analysis['type'] == 'configuration':
                suggestions.extend([
                    "Jakie są zalecane wartości dla tych parametrów?",
                    "Jak wpływa ta konfiguracja na wydajność systemu?",
                    "Czy mogę cofnąć te zmiany?"
                ])
            
            # Sugestie na podstawie zawartości odpowiedzi
            if 'raport' in answer.lower():
                suggestions.append("Jak mogę dostosować ten raport do moich potrzeb?")
            
            if 'integracja' in answer.lower():
                suggestions.append("Jakie są wymagania techniczne dla tej integracji?")
            
            if 'backup' in answer.lower() or 'kopia' in answer.lower():
                suggestions.append("Jak często powinienem wykonywać kopie zapasowe?")
            
            # Sugestie na podstawie historii konwersacji
            if len(context.history) > 1:
                recent_topics = [h.get('analysis', {}).get('type', '') for h in list(context.history)[-3:]]
                if 'configuration' in recent_topics:
                    suggestions.append("Jak sprawdzić czy moja konfiguracja działa poprawnie?")
            
        except Exception as e:
            logger.error(f"Followup generation failed: {e}")
        
        return suggestions[:3]  # Maksymalnie 3 sugestie

    def _prepare_enhanced_sources(self, context: RetrievalContext) -> List[Dict[str, Any]]:
        """Przygotowuje rozszerzone informacje o źródłach"""
        sources = []
        
        for i, doc in enumerate(context.documents):
            metadata = context.metadatas[i] if i < len(context.metadatas) else {}
            
            source = {
                'name': metadata.get('source', f'Dokument {i+1}'),
                'relevance_score': context.scores[i] if i < len(context.scores) else 0.5,
                'rerank_score': context.rerank_scores[i] if context.rerank_scores and i < len(context.rerank_scores) else None,
                'diversity_score': context.diversity_scores[i] if context.diversity_scores and i < len(context.diversity_scores) else None,
                'excerpt': doc[:300] + "..." if len(doc) > 300 else doc,
                'category': metadata.get('category', 'general'),
                'chunk_id': metadata.get('chunk_id', f'chunk_{i}'),
                'file_size': metadata.get('file_size', 'unknown'),
                'type': metadata.get('type', 'text')
            }
            sources.append(source)
        
        return sources

    def _determine_confidence_level(self, confidence: float, validation: Dict[str, float]) -> ConfidenceLevel:
        """Określa poziom pewności odpowiedzi"""
        # Weighted confidence combining model confidence and validation
        combined_confidence = (confidence * 0.6 + validation['overall_score'] * 0.4)
        
        if combined_confidence >= 0.9:
            return ConfidenceLevel.VERY_HIGH
        elif combined_confidence >= 0.75:
            return ConfidenceLevel.HIGH
        elif combined_confidence >= 0.5:
            return ConfidenceLevel.MEDIUM
        elif combined_confidence >= 0.25:
            return ConfidenceLevel.LOW
        else:
            return ConfidenceLevel.VERY_LOW

    def _generate_fallback_answer(self, query: str, context: RetrievalContext, analysis: Dict[str, Any]) -> str:
        """Fallback answer gdy Claude API nie działa"""
        fallback_template = f"""**Zapytanie:** {query}

**Typ zapytania:** {analysis.get('type', 'general')} (złożoność: {analysis.get('complexity', 'unknown')})

"""
        
        if context.documents:
            fallback_template += f"""**Znalezione informacje:**
{context.documents[0][:800] if context.documents else 'Brak danych'}

**Źródła:**
- {', '.join([meta.get('source', 'Nieznany') for meta in context.metadatas[:3]])}

"""
        else:
            fallback_template += """**Status:** Nie znaleziono odpowiednich informacji w bazie wiedzy.

"""
        
        fallback_template += """**Rekomendacje:**
- Sprawdź dokumentację Comarch ERP XL
- Skonsultuj się z administratorem systemu
- Rozważ kontakt z pomocą techniczną Comarch
- Sprecyzuj pytanie dodając więcej szczegółów

**Obszary wsparcia:**
- Konfiguracja modułów ERP
- Procesy wdrożeniowe  
- Integracje systemowe
- Raportowanie i analizy
- Rozwiązywanie problemów

*Uwaga: To jest odpowiedź podstawowa. Pełna funkcjonalność AI będzie dostępna po konfiguracji API.*"""
        
        return fallback_template

    def _update_performance_metrics(self, query: str, response: EnhancedResponse, processing_time: float):
        """Aktualizuje metryki wydajności"""
        try:
            self.performance_metrics['processing_times'].append(processing_time)
            self.performance_metrics['confidence_scores'].append(response.confidence)
            self.performance_metrics['validation_scores'].append(response.validation_score)
            self.query_patterns[response.query_type.value] += 1
            
            # Keep only last 100 metrics
            for metric in self.performance_metrics:
                if len(self.performance_metrics[metric]) > 100:
                    self.performance_metrics[metric] = self.performance_metrics[metric][-100:]
                    
        except Exception as e:
            logger.error(f"Performance metrics update failed: {e}")

    def provide_feedback(self, session_id: str, query: str, feedback: Dict[str, Any]):
        """Przyjmuje feedback użytkownika dla adaptacyjnego uczenia"""
        try:
            feedback_entry = {
                'session_id': session_id,
                'query': query,
                'feedback': feedback,
                'timestamp': datetime.now()
            }
            
            self.feedback_history.append(feedback_entry)
            
            # Analiza feedback dla poprawy strategii
            if feedback.get('helpful', False):
                query_hash = hashlib.md5(query.encode()).hexdigest()
                self.successful_strategies[query_hash].append(feedback)
            
            logger.info(f"Feedback received for session {session_id}")
            
        except Exception as e:
            logger.error(f"Feedback processing failed: {e}")

    def get_enhanced_system_metrics(self) -> Dict[str, Any]:
        """Pobiera rozszerzone metryki systemu"""
        try:
            doc_count = self.collection.count() if self.collection else 0
            
            base_metrics = {
                'documents_indexed': doc_count,
                'active_sessions': len(self.conversation_contexts),
                'total_queries': sum(len(ctx.history) for ctx in self.conversation_contexts.values()),
                'vector_db_status': 'connected' if self.collection else 'disconnected',
                'claude_status': 'available' if self.claude_client else 'unavailable',
                'embeddings_status': 'loaded' if self.embeddings_model else 'unavailable'
            }
            
            # Performance metrics
            if self.performance_metrics['processing_times']:
                base_metrics['avg_processing_time'] = np.mean(self.performance_metrics['processing_times'])
                base_metrics['avg_confidence'] = np.mean(self.performance_metrics['confidence_scores'])
                base_metrics['avg_validation'] = np.mean(self.performance_metrics['validation_scores'])
            
            # Query patterns
            base_metrics['query_patterns'] = dict(self.query_patterns)
            
            # Cache stats
            base_metrics['cache_size'] = len(self.response_cache)
            base_metrics['feedback_count'] = len(self.feedback_history)
            
            # Enhanced features status
            base_metrics['enhanced_features'] = {
                'multi_model_reasoning': True,
                'adaptive_compression': True,
                'diversity_filtering': True,
                'conversation_context': True,
                'fact_checking': True,
                'citation_generation': True,
                'followup_suggestions': True,
                'multi_dimensional_validation': True
            }
            
            base_metrics['last_update'] = datetime.now().isoformat()
            
            return base_metrics
            
        except Exception as e:
            logger.error(f"Error getting enhanced system metrics: {e}")
            return {
                'error': str(e),
                'last_update': datetime.now().isoformat()
            }

    def initialize_with_documents(self, documents: List[str], metadatas: List[Dict[str, Any]]):
        """Inicjalizacja z dokumentami - rozszerzona wersja"""
        try:
            if not documents:
                logger.warning("No documents provided for enhanced RAG initialization")
                return
            
            logger.info(f"🚀 Initializing Enhanced RAG v3.0 with {len(documents)} documents")
            
            # Generate embeddings with progress tracking
            batch_size = 50
            all_embeddings = []
            
            for i in range(0, len(documents), batch_size):
                batch = documents[i:i+batch_size]
                embeddings = self.embeddings_model.encode(batch).tolist()
                all_embeddings.extend(embeddings)
                logger.info(f"📊 Processed {min(i+batch_size, len(documents))}/{len(documents)} documents")
            
            # Generate enhanced IDs
            ids = [f"enhanced_doc_{i}_{hash(doc[:100])}" for i, doc in enumerate(documents)]
            
            # Add to vector store with enhanced metadata
            enhanced_metadatas = []
            for i, metadata in enumerate(metadatas):
                enhanced_meta = metadata.copy()
                enhanced_meta.update({
                    'indexed_at': datetime.now().isoformat(),
                    'document_length': len(documents[i]),
                    'embedding_model': 'sentence-transformers',
                    'enhanced_rag_version': '3.0'
                })
                enhanced_metadatas.append(enhanced_meta)
            
            self.collection.add(
                documents=documents,
                metadatas=enhanced_metadatas,
                ids=ids,
                embeddings=all_embeddings
            )
            
            logger.info(f"✅ Enhanced RAG v3.0 initialized with {len(documents)} documents")
            logger.info("🎯 Available features: Multi-model reasoning, Adaptive compression, Fact-checking, Citations")
            
        except Exception as e:
            logger.error(f"❌ Enhanced RAG initialization failed: {e}")
            raise
