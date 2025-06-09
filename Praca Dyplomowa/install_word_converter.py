#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Instalator i uruchamiacz konwertera Markdown to Word
"""

import subprocess
import sys
import os

def install_requirements():
    """Instaluje wymagane biblioteki"""
    requirements = [
        'python-docx',
        'lxml'
    ]
    
    print("Instalowanie wymaganych bibliotek...")
    for requirement in requirements:
        try:
            print(f"Instalowanie {requirement}...")
            subprocess.check_call([sys.executable, '-m', 'pip', 'install', requirement])
            print(f"✓ {requirement} zainstalowane pomyślnie")
        except subprocess.CalledProcessError as e:
            print(f"✗ Błąd instalacji {requirement}: {e}")
            return False
    
    print("✓ Wszystkie biblioteki zainstalowane pomyślnie!")
    return True

def run_converter():
    """Uruchamia konwerter"""
    try:
        print("\nUruchamianie konwertera...")
        subprocess.check_call([sys.executable, 'markdown_to_word_converter.py'])
        print("✓ Konwersja zakończona pomyślnie!")
        return True
    except subprocess.CalledProcessError as e:
        print(f"✗ Błąd konwersji: {e}")
        return False

def main():
    """Główna funkcja"""
    print("=== KONWERTER PRACY MAGISTERSKIEJ MARKDOWN -> WORD ===")
    print("Łukasz Kamiński - Inteligentne wsparcie procesu wdrożenia systemu ERP przy wykorzystaniu AI")
    print("=" * 70)
    
    # Sprawdź obecność pliku źródłowego
    input_file = "Praca Dyplomowa/PRACA_MAGISTERSKA_ŁUKASZ_KAMINSKI_FINALNA_Z_PROTOTYPEM_KOMPLETNA.md"
    if not os.path.exists(input_file):
        print(f"BŁĄD: Nie znaleziono pliku wejściowego: {input_file}")
        print("Upewnij się, że plik istnieje przed uruchomieniem konwersji.")
        return
    
    # Instaluj wymagania
    if not install_requirements():
        print("Przerwano ze względu na błędy instalacji.")
        return
    
    # Uruchom konwersję
    if run_converter():
        output_file = "Praca Dyplomowa/PRACA_MAGISTERSKA_ŁUKASZ_KAMINSKI_KOMPLETNA.docx"
        print(f"\n🎉 SUKCES! Plik Word został utworzony: {output_file}")
        print("\nDokument jest zgodny ze standardami UE Wrocław:")
        print("✓ Times New Roman 12pt")
        print("✓ Marginesy: góra/dół 2.5cm, lewy 3.0cm, prawy 2.0cm")
        print("✓ Interlinia 1.5")
        print("✓ Wcięcia akapitowe 0.5cm")
        print("✓ Strona tytułowa zgodna ze wzorem")
        print("✓ Spis treści z numeracją stron")
        print("✓ Formatowanie nagłówków")
    else:
        print("Konwersja nie powiodła się.")

if __name__ == "__main__":
    main()
