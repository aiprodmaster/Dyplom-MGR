#!/usr/bin/env python3
"""
Skrypt instalacji zależności dla Windows z rozwiązaniem problemów kodowania
"""

import subprocess
import sys
import os
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def run_command(command, description):
    """Uruchamia komendę z obsługą błędów"""
    logger.info(f"🔄 {description}")
    try:
        # Ustawienie kodowania dla Windows
        env = os.environ.copy()
        env['PYTHONIOENCODING'] = 'utf-8'
        env['PYTHONUTF8'] = '1'
        
        result = subprocess.run(
            command, 
            shell=True, 
            check=True, 
            capture_output=True, 
            text=True,
            encoding='utf-8',
            env=env
        )
        logger.info(f"✅ {description} - Sukces")
        return True
    except subprocess.CalledProcessError as e:
        logger.error(f"❌ {description} - Błąd: {e}")
        if e.stdout:
            logger.error(f"STDOUT: {e.stdout}")
        if e.stderr:
            logger.error(f"STDERR: {e.stderr}")
        return False

def main():
    """Główna funkcja instalacji"""
    logger.info("🚀 Rozpoczynam instalację zależności dla Windows")
    
    # Sprawdzenie wersji Python
    python_version = sys.version_info
    logger.info(f"📋 Python {python_version.major}.{python_version.minor}.{python_version.micro}")
    
    if python_version < (3, 8):
        logger.error("❌ Wymagany Python 3.8+")
        return False
    
    # Przejście do katalogu backend
    backend_dir = os.path.join(os.path.dirname(__file__), 'backend')
    os.chdir(backend_dir)
    logger.info(f"📁 Katalog roboczy: {os.getcwd()}")
    
    # Sprawdzenie czy fix_requirements.txt istnieje
    fix_req_path = os.path.join('..', 'fix_requirements.txt')
    if not os.path.exists(fix_req_path):
        logger.error(f"❌ Brak pliku: {fix_req_path}")
        return False
    
    # Krok 1: Aktualizacja pip
    if not run_command(
        f'"{sys.executable}" -m pip install --upgrade pip',
        "Aktualizacja pip"
    ):
        logger.warning("⚠️ Nie udało się zaktualizować pip, kontynuuję...")
    
    # Krok 2: Instalacja wheel
    if not run_command(
        f'"{sys.executable}" -m pip install wheel',
        "Instalacja wheel"
    ):
        return False
    
    # Krok 3: Próba instalacji numpy i pandas osobno (pre-compiled wheels)
    numpy_commands = [
        f'"{sys.executable}" -m pip install "numpy>=1.24.0,<1.26.0"',
        f'"{sys.executable}" -m pip install numpy --only-binary=numpy',
        f'"{sys.executable}" -m pip install --no-cache-dir --force-reinstall numpy==1.24.3'
    ]
    
    numpy_installed = False
    for cmd in numpy_commands:
        if run_command(cmd, "Instalacja numpy"):
            numpy_installed = True
            break
        logger.warning("⚠️ Próbuję alternatywną metodę instalacji numpy...")
    
    if not numpy_installed:
        logger.error("❌ Nie udało się zainstalować numpy")
        return False
    
    # Krok 4: Instalacja pandas
    if not run_command(
        f'"{sys.executable}" -m pip install "pandas>=2.0.0,<2.2.0"',
        "Instalacja pandas"
    ):
        return False
    
    # Krok 5: Instalacja pozostałych pakietów z naprawionego requirements
    if not run_command(
        f'"{sys.executable}" -m pip install -r "{fix_req_path}"',
        "Instalacja pozostałych zależności"
    ):
        return False
    
    # Krok 6: Weryfikacja instalacji
    verification_packages = [
        'fastapi', 'uvicorn', 'langchain', 'chromadb', 
        'numpy', 'pandas', 'openai', 'sqlalchemy'
    ]
    
    logger.info("🔍 Weryfikacja zainstalowanych pakietów:")
    all_ok = True
    for package in verification_packages:
        try:
            result = subprocess.run(
                [sys.executable, '-c', f'import {package}; print(f"{package}: OK")'],
                capture_output=True,
                text=True,
                check=True
            )
            logger.info(f"✅ {package}")
        except subprocess.CalledProcessError:
            logger.error(f"❌ {package}")
            all_ok = False
    
    if all_ok:
        logger.info("🎉 Wszystkie zależności zostały pomyślnie zainstalowane!")
        return True
    else:
        logger.error("❌ Niektóre pakiety nie zostały zainstalowane")
        return False

if __name__ == "__main__":
    success = main()
    if not success:
        sys.exit(1)
    
    print("\n" + "="*60)
    print("🎉 INSTALACJA ZAKOŃCZONA POMYŚLNIE!")
    print("="*60)
    print("Możesz teraz uruchomić aplikację używając:")
    print("python run.py")
    print("="*60)
