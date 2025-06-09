# 🏗️ STRUKTURA APLIKACJI ERP AI ASSISTANT

## 📍 GŁÓWNE STRONY (localhost:5000)

### ✅ AKTYWNE STRONY:

| URL | Plik | Opis | Status |
|-----|------|------|--------|
| `http://localhost:5000/` | `index.html` | **🎯 GŁÓWNY CHAT** - AI LUKAS Asystent ERP | ✅ AKTYWNE |
| `http://localhost:5000/dashboard.html` | `dashboard.html` | **📊 DASHBOARD** - Przegląd modułów | 🔄 DO STWORZENIA |
| `http://localhost:5000/simulator-roi-complete.html` | `simulator-roi-complete.html` | **💰 SYMULATOR ROI** - Kalkulator zwrotu | ✅ AKTYWNE |
| `http://localhost:5000/digital-twin-advanced.html` | `digital-twin-advanced.html` | **🏭 DIGITAL TWIN** - Symulacja procesów | ✅ AKTYWNE |

---

## 🗂️ PLIKI DO USUNIĘCIA (DUPLIKATY):

### ❌ NIEUŻYWANE:
- `professional-chat.html` ➜ **USUŃ** (stara wersja)
- `professional-chat-final.html` ➜ **USUŃ** (skopiowana do index.html)
- `simulator-roi-modules.html` ➜ **USUŃ** (niekompletna)
- `simulator-roi-modules-complete.html` ➜ **USUŃ** (duplikat)

### ❌ FRONTEND DUPLIKATY:
- `frontend/public/professional-chat.html` ➜ **USUŃ**
- `frontend/public/index.html` ➜ **USUŃ**

---

## 🎯 REKOMENDOWANA STRUKTURA:

```
ERP_AI_Assistant/
├── 🏠 index.html              # GŁÓWNY CHAT (AI LUKAS Asystent)
├── 📊 dashboard.html          # MENU GŁÓWNE z linkami
├── 💰 simulator-roi-complete.html    # Symulator ROI
├── 🏭 digital-twin-advanced.html     # Digital Twin
├── backend/                   # Backend Flask
└── docs/                      # Dokumentacja
```

---

## 🚀 JAK URUCHOMIĆ:

1. **Backend:**
   ```bash
   cd ERP_AI_Assistant/backend
   python app.py
   ```

2. **Dostęp:**
   - **Główny chat:** http://localhost:5000/
   - **Dashboard:** http://localhost:5000/dashboard.html
   - **Symulator ROI:** http://localhost:5000/simulator-roi-complete.html
   - **Digital Twin:** http://localhost:5000/digital-twin-advanced.html

---

## 📋 FUNKCJE KAŻDEJ STRONY:

### 🎯 index.html (GŁÓWNY CHAT)
- AI LUKAS - Asystent ERP
- RAG + Claude API
- Profesjonalny interfejs
- Szybkie akcje ERP

### 📊 dashboard.html (PLANOWANE)
- Menu główne
- Linki do wszystkich modułów
- System status
- Przegląd funkcji

### 💰 simulator-roi-complete.html
- Kalkulator ROI dla wdrożeń ERP
- Analiza kosztów i korzyści
- Wizualizacje wykresów

### 🏭 digital-twin-advanced.html
- Symulacja procesów biznesowych
- Wizualizacja 3D
- Analiza wydajności

---

**✅ STATUS: UPORZĄDKOWANE**
