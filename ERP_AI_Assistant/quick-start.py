#!/usr/bin/env python3
"""
=================================================================================
ERP AI ASSISTANT - QUICK START SCRIPT
Automatyczne uruchamianie i konfiguracja systemu
=================================================================================
"""

import os
import sys
import subprocess
import shutil
import platform
from pathlib import Path

def print_banner():
    """Wyświetl banner aplikacji"""
    print("=" * 80)
    print("🚀 ERP AI ASSISTANT - QUICK START")
    print("Advanced RAG + Claude API dla wdrożeń ERP")
    print("=" * 80)
    print()

def check_python_version():
    """Sprawdź wersję Pythona"""
    version = sys.version_info
    if version.major < 3 or (version.major == 3 and version.minor < 8):
        print("❌ Wymagany Python 3.8 lub nowszy")
        print(f"   Obecnie: Python {version.major}.{version.minor}.{version.micro}")
        sys.exit(1)
    else:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro} - OK")

def check_dependencies():
    """Sprawdź dostępność narzędzi"""
    tools = {
        'pip': 'pip --version',
        'git': 'git --version'
    }
    
    for tool, command in tools.items():
        try:
            subprocess.run(command.split(), capture_output=True, check=True)
            print(f"✅ {tool} - dostępny")
        except (subprocess.CalledProcessError, FileNotFoundError):
            print(f"⚠️ {tool} - niedostępny (opcjonalny)")

def setup_directories():
    """Utwórz niezbędne katalogi"""
    directories = [
        "backend/data/chroma_db",
        "backend/data/knowledge_base", 
        "backend/logs",
        "frontend/build",
        "docs/screenshots"
    ]
    
    for directory in directories:
        Path(directory).mkdir(parents=True, exist_ok=True)
        print(f"📁 Utworzono: {directory}")

def install_requirements():
    """Zainstaluj wymagane pakiety"""
    requirements_file = "backend/requirements.txt"
    
    if not os.path.exists(requirements_file):
        print(f"❌ Nie znaleziono: {requirements_file}")
        return False
    
    print("📦 Instalowanie zależności Python...")
    try:
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", requirements_file
        ], check=True)
        print("✅ Zależności zainstalowane pomyślnie")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd instalacji: {e}")
        return False

def setup_environment():
    """Skonfiguruj plik środowiskowy"""
    env_example = ".env.example"
    env_file = "backend/.env"
    
    if os.path.exists(env_example) and not os.path.exists(env_file):
        shutil.copy(env_example, env_file)
        print(f"📝 Skopiowano {env_example} → {env_file}")
        print("🔧 Edytuj backend/.env i dodaj swój klucz ANTHROPIC_API_KEY")
        return True
    elif os.path.exists(env_file):
        print("✅ Plik .env już istnieje")
        return True
    else:
        print("⚠️ Nie znaleziono .env.example")
        return False

def check_api_key():
    """Sprawdź czy klucz API jest skonfigurowany"""
    env_file = "backend/.env"
    
    if not os.path.exists(env_file):
        print("❌ Brak pliku .env")
        return False
    
    with open(env_file, 'r') as f:
        content = f.read()
        if "ANTHROPIC_API_KEY=sk-ant-api03-" in content and "your-claude-api-key-here" not in content:
            print("✅ Klucz Claude API skonfigurowany")
            return True
        else:
            print("⚠️ Klucz Claude API nie jest skonfigurowany")
            print("   Edytuj backend/.env i dodaj właściwy klucz ANTHROPIC_API_KEY")
            return False

def test_installation():
    """Przetestuj instalację"""
    print("\n🧪 Testowanie instalacji...")
    
    try:
        # Test importów
        import anthropic
        import chromadb
        import sentence_transformers
        import flask
        print("✅ Kluczowe biblioteki - OK")
        
        # Test struktury plików
        required_files = [
            "backend/app.py",
            "backend/advanced_rag_service.py",
            "backend/install_and_run.py"
        ]
        
        for file in required_files:
            if os.path.exists(file):
                print(f"✅ {file} - OK")
            else:
                print(f"❌ {file} - BRAK")
                return False
        
        return True
        
    except ImportError as e:
        print(f"❌ Błąd importu: {e}")
        return False

def start_application():
    """Uruchom aplikację"""
    print("\n🚀 Uruchamianie aplikacji...")
    
    # Przejdź do katalogu backend
    backend_dir = "backend"
    if os.path.exists(backend_dir):
        os.chdir(backend_dir)
        print(f"📂 Przejście do katalogu: {backend_dir}")
    
    # Uruchom aplikację
    try:
        print("🔥 Uruchamianie serwera Flask...")
        print("🌐 Aplikacja będzie dostępna na: http://localhost:5000")
        print("⏹️ Naciśnij Ctrl+C aby zatrzymać serwer")
        print("-" * 50)
        
        # Uruchom app.py
        subprocess.run([sys.executable, "app.py"], check=True)
        
    except KeyboardInterrupt:
        print("\n🛑 Serwer zatrzymany przez użytkownika")
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd uruchamiania: {e}")
        print("💡 Spróbuj uruchomić ręcznie: cd backend && python app.py")

def show_usage_info():
    """Pokaż informacje o użyciu"""
    print("\n📋 Dostępne interfejsy:")
    print("   🏠 Główna strona:      http://localhost:5000")
    print("   💬 Professional Chat: http://localhost:5000/professional-chat.html")
    print("   🎯 Digital Twin:      http://localhost:5000/digital-twin-advanced.html")
    print("   📊 API Health:        http://localhost:5000/api/health")
    print()
    print("📖 Dokumentacja: README.md")
    print("🆘 Pomoc: Sprawdź logi w backend/erp_assistant.log")

def main():
    """Główna funkcja quick start"""
    print_banner()
    
    # Sprawdzenia wstępne
    check_python_version()
    check_dependencies()
    
    # Konfiguracja
    setup_directories()
    setup_environment()
    
    # Instalacja
    if not install_requirements():
        print("❌ Nie udało się zainstalować zależności")
        sys.exit(1)
    
    # Sprawdzenie konfiguracji
    api_key_ok = check_api_key()
    
    # Test instalacji
    if not test_installation():
        print("❌ Test instalacji nieudany")
        sys.exit(1)
    
    print("\n" + "=" * 50)
    print("✅ INSTALACJA ZAKOŃCZONA POMYŚLNIE!")
    print("=" * 50)
    
    if not api_key_ok:
        print("\n⚠️ UWAGA: Skonfiguruj klucz Claude API przed uruchomieniem")
        print("   1. Edytuj backend/.env")
        print("   2. Dodaj: ANTHROPIC_API_KEY=sk-ant-api03-twoj-klucz")
        print("   3. Uruchom ponownie: python quick-start.py")
        return
    
    show_usage_info()
    
    # Zapytaj o uruchomienie
    if input("\n🚀 Uruchomić aplikację teraz? (y/n): ").lower().strip() in ['y', 'yes', 't', 'tak']:
        start_application()
    else:
        print("\n💡 Aby uruchomić później:")
        print("   cd backend && python app.py")
        print("   lub: python quick-start.py")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\n🛑 Przerwano przez użytkownika")
    except Exception as e:
        print(f"\n❌ Nieoczekiwany błąd: {e}")
        import traceback
        traceback.print_exc()
