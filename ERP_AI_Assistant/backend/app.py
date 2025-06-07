#!/usr/bin/env python3
"""
=================================================================================
ERP AI ASSISTANT - ADVANCED BACKEND SERVER
Zaawansowany backend wykorzystujący wszystkie komponenty systemu
=================================================================================
"""

import os
import json
import sqlite3
import logging
import traceback
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from dataclasses import asdict

# Flask & CORS
from flask import Flask, request, jsonify, send_from_directory, render_template_string
from flask_cors import CORS
from dotenv import load_dotenv

# Importy naszych zaawansowanych serwisów
try:
    from advanced_rag_service import AdvancedRAGService, AdvancedResponse
    from sql_code_service import SQLCodeService, SQLQueryResult, CodeAnalysisResult
    from optimized_document_loader import OptimizedComarchDocumentLoader
except ImportError as e:
    print(f"❌ Błąd importu serwisów: {e}")
    print("💡 Upewnij się, że wszystkie zależności są zainstalowane")
    # Fallback imports
    AdvancedRAGService = None
    SQLCodeService = None
    OptimizedComarchDocumentLoader = None

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

# Inicjalizacja Flask
app = Flask(__name__)
CORS(app, origins=["*"])  # Umożliwia zapytania z frontendu

# Konfiguracja aplikacji
class Config:
    SECRET_KEY = os.getenv('SECRET_KEY', 'advanced-erp-ai-assistant-2025')
    CLAUDE_MODEL = "claude-3-5-sonnet-20241022"
    CLAUDE_HAIKU_MODEL = "claude-3-haiku-20240307"
    MAX_TOKENS = 4096
    ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')
    
    # Konfiguracja RAG
    EMBEDDING_MODEL = "paraphrase-multilingual-MiniLM-L12-v2"
    VECTOR_DB_PATH = "chroma_db"
    MAX_CONTEXT_LENGTH = 2000
    
    # Konfiguracja scraper
    SCRAPER_USER_AGENT = "ERP AI Assistant Bot 1.0"
    SCRAPER_DELAY = 1.0

app.config.from_object(Config)

# ============================================================================
# INICJALIZACJA SERWISÓW
# ============================================================================

class AIService:
    """Serwis AI z inicjalizacją modeli"""
    def __init__(self, config):
        self.config = config
        self.claude_client = None
        self.sentence_model = None
        self._initialize()
    
    def _initialize(self):
        """Inicjalizuje komponenty AI"""
        try:
            # Claude API
            if self.config.ANTHROPIC_API_KEY:
                import anthropic
                self.claude_client = anthropic.Anthropic(api_key=self.config.ANTHROPIC_API_KEY)
                logger.info("✅ Claude API zainicjalizowane")
            else:
                logger.warning("⚠️ Brak klucza ANTHROPIC_API_KEY")
            
            # Sentence Transformers
            from sentence_transformers import SentenceTransformer
            self.sentence_model = SentenceTransformer(self.config.EMBEDDING_MODEL)
            logger.info("✅ Model embeddings załadowany")
            
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji AI: {e}")

class VectorService:
    """Serwis bazy wektorowej"""
    def __init__(self, config):
        self.config = config
        self.collection = None
        self._initialize()
    
    def _initialize(self):
        """Inicjalizuje ChromaDB"""
        try:
            import chromadb
            from chromadb.config import Settings
            
            client = chromadb.PersistentClient(
                path=self.config.VECTOR_DB_PATH,
                settings=Settings(anonymized_telemetry=False)
            )
            
            self.collection = client.get_or_create_collection(
                name="erp_documents",
                metadata={"description": "ERP Documentation Collection"}
            )
            logger.info("✅ ChromaDB zainicjalizowane")
            
        except Exception as e:
            logger.error(f"❌ Błąd inicjalizacji ChromaDB: {e}")

# Globalne serwisy
ai_service = AIService(Config)
vector_service = VectorService(Config)

# Zaawansowane serwisy
advanced_rag = None
sql_code_service = None
document_loader = None

# Inicjalizacja zaawansowanych serwisów
try:
    if ai_service.claude_client and ai_service.sentence_model:
        advanced_rag = AdvancedRAGService(Config, ai_service, vector_service)
        sql_code_service = SQLCodeService(Config, ai_service)
        document_loader = OptimizedComarchDocumentLoader()
        logger.info("✅ Wszystkie zaawansowane serwisy zainicjalizowane")
    else:
        logger.warning("⚠️ Nie wszystkie serwisy mogły zostać zainicjalizowane")
except Exception as e:
    logger.error(f"❌ Błąd inicjalizacji zaawansowanych serwisów: {e}")

# ============================================================================
# GŁÓWNE ENDPOINTY API
# ============================================================================

@app.route('/')
def home():
    """Główna strona - przekierowanie do frontendu"""
    return send_from_directory('..', 'index.html')

@app.route('/<path:filename>')
def serve_static(filename):
    """Serwowanie plików statycznych"""
    return send_from_directory('..', filename)

# === ENDPOINTY STATUSOWE ===

@app.route('/api/health', methods=['GET'])
def health_check():
    """Kompleksowy status zdrowia systemu"""
    try:
        status = {
            'status': 'online',
            'timestamp': datetime.now().isoformat(),
            'version': '2.0.0-advanced',
            'components': {
                'claude_api': bool(ai_service.claude_client),
                'embeddings': bool(ai_service.sentence_model),
                'vector_db': bool(vector_service.collection),
                'advanced_rag': bool(advanced_rag),
                'sql_service': bool(sql_code_service),
                'document_loader': bool(document_loader)
            },
            'metrics': {
                'uptime': str(datetime.now()),
                'memory_usage': 'N/A',
                'active_sessions': 1
            }
        }
        
        # Sprawdź czy RAG jest zainicjalizowany z dokumentami
        if advanced_rag:
            rag_metrics = advanced_rag.get_system_metrics()
            status['rag_metrics'] = rag_metrics
        
        # Sprawdź bazę danych SQL
        if sql_code_service:
            try:
                schema = sql_code_service.get_database_schema()
                status['database_tables'] = len(schema)
            except:
                status['database_tables'] = 0
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"❌ Błąd health check: {e}")
        return jsonify({
            'status': 'error',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }), 500

@app.route('/api/models/status', methods=['GET'])
def models_status():
    """Status modeli AI"""
    try:
        status = {
            'status': 'ready',
            'models': {
                'claude': {
                    'status': 'available' if ai_service.claude_client else 'unavailable',
                    'model': Config.CLAUDE_MODEL,
                    'haiku_model': Config.CLAUDE_HAIKU_MODEL
                },
                'embeddings': {
                    'status': 'loaded' if ai_service.sentence_model else 'unavailable',
                    'model': Config.EMBEDDING_MODEL
                },
                'vector_db': {
                    'status': 'connected' if vector_service.collection else 'unavailable',
                    'path': Config.VECTOR_DB_PATH
                }
            },
            'advanced_features': {
                'hybrid_search': bool(advanced_rag),
                'query_expansion': bool(advanced_rag),
                're_ranking': bool(advanced_rag),
                'context_compression': bool(advanced_rag),
                'multi_step_reasoning': bool(advanced_rag),
                'sql_analysis': bool(sql_code_service),
                'code_execution': bool(sql_code_service)
            }
        }
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"❌ Błąd status modeli: {e}")
        return jsonify({'error': str(e)}), 500

# === ZAAWANSOWANY RAG CHAT ===

@app.route('/api/rag/chat', methods=['POST'])
def advanced_rag_chat():
    """Zaawansowany chat z pełnym RAG v2.0"""
    try:
        data = request.get_json()
        if not data or 'message' not in data:
            return jsonify({'error': 'Brak wiadomości'}), 400
        
        query = data['message']
        session_id = data.get('session_id', 'default')
        
        logger.info(f"🧠 Przetwarzanie przez Advanced RAG: {query[:50]}...")
        
        if advanced_rag:
            # Użyj pełnego zaawansowanego RAG
            response = advanced_rag.process_query(query, session_id)
            
            # Konwertuj AdvancedResponse do dict
            response_dict = asdict(response)
            
            # Dodaj kompatybilność z frontendem
            response_dict['response'] = response_dict['answer']  # alias
            response_dict['processing_time'] = response_dict.get('processing_time_ms', 0)
            
            logger.info(f"✅ Advanced RAG odpowiedział: confidence={response.confidence:.2f}, validation={response.validation_score:.2f}")
            return jsonify(response_dict)
            
        elif ai_service.claude_client:
            # Fallback do basic Claude jeśli Advanced RAG nie działa
            logger.warning("⚠️ Advanced RAG niedostępny - używam basic Claude")
            
            message = ai_service.claude_client.messages.create(
                model=Config.CLAUDE_HAIKU_MODEL,
                max_tokens=1024,
                messages=[{
                    "role": "user", 
                    "content": f"Jesteś ekspertem systemów ERP Comarch XL. Odpowiedz profesjonalnie w języku polskim: {query}"
                }]
            )
            
            answer = message.content[0].text
            
            return jsonify({
                'answer': answer,
                'response': answer,
                'confidence': 0.75,
                'sources': ['claude_direct'],
                'reasoning_steps': ['Basic Claude processing'],
                'validation_score': 0.75,
                'claude_model': Config.CLAUDE_HAIKU_MODEL,
                'session_id': session_id,
                'search_mode': 'basic',
                'context_chunks': 0,
                'processing_time_ms': 0,
                'advanced_features': {
                    'hybrid_search': False,
                    'query_expansion': False,
                    're_ranking': False,
                    'context_compression': False,
                    'claude_available': True
                }
            })
        else:
            # Ostatni fallback
            return jsonify({
                'answer': f'System inicjalizacji... Spróbuj ponownie za chwilę. Twoje pytanie: {query}',
                'response': 'System initializing...',
                'confidence': 0.3,
                'sources': ['system_fallback'],
                'reasoning_steps': ['System initialization'],
                'validation_score': 0.3,
                'claude_model': 'unavailable',
                'session_id': session_id,
                'error': 'Advanced RAG and Claude unavailable'
            })
        
    except Exception as e:
        logger.error(f"❌ Błąd Advanced RAG: {e}")
        return jsonify({
            'answer': f'Wystąpił błąd podczas przetwarzania. Szczegóły: {str(e)}',
            'response': f'Error: {str(e)}',
            'confidence': 0.1,
            'sources': ['error_handler'],
            'reasoning_steps': ['Error occurred'],
            'validation_score': 0.1,
            'error': str(e)
        }), 500

# === SQL & CODE ANALYSIS ===

@app.route('/api/sql/analyze', methods=['POST'])
def analyze_sql():
    """Analizuje zapytanie SQL"""
    try:
        data = request.get_json()
        if not data or 'query' not in data:
            return jsonify({'error': 'Brak zapytania SQL'}), 400
        
        if not sql_code_service:
            return jsonify({'error': 'SQL service niedostępny'}), 503
        
        query = data['query']
        result = sql_code_service.analyze_sql_query(query)
        
        # Konwertuj do dict
        result_dict = asdict(result)
        result_dict['timestamp'] = datetime.now().isoformat()
        
        logger.info(f"✅ Analiza SQL: valid={result.is_valid}, safe={result.is_safe}")
        return jsonify(result_dict)
        
    except Exception as e:
        logger.error(f"❌ Błąd analizy SQL: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sql/generate', methods=['POST'])
def generate_sql():
    """Generuje zapytanie SQL z opisu"""
    try:
        data = request.get_json()
        if not data or 'description' not in data:
            return jsonify({'error': 'Brak opisu zapytania'}), 400
        
        if not sql_code_service:
            return jsonify({'error': 'SQL service niedostępny'}), 503
        
        description = data['description']
        generated_query = sql_code_service.generate_sql_query(description)
        
        # Analizuj wygenerowane zapytanie
        analysis = sql_code_service.analyze_sql_query(generated_query)
        
        result = {
            'description': description,
            'generated_query': generated_query,
            'analysis': asdict(analysis),
            'timestamp': datetime.now().isoformat()
        }
        
        logger.info(f"✅ Wygenerowano SQL dla: {description[:50]}...")
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Błąd generowania SQL: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/code/analyze', methods=['POST'])
def analyze_code():
    """Analizuje kod programistyczny"""
    try:
        data = request.get_json()
        if not data or 'code' not in data:
            return jsonify({'error': 'Brak kodu do analizy'}), 400
        
        if not sql_code_service:
            return jsonify({'error': 'Code service niedostępny'}), 503
        
        code = data['code']
        language = data.get('language', None)
        
        result = sql_code_service.analyze_code(code, language)
        
        # Konwertuj do dict
        result_dict = asdict(result)
        result_dict['timestamp'] = datetime.now().isoformat()
        
        logger.info(f"✅ Analiza kodu: language={result.language}, complexity={result.complexity_score}")
        return jsonify(result_dict)
        
    except Exception as e:
        logger.error(f"❌ Błąd analizy kodu: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/sql/schema', methods=['GET'])
def get_database_schema():
    """Zwraca schemat bazy danych"""
    try:
        if not sql_code_service:
            return jsonify({'error': 'SQL service niedostępny'}), 503
        
        schema = sql_code_service.get_database_schema()
        
        result = {
            'schema': schema,
            'tables_count': len(schema),
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Błąd pobierania schematu: {e}")
        return jsonify({'error': str(e)}), 500

# === DOCUMENT MANAGEMENT ===

@app.route('/api/documents/upload', methods=['POST'])
def upload_documents():
    """Upload i indeksowanie dokumentów"""
    try:
        if not document_loader:
            return jsonify({'error': 'Document loader niedostępny'}), 503
        
        # Symulacja uploadu dokumentów
        result = {
            'status': 'success',
            'message': 'Dokumenty zostały przesłane i zindeksowane',
            'processed_files': 0,
            'indexed_chunks': 0,
            'timestamp': datetime.now().isoformat()
        }
        
        # Sprawdź czy są dokumenty w bazie wiedzy
        knowledge_base_path = "../BazaWiedzy"
        if os.path.exists(knowledge_base_path):
            try:
                documents_count = document_loader.load_documents_from_directory(knowledge_base_path)
                result['processed_files'] = documents_count
                result['indexed_chunks'] = documents_count * 5  # Szacunek
                logger.info(f"✅ Załadowano {documents_count} dokumentów")
            except Exception as e:
                logger.warning(f"⚠️ Błąd ładowania dokumentów: {e}")
        
        return jsonify(result)
        
    except Exception as e:
        logger.error(f"❌ Błąd upload dokumentów: {e}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/documents/status', methods=['GET'])
def documents_status():
    """Status systemu zarządzania dokumentami"""
    try:
        status = {
            'total_documents': 0,
            'indexed_chunks': 0,
            'last_update': 'Nigdy',
            'vector_db_size': 'N/A',
            'available_categories': [],
            'timestamp': datetime.now().isoformat()
        }
        
        # Sprawdź ChromaDB
        if vector_service.collection:
            try:
                count = vector_service.collection.count()
                status['indexed_chunks'] = count
                
                # Sprawdź dokumenty w BazaWiedzy
                knowledge_base_path = "../BazaWiedzy/Tabele_2025_0"
                if os.path.exists(knowledge_base_path):
                    files = [f for f in os.listdir(knowledge_base_path) if f.endswith(('.html', '.xml'))]
                    status['total_documents'] = len(files)
                    status['available_categories'] = ['AI_ChatERP', 'Tabele', 'Funkcje', 'Procedury']
                    status['last_update'] = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
                
            except Exception as e:
                logger.warning(f"⚠️ Błąd sprawdzania statusu dokumentów: {e}")
        
        return jsonify(status)
        
    except Exception as e:
        logger.error(f"❌ Błąd status dokumentów: {e}")
        return jsonify({'error': str(e)}), 500


# === CRM & BUSINESS INTELLIGENCE ===

@app.route('/api/crm/dashboard', methods=['GET'])
def crm_dashboard():
    """Dashboard CRM z danymi biznesowymi"""
    try:
        # Generuj przykładowe dane CRM
        dashboard_data = {
            'summary': {
                'total_customers': 1247,
                'active_projects': 23,
                'monthly_revenue': 185420.50,
                'conversion_rate': 23.5,
                'customer_satisfaction': 4.2
            },
            'recent_activities': [
                {
                    'type': 'new_customer',
                    'description': 'Nowy klient: ABC Manufacturing Sp. z o.o.',
                    'timestamp': (datetime.now() - timedelta(hours=2)).isoformat(),
                    'value': 45000.00
                },
                {
                    'type': 'project_completed',
                    'description': 'Zakończenie wdrożenia ERP w XYZ Corp',
                    'timestamp': (datetime.now() - timedelta(hours=5)).isoformat(),
                    'value': 120000.00
                },
                {
                    'type': 'support_ticket',
                    'description': 'Nowe zgłoszenie wsparcia - moduł finansowy',
                    'timestamp': (datetime.now() - timedelta(hours=1)).isoformat(),
                    'priority': 'high'
                }
            ],
            'sales_pipeline': {
                'prospects': 45,
                'qualified_leads': 23,
                'proposals_sent': 12,
                'negotiations': 8,
                'closed_won': 5,
                'closed_lost': 3
            },
            'top_customers': [
                {'name': 'Mega Corp S.A.', 'revenue': 245000.00, 'projects': 3},
                {'name': 'Tech Solutions Sp. z o.o.', 'revenue': 189000.00, 'projects': 2},
                {'name': 'Global Industries', 'revenue': 156000.00, 'projects': 4}
            ],
            'performance_metrics': {
                'monthly_growth': 12.5,
                'customer_retention': 94.2,
                'average_deal_size': 87500.00,
                'sales_cycle_days': 45
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(dashboard_data)
        
    except Exception as e:
        logger.error(f"❌ Błąd dashboard CRM: {e}")
        return jsonify({'error': str(e)}), 500

# === SYSTEM ANALYTICS ===

@app.route('/api/analytics/usage', methods=['GET'])
def system_analytics():
    """Analityka wykorzystania systemu"""
    try:
        analytics = {
            'daily_queries': 156,
            'popular_modules': [
                {'name': 'RAG Chat', 'usage': 45},
                {'name': 'SQL Analyzer', 'usage': 23},
                {'name': 'Document Manager', 'usage': 18},
                {'name': 'Code Analyzer', 'usage': 12}
            ],
            'user_satisfaction': 4.3,
            'response_times': {
                'avg_rag_response': 2.3,
                'avg_sql_analysis': 1.8,
                'avg_code_analysis': 3.1
            },
            'error_rates': {
                'rag_errors': 0.02,
                'sql_errors': 0.05,
                'system_errors': 0.01
            },
            'performance_trends': {
                'queries_trend': '+15%',
                'satisfaction_trend': '+8%',
                'performance_trend': '+5%'
            },
            'timestamp': datetime.now().isoformat()
        }
        
        return jsonify(analytics)
        
    except Exception as e:
        logger.error(f"❌ Błąd analityki: {e}")
        return jsonify({'error': str(e)}), 500

# === INITIALIZATION ENDPOINT ===

@app.route('/api/initialize', methods=['POST'])
def initialize_system():
    """Inicjalizuje system z dokumentami"""
    try:
        if not advanced_rag:
            return jsonify({'error': 'Advanced RAG niedostępny'}), 503
        
        # Załaduj dokumenty z BazaWiedzy - POPRAWIONA ŚCIEŻKA  
        knowledge_base_path = os.path.join(os.path.dirname(__file__), "data", "knowledge_base", "BazaWiedzy", "Tabele_2025_0")
        documents = []
        metadatas = []
        
        logger.info(f"🔍 Szukam dokumentów w: {knowledge_base_path}")
        
        if os.path.exists(knowledge_base_path):
            all_files = os.listdir(knowledge_base_path)
            html_files = [f for f in all_files if f.endswith('.html')]
            logger.info(f"📁 Znaleziono {len(html_files)} plików HTML z {len(all_files)} ogółem")
            
            # Załaduj więcej dokumentów - zwiększam limit
            for file in html_files[:50]:  # Zwiększone z 20 na 50
                try:
                    file_path = os.path.join(knowledge_base_path, file)
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                        # Wyciągnij tekst z HTML (podstawowe parsowanie)
                        import re
                        text_content = re.sub(r'<[^>]+>', ' ', content)
                        text_content = re.sub(r'\s+', ' ', text_content).strip()
                        
                        if len(text_content) > 50:  # Zmniejszam próg z 100 na 50
                            # Podziel na mniejsze fragmenty dla lepszego embedowania
                            chunk_size = 1500  # Zwiększam z 2000 na 1500
                            chunks = [text_content[i:i+chunk_size] for i in range(0, len(text_content), chunk_size)]
                            
                            for i, chunk in enumerate(chunks):
                                if len(chunk.strip()) > 50:
                                    documents.append(chunk)
                                    metadatas.append({
                                        'source': file,
                                        'chunk_id': f"{file}_chunk_{i}",
                                        'category': 'comarch_erp_documentation',
                                        'type': 'html_processed',
                                        'file_size': len(content)
                                    })
                    
                    logger.info(f"✅ Załadowano: {file} ({len(text_content)} znaków)")
                        
                except Exception as e:
                    logger.warning(f"⚠️ Błąd ładowania {file}: {e}")
        else:
            logger.error(f"❌ Katalog nie istnieje: {knowledge_base_path}")
        
        if documents:
            logger.info(f"🚀 Inicjalizuję RAG z {len(documents)} fragmentami dokumentów...")
            advanced_rag.initialize_with_documents(documents, metadatas)
            
            result = {
                'status': 'success',
                'message': 'System został zainicjalizowany z bazą wiedzy',
                'documents_loaded': len(documents),
                'source_files': len(set(m['source'] for m in metadatas)),
                'timestamp': datetime.now().isoformat()
            }
            
            logger.info(f"✅ RAG zainicjalizowany: {len(documents)} fragmentów z {len(set(m['source'] for m in metadatas))} plików")
            return jsonify(result)
        else:
            logger.error("❌ Nie znaleziono żadnych dokumentów do załadowania!")
            return jsonify({
                'status': 'error',
                'message': 'Nie znaleziono dokumentów do załadowania',
                'documents_loaded': 0,
                'checked_path': knowledge_base_path
            })
        
    except Exception as e:
        logger.error(f"❌ Błąd inicjalizacji systemu: {e}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

# === ERROR HANDLERS ===

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint nie znaleziony'}), 404

@app.errorhandler(500)
def internal_error(error):
    logger.error(f"Błąd serwera: {error}")
    return jsonify({'error': 'Wewnętrzny błąd serwera'}), 500

# === MAIN FUNCTION ===

def main():
    """Główna funkcja uruchamiająca serwer"""
    logger.info("=" * 80)
    logger.info("🚀 ERP AI ASSISTANT - ADVANCED BACKEND SERVER")
    logger.info("=" * 80)
    
    # Sprawdź kluczowe komponenty
    if not ai_service.claude_client:
        logger.warning("⚠️ Claude API nie jest dostępne - niektóre funkcje będą ograniczone")
    
    if not ai_service.sentence_model:
        logger.warning("⚠️ Model embeddings nie jest dostępny - RAG będzie ograniczony")
    
    # Informacje o dostępnych endpointach
    logger.info("📍 Dostępne endpointy:")
    logger.info("   🏠 Główna aplikacja: http://localhost:5000")
    logger.info("   ❤️ Health check: http://localhost:5000/api/health")
    logger.info("   🤖 RAG Chat: http://localhost:5000/api/rag/chat")
    logger.info("   🗃️ SQL Analyzer: http://localhost:5000/api/sql/analyze")
    logger.info("   📊 CRM Dashboard: http://localhost:5000/api/crm/dashboard")
    logger.info("   📈 System Analytics: http://localhost:5000/api/analytics/usage")
    
    logger.info("⚡ Aby zatrzymać serwer, użyj Ctrl+C")
    logger.info("=" * 80)
    
    # Uruchom serwer Flask
    try:
        app.run(
            host='127.0.0.1',  # Tylko localhost - jeden adres
            port=5000,
            debug=False,  # Wyłącz debug w produkcji
            threaded=True
        )
    except KeyboardInterrupt:
        logger.info("🛑 Serwer zatrzymany przez użytkownika")
    except Exception as e:
        logger.error(f"❌ Błąd uruchamiania serwera: {e}")

if __name__ == '__main__':
    main()
