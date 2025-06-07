#!/usr/bin/env python3
"""
Test profesjonalnego RAG z Claude API i bazą wiedzy Comarch ERP
Testuje pełną funkcjonalność zaawansowanego systemu RAG
"""

import requests
import json
import time
from datetime import datetime

# Konfiguracja
API_BASE = "http://localhost:5000"
HEADERS = {"Content-Type": "application/json"}

def test_health_check():
    """Test health check API"""
    print("🔍 Sprawdzam status systemu...")
    
    try:
        response = requests.get(f"{API_BASE}/api/health")
        if response.status_code == 200:
            data = response.json()
            print("✅ System online!")
            print(f"   • Claude API: {'✅' if data['components']['claude_api'] else '❌'}")
            print(f"   • Embeddings: {'✅' if data['components']['embeddings'] else '❌'}")
            print(f"   • Vector DB: {'✅' if data['components']['vector_db'] else '❌'}")
            print(f"   • Advanced RAG: {'✅' if data['components']['advanced_rag'] else '❌'}")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Błąd połączenia: {e}")
        return False

def initialize_system():
    """Inicjalizacja systemu z bazą wiedzy"""
    print("\n🚀 Inicjalizuję system z bazą wiedzy...")
    
    try:
        response = requests.post(f"{API_BASE}/api/initialize", headers=HEADERS)
        if response.status_code == 200:
            data = response.json()
            print(f"✅ System zainicjalizowany!")
            print(f"   • Dokumenty załadowane: {data.get('documents_loaded', 0)}")
            return True
        else:
            print(f"❌ Błąd inicjalizacji: {response.status_code}")
            print(response.text)
            return False
    except Exception as e:
        print(f"❌ Błąd inicjalizacji: {e}")
        return False

def test_rag_chat(query, test_name):
    """Test czatu RAG"""
    print(f"\n💬 Test: {test_name}")
    print(f"📝 Pytanie: {query}")
    
    try:
        payload = {
            "message": query,
            "session_id": "test_session"
        }
        
        response = requests.post(f"{API_BASE}/api/rag/chat", 
                               headers=HEADERS, 
                               json=payload)
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"🤖 Odpowiedź:")
            print(f"{data['answer']}")
            print(f"\n📊 Metryki:")
            print(f"   • Confidence: {data['confidence']:.2f}")
            print(f"   • Validation: {data.get('validation_score', 0):.2f}")
            print(f"   • Context relevance: {data.get('context_relevance', 0):.2f}")
            print(f"   • Completeness: {data.get('answer_completeness', 0):.2f}")
            
            if data.get('sources'):
                print(f"   • Źródła: {', '.join(data['sources'][:3])}")
            
            if data.get('reasoning_steps'):
                print(f"   • Kroki rozumowania: {len(data['reasoning_steps'])}")
            
            return True
        else:
            print(f"❌ Błąd chat: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Błąd testu: {e}")
        return False

def test_models_status():
    """Test statusu modeli"""
    print("\n🧠 Sprawdzam status modeli AI...")
    
    try:
        response = requests.get(f"{API_BASE}/api/models/status")
        if response.status_code == 200:
            data = response.json()
            print("✅ Status modeli:")
            
            models = data.get('models', {})
            print(f"   • Claude: {models.get('claude', {}).get('status', 'unknown')}")
            print(f"   • Embeddings: {models.get('embeddings', {}).get('status', 'unknown')}")
            print(f"   • Vector DB: {models.get('vector_db', {}).get('status', 'unknown')}")
            
            features = data.get('advanced_features', {})
            print("🔧 Zaawansowane funkcje:")
            print(f"   • Hybrid Search: {'✅' if features.get('hybrid_search') else '❌'}")
            print(f"   • Query Expansion: {'✅' if features.get('query_expansion') else '❌'}")
            print(f"   • Re-ranking: {'✅' if features.get('re_ranking') else '❌'}")
            print(f"   • Multi-step Reasoning: {'✅' if features.get('multi_step_reasoning') else '❌'}")
            
            return True
        else:
            print(f"❌ Błąd status modeli: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Błąd: {e}")
        return False

def test_sql_features():
    """Test funkcji SQL"""
    print("\n🗃️ Testuje funkcje SQL...")
    
    # Test generowania SQL
    try:
        payload = {
            "description": "Pokaż mi wszystkich klientów z limitem kredytowym powyżej 50000"
        }
        
        response = requests.post(f"{API_BASE}/api/sql/generate", 
                               headers=HEADERS, 
                               json=payload)
        
        if response.status_code == 200:
            data = response.json()
            print("✅ SQL wygenerowane:")
            print(f"   Zapytanie: {data.get('generated_query', 'N/A')}")
            
            analysis = data.get('analysis', {})
            print(f"   Bezpieczne: {'✅' if analysis.get('is_safe') else '❌'}")
            print(f"   Poprawne: {'✅' if analysis.get('is_valid') else '❌'}")
            
            return True
        else:
            print(f"❌ Błąd SQL: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Błąd SQL: {e}")
        return False

def main():
    """Główna funkcja testowa"""
    print("=" * 80)
    print("🧪 TEST PROFESJONALNEGO RAG z CLAUDE API")
    print("🎯 Testowanie zaawansowanych funkcji ERP AI Assistant")
    print("=" * 80)
    
    # Test 1: Health Check
    if not test_health_check():
        print("❌ System nie jest gotowy!")
        return
    
    # Test 2: Status modeli
    test_models_status()
    
    # Test 3: Inicjalizacja
    if not initialize_system():
        print("❌ Nie udało się zainicjalizować systemu!")
        return
    
    print("\n⏳ Czekam 3 sekundy na pełną inicjalizację...")
    time.sleep(3)
    
    # Test 4: Podstawowe pytania RAG
    test_cases = [
        ("Jak konfigurować limity kredytowe w Comarch ERP?", "Konfiguracja limitów kredytowych"),
        ("Jakie są funkcje AI w systemie ERP?", "Funkcje AI w ERP"),
        ("Jak działa moduł finansowy w Comarch?", "Moduł finansowy"),
        ("Pokaż mi dostępne API funkcje dla sprzedaży", "API sprzedaży"),
        ("Jak zarządzać kontrahentami w systemie?", "Zarządzanie kontrahentami")
    ]
    
    successful_tests = 0
    
    for query, test_name in test_cases:
        if test_rag_chat(query, test_name):
            successful_tests += 1
        time.sleep(2)  # Przerwa między testami
    
    # Test 5: Funkcje SQL
    test_sql_features()
    
    # Podsumowanie
    print("\n" + "=" * 80)
    print("📊 PODSUMOWANIE TESTÓW")
    print("=" * 80)
    print(f"✅ Udane testy RAG: {successful_tests}/{len(test_cases)}")
    print(f"🎯 Sukces: {(successful_tests/len(test_cases)*100):.1f}%")
    
    if successful_tests == len(test_cases):
        print("🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!")
        print("💡 System RAG z Claude API działa prawidłowo")
    else:
        print("⚠️ Niektóre testy nie przeszły - sprawdź logi")
    
    print("\n🔗 Dostępne endpointy:")
    print("   • Główna aplikacja: http://localhost:5000")
    print("   • Health check: http://localhost:5000/api/health")
    print("   • RAG Chat: http://localhost:5000/api/rag/chat")
    print("   • Models status: http://localhost:5000/api/models/status")

if __name__ == "__main__":
    main()
