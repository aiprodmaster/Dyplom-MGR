# 🔧 NAPRAWKA PROBLEMÓW UNICODE I EMOJI - Windows

## 🚨 Problemy które naprawia ten skrypt:

### Problem 1: Unicode/Emoji w logach
- **Objaw**: `UnicodeEncodeError: 'charmap' codec can't encode character`
- **Przyczyna**: Windows używa kodowania cp1250, nie obsługuje emoji ✅🧠🚀
- **Skutek**: Aplikacja się zawiesza przy próbie wyświetlenia logów

### Problem 2: Baza danych cache
- **Objaw**: `sqlite3.OperationalError: no such column: content_hash`
- **Przyczyna**: Stary schemat bazy vs nowy kod
- **Skutek**: Błędy przy ładowaniu dokumentów

### Problem 3: ChromaDB cache
- **Objaw**: Błędy inicjalizacji vector database
- **Przyczyna**: Uszkodzony cache ChromaDB
- **Skutek**: RAG nie działa

## 🚀 ROZWIĄZANIA

### Opcja 1: SZYBKA NAPRAWKA (NAJŁATWIEJSZA)

```bash
# Uruchom jeden z tych plików:
quick_fix_windows.bat       # Automatyczna naprawka + uruchomienie
```

### Opcja 2: Ręczna naprawka (CMD)

```cmd
# 1. Zmień kodowanie
chcp 65001

# 2. Usuń cache
del *.db
del *.sqlite
del *.sqlite3
rmdir /s /q chroma_db

# 3. Ustaw zmienne
set PYTHONIOENCODING=utf-8
set PYTHONLEGACYWINDOWSSTDIO=utf-8

# 4. Uruchom
python app.py
```

### Opcja 3: Kompleksowa naprawka

```bash
# Uruchom pełny skrypt naprawczy:
python fix_system_windows.py

# Lub tylko szybka naprawka:
python fix_system_windows.py quick
```

## 📋 CO ROBI SKRYPT NAPRAWCZY

### `fix_system_windows.py` - GŁÓWNY SKRYPT

**Funkcje naprawcze:**

1. **`fix_unicode_logging()`** - Naprawia kodowanie Unicode:
   - Ustawia UTF-8 dla stdout/stderr
   - Konfiguruje zmienne środowiskowe
   - Ustawia locale na UTF-8

2. **`SafeFormatter`** - Bezpieczny formatter:
   - Zamienia emoji na tekst: ✅ → [OK]
   - Działa tylko na Windows
   - Zapobiega błędom Unicode

3. **`clean_problematic_cache()`** - Czyści cache:
   - Usuwa pliki .db, .sqlite, .sqlite3
   - Usuwa katalogi chroma_db
   - Bezpieczne usuwanie (sprawdza blokady)

4. **`fix_database_schema()`** - Naprawia bazę:
   - Sprawdza schemat tabeli document_cache
   - Dodaje brakującą kolumnę content_hash
   - Tworzy nowe tabele jeśli trzeba

5. **`fix_app_py_emoji()`** - Naprawia kod:
   - Zamienia emoji w loggerach na tekst
   - Modyfikuje plik app.py automatycznie
   - Bezpieczne - robi backup

### `quick_fix_windows.bat` - SZYBKA NAPRAWKA

**Co robi:**
1. `chcp 65001` - Zmienia kodowanie na UTF-8
2. `del *.db` - Usuwa cache baz danych  
3. `set PYTHONIOENCODING=utf-8` - Ustawia zmienne
4. `python fix_system_windows.py quick` - Naprawia emoji
5. `python app.py` - Uruchamia aplikację

## ✅ SPRAWDZENIE CZY DZIAŁA

### Prawidłowe uruchomienie:
```
INFO - [OK] Claude API zainicjalizowane
INFO - [AI] Model embeddings załadowany
INFO - [START] ERP AI ASSISTANT - ADVANCED BACKEND SERVER
 * Running on http://127.0.0.1:5000
```

### Błędne uruchomienie:
```
UnicodeEncodeError: 'charmap' codec can't encode character
sqlite3.OperationalError: no such column: content_hash
```

## 🎯 ZALECENIA

### Dla Windows:
1. **Zawsze uruchom:** `chcp 65001` przed Pythonem
2. **Ustaw zmienne:** `PYTHONIOENCODING=utf-8`
3. **Usuń cache:** przed każdym uruchomieniem jeśli błędy

### Dla PowerShell:
```powershell
$OutputEncoding = [console]::InputEncoding = [console]::OutputEncoding = New-Object System.Text.UTF8Encoding
$env:PYTHONIOENCODING="utf-8"
python app.py
```

### Dla VS Code:
```json
// W settings.json:
{
    "terminal.integrated.env.windows": {
        "PYTHONIOENCODING": "utf-8"
    }
}
```

## 🔧 TECHNICZNE SZCZEGÓŁY

### Mapping emoji → tekst:
```python
EMOJI_MAP = {
    '✅': '[OK]',
    '🧠': '[AI]',
    '🚀': '[START]',
    '📂': '[DOCS]',
    '🗃️': '[SQL]',
    '📍': '[INFO]',
    '🏠': '[HOME]',
    '❤️': '[HEALTH]',
    '🤖': '[BOT]',
    '📊': '[DASH]',
    '📈': '[ANALYTICS]',
    '⚡': '[POWER]',
    '🔧': '[CONFIG]',
    '💡': '[TIP]',
    '⚠️': '[WARN]',
    '❌': '[ERROR]'
}
```

### Schemat bazy naprawianej:
```sql
CREATE TABLE document_cache (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    file_path TEXT UNIQUE NOT NULL,
    content_hash TEXT NOT NULL,      -- Dodawana kolumna
    content TEXT,
    metadata TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
```

## 🚨 TROUBLESHOOTING

### Problem: "python nie jest rozpoznawane"
**Rozwiązanie:** Dodaj Python do PATH lub użyj `py` zamiast `python`

### Problem: "Permission denied" przy usuwaniu cache
**Rozwiązanie:** Zamknij wszystkie aplikacje używające bazy, uruchom jako Administrator

### Problem: Ciągle błędy Unicode mimo naprawki
**Rozwiązanie:** 
1. Restartuj terminal
2. Sprawdź czy używasz CMD nie PowerShell
3. Uruchom `chcp 65001` ręcznie

### Problem: ChromaDB się nie tworzy
**Rozwiązanie:**
1. Usuń cały katalog chroma_db
2. Usuń data/chroma_db  
3. Uruchom aplikację - utworzy nową bazę

## 📞 SZYBKA POMOC

**Najczęstsze problemy i rozwiązania:**

| Problem | Komenda |
|---------|---------|
| Unicode error | `chcp 65001 && python app.py` |
| Database error | `del *.db && python app.py` |
| ChromaDB error | `rmdir /s chroma_db && python app.py` |
| Wszystko naraz | `quick_fix_windows.bat` |

## 🎯 PODSUMOWANIE

**Aby uruchomić aplikację bez problemów:**

1. **NAJSZYBCIEJ:** Kliknij dwukrotnie `quick_fix_windows.bat`
2. **RĘCZNIE:** `chcp 65001 && del *.db && python app.py`
3. **KOMPLEKSOWO:** `python fix_system_windows.py`

**Po naprawce aplikacja powinna działać bez błędów Unicode i bazy danych!** 🎉
