#!/usr/bin/env python3
"""
=================================================================================
ERP AI ASSISTANT - SMART BACKEND WRAPPER
Automatycznie używa Enhanced RAG v3.0 jeśli dostępny, lub fallback do basic
=================================================================================
"""

import os
import sys
import logging
from pathlib import Path

# Dodaj ścieżkę do current directory
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Konfiguracja logowania
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Próba importu Enhanced Application
try:
    from app_enhanced import EnhancedERPApplication, create_app
    ENHANCED_AVAILABLE = True
    logger.info("✅ Enhanced RAG v3.0 dostępny - przekierowuję do enhanced app")
except ImportError as e:
    logger.warning(f"⚠️ Enhanced RAG v3.0 niedostępny: {e}")
    logger.info("📝 Używam podstawowej wersji aplikacji")
    ENHANCED_AVAILABLE = False

# === SMART WRAPPER LOGIC ===

if ENHANCED_AVAILABLE:
    # Jeśli Enhanced RAG jest dostępny, użyj go
    logger.info("🚀 Uruchamianie Enhanced ERP Application...")
    
    def main():
        """Wrapper function dla Enhanced App"""
        try:
            app_instance = create_app()
            app_instance.run()
        except KeyboardInterrupt:
            logger.info("⏹️ Enhanced ERP Application zatrzymana przez użytkownika")
        except Exception as e:
            logger.error(f"❌ Enhanced ERP Application error: {e}")
    
    # Expose the enhanced app instance for external imports
    try:
        app_instance = create_app()
        app = app_instance.app  # Expose Flask app
        logger.info("✅ Enhanced Flask app instance ready")
    except Exception as e:
        logger.error(f"❌ Error creating enhanced app instance: {e}")
        app = None

else:
    # Fallback do podstawowej wersji
    logger.info("📱 Uruchamianie podstawowej wersji ERP Assistant...")
    
    from flask import Flask, request, jsonify, send_from_directory
    from flask_cors import CORS
    from dotenv import load_dotenv
    from datetime import datetime, timedelta
    
    load_dotenv()
    
    # Podstawowa aplikacja Flask
    app = Flask(__name__)
    CORS(app, origins=["*"])
    
    @app.route('/')
    def home():
        """Główna strona"""
        return send_from_directory('..', 'index.html')

    @app.route('/<path:filename>')
    def serve_static(filename):
        """Serwowanie plików statycznych"""
        return send_from_directory('..', filename)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Status zdrowia systemu - podstawowy"""
        return jsonify({
            'status': 'online',
            'timestamp': datetime.now().isoformat(),
            'version': '2.0.0-basic-fallback',
            'mode': 'basic_fallback',
            'message': 'Enhanced RAG v3.0 niedostępny - podstawowa wersja',
            'erp_features': {
                'module_analysis': True,
                'implementation_roadmap': True,
                'training_planning': True,
                'migration_assessment': True,
                'knowledge_support': False  # Brak Enhanced RAG
            }
        })

    @app.route('/api/chat', methods=['POST'])
    @app.route('/api/rag/chat', methods=['POST']) 
    @app.route('/api/enhanced/chat', methods=['POST'])
    def basic_chat():
        """Podstawowy chat endpoint - fallback"""
        try:
            data = request.get_json()
            message = data.get('message', '') if data else ''
            
            fallback_response = f"""**System Basic Fallback**

**Zapytanie:** {message}

**Status:** Enhanced RAG v3.0 niedostępny

**Aby uzyskać pełną funkcjonalność:**
1. Zainstaluj wymagane biblioteki:
   ```
   pip install anthropic sentence-transformers chromadb
   ```

2. Skonfiguruj klucz API w pliku .env:
   ```
   ANTHROPIC_API_KEY=your_key_here
   ```

3. Uruchom Enhanced version:
   ```
   python start_enhanced.py
   ```

**Dostępne funkcje w trybie basic:**
- Analiza modułów ERP
- Harmonogramy wdrożeń
- Plany szkoleń
- Ocena migracji danych

**Niedostępne w trybie basic:**
- Advanced RAG v3.0
- Inteligentne odpowiedzi AI
- Kontekst konwersacji
- Fact-checking
- Cytowania

*To jest podstawowa wersja fallback. Zainstaluj Enhanced RAG dla pełnej funkcjonalności.*"""

            return jsonify({
                'answer': fallback_response,
                'confidence': 0.3,
                'confidence_level': 'low',
                'sources': [],
                'reasoning_chain': ['Basic fallback mode'],
                'validation_score': 0.0,
                'query_type': 'system_info',
                'response_type': 'fallback',
                'citations': [],
                'fact_check_score': 0.0,
                'relevance_score': 0.3,
                'completeness_score': 0.5,
                'clarity_score': 0.8,
                'models_used': ['basic_fallback'],
                'processing_steps': ['Basic fallback response generated'],
                'context_chunks_used': 0,
                'total_tokens': 0,
                'processing_time_ms': 1.0,
                'suggested_followups': [
                    'Jak zainstalować Enhanced RAG v3.0?',
                    'Jakie są wymagania systemowe?',
                    'Gdzie uzyskać klucz API Claude?'
                ],
                'session_id': 'basic_fallback',
                'timestamp': datetime.now().isoformat(),
                'claude_model': 'basic_fallback',
                'warning': 'Enhanced RAG v3.0 niedostępny - podstawowa wersja'
            }), 200
            
        except Exception as e:
            logger.error(f"Basic chat error: {e}")
            return jsonify({
                'error': f'Błąd podstawowego chatu: {str(e)}',
                'mode': 'basic_fallback'
            }), 500

    @app.route('/api/initialize', methods=['POST'])
    @app.route('/api/enhanced/initialize', methods=['POST'])
    def basic_initialize():
        """Podstawowa inicjalizacja - fallback"""
        return jsonify({
            'status': 'warning',
            'message': 'Enhanced RAG v3.0 niedostępny - brak inicjalizacji AI',
            'documents_loaded': 0,
            'action': 'basic_fallback',
            'recommendation': 'Uruchom: python start_enhanced.py'
        }), 200

    # === ERP SPECIFIC ENDPOINTS (bez zmian) ===
    
    @app.route('/api/erp/modules/analysis', methods=['POST'])
    def analyze_erp_modules():
        """Analiza modułów ERP dla konkretnego wdrożenia"""
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
                'timestamp': datetime.now().isoformat(),
                'mode': 'basic_analysis'
            }
            
            logger.info(f"[ERP] Analiza modułów dla {industry} / {company_size}")
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd analizy modułów ERP: {e}")
            return jsonify({'error': str(e)}), 500

    @app.route('/api/erp/implementation/roadmap', methods=['POST'])
    def generate_implementation_roadmap():
        """Generuje harmonogram wdrożenia ERP"""
        try:
            data = request.get_json()
            if not data or 'selected_modules' not in data:
                return jsonify({'error': 'Brak wybranych modułów'}), 400
            
            selected_modules = data['selected_modules']
            start_date = datetime.fromisoformat(data.get('start_date', datetime.now().isoformat()))
            
            # Definiuj kolejność wdrożenia (dependency graph)
            module_dependencies = {
                'Księgowość': [],
                'Kadry i Płace': ['Księgowość'],
                'Magazyn': ['Księgowość'],
                'CRM': ['Księgowość'],
                'Produkcja': ['Magazyn', 'Księgowość'],
                'Serwis': ['CRM', 'Magazyn']
            }
            
            module_durations = {
                'Księgowość': 21,  # dni
                'Kadry i Płace': 28,
                'Magazyn': 21,
                'CRM': 28,
                'Produkcja': 56,
                'Serwis': 21
            }
            
            # Generuj harmonogram
            roadmap = []
            completed_modules = set()
            current_date = start_date
            phase = 1
            
            while len(completed_modules) < len(selected_modules):
                # Znajdź moduły gotowe do wdrożenia
                ready_modules = [
                    mod for mod in selected_modules 
                    if mod not in completed_modules and 
                    all(dep in completed_modules for dep in module_dependencies.get(mod, []))
                ]
                
                if not ready_modules:
                    break
                
                # Wybierz moduł o najwyższym priorytecie dla tej fazy
                module = ready_modules[0]
                duration = module_durations.get(module, 21)
                
                roadmap.append({
                    'phase': phase,
                    'module': module,
                    'start_date': current_date.strftime('%Y-%m-%d'),
                    'end_date': (current_date + timedelta(days=duration)).strftime('%Y-%m-%d'),
                    'duration_days': duration,
                    'dependencies': module_dependencies.get(module, []),
                    'key_activities': [
                        'Analiza procesów biznesowych',
                        'Konfiguracja systemu',
                        'Migracja danych',
                        'Testy akceptacyjne',
                        'Szkolenia użytkowników',
                        'Go-live'
                    ]
                })
                
                completed_modules.add(module)
                current_date += timedelta(days=duration + 7)  # 1 tydzień przerwy między modułami
                phase += 1
            
            result = {
                'selected_modules': selected_modules,
                'total_phases': len(roadmap),
                'total_duration_days': (current_date - start_date).days if roadmap else 0,
                'roadmap': roadmap,
                'critical_success_factors': [
                    'Zaangażowanie kierownictwa',
                    'Właściwe przygotowanie danych',
                    'Systematyczne szkolenia',
                    'Etapowe testowanie'
                ],
                'timestamp': datetime.now().isoformat(),
                'mode': 'basic_roadmap'
            }
            
            logger.info(f"[ERP] Wygenerowano harmonogram dla {len(selected_modules)} modułów")
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"[ERROR] Błąd generowania harmonogramu: {e}")
            return jsonify({'error': str(e)}), 500

    # === ERROR HANDLERS ===
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({
            'error': 'Endpoint nie znaleziony',
            'mode': 'basic_fallback',
            'timestamp': datetime.now().isoformat()
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Błąd serwera: {error}")
        return jsonify({
            'error': 'Wewnętrzny błąd serwera',
            'mode': 'basic_fallback',
            'timestamp': datetime.now().isoformat()
        }), 500

    def main():
        """Główna funkcja dla basic fallback"""
        logger.info("=" * 80)
        logger.info("[START] ERP AI ASSISTANT - BASIC FALLBACK MODE")
        logger.info("=" * 80)
        logger.info("⚠️  Enhanced RAG v3.0 niedostępny")
        logger.info("🔧 Uruchamianie podstawowej wersji")
        logger.info("[INFO] Dostępne endpointy:")
        logger.info("   [HOME] Główna aplikacja: http://localhost:5000")
        logger.info("   [HEALTH] Health check: http://localhost:5000/api/health")
        logger.info("   [CHAT] Basic chat: http://localhost:5000/api/chat")
        logger.info("   [ERP] Analiza modułów: http://localhost:5000/api/erp/modules/analysis")
        logger.info("   [ERP] Harmonogram: http://localhost:5000/api/erp/implementation/roadmap")
        logger.info("💡 Aby uzyskać Enhanced RAG v3.0:")
        logger.info("   python start_enhanced.py")
        logger.info("[POWER] Aby zatrzymać serwer, użyj Ctrl+C")
        logger.info("=" * 80)
        
        try:
            app.run(
                host='127.0.0.1',
                port=5000,
                debug=False,
                threaded=True
            )
        except KeyboardInterrupt:
            logger.info("[STOP] Basic fallback zatrzymany przez użytkownika")
        except Exception as e:
            logger.error(f"[ERROR] Błąd uruchamiania basic fallback: {e}")

# === UNIVERSAL MAIN ===

if __name__ == '__main__':
    main()
