@echo off
echo ================================================================
echo 🚀 ERP AI ASSISTANT - AUTO INSTALLATION SCRIPT
echo Rozwiązywanie problemów z Dependencies dla Python 3.11/3.12
echo ================================================================
echo.

echo 📋 Sprawdzenie środowiska...
python --version
if %errorlevel% neq 0 (
    echo ❌ Python nie jest zainstalowany lub niedostępny w PATH
    echo 💡 Pobierz Python 3.11.7 LTS z https://www.python.org/downloads/
    pause
    exit /b 1
)
echo.

echo ⏳ KROK 1: Aktualizacja podstawowych narzędzi...
python -m pip install --upgrade pip setuptools wheel
if %errorlevel% neq 0 (
    echo ❌ Błąd aktualizacji pip
    echo 💡 Spróbuj uruchomić jako Administrator
    pause
    exit /b 1
)

echo ⏳ KROK 2: Czyszczenie cache pip...
python -m pip cache purge

echo ⏳ KROK 3: Instalacja podstawowych pakietów Web Framework...
python -m pip install flask==3.0.0
python -m pip install flask-cors==4.0.0
python -m pip install fastapi==0.104.1
python -m pip install uvicorn==0.24.0
if %errorlevel% neq 0 (
    echo ❌ Błąd instalacji Web Framework
    pause
    exit /b 1
)

echo ⏳ KROK 4: Instalacja utilities...
python -m pip install requests==2.31.0
python -m pip install python-dotenv==1.0.0
python -m pip install pydantic==2.5.1

echo ⏳ KROK 5: Instalacja AI libraries (może potrwać dłużej)...
python -m pip install anthropic==0.8.1
if %errorlevel% neq 0 (
    echo ⚠️ Błąd instalacji Anthropic - kontynuowanie...
)

echo ⏳ KROK 6: Instalacja data processing...
python -m pip install --prefer-binary pandas==2.1.4
python -m pip install --prefer-binary numpy==1.24.3
if %errorlevel% neq 0 (
    echo ⚠️ Błąd instalacji NumPy/Pandas - próba alternatywnej instalacji...
    python -m pip install --only-binary=all pandas numpy
)

echo ⏳ KROK 7: Instalacja Vector Database...
python -m pip install chromadb==0.4.15
if %errorlevel% neq 0 (
    echo ⚠️ Błąd instalacji ChromaDB - kontynuowanie bez Vector DB...
)

echo ⏳ KROK 8: Instalacja document processing...
python -m pip install pypdf2==3.0.1
python -m pip install python-docx==1.1.0
python -m pip install beautifulsoup4==4.12.2

echo ⏳ KROK 9: Testowanie instalacji...
python -c "import flask, anthropic, requests; print('✅ Podstawowe pakiety zainstalowane!')"
if %errorlevel% neq 0 (
    echo ⚠️ Niektóre pakiety mogą nie być dostępne
)

echo.
echo ================================================================
echo ✅ INSTALACJA ZAKOŃCZONA!
echo ================================================================
echo.
echo 🚀 Następne kroki:
echo 1. Uruchom: cd backend
echo 2. Uruchom: python app.py
echo 3. Otwórz: http://localhost:8000
echo.
echo 📋 W przypadku problemów:
echo - Sprawdź czy używasz Python 3.11 lub 3.12 (nie 3.13!)
echo - Uruchom skrypt jako Administrator
echo - Sprawdź połączenie internetowe
echo.
pause
