@echo off
chcp 65001 >nul
title Comarch ERP XL - Web Scraper Setup

echo 🚀 Comarch ERP XL - Quick Setup
echo ================================

echo.
echo 📋 KROKI:
echo 1. Instalacja zależności
echo 2. Uruchomienie scrapingu
echo 3. Start asystenta AI
echo.

pause

echo 📦 Instalowanie zależności...
cd backend
pip install -r requirements.txt

echo.
echo ✅ Zależności zainstalowane!
echo.

echo 🕷️ Uruchamianie scrapingu...
echo UWAGA: Ten proces może potrwać kilka minut
echo.
python scrape_comarch_help.py

echo.
echo 🎉 SCRAPING ZAKOŃCZONY!
echo.
echo 🚀 Uruchamianie asystenta AI...
python app.py

pause
