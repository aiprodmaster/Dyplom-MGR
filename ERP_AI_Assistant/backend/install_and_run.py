#!/usr/bin/env python3
"""
Skrypt instalacji i uruchomienia ERP AI Assistant Backend
Backend używa Claude API + RAG - bez fallback modeli
"""

import subprocess
import sys
import os
import platform

def print_header():
    print("=" * 60)
    print("🚀 ERP AI Assistant - Claude API + RAG Backend")
    print("=" * 60)
    print()

def check_python_version():
    """Sprawdzenie wersji Python"""
    print("🔍 Sprawdzanie wersji Python...")
    
    if sys.version_info < (3, 8):
        print("❌ Wymagana Python 3.8 lub nowszy!")
        print(f"   Obecna wersja: {sys.version}")
        sys.exit(1)
    
    print(f"✅ Python {sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}")

def check_api_key():
    """Sprawdzenie klucza API Claude"""
    print("\n🔑 Sprawdzanie klucza API Claude...")
    
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        print("❌ Brak klucza API Claude!")
        print("💡 Ustaw zmienną środowiskową ANTHROPIC_API_KEY:")
        print("   Windows: set ANTHROPIC_API_KEY=twoj_klucz")
        print("   Linux/Mac: export ANTHROPIC_API_KEY=twoj_klucz")
        print("   Lub dodaj do pliku .env: ANTHROPIC_API_KEY=twoj_klucz")
        return False
    
    print(f"✅ Klucz API Claude skonfigurowany (końcówka: ...{api_key[-8:]})")
    return True

def install_requirements():
    """Instalacja wymaganych bibliotek - tylko Claude API + RAG"""
    print("\n📦 Instalowanie bibliotek Claude API + RAG...")
    
    try:
        # Aktualizacja pip
        print("📦 Aktualizacja pip...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "--upgrade", "pip"])
        
        # Instalacja z requirements.txt
        if os.path.exists("requirements.txt"):
            print("📦 Instalowanie z requirements.txt...")
            subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        else:
            # Fallback - bezpośrednia instalacja
            packages = [
                "anthropic==0.8.1",
                "sentence-transformers==2.2.2", 
                "chromadb==0.4.18",
                "flask==3.0.0",
                "flask-cors==4.0.0",
                "requests==2.31.0",
                "python-dotenv==1.0.0"
            ]
            
            print("📦 Instalowanie podstawowych bibliotek...")
            subprocess.check_call([sys.executable, "-m", "pip", "install"] + packages)
        
        print("✅ Wszystkie biblioteki zainstalowane!")
        print("📝 Zainstalowane komponenty:")
        print("   • Claude API (anthropic)")
        print("   • Embeddings model (sentence-transformers)")
        print("   • Vector database (chromadb)")
        print("   • Web framework (flask)")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd instalacji: {e}")
        print("💡 Spróbuj uruchomić ręcznie: pip install -r requirements.txt")
        return False
    
    return True

def download_embedding_model():
    """Pobieranie modelu embeddings dla RAG"""
    print("\n🧠 Pobieranie modelu embeddings dla RAG...")
    
    try:
        # Skrypt do pobierania modelu embeddings
        model_script = '''
from sentence_transformers import SentenceTransformer

print("📥 Pobieranie modelu sentence-transformers dla RAG...")
model = SentenceTransformer('paraphrase-multilingual-MiniLM-L12-v2')
print("✅ Model embeddings pobrany!")
'''
        
        # Uruchomienie skryptu pobierania
        subprocess.run([sys.executable, "-c", model_script], check=True)
        print("✅ Model embeddings gotowy do RAG!")
        return True
        
    except Exception as e:
        print(f"⚠️ Błąd pobierania modelu: {e}")
        print("💡 Model zostanie pobrany przy pierwszym uruchomieniu")
        return False

def check_architecture():
    """Sprawdzenie architektury systemu"""
    print("\n🏗️ Architektura systemu:")
    print("   • AI Provider: Claude API (Anthropic)")
    print("   • RAG: ChromaDB + Sentence Transformers")
    print("   • Fallback models: USUNIĘTE")
    print("   • Backend: Flask")
    
    if not check_api_key():
        return False
    
    return True

def run_server():
    """Uruchomienie serwera Claude API + RAG"""
    print("\n🌐 Uruchamianie serwera Claude AI + RAG...")
    print("📍 URL: http://localhost:5000")
    print("📊 Panel zdrowia: http://localhost:5000/api/health")
    print("🔧 Status modeli: http://localhost:5000/api/models/status")
    print("📈 Dashboard CRM: http://localhost:5000/api/crm/dashboard")
    print("\n⚡ Aby zatrzymać serwer, użyj Ctrl+C")
    print("=" * 60)
    
    try:
        # Uruchomienie głównej aplikacji
        subprocess.run([sys.executable, "app.py"], check=True)
    except KeyboardInterrupt:
        print("\n\n🛑 Serwer zatrzymany przez użytkownika")
    except Exception as e:
        print(f"\n❌ Błąd serwera: {e}")
        print("💡 Sprawdź czy klucz ANTHROPIC_API_KEY jest poprawny")

def main():
    """Główna funkcja"""
    print_header()
    
    # Sprawdzenie Python
    check_python_version()
    
    # Sprawdzenie architektury i kluczy API
    if not check_architecture():
        print("\n❌ Konfiguracja niepełna. Ustaw klucz API i spróbuj ponownie.")
        sys.exit(1)
    
    # Sprawdzenie czy biblioteki są zainstalowane
    requirements_file = "requirements.txt"
    if os.path.exists(requirements_file):
        print("📋 Znaleziono requirements.txt")
        
        # Pytanie o instalację
        install = input("\n❓ Zainstalować/zaktualizować biblioteki? [t/N]: ").strip().lower()
        
        if install in ['t', 'tak', 'y', 'yes']:
            if not install_requirements():
                sys.exit(1)
            
            # Pobieranie modelu embeddings
            download_embedding_model()
    
    # Sprawdzenie czy app.py istnieje
    if not os.path.exists("app.py"):
        print("❌ Nie znaleziono app.py!")
        print("💡 Upewnij się, że jesteś w katalogu backend/")
        sys.exit(1)
    
    # Ostatnie sprawdzenie klucza API
    if not check_api_key():
        print("\n❌ Nie można uruchomić bez klucza API Claude")
        sys.exit(1)
    
    # Uruchomienie serwera
    run_server()

if __name__ == "__main__":
    main()
