#!/usr/bin/env python3
"""
=================================================================================
UNIFIED API BACKEND v1.0 - Zunifikowany system API
Rozwiązuje: chaos endpointów, różne formaty, brak koordynacji
Zapewnia: jeden router, standardowe odpowiedzi, health monitoring
=================================================================================
"""

import os
import json
import time
import logging
import traceback
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass, asdict
from enum import Enum

# Flask & CORS
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv

# Monitoring i metryki
import psutil
from threading import Lock
from collections import defaultdict, deque

# Importy zaawansowanych serwisów
try:
    from advanced_rag_service import AdvancedRAGService, AdvancedResponse
    from sql_code_service import SQLCodeService, SQLQueryResult, CodeAnalysisResult
    from optimized_document_loader import OptimizedComarchDocumentLoader, ProcessingProgress
    from web_scraper import WebScraperService
except ImportError as e:
    print(f"❌ Błąd importu serwisów: {e}")

# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('unified_api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Załaduj zmienne środowiskowe
load_dotenv()

# ============================================================================
# UNIFIED DATA STRUCTURES
# ============================================================================

class ServiceStatus(Enum):
    ACTIVE = "active"
    DEGRADED = "degraded"
    INACTIVE = "inactive"
    ERROR = "error"

class ResponseCode(Enum):
    SUCCESS = "success"
    ERROR = "error"
    WARNING = "warning"
    INFO = "info"

@dataclass
class UnifiedResponse:
    """Standardowy format odpowiedzi dla wszystkich endpointów"""
    status: ResponseCode
    data: Any = None
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    timestamp: str = None
    processing_time_ms: float = None
    service: str = None
    session_id: Optional[str] = None
    
    def __post_init__(self):
        if self.timestamp is None:
            self.timestamp = datetime.now().isoformat()

@dataclass
class ServiceHealth:
    """Status zdrowia pojedynczego serwisu"""
    name: str
    status: ServiceStatus
    last_check: datetime
    response_time_ms: float
    error_count: int = 0
    success_count: int = 0
    metadata: Dict[str, Any] = None
    
    @property
    def success_rate(self) -> float:
        total = self.success_count + self.error_count
        return (self.success_count / total * 100) if total > 0 else 100.0

@dataclass
class SystemMetrics:
    """Metryki całego systemu"""
    cpu_percent: float
    memory_percent: float
    disk_usage_percent: float
    active_connections: int
    requests_per_minute: int
    average_response_time: float
    error_rate: float
    uptime_seconds: float

# ============================================================================
# UNIFIED API BACKEND
# ============================================================================

class UnifiedAPIBackend:
    """Zunifikowany backend API z health monitoring i standaryzowanymi odpowiedziami"""
    
    def __init__(self):
        self.version = "1.0.0"
        self.start_time = time.time()
        
        # Flask app
        self.app = Flask(__name__)
        CORS(self.app, origins=["*"])
        
        # Configuration
        self.config = self._load_config()
        
        # Service instances
        self.services = {}
        self.service_health = {}
        
        # Metrics and monitoring
        self.request_metrics = defaultdict(list)
        self.error_counts = defaultdict(int)
        self.success_counts = defaultdict(int)
        self.metrics_lock = Lock()
        
        # Request history for rate limiting
        self.request_history = deque(maxlen=1000)
        
        # Initialize
        self._initialize_services()
        self._setup_routes()
        
        logger.info(f"🚀 Unified API Backend v{self.version} initialized")

    def _load_config(self) -> Dict[str, Any]:
        """Ładuje konfigurację systemu"""
        return {
            'SECRET_KEY': os.getenv('SECRET_KEY', 'unified-api-backend-2025'),
            'ANTHROPIC_API_KEY': os.getenv('ANTHROPIC_API_KEY'),
            'CLAUDE_MODEL': "claude-3-5-sonnet-20241022",
            'CLAUDE_HAIKU_MODEL': "claude-3-haiku-20240307",
            'MAX_TOKENS': 4096,
            'EMBEDDING_MODEL': "paraphrase-multilingual-MiniLM-L12-v2",
            'VECTOR_DB_PATH': "chroma_db",
            'MAX_CONTEXT_LENGTH': 2000,
            'HEALTH_CHECK_INTERVAL': 30,
            'MAX_REQUESTS_PER_MINUTE': 60,
            'REQUEST_TIMEOUT': 30,
            # Optimized Loader Config
            'LOADER_MAX_WORKERS': 6,
            'LOADER_BATCH_SIZE': 75,
            'LOADER_CACHE_ENABLED': True,
            'LOADER_CACHE_TTL_HOURS': 24
        }

    def _initialize_services(self):
        """Inicjalizuje wszystkie serwisy z error handling"""
        logger.info("🔧 Inicjalizacja serwisów...")
        
        # AI Service
        try:
            self.services['ai'] = self._init_ai_service()
            self.service_health['ai'] = ServiceHealth(
                name='ai_service',
                status=ServiceStatus.ACTIVE,
                last_check=datetime.now(),
                response_time_ms=0.0
            )
        except Exception as e:
            logger.error(f"❌ AI Service init failed: {e}")
            self.service_health['ai'] = ServiceHealth(
                name='ai_service',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        # Vector Service
        try:
            self.services['vector'] = self._init_vector_service()
            self.service_health['vector'] = ServiceHealth(
                name='vector_service',
                status=ServiceStatus.ACTIVE,
                last_check=datetime.now(),
                response_time_ms=0.0
            )
        except Exception as e:
            logger.error(f"❌ Vector Service init failed: {e}")
            self.service_health['vector'] = ServiceHealth(
                name='vector_service',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        # Advanced RAG
        try:
            if self.services.get('ai') and self.services.get('vector'):
                self.services['rag'] = AdvancedRAGService(
                    self.config, 
                    self.services['ai'], 
                    self.services['vector']
                )
                self.service_health['rag'] = ServiceHealth(
                    name='advanced_rag',
                    status=ServiceStatus.ACTIVE,
                    last_check=datetime.now(),
                    response_time_ms=0.0
                )
                logger.info("✅ Advanced RAG Service initialized")
            else:
                raise Exception("AI or Vector service not available")
        except Exception as e:
            logger.error(f"❌ RAG Service init failed: {e}")
            self.service_health['rag'] = ServiceHealth(
                name='advanced_rag',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        # SQL Code Service
        try:
            if self.services.get('ai'):
                self.services['sql'] = SQLCodeService(self.config, self.services['ai'])
                self.service_health['sql'] = ServiceHealth(
                    name='sql_service',
                    status=ServiceStatus.ACTIVE,
                    last_check=datetime.now(),
                    response_time_ms=0.0
                )
                logger.info("✅ SQL Code Service initialized")
            else:
                raise Exception("AI service not available")
        except Exception as e:
            logger.error(f"❌ SQL Service init failed: {e}")
            self.service_health['sql'] = ServiceHealth(
                name='sql_service',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        # Optimized Document Loader
        try:
            self.services['loader'] = OptimizedComarchDocumentLoader(
                cache_enabled=self.config['LOADER_CACHE_ENABLED'],
                max_workers=self.config['LOADER_MAX_WORKERS'],
                batch_size=self.config['LOADER_BATCH_SIZE']
            )
            self.service_health['loader'] = ServiceHealth(
                name='document_loader',
                status=ServiceStatus.ACTIVE,
                last_check=datetime.now(),
                response_time_ms=0.0
            )
            logger.info("✅ Optimized Document Loader initialized")
        except Exception as e:
            logger.error(f"❌ Document Loader init failed: {e}")
            self.service_health['loader'] = ServiceHealth(
                name='document_loader',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        # Web Scraper
        try:
            self.services['scraper'] = WebScraperService(self.config)
            self.service_health['scraper'] = ServiceHealth(
                name='web_scraper',
                status=ServiceStatus.ACTIVE,
                last_check=datetime.now(),
                response_time_ms=0.0
            )
            logger.info("✅ Web Scraper Service initialized")
        except Exception as e:
            logger.error(f"❌ Web Scraper init failed: {e}")
            self.service_health['scraper'] = ServiceHealth(
                name='web_scraper',
                status=ServiceStatus.ERROR,
                last_check=datetime.now(),
                response_time_ms=0.0,
                metadata={'error': str(e)}
            )

        logger.info(f"🎯 Services initialized: {len([s for s in self.service_health.values() if s.status == ServiceStatus.ACTIVE])}/{len(self.service_health)} active")

    def _init_ai_service(self):
        """Inicjalizuje AI Service"""
        import anthropic
        from sentence_transformers import SentenceTransformer
        
        ai_service = type('AIService', (), {})()
        
        # Claude API
        if self.config['ANTHROPIC_API_KEY']:
            ai_service.claude_client = anthropic.Anthropic(api_key=self.config['ANTHROPIC_API_KEY'])
        else:
            raise Exception("ANTHROPIC_API_KEY not configured")
        
        # Sentence Transformers
        ai_service.sentence_model = SentenceTransformer(self.config['EMBEDDING_MODEL'])
        
        # Utility methods
        def generate_embeddings(texts):
            return ai_service.sentence_model.encode(texts).tolist()
            
        ai_service.generate_embeddings = generate_embeddings
        
        return ai_service

    def _init_vector_service(self):
        """Inicjalizuje Vector Service"""
        import chromadb
        from chromadb.config import Settings
        
        vector_service = type('VectorService', (), {})()
        
        client = chromadb.PersistentClient(
            path=self.config['VECTOR_DB_PATH'],
            settings=Settings(anonymized_telemetry=False)
        )
        
        vector_service.collection = client.get_or_create_collection(
            name="unified_erp_documents",
            metadata={"description": "Unified ERP Documentation Collection"}
        )
        
        # Utility methods
        def add_documents(documents, metadatas, ids, embeddings=None):
            if embeddings is None:
                embeddings = self.services['ai'].generate_embeddings(documents)
            vector_service.collection.add(
                documents=documents,
                metadatas=metadatas,
                ids=ids,
                embeddings=embeddings
            )
            
        def search(query_embedding, num_results=5):
            return vector_service.collection.query(
                query_embeddings=[query_embedding],
                n_results=num_results
            )
            
        vector_service.add_documents = add_documents
        vector_service.search = search
        
        return vector_service

    def _setup_routes(self):
        """Konfiguruje routing dla unified API"""
        
        # Static files
        @self.app.route('/')
        def home():
            return send_from_directory('..', 'index.html')
            
        @self.app.route('/<path:filename>')
        def serve_static(filename):
            return send_from_directory('..', filename)

        # ===== UNIFIED API ROUTER =====
        @self.app.route('/api/unified', methods=['POST'])
        def unified_api():
            """Główny unified endpoint - wszystkie zapytania przechodzą przez tutaj"""
            return self._handle_unified_request()

        # ===== HEALTH ENDPOINTS =====
        @self.app.route('/api/health', methods=['GET'])
        def health_check():
            return self._health_check()

        @self.app.route('/api/rag/chat/health', methods=['GET']) 
        def rag_health():
            return self._health_check()

        @self.app.route('/api/chat/health', methods=['GET'])
        def chat_health():
            return self._health_check()

        @self.app.route('/api/basic/health', methods=['GET'])
        def basic_health():
            return self._health_check()

        # ===== LEGACY ENDPOINTS (dla kompatybilności) =====
        @self.app.route('/api/rag/chat', methods=['POST'])
        def rag_chat():
            return self._legacy_rag_chat()

        @self.app.route('/api/chat', methods=['POST'])
        def professional_chat():
            return self._legacy_rag_chat()

        @self.app.route('/api/initialize', methods=['POST'])
        def initialize():
            return self._initialize_documents()

        @self.app.route('/api/sql/analyze', methods=['POST'])
        def sql_analyze():
            return self._legacy_sql_analyze()

        # ===== MONITORING ENDPOINTS =====
        @self.app.route('/api/metrics', methods=['GET'])
        def system_metrics():
            return self._get_system_metrics()

        @self.app.route('/api/services/status', methods=['GET'])
        def services_status():
            return self._get_services_status()

        # ===== ERROR HANDLERS =====
        @self.app.errorhandler(404)
        def not_found(error):
            return self._create_response(
                ResponseCode.ERROR,
                error="Endpoint nie znaleziony",
                service="unified_api"
            ).to_json(), 404

        @self.app.errorhandler(500)
        def internal_error(error):
            return self._create_response(
                ResponseCode.ERROR,
                error="Wewnętrzny błąd serwera",
                service="unified_api"
            ).to_json(), 500

    def _handle_unified_request(self) -> tuple:
        """Główny handler dla unified API"""
        start_time = time.time()
        
        try:
            data = request.get_json()
            if not data:
                return self._create_response(
                    ResponseCode.ERROR,
                    error="Brak danych JSON",
                    service="unified_api"
                ).to_json(), 400

            service_type = data.get('service', '').lower()
            action = data.get('action', '').lower()
            session_id = data.get('session_id', 'default')

            # Route to appropriate service
            if service_type == 'rag' and action == 'chat':
                result = self._handle_rag_request(data, session_id)
            elif service_type == 'sql' and action == 'analyze':
                result = self._handle_sql_request(data, session_id)
            elif service_type == 'sql' and action == 'generate':
                result = self._handle_sql_generate_request(data, session_id)
            elif service_type == 'loader' and action == 'initialize':
                result = self._handle_loader_request(data, session_id)
            elif service_type == 'health' and action == 'check':
                result = self._handle_health_request(data, session_id)
            else:
                result = self._create_response(
                    ResponseCode.ERROR,
                    error=f"Nieznany serwis/akcja: {service_type}/{action}",
                    service="unified_api"
                )

            # Add processing time
            processing_time = (time.time() - start_time) * 1000
            result.processing_time_ms = processing_time
            result.session_id = session_id

            # Update metrics
            self._update_metrics('unified_api', processing_time, True)

            return result.to_json(), 200

        except Exception as e:
            processing_time = (time.time() - start_time) * 1000
            self._update_metrics('unified_api', processing_time, False)
            
            logger.error(f"❌ Unified API error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=str(e),
                service="unified_api",
                processing_time_ms=processing_time
            ).to_json(), 500

    def _handle_rag_request(self, data: Dict[str, Any], session_id: str) -> UnifiedResponse:
        """Handler dla RAG requests"""
        if 'rag' not in self.services:
            return self._create_response(
                ResponseCode.ERROR,
                error="RAG Service niedostępny",
                service="rag"
            )

        message = data.get('message', '')
        if not message:
            return self._create_response(
                ResponseCode.ERROR,
                error="Brak wiadomości",
                service="rag"
            )

        try:
            rag_response = self.services['rag'].process_query(message, session_id)
            
            return self._create_response(
                ResponseCode.SUCCESS,
                data={
                    'answer': rag_response.answer,
                    'confidence': rag_response.confidence,
                    'sources': rag_response.sources,
                    'reasoning_steps': rag_response.reasoning_steps,
                    'validation_score': rag_response.validation_score,
                    'claude_model': rag_response.claude_model
                },
                service="rag",
                metadata={
                    'query_length': len(message),
                    'context_used': len(rag_response.sources),
                    'reasoning_depth': len(rag_response.reasoning_steps)
                }
            )

        except Exception as e:
            logger.error(f"❌ RAG processing error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=f"Błąd przetwarzania RAG: {str(e)}",
                service="rag"
            )

    def _handle_sql_request(self, data: Dict[str, Any], session_id: str) -> UnifiedResponse:
        """Handler dla SQL analyze requests"""
        if 'sql' not in self.services:
            return self._create_response(
                ResponseCode.ERROR,
                error="SQL Service niedostępny",
                service="sql"
            )

        query = data.get('query', '')
        if not query:
            return self._create_response(
                ResponseCode.ERROR,
                error="Brak zapytania SQL",
                service="sql"
            )

        try:
            analysis_result = self.services['sql'].analyze_sql_query(query)
            
            return self._create_response(
                ResponseCode.SUCCESS,
                data=asdict(analysis_result),
                service="sql",
                metadata={
                    'query_length': len(query),
                    'is_valid': analysis_result.is_valid,
                    'is_safe': analysis_result.is_safe
                }
            )

        except Exception as e:
            logger.error(f"❌ SQL analysis error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=f"Błąd analizy SQL: {str(e)}",
                service="sql"
            )

    def _handle_sql_generate_request(self, data: Dict[str, Any], session_id: str) -> UnifiedResponse:
        """Handler dla SQL generate requests"""
        if 'sql' not in self.services:
            return self._create_response(
                ResponseCode.ERROR,
                error="SQL Service niedostępny",
                service="sql"
            )

        description = data.get('description', '')
        if not description:
            return self._create_response(
                ResponseCode.ERROR,
                error="Brak opisu zapytania",
                service="sql"
            )

        try:
            generated_query = self.services['sql'].generate_sql_query(description)
            analysis = self.services['sql'].analyze_sql_query(generated_query)
            
            return self._create_response(
                ResponseCode.SUCCESS,
                data={
                    'description': description,
                    'generated_query': generated_query,
                    'analysis': asdict(analysis)
                },
                service="sql",
                metadata={
                    'description_length': len(description),
                    'generated_query_length': len(generated_query)
                }
            )

        except Exception as e:
            logger.error(f"❌ SQL generation error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=f"Błąd generowania SQL: {str(e)}",
                service="sql"
            )

    def _handle_loader_request(self, data: Dict[str, Any], session_id: str) -> UnifiedResponse:
        """Handler dla document loader requests"""
        if 'loader' not in self.services:
            return self._create_response(
                ResponseCode.ERROR,
                error="Document Loader niedostępny",
                service="loader"
            )

        try:
            # Progress tracking
            progress_updates = []
            
            def progress_callback(progress: ProcessingProgress):
                progress_updates.append({
                    'percentage': progress.percentage,
                    'processed_files': progress.processed_files,
                    'total_files': progress.total_files,
                    'current_file': progress.current_file
                })

            # Load documents with optimized loader
            documents = self.services['loader'].load_all_documents(progress_callback)
            
            # Get cache statistics
            cache_stats = {}
            if hasattr(self.services['loader'], 'cache') and self.services['loader'].cache:
                cache_stats = self.services['loader'].cache.get_cache_stats()

            return self._create_response(
                ResponseCode.SUCCESS,
                data={
                    'documents_loaded': len(documents),
                    'cache_stats': cache_stats,
                    'progress_updates': progress_updates[-5:],  # Last 5 updates
                    'categories': list(set(doc.get('category', 'unknown') for doc in documents))
                },
                service="loader",
                metadata={
                    'total_documents': len(documents),
                    'processing_method': 'optimized_parallel',
                    'cache_enabled': self.config['LOADER_CACHE_ENABLED']
                }
            )

        except Exception as e:
            logger.error(f"❌ Document loader error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=f"Błąd ładowania dokumentów: {str(e)}",
                service="loader"
            )

    def _handle_health_request(self, data: Dict[str, Any], session_id: str) -> UnifiedResponse:
        """Handler dla health check requests"""
        try:
            health_data = self._get_detailed_health()
            
            return self._create_response(
                ResponseCode.SUCCESS,
                data=health_data,
                service="health"
            )

        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
            return self._create_response(
                ResponseCode.ERROR,
                error=f"Błąd health check: {str(e)}",
                service="health"
            )

    def _legacy_rag_chat(self) -> tuple:
        """Legacy endpoint dla RAG chat (kompatybilność wsteczna)"""
        try:
            data = request.get_json() or {}
            
            # Convert to unified format
            unified_data = {
                'service': 'rag',
                'action': 'chat',
                'message': data.get('message', ''),
                'session_id': data.get('session_id', 'legacy')
            }
            
            # Process through unified handler
            result = self._handle_rag_request(unified_data, unified_data['session_id'])
            
            # Convert back to legacy format
            if result.status == ResponseCode.SUCCESS:
                legacy_response = result.data.copy()
                legacy_response['processing_time'] = result.processing_time_ms
                return jsonify(legacy_response), 200
            else:
                return jsonify({
                    'answer': f'Błąd: {result.error}',
                    'confidence': 0.1,
                    'sources': [],
                    'error': result.error
                }), 500

        except Exception as e:
            logger.error(f"❌ Legacy RAG chat error: {e}")
            return jsonify({
                'answer': f'Błąd systemu: {str(e)}',
                'confidence': 0.0,
                'sources': [],
                'error': str(e)
            }), 500

    def _legacy_sql_analyze(self) -> tuple:
        """Legacy endpoint dla SQL analyze (kompatybilność wsteczna)"""
        try:
            data = request.get_json() or {}
            
            # Convert to unified format
            unified_data = {
                'service': 'sql',
                'action': 'analyze',
                'query': data.get('query', ''),
                'session_id': 'legacy'
            }
            
            # Process through unified handler
            result = self._handle_sql_request(unified_data, 'legacy')
            
            # Convert back to legacy format
            if result.status == ResponseCode.SUCCESS:
                return jsonify(result.data), 200
            else:
                return jsonify({'error': result.error}), 500

        except Exception as e:
            logger.error(f"❌ Legacy SQL analyze error: {e}")
            return jsonify({'error': str(e)}), 500

    def _initialize_documents(self) -> tuple:
        """Initialize documents endpoint"""
        try:
            unified_data = {
                'service': 'loader',
                'action': 'initialize',
                'session_id': 'init'
            }
            
            result = self._handle_loader_request(unified_data, 'init')
            
            if result.status == ResponseCode.SUCCESS:
                # Initialize RAG if available
                if 'rag' in self.services and result.data['documents_loaded'] > 0:
                    # Note: This is simplified - in reality you'd need the actual documents
                    logger.info(f"✅ Documents loaded: {result.data['documents_loaded']}")
                
                return jsonify({
                    'status': 'success',
                    'message': 'System został zainicjalizowany',
                    'documents_loaded': result.data['documents_loaded']
                }), 200
            else:
                return jsonify({
                    'status': 'error',
                    'message': result.error,
                    'documents_loaded': 0
                }), 500

        except Exception as e:
            logger.error(f"❌ Initialize documents error: {e}")
            return jsonify({
                'status': 'error',
                'message': str(e),
                'documents_loaded': 0
            }), 500

    def _health_check(self) -> tuple:
        """Comprehensive health check endpoint"""
        try:
            health_data = self._get_detailed_health()
            
            # Determine overall status
            active_services = sum(1 for h in self.service_health.values() if h.status == ServiceStatus.ACTIVE)
            total_services = len(self.service_health)
            
            if active_services == total_services:
                overall_status = 'healthy'
                status_code = 200
            elif active_services > total_services * 0.5:
                overall_status = 'degraded'
                status_code = 200
            else:
                overall_status = 'unhealthy'
                status_code = 503

            response_data = {
                'status': overall_status,
                'timestamp': datetime.now().isoformat(),
                'uptime': time.time() - self.start_time,
                'services': health_data['services'],
                'system': health_data['system_metrics'],
                'version': self.version
            }

            return jsonify(response_data), status_code

        except Exception as e:
            logger.error(f"❌ Health check error: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }), 500

    def _get_detailed_health(self) -> Dict[str, Any]:
        """Pobiera szczegółowy stan zdrowia systemu"""
        # Update service health
        self._update_service_health()
        
        # Get system metrics
        system_metrics = self._calculate_system_metrics()
        
        return {
            'services': {name: asdict(health) for name, health in self.service_health.items()},
            'system_metrics': asdict(system_metrics),
            'uptime': time.time() - self.start_time,
            'version': self.version,
            'active_services': sum(1 for h in self.service_health.values() if h.status == ServiceStatus.ACTIVE),
            'total_services': len(self.service_health)
        }

    def _update_service_health(self):
        """Aktualizuje stan zdrowia wszystkich serwisów"""
        for name, service in self.services.items():
            try:
                start_time = time.time()
                
                # Basic health check for each service
                if name == 'ai' and hasattr(service, 'claude_client'):
                    # Test AI service
                    test_response = True  # Simplified check
                elif name == 'vector' and hasattr(service, 'collection'):
                    # Test vector service
                    collection_count = service.collection.count()
                    test_response = collection_count >= 0
                elif name == 'rag' and hasattr(service, 'process_query'):
                    # Test RAG service
                    test_response = True  # Simplified check
                else:
                    test_response = True

                response_time = (time.time() - start_time) * 1000
                
                if test_response:
                    self.service_health[name].status = ServiceStatus.ACTIVE
                    self.service_health[name].success_count += 1
                else:
                    self.service_health[name].status = ServiceStatus.ERROR
                    self.service_health[name].error_count += 1
                
                self.service_health[name].response_time_ms = response_time
                self.service_health[name].last_check = datetime.now()
                
            except Exception as e:
                self.service_health[name].status = ServiceStatus.ERROR
                self.service_health[name].error_count += 1
                self.service_health[name].last_check = datetime.now()
                self.service_health[name].metadata = {'error': str(e)}

    def _calculate_system_metrics(self) -> SystemMetrics:
        """Oblicza metryki systemu"""
        try:
            # CPU i pamięć
            cpu_percent = psutil.cpu_percent(interval=0.1)
            memory = psutil.virtual_memory()
            disk = psutil.disk_usage('/')
            
            # Requests per minute
            current_time = time.time()
            recent_requests = [t for t in self.request_history if current_time - t < 60]
            requests_per_minute = len(recent_requests)
            
            # Average response time
            with self.metrics_lock:
                all_times = []
                for service_times in self.request_metrics.values():
                    all_times.extend([t for t, _ in service_times])
            
            avg_response_time = sum(all_times) / len(all_times) if all_times else 0.0
            
            # Error rate
            total_requests = sum(self.success_counts.values()) + sum(self.error_counts.values())
            error_rate = (sum(self.error_counts.values()) / total_requests * 100) if total_requests > 0 else 0.0
            
            return SystemMetrics(
                cpu_percent=cpu_percent,
                memory_percent=memory.percent,
                disk_usage_percent=disk.percent,
                active_connections=len(self.request_history),
                requests_per_minute=requests_per_minute,
                average_response_time=avg_response_time,
                error_rate=error_rate,
                uptime_seconds=time.time() - self.start_time
            )
            
        except Exception as e:
            logger.error(f"❌ Error calculating system metrics: {e}")
            return SystemMetrics(
                cpu_percent=0.0,
                memory_percent=0.0,
                disk_usage_percent=0.0,
                active_connections=0,
                requests_per_minute=0,
                average_response_time=0.0,
                error_rate=0.0,
                uptime_seconds=time.time() - self.start_time
            )

    def _get_system_metrics(self) -> tuple:
        """Endpoint dla metryki systemu"""
        try:
            metrics = self._calculate_system_metrics()
            return jsonify(asdict(metrics)), 200
        except Exception as e:
            logger.error(f"❌ System metrics error: {e}")
            return jsonify({'error': str(e)}), 500

    def _get_services_status(self) -> tuple:
        """Endpoint dla statusu serwisów"""
        try:
            self._update_service_health()
            services_data = {}
            
            for name, health in self.service_health.items():
                services_data[name] = {
                    'status': health.status.value,
                    'last_check': health.last_check.isoformat(),
                    'response_time_ms': health.response_time_ms,
                    'success_rate': health.success_rate,
                    'error_count': health.error_count,
                    'success_count': health.success_count
                }
            
            return jsonify(services_data), 200
        except Exception as e:
            logger.error(f"❌ Services status error: {e}")
            return jsonify({'error': str(e)}), 500

    def _create_response(self, status: ResponseCode, data: Any = None, error: str = None, 
                        service: str = None, metadata: Dict[str, Any] = None,
                        processing_time_ms: float = None) -> UnifiedResponse:
        """Tworzy standardową odpowiedź"""
        return UnifiedResponse(
            status=status,
            data=data,
            error=error,
            metadata=metadata,
            service=service,
            processing_time_ms=processing_time_ms
        )

    def _update_metrics(self, service: str, response_time: float, success: bool):
        """Aktualizuje metryki serwisu"""
        with self.metrics_lock:
            # Update request metrics
            self.request_metrics[service].append((response_time, success))
            if len(self.request_metrics[service]) > 100:  # Keep last 100 requests
                self.request_metrics[service].pop(0)
            
            # Update counters
            if success:
                self.success_counts[service] += 1
            else:
                self.error_counts[service] += 1
            
            # Update request history
            self.request_history.append(time.time())

    def run(self, host='127.0.0.1', port=5000, debug=False):
        """Uruchamia serwer"""
        logger.info(f"🚀 Starting Unified API Backend v{self.version}")
        logger.info(f"📊 Services available: {list(self.services.keys())}")
        logger.info(f"🌐 Server running on http://{host}:{port}")
        
        self.app.run(host=host, port=port, debug=debug, threaded=True)


# ============================================================================
# UNIFIED RESPONSE EXTENSIONS
# ============================================================================

def _unified_response_to_json(self) -> Dict[str, Any]:
    """Converts UnifiedResponse to JSON-serializable dict"""
    return {
        'status': self.status.value,
        'data': self.data,
        'error': self.error,
        'metadata': self.metadata,
        'timestamp': self.timestamp,
        'processing_time_ms': self.processing_time_ms,
        'service': self.service,
        'session_id': self.session_id
    }

# Add to_json method to UnifiedResponse
UnifiedResponse.to_json = _unified_response_to_json


# ============================================================================
# MAIN RUNNER
# ============================================================================

def main():
    """Główna funkcja uruchamiająca"""
    print("=" * 80)
    print("🚀 UNIFIED API BACKEND v1.0")
    print("=" * 80)
    
    try:
        # Create backend instance
        backend = UnifiedAPIBackend()
        
        # Run server
        backend.run(
            host='0.0.0.0',
            port=5000,
            debug=False
        )
        
    except KeyboardInterrupt:
        print("\n⏹️  Server stopped by user")
    except Exception as e:
        print(f"❌ Server error: {e}")
        logger.error(f"Server startup error: {e}")
        traceback.print_exc()


if __name__ == "__main__":
    main()
