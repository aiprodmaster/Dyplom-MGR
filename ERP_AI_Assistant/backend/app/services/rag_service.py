"""
Zaawansowany service RAG z ulepszonymi technikami generowania odpowiedzi
Autor: Ulepszenia RAG dla ERP AI Assistant
Funkcje: Hybrid Search, Re-ranking, Query Expansion, Context Compression, Multi-step Reasoning
"""

import os
import re
import json
import logging
import numpy as np
from typing import Dict, Any, Optional, List, Tuple
from dataclasses import dataclass, field
from datetime import datetime
from collections import defaultdict, Counter
import math

# NLP & ML
from sentence_transformers import SentenceTransformer, CrossEncoder
import anthropic
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Dodatkowe biblioteki dla NLP
try:
    import spacy
    SPACY_AVAILABLE = True
except ImportError:
    SPACY_AVAILABLE = False
    logging.warning("SpaCy nie jest dostępne - niektóre funkcje NLP będą ograniczone")

logger = logging.getLogger(__name__)

# ============================================================================
# MODELS & DATA STRUCTURES
# ============================================================================

@dataclass
class QueryAnalysis:
    """Analiza zapytania użytkownika"""
    original_query: str
    processed_query: str
    expanded_queries: List[str]
    intent: str
    confidence: float
    keywords: List[str]
    entities: List[Dict[str, str]]
    complexity_score: float
    requires_multi_step: bool

@dataclass
class SearchResult:
    """Wynik wyszukiwania z dodatkowymi metrykami"""
    content: str
    metadata: Dict[str, Any]
    semantic_score: float
    bm25_score: float
    combined_score: float
    rerank_score: Optional[float] = None
    source: str = ""
    chunk_id: str = ""
    relevance_explanation: str = ""

@dataclass
class ContextBundle:
    """Pakiet kontekstu z metadanymi"""
    primary_context: str
    supporting_context: str
    sources: List[str]
    confidence_scores: List[float]
    context_length: int
    compression_ratio: float

@dataclass
class AdvancedResponse:
    """Rozszerzona odpowiedź z metrykami jakości"""
    answer: str
    confidence: float
    sources: List[str]
    reasoning_steps: List[str]
    validation_score: float
    context_relevance: float
    answer_completeness: float
    factual_consistency: float
    timestamp: str = field(default_factory=lambda: datetime.now().isoformat())

# ============================================================================
# HYBRID SEARCH ENGINE
# ============================================================================

class HybridSearchEngine:
    """Silnik hybrydowego wyszukiwania (Semantic + BM25)"""
    
    def __init__(self, sentence_model: SentenceTransformer):
        self.sentence_model = sentence_model
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=10000,
            stop_words=None,  # Zachowujemy polskie słowa kluczowe
            ngram_range=(1, 2),
            min_df=2
        )
        self.document_embeddings = None
        self.documents = []
        self.tfidf_matrix = None
        self.is_fitted = False
        
        # Polskie stop words dla ERP
        self.erp_stop_words = {
            'system', 'moduł', 'funkcja', 'opcja', 'parametr', 'pole', 
            'wartość', 'dane', 'informacje', 'element', 'część'
        }
    
    def fit(self, documents: List[str], metadatas: List[Dict]):
        """Trenuje modele na korpusie dokumentów"""
        logger.info(f"🔄 Trenowanie modeli wyszukiwania na {len(documents)} dokumentach...")
        
        self.documents = documents
        self.metadatas = metadatas
        
        # Wygeneruj embeddingi semantyczne
        self.document_embeddings = self.sentence_model.encode(documents)
        
        # Wytrenuj TF-IDF
        processed_docs = [self._preprocess_for_bm25(doc) for doc in documents]
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(processed_docs)
        
        self.is_fitted = True
        logger.info("✅ Modele wyszukiwania wytrenowane")
    
    def _preprocess_for_bm25(self, text: str) -> str:
        """Przetwarzanie tekstu dla BM25"""
        # Podstawowe czyszczenie
        text = re.sub(r'[^\w\sąćęłńóśźżĄĆĘŁŃÓŚŹŻ]', ' ', text)
        text = re.sub(r'\s+', ' ', text)
        
        # Usuń ERP stop words ale zachowaj ważne terminy biznesowe
        words = text.lower().split()
        filtered_words = [w for w in words if w not in self.erp_stop_words or len(w) > 8]
        
        return ' '.join(filtered_words)
    
    def search(self, query: str, top_k: int = 10, alpha: float = 0.7) -> List[SearchResult]:
        """Hybrydowe wyszukiwanie (alpha * semantic + (1-alpha) * BM25)"""
        if not self.is_fitted:
            raise ValueError("Model nie został wytrenowany - wywołaj fit() najpierw")
        
        # Semantic search
        query_embedding = self.sentence_model.encode([query])
        semantic_scores = cosine_similarity(query_embedding, self.document_embeddings)[0]
        
        # BM25 search
        processed_query = self._preprocess_for_bm25(query)
        query_vector = self.tfidf_vectorizer.transform([processed_query])
        bm25_scores = cosine_similarity(query_vector, self.tfidf_matrix)[0]
        
        # Kombinuj wyniki
        combined_scores = alpha * semantic_scores + (1 - alpha) * bm25_scores
        
        # Sortuj i zwróć top-k
        top_indices = np.argsort(combined_scores)[::-1][:top_k]
        
        results = []
        for idx in top_indices:
            results.append(SearchResult(
                content=self.documents[idx],
                metadata=self.metadatas[idx],
                semantic_score=float(semantic_scores[idx]),
                bm25_score=float(bm25_scores[idx]),
                combined_score=float(combined_scores[idx]),
                source=self.metadatas[idx].get('source', 'unknown'),
                chunk_id=self.metadatas[idx].get('chunk_id', str(idx))
            ))
        
        return results

# ============================================================================
# QUERY PROCESSOR
# ============================================================================

class AdvancedQueryProcessor:
    """Zaawansowane przetwarzanie zapytań"""
    
    def __init__(self, claude_client: anthropic.Anthropic, sentence_model: SentenceTransformer):
        self.claude_client = claude_client
        self.sentence_model = sentence_model
        
        # NLP pipeline
        if SPACY_AVAILABLE:
            try:
                self.nlp = spacy.load("pl_core_news_sm")
            except OSError:
                self.nlp = None
                logger.warning("Model spaCy pl_core_news_sm nie jest dostępny")
        else:
            self.nlp = None
    
    def analyze_query(self, query: str) -> QueryAnalysis:
        """Kompleksowa analiza zapytania"""
        
        # Podstawowa analiza
        processed_query = self._preprocess_query(query)
        keywords = self._extract_keywords(query)
        entities = self._extract_entities(query)
        
        # Rozszerzenie zapytania
        expanded_queries = self._expand_query(query)
        
        # Klasyfikacja intencji przez Claude
        intent_info = self._classify_intent_advanced(query)
        
        # Ocena złożoności
        complexity_score = self._assess_complexity(query)
        requires_multi_step = complexity_score > 0.7
        
        return QueryAnalysis(
            original_query=query,
            processed_query=processed_query,
            expanded_queries=expanded_queries,
            intent=intent_info['intent'],
            confidence=intent_info['confidence'],
            keywords=keywords,
            entities=entities,
            complexity_score=complexity_score,
            requires_multi_step=requires_multi_step
        )
    
    def _preprocess_query(self, query: str) -> str:
        """Przetwarzanie zapytania"""
        # Normalizacja
        query = query.strip().lower()
        
        # Rozwinięcie skrótów ERP
        erp_expansions = {
            'crm': 'customer relationship management',
            'erp': 'enterprise resource planning',
            'api': 'application programming interface',
            'hr': 'human resources',
            'bi': 'business intelligence'
        }
        
        for abbrev, expansion in erp_expansions.items():
            query = re.sub(rf'\b{abbrev}\b', f"{abbrev} {expansion}", query)
        
        return query
    
    def _extract_keywords(self, query: str) -> List[str]:
        """Ekstrakcja kluczowych słów"""
        if self.nlp:
            doc = self.nlp(query)
            keywords = [token.lemma_.lower() for token in doc 
                       if not token.is_stop and not token.is_punct and len(token.text) > 2]
        else:
            # Fallback bez spaCy
            words = re.findall(r'\b\w{3,}\b', query.lower())
            keywords = [w for w in words if w not in {'jak', 'czy', 'gdzie', 'kiedy', 'dlaczego'}]
        
        return list(set(keywords))
    
    def _extract_entities(self, query: str) -> List[Dict[str, str]]:
        """Ekstrakcja nazwanych entności"""
        entities = []
        
        if self.nlp:
            doc = self.nlp(query)
            for ent in doc.ents:
                entities.append({
                    'text': ent.text,
                    'label': ent.label_,
                    'start': ent.start_char,
                    'end': ent.end_char
                })
        
        # Dodatkowe reguły dla terminów ERP
        erp_patterns = {
            r'\b(faktur[aey]|FV|faktury)\b': 'DOCUMENT',
            r'\b(kontrahent[a-z]*|klient[a-z]*|dostawc[a-z]*)\b': 'BUSINESS_ENTITY',
            r'\b(towar[a-z]*|produkt[a-z]*|usług[a-z]*)\b': 'PRODUCT',
            r'\b(magazyn[a-z]*|stan[a-z]*|zapas[a-z]*)\b': 'INVENTORY',
            r'\b(płatność|płatności|zapłat[a-z]*)\b': 'PAYMENT'
        }
        
        for pattern, entity_type in erp_patterns.items():
            matches = re.finditer(pattern, query, re.IGNORECASE)
            for match in matches:
                entities.append({
                    'text': match.group(),
                    'label': entity_type,
                    'start': match.start(),
                    'end': match.end()
                })
        
        return entities
    
    def _expand_query(self, query: str) -> List[str]:
        """Rozszerzenie zapytania o synonimy i terminy pokrewne"""
        expansions = [query]  # Oryginalne zapytanie
        
        # Synonimy dla terminów ERP
        synonyms = {
            'faktura': ['dokument sprzedaży', 'paragon', 'rachunek'],
            'klient': ['kontrahent', 'nabywca', 'odbiorca'],
            'towar': ['produkt', 'artykuł', 'rzecz'],
            'cena': ['koszt', 'wartość', 'kwota'],
            'magazyn': ['warehouse', 'skład', 'zapasy'],
            'sprzedaż': ['vendita', 'sales', 'handel'],
            'księgowość': ['accounting', 'rachunkowość', 'finanse']
        }
        
        query_lower = query.lower()
        for term, term_synonyms in synonyms.items():
            if term in query_lower:
                for synonym in term_synonyms:
                    expanded = query_lower.replace(term, synonym)
                    if expanded != query_lower:
                        expansions.append(expanded)
        
        # Ograniczenie do 3 najlepszych rozszerzeń
        return expansions[:3]
    
    def _classify_intent_advanced(self, query: str) -> Dict[str, Any]:
        """Zaawansowana klasyfikacja intencji"""
        try:
            system_prompt = """Jesteś ekspertem w systemach ERP. Przeanalizuj zapytanie i zwróć JSON z:
{
  "intent": "jedna z kategorii: konfiguracja|wdrożenie|funkcjonalności|problem|dokumenty|integracje|finanse|magazyn|crm|api|raportowanie",
  "confidence": 0.0-1.0,
  "sub_intent": "bardziej szczegółowa kategoria",
  "complexity": "simple|medium|complex",
  "action_type": "search|create|modify|delete|analyze|help"
}"""

            message = self.claude_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Przeanalizuj zapytanie: {query}"}]
            )
            
            response_text = message.content[0].text.strip()
            try:
                result = json.loads(response_text)
                return {
                    'intent': result.get('intent', 'funkcjonalności'),
                    'confidence': float(result.get('confidence', 0.7)),
                    'sub_intent': result.get('sub_intent', ''),
                    'complexity': result.get('complexity', 'medium'),
                    'action_type': result.get('action_type', 'search')
                }
            except json.JSONDecodeError:
                return self._fallback_classification(query)
                
        except Exception as e:
            logger.warning(f"Błąd klasyfikacji intencji: {e}")
            return self._fallback_classification(query)
    
    def _fallback_classification(self, query: str) -> Dict[str, Any]:
        """Fallback klasyfikacja na podstawie słów kluczowych"""
        query_lower = query.lower()
        
        intent_keywords = {
            'konfiguracja': ['konfigur', 'ustaw', 'paramter', 'opcj'],
            'wdrożenie': ['wdrożenie', 'implementacj', 'install'],
            'problem': ['błąd', 'error', 'problem', 'nie działa'],
            'api': ['api', 'integracj', 'endpoint', 'rest'],
            'finanse': ['finans', 'księgow', 'płatność', 'faktur'],
            'magazyn': ['magazyn', 'stan', 'zapas', 'inwentarz'],
            'crm': ['crm', 'klient', 'sprzedaż', 'lead']
        }
        
        max_score = 0
        best_intent = 'funkcjonalności'
        
        for intent, keywords in intent_keywords.items():
            score = sum(1 for kw in keywords if kw in query_lower)
            if score > max_score:
                max_score = score
                best_intent = intent
        
        return {
            'intent': best_intent,
            'confidence': min(0.9, 0.5 + max_score * 0.1),
            'sub_intent': '',
            'complexity': 'medium',
            'action_type': 'search'
        }
    
    def _assess_complexity(self, query: str) -> float:
        """Ocena złożoności zapytania (0.0 - 1.0)"""
        complexity_factors = [
            len(query.split()) > 10,  # Długie zapytanie
            '?' in query and len([q for q in query.split('?') if q.strip()]) > 1,  # Wiele pytań
            any(word in query.lower() for word in ['jak', 'dlaczego', 'porównaj', 'różnica']),  # Złożone pytania
            any(word in query.lower() for word in ['i', 'oraz', 'a także', 'dodatkowo']),  # Złożone warunki
            len([w for w in query.split() if w.lower() in ['konfiguracja', 'integracja', 'implementacja']]) > 0  # Techniczne terminy
        ]
        
        return sum(complexity_factors) / len(complexity_factors)

# ============================================================================
# RE-RANKING SERVICE
# ============================================================================

class ReRankingService:
    """Service do ponownego rankowania wyników wyszukiwania"""
    
    def __init__(self, claude_client: anthropic.Anthropic):
        self.claude_client = claude_client
        
        # Cross-encoder model for re-ranking (optional)
        try:
            self.cross_encoder = CrossEncoder('cross-encoder/ms-marco-MiniLM-L-6-v2')
            self.has_cross_encoder = True
        except Exception:
            self.has_cross_encoder = False
            logger.warning("Cross-encoder nie jest dostępny - używam alternatywnego re-rankingu")
    
    def rerank_results(self, query: str, results: List[SearchResult], top_k: int = 5) -> List[SearchResult]:
        """Ponowne rankowanie wyników"""
        if not results:
            return results
        
        # Metoda 1: Cross-encoder (jeśli dostępny)
        if self.has_cross_encoder:
            results = self._rerank_with_cross_encoder(query, results)
        
        # Metoda 2: Claude-based relevance scoring
        results = self._rerank_with_claude(query, results[:10])  # Ograniczenie dla kosztów
        
        # Metoda 3: Dodatkowe heurystyki
        results = self._apply_ranking_heuristics(query, results)
        
        return results[:top_k]
    
    def _rerank_with_cross_encoder(self, query: str, results: List[SearchResult]) -> List[SearchResult]:
        """Re-ranking z cross-encoder"""
        if len(results) <= 1:
            return results
        
        try:
            query_doc_pairs = [(query, result.content[:500]) for result in results]
            scores = self.cross_encoder.predict(query_doc_pairs)
            
            for i, score in enumerate(scores):
                results[i].rerank_score = float(score)
            
            # Sortuj po nowym score
            results.sort(key=lambda x: x.rerank_score or 0, reverse=True)
            
        except Exception as e:
            logger.warning(f"Błąd cross-encoder re-ranking: {e}")
        
        return results
    
    def _rerank_with_claude(self, query: str, results: List[SearchResult]) -> List[SearchResult]:
        """Re-ranking z Claude do oceny relevance"""
        if len(results) <= 1:
            return results
        
        try:
            # Przygotuj kontekst dla Claude
            context_for_claude = ""
            for i, result in enumerate(results):
                context_for_claude += f"\n--- DOKUMENT {i+1} ---\n{result.content[:300]}...\n"
            
            system_prompt = """Jesteś ekspertem ERP. Oceń relevantność dokumentów do pytania użytkownika.
Zwróć JSON z listą: [{"doc_id": 1, "relevance": 0.0-1.0, "explanation": "krótkie uzasadnienie"}]
Sortuj od najbardziej relevantnych."""

            message = self.claude_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=500,
                system=system_prompt,
                messages=[{
                    "role": "user", 
                    "content": f"PYTANIE: {query}\n\nDOKUMENTY:{context_for_claude}"
                }]
            )
            
            response_text = message.content[0].text.strip()
            
            # Parsuj odpowiedź
            try:
                relevance_scores = json.loads(response_text)
                
                # Aktualizuj wyniki
                for item in relevance_scores:
                    doc_id = item.get('doc_id', 1) - 1  # 0-indexed
                    if 0 <= doc_id < len(results):
                        results[doc_id].rerank_score = item.get('relevance', 0.5)
                        results[doc_id].relevance_explanation = item.get('explanation', '')
                
                # Sortuj po relevance
                results.sort(key=lambda x: x.rerank_score or 0, reverse=True)
                
            except json.JSONDecodeError:
                logger.warning("Nie udało się sparsować odpowiedzi Claude do re-ranking")
            
        except Exception as e:
            logger.warning(f"Błąd Claude re-ranking: {e}")
        
        return results
    
    def _apply_ranking_heuristics(self, query: str, results: List[SearchResult]) -> List[SearchResult]:
        """Zastosowanie dodatkowych heurystyk rankingu"""
        query_lower = query.lower()
        
        for result in results:
            bonus_score = 0.0
            
            # Bonus za dokładne dopasowanie terminów
            query_terms = set(query_lower.split())
            content_terms = set(result.content.lower().split())
            exact_matches = len(query_terms.intersection(content_terms))
            bonus_score += exact_matches * 0.1
            
            # Bonus za kategorie dokumentów
            category = result.metadata.get('category', '')
            if category in ['api_funkcje', 'dokumenty', 'funkcje'] and 'api' in query_lower:
                bonus_score += 0.2
            elif category == 'księgowość' and any(term in query_lower for term in ['finanse', 'księgowość', 'faktura']):
                bonus_score += 0.2
            elif category == 'kontrahenci' and any(term in query_lower for term in ['klient', 'kontrahent']):
                bonus_score += 0.2
            
            # Bonus za długość dokumentu (preferuj średnie długości)
            content_length = len(result.content)
            if 200 <= content_length <= 1000:
                bonus_score += 0.1
            
            # Aktualizuj combined_score
            result.combined_score += bonus_score
        
        # Sortuj ponownie
        results.sort(key=lambda x: x.combined_score, reverse=True)
        
        return results

# ============================================================================
# CONTEXT COMPRESSOR
# ============================================================================

class ContextCompressor:
    """Kompresja kontekstu dla lepszego wykorzystania tokenów"""
    
    def __init__(self, claude_client: anthropic.Anthropic, max_context_length: int = 2000):
        self.claude_client = claude_client
        self.max_context_length = max_context_length
    
    def compress_context(self, search_results: List[SearchResult], query: str) -> ContextBundle:
        """Kompresja kontekstu z zachowaniem najważniejszych informacji"""
        
        if not search_results:
            return ContextBundle(
                primary_context="",
                supporting_context="",
                sources=[],
                confidence_scores=[],
                context_length=0,
                compression_ratio=1.0
            )
        
        # Krok 1: Usuń duplikaty i podobne fragmenty
        unique_results = self._remove_duplicates(search_results)
        
        # Krok 2: Wyciągnij kluczowe fragmenty
        key_excerpts = self._extract_key_excerpts(unique_results, query)
        
        # Krok 3: Sumuj podobne informacje
        summarized_context = self._summarize_similar_content(key_excerpts)
        
        # Krok 4: Skonstruuj final context
        primary_context, supporting_context = self._build_final_context(summarized_context)
        
        original_length = sum(len(r.content) for r in search_results)
        final_length = len(primary_context) + len(supporting_context)
        compression_ratio = final_length / original_length if original_length > 0 else 1.0
        
        return ContextBundle(
            primary_context=primary_context,
            supporting_context=supporting_context,
            sources=[r.source for r in unique_results],
            confidence_scores=[r.combined_score for r in unique_results],
            context_length=final_length,
            compression_ratio=compression_ratio
        )
    
    def _remove_duplicates(self, results: List[SearchResult]) -> List[SearchResult]:
        """Usuwa duplikaty i bardzo podobne fragmenty"""
        unique_results = []
        seen_content = set()
        
        for result in results:
            # Twórz hash z pierwszych 100 znaków
            content_hash = hash(result.content[:100].lower().strip())
            
            if content_hash not in seen_content:
                seen_content.add(content_hash)
                unique_results.append(result)
        
        return unique_results
    
    def _extract_key_excerpts(self, results: List[SearchResult], query: str) -> List[Dict[str, Any]]:
        """Wyciąga kluczowe fragmenty z dokumentów"""
        key_excerpts = []
        query_terms = set(query.lower().split())
        
        for result in results:
            sentences = re.split(r'[.!?]+', result.content)
            
            for sentence in sentences:
                if len(sentence.strip()) < 20:
                    continue
                
                sentence_terms = set(sentence.lower().split())
                relevance = len(query_terms.intersection(sentence_terms)) / len(query_terms) if query_terms else 0
                
                if relevance > 0.1:  # Próg relevantności
                    key_excerpts.append({
                        'text': sentence.strip(),
                        'source': result.source,
                        'relevance': relevance,
                        'original_score': result.combined_score
                    })
        
        # Sortuj po relevantności
        key_excerpts.sort(key=lambda x: x['relevance'], reverse=True)
        return key_excerpts[:20]  # Maksymalnie 20 fragmentów
    
    def _summarize_similar_content(self, excerpts: List[Dict[str, Any]]) -> str:
        """Podsumowuje podobne treści"""
        if not excerpts:
            return ""
        
        # Grupuj podobne fragmenty
        grouped_content = defaultdict(list)
        
        for excerpt in excerpts:
            # Prosta kategoryzacja na podstawie słów kluczowych
            key_words = set(w.lower() for w in excerpt['text'].split() if len(w) > 3)
            
            best_group = None
            max_overlap = 0
            
            for group_key, group_excerpts in grouped_content.items():
                if group_excerpts:
                    group_words = set(w.lower() for w in group_excerpts[0]['text'].split() if len(w) > 3)
                    overlap = len(key_words.intersection(group_words))
                    if overlap > max_overlap and overlap >= 2:
                        max_overlap = overlap
                        best_group = group_key
            
            if best_group:
                grouped_content[best_group].append(excerpt)
            else:
                new_key = f"group_{len(grouped_content)}"
                grouped_content[new_key] = [excerpt]
        
        # Twórz podsumowanie dla każdej grupy
        summarized_parts = []
        for group_key, group_excerpts in grouped_content.items():
            if len(group_excerpts) == 1:
                summarized_parts.append(group_excerpts[0]['text'])
            else:
                # Kombinuj podobne fragmenty
                combined_text = " ".join([e['text'] for e in group_excerpts[:3]])
                if len(combined_text) > 300:
                    combined_text = combined_text[:300] + "..."
                summarized_parts.append(combined_text)
        
        return "\n\n".join(summarized_parts)
    
    def _build_final_context(self, summarized_content: str) -> Tuple[str, str]:
        """Buduje finalny kontekst podzielony na primary i supporting"""
        if len(summarized_content) <= self.max_context_length:
            return summarized_content, ""
        
        # Podziel na akapity
        paragraphs = summarized_content.split('\n\n')
        
        primary_context = ""
        supporting_context = ""
        current_length = 0
        
        # Priorytet dla pierwszych akapitów (najbardziej relevantne)
        for i, paragraph in enumerate(paragraphs):
            if current_length + len(paragraph) <= self.max_context_length * 0.7:  # 70% dla primary
                primary_context += paragraph + "\n\n"
                current_length += len(paragraph)
            else:
                # Reszta idzie do supporting context
                remaining_space = self.max_context_length - current_length
                if remaining_space > 100:
                    supporting_context = "\n\n".join(paragraphs[i:])
                    if len(supporting_context) > remaining_space:
                        supporting_context = supporting_context[:remaining_space] + "..."
                break
        
        return primary_context.strip(), supporting_context.strip()

# ============================================================================
# RESPONSE GENERATOR
# ============================================================================

class AdvancedResponseGenerator:
    """Zaawansowany generator odpowiedzi z multi-step reasoning"""
    
    def __init__(self, claude_client: anthropic.Anthropic, config):
        self.claude_client = claude_client
        self.config = config
    
    def generate_response(self, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> AdvancedResponse:
        """Generuje zaawansowaną odpowiedź z walidacją jakości"""
        
        if query_analysis.requires_multi_step:
            return self._generate_multi_step_response(query_analysis, context_bundle)
        else:
            return self._generate_single_step_response(query_analysis, context_bundle)
    
    def _generate_single_step_response(self, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> AdvancedResponse:
        """Generuje prostą odpowiedź"""
        
        # Przygotuj prompt
        system_prompt = self._build_system_prompt(query_analysis)
        user_prompt = self._build_user_prompt(query_analysis, context_bundle)
        
        # Generuj odpowiedź
        try:
            message = self.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=self.config.MAX_TOKENS,
                system=system_prompt,
                messages=[{"role": "user", "content": user_prompt}]
            )
            
            raw_answer = message.content[0].text.strip()
            
            # Walidacja i metryki
            validation_score = self._validate_response(raw_answer, query_analysis, context_bundle)
            
            return AdvancedResponse(
                answer=raw_answer,
                confidence=query_analysis.confidence,
                sources=context_bundle.sources,
                reasoning_steps=["Wyszukiwanie w bazie wiedzy", "Generowanie odpowiedzi"],
                validation_score=validation_score,
                context_relevance=self._calculate_context_relevance(query_analysis, context_bundle),
                answer_completeness=self._calculate_completeness(raw_answer, query_analysis),
                factual_consistency=validation_score
            )
            
        except Exception as e:
            logger.error(f"Błąd generowania odpowiedzi: {e}")
            return self._generate_fallback_response(query_analysis)
    
    def _generate_multi_step_response(self, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> AdvancedResponse:
        """Generuje odpowiedź wieloetapową dla złożonych zapytań"""
        
        reasoning_steps = []
        intermediate_results = []
        
        # Krok 1: Dekompozycja zapytania
        decomposed_queries = self._decompose_complex_query(query_analysis.original_query)
        reasoning_steps.append(f"Podzieliłem zapytanie na {len(decomposed_queries)} części")
        
        # Krok 2: Odpowiedz na każdą część
        for i, sub_query in enumerate(decomposed_queries):
            sub_result = self._answer_sub_query(sub_query, context_bundle)
            intermediate_results.append(sub_result)
            reasoning_steps.append(f"Część {i+1}: {sub_query[:50]}...")
        
        # Krok 3: Syntetyzuj finalną odpowiedź
        final_answer = self._synthesize_multi_step_answer(query_analysis, intermediate_results, context_bundle)
        reasoning_steps.append("Połączyłem odpowiedzi w spójną całość")
        
        # Walidacja
        validation_score = self._validate_response(final_answer, query_analysis, context_bundle)
        
        return AdvancedResponse(
            answer=final_answer,
            confidence=min(query_analysis.confidence, validation_score),
            sources=context_bundle.sources,
            reasoning_steps=reasoning_steps,
            validation_score=validation_score,
            context_relevance=self._calculate_context_relevance(query_analysis, context_bundle),
            answer_completeness=self._calculate_completeness(final_answer, query_analysis),
            factual_consistency=validation_score
        )
    
    def _decompose_complex_query(self, query: str) -> List[str]:
        """Dekompozycja złożonego zapytania"""
        try:
            system_prompt = """Podziel złożone zapytanie o ERP na prostsze podpytania.
Zwróć listę JSON: ["podpytanie1", "podpytanie2", ...]
Maksymalnie 4 podpytania."""

            message = self.claude_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=300,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Podziel zapytanie: {query}"}]
            )
            
            response_text = message.content[0].text.strip()
            try:
                sub_queries = json.loads(response_text)
                return sub_queries if isinstance(sub_queries, list) else [query]
            except json.JSONDecodeError:
                # Fallback - podziel po przecinkach lub "i"
                parts = re.split(r'[,;]|\bi\b|\boraz\b', query)
                return [part.strip() for part in parts if len(part.strip()) > 10][:4]
                
        except Exception as e:
            logger.warning(f"Błąd dekompozycji zapytania: {e}")
            return [query]
    
    def _answer_sub_query(self, sub_query: str, context_bundle: ContextBundle) -> str:
        """Odpowiada na pojedyncze podpytanie"""
        try:
            relevant_context = self._find_relevant_context_for_subquery(sub_query, context_bundle)
            
            system_prompt = "Odpowiedz krótko i konkretnie na podpytanie na podstawie kontekstu ERP."
            
            message = self.claude_client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=200,
                system=system_prompt,
                messages=[{
                    "role": "user", 
                    "content": f"KONTEKST: {relevant_context}\n\nPYTANIE: {sub_query}"
                }]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.warning(f"Błąd odpowiedzi na podpytanie: {e}")
            return f"Nie mogę odpowiedzieć na: {sub_query}"
    
    def _find_relevant_context_for_subquery(self, sub_query: str, context_bundle: ContextBundle) -> str:
        """Znajduje najlepszy kontekst dla podpytania"""
        # Prosta heurystyka - weź pierwszy fragment primary context
        context_parts = context_bundle.primary_context.split('\n\n')
        if context_parts:
            return context_parts[0][:500]
        return context_bundle.primary_context[:500]
    
    def _synthesize_multi_step_answer(self, query_analysis: QueryAnalysis, intermediate_results: List[str], context_bundle: ContextBundle) -> str:
        """Syntetyzuje finalną odpowiedź z wyników pośrednich"""
        try:
            combined_results = "\n".join([f"• {result}" for result in intermediate_results])
            
            system_prompt = """Stwórz spójną, profesjonalną odpowiedź łącząc wyniki analizy wieloetapowej.
Zachowaj styl eksperta ERP o imieniu Marcin."""

            message = self.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=self.config.MAX_TOKENS,
                system=system_prompt,
                messages=[{
                    "role": "user", 
                    "content": f"""ORYGINALNE PYTANIE: {query_analysis.original_query}

WYNIKI ANALIZY:
{combined_results}

DODATKOWY KONTEKST: {context_bundle.primary_context[:500]}

Napisz spójną odpowiedź łączącą wszystkie elementy."""
                }]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Błąd syntezy odpowiedzi: {e}")
            return "Przepraszam, wystąpił błąd podczas przetwarzania złożonego zapytania."
    
    def _build_system_prompt(self, query_analysis: QueryAnalysis) -> str:
        """Buduje system prompt dostosowany do intencji"""
        
        base_prompt = """Jesteś Marcin, przyjazny ekspert ds. systemów ERP z wieloletnim doświadczeniem jako architekt IT.

Odpowiadaj naturalnie i płynnie:
- Wykorzystuj dostarczony kontekst z bazy wiedzy
- Pisz po polsku w sposób rozmowny ale profesjonalny
- Bez nadmiernego formatowania markdown
- Jak prawdziwa rozmowa z ekspertem"""

        intent_specific = {
            'api': "Skup się na technicznych aspektach API i integracji.",
            'konfiguracja': "Podaj konkretne kroki konfiguracji i ustawień.",
            'problem': "Zdiagnozuj problem i zaproponuj rozwiązania.",
            'wdrożenie': "Omów proces wdrożenia i best practices.",
            'finanse': "Skup się na aspektach finansowych i księgowych.",
            'magazyn': "Koncentruj się na logistyce i zarządzaniu zapasami."
        }
        
        intent_addition = intent_specific.get(query_analysis.intent, "")
        if intent_addition:
            base_prompt += f"\n\n{intent_addition}"
        
        base_prompt += "\n\nNa końcu dodaj dyskretnie: 🔗 Marcin - Architekt IT | 🎯 [confidence]% | 📚 Źródła: [lista]"
        
        return base_prompt
    
    def _build_user_prompt(self, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> str:
        """Buduje user prompt"""
        
        prompt_parts = []
        
        if context_bundle.primary_context:
            prompt_parts.append(f"KONTEKST GŁÓWNY:\n{context_bundle.primary_context}")
        
        if context_bundle.supporting_context:
            prompt_parts.append(f"KONTEKST DODATKOWY:\n{context_bundle.supporting_context}")
        
        prompt_parts.extend([
            f"INTENCJA: {query_analysis.intent}",
            f"SŁOWA KLUCZOWE: {', '.join(query_analysis.keywords)}",
            f"PYTANIE: {query_analysis.original_query}"
        ])
        
        return "\n\n".join(prompt_parts)
    
    def _validate_response(self, answer: str, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> float:
        """Waliduje jakość odpowiedzi (0.0-1.0)"""
        
        validation_factors = []
        
        # 1. Długość odpowiedzi
        length_score = min(1.0, len(answer) / 200) if len(answer) > 50 else 0.3
        validation_factors.append(length_score)
        
        # 2. Obecność słów kluczowych z zapytania
        query_words = set(query_analysis.keywords)
        answer_words = set(answer.lower().split())
        keyword_overlap = len(query_words.intersection(answer_words)) / len(query_words) if query_words else 0.5
        validation_factors.append(keyword_overlap)
        
        # 3. Użycie kontekstu (sprawdź czy odpowiedź korzysta z dostarczonych informacji)
        if context_bundle.primary_context:
            context_words = set(context_bundle.primary_context.lower().split())
            context_usage = len(answer_words.intersection(context_words)) / len(context_words) if context_words else 0.3
            validation_factors.append(min(1.0, context_usage * 5))  # Scale up
        else:
            validation_factors.append(0.5)
        
        # 4. Struktura odpowiedzi (sprawdź czy ma sens)
        structure_score = 0.8 if len(re.findall(r'[.!?]', answer)) >= 2 else 0.5
        validation_factors.append(structure_score)
        
        # 5. Specyfika ERP (sprawdź czy zawiera terminy branżowe)
        erp_terms = {'erp', 'system', 'moduł', 'konfiguracja', 'funkcja', 'dokument', 'proces'}
        erp_usage = len(erp_terms.intersection(answer_words)) / len(erp_terms)
        validation_factors.append(erp_usage)
        
        return sum(validation_factors) / len(validation_factors)
    
    def _calculate_context_relevance(self, query_analysis: QueryAnalysis, context_bundle: ContextBundle) -> float:
        """Oblicza relevantność kontekstu do zapytania"""
        if not context_bundle.confidence_scores:
            return 0.5
        
        # Średnia z confidence scores
        avg_confidence = sum(context_bundle.confidence_scores) / len(context_bundle.confidence_scores)
        
        # Bonus za kompresję (lepsze wykorzystanie kontekstu)
        compression_bonus = min(0.2, (1 - context_bundle.compression_ratio) * 0.5)
        
        return min(1.0, avg_confidence + compression_bonus)
    
    def _calculate_completeness(self, answer: str, query_analysis: QueryAnalysis) -> float:
        """Oblicza kompletność odpowiedzi"""
        
        completeness_factors = []
        
        # 1. Długość vs złożoność zapytania
        expected_length = 100 + (query_analysis.complexity_score * 200)
        length_ratio = min(1.0, len(answer) / expected_length)
        completeness_factors.append(length_ratio)
        
        # 2. Pokrycie aspektów zapytania
        if query_analysis.entities:
            entity_texts = [e['text'].lower() for e in query_analysis.entities]
            answer_lower = answer.lower()
            entity_coverage = sum(1 for entity in entity_texts if entity in answer_lower) / len(entity_texts)
            completeness_factors.append(entity_coverage)
        else:
            completeness_factors.append(0.7)
        
        # 3. Struktura odpowiedzi dla złożonych zapytań
        if query_analysis.complexity_score > 0.7:
            # Złożone zapytania powinny mieć strukturę
            has_structure = bool(re.search(r'\n|[0-9]+\.|•|→', answer))
            completeness_factors.append(1.0 if has_structure else 0.6)
        else:
            completeness_factors.append(0.8)
        
        return sum(completeness_factors) / len(completeness_factors)
    
    def _generate_fallback_response(self, query_analysis: QueryAnalysis) -> AdvancedResponse:
        """Generuje fallback odpowiedź w przypadku błędu"""
        return AdvancedResponse(
            answer="Przepraszam, wystąpił problem z przetwarzaniem Twojego zapytania. Spróbuj ponownie lub zadaj pytanie w inny sposób.",
            confidence=0.3,
            sources=[],
            reasoning_steps=["Błąd systemu"],
            validation_score=0.3,
            context_relevance=0.0,
            answer_completeness=0.5,
            factual_consistency=0.3
        )

# ============================================================================
# MAIN ADVANCED RAG SERVICE
# ============================================================================

class AdvancedRAGService:
    """Główny service zaawansowanego RAG"""
    
    def __init__(self, config, ai_service, vector_service):
        self.config = config
        self.ai_service = ai_service
        self.vector_service = vector_service
        
        # Inicjalizuj komponenty
        self.hybrid_search = HybridSearchEngine(ai_service.sentence_model)
        self.query_processor = AdvancedQueryProcessor(ai_service.claude_client, ai_service.sentence_model)
        self.reranker = ReRankingService(ai_service.claude_client)
        self.context_compressor = ContextCompressor(ai_service.claude_client)
        self.response_generator = AdvancedResponseGenerator(ai_service.claude_client, config)
        
        self.is_initialized = False
    
    def initialize_with_documents(self, documents: List[str], metadatas: List[Dict]):
        """Inicjalizuje system z dokumentami"""
        logger.info("🚀 Inicjalizacja zaawansowanego RAG...")
        
        # Wytrenuj hybrid search
        self.hybrid_search.fit(documents, metadatas)
        
        self.is_initialized = True
        logger.info("✅ Zaawansowany RAG gotowy")
    
    def process_query(self, query: str, session_id: str = "default") -> AdvancedResponse:
        """Główne przetwarzanie zapytania"""
        
        if not self.is_initialized:
            logger.warning("RAG nie został zainicjalizowany")
            return self._fallback_response(query)
        
        try:
            # Krok 1: Analiza zapytania
            query_analysis = self.query_processor.analyze_query(query)
            logger.info(f"📝 Analiza: intencja={query_analysis.intent}, złożoność={query_analysis.complexity_score:.2f}")
            
            # Krok 2: Hybrydowe wyszukiwanie
            search_results = self.hybrid_search.search(query_analysis.processed_query, top_k=15)
            
            # Sprawdź czy są wyniki
            if not search_results:
                logger.warning("Brak wyników wyszukiwania")
                return self._fallback_response(query)
            
            # Krok 3: Re-ranking
            reranked_results = self.reranker.rerank_results(query, search_results, top_k=8)
            
            # Krok 4: Kompresja kontekstu
            context_bundle = self.context_compressor.compress_context(reranked_results, query)
            
            # Krok 5: Generowanie odpowiedzi
            response = self.response_generator.generate_response(query_analysis, context_bundle)
            
            logger.info(f"✅ Odpowiedź: confidence={response.confidence:.2f}, validation={response.validation_score:.2f}")
            return response
            
        except Exception as e:
            logger.error(f"❌ Błąd w zaawansowanym RAG: {e}")
            return self._fallback_response(query)
    
    def _fallback_response(self, query: str) -> AdvancedResponse:
        """Fallback odpowiedź"""
        return AdvancedResponse(
            answer="Przepraszam, wystąpił problem z systemem RAG. Spróbuj ponownie.",
            confidence=0.3,
            sources=[],
            reasoning_steps=["Błąd systemu"],
            validation_score=0.3,
            context_relevance=0.0,
            answer_completeness=0.5,
            factual_consistency=0.3
        )
    
    def get_system_metrics(self) -> Dict[str, Any]:
        """Zwraca metryki systemu"""
        return {
            "initialized": self.is_initialized,
            "hybrid_search_ready": self.hybrid_search.is_fitted,
            "components": {
                "query_processor": bool(self.query_processor),
                "reranker": bool(self.reranker),
                "context_compressor": bool(self.context_compressor),
                "response_generator": bool(self.response_generator)
            }
        }
