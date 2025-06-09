# 🔧 DEPENDENCY FIXES GUIDE
## Rozwiązywanie Problemów z Instalacją Dependencies

**Data:** 8 czerwca 2025  
**Status:** CRITICAL FIXES IMPLEMENTED  

---

## 🚨 PROBLEM DIAGNOSIS

### ❌ Główne Problemy:
1. **Python 3.13 Compatibility Crisis** - Nowe wersje pakietów nie obsługują Python 3.13
2. **NumPy Build Failures** - `AttributeError: module 'pkgutil' has no attribute 'ImpImporter'`
3. **Sentence-Transformers Conflicts** - Dependency hell z PyTorch
4. **ChromaDB Installation Issues** - Vector database build problems

---

## ✅ ROZWIĄZANIA ZAIMPLEMENTOWANE

### 📁 Nowe Pliki Naprawcze:

#### 1. **`backend/requirements_fixed.txt`**
```
# Kompatybilne wersje dla Python 3.11/3.12
flask==3.0.0
flask-cors==4.0.0
fastapi==0.104.1
uvicorn==0.24.0
anthropic==0.8.1
chromadb==0.4.15  # Stabilna wersja
numpy==1.24.3     # Python 3.11 compatible
pandas==2.1.4
sentence-transformers==2.2.2
```

#### 2. **`auto_install_dependencies.bat`**
Automatyczny skrypt instalacji z:
- Aktualizacją pip/setuptools/wheel
- Czyszczeniem cache
- Step-by-step instalacją pakietów
- Error handling i fallback opcje
- Testowaniem instalacji

---

## 🎯 INSTRUKCJE KROK PO KROK

### OPCJA A: Automatyczna Instalacja (ZALECANE)

```bash
# 1. Uruchom automatyczny skrypt
double-click: auto_install_dependencies.bat

# 2. Skrypt wykona wszystko automatycznie:
#    - Sprawdzi Python version
#    - Zaktualizuje pip
#    - Zainstaluje pakiety w prawidłowej kolejności
#    - Przetestuje instalację
```

### OPCJA B: Manualna Instalacja

```bash
# 1. Sprawdź wersję Python (MUSI BYĆ 3.11 lub 3.12!)
python --version

# 2. Aktualizuj podstawowe narzędzia
python -m pip install --upgrade pip setuptools wheel

# 3. Wyczyść cache
python -m pip cache purge

# 4. Instaluj z fixed requirements
cd ERP_AI_Assistant
python -m pip install -r backend/requirements_fixed.txt
```

### OPCJA C: Emergency Minimal Setup

```bash
# Minimalna konfiguracja jeśli wszystko zawodzi
python -m pip install flask flask-cors anthropic requests python-dotenv
```

---

## 🔧 ROZWIĄZANIA KONKRETNYCH PROBLEMÓW

### Problem 1: Python 3.13 Incompatibility
```bash
❌ BŁĄD: AttributeError: module 'pkgutil' has no attribute 'ImpImporter'

✅ ROZWIĄZANIE:
# Downgrade do Python 3.11.7 LTS
# Pobierz z: https://www.python.org/downloads/release/python-3117/
```

### Problem 2: NumPy Build Failures
```bash
❌ BŁĄD: Getting requirements to build wheel did not run successfully

✅ ROZWIĄZANIE:
# Użyj pre-compiled wheels
python -m pip install --only-binary=all numpy==1.24.3
python -m pip install --prefer-binary pandas==2.1.4
```

### Problem 3: ChromaDB Installation Issues
```bash
❌ BŁĄD: Failed building wheel for chromadb

✅ ROZWIĄZANIE:
# Użyj starszej, stabilnej wersji
python -m pip install chromadb==0.4.15

# Jeśli dalej nie działa, pomiń tymczasowo:
# Komentuj chromadb w requirements i uruchom bez Vector DB
```

### Problem 4: Microsoft Visual C++ 14.0 Required
```bash
❌ BŁĄD: Microsoft Visual C++ 14.0 is required

✅ ROZWIĄZANIE:
# Pobierz Microsoft C++ Build Tools:
# https://visualstudio.microsoft.com/visual-cpp-build-tools/

# LUB użyj pre-compiled:
python -m pip install --only-binary=all -r requirements_fixed.txt
```

### Problem 5: Sentence-Transformers Dependency Conflicts
```bash
❌ BŁĄD: Conflicting torch/transformers versions

✅ ROZWIĄZANIE:
# Instaluj PyTorch najpierw
python -m pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu
python -m pip install sentence-transformers==2.2.2
```

---

## 🚀 KOLEJNE KROKI PO INSTALACJI

### 1. **Test Basic Backend**
```bash
cd ERP_AI_Assistant/backend
python -c "import flask, anthropic, requests; print('✅ OK!')"
```

### 2. **Uruchom Serwer**
```bash
# Spróbuj app.py (Flask)
python app.py

# LUB main.py (FastAPI)
python main.py

# LUB unified_api_backend.py
python unified_api_backend.py
```

### 3. **Test Frontend Connection**
```bash
# Otwórz w przeglądarce:
http://localhost:8000
# LUB
http://localhost:5000
```

---

## 📋 TROUBLESHOOTING CHECKLIST

### ✅ Pre-Installation:
- [ ] Python 3.11 lub 3.12 (NIE 3.13!)
- [ ] Pip version ≥ 23.0
- [ ] Microsoft C++ Build Tools (Windows)
- [ ] Stable internet connection
- [ ] Administrator privileges (jeśli potrzebne)

### ✅ During Installation:
- [ ] auto_install_dependencies.bat executed successfully
- [ ] No error messages in console
- [ ] All critical packages installed (flask, anthropic, requests)
- [ ] Test import successful

### ✅ Post-Installation:
- [ ] Backend server starts without errors
- [ ] Frontend connects to API endpoints
- [ ] Health check returns 200 OK
- [ ] RAG service initializes properly

---

## 🎯 EXPECTED INSTALLATION TIMES

- **Basic packages (flask, requests):** 1-2 minutes
- **AI packages (anthropic, transformers):** 3-5 minutes  
- **Data packages (numpy, pandas):** 2-4 minutes
- **Vector DB (chromadb):** 3-7 minutes
- **TOTAL:** 10-20 minutes (depending on internet speed)

---

## 🆘 SUPPORT & FALLBACKS

### Jeśli auto_install_dependencies.bat Zawodzi:

#### Plan B: Conda Installation
```bash
# Pobierz Anaconda/Miniconda
# https://www.anaconda.com/download

conda create -n erp_assistant python=3.11
conda activate erp_assistant
conda install flask pandas numpy
pip install anthropic chromadb sentence-transformers
```

#### Plan C: Docker Setup
```bash
# Użyj Docker jeśli lokalnie nie działa
docker-compose up --build
```

#### Plan D: Virtual Environment
```bash
python -m venv erp_env
erp_env\Scripts\activate
python -m pip install -r backend/requirements_fixed.txt
```

---

## ⚡ QUICK COMMANDS REFERENCE

```bash
# Sprawdź wersję Python
python --version

# Sprawdź zainstalowane pakiety
python -m pip list

# Sprawdź konkretny pakiet
python -c "import flask; print(flask.__version__)"

# Reinstall problematycznego pakietu
python -m pip uninstall numpy
python -m pip install numpy==1.24.3

# Wyczyść wszystko i zacznij od nowa
python -m pip freeze > installed_packages.txt
python -m pip uninstall -r installed_packages.txt -y
python -m pip install -r backend/requirements_fixed.txt
```

---

## 🎯 SUCCESS INDICATORS

### ✅ Po Udanej Instalacji Zobaczysz:
```
✅ Podstawowe pakiety zainstalowane!
✅ INSTALACJA ZAKOŃCZONA!
🚀 Następne kroki:
1. Uruchom: cd backend
2. Uruchom: python app.py
3. Otwórz: http://localhost:8000
```

### ✅ Backend Uruchamianie:
```
INFO: Started server process
INFO: Waiting for application startup.
INFO: Application startup complete.
INFO: Uvicorn running on http://0.0.0.0:8000
```

---

**Status:** DEPENDENCY FIXES READY FOR DEPLOYMENT  
**Następny krok:** Uruchom `auto_install_dependencies.bat` i przetestuj system
