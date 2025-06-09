#!/usr/bin/env python3
"""
=================================================================================
TEST BIBLIOTEK AI I JAKOŚCI ODPOWIEDZI
Kompleksowy test wszystkich bibliotek AI i jakości generowanych odpowiedzi
=================================================================================
"""

import sys
import os
import importlib
import time
import json
from datetime import datetime
from typing import Dict, List, Tuple, Any

print("🔍 SPRAWDZANIE BIBLIOTEK AI I JAKOŚCI ODPOWIEDZI")
print("=" * 70)

# ================================================================
# 1. TEST IMPORTÓW BIBLIOTEK AI
# ================================================================

required_libraries = {
    # Główne biblioteki AI
    'anthropic': {'version': '0.8.1', 'purpose': 'Claude API - główny model AI'},
    'openai': {'version': '1.3.5', 'purpose': 'OpenAI API (opcjonalnie)', 'optional': True},
    'sentence_transformers': {'version': '2.2.2', 'purpose': 'Embeddings i sentence encoding'},
    'transformers': {'version': '4.36.0', 'purpose': 'Hugging Face transformers', 'optional': True},
    
    # Vector Database
    'chromadb': {'version': '0.4.15', 'purpose': 'Vector database dla RAG'},
    'faiss': {'version': '1.7.4', 'purpose': 'FAISS vector search', 'optional': True},
    
    # ML Support
    'numpy': {'version': '1.24.3', 'purpose': 'Numerical computing'},
    'scikit_learn': {'version': '1.3.2', 'purpose': 'Machine learning utilities'},
    'pandas': {'version': '2.1.4', 'purpose': 'Data processing'},
    
    # NLP Support
    'spacy': {'version': '3.7.2', 'purpose': 'Advanced NLP', 'optional': True},
    
    # Web Framework
    'flask': {'version': '3.0.0', 'purpose': 'Web framework'},
    'fastapi': {'version': '0.104.1', 'purpose': 'Modern API framework', 'optional': True},
    
    # Document Processing
    'pypdf2': {'version': '3.0.1', 'purpose': 'PDF processing', 'optional': True},
    'beautifulsoup4': {'version': '4.12.2', 'purpose': 'Web scraping'},
    
    # Utilities
    'requests': {'version': '2.31.0', 'purpose': 'HTTP requests'},
    'python_dotenv': {'version': '1.0.0', 'purpose': 'Environment variables'},
}

def test_library_imports():
    """Test importów wszystkich bibliotek"""
    print("\n📚 TESTOWANIE IMPORTÓW BIBLIOTEK AI:")
    print("-" * 50)
    
    results = {'success': [], 'failed': [], 'optional_missing': []}
    
    for lib_name, info in required_libraries.items():
        try:
            # Specjalne przypadki dla importów
            if lib_name == 'scikit_learn':
                import sklearn
                module = sklearn
                actual_name = 'sklearn'
            elif lib_name == 'python_dotenv':
                import dotenv
                module = dotenv
                actual_name = 'dotenv'
            elif lib_name == 'pypdf2':
                import PyPDF2
                module = PyPDF2
                actual_name = 'PyPDF2'
            else:
                module = importlib.import_module(lib_name)
                actual_name = lib_name
            
            # Sprawdź wersję jeśli dostępna
            version = getattr(module, '__version__', 'unknown')
            
            status = "✅"
            results['success'].append(lib_name)
            
            print(f"{status} {actual_name:20} v{version:10} - {info['purpose']}")
            
        except ImportError as e:
            is_optional = info.get('optional', False)
            status = "⚠️" if is_optional else "❌"
            
            if is_optional:
                results['optional_missing'].append(lib_name)
                print(f"{status} {lib_name:20} {'OPTIONAL':10} - {info['purpose']} (opcjonalne)")
            else:
                results['failed'].append(lib_name)
                print(f"{status} {lib_name:20} {'FAILED':10} - {info['purpose']} (WYMAGANE!)")
    
    return results

# ================================================================
# 2. TEST KONFIGURACJI API
# ================================================================

def test_api_configuration():
    """Test konfiguracji API keys"""
    print("\n🔑 TESTOWANIE KONFIGURACJI API:")
    print("-" * 50)
    
    from dotenv import load_dotenv
    load_dotenv()
    
    api_tests = {
        'ANTHROPIC_API_KEY': {'required': True, 'service': 'Claude AI'},
        'OPENAI_API_KEY': {'required': False, 'service': 'OpenAI (opcjonalnie)'},
        'HUGGINGFACE_API_TOKEN': {'required': False, 'service': 'Hugging Face (opcjonalnie)'}
    }
    
    config_results = {'configured': [], 'missing': []}
    
    for key, info in api_tests.items():
        value = os.getenv(key)
        
        if value and len(value) > 10:  # Ma sensowną długość
            status = "✅"
            masked_key = value[:8] + "..." + value[-4:] if len(value) > 12 else value[:8] + "..."
            config_results['configured'].append(key)
            print(f"{status} {key:25} = {masked_key:15} - {info['service']}")
        else:
            status = "⚠️" if not info['required'] else "❌"
            config_results['missing'].append(key)
            print(f"{status} {key:25} = {'BRAK':15} - {info['service']}")
    
    return config_results

# ================================================================
# 3. TEST FUNKCJONALNOŚCI AI
# ================================================================

def test_ai_functionality():
    """Test podstawowej funkcjonalności AI"""
    print("\n🧠 TESTOWANIE FUNKCJONALNOŚCI AI:")
    print("-" * 50)
    
    ai_tests = {}
    
    # Test 1: Sentence Transformers
    try:
        from sentence_transformers import SentenceTransformer
        print("📥 Ładowanie modelu sentence-transformers...")
        
        model = SentenceTransformer('all-MiniLM-L6-v2')
        test_texts = ["Test embeddings", "Drugi tekst testowy"]
        embeddings = model.encode(test_texts)
        
        print(f"✅ Sentence Transformers: {embeddings.shape} embeddings generated")
        ai_tests['sentence_transformers'] = True
        
    except Exception as e:
        print(f"❌ Sentence Transformers failed: {e}")
        ai_tests['sentence_transformers'] = False
    
    # Test 2: ChromaDB
    try:
        import chromadb
        print("📥 Testowanie ChromaDB...")
        
        client = chromadb.Client()
        collection = client.create_collection("test_collection")
        
        collection.add(
            documents=["Test document", "Another test"],
            ids=["1", "2"]
        )
        
        results = collection.query(query_texts=["test"], n_results=1)
        print(f"✅ ChromaDB: {len(results['documents'][0])} documents indexed and searched")
        ai_tests['chromadb'] = True
        
        # Cleanup
        client.delete_collection("test_collection")
        
    except Exception as e:
        print(f"❌ ChromaDB failed: {e}")
        ai_tests['chromadb'] = False
    
    # Test 3: Claude API (jeśli skonfigurowane)
    anthropic_key = os.getenv('ANTHROPIC_API_KEY')
    if anthropic_key:
        try:
            import anthropic
            print("📥 Testowanie Claude API...")
            
            client = anthropic.Anthropic(api_key=anthropic_key)
            
            message = client.messages.create(
                model="claude-3-haiku-20240307",
                max_tokens=50,
                messages=[{"role": "user", "content": "Test: odpowiedz jednym słowem 'działa'"}]
            )
            
            response = message.content[0].text.strip()
            print(f"✅ Claude API: Response = '{response}'")
            ai_tests['claude_api'] = True
            
        except Exception as e:
            print(f"❌ Claude API failed: {e}")
            ai_tests['claude_api'] = False
    else:
        print("⚠️ Claude API: Brak klucza API - pomijam test")
        ai_tests['claude_api'] = 'skipped'
    
    return ai_tests

# ================================================================
# 4. TEST JAKOŚCI RAG
# ================================================================

def test_rag_quality():
    """Test jakości systemu RAG"""
    print("\n🎯 TESTOWANIE JAKOŚCI SYSTEMU RAG:")
    print("-" * 50)
    
    try:
        # Import naszego RAG service
        sys.path.append('/backend')
        from enhanced_rag_service_v3 import EnhancedRAGService
        
        print("📥 Inicjalizacja Enhanced RAG Service...")
        
        # Mock config for testing
        class MockConfig:
            CLAUDE_MODEL = "claude-3-haiku-20240307"
            CLAUDE_HAIKU_MODEL = "claude-3-haiku-20240307"
            MAX_CONTEXT_LENGTH = 3000
        
        # Mock AI service
        class MockAIService:
            def __init__(self):
                import anthropic
                self.claude_client = None
                anthropic_key = os.getenv('ANTHROPIC_API_KEY')
                if anthropic_key:
                    self.claude_client = anthropic.Anthropic(api_key=anthropic_key)
                
                from sentence_transformers import SentenceTransformer
                self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Mock vector service
        class MockVectorService:
            def __init__(self):
                import chromadb
                self.client = chromadb.Client()
                self.collection = self.client.create_collection("test_rag")
                
                # Add test documents
                self.collection.add(
                    documents=[
                        "Comarch ERP XL to zaawansowany system klasy ERP przeznaczony dla średnich i dużych przedsiębiorstw.",
                        "Moduł finansowy w Comarch ERP XL oferuje pełne wsparcie dla księgowości, budżetowania i controllingu.",
                        "Konfiguracja systemu ERP wymaga określenia parametrów podstawowych w panelu administracyjnym.",
                        "Proces wdrożenia ERP składa się z analizy, projektowania, implementacji i testowania rozwiązania."
                    ],
                    metadatas=[
                        {"source": "Comarch_Manual.pdf", "category": "general"},
                        {"source": "Finance_Module.pdf", "category": "finance"},
                        {"source": "Admin_Guide.pdf", "category": "configuration"},
                        {"source": "Implementation_Guide.pdf", "category": "implementation"}
                    ],
                    ids=["doc1", "doc2", "doc3", "doc4"]
                )
        
        # Inicjalizuj RAG service
        config = MockConfig()
        ai_service = MockAIService()
        vector_service = MockVectorService()
        
        rag_service = EnhancedRAGService(config, ai_service, vector_service)
        
        # Test queries
        test_queries = [
            {
                'query': 'Co to jest Comarch ERP XL?',
                'expected_keywords': ['comarch', 'erp', 'system', 'przedsiębiorstw'],
                'category': 'factual'
            },
            {
                'query': 'Jak skonfigurować moduł finansowy?',
                'expected_keywords': ['moduł', 'finansowy', 'konfiguracja'],
                'category': 'configuration'
            },
            {
                'query': 'Jakie są etapy wdrożenia ERP?',
                'expected_keywords': ['wdrożenie', 'etapy', 'proces'],
                'category': 'procedural'
            }
        ]
        
        rag_results = []
        
        for i, test_case in enumerate(test_queries):
            print(f"\n🔍 Test {i+1}: {test_case['query']}")
            
            start_time = time.time()
            response = rag_service.process_query(test_case['query'], f"test_session_{i}")
            processing_time = (time.time() - start_time) * 1000
            
            # Analiza jakości odpowiedzi
            answer_lower = response.answer.lower()
            keywords_found = sum(1 for keyword in test_case['expected_keywords'] if keyword in answer_lower)
            keyword_score = keywords_found / len(test_case['expected_keywords'])
            
            result = {
                'query': test_case['query'],
                'category': test_case['category'],
                'confidence': response.confidence,
                'keyword_score': keyword_score,
                'processing_time': processing_time,
                'sources_count': len(response.sources),
                'answer_length': len(response.answer),
                'validation_score': response.validation_score
            }
            
            rag_results.append(result)
            
            print(f"   📊 Confidence: {response.confidence:.2f}")
            print(f"   📊 Keyword Match: {keyword_score:.2f}")
            print(f"   📊 Validation: {response.validation_score:.2f}")
            print(f"   📊 Sources: {len(response.sources)}")
            print(f"   ⏱️ Time: {processing_time:.0f}ms")
            
            # Pokaż fragment odpowiedzi
            preview = response.answer[:150] + "..." if len(response.answer) > 150 else response.answer
            print(f"   💬 Odpowiedź: {preview}")
        
        # Cleanup
        vector_service.client.delete_collection("test_rag")
        
        return rag_results
        
    except Exception as e:
        print(f"❌ RAG Quality Test failed: {e}")
        import traceback
        traceback.print_exc()
        return []

# ================================================================
# 5. GŁÓWNA FUNKCJA TESTUJĄCA
# ================================================================

def main():
    """Główna funkcja testująca"""
    start_time = time.time()
    
    print(f"🚀 Start: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # 1. Test importów
    import_results = test_library_imports()
    
    # 2. Test konfiguracji
    config_results = test_api_configuration()
    
    # 3. Test funkcjonalności AI
    ai_results = test_ai_functionality()
    
    # 4. Test jakości RAG (tylko jeśli podstawowe biblioteki działają)
    rag_results = []
    if (import_results['success'] and 
        'sentence_transformers' in import_results['success'] and 
        'chromadb' in import_results['success']):
        rag_results = test_rag_quality()
    else:
        print("\n⚠️ Pomijam test RAG - brak wymaganych bibliotek")
    
    # ================================================================
    # PODSUMOWANIE
    # ================================================================
    
    total_time = time.time() - start_time
    
    print("\n" + "=" * 70)
    print("📋 PODSUMOWANIE TESTÓW BIBLIOTEK AI")
    print("=" * 70)
    
    # Biblioteki
    print(f"\n📚 BIBLIOTEKI:")
    print(f"   ✅ Zainstalowane: {len(import_results['success'])}")
    print(f"   ❌ Brakujące (wymagane): {len(import_results['failed'])}")
    print(f"   ⚠️ Brakujące (opcjonalne): {len(import_results['optional_missing'])}")
    
    if import_results['failed']:
        print(f"   🚨 WYMAGANE do instalacji: {', '.join(import_results['failed'])}")
    
    # Konfiguracja
    print(f"\n🔑 KONFIGURACJA API:")
    print(f"   ✅ Skonfigurowane: {len(config_results['configured'])}")
    print(f"   ❌ Brakujące: {len(config_results['missing'])}")
    
    # Funkcjonalność AI
    print(f"\n🧠 FUNKCJONALNOŚĆ AI:")
    for test_name, result in ai_results.items():
        status = "✅" if result is True else "❌" if result is False else "⚠️"
        print(f"   {status} {test_name}")
    
    # Jakość RAG
    if rag_results:
        print(f"\n🎯 JAKOŚĆ RAG:")
        avg_confidence = sum(r['confidence'] for r in rag_results) / len(rag_results)
        avg_keyword = sum(r['keyword_score'] for r in rag_results) / len(rag_results)
        avg_validation = sum(r['validation_score'] for r in rag_results) / len(rag_results)
        avg_time = sum(r['processing_time'] for r in rag_results) / len(rag_results)
        
        print(f"   📊 Średnia confidence: {avg_confidence:.2f}")
        print(f"   📊 Średnie dopasowanie słów kluczowych: {avg_keyword:.2f}")
        print(f"   📊 Średnia walidacja: {avg_validation:.2f}")
        print(f"   ⏱️ Średni czas odpowiedzi: {avg_time:.0f}ms")
    
    # Ogólna ocena systemu
    print(f"\n🏆 OGÓLNA OCENA SYSTEMU:")
    
    critical_libs = ['anthropic', 'sentence_transformers', 'chromadb', 'numpy', 'flask']
    critical_missing = [lib for lib in critical_libs if lib in import_results['failed']]
    
    has_api_key = 'ANTHROPIC_API_KEY' in config_results['configured']
    basic_ai_works = ai_results.get('sentence_transformers', False) and ai_results.get('chromadb', False)
    
    if not critical_missing and has_api_key and basic_ai_works:
        if rag_results and avg_confidence > 0.7:
            grade = "🟢 EXCELLENT - System pełnowartościowy, wysoka jakość odpowiedzi"
        else:
            grade = "🟡 GOOD - System funkcjonalny, można poprawić jakość"
    elif not critical_missing and basic_ai_works:
        grade = "🟡 PARTIAL - Działa bez API, ograniczona funkcjonalność"
    elif critical_missing:
        grade = "🔴 INSUFFICIENT - Brak kluczowych bibliotek"
    else:
        grade = "🟠 UNKNOWN - Nieokreślony stan systemu"
    
    print(f"   {grade}")
    
    # Rekomendacje
    print(f"\n💡 REKOMENDACJE:")
    
    if critical_missing:
        print(f"   1. Zainstaluj brakujące biblioteki: pip install {' '.join(critical_missing)}")
    
    if 'ANTHROPIC_API_KEY' not in config_results['configured']:
        print(f"   2. Skonfiguruj ANTHROPIC_API_KEY w pliku .env")
    
    if rag_results and avg_confidence < 0.7:
        print(f"   3. Popraw jakość bazy wiedzy - dodaj więcej dokumentów")
        print(f"   4. Dostosuj prompty w enhanced_rag_service_v3.py")
    
    if not import_results['optional_missing']:
        print(f"   5. System ma wszystkie biblioteki - można skupić się na optymalizacji")
    
    print(f"\n⏱️ Czas testów: {total_time:.1f}s")
    print(f"🏁 Zakończono: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Zapisz wyniki
    results_summary = {
        'timestamp': datetime.now().isoformat(),
        'import_results': import_results,
        'config_results': config_results,
        'ai_results': ai_results,
        'rag_results': rag_results,
        'total_time': total_time,
        'grade': grade
    }
    
    with open('ai_test_results.json', 'w', encoding='utf-8') as f:
        json.dump(results_summary, f, indent=2, ensure_ascii=False)
    
    print(f"\n💾 Wyniki zapisane w: ai_test_results.json")

if __name__ == "__main__":
    main()
