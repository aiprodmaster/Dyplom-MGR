#!/usr/bin/env python3
"""
=================================================================================
ENHANCED ERP ASSISTANT STARTER
Automatyczny launcher dla Enhanced RAG v3.0 z inteligentną inicjalizacją
=================================================================================
"""

import os
import sys
import time
import subprocess
import logging
from pathlib import Path

# Add current directory to path
current_dir = Path(__file__).parent
sys.path.append(str(current_dir))

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('enhanced_startup.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def check_dependencies():
    """Sprawdza i instaluje wymagane zależności"""
    logger.info("🔍 Sprawdzanie zależności...")
    
    required_packages = [
        'flask',
        'flask-cors',
        'anthropic',
        'sentence-transformers',
        'chromadb',
        'python-dotenv',
        'psutil',
        'numpy'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            logger.info(f"✅ {package} - dostępny")
        except ImportError:
            logger.warning(f"❌ {package} - brak")
            missing_packages.append(package)
    
    if missing_packages:
        logger.info(f"📦 Instalowanie brakujących pakietów: {', '.join(missing_packages)}")
        try:
            for package in missing_packages:
                subprocess.check_call([
                    sys.executable, '-m', 'pip', 'install', package
                ])
                logger.info(f"✅ Zainstalowano {package}")
        except subprocess.CalledProcessError as e:
            logger.error(f"❌ Błąd instalacji: {e}")
            return False
    
    return True

def check_environment():
    """Sprawdza konfigurację środowiska"""
    logger.info("🔧 Sprawdzanie konfiguracji środowiska...")
    
    # Check .env file
    env_file = current_dir / '.env'
    if not env_file.exists():
        logger.warning("⚠️ Brak pliku .env - tworzę przykładowy")
        create_env_file()
    
    # Load environment variables
    from dotenv import load_dotenv
    load_dotenv()
    
    # Check critical variables
    api_key = os.getenv('ANTHROPIC_API_KEY')
    if not api_key:
        logger.error("❌ ANTHROPIC_API_KEY nie jest ustawiony!")
        logger.info("💡 Ustaw ANTHROPIC_API_KEY w pliku .env")
        return False
    
    logger.info("✅ Konfiguracja środowiska OK")
    return True

def create_env_file():
    """Tworzy przykładowy plik .env"""
    env_content = """# ERP AI Assistant Enhanced Configuration
# Ustaw rzeczywisty klucz API Claude
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Modele Claude
CLAUDE_MODEL=claude-3-5-sonnet-20241022
CLAUDE_HAIKU_MODEL=claude-3-haiku-20240307

# Embedding model
EMBEDDING_MODEL=paraphrase-multilingual-MiniLM-L12-v2

# Database paths
VECTOR_DB_PATH=chroma_db

# Server configuration
HOST=127.0.0.1
PORT=5000
DEBUG=False

# RAG configuration
MAX_CONTEXT_LENGTH=3000
MAX_TOKENS=4096

# Security
SECRET_KEY=enhanced-erp-2025-secure-key
"""
    
    env_file = current_dir / '.env'
    with open(env_file, 'w', encoding='utf-8') as f:
        f.write(env_content)
    
    logger.info(f"📝 Utworzono plik .env: {env_file}")

def check_vector_database():
    """Sprawdza dostępność bazy wektorowej"""
    logger.info("🗄️ Sprawdzanie bazy wektorowej...")
    
    try:
        import chromadb
        from chromadb.config import Settings
        
        db_path = os.getenv('VECTOR_DB_PATH', 'chroma_db')
        client = chromadb.PersistentClient(
            path=db_path,
            settings=Settings(anonymized_telemetry=False)
        )
        
        # Try to access collection
        collection = client.get_or_create_collection(
            name="enhanced_erp_documents",
            metadata={"description": "Enhanced ERP Documentation"}
        )
        
        doc_count = collection.count()
        logger.info(f"✅ Baza wektorowa OK - {doc_count} dokumentów")
        return True
        
    except Exception as e:
        logger.error(f"❌ Błąd bazy wektorowej: {e}")
        return False

def initialize_system():
    """Inicjalizuje system Enhanced RAG"""
    logger.info("🚀 Inicjalizacja Enhanced RAG v3.0...")
    
    try:
        # Import enhanced application
        from app_enhanced import EnhancedERPApplication
        
        # Create application instance
        app = EnhancedERPApplication()
        
        # Check if initialization is needed
        if app.vector_service and app.vector_service.collection.count() == 0:
            logger.info("📚 Inicjalizacja z przykładowymi dokumentami...")
            
            # Get sample documents
            sample_docs = app._get_enhanced_sample_documents()
            documents = [doc['content'] for doc in sample_docs]
            metadatas = [doc['metadata'] for doc in sample_docs]
            
            # Initialize Enhanced RAG
            if app.enhanced_rag_service:
                app.enhanced_rag_service.initialize_with_documents(documents, metadatas)
                logger.info(f"✅ Zainicjalizowano Enhanced RAG z {len(documents)} dokumentami")
            else:
                logger.warning("⚠️ Enhanced RAG Service niedostępny")
        
        return app
        
    except Exception as e:
        logger.error(f"❌ Błąd inicjalizacji: {e}")
        import traceback
        traceback.print_exc()
        return None

def start_server(app):
    """Uruchamia serwer Enhanced ERP"""
    logger.info("🌐 Uruchamianie serwera Enhanced ERP...")
    
    try:
        # Start server
        app.run()
        
    except KeyboardInterrupt:
        logger.info("⏹️ Serwer zatrzymany przez użytkownika")
    except Exception as e:
        logger.error(f"❌ Błąd serwera: {e}")

def main():
    """Główna funkcja launcher'a"""
    print("=" * 80)
    print("🚀 ENHANCED ERP ASSISTANT LAUNCHER")
    print("=" * 80)
    
    # Step 1: Check dependencies
    if not check_dependencies():
        print("❌ Błąd zależności - sprawdź logi")
        return 1
    
    # Step 2: Check environment
    if not check_environment():
        print("❌ Błąd konfiguracji - sprawdź plik .env")
        return 1
    
    # Step 3: Check vector database
    if not check_vector_database():
        print("⚠️ Ostrzeżenie: Problem z bazą wektorową")
    
    # Step 4: Initialize system
    app = initialize_system()
    if not app:
        print("❌ Błąd inicjalizacji systemu")
        return 1
    
    # Step 5: Start server
    print("✅ System gotowy - uruchamianie serwera...")
    start_server(app)
    
    return 0

if __name__ == '__main__':
    exit_code = main()
    sys.exit(exit_code)
