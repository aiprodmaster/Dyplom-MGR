# 🕷️ Instrukcje Scrapingu Pomocy Comarch ERP XL

## 📋 Przegląd

Ten moduł pobiera wszystkie treści ze strony https://pomoc.comarch.pl/xl/ i indeksuje je w bazie wektorowej ChromaDB, aby Twój asystent AI miał dostęp do kompletnej dokumentacji Comarch ERP XL.

## 🚀 Szybki Start

### 1. Zainstaluj zależności
```bash
cd ERP_AI_Assistant/backend
pip install -r requirements.txt
```

### 2. Uruchom scraping
```bash
python run_scraper.py
```
LUB bezpośrednio:
```bash
python scrape_comarch_help.py
```

### 3. Po zakończeniu uruchom asystenta
```bash
python app.py
```

## ⚙️ Konfiguracja

### Wymagane klucze API
- **ANTHROPIC_API_KEY** - w pliku `Klucz.txt` lub zmiennej środowiskowej

### Parametry scrapingu (w `scrape_comarch_help.py`):
```python
scraping_config = ScrapingConfig(
    base_url="https://pomoc.comarch.pl/xl/",
    max_pages=300,                    # Maksymalna liczba stron
    delay_between_requests=2.0,       # Opóźnienie między requestami (sekundy)
    max_workers=3,                    # Równoległe wątki
    timeout=30                        # Timeout dla każdego requesta
)
```

## 📊 Proces Scrapingu

### Faza 1: Crawling 🕷️
1. **Start** z głównej strony https://pomoc.comarch.pl/xl/
2. **Ekstraktuje** wszystkie linki ze stron
3. **Filtruje** tylko strony z domeny comarch.pl/xl/
4. **Pobiera** treści równolegle (wielowątkowo)
5. **Usuwa** duplikaty i zbędne elementy HTML

### Faza 2: Indeksowanie 📚
1. **Dzieli** treści na chunki (500 znaków z overlapem)
2. **Generuje** embeddings używając Claude API
3. **Zapisuje** w ChromaDB dla wyszukiwania semantycznego
4. **Tworzy** metadane dla każdego dokumentu

## 📁 Struktura Plików

```
ERP_AI_Assistant/backend/
├── web_scraper.py              # Główny moduł scrapingu
├── scrape_comarch_help.py      # Skrypt uruchamiający
├── run_scraper.py              # Prosty interfejs
├── chroma_db/                  # Baza wektorowa
├── comarch_help_content_*.json # Wyniki scrapingu
└── scraping.log               # Logi procesu
```

## 🔧 Dostępne Klasy

### `ComarchHelpScraper`
```python
# Konfiguracja
scraper = ComarchHelpScraper(config)

# Uruchomienie
scraped_content = scraper.crawl_website()

# Zapisanie wyników
scraper.save_results("output.json")
```

### `ComarchKnowledgeIndexer`
```python
# Indeksowanie w ChromaDB
indexer = ComarchKnowledgeIndexer(ai_service, vector_service)
indexer.index_scraped_content(scraped_content)
```

## 📈 Oczekiwane Rezultaty

### Statystyki:
- **~200-500 stron** z dokumentacji
- **~2000-5000 chunków** tekstu
- **Kategoryzacja** automatyczna (finanse, CRM, logistyka, etc.)
- **Embeddings** dla semantycznego wyszukiwania

### Kategorie treści:
- 💰 **Finanse** - księgowość, rozrachunki, controlling
- 👥 **CRM** - zarządzanie klientami, sprzedaż
- 📦 **Logistyka** - magazyn, zakupy, dostawy
- 🏭 **Produkcja** - planowanie, zarządzanie zasobami
- 👔 **HR** - kadry, płace, czas pracy
- 📊 **Raporty** - analityka, BI, dashboardy
- ⚙️ **Konfiguracja** - ustawienia systemu
- 🔗 **Integracja** - API, połączenia zewnętrzne

## 🛠️ Rozwiązywanie Problemów

### Błąd połączenia:
```bash
❌ Nie można połączyć się ze stroną pomocy
```
**Rozwiązanie:** Sprawdź połączenie internetowe i dostępność strony

### Brak zależności:
```bash
❌ Brakuje zależności: beautifulsoup4
```
**Rozwiązanie:** 
```bash
pip install -r requirements.txt
```

### Brak klucza API:
```bash
❌ Brak ANTHROPIC_API_KEY!
```
**Rozwiązanie:** Dodaj klucz do pliku `Klucz.txt` w folderze backend

### Wolny scraping:
- Zwiększ `delay_between_requests` dla szybszego scrapingu
- Zmniejsz `max_workers` jeśli serwer blokuje requesty

## 🔍 Testowanie

### Test połączenia:
```bash
python -c "
from scrape_comarch_help import test_connection
test_connection()
"
```

### Test scrapingu pojedynczej strony:
```python
from web_scraper import ComarchHelpScraper
scraper = ComarchHelpScraper()
result = scraper.scrape_page('https://pomoc.comarch.pl/xl/')
print(f'Pobrano: {len(result.content)} znaków')
```

## 📚 Przykłady Użycia

### Po scrapingu możesz zadawać pytania:

✅ **"Jak skonfigurować moduł finansowy w Comarch ERP XL?"**
✅ **"Jakie są etapy wdrożenia systemu CRM?"**  
✅ **"Jak zintegrować ERP z systemem zewnętrznym?"**
✅ **"Jak ustawić automatyczne księgowania VAT?"**
✅ **"Jakie raporty są dostępne w module logistyki?"**

## 🎯 Zalety Tego Rozwiązania

🔥 **Aktualna dokumentacja** - zawsze najnowsze informacje z oficjalnej strony
🔥 **Semantic search** - inteligentne wyszukiwanie kontekstu
🔥 **Kategoryzacja** - automatyczne sortowanie treści
🔥 **RAG integration** - bezpośrednie wykorzystanie w asystencie AI
🔥 **Caching** - szybkie odpowiedzi dzięki indeksowaniu
🔥 **Monitoring** - śledzenie wydajności i metryk

---

## ⚡ Szybkie Uruchomienie

```bash
# 1. Przejdź do folderu
cd ERP_AI_Assistant/backend

# 2. Zainstaluj zależności
pip install -r requirements.txt

# 3. Uruchom scraping
python run_scraper.py

# 4. Wybierz opcję 1 (scraping)

# 5. Po zakończeniu uruchom asystenta
python app.py
```

🎉 **Gotowe! Twój asystent AI ma teraz dostęp do kompletnej dokumentacji Comarch ERP XL!**
