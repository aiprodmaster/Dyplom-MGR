@echo off
chcp 65001 >nul
echo ================================================================================
echo 🚀 ENHANCED ERP ASSISTANT LAUNCHER - Windows
echo ================================================================================

echo 📂 Przejście do katalogu backend...
cd /d "%~dp0"

echo 🐍 Sprawdzanie Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python nie jest dostępny w PATH
    echo 💡 Zainstaluj Python lub dodaj go do PATH
    pause
    exit /b 1
)

echo ✅ Python dostępny
echo.

echo 🚀 Uruchamianie Enhanced ERP Assistant...
python start_enhanced.py

if errorlevel 1 (
    echo.
    echo ❌ Błąd uruchamiania aplikacji
    echo 📋 Sprawdź logi: enhanced_startup.log
    pause
)

echo.
echo 👋 Enhanced ERP Assistant zakończył działanie
pause
