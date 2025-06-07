"""
Zoptymalizowany moduł do ładowania dokumentacji Comarch API
z cache'owaniem, lazy loading i parallel processing
"""

import os
import re
import logging
import hashlib
import sqlite3
import json
import asyncio
import aiofiles
from pathlib import Path
from typing import List, Dict, Any, Optional, Tuple, AsyncGenerator
from bs4 import BeautifulSoup
import chardet
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from datetime import datetime
import pickle
from dataclasses import dataclass, asdict
from tqdm import tqdm

# Dla obsługi PDF
try:
    import PyPDF2
    PDF_AVAILABLE = True
except ImportError:
    try:
        import pdfplumber
        PDF_AVAILABLE = True
    except ImportError:
        PDF_AVAILABLE = False

logger = logging.getLogger(__name__)

@dataclass
class DocumentMetadata:
    """Metadane dokumentu dla cache'u"""
    file_path: str
    file_hash: str
    last_modified: float
    file_size: int
    category: str
    title: str
    keywords: List[str]
    processed_at: float
    content_length: int

@dataclass
class ProcessingProgress:
    """Struktura do śledzenia postępu"""
    total_files: int = 0
    processed_files: int = 0
    cached_files: int = 0
    failed_files: int = 0
    current_file: str = ""
    
    @property
    def percentage(self) -> float:
        if self.total_files == 0:
            return 0.0
        return (self.processed_files / self.total_files) * 100

class DocumentCache:
    """Zarządzanie cache'em dokumentów w SQLite"""
    
    def __init__(self, cache_path: str = "document_cache.db"):
        self.cache_path = cache_path
        self.conn = None
        self._init_cache()
    
    def _init_cache(self):
        """Inicjalizuje bazę cache'u"""
        self.conn = sqlite3.connect(self.cache_path, check_same_thread=False)
        self.conn.execute("""
            CREATE TABLE IF NOT EXISTS document_cache (
                file_path TEXT PRIMARY KEY,
                file_hash TEXT NOT NULL,
                last_modified REAL NOT NULL,
                file_size INTEGER NOT NULL,
                category TEXT NOT NULL,
                title TEXT NOT NULL,
                keywords TEXT NOT NULL,
                processed_at REAL NOT NULL,
                content_length INTEGER NOT NULL,
                content_data BLOB NOT NULL
            )
        """)
        
        self.conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_file_hash ON document_cache(file_hash);
        """)
        
        self.conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_category ON document_cache(category);
        """)
        
        self.conn.commit()
    
    def get_file_hash(self, file_path: Path) -> str:
        """Generuje hash pliku dla weryfikacji zmian"""
        hasher = hashlib.md5()
        try:
            with open(file_path, 'rb') as f:
                # Czytaj w chunkach dla dużych plików
                while chunk := f.read(8192):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except Exception as e:
            logger.warning(f"Nie można wygenerować hash dla {file_path}: {e}")
            return str(file_path.stat().st_mtime)
    
    def is_cached(self, file_path: Path) -> bool:
        """Sprawdza czy plik jest w cache i czy jest aktualny"""
        try:
            file_hash = self.get_file_hash(file_path)
            file_mtime = file_path.stat().st_mtime
            
            cursor = self.conn.execute(
                "SELECT file_hash, last_modified FROM document_cache WHERE file_path = ?",
                (str(file_path),)
            )
            result = cursor.fetchone()
            
            if result:
                cached_hash, cached_mtime = result
                return cached_hash == file_hash and cached_mtime == file_mtime
            
            return False
        except Exception as e:
            logger.warning(f"Błąd sprawdzania cache dla {file_path}: {e}")
            return False
    
    def get_cached_document(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Pobiera dokument z cache'u"""
        try:
            cursor = self.conn.execute(
                "SELECT content_data FROM document_cache WHERE file_path = ?",
                (str(file_path),)
            )
            result = cursor.fetchone()
            
            if result:
                content_blob = result[0]
                return pickle.loads(content_blob)
            
            return None
        except Exception as e:
            logger.warning(f"Błąd pobierania z cache {file_path}: {e}")
            return None
    
    def cache_document(self, file_path: Path, document: Dict[str, Any]):
        """Zapisuje dokument do cache'u"""
        try:
            metadata = DocumentMetadata(
                file_path=str(file_path),
                file_hash=self.get_file_hash(file_path),
                last_modified=file_path.stat().st_mtime,
                file_size=file_path.stat().st_size,
                category=document.get('category', 'unknown'),
                title=document.get('title', ''),
                keywords=document.get('keywords', []),
                processed_at=datetime.now().timestamp(),
                content_length=len(document.get('content', ''))
            )
            
            content_blob = pickle.dumps(document)
            
            self.conn.execute(
                """INSERT OR REPLACE INTO document_cache 
                   (file_path, file_hash, last_modified, file_size, category, 
                    title, keywords, processed_at, content_length, content_data)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (
                    metadata.file_path, metadata.file_hash, metadata.last_modified,
                    metadata.file_size, metadata.category, metadata.title,
                    json.dumps(metadata.keywords), metadata.processed_at,
                    metadata.content_length, content_blob
                )
            )
            self.conn.commit()
            
        except Exception as e:
            logger.error(f"Błąd zapisywania do cache {file_path}: {e}")
    
    def get_cache_stats(self) -> Dict[str, Any]:
        """Zwraca statystyki cache'u"""
        try:
            cursor = self.conn.execute("""
                SELECT 
                    COUNT(*) as total_documents,
                    COUNT(DISTINCT category) as unique_categories,
                    SUM(file_size) as total_size,
                    SUM(content_length) as total_content_length,
                    AVG(content_length) as avg_content_length,
                    MIN(processed_at) as oldest_processed,
                    MAX(processed_at) as newest_processed
                FROM document_cache
            """)
            stats = cursor.fetchone()
            
            cursor = self.conn.execute("""
                SELECT category, COUNT(*) as count
                FROM document_cache
                GROUP BY category
                ORDER BY count DESC
            """)
            categories = dict(cursor.fetchall())
            
            return {
                'total_documents': stats[0] or 0,
                'unique_categories': stats[1] or 0,
                'total_size_mb': (stats[2] or 0) / (1024 * 1024),
                'total_content_length': stats[3] or 0,
                'avg_content_length': stats[4] or 0,
                'oldest_processed': stats[5],
                'newest_processed': stats[6],
                'categories': categories
            }
        except Exception as e:
            logger.error(f"Błąd pobierania statystyk cache: {e}")
            return {}
    
    def cleanup_cache(self, max_age_days: int = 30):
        """Czyści stare wpisy z cache'u"""
        cutoff_time = datetime.now().timestamp() - (max_age_days * 24 * 3600)
        try:
            cursor = self.conn.execute(
                "DELETE FROM document_cache WHERE processed_at < ?",
                (cutoff_time,)
            )
            deleted_count = cursor.rowcount
            self.conn.commit()
            logger.info(f"Usunięto {deleted_count} starych wpisów z cache")
            return deleted_count
        except Exception as e:
            logger.error(f"Błąd czyszczenia cache: {e}")
            return 0
    
    def close(self):
        """Zamyka połączenie z cache'em"""
        if self.conn:
            self.conn.close()

class OptimizedComarchDocumentLoader:
    """Zoptymalizowana klasa do ładowania dokumentacji Comarch API"""
    
    def __init__(self, docs_path: str = None, cache_enabled: bool = True, 
                 max_workers: int = 4, batch_size: int = 50):
        if docs_path is None:
            backend_dir = Path(__file__).parent
            self.docs_paths = [
                backend_dir.parent / "BazaWiedzy" / "XLAPI20250",
                backend_dir.parent / "BazaWiedzy" / "Tabele_2025_0",
                backend_dir.parent / "BazaWiedzy" / "XL003-Hydra"
            ]
        else:
            self.docs_paths = [Path(docs_path)]
        
        self.cache_enabled = cache_enabled
        self.max_workers = max_workers
        self.batch_size = batch_size
        self.cache = DocumentCache() if cache_enabled else None
        self.progress = ProcessingProgress()
        
        # Encoding cache dla optymalizacji
        self._encoding_cache = {}
        
        # Thread pool dla I/O operations
        self.executor = ThreadPoolExecutor(max_workers=max_workers)
        
    def get_file_encoding(self, file_path: Path) -> str:
        """Optymalizowane wykrywanie kodowania z cache'em"""
        file_key = str(file_path)
        if file_key in self._encoding_cache:
            return self._encoding_cache[file_key]
        
        try:
            with open(file_path, 'rb') as f:
                # Czytaj tylko pierwsze 8KB dla wydajności
                sample = f.read(8192)
                
            detected = chardet.detect(sample)
            encoding = detected.get('encoding', 'windows-1250')
            
            # Cache encoding
            self._encoding_cache[file_key] = encoding
            return encoding
            
        except Exception as e:
            logger.warning(f"Błąd wykrywania kodowania {file_path}: {e}")
            return 'windows-1250'
    
    def discover_files(self) -> List[Path]:
        """Odkrywa wszystkie pliki do przetworzenia"""
        all_files = []
        
        for docs_path in self.docs_paths:
            if not docs_path.exists():
                logger.warning(f"Folder dokumentacji nie istnieje: {docs_path}")
                continue
            
            # Znajdź wszystkie pliki różnych typów
            patterns = ["*.htm", "*.html", "*.xml", "*.pdf", "**/*.txt", "**/*.cs"]
            
            for pattern in patterns:
                if pattern.startswith("**"):
                    files = list(docs_path.rglob(pattern[3:]))  # Usuń ** prefix
                else:
                    files = list(docs_path.glob(pattern))
                all_files.extend(files)
        
        # Usuń duplikaty i sortuj
        all_files = list(set(all_files))
        all_files.sort()
        
        logger.info(f"Znaleziono {len(all_files)} plików do przetworzenia")
        return all_files
    
    def filter_files_for_processing(self, all_files: List[Path]) -> Tuple[List[Path], List[Path]]:
        """Filtruje pliki - zwraca (pliki_do_przetworzenia, pliki_z_cache)"""
        if not self.cache_enabled:
            return all_files, []
        
        files_to_process = []
        cached_files = []
        
        for file_path in all_files:
            if self.cache.is_cached(file_path):
                cached_files.append(file_path)
            else:
                files_to_process.append(file_path)
        
        logger.info(f"Pliki do przetworzenia: {len(files_to_process)}, "
                   f"w cache: {len(cached_files)}")
        
        return files_to_process, cached_files
    
    async def load_all_documents_async(self, progress_callback=None) -> List[Dict[str, Any]]:
        """Asynchroniczne ładowanie wszystkich dokumentów z progress tracking"""
        all_files = self.discover_files()
        files_to_process, cached_files = self.filter_files_for_processing(all_files)
        
        # Inicjalizuj progress
        self.progress.total_files = len(all_files)
        self.progress.cached_files = len(cached_files)
        self.progress.processed_files = len(cached_files)
        
        documents = []
        
        # Załaduj dokumenty z cache'u
        if cached_files:
            logger.info(f"Ładowanie {len(cached_files)} dokumentów z cache...")
            for cached_file in cached_files:
                if self.cache_enabled:
                    doc = self.cache.get_cached_document(cached_file)
                    if doc:
                        documents.append(doc)
                
                if progress_callback:
                    progress_callback(self.progress)
        
        # Przetwórz nowe pliki w batch'ach
        if files_to_process:
            logger.info(f"Przetwarzanie {len(files_to_process)} nowych plików...")
            
            # Podziel na batche
            batches = [files_to_process[i:i + self.batch_size] 
                      for i in range(0, len(files_to_process), self.batch_size)]
            
            for batch_idx, batch in enumerate(batches):
                logger.info(f"Przetwarzanie batch {batch_idx + 1}/{len(batches)}")
                
                # Przetwórz batch równolegle
                batch_documents = await self._process_batch_async(batch, progress_callback)
                documents.extend(batch_documents)
        
        logger.info(f"Załadowano łącznie {len(documents)} dokumentów")
        return documents
    
    async def _process_batch_async(self, batch: List[Path], progress_callback=None) -> List[Dict[str, Any]]:
        """Przetwarza batch plików asynchronicznie"""
        loop = asyncio.get_event_loop()
        
        # Użyj ThreadPoolExecutor dla CPU-intensive operations
        futures = []
        for file_path in batch:
            future = loop.run_in_executor(self.executor, self._process_single_file, file_path)
            futures.append(future)
        
        batch_documents = []
        
        # Poczekaj na zakończenie wszystkich zadań w batch'u
        for idx, future in enumerate(asyncio.as_completed(futures)):
            try:
                doc = await future
                if doc:
                    batch_documents.append(doc)
                    
                    # Cache document if enabled
                    if self.cache_enabled:
                        file_path = batch[futures.index(future)]
                        self.cache.cache_document(file_path, doc)
                
                self.progress.processed_files += 1
                self.progress.current_file = batch[idx].name if idx < len(batch) else ""
                
                if progress_callback:
                    progress_callback(self.progress)
                    
            except Exception as e:
                self.progress.failed_files += 1
                logger.error(f"Błąd przetwarzania pliku: {e}")
        
        return batch_documents
    
    def _process_single_file(self, file_path: Path) -> Optional[Dict[str, Any]]:
        """Przetwarza pojedynczy plik (thread-safe)"""
        try:
            suffix = file_path.suffix.lower()
            
            if suffix in ['.htm', '.html']:
                return self._parse_html_file(file_path)
            elif suffix == '.xml':
                return self._parse_xml_file(file_path)
            elif suffix == '.pdf':
                return self._parse_pdf_file(file_path)
            elif suffix in ['.txt', '.cs']:
                return self._parse_text_file(file_path)
            else:
                logger.warning(f"Nieobsługiwany typ pliku: {file_path}")
                return None
                
        except Exception as e:
            logger.error(f"Błąd przetwarzania {file_path}: {e}")
            return None
    
    def load_all_documents(self, progress_callback=None) -> List[Dict[str, Any]]:
        """Synchroniczna wersja - wrapper dla async version"""
        try:
            # Uruchom async version w nowej pętli event loop
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            documents = loop.run_until_complete(
                self.load_all_documents_async(progress_callback)
            )
            
            loop.close()
            return documents
            
        except Exception as e:
            logger.error(f"Błąd w load_all_documents: {e}")
            return []
    
    def _parse_html_file(self, file_path: Path) -> Dict[str, Any]:
        """Parsuje pojedynczy plik HTML - zoptymalizowana wersja"""
        encoding = self.get_file_encoding(file_path)
        
        with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'html.parser')
        
        # Wyciągnij tytuł
        title = soup.find('title')
        title_text = title.get_text().strip() if title else file_path.stem
        
        # Wyciągnij główną zawartość
        main_content = self._extract_main_content(soup)
        
        # Określ kategorię na podstawie tytułu i zawartości
        category = self._determine_category(title_text, main_content, str(file_path))
        
        # Wyciągnij kluczowe słowa
        keywords = self._extract_keywords(title_text, main_content)
        
        return {
            'title': title_text,
            'content': main_content,
            'category': category,
            'keywords': keywords,
            'source_file': str(file_path.name),
            'file_path': str(file_path)
        }
    
    def _parse_xml_file(self, file_path: Path) -> Dict[str, Any]:
        """Parsuje pojedynczy plik XML - zoptymalizowana wersja"""
        encoding = self.get_file_encoding(file_path)
        
        with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
            content = f.read()
        
        soup = BeautifulSoup(content, 'xml')
        
        # Wyciągnij nazwę tabeli
        table_elem = soup.find('table')
        table_name = table_elem.get('name') if table_elem else file_path.stem
        
        # Wyciągnij opis tabeli
        description = table_elem.get('description', '') if table_elem else ''
        
        # Parsuj kolumny
        columns_info = []
        columns = soup.find_all('column')
        for col in columns:
            col_info = {
                'name': col.get('sqlname', ''),
                'type': col.get('sqltype', ''),
                'description': col.get('description', ''),
                'size': col.get('size', ''),
                'places': col.get('places', '')
            }
            columns_info.append(col_info)
        
        # Stwórz tekstową reprezentację
        content_text = f"Tabela: {table_name}\n"
        if description:
            content_text += f"Opis: {description}\n\n"
        
        content_text += "Kolumny:\n"
        for col in columns_info:
            content_text += f"- {col['name']} ({col['type']}"
            if col['size']:
                content_text += f", rozmiar: {col['size']}"
            if col['places']:
                content_text += f", miejsca dziesiętne: {col['places']}"
            content_text += ")"
            if col['description']:
                content_text += f" - {col['description']}"
            content_text += "\n"
        
        # Określ kategorię
        category = self._determine_category(table_name, content_text, str(file_path))
        
        # Wyciągnij kluczowe słowa
        keywords = self._extract_keywords(table_name, content_text)
        
        return {
            'title': f"Struktura tabeli: {table_name}",
            'content': content_text,
            'category': category,
            'keywords': keywords,
            'source_file': str(file_path.name),
            'file_path': str(file_path)
        }
    
    def _parse_pdf_file(self, file_path: Path) -> Dict[str, Any]:
        """Parsuje pojedynczy plik PDF"""
        if not PDF_AVAILABLE:
            logger.warning(f"PDF parsing nie jest dostępne dla {file_path}")
            return None
        
        content_text = ""
        
        # Spróbuj z PyPDF2
        try:
            import PyPDF2
            with open(file_path, 'rb') as f:
                pdf_reader = PyPDF2.PdfReader(f)
                for page in pdf_reader.pages:
                    content_text += page.extract_text() + "\n"
        except:
            # Fallback do pdfplumber
            try:
                import pdfplumber
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            content_text += text + "\n"
            except Exception as e:
                logger.error(f"Błąd parsowania PDF {file_path}: {e}")
                return None
        
        if not content_text.strip():
            logger.warning(f"PDF {file_path} nie zawiera tekstu")
            return None
        
        # Oczyść tekst
        content_text = re.sub(r'\n\s*\n', '\n\n', content_text)
        content_text = re.sub(r'[ \t]+', ' ', content_text)
        
        # Określ kategorię
        category = self._determine_category(file_path.stem, content_text, str(file_path))
        
        # Wyciągnij kluczowe słowa
        keywords = self._extract_keywords(file_path.stem, content_text)
        
        return {
            'title': f"Dokumentacja PDF: {file_path.stem}",
            'content': content_text.strip(),
            'category': category,
            'keywords': keywords,
            'source_file': str(file_path.name),
            'file_path': str(file_path)
        }
    
    def _parse_text_file(self, file_path: Path) -> Dict[str, Any]:
        """Parsuje pojedynczy plik TXT lub CS"""
        encoding = self.get_file_encoding(file_path)
        
        with open(file_path, 'r', encoding=encoding, errors='ignore') as f:
            content = f.read()
        
        if not content.strip():
            return None
        
        # Określ typ pliku i kategorię
        file_type = file_path.suffix.lower()
        if file_type == '.cs':
            title = f"Kod C#: {file_path.stem}"
            category = 'hydra_code_cs'
        else:
            title = f"Plik tekstowy: {file_path.stem}"
            category = 'hydra_config'
        
        # Dla plików w załącznikach, dodaj informację o folderze
        if 'załączniki' in str(file_path):
            relative_path = str(file_path).split('załączniki/')[-1]
            title += f" (załącznik: {relative_path})"
        
        # Określ kategorię na podstawie ścieżki i zawartości
        category = self._determine_category(title, content, str(file_path))
        
        # Wyciągnij kluczowe słowa
        keywords = self._extract_keywords(title, content)
        
        return {
            'title': title,
            'content': content.strip(),
            'category': category,
            'keywords': keywords,
            'source_file': str(file_path.name),
            'file_path': str(file_path)
        }
    
    def _extract_main_content(self, soup: BeautifulSoup) -> str:
        """Wyciąga główną zawartość z HTML"""
        # Usuń zbędne elementy
        for element in soup(['script', 'style', 'meta', 'link']):
            element.decompose()
        
        # Znajdź główną zawartość
        main_div = soup.find('div', class_='Section1')
        if main_div:
            content_element = main_div
        else:
            content_element = soup.find('body') or soup
        
        # Wyciągnij tekst
        text = content_element.get_text(separator='\n', strip=True)
        
        # Oczyść tekst
        text = re.sub(r'\n\s*\n', '\n\n', text)  # Usuń nadmiarowe nowe linie
        text = re.sub(r'[ \t]+', ' ', text)      # Usuń nadmiarowe spacje
        
        return text.strip()
    
    def _determine_category(self, title: str, content: str, file_path: str = "") -> str:
        """Określa kategorię dokumentu na podstawie tytułu i zawartości"""
        title_lower = title.lower()
        content_lower = content.lower()
        file_path_lower = file_path.lower()
        
        # Kategorie dla systemu Hydra (nowe)
        if 'xl003-hydra' in file_path_lower or 'hydra' in title_lower:
            if file_path_lower.endswith('.pdf'):
                return 'hydra_dokumentacja'
            elif file_path_lower.endswith('.cs'):
                # Określ typ kodu C# na podstawie nazwy pliku
                if 'callback' in title_lower:
                    return 'hydra_callback'
                elif 'debug' in title_lower or 'log' in title_lower:
                    return 'hydra_debug'
                elif any(word in title_lower for word in ['odczyt', 'klawisz', 'keycode']):
                    return 'hydra_input'
                elif any(word in title_lower for word in ['wydruk', 'print']):
                    return 'hydra_print'
                elif any(word in title_lower for word in ['kolumna', 'ukrycie']):
                    return 'hydra_ui'
                else:
                    return 'hydra_code_cs'
            elif any(config_word in title_lower for config_word in ['akcje', 'daty', 'keycodes', 'kolory']):
                return 'hydra_config'
            else:
                return 'hydra_inne'
        
        # Kategorie dla struktur bazy danych (nowe)
        elif 'tabele_2025' in file_path_lower or any(word in title_lower for word in ['tabela', 'struktura', 'kolumna']):
            # Procedury AI ChatERP - sprawdź zawartość
            if 'ai_chaterp' in content_lower or 'ai_pp_' in content_lower or 'ai_' in content_lower and 'create procedure' in content_lower:
                return 'ai_procedury_sql'
            elif title_lower.startswith('ai') or any(ai_word in title_lower for ai_word in ['ailimity', 'aiprognoza', 'aiwindykacja']):
                return 'ai_tabele'
            elif any(word in title_lower for word in ['bst', 'budżet', 'bilans']):
                return 'tabele_finansowe'
            elif any(word in title_lower for word in ['twr', 'towar', 'cen', 'mag']):
                return 'tabele_magazynowe'
            elif any(word in title_lower for word in ['knt', 'kontrahent', 'adres']):
                return 'tabele_kontrahentow'
            elif any(word in title_lower for word in ['tra', 'dokument', 'elem']):
                return 'tabele_dokumentow'
            else:
                return 'tabele_inne'
        
        # Kategorie dla API (oryginalne)
        if any(word in title_lower for word in ['spis', 'treści', 'index']):
            return 'index'
        elif any(word in title_lower for word in ['wprowadzenie', 'uwagi', 'ogólne']):
            return 'wprowadzenie'
        elif 'xl' in title_lower and any(word in title_lower for word in ['login', 'logout', 'sprawdz']):
            return 'autoryzacja'
        elif any(word in title_lower for word in ['dokument', 'handlowe', 'magazynowe', 'sad']):
            return 'dokumenty'
        elif any(word in title_lower for word in ['kontrahent', 'adres']):
            return 'kontrahenci'
        elif any(word in title_lower for word in ['towar', 'cena', 'cennik']):
            return 'towary'
        elif any(word in title_lower for word in ['dekret', 'księgowe']):
            return 'księgowość'
        elif any(word in title_lower for word in ['produkcja', 'zlecenie']):
            return 'produkcja'
        elif any(word in title_lower for word in ['parametry', 'obowiązkowe']):
            return 'parametry'
        elif any(word in title_lower for word in ['prototyp', 'działanie']):
            return 'funkcje'
        elif any(word in content_lower for word in ['xlnowy', 'xldodaj', 'xlmodyfikuj', 'xlusun']):
            return 'api_funkcje'
        else:
            return 'inne'
    
    def _extract_keywords(self, title: str, content: str) -> List[str]:
        """Wyciąga kluczowe słowa z tytułu i zawartości"""
        keywords = []
        
        # Kluczowe słowa z tytułu
        title_words = re.findall(r'\b[A-ZĄĆĘŁŃÓŚŹŻ][a-ząćęłńóśźż]+\b', title)
        keywords.extend(title_words)
        
        # Nazwy funkcji API
        api_functions = re.findall(r'\bXL[A-Za-z]+\b', content)
        keywords.extend(api_functions)
        
        # Kluczowe słowa biznesowe
        business_terms = re.findall(r'\b(?:dokument|pozycja|kontrahent|towar|cena|rabat|vat|waluta|ilosc|magazyn|zlecenie|produkcja|księgowanie)\b', content.lower())
        keywords.extend(business_terms)
        
        # Nazwy tabel (dla struktur bazy danych)
        table_names = re.findall(r'\b[A-Z][a-zA-Z]*(?:Nag|Elem|Karty|Dane|Info|Log|Hist)\b', content)
        keywords.extend(table_names)
        
        # Procedury AI i ChatERP
        ai_procedures = re.findall(r'\bAI_[A-Za-z_]+\b', content)
        keywords.extend(ai_procedures)
        
        # Kolumny bazy danych (prefiksy)
        db_prefixes = re.findall(r'\b[A-Z]{2,4}_[A-Za-z]+\b', content)
        keywords.extend(db_prefixes)
        
        # Typy danych SQL
        sql_types = re.findall(r'\b(?:INTEGER|VARCHAR|TEXT|DECIMAL|DATETIME|CSTRING|LONG)\b', content)
        keywords.extend(sql_types)
        
        # Kluczowe słowa dla systemu Hydra
        hydra_functions = re.findall(r'\b(?:callback|debug|log|print|wydruk|odczyt|klawisz|ukrycie|kolumna)\b', content.lower())
        keywords.extend(hydra_functions)
        
        # Nazwy klas i funkcji C#
        cs_identifiers = re.findall(r'\b[A-Z][a-zA-Z]*(?:Handler|Manager|Service|Helper|Util|Controller)\b', content)
        keywords.extend(cs_identifiers)
        
        # Słowa kluczowe C#
        cs_keywords = re.findall(r'\b(?:using|namespace|class|public|private|static|void|string|int|bool|DateTime)\b', content)
        keywords.extend(cs_keywords)
        
        # Akcje i konfiguracje Hydra
        hydra_config = re.findall(r'\b(?:akcje|daty|keycodes|kolory|fonty|style)\b', content.lower())
        keywords.extend(hydra_config)
        
        # Event handlers i callbacks
        event_handlers = re.findall(r'\b\w*(?:Event|Handler|Callback|Action|Method)\b', content)
        keywords.extend(event_handlers)
        
        # Usuń duplikaty i zwróć
        return list(set(keywords))
    
    def cleanup(self):
        """Czyści zasoby"""
        if self.executor:
            self.executor.shutdown(wait=True)
        if self.cache:
            self.cache.close()

class OptimizedComarchKnowledgeService:
    """Zoptymalizowany service do zarządzania bazą wiedzy Comarch API"""
    
    def __init__(self, config, ai_service, vector_service):
        self.config = config
        self.ai_service = ai_service
        self.vector_service = vector_service
        self.document_loader = OptimizedComarchDocumentLoader(
            cache_enabled=True,
            max_workers=getattr(config, 'LOADER_MAX_WORKERS', 4),
            batch_size=getattr(config, 'LOADER_BATCH_SIZE', 50)
        )
        self.documents = []
        self._loading_progress = ProcessingProgress()
        
    def load_comarch_documentation(self, progress_callback=None):
        """Ładuje dokumentację Comarch do bazy wektorowej z progress tracking"""
        logger.info("📚 Ładowanie dokumentacji Comarch API...")
        
        def internal_progress_callback(progress: ProcessingProgress):
            self._loading_progress = progress
            logger.info(f"Progress: {progress.percentage:.1f}% ({progress.processed_files}/{progress.total_files}) - {progress.current_file}")
            if progress_callback:
                progress_callback(progress)
        
        # Załaduj dokumenty
        self.documents = self.document_loader.load_all_documents(internal_progress_callback)
        
        if not self.documents:
            logger.warning("❌ Nie znaleziono dokumentów do załadowania")
            return
        
        # Przygotuj dane do indeksowania
        documents_to_index = []
        metadatas = []
        ids = []
        
        logger.info("🔄 Przygotowywanie dokumentów do indeksowania...")
        
        for doc in self.documents:
            # Podziel długie dokumenty na chunki
            chunks = self._chunk_text(doc['content'])
            
            for i, chunk in enumerate(chunks):
                if len(chunk.strip()) < 50:  # Pomiń bardzo krótkie chunki
                    continue
                    
                documents_to_index.append(chunk)
                metadatas.append({
                    "source": doc['source_file'],
                    "title": doc['title'],
                    "category": doc['category'],
                    "keywords": ",".join(doc['keywords']),
                    "chunk_id": i,
                    "file_path": doc['file_path']
                })
                ids.append(f"{doc['source_file']}_chunk_{i}")
        
        if not documents_to_index:
            logger.warning("❌ Brak dokumentów do indeksowania po przetworzeniu")
            return
        
        try:
            # Generuj embeddingi w batch'ach dla oszczędności pamięci
            logger.info(f"🔄 Generowanie embeddings dla {len(documents_to_index)} fragmentów...")
            
            batch_size = getattr(self.config, 'EMBEDDING_BATCH_SIZE', 100)
            embeddings = []
            
            for i in range(0, len(documents_to_index), batch_size):
                batch = documents_to_index[i:i + batch_size]
                logger.info(f"Generowanie embeddings dla batch {i//batch_size + 1}/{(len(documents_to_index) + batch_size - 1)//batch_size}")
                batch_embeddings = self.ai_service.generate_embeddings(batch)
                embeddings.extend(batch_embeddings)
            
            # Dodaj do bazy wektorowej w batch'ach
            logger.info("💾 Dodawanie do bazy wektorowej...")
            
            vector_batch_size = getattr(self.config, 'VECTOR_BATCH_SIZE', 1000)
            
            for i in range(0, len(documents_to_index), vector_batch_size):
                end_idx = min(i + vector_batch_size, len(documents_to_index))
                batch_docs = documents_to_index[i:end_idx]
                batch_metas = metadatas[i:end_idx]
                batch_ids = ids[i:end_idx]
                batch_embeddings = embeddings[i:end_idx]
                
                logger.info(f"Dodawanie batch {i//vector_batch_size + 1}/{(len(documents_to_index) + vector_batch_size - 1)//vector_batch_size}")
                self.vector_service.add_documents(batch_docs, batch_metas, batch_ids, batch_embeddings)
            
            logger.info(f"✅ Zaindeksowano {len(documents_to_index)} fragmentów dokumentacji Comarch")
            
        except Exception as e:
            logger.error(f"❌ Błąd indeksowania dokumentacji: {e}")
            raise
        finally:
            # Cleanup
            self.document_loader.cleanup()
    
    def _chunk_text(self, text: str) -> List[str]:
        """Dzieli tekst na chunki - zoptymalizowana wersja"""
        chunk_size = getattr(self.config, 'CHUNK_SIZE', 1000)
        overlap = getattr(self.config, 'CHUNK_OVERLAP', 200)
        
        # Sprawdź długość tekstu
        if len(text) <= chunk_size:
            return [text]
        
        chunks = []
        
        # Podziel po akapitach
        paragraphs = text.split('\n\n')
        current_chunk = ""
        
        for paragraph in paragraphs:
            # Jeśli dodanie akapitu nie przekroczy limitu
            if len(current_chunk + paragraph) < chunk_size:
                current_chunk += paragraph + "\n\n"
            else:
                # Zapisz aktualny chunk jeśli nie jest pusty
                if current_chunk.strip():
                    chunks.append(current_chunk.strip())
                
                # Jeśli akapit jest za długi, podziel go na zdania
                if len(paragraph) > chunk_size:
                    sentences = paragraph.split('.')
                    sentence_chunk = ""
                    
                    for sentence in sentences:
                        if len(sentence_chunk + sentence) < chunk_size:
                            sentence_chunk += sentence + "."
                        else:
                            if sentence_chunk.strip():
                                chunks.append(sentence_chunk.strip())
                            sentence_chunk = sentence + "."
                    
                    if sentence_chunk.strip():
                        current_chunk = sentence_chunk
                    else:
                        current_chunk = ""
                else:
                    current_chunk = paragraph + "\n\n"
        
        # Dodaj ostatni chunk
        if current_chunk.strip():
            chunks.append(current_chunk.strip())
        
        # Filtruj krótkie chunki
        filtered_chunks = [chunk for chunk in chunks if len(chunk.strip()) > 20]
        
        return filtered_chunks
    
    def search_knowledge(self, query: str, num_results: int = 5):
        """Wyszukuje w bazie wiedzy Comarch"""
        try:
            query_embeddings = self.ai_service.generate_embeddings([query])
            return self.vector_service.search(query_embeddings[0], num_results=num_results)
        except Exception as e:
            logger.error(f"❌ Błąd wyszukiwania wiedzy: {e}")
            raise
    
    def get_statistics(self) -> Dict[str, Any]:
        """Zwraca szczegółowe statystyki załadowanej dokumentacji"""
        if not self.documents:
            return {"total_documents": 0}
        
        categories = {}
        total_functions = 0
        total_size = 0
        
        for doc in self.documents:
            category = doc['category']
            categories[category] = categories.get(category, 0) + 1
            
            # Policz funkcje API
            api_functions = [kw for kw in doc['keywords'] if kw.startswith('XL')]
            total_functions += len(api_functions)
            
            # Dodaj rozmiar
            total_size += len(doc.get('content', ''))
        
        # Dodaj statystyki cache'u
        cache_stats = {}
        if self.document_loader.cache:
            cache_stats = self.document_loader.cache.get_cache_stats()
        
        return {
            "total_documents": len(self.documents),
            "categories": categories,
            "total_api_functions": total_functions,
            "total_content_size": total_size,
            "avg_content_size": total_size / len(self.documents) if self.documents else 0,
            "categories_list": list(categories.keys()),
            "cache_stats": cache_stats,
            "loading_progress": {
                "total_files": self._loading_progress.total_files,
                "processed_files": self._loading_progress.processed_files,
                "cached_files": self._loading_progress.cached_files,
                "failed_files": self._loading_progress.failed_files,
                "percentage": self._loading_progress.percentage
            }
        }
    
    def cleanup(self):
        """Czyści zasoby"""
        if self.document_loader:
            self.document_loader.cleanup()

# Utility functions dla prostego użycia

def create_optimized_loader(cache_enabled: bool = True, max_workers: int = 4, batch_size: int = 50) -> OptimizedComarchDocumentLoader:
    """Factory function dla szybkiego tworzenia optimized loader"""
    return OptimizedComarchDocumentLoader(
        cache_enabled=cache_enabled,
        max_workers=max_workers,
        batch_size=batch_size
    )

def load_documents_with_progress(progress_callback=None) -> List[Dict[str, Any]]:
    """Convenience function dla ładowania dokumentów z progress tracking"""
    loader = create_optimized_loader()
    try:
        return loader.load_all_documents(progress_callback)
    finally:
        loader.cleanup()

# Test function
def test_optimized_loader():
    """Test optimized loader"""
    import time
    
    print("🚀 Testowanie optimized document loader...")
    
    def progress_callback(progress: ProcessingProgress):
        print(f"Progress: {progress.percentage:.1f}% ({progress.processed_files}/{progress.total_files}) - {progress.current_file}")
    
    start_time = time.time()
    
    loader = create_optimized_loader(cache_enabled=True, max_workers=4, batch_size=25)
    
    try:
        documents = loader.load_all_documents(progress_callback)
        
        end_time = time.time()
        duration = end_time - start_time
        
        print(f"\n✅ Test zakończony!")
        print(f"📊 Załadowano: {len(documents)} dokumentów")
        print(f"⏱️  Czas: {duration:.2f} sekund")
        print(f"🚀 Wydajność: {len(documents)/duration:.1f} docs/sec")
        
        # Statystyki cache'u
        if loader.cache:
            cache_stats = loader.cache.get_cache_stats()
            print(f"💾 Cache: {cache_stats.get('total_documents', 0)} dokumentów")
            print(f"📁 Rozmiar cache: {cache_stats.get('total_size_mb', 0):.1f} MB")
        
        return documents
        
    except Exception as e:
        print(f"❌ Błąd testu: {e}")
        return []
    finally:
        loader.cleanup()

if __name__ == "__main__":
    # Uruchom test
    test_optimized_loader()
