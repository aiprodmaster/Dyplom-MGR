# Integracja ze strukturami bazy danych Comarch ERP 2025

## Przegląd

Asystent AI dla Comarch ERP został rozszerzony o obsługę struktur bazy danych z wersji 2025. Dzięki temu agent może teraz odpowiadać na pytania dotyczące:

- Struktur tabel bazy danych
- Procedur AI i ChatERP
- Kolumn i typów danych
- Relacji między tabelami
- Definicji słownika danych

## Nowe źródła wiedzy

### 1. Struktury tabel (Tabele_2025_0/)
- **Formaty:** XML i HTML
- **Zawartość:** Kompletne definicje struktur tabel ERP
- **Ilość:** ~2500+ plików
- **Kategorie:**
  - `ai_tabele` - Tabele związane z AI (AILimityKredytowe, AIPrognozaPopytu)
  - `ai_procedury_sql` - Procedury AI_ChatERP_*
  - `tabele_finansowe` - Bilanse, budżety, BST
  - `tabele_magazynowe` - Towary, cenniki, magazyny
  - `tabele_kontrahentow` - Karty kontrahentów, adresy
  - `tabele_dokumentow` - Dokumenty handlowe, elementy
  - `tabele_inne` - Pozostałe struktury

### 2. Dokumentacja API (XLAPI20250/)
- **Formaty:** HTML
- **Zawartość:** Funkcje API, procedury, dokumentacja
- **Ilość:** ~1800 plików
- **Kategorie:** API funkcje, autoryzacja, dokumenty, towary, itp.

## Przykłady wykorzystania

### Pytania o struktury tabel
```
"Jakie kolumny ma tabela AILimityKredytowe?"
"Jaki jest typ danych kolumny AILK_Scoring?"
"Opisz strukturę tabeli do limitów kredytowych."
```

### Pytania o procedury AI
```
"Jak działa procedura AI_ChatERP_PodajKupcow?"
"Jakie parametry przyjmuje AI_ChatERP_PodajSprzedaz?"
"Pokaż wszystkie procedury AI dla ChatERP."
```

### Pytania o relacje
```
"Jak połączyć tabelę kontrahentów z limitami kredytowymi?"
"Jakie tabele używają prefiksu TRN_?"
"Znajdź tabele związane z prognozowaniem popytu."
```

## Struktura parsowanych danych

### Dla plików XML (struktury tabel):
```json
{
  "title": "Struktura tabeli: AILimityKredytowe",
  "content": "Tabela: AILimityKredytowe\nOpis: Tabela przechowuje obliczone wartości limitów kredytowych\n\nKolumny:\n- AILK_NIP (TEXT) - zmienne opisujące podstawowe atrybuty...",
  "category": "ai_tabele",
  "keywords": ["AILimityKredytowe", "AILK_NIP", "INTEGER", "TEXT", "DECIMAL"],
  "source_file": "AILimityKredytowe.xml"
}
```

### Dla plików HTML (procedury):
```json
{
  "title": "AI_ChatERP_PodajKupcow",
  "content": "CREATE PROCEDURE CDN.AI_ChatERP_PodajKupcow @IloscRekordow INT...",
  "category": "ai_procedury_sql",
  "keywords": ["AI_ChatERP_PodajKupcow", "ChatERP", "procedura"],
  "source_file": "AI_ChatERP_PodajKupcow.html"
}
```

## Rozpoznawane słowa kluczowe

### Nazwy tabel
- Wzorce: `*Nag`, `*Elem`, `*Karty`, `*Dane`, `*Info`, `*Log`, `*Hist`
- Przykłady: `TraNag`, `TraElem`, `KntKarty`, `TwrKarty`

### Procedury AI
- Wzorce: `AI_ChatERP_*`, `AI_PP_*`, `AI_*`
- Przykłady: `AI_ChatERP_PodajKupcow`, `AI_PP_PobierzCenyTowarow`

### Kolumny bazy danych
- Wzorce: `XXX_YYY` (prefiksy 2-4 znakowe)
- Przykłady: `AILK_NIP`, `TrN_Data3`, `Knt_Akronim`

### Typy danych SQL
- `INTEGER`, `VARCHAR`, `TEXT`, `DECIMAL`, `DATETIME`, `CSTRING`, `LONG`

## Konfiguracja

Nowe ścieżki w `ComarchDocumentLoader`:
```python
self.docs_paths = [
    backend_dir.parent / "BazaWiedzy" / "XLAPI20250",        # API docs
    backend_dir.parent / "BazaWiedzy" / "Tabele_2025_0"     # Database structures
]
```

## Testowanie

Uruchom test integracji:
```bash
cd ERP_AI_Assistant/backend
python test_database_loader.py
```

Test sprawdza:
- ✅ Ładowanie z obu folderów
- ✅ Poprawne parsowanie XML i HTML
- ✅ Kategoryzację dokumentów
- ✅ Ekstraktę słów kluczowych
- ✅ Rozpoznawanie struktur AI

## Korzyści dla użytkowników

### Konsultanci ERP
- Szybki dostęp do struktur tabel podczas wdrożeń
- Odpowiedzi na pytania o kolumny i typy danych
- Znajomość procedur AI i ich parametrów
- Dokumentacja relacji między tabelami

### Deweloperzy
- Kompletny słownik danych w języku naturalnym
- Automatyczne generowanie zapytań SQL
- Dokumentacja API w kontekście struktur DB
- Wsparcie przy integracjach

### Analitycy biznesowi
- Zrozumienie modelu danych ERP
- Identyfikacja źródeł danych dla raportów
- Dokumentacja funkcji AI w systemie
- Wsparcie przy analizie procesów biznesowych

---

**Status:** ✅ **Zintegrowane i działające**
**Ostatnia aktualizacja:** 6 czerwca 2025
