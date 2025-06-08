#!/usr/bin/env python3
"""
=============================================================================
NAPRAWKA PROBLEMÓW UNICODE I BAZY DANYCH - Windows
=============================================================================
"""

import os
import sys
import locale
import logging
import sqlite3
import glob
from datetime import datetime

# 1. NAPRAWKA KODOWANIA UNICODE
# =============================================================================

def fix_unicode_logging():
    """Naprawia problemy z Unicode w loggingu na Windows"""
    
    # Ustaw kodowanie UTF-8 dla całego procesu
    if sys.platform == "win32":
        # Dla Python 3.7+
        if hasattr(sys.stdout, 'reconfigure'):
            sys.stdout.reconfigure(encoding='utf-8')
            sys.stderr.reconfigure(encoding='utf-8')
        
        # Alternatywnie - zmień zmienne środowiskowe
        os.environ["PYTHONIOENCODING"] = "utf-8"
        
        # Ustaw locale
        try:
            locale.setlocale(locale.LC_ALL, 'en_US.UTF-8')
        except:
            try:
                locale.setlocale(locale.LC_ALL, 'C.UTF-8')
            except:
                pass

# 2. BEZPIECZNY LOGGER BEZ EMOJI
# =============================================================================

class SafeFormatter(logging.Formatter):
    """Formatter który usuwa emoji na Windows"""
    
    EMOJI_MAP = {
        '✅': '[OK]',
        '🧠': '[AI]',
        '🚀': '[START]',
        '📂': '[DOCS]',
        '🗃️': '[SQL]',
        '📍': '[INFO]',
        '🏠': '[HOME]',
        '❤️': '[HEALTH]',
        '🤖': '[BOT]',
        '📊': '[DASH]',
        '📈': '[ANALYTICS]',
        '⚡': '[POWER]',
        '🔧': '[CONFIG]',
        '💡': '[TIP]',
        '⚠️': '[WARN]',
        '❌': '[ERROR]',
        '🔍': '[SEARCH]',
        '📁': '[FOLDER]',
        '🛑': '[STOP]'
    }
    
    def format(self, record):
        # Konwertuj emoji na tekst na Windows
        if sys.platform == "win32":
            message = str(record.getMessage())
            for emoji, text in self.EMOJI_MAP.items():
                message = message.replace(emoji, text)
            record.msg = message
        
        return super().format(record)

# 3. KONFIGURACJA LOGGERA
# =============================================================================

def setup_safe_logging():
    """Konfiguruje bezpieczny logging dla Windows"""
    
    # Usuń istniejące handlery
    for handler in logging.root.handlers[:]:
        logging.root.removeHandler(handler)
    
    # Utwórz nowy handler z bezpiecznym formatowaniem
    handler = logging.StreamHandler()
    
    if sys.platform == "win32":
        # Windows - bez emoji
        formatter = SafeFormatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    else:
        # Linux/Mac - z emoji
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
    
    handler.setFormatter(formatter)
    
    # Konfiguruj root logger
    logging.basicConfig(
        level=logging.INFO,
        handlers=[handler],
        encoding='utf-8' if sys.version_info >= (3, 9) else None
    )

# 4. NAPRAWKA BAZY DANYCH
# =============================================================================

def fix_database_schema():
    """Naprawia schemat bazy danych cache"""
    
    print("[NAPRAWKA] Sprawdzam bazy danych cache...")
    
    # Lista możliwych plików bazy danych
    db_files = ['cache.db', 'document_cache.db', 'demo_erp.db']
    
    for db_file in db_files:
        if os.path.exists(db_file):
            print(f"[FOUND] Znaleziono bazę: {db_file}")
            try:
                conn = sqlite3.connect(db_file)
                cursor = conn.cursor()
                
                # Sprawdź czy tabela istnieje
                cursor.execute("""
                    SELECT name FROM sqlite_master 
                    WHERE type='table' AND name='document_cache'
                """)
                
                if not cursor.fetchone():
                    # Utwórz nową tabelę
                    cursor.execute("""
                        CREATE TABLE document_cache (
                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                            file_path TEXT UNIQUE NOT NULL,
                            content_hash TEXT NOT NULL,
                            content TEXT,
                            metadata TEXT,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    print(f"[OK] Utworzono tabelę document_cache w {db_file}")
                else:
                    # Sprawdź czy kolumna content_hash istnieje
                    cursor.execute("PRAGMA table_info(document_cache)")
                    columns = [row[1] for row in cursor.fetchall()]
                    
                    if 'content_hash' not in columns:
                        # Dodaj brakującą kolumnę
                        cursor.execute("""
                            ALTER TABLE document_cache 
                            ADD COLUMN content_hash TEXT
                        """)
                        print(f"[OK] Dodano kolumnę content_hash do {db_file}")
                    else:
                        print(f"[OK] Schemat {db_file} jest prawidłowy")
                
                conn.commit()
                conn.close()
                
            except Exception as e:
                print(f"[ERROR] Błąd naprawy bazy {db_file}: {e}")

def clean_problematic_cache():
    """Usuwa problematyczne pliki cache"""
    
    print("[CLEANUP] Usuwam problematyczne pliki cache...")
    
    # Usuń wszystkie pliki .db które mogą powodować problemy
    db_patterns = ["*.db", "*.sqlite", "*.sqlite3"]
    
    for pattern in db_patterns:
        for file_path in glob.glob(pattern):
            try:
                # Sprawdź czy plik jest aktualnie używany
                try:
                    os.rename(file_path, file_path)  # Test czy można modyfikować
                    os.remove(file_path)
                    print(f"[REMOVED] Usunięto: {file_path}")
                except PermissionError:
                    print(f"[SKIP] Plik w użyciu: {file_path}")
                except:
                    pass
            except Exception as e:
                print(f"[ERROR] Nie można usunąć {file_path}: {e}")
    
    # Usuń także cache ChromaDB
    chroma_dirs = ["chroma_db", "data/chroma_db"]
    for chroma_dir in chroma_dirs:
        if os.path.exists(chroma_dir):
            try:
                import shutil
                shutil.rmtree(chroma_dir)
                print(f"[REMOVED] Usunięto katalog: {chroma_dir}")
            except Exception as e:
                print(f"[ERROR] Nie można usunąć {chroma_dir}: {e}")

# 5. NAPRAWKA PLIKU APP.PY - EMOJI
# =============================================================================

def fix_app_py_emoji():
    """Naprawia emoji w pliku app.py"""
    
    app_py_path = "app.py"
    if not os.path.exists(app_py_path):
        print(f"[SKIP] Plik {app_py_path} nie istnieje")
        return
    
    print(f"[NAPRAWKA] Poprawiam emoji w {app_py_path}...")
    
    emoji_replacements = {
        'logger.info("✅': 'logger.info("[OK]',
        'logger.info("🧠': 'logger.info("[AI]',
        'logger.info("🚀': 'logger.info("[START]',
        'logger.info("📂': 'logger.info("[DOCS]',
        'logger.info("🗃️': 'logger.info("[SQL]',
        'logger.info("📍': 'logger.info("[INFO]',
        'logger.info("🏠': 'logger.info("[HOME]',
        'logger.info("❤️': 'logger.info("[HEALTH]',
        'logger.info("🤖': 'logger.info("[BOT]',
        'logger.info("📊': 'logger.info("[DASH]',
        'logger.info("📈': 'logger.info("[ANALYTICS]',
        'logger.info("⚡': 'logger.info("[POWER]',
        'logger.info("🔧': 'logger.info("[CONFIG]',
        'logger.info("💡': 'logger.info("[TIP]',
        'logger.warning("⚠️': 'logger.warning("[WARN]',
        'logger.error("❌': 'logger.error("[ERROR]',
        'logger.info("🔍': 'logger.info("[SEARCH]',
        'logger.info("📁': 'logger.info("[FOLDER]',
        'logger.info("🛑': 'logger.info("[STOP]',
        # Także w printach
        'print("✅': 'print("[OK]',
        'print("❌': 'print("[ERROR]',
        'print("⚠️': 'print("[WARN]',
        'print("🚀': 'print("[START]',
        'print("🔍': 'print("[SEARCH]',
        'print("📁': 'print("[FOLDER]'
    }
    
    try:
        # Czytaj plik
        with open(app_py_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Wykonaj zamianę
        modified = False
        for old, new in emoji_replacements.items():
            if old in content:
                content = content.replace(old, new)
                modified = True
        
        # Zapisz jeśli były zmiany
        if modified:
            with open(app_py_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Naprawiono emoji w {app_py_path}")
        else:
            print(f"[OK] Brak emoji do naprawy w {app_py_path}")
            
    except Exception as e:
        print(f"[ERROR] Błąd naprawy app.py: {e}")

# 6. SPRAWDŹ KODOWANIE SYSTEMU
# =============================================================================

def check_system_encoding():
    """Sprawdza kodowanie systemu"""
    
    print("[SYSTEM] Sprawdzam kodowanie systemu...")
    
    try:
        print(f"[INFO] Platform: {sys.platform}")
        print(f"[INFO] Default encoding: {sys.getdefaultencoding()}")
        print(f"[INFO] File system encoding: {sys.getfilesystemencoding()}")
        print(f"[INFO] Locale: {locale.getdefaultlocale()}")
        
        if sys.stdout.encoding:
            print(f"[INFO] STDOUT encoding: {sys.stdout.encoding}")
        
        if hasattr(sys, 'getwindowsversion'):
            print(f"[INFO] Windows version: {sys.getwindowsversion()}")
            
    except Exception as e:
        print(f"[ERROR] Błąd sprawdzania kodowania: {e}")

# 7. GŁÓWNA FUNKCJA NAPRAWCZA
# =============================================================================

def main_fix():
    """Wykonuje wszystkie naprawki"""
    
    print("=" * 60)
    print("NAPRAWKA SYSTEMU ERP AI ASSISTANT - Windows")
    print("=" * 60)
    
    # 1. Sprawdź system
    print("\n[1/6] Sprawdzam kodowanie systemu...")
    check_system_encoding()
    
    # 2. Napraw Unicode
    print("\n[2/6] Naprawiam kodowanie Unicode...")
    fix_unicode_logging()
    
    # 3. Konfiguruj bezpieczny logging
    print("\n[3/6] Konfiguruję bezpieczny logging...")
    setup_safe_logging()
    
    # 4. Czyść cache
    print("\n[4/6] Czyszczę problematyczny cache...")
    clean_problematic_cache()
    
    # 5. Napraw bazę danych
    print("\n[5/6] Naprawiam bazy danych...")
    fix_database_schema()
    
    # 6. Napraw emoji w kodzie
    print("\n[6/6] Naprawiam emoji w app.py...")
    fix_app_py_emoji()
    
    print("\n" + "=" * 60)
    print("NAPRAWKA ZAKOŃCZONA POMYŚLNIE!")
    print("=" * 60)
    print("\nTeraz możesz uruchomić aplikację:")
    print("1. Otwórz terminal Windows (CMD lub PowerShell)")
    print("2. Przejdź do katalogu z aplikacją")
    print("3. Uruchom: python app.py")
    print("\nAlbo użyj szybkiej komendy:")
    print("chcp 65001 && python app.py")
    print("=" * 60)

# 8. SZYBKA NAPRAWKA - JEDNA KOMENDA
# =============================================================================

def quick_fix():
    """Szybka naprawka - usuwa cache i naprawia emoji"""
    
    print("SZYBKA NAPRAWKA - USUWAM CACHE I NAPRAWIAM EMOJI...")
    
    # Usuń cache
    clean_problematic_cache()
    
    # Napraw emoji
    fix_app_py_emoji()
    
    print("GOTOWE! Uruchom: chcp 65001 && python app.py")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "quick":
        quick_fix()
    else:
        main_fix()
