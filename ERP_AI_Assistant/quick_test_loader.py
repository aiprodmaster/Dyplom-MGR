#!/usr/bin/env python3
"""
Szybki test zoptymalizowanego document loader
"""

import sys
import time
import os
from pathlib import Path

# Dodaj ścieżkę backend do sys.path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))

try:
    from optimized_document_loader import test_optimized_loader
    
    def main():
        print("🚀 Szybki test zoptymalizowanego Document Loader")
        print("=" * 60)
        
        start_time = time.time()
        
        # Uruchom test
        test_optimized_loader()
        
        total_time = time.time() - start_time
        print(f"\n⏱️  Całkowity czas testu: {total_time:.2f} sekund")
        print("=" * 60)
        
        print("\n📋 Co dalej:")
        print("1. Uruchom pełną aplikację: python backend/app.py")
        print("2. Sprawdź logi w backend/erp_assistant.log")
        print("3. Otwórz http://localhost:5000 w przeglądarce")
        print("4. Przetestuj wydajność chat'a")
        
        print("\n🔧 Dla zaawansowanych testów:")
        print("   cd backend && python test_optimized_loader.py")

if __name__ == "__main__":
    main()
    
except ImportError as e:
    print(f"❌ Błąd importu: {e}")
    print("💡 Upewnij się, że jesteś w głównym folderze projektu")
    print("💡 Sprawdź czy wszystkie pliki zostały utworzone poprawnie")
    
except Exception as e:
    print(f"❌ Błąd: {e}")
    import traceback
    traceback.print_exc()
