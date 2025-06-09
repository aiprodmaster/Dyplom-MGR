# 🚀 Ulepszenia Jakości Odpowiedzi RAG

## Przegląd Ulepszeń

System ERP AI Assistant został znacząco ulepszony o zaawansowane technologie RAG (Retrieval-Augmented Generation), które poprawiają jakość i precyzję odpowiedzi.

## ✨ Nowe Funkcjonalności

### 1. **Hybrydowe Wyszukiwanie (Semantic + BM25)**
- **Semantic Search**: Wykorzystuje embeddingi do wyszukiwania semantycznie podobnych treści
- **BM25 Search**: Tradycyjne wyszukiwanie słów kluczowych
- **Kombinacja**: Optymalne połączenie obu metod (70% semantic + 30% BM25)

```python
# Przykład użycia
results = hybrid_search.search(query, alpha=0.7, top_k=15)
```

### 2. **Zaawansowane Przetwarzanie Zapytań**
- **Analiza intencji**: Automatyczna klasyfikacja zapytań (konfiguracja, wdrożenie, API, itp.)
- **Ekstrakcja entności**: Identyfikacja kluczowych terminów biznesowych
- **Rozszerzanie zapytań**: Automatyczne dodawanie synonimów i terminów pokrewnych
- **Ocena złożoności**: Wykrywanie złożonych zapytań wymagających wieloetapowej analizy

### 3. **Re-ranking Wyników**
- **Cross-encoder**: Zaawansowany model do ponownego rankowania
- **Claude-based scoring**: Ocena relevantności przez AI
- **Heurystyki biznesowe**: Dodatkowe bonusy za kategorie dokumentów

### 4. **Kompresja Kontekstu**
- **Usuwanie duplikatów**: Eliminacja powtarzających się informacji
- **Ekstrakcja kluczowych fragmentów**: Wyciąganie najważniejszych zdań
- **Inteligentne podsumowanie**: Łączenie podobnych treści
- **Optymalizacja tokenów**: Lepsze wykorzystanie limitu kontekstu

### 5. **Multi-step Reasoning**
- **Dekompozycja zapytań**: Podział złożonych pytań na prostsze części
- **Sekwencyjne przetwarzanie**: Odpowiadanie na każdą część osobno
- **Synteza wyników**: Łączenie odpowiedzi w spójną całość
- **Śledzenie kroków**: Dokumentowanie procesu myślowego

## 📊 Metryki Jakości

System wprowadza szczegółowe metryki oceny jakości odpowiedzi:

### 1. **Validation Score** (0.0-1.0)
- Długość odpowiedzi vs oczekiwania
- Pokrycie słów kluczowych z zapytania
- Wykorzystanie dostarczonego kontekstu
- Struktura i spójność odpowiedzi
- Specyfika terminów ERP

### 2. **Context Relevance** (0.0-1.0)
- Średnia confidence scores z wyszukiwania
- Bonus za efektywną kompresję kontekstu
- Dopasowanie kategorii dokumentów

### 3. **Answer Completeness** (0.0-1.0)
- Długość odpowiedzi względem złożoności zapytania
- Pokrycie wszystkich aspektów pytania
- Struktura dla złożonych zapytań

### 4. **Factual Consistency** (0.0-1.0)
- Spójność z bazą wiedzy
- Unikanie hallucynacji
- Wierność źródłom

## 🔄 Tryby Działania

### Standard RAG
- Podstawowe wyszukiwanie semantyczne
- Klasyczna generacja odpowiedzi
- Szybkie działanie, dobre dla prostych zapytań

### Advanced RAG
- Wszystkie zaawansowane funkcjonalności
- Wieloetapowe przetwarzanie
- Szczegółowe metryki jakości
- Optymalne dla złożonych zapytań

## 🛠️ API Endpoints

### Status systemów RAG
```bash
GET /api/rag/status
```

### Przełączanie trybu
```bash
POST /api/rag/mode
{
  "mode": "advanced"  # lub "standard"
}
```

### Chat z wymuszonym trybem zaawansowanym
```bash
POST /api/chat/advanced
{
  "message": "Jak skonfigurować moduł CRM?",
  "session_id": "user123"
}
```

## 📈 Przykłady Ulepszeń

### Przed (Standard RAG)
**Zapytanie**: "Jak zintegrować Comarch ERP z systemem e-commerce i jakie są koszty?"

**Odpowiedź**: Podstawowa informacja o integracjach bez szczegółów kosztowych.

### Po (Advanced RAG)
**Zapytanie**: "Jak zintegrować Comarch ERP z systemem e-commerce i jakie są koszty?"

**Proces**:
1. **Analiza intencji**: integracja (confidence: 0.95)
2. **Dekompozycja**: 
   - Część 1: "Jak zintegrować Comarch ERP z e-commerce?"
   - Część 2: "Jakie są koszty integracji?"
3. **Hybrydowe wyszukiwanie**: 15 wyników + re-ranking → 5 najlepszych
4. **Kompresja kontekstu**: 2000 znaków → 800 znaków (optymalizacja)
5. **Synteza odpowiedzi**: Spójna odpowiedź łącząca oba aspekty

**Metryki**:
- Validation Score: 0.89
- Context Relevance: 0.92
- Answer Completeness: 0.87
- Factual Consistency: 0.91

## 🧪 Testowanie

Uruchom testy porównawcze:

```bash
cd backend
python test_advanced_rag.py
```

## 📚 Dodatkowe Zależności

Nowe wymagania dla pełnej funkcjonalności:

```bash
pip install numpy scikit-learn spacy
python -m spacy download pl_core_news_sm
```

Opcjonalnie dla re-ranking:
```bash
pip install sentence-transformers cross-encoder
```

## 🔧 Konfiguracja

W pliku `app.py` można dostosować parametry:

```python
# Wagi hybrydowego wyszukiwania
alpha = 0.7  # 70% semantic, 30% BM25

# Liczba wyników do re-ranking
top_k_rerank = 8

# Maksymalna długość kontekstu
max_context_length = 2000

# Próg złożoności dla multi-step
complexity_threshold = 0.7
```

## 📊 Monitoring

System zbiera szczegółowe metryki dostępne przez:

```bash
GET /api/metrics
```

Metryki obejmują:
- Czasy przetwarzania poszczególnych etapów
- Jakość odpowiedzi (validation scores)
- Wykorzystanie zaawansowanych funkcji
- Porównanie standardowego vs zaawansowanego RAG

## 🎯 Zalecenia Użycia

### Kiedy używać Standard RAG:
- Proste pytania o funkcjonalności
- Szybkie odpowiedzi
- Ograniczone zasoby

### Kiedy używać Advanced RAG:
- Złożone pytania wieloaspektowe
- Zapytania wymagające precyzji
- Przypadki krytyczne dla biznesu
- Analiza kosztów i porównania

## 🚀 Przyszłe Ulepszenia

Planowane rozszerzenia:
- Integration z modelami lokalnymi (Ollama)
- Personalizacja na podstawie historii użytkownika
- A/B testing różnych strategii RAG
- Feedback loop dla ciągłego uczenia
- Specjalizowane embeddingi dla domeny ERP

---

*Dokumentacja wersji 2.0 - Zaawansowany RAG dla ERP AI Assistant*
