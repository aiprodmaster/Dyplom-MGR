#!/usr/bin/env python3
"""
Skrypt uruchamiający ERP AI Assistant
"""

import os
import sys
import subprocess
import logging
from pathlib import Path

# Konfiguracja logowania
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def check_python_version():
    """Sprawdzenie wersji Python"""
    if sys.version_info < (3, 9):
        logger.error("❌ Python 3.9+ jest wymagany")
        sys.exit(1)
    logger.info(f"✅ Python {sys.version.split()[0]} OK")

def check_env_file():
    """Sprawdzenie pliku .env"""
    script_dir = Path(__file__).parent
    env_file = script_dir / "backend" / ".env"
    env_example = script_dir / "backend" / ".env.example"
    
    if not env_file.exists():
        if env_example.exists():
            logger.info("📋 Kopiowanie .env.example do .env...")
            import shutil
            shutil.copy(env_example, env_file)
            logger.warning("⚠️ Pamiętaj o uzupełnieniu kluczy API w pliku backend/.env")
        else:
            logger.error("❌ Brak pliku .env.example")
            return False
    
    logger.info("✅ Plik .env OK")
    return True

def install_dependencies():
    """Instalacja zależności"""
    try:
        logger.info("📦 Instalowanie zależności backend...")
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
        ], check=True, cwd=Path(__file__).parent)
        logger.info("✅ Zależności backend zainstalowane")
        
        # Frontend dependencies (jeśli istnieje package.json)
        package_json = Path("frontend/package.json")
        if package_json.exists():
            logger.info("📦 Instalowanie zależności frontend...")
            subprocess.run(["npm", "install"], check=True, cwd="frontend")
            logger.info("✅ Zależności frontend zainstalowane")
        
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Błąd instalacji zależności: {e}")
        return False
    except FileNotFoundError:
        logger.error("❌ Nie znaleziono pip lub npm")
        return False

def create_directories():
    """Tworzenie wymaganych katalogów"""
    script_dir = Path(__file__).parent
    directories = [
        script_dir / "backend" / "data",
        script_dir / "backend" / "data" / "uploads", 
        script_dir / "backend" / "data" / "chroma_db",
        script_dir / "backend" / "logs"
    ]
    
    for directory in directories:
        directory.mkdir(parents=True, exist_ok=True)
        logger.info(f"📁 Katalog {directory} utworzony/sprawdzony")

def run_backend():
    """Uruchomienie backend serwera"""
    try:
        logger.info("🚀 Uruchamianie backend serwera...")
        logger.info("🌐 Backend będzie dostępny pod: http://localhost:8000")
        logger.info("📚 Dokumentacja API: http://localhost:8000/docs")
        
        # Ścieżka do katalogu backend
        script_dir = Path(__file__).parent
        backend_dir = script_dir / "backend"
        
        # Uruchomienie z uvicorn
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "app.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000", 
            "--reload"
        ], check=True, cwd=backend_dir)
        
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ Błąd uruchamiania backend: {e}")
        return False
    except KeyboardInterrupt:
        logger.info("🛑 Backend zatrzymany przez użytkownika")
        return True

def main():
    """Główna funkcja"""
    logger.info("🚀 Uruchamianie ERP AI Assistant...")
    logger.info("=" * 50)
    
    # Sprawdzenia wstępne
    check_python_version()
    
    if not check_env_file():
        sys.exit(1)
    
    # Tworzenie katalogów
    create_directories()
    
    # Pytanie o instalację zależności
    install_deps = input("📦 Czy zainstalować/zaktualizować zależności? (y/n): ").lower().strip()
    if install_deps in ['y', 'yes', 'tak', 't']:
        if not install_dependencies():
            logger.error("❌ Nie udało się zainstalować zależności")
            sys.exit(1)
    
    logger.info("=" * 50)
    logger.info("✅ Wszystkie sprawdzenia przeszły pomyślnie!")
    logger.info("🎉 Uruchamianie aplikacji...")
    logger.info("=" * 50)
    
    # Uruchomienie backend
    run_backend()

if __name__ == "__main__":
    main()
