# ERP AI Assistant - Inteligentny Asystent Wdrożeń ERP

## 📋 Opis Projektu

Nowoczesny prototyp asystenta AI wykorzystujący technologię RAG (Retrieval-Augmented Generation) do wspomagania konsultantów w procesie wdrożenia systemów ERP, szczególnie Comarch ERP XL.

## 🚀 Funkcjonalności

### 🔍 Moduł Wyszukiwania RAG
- Upload i indeksowanie dokumentacji ERP (PDF, DOC, XML)
- Semantic search w języku naturalnym
- Wyświetlanie źródeł odpowiedzi z cytatami
- Historia zapytań i analiza trendów

### 📊 Moduł Analizy Danych
- Dashboard z KPI projektów wdrożeniowych
- Wykresy postępu i analizy ryzyka
- Generowanie raportów w czasie rzeczywistym
- Color-coded alerts i powiadomienia

### 📋 Moduł Zarządzania Dokumentacją
- Automatyczne generowanie dokumentów projektowych
- Szablony dla Comarch ERP XL
- Export do PDF/Word z customowym brandingiem
- Wersjonowanie i audit trail

### 💬 Interfejs Chatbota
- Inteligentny chat z RAG backend
- Sugestie pytań dla konsultantów ERP
- Cytowanie źródeł i referencje
- System feedback i uczenia

### 🎓 Moduł Szkoleniowy
- Interaktywne przewodniki po systemie
- Quiz o funkcjonalnościach ERP
- Materiały multimedialne
- Progress tracking i certyfikaty

### ⚙️ Panel Administracyjny
- Zarządzanie bazą wiedzy
- Statystyki użytkowania i analytics
- Konfiguracja systemu
- User management i role

## 🛠️ Technologie

### Frontend
- **React 18** z hooks i context API
- **TypeScript** dla type safety
- **Tailwind CSS** do stylowania
- **Recharts** dla wizualizacji danych
- **React Router** do nawigacji

### Backend
- **Python FastAPI** - nowoczesny web framework
- **LangChain** - framework do aplikacji AI
- **ChromaDB** - vector database
- **SQLAlchemy** - ORM dla PostgreSQL
- **OpenAI/Claude API** - modele AI

### Infrastruktura
- **Docker** & **Docker Compose**
- **PostgreSQL** - główna baza danych
- **Redis** - cache i session storage
- **Nginx** - reverse proxy

## 📁 Struktura Projektu

```
NEW_ERP_AI_Assistant/
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── models/         # Data models
│   │   ├── utils/          # Utility functions
│   │   └── config/         # Configuration
│   ├── tests/              # Unit & integration tests
│   └── data/               # Sample data & docs
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── styles/         # CSS & Tailwind
│   │   ├── services/       # API calls
│   │   ├── hooks/          # Custom hooks
│   │   └── utils/          # Helper functions
│   ├── public/             # Static assets
│   └── build/              # Production build
├── docs/                   # Documentation
├── data/                   # Sample ERP data
└── scripts/                # Deployment scripts
```

## 🚀 Szybki Start

### Wymagania
- Python 3.9+
- Node.js 16+
- Docker & Docker Compose
- PostgreSQL (lub Docker)

### Instalacja

1. **Klonowanie repozytorium**
```bash
git clone <repository-url>
cd NEW_ERP_AI_Assistant
```

2. **Uruchomienie z Docker**
```bash
docker-compose up -d
```

3. **Lub ręczne uruchomienie:**

**Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend:**
```bash
cd frontend
npm install
npm start
```

### Konfiguracja

1. Skopiuj `.env.example` do `.env`
2. Uzupełnij klucze API (OpenAI/Claude)
3. Skonfiguruj połączenie z bazą danych

## 📖 API Documentation

Po uruchomieniu backend, dokumentacja API dostępna pod:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## 🧪 Demo & Testowanie

### Demo Data
Aplikacja zawiera przykładowe dane:
- Dokumentacja Comarch ERP XL
- Historyczne dane projektów
- Sample KPI i metryki
- Demo problemy i rozwiązania

### Testowanie
```bash
# Backend tests
cd backend && python -m pytest

# Frontend tests
cd frontend && npm test
```

## 🎯 Cele Demonstracyjne

1. ✅ Działający chat z RAG i semantic search
2. ✅ Dashboard z real-time analytics
3. ✅ Generator dokumentacji projektowej
4. ✅ Panel zarządzania wiedzą
5. ✅ Responsive UI/UX design
6. ✅ Export functions (PDF, Excel)

## 🔒 Bezpieczeństwo

- JWT authentication
- Role-based access control
- Szyfrowanie uploadowanych plików
- Audit log wszystkich działań
- CORS i rate limiting

## 📋 TODO & Roadmap

- [ ] Integracja z rzeczywistym API Comarch
- [ ] Machine learning dla predykcji ryzyka
- [ ] Mobile app (React Native)
- [ ] Advanced analytics & reporting
- [ ] Multi-language support

## 👥 Autorzy

- **Łukasz** - Developer & Architecture
- **Promotor** - Supervision & Guidance

## 📄 Licencja

Ten projekt jest licencjonowany pod MIT License - zobacz plik [LICENSE](LICENSE) dla szczegółów.

## 📧 Kontakt

Dla pytań i sugestii:
- Email: [contact@email.com]
- GitHub Issues: [link-to-issues]

---

**Made with ❤️ for ERP consultants**
