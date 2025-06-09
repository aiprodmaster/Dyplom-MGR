#!/usr/bin/env python3
"""
Prosty skrypt instalacji zależności z pre-compiled wheels dla Python 3.13
"""

import subprocess
import sys
import os

def install_package(package):
    """Instaluje pakiet z obsługą błędów"""
    print(f"🔄 Instaluję {package}...")
    try:
        result = subprocess.run([
            sys.executable, '-m', 'pip', 'install', package, '--only-binary=all'
        ], check=True, capture_output=True, text=True)
        print(f"✅ {package} - zainstalowany!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ {package} - błąd: {e}")
        return False

def main():
    """Główna funkcja instalacji"""
    print("🚀 Uproszczona instalacja dla Python 3.13")
    
    # Przejdź do katalogu backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    
    # Lista pakietów do instalacji (tylko te niezbędne)
    essential_packages = [
        "fastapi==0.104.1",
        "uvicorn[standard]==0.24.0",
        "python-multipart==0.0.6",
        "sqlalchemy==2.0.23",
        "pydantic==2.5.0",
        "pydantic-settings==2.1.0",
        "httpx==0.25.2",
        "aiofiles==23.2.1",
        "requests==2.31.0",
        "python-decouple==3.8",
        "structlog==23.2.0",
        "rich==13.7.0",
    ]
    
    # Pakiety AI (próbujemy różne wersje)
    ai_packages = [
        "openai==1.6.1",
        "tiktoken==0.5.2",
        "pypdf2==3.0.1",
        "python-docx==1.1.0"
    ]
    
    # Instalacja podstawowych pakietów
    failed_packages = []
    
    for package in essential_packages:
        if not install_package(package):
            failed_packages.append(package)
    
    # Instalacja pakietów AI
    for package in ai_packages:
        if not install_package(package):
            failed_packages.append(package)
    
    # Próba instalacji langchain (uproszczona wersja)
    langchain_packages = [
        "langchain-core==0.1.23",
        "langchain-openai==0.0.8",
    ]
    
    for package in langchain_packages:
        install_package(package)  # Nie dodajemy do failed - może się nie udać
    
    if failed_packages:
        print(f"\n⚠️ Nie udało się zainstalować: {failed_packages}")
        print("Aplikacja może działać z ograniczoną funkcjonalnością.")
    else:
        print("\n🎉 Podstawowe pakiety zainstalowane!")
    
    print("\n📝 Sprawdzenie instalacji...")
    test_packages = ['fastapi', 'uvicorn', 'openai']
    
    for package in test_packages:
        try:
            __import__(package)
            print(f"✅ {package}")
        except ImportError:
            print(f"❌ {package}")
    
    print("\n🚀 Uruchom aplikację: python ../run.py")

if __name__ == "__main__":
    main()
