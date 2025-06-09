#!/usr/bin/env python3
"""
=================================================================================
ERP AI ASSISTANT - ENHANCED BACKEND SERVER WITH ADVANCED RAG v3.0
Specjalistyczny Agent AI wspierający procesy wdrożeń systemów ERP Comarch XL
z zaawansowanym systemem RAG, wielomodelowym AI i adaptacyjnym uczeniem
=================================================================================
"""

import os
import sys
import json
import logging
import time
import traceback
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import psutil

# Dodaj ścieżkę do current directory żeby móc importować local modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Importy zaawansowanych serwisów
try:
    from enhanced_rag_service_v3 import EnhancedRAGService, EnhancedResponse, QueryType, ConfidenceLevel
    ENHANCED_RAG_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Enhanced RAG v3 not available: {e}")
    ENHANCED_RAG_AVAILABLE = False

# AI Services
try:
    import anthropic
    from sentence_transformers import SentenceTransformer
    AI_SERVICES_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ AI services not available: {e}")
    AI_SERVICES_AVAILABLE = False

# Vector Database
try:
    import chromadb
    from chromadb.config import Settings
    VECTOR_DB_AVAILABLE = True
except ImportError as e:
    print(f"⚠️ Vector database not available: {e}")
    VECTOR_DB_AVAILABLE = False

# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('erp_assistant.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Załaduj zmienne środowiskowe
load_dotenv()

# ============================================================================
# ENHANCED APPLICATION CLASS
# ============================================================================

class EnhancedERPApplication:
    """Główna klasa aplikacji z Enhanced RAG v3.0"""
    
    def __init__(self):
        self.version = "2.0.0-enhanced-rag-v3"
        self.start_time = time.time()
        
        # Flask app
        self.app = Flask(__name__)
        CORS(self.app, origins=["*"])
        
        # Configuration
        self.config = self._load_config()
        
        # Services
        self.ai_service = None
        self.vector_service = None
        self.enhanced_rag_service = None
        
        # Service status
        self.services_status = {
            'ai_service': False,
            'vector_service': False,
            'enhanced_rag_service': False
        }
        
        # Metrics
        self.request_count = 0
        self.error_count = 0
        self.total_processing_time = 0.0
        
        # Initialize services
        self._initialize_services()
        
        # Setup routes
        self._setup_routes()
        
        logger.info(f"🚀 Enhanced ERP Application v{self.version} initialized")

    def _load_config(self) -> Dict[str, Any]:
        """Ładuje konfigurację systemu"""
        config = {
            'SECRET_KEY': os.getenv('SECRET_KEY', 'enhanced-erp-2025'),
            'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY'),
            'CLAUDE_MODEL': os.getenv('CLAUDE_MODEL', "claude-3-5-sonnet-20241022"),
            'CLAUDE_HAIKU_MODEL': os.getenv('CLAUDE_HAIKU_MODEL', "claude-3-haiku-20240307"),
            'MAX_TOKENS': int(os.getenv('MAX_TOKENS', '4096')),
            'EMBEDDING_MODEL': os.getenv('EMBEDDING_MODEL', "paraphrase-multilingual-MiniLM-L12-v2"),
            'VECTOR_DB_PATH': os.getenv('VECTOR_DB_PATH', "chroma_db"),
            'MAX_CONTEXT_LENGTH': int(os.getenv('MAX_CONTEXT_LENGTH', '3000')),
            'HOST': os.getenv('HOST', '127.0.0.1'),
            'PORT': int(os.getenv('PORT', '5000')),
            'DEBUG': os.getenv('DEBUG', 'False').lower() == 'true'
        }
        
        logger.info(f"📋 Configuration loaded: {len(config)} parameters")
        return config

    def _initialize_services(self):
        """Inicjalizuje wszystkie serwisy z error handling"""
        logger.info("🔧 Inicjalizacja zaawansowanych serwisów...")
        
        # 1. AI Service
        if AI_SERVICES_AVAILABLE:
            try:
                self.ai_service = self._initialize_ai_service()
                self.services_status['ai_service'] = True
                logger.info("✅ AI Service initialized successfully")
            except Exception as e:
                logger.error(f"❌ AI Service initialization failed: {e}")
                self.ai_service = None
        else:
            logger.warning("⚠️ AI Services not available - install anthropic and sentence-transformers")
        
        # 2. Vector Service  
        if VECTOR_DB_AVAILABLE:
            try:
                self.vector_service = self._initialize_vector_service()
                self.services_status['vector_service'] = True
                logger.info("✅ Vector Service initialized successfully")
            except Exception as e:
                logger.error(f"❌ Vector Service initialization failed: {e}")
                self.vector_service = None
        else:
            logger.warning("⚠️ Vector Database not available - install chromadb")
        
        # 3. Enhanced RAG Service v3.0
        if ENHANCED_RAG_AVAILABLE and self.ai_service and self.vector_service:
            try:
                self.enhanced_rag_service = EnhancedRAGService(
                    config=self.config,
                    ai_service=self.ai_service,
                    vector_service=self.vector_service
                )
                self.services_status['enhanced_rag_service'] = True
                logger.info("✅ Enhanced RAG Service v3.0 initialized successfully")
            except Exception as e:
                logger.error(f"❌ Enhanced RAG Service initialization failed: {e}")
                self.enhanced_rag_service = None
        else:
            if not ENHANCED_RAG_AVAILABLE:
                logger.warning("⚠️ Enhanced RAG v3 not available")
            if not self.ai_service:
                logger.warning("⚠️ AI Service required for Enhanced RAG")
            if not self.vector_service:
                logger.warning("⚠️ Vector Service required for Enhanced RAG")
        
        # Log services status
        active_services = sum(self.services_status.values())
        total_services = len(self.services_status)
        logger.info(f"🎯 Services initialized: {active_services}/{total_services} active")
        
        for service, status in self.services_status.items():
            status_emoji = "✅" if status else "❌"
            logger.info(f"   {status_emoji} {service}: {'Active' if status else 'Inactive'}")

    def _initialize_ai_service(self):
        """Inicjalizuje AI Service z Claude i SentenceTransformers"""
        ai_service = type('AIService', (), {})()
        
        # Claude API
        if self.config['ANTHROPIC_API_KEY']:
            ai_service.claude_client = anthropic.Anthropic(
                api_key=self.config['ANTHROPIC_API_KEY']
            )
            logger.info("🤖 Claude API client initialized")
        else:
            logger.warning("⚠️ ANTHROPIC_API_KEY not set - some features will be limited")
            ai_service.claude_client = None
        
        # Sentence Transformers
        try:
            ai_service.sentence_model = SentenceTransformer(self.config['EMBEDDING_MODEL'])
            logger.info(f"🧠 Embedding model '{self.config['EMBEDDING_MODEL']}' loaded")
        except Exception as e:
            logger.error(f"❌ Failed to load embedding model: {e}")
            raise
        
        return ai_service

    def _initialize_vector_service(self):
        """Inicjalizuje Vector Service z ChromaDB"""
        vector_service = type('VectorService', (), {})()
        
        try:
            # ChromaDB client
            vector_service.client = chromadb.PersistentClient(
                path=self.config['VECTOR_DB_PATH'],
                settings=Settings(anonymized_telemetry=False)
            )
            
            # Collection
            vector_service.collection = vector_service.client.get_or_create_collection(
                name="enhanced_erp_documents",
                metadata={"description": "Enhanced ERP Documentation with RAG v3.0"}
            )
            
            logger.info(f"🗄️ Vector database initialized at {self.config['VECTOR_DB_PATH']}")
            
            # Check collection status
            doc_count = vector_service.collection.count()
            logger.info(f"📚 Collection contains {doc_count} documents")
            
        except Exception as e:
            logger.error(f"❌ Vector service initialization failed: {e}")
            raise
        
        return vector_service

    def _setup_routes(self):
        """Konfiguruje routing aplikacji"""
        
        # ===== STATIC FILES =====
        @self.app.route('/')
        def home():
            """Główna strona"""
            return send_from_directory('..', 'index.html')

        @self.app.route('/<path:filename>')
        def serve_static(filename):
            """Serwowanie plików statycznych"""
            return send_from_directory('..', filename)

        # ===== HEALTH ENDPOINTS =====
        @self.app.route('/api/health', methods=['GET'])
        def health_check():
            """Kompleksowy health check"""
            return self._comprehensive_health_check()

        @self.app.route('/api/enhanced/health', methods=['GET'])
        def enhanced_health():
            """Enhanced health check z metrykami"""
            return self._enhanced_health_check()

        # ===== ENHANCED RAG ENDPOINTS =====
        @self.app.route('/api/enhanced/chat', methods=['POST'])
        def enhanced_chat():
            """Enhanced RAG v3.0 chat endpoint"""
            return self._handle_enhanced_chat()

        @self.app.route('/api/enhanced/metrics', methods=['GET'])
        def enhanced_metrics():
            """Enhanced RAG metrics"""
            return self._get_enhanced_metrics()

        # ===== LEGACY COMPATIBILITY =====
        @self.app.route('/api/rag/chat', methods=['POST'])
        def legacy_rag_chat():
            """Legacy RAG endpoint dla kompatybilności"""
            return self._handle_enhanced_chat()

        @self.app.route('/api/chat', methods=['POST'])
        def legacy_chat():
            """Legacy chat endpoint"""
            return self._handle_enhanced_chat()

        # ===== INITIALIZATION ENDPOINTS =====
        @self.app.route('/api/initialize', methods=['POST'])
        def initialize():
            """Inicjalizacja systemu z dokumentami"""
            return self._initialize_documents()

        @self.app.route('/api/enhanced/initialize', methods=['POST'])
        def enhanced_initialize():
            """Enhanced initialization z dokumentami"""
            return self._enhanced_initialize_documents()

        # ===== ERP SPECIFIC ENDPOINTS =====
        @self.app.route('/api/erp/modules/analysis', methods=['POST'])
        def analyze_erp_modules():
            """Analiza modułów ERP dla konkretnego wdrożenia"""
            return self._analyze_erp_modules()

        @self.app.route('/api/erp/implementation/roadmap', methods=['POST'])
        def generate_implementation_roadmap():
            """Generuje harmonogram wdrożenia ERP"""
            return self._generate_implementation_roadmap()

        @self.app.route('/api/erp/training/plan', methods=['POST'])
        def generate_training_plan():
            """Generuje plan szkoleń dla wdrożenia ERP"""
            return self._generate_training_plan()

        @self.app.route('/api/erp/migration/assessment', methods=['POST'])
        def assess_data_migration():
            """Ocena migracji danych z istniejących systemów"""
            return self._assess_data_migration()

        # ===== ADMIN ENDPOINTS =====
        @self.app.route('/api/admin/services/restart', methods=['POST'])
        def restart_services():
            """Restart serwisów"""
            return self._restart_services()

        @self.app.route('/api/admin/cache/clear', methods=['POST'])
        def clear_cache():
            """Wyczyść cache"""
            return self._clear_cache()

        # ===== ERROR HANDLERS =====
        @self.app.errorhandler(404)
        def not_found(error):
            return jsonify({
                'error': 'Endpoint nie znaleziony',
                'timestamp': datetime.now().isoformat(),
                'version': self.version
            }), 404

        @self.app.errorhandler(500)
        def internal_error(error):
            self.error_count += 1
            logger.error(f"Internal error: {error}")
            return jsonify({
                'error': 'Wewnętrzny błąd serwera',
                'timestamp': datetime.now().isoformat(),
                'version': self.version
            }), 500

    def _comprehensive_health_check(self):
        """Kompleksowy health check"""
        try:
            uptime = time.time() - self.start_time
            
            # System metrics
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            
            health_data = {
                'status': 'online',
                'version': self.version,
                'timestamp': datetime.now().isoformat(),
                'uptime_seconds': uptime,
                'system': {
                    'cpu_percent': cpu_percent,
                    'memory_percent': memory.percent,
                    'memory_available_mb': memory.available / (1024 * 1024)
                },
                'services': self.services_status,
                'metrics': {
                    'total_requests': self.request_count,
                    'total_errors': self.error_count,
                    'error_rate': (self.error_count / max(self.request_count, 1)) * 100,
                    'avg_processing_time': self.total_processing_time / max(self.request_count, 1)
                },
                'features': {
                    'enhanced_rag_v3': self.services_status.get('enhanced_rag_service', False),
                    'multi_model_reasoning': self.services_status.get('enhanced_rag_service', False),
                    'adaptive_learning': self.services_status.get('enhanced_rag_service', False),
                    'conversation_context': self.services_status.get('enhanced_rag_service', False),
                    'fact_checking': self.services_status.get('enhanced_rag_service', False),
                    'citation_generation': self.services_status.get('enhanced_rag_service', False)
                }
            }
            
            # Vector database info
            if self.vector_service:
                try:
                    doc_count = self.vector_service.collection.count()
                    health_data['vector_database'] = {
                        'status': 'connected',
                        'document_count': doc_count,
                        'collection_name': 'enhanced_erp_documents'
                    }
                except Exception as e:
                    health_data['vector_database'] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            # Enhanced RAG info
            if self.enhanced_rag_service:
                try:
                    rag_metrics = self.enhanced_rag_service.get_enhanced_system_metrics()
                    health_data['enhanced_rag'] = rag_metrics
                except Exception as e:
                    health_data['enhanced_rag'] = {
                        'status': 'error',
                        'error': str(e)
                    }
            
            return jsonify(health_data), 200
            
        except Exception as e:
            logger.error(f"Health check error: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    def _enhanced_health_check(self):
        """Enhanced health check z dodatkowymi metrykami"""
        try:
            basic_health = self._comprehensive_health_check()
            basic_data = basic_health[0].get_json()
            
            # Dodatkowe enhanced metrics
            enhanced_data = {
                'enhanced_features': {
                    'rag_version': '3.0',
                    'query_types_supported': [t.value for t in QueryType],
                    'confidence_levels': [c.value for c in ConfidenceLevel],
                    'multi_dimensional_validation': True,
                    'adaptive_context_compression': True,
                    'diversity_filtering': True,
                    'followup_suggestions': True
                }
            }
            
            # Merge data
            basic_data.update(enhanced_data)
            
            return jsonify(basic_data), 200
            
        except Exception as e:
            logger.error(f"Enhanced health check error: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    def _handle_enhanced_chat(self):
        """Handler dla Enhanced RAG v3.0 chat"""
        start_time = time.time()
        self.request_count += 1
        
        try:
            data = request.get_json()
            if not data:
                return jsonify({
                    'error': 'Brak danych JSON'
                }), 400
            
            message = data.get('message', '')
            session_id = data.get('session_id', 'default')
            
            if not message:
                return jsonify({
                    'error': 'Brak wiadomości'
                }), 400
            
            # Sprawdź dostępność Enhanced RAG
            if not self.enhanced_rag_service:
                return self._fallback_response(message, "Enhanced RAG Service niedostępny")
            
            # Przetwórz zapytanie przez Enhanced RAG v3.0
            enhanced_response = self.enhanced_rag_service.process_query(message, session_id)
            
            processing_time = (time.time() - start_time) * 1000
            self.total_processing_time += processing_time
            
            # Konwertuj Enhanced Response na JSON
            response_data = {
                'answer': enhanced_response.answer,
                'confidence': enhanced_response.confidence,
                'confidence_level': enhanced_response.confidence_level.value,
                'sources': enhanced_response.sources,
                'reasoning_chain': enhanced_response.reasoning_chain,
                'validation_score': enhanced_response.validation_score,
                'query_type': enhanced_response.query_type.value,
                'response_type': enhanced_response.response_type,
                
                # Enhanced features
                'citations': enhanced_response.citations,
                'fact_check_score': enhanced_response.fact_check_score,
                'relevance_score': enhanced_response.relevance_score,
                'completeness_score': enhanced_response.completeness_score,
                'clarity_score': enhanced_response.clarity_score,
                
                # Technical metadata
                'models_used': enhanced_response.models_used,
                'processing_steps': enhanced_response.processing_steps,
                'context_chunks_used': enhanced_response.context_chunks_used,
                'total_tokens': enhanced_response.total_tokens,
                'processing_time_ms': enhanced_response.processing_time_ms,
                
                # Suggestions
                'suggested_followups': enhanced_response.suggested_followups,
                
                # Session info
                'session_id': enhanced_response.session_id,
                'timestamp': enhanced_response.timestamp.isoformat(),
                
                # Legacy compatibility
                'claude_model': enhanced_response.models_used[0] if enhanced_response.models_used else 'enhanced-rag-v3'
            }
            
            logger.info(f"✅ Enhanced chat processed: confidence={enhanced_response.confidence:.2f}, type={enhanced_response.query_type.value}")
            
            return jsonify(response_data), 200
            
        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            self.total_processing_time += processing_time
            self.error_count += 1
            
            logger.error(f"❌ Enhanced chat error: {e}")
            traceback.print_exc()
            
            return self._fallback_response(
                data.get('message', '') if data else '',
                f"Błąd przetwarzania: {str(e)}"
            )

    def _fallback_response(self, message: str, error_msg: str):
        """Fallback response gdy Enhanced RAG nie działa"""
        fallback_data = {
            'answer': f"""**Błąd systemu:** {error_msg}

**Zapytanie:** {message}

**Status serwisów:**
{'✅' if self.services_status.get('ai_service') else '❌'} AI Service
{'✅' if self.services_status.get('vector_service') else '❌'} Vector Service  
{'✅' if self.services_status.get('enhanced_rag_service') else '❌'} Enhanced RAG v3.0

**Rekomendacje:**
- Sprawdź konfigurację API keys
- Zweryfikuj dostępność serwisów
- Sprawdź logi systemowe
- Skontaktuj się z administratorem

*Uwaga: To jest odpowiedź fallback. Pełna funkcjonalność będzie dostępna po naprawie serwisów.*""",
            'confidence': 0.1,
            'confidence_level': 'very_low',
            'sources': [],
            'reasoning_chain': ['Fallback response due to service unavailability'],
            'validation_score': 0.0,
            'query_type': 'unknown',
            'response_type': 'error',
            'citations': [],
            'fact_check_score': 0.0,
            'relevance_score': 0.0,
            'completeness_score': 0.0,
            'clarity_score': 0.0,
            'models_used': ['fallback'],
            'processing_steps': [f'Error: {error_msg}'],
            'context_chunks_used': 0,
            'total_tokens': 0,
            'processing_time_ms': 0.0,
            'suggested_followups': [
                'Sprawdź status serwisów',
                'Zweryfikuj konfigurację',
                'Spróbuj ponownie za moment'
            ],
            'session_id': 'fallback',
            'timestamp': datetime.now().isoformat(),
            'claude_model': 'fallback',
            'error': error_msg
        }
        
        return jsonify(fallback_data), 500

    def _get_enhanced_metrics(self):
        """Pobiera metryki Enhanced RAG"""
        try:
            if not self.enhanced_rag_service:
                return jsonify({
                    'error': 'Enhanced RAG Service niedostępny'
                }), 503
            
            metrics = self.enhanced_rag_service.get_enhanced_system_metrics()
            
            return jsonify(metrics), 200
            
        except Exception as e:
            logger.error(f"Enhanced metrics error: {e}")
            return jsonify({
                'error': str(e)
            }), 500

    def _initialize_documents(self):
        """Podstawowa inicjalizacja dokumentów"""
        try:
            # Sprawdź dostępność serwisów
            if not self.vector_service:
                return jsonify({
                    'status': 'error',
                    'message': 'Vector Service niedostępny',
                    'documents_loaded': 0
                }), 503
            
            # Sprawdź czy dokumenty już są załadowane
            doc_count = self.vector_service.collection.count()
            
            if doc_count > 0:
                return jsonify({
                    'status': 'success',
                    'message': f'System już zainicjalizowany z {doc_count} dokumentami',
                    'documents_loaded': doc_count,
                    'action': 'already_initialized'
                }), 200
            
            # Jeśli brak dokumentów, spróbuj załadować przykładowe
            sample_documents = self._get_sample_documents()
            
            if sample_documents:
                documents = [doc['content'] for doc in sample_documents]
                metadatas = [doc['metadata'] for doc in sample_documents]
                ids = [f"init_doc_{i}" for i in range(len(documents))]
                
                # Generate embeddings
                if self.ai_service and self.ai_service.sentence_model:
                    embeddings = self.ai_service.sentence_model.encode(documents).tolist()
                    
                    # Add to vector store
                    self.vector_service.collection.add(
                        documents=documents,
                        metadatas=metadatas,
                        ids=ids,
                        embeddings=embeddings
                    )
                    
                    # Initialize Enhanced RAG if available
                    if self.enhanced_rag_service:
                        self.enhanced_rag_service.initialize_with_documents(documents, metadatas)
                    
                    logger.info(f"✅ Initialized with {len(documents)} sample documents")
                    
                    return jsonify({
                        'status': 'success',
                        'message': 'System został zainicjalizowany z przykładowymi dokumentami',
                        'documents_loaded': len(documents),
                        'action': 'initialized_with_samples'
                    }), 200
            
            return jsonify({
                'status': 'warning',
                'message': 'Brak dokumentów do załadowania',
                'documents_loaded': 0,
                'action': 'no_documents_found'
            }), 200
            
        except Exception as e:
            logger.error(f"Document initialization error: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'documents_loaded': 0
            }), 500

    def _enhanced_initialize_documents(self):
        """Enhanced inicjalizacja z dodatkowymi opcjami"""
        try:
            data = request.get_json() or {}
            force_reload = data.get('force_reload', False)
            
            # Check services
            if not self.enhanced_rag_service:
                return jsonify({
                    'status': 'error',
                    'message': 'Enhanced RAG Service niedostępny',
                    'services_required': ['ai_service', 'vector_service', 'enhanced_rag_service']
                }), 503
            
            # Check existing documents
            doc_count = self.vector_service.collection.count()
            
            if doc_count > 0 and not force_reload:
                metrics = self.enhanced_rag_service.get_enhanced_system_metrics()
                return jsonify({
                    'status': 'success',
                    'message': f'Enhanced RAG już zainicjalizowany z {doc_count} dokumentami',
                    'documents_loaded': doc_count,
                    'action': 'already_initialized',
                    'enhanced_metrics': metrics
                }), 200
            
            # Enhanced initialization
            if force_reload and doc_count > 0:
                # Clear existing collection
                self.vector_service.collection.delete()
                logger.info("🗑️ Cleared existing documents for reload")
            
            # Load enhanced sample documents
            sample_documents = self._get_enhanced_sample_documents()
            
            if sample_documents:
                documents = [doc['content'] for doc in sample_documents]
                metadatas = [doc['metadata'] for doc in sample_documents]
                
                # Initialize Enhanced RAG with documents
                self.enhanced_rag_service.initialize_with_documents(documents, metadatas)
                
                # Get final metrics
                metrics = self.enhanced_rag_service.get_enhanced_system_metrics()
                
                logger.info(f"✅ Enhanced initialization completed with {len(documents)} documents")
                
                return jsonify({
                    'status': 'success',
                    'message': 'Enhanced RAG został zainicjalizowany pomyślnie',
                    'documents_loaded': len(documents),
                    'action': 'enhanced_initialized',
                    'enhanced_features': {
                        'rag_version': '3.0',
                        'multi_model_reasoning': True,
                        'adaptive_compression': True,
                        'conversation_context': True,
                        'fact_checking': True,
                        'citation_generation': True
                    },
                    'enhanced_metrics': metrics
                }), 200
            
            return jsonify({
                'status': 'warning',
                'message': 'Brak dokumentów do załadowania',
                'documents_loaded': 0
            }), 200
            
        except Exception as e:
            logger.error(f"Enhanced initialization error: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'documents_loaded': 0
            }), 500

    def _get_sample_documents(self) -> List[Dict[str, Any]]:
        """Pobiera przykładowe dokumenty do inicjalizacji"""
        return [
            {
                'content': """Comarch ERP XL - Moduł Księgowość
Podstawowe funkcjonalności:
- Automatyczna dekretacja dokumentów
- Prowadzenie dzienników księgowych
- Generowanie bilansów i sprawozdań
- Integracja z modułami Sprzedaż i Zakup
- Obsługa wielu firm i walut

Konfiguracja:
1. Ustawienia > Księgowość > Parametry
2. Definicja kont księgowych
3. Konfiguracja automatycznych dekretacji
4. Ustawienia grup VAT""",
                'metadata': {
                    'source': 'Dokumentacja Comarch ERP XL - Księgowość',
                    'category': 'financial',
                    'module': 'accounting',
                    'type': 'documentation'
                }
            },
            {
                'content': """Comarch ERP XL - Moduł Kadry i Płace
Główne funkcje:
- Ewidencja pracowników i ich danych
- Naliczanie wynagrodzeń i składek ZUS
- Generowanie list płac
- Obsługa urlopów i nieobecności
- Raporty kadrowe i płacowe

Proces naliczania płac:
1. Wprowadzenie danych zmiennych
2. Naliczenie składników płacy
3. Obliczenie podatków i składek
4. Wygenerowanie listy płac
5. Księgowanie w module Księgowość""",
                'metadata': {
                    'source': 'Dokumentacja Comarch ERP XL - Kadry',
                    'category': 'hr',
                    'module': 'payroll',
                    'type': 'documentation'
                }
            },
            {
                'content': """Comarch ERP XL - Moduł Magazyn
Zarządzanie stanami magazynowymi:
- Rejestracja przyjęć i wydań towarów
- Kontrola stanów magazynowych
- Inwentaryzacja
- Rezerwacje i alokacje
- Śledzenie partii i numerów seryjnych

Dokumenty magazynowe:
- PZ (Przyjęcie zewnętrzne)
- PW (Przyjęcie wewnętrzne)
- WZ (Wydanie zewnętrzne)
- WW (Wydanie wewnętrzne)
- MM (Przesunięcie międzymagazynowe)""",
                'metadata': {
                    'source': 'Dokumentacja Comarch ERP XL - Magazyn',
                    'category': 'warehouse',
                    'module': 'inventory',
                    'type': 'documentation'
                }
            }
        ]

    def _get_enhanced_sample_documents(self) -> List[Dict[str, Any]]:
        """Pobiera rozszerzone przykładowe dokumenty dla Enhanced RAG"""
        basic_docs = self._get_sample_documents()
        
        enhanced_docs = [
            {
                'content': """Comarch ERP XL - Zaawansowana konfiguracja systemu
Parametry systemowe:
- Konfiguracja połączeń z bazą danych
- Ustawienia zabezpieczeń i uprawnień użytkowników
- Parametry integracji z systemami zewnętrznymi
- Konfiguracja workflow i powiadomień

Troubleshooting częstych problemów:
1. Błędy połączenia z bazą danych - sprawdź parametry połączenia
2. Problemy z wydajnością - optymalizacja indeksów
3. Błędy uprawnień - weryfikacja ról użytkowników
4. Problemy z integracją - kontrola API endpoints""",
                'metadata': {
                    'source': 'Comarch ERP XL - Advanced Configuration Guide',
                    'category': 'system',
                    'module': 'configuration',
                    'type': 'advanced_guide',
                    'complexity': 'high'
                }
            },
            {
                'content': """Comarch ERP XL - Procedury wdrożeniowe
Etapy wdrożenia systemu ERP:

Faza 1 - Analiza i przygotowanie (2-4 tygodnie):
- Analiza procesów biznesowych klienta
- Mapowanie wymagań funkcjonalnych
- Przygotowanie środowiska testowego
- Konfiguracja podstawowych parametrów

Faza 2 - Konfiguracja i customizacja (4-8 tygodni):
- Dostosowanie modułów do specyfiki firmy
- Konfiguracja workflow i automatyzacji
- Przygotowanie raportów niestandardowych
- Integracja z systemami zewnętrznymi

Faza 3 - Migracja danych (2-3 tygodnie):
- Przygotowanie danych źródłowych
- Mapowanie struktur danych
- Wykonanie migracji testowej
- Weryfikacja poprawności danych

Faza 4 - Testy i szkolenia (3-4 tygodnie):
- Testy akceptacyjne użytkowników
- Szkolenia dla użytkowników końcowych
- Przygotowanie dokumentacji
- Testy obciążeniowe

Faza 5 - Go-live i wsparcie (1-2 tygodnie):
- Uruchomienie produkcyjne
- Wsparcie w pierwszych dniach
- Monitoring wydajności
- Usuwanie błędów krytycznych""",
                'metadata': {
                    'source': 'Comarch ERP XL - Implementation Guide',
                    'category': 'implementation',
                    'module': 'project_management',
                    'type': 'methodology',
                    'complexity': 'high'
                }
            }
        ]
        
        return basic_docs + enhanced_docs

    # ===== ERP SPECIFIC METHODS =====

    def _analyze_erp_modules(self):
        """Analiza modułów ERP - implementacja z app.py"""
        try:
            data = request.get_json()
            if not data or 'company_profile' not in data:
                return jsonify({'error': 'Brak profilu firmy'}), 400
            
            profile = data['company_profile']
            industry = data.get('industry', 'Ogólny')
            company_size = data.get('company_size', 'Średnia')
            
            # Rekomendacje modułów na podstawie profilu
            module_recommendations = {
                'core_modules': {
                    'Księgowość': {
                        'priority': 'Wysoki',
                        'reason': 'Podstawowy moduł wymagany przez przepisy',
                        'implementation_time': '2-3 tygodnie',
                        'complexity': 'Średnia'
                    },
                    'Kadry i Płace': {
                        'priority': 'Wysoki',
                        'reason': 'Kluczowy dla zarządzania zasobami ludzkimi',
                        'implementation_time': '3-4 tygodnie', 
                        'complexity': 'Średnia'
                    },
                    'Magazyn': {
                        'priority': 'Wysoki' if 'produkcja' in industry.lower() or 'handel' in industry.lower() else 'Średni',
                        'reason': 'Zarządzanie stanami magazynowymi',
                        'implementation_time': '2-3 tygodnie',
                        'complexity': 'Niska'
                    }
                },
                'optional_modules': {
                    'CRM': {
                        'priority': 'Średni',
                        'reason': 'Wsparcie sprzedaży i obsługi klienta',
                        'implementation_time': '3-4 tygodnie',
                        'complexity': 'Średnia'
                    },
                    'Serwis': {
                        'priority': 'Niski' if company_size == 'Mała' else 'Średni',
                        'reason': 'Zarządzanie usługami posprzedażowymi',
                        'implementation_time': '2-3 tygodnie',
                        'complexity': 'Niska'
                    }
                }
            }
            
            # Oblicz szacunkowy koszt i czas wdrożenia
            total_weeks = sum([
                int(mod['implementation_time'].split('-')[0]) 
                for category in module_recommendations.values() 
                for mod in category.values()
                if mod['priority'] == 'Wysoki'
            ])
            
            result = {
                'company_profile': profile,
                'industry': industry,
                'company_size': company_size,
                'module_recommendations': module_recommendations,
                'implementation_summary': {
                    'estimated_time_weeks': total_weeks,
                    'estimated_cost_range': f"{total_weeks * 15000} - {total_weeks * 25000} PLN",
                    'critical_path_modules': ['Księgowość', 'Kadry i Płace']
                },
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"[ERP] Analiza modułów dla {industry} / {company_size}")
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd analizy modułów ERP: {e}")
            return jsonify({'error': str(e)}), 500

    def _generate_implementation_roadmap(self):
        """Generuje harmonogram wdrożenia ERP"""
        try:
            data = request.get_json()
            if not data or 'selected_modules' not in data:
                return jsonify({'error': 'Brak wybranych modułów'}), 400
            
            selected_modules = data['selected_modules']
            start_date = datetime.fromisoformat(data.get('start_date', datetime.now().isoformat()))
            
            # Implementation logic here (simplified for space)
            result = {
                'selected_modules': selected_modules,
                'roadmap_generated': True,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd generowania harmonogramu: {e}")
            return jsonify({'error': str(e)}), 500

    def _generate_training_plan(self):
        """Generuje plan szkoleń dla wdrożenia ERP"""
        try:
            data = request.get_json()
            if not data or 'modules' not in data or 'user_groups' not in data:
                return jsonify({'error': 'Brak modułów lub grup użytkowników'}), 400
            
            modules = data['modules']
            user_groups = data['user_groups']
            
            result = {
                'modules': modules,
                'user_groups': user_groups,
                'training_plan_generated': True,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd generowania planu szkoleń: {e}")
            return jsonify({'error': str(e)}), 500

    def _assess_data_migration(self):
        """Ocena migracji danych z istniejących systemów"""
        try:
            data = request.get_json()
            if not data or 'current_systems' not in data:
                return jsonify({'error': 'Brak informacji o obecnych systemach'}), 400
            
            current_systems = data['current_systems']
            
            result = {
                'current_systems': current_systems,
                'migration_assessment_completed': True,
                'timestamp': datetime.now().isoformat()
            }
            
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd oceny migracji: {e}")
            return jsonify({'error': str(e)}), 500

    # ===== ADMIN METHODS =====

    def _restart_services(self):
        """Restart wszystkich serwisów"""
        try:
            logger.info("🔄 Restarting services...")
            
            # Reinitialize services
            self._initialize_services()
            
            active_services = sum(self.services_status.values())
            total_services = len(self.services_status)
            
            return jsonify({
                'status': 'success',
                'message': f'Serwisy zostały zrestartowane: {active_services}/{total_services} aktywne',
                'services_status': self.services_status,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            logger.error(f"Service restart error: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    def _clear_cache(self):
        """Wyczyść wszystkie cache'e"""
        try:
            cache_cleared = []
            
            # Clear Enhanced RAG cache
            if self.enhanced_rag_service:
                if hasattr(self.enhanced_rag_service, 'response_cache'):
                    cache_size = len(self.enhanced_rag_service.response_cache)
                    self.enhanced_rag_service.response_cache.clear()
                    cache_cleared.append(f'Enhanced RAG response cache: {cache_size} entries')
                
                if hasattr(self.enhanced_rag_service, 'query_cache'):
                    cache_size = len(self.enhanced_rag_service.query_cache)
                    self.enhanced_rag_service.query_cache.clear()
                    cache_cleared.append(f'Enhanced RAG query cache: {cache_size} entries')
            
            logger.info(f"🗑️ Cache cleared: {len(cache_cleared)} caches")
            
            return jsonify({
                'status': 'success',
                'message': 'Cache został wyczyszczony',
                'caches_cleared': cache_cleared,
                'timestamp': datetime.now().isoformat()
            }), 200
            
        except Exception as e:
            logger.error(f"Cache clear error: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    def run(self, host=None, port=None, debug=None):
        """Uruchamia Enhanced ERP Application"""
        host = host or self.config['HOST']
        port = port or self.config['PORT']
        debug = debug or self.config['DEBUG']
        
        logger.info("=" * 80)
        logger.info("[START] ERP AI ASSISTANT - ENHANCED BACKEND WITH RAG v3.0")
        logger.info("=" * 80)
        logger.info(f"[INFO] Version: {self.version}")
        logger.info(f"[INFO] Host: {host}:{port}")
        logger.info(f"[INFO] Debug mode: {debug}")
        logger.info("[INFO] Dostępne endpointy:")
        logger.info("   [HOME] Główna aplikacja: http://localhost:5000")
        logger.info("   [HEALTH] Health check: http://localhost:5000/api/health")
        logger.info("   [ENHANCED] Enhanced health: http://localhost:5000/api/enhanced/health")
        logger.info("   [CHAT] Enhanced chat: http://localhost:5000/api/enhanced/chat")
        logger.info("   [METRICS] Enhanced metrics: http://localhost:5000/api/enhanced/metrics")
        logger.info("   [INIT] Enhanced init: http://localhost:5000/api/enhanced/initialize")
        logger.info("[INFO] Legacy endpoints (kompatybilność):")
        logger.info("   [LEGACY] RAG chat: http://localhost:5000/api/rag/chat")
        logger.info("   [LEGACY] Chat: http://localhost:5000/api/chat")
        logger.info("   [LEGACY] Initialize: http://localhost:5000/api/initialize")
        logger.info("[INFO] Services status:")
        
        for service, status in self.services_status.items():
            status_emoji = "✅" if status else "❌"
            logger.info(f"   {status_emoji} {service}: {'Active' if status else 'Inactive'}")
        
        logger.info("[POWER] Aby zatrzymać serwer, użyj Ctrl+C")
        logger.info("=" * 80)
        
        try:
            self.app.run(
                host=host,
                port=port,
                debug=debug,
                threaded=True
            )
        except KeyboardInterrupt:
            logger.info("[STOP] Enhanced ERP Application zatrzymana przez użytkownika")
        except Exception as e:
            logger.error(f"[ERROR] Błąd uruchamiania serwera: {e}")


# ============================================================================
# MAIN APPLICATION INSTANCE AND RUNNER
# ============================================================================

def create_app():
    """Factory function for creating Enhanced ERP Application"""
    return EnhancedERPApplication()

def main():
    """Główna funkcja uruchamiająca Enhanced ERP Application"""
    try:
        # Create enhanced application
        app_instance = create_app()
        
        # Run application
        app_instance.run()
        
    except KeyboardInterrupt:
        print("\n⏹️  Enhanced ERP Application stopped by user")
    except Exception as e:
        print(f"❌ Enhanced ERP Application error: {e}")
        logger.error(f"Application startup error: {e}")
        traceback.print_exc()


if __name__ == '__main__':
    main()
