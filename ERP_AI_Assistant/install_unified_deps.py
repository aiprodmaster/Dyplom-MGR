#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ERP AI Assistant - Unified Dependencies Installer
Automatyczna instalacja skonsolidowanych zależności
"""

import subprocess
import sys
import os
from pathlib import Path

def check_python_version():
    """Sprawdza wersję Pythona"""
    version = sys.version_info
    print(f"🐍 Python wersja: {version.major}.{version.minor}.{version.micro}")
    
    if version.major != 3:
        print("❌ Wymagany Python 3.x")
        return False
    
    if version.minor < 11:
        print("⚠️  Zalecany Python 3.11 lub nowszy")
        print("   Obecna wersja może powodować problemy z dependencies")
    
    if version.minor >= 13:
        print("⚠️  Python 3.13+ może mieć problemy kompatybilności")
        print("   Zalecany downgrade do Python 3.11 lub 3.12")
    
    return True

def run_command(cmd, description):
    """Uruchamia komendę i wyświetla wynik"""
    print(f"\n🔧 {description}")
    print(f"   Komenda: {' '.join(cmd)}")
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print("✅ Sukces!")
        if result.stdout:
            print(f"   Output: {result.stdout.strip()}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Błąd: {e}")
        if e.stderr:
            print(f"   Stderr: {e.stderr.strip()}")
        return False

def main():
    """Główna funkcja instalująca"""
    print("=" * 60)
    print("🚀 ERP AI ASSISTANT - UNIFIED DEPENDENCIES INSTALLER")
    print("=" * 60)
    
    # Sprawdzenie wersji Pythona
    if not check_python_version():
        sys.exit(1)
    
    # Sprawdzenie czy plik requirements istnieje
    req_file = Path("requirements_unified.txt")
    if not req_file.exists():
        print(f"❌ Nie znaleziono pliku: {req_file}")
        print("   Upewnij się, że uruchamiasz script z katalogu ERP_AI_Assistant/")
        sys.exit(1)
    
    print(f"\n📦 Instalowanie z pliku: {req_file}")
    
    # Lista komend do wykonania
    commands = [
        (
            [sys.executable, "-m", "pip", "install", "--upgrade", "pip"],
            "Aktualizacja pip"
        ),
        (
            [sys.executable, "-m", "pip", "install", "-r", str(req_file)],
            "Instalacja głównych dependencies"
        )
    ]
    
    # Wykonanie komend
    success_count = 0
    for cmd, desc in commands:
        if run_command(cmd, desc):
            success_count += 1
    
    # Podsumowanie
    print("\n" + "=" * 60)
    print("📊 PODSUMOWANIE INSTALACJI")
    print("=" * 60)
    
    if success_count == len(commands):
        print("🎉 INSTALACJA ZAKOŃCZONA SUKCESEM!")
        print("\n✅ Wszystkie dependencies zostały zainstalowane")
        print("\n🚀 Możesz teraz uruchomić aplikację:")
        print("   python quick-start.py")
        print("   # lub")
        print("   python backend/app.py")
    else:
        print("⚠️  INSTALACJA ZAKOŃCZONA Z BŁĘDAMI")
        print(f"   Sukces: {success_count}/{len(commands)} komend")
        print("\n🔧 Spróbuj uruchomić ręcznie:")
        print("   pip install --no-cache-dir -r requirements_unified.txt")
    
    print("\n📚 Więcej informacji w: DEPENDENCY_MANAGEMENT_GUIDE.md")

if __name__ == "__main__":
    main()
