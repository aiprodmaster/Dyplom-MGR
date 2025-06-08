@echo off
echo ===============================================
echo ERP AI ASSISTANT - SZYBKA NAPRAWKA WINDOWS
echo ===============================================

echo [1/4] Zmieniam kodowanie na UTF-8...
chcp 65001 >nul

echo [2/4] Usuwam problematyczne pliki cache...
if exist "*.db" del /q "*.db" 2>nul
if exist "*.sqlite" del /q "*.sqlite" 2>nul
if exist "*.sqlite3" del /q "*.sqlite3" 2>nul
if exist "chroma_db" rmdir /s /q "chroma_db" 2>nul
if exist "data\chroma_db" rmdir /s /q "data\chroma_db" 2>nul

echo [3/4] Ustawiam zmienne środowiskowe...
set PYTHONIOENCODING=utf-8
set PYTHONLEGACYWINDOWSSTDIO=utf-8

echo [4/4] Naprawiam emoji w kodzie...
python fix_system_windows.py quick

echo.
echo ===============================================
echo NAPRAWKA ZAKOŃCZONA!
echo ===============================================
echo.
echo Uruchamiam aplikację...
echo.

python app.py

pause
