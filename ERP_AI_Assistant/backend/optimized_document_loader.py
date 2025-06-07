#!/usr/bin/env python3
"""
=================================================================================
OPTIMIZED DOCUMENT LOADER v2.0
Zoptymalizowany loader dokumentów z cache i parallel processing
=================================================================================
"""

import os
import json
import sqlite3
import logging
import hashlib
import time
import multiprocessing
from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional, Callable
from dataclasses import dataclass, asdict
from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
from pathlib import Path
import threading

# HTML/XML parsing
try:
    from bs4 import BeautifulSoup
    HTML_PARSER_AVAILABLE = True
except ImportError:
    HTML_PARSER_AVAILABLE = False
    BeautifulSoup = None

logger = logging.getLogger(__name__)

# ============================================================================
# DATA STRUCTURES
# ============================================================================

@dataclass
class ProcessingProgress:
    """Progress tracking dla procesu ładowania"""
    total_files: int
    processed_files: int
    current_file: str
    percentage: float
    start_time: datetime
    errors: List[str]

@dataclass
class DocumentMetadata:
    """Metadata dokumentu"""
    source_path: str
    file_name: str
    file_size: int
    last_modified: datetime
    content_hash: str
    category: str
    document_type: str
    processing_time_ms: float
    word_count: int

@dataclass
class LoaderStats:
    """Statystyki loadera"""
    total_documents: int
    cache_hits: int
    cache_misses: int
    processing_time_total: float
    average_processing_time: float
    errors_count: int
    last_run: datetime

# ============================================================================
# DOCUMENT CACHE
# ============================================================================

class DocumentCache:
    """Cache dla dokumentów z SQLite"""
    
    def __init__(self, cache_file: str = "document_cache.db", ttl_hours: int = 24):
        self.cache_file = cache_file
        self.ttl_hours = ttl_hours
        self._init_cache()
        
    def _init_cache(self):
        """Inicjalizuje cache bazę danych"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()
            
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS document_cache (
                    file_path TEXT PRIMARY KEY,
                    content_hash TEXT,
                    content TEXT,
                    metadata TEXT,
                    created_at TIMESTAMP,
                    last_accessed TIMESTAMP
                )
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_cache_hash ON document_cache(content_hash)
            """)
            
            cursor.execute("""
                CREATE INDEX IF NOT EXISTS idx_cache_created ON document_cache(created_at)
            """)
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Cache initialization failed: {e}")

    def get(self, file_path: str, file_hash: str) -> Optional[Dict[str, Any]]:
        """Pobiera dokument z cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()
            
            # Sprawdź czy dokument istnieje i nie jest wygasły
            cutoff_time = datetime.now() - timedelta(hours=self.ttl_hours)
            
            cursor.execute("""
                SELECT content, metadata, created_at FROM document_cache 
                WHERE file_path = ? AND content_hash = ? AND created_at > ?
            """, (file_path, file_hash, cutoff_time))
            
            result = cursor.fetchone()
            
            if result:
                # Update last accessed
                cursor.execute("""
                    UPDATE document_cache SET last_accessed = ? WHERE file_path = ?
                """, (datetime.now(), file_path))
                conn.commit()
                
                return {
                    'content': result[0],
                    'metadata': json.loads(result[1]),
                    'cached_at': result[2]
                }
            
            conn.close()
            return None
            
        except Exception as e:
            logger.error(f"Cache get failed: {e}")
            return None

    def put(self, file_path: str, file_hash: str, content: str, metadata: Dict[str, Any]):
        """Zapisuje dokument do cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()
            
            cursor.execute("""
                INSERT OR REPLACE INTO document_cache 
                (file_path, content_hash, content, metadata, created_at, last_accessed)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                file_path, 
                file_hash, 
                content, 
                json.dumps(metadata),
                datetime.now(),
                datetime.now()
            ))
            
            conn.commit()
            conn.close()
            
        except Exception as e:
            logger.error(f"Cache put failed: {e}")

    def cleanup_expired(self):
        """Usuwa wygasłe wpisy z cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()
            
            cutoff_time = datetime.now() - timedelta(hours=self.ttl_hours)
            
            cursor.execute("DELETE FROM document_cache WHERE created_at < ?", (cutoff_time,))
            deleted = cursor.rowcount
            
            conn.commit()
            conn.close()
            
            if deleted > 0:
                logger.info(f"🧹 Cleaned up {deleted} expired cache entries")
                
        except Exception as e:
            logger.error(f"Cache cleanup failed: {e}")

    def get_cache_stats(self) -> Dict[str, Any]:
        """Pobiera statystyki cache"""
        try:
            conn = sqlite3.connect(self.cache_file)
            cursor = conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM document_cache")
            total_entries = cursor.fetchone()[0]
            
            cursor.execute("SELECT SUM(LENGTH(content)) FROM document_cache")
            total_size = cursor.fetchone()[0] or 0
            
            cutoff_time = datetime.now() - timedelta(hours=self.ttl_hours)
            cursor.execute("SELECT COUNT(*) FROM document_cache WHERE created_at > ?", (cutoff_time,))
            valid_entries = cursor.fetchone()[0]
            
            conn.close()
            
            return {
                'total_entries': total_entries,
                'valid_entries': valid_entries,
                'expired_entries': total_entries - valid_entries,
                'total_size_bytes': total_size,
                'total_size_mb': round(total_size / (1024 * 1024), 2),
                'cache_file': self.cache_file,
                'ttl_hours': self.ttl_hours
            }
            
        except Exception as e:
            logger.error(f"Cache stats failed: {e}")
            return {}

# ============================================================================
# OPTIMIZED DOCUMENT LOADER
# ============================================================================

class OptimizedComarchDocumentLoader:
    """Zoptymalizowany loader dokumentów Comarch"""
    
    def __init__(self, cache_enabled: bool = True, max_workers: int = 4, batch_size: int = 50):
        self.cache_enabled = cache_enabled
        self.max_workers = max_workers
        self.batch_size = batch_size
        
        # Cache
        self.cache = DocumentCache() if cache_enabled else None
        
        # Stats
        self.stats = LoaderStats(
            total_documents=0,
            cache_hits=0,
            cache_misses=0,
            processing_time_total=0.0,
            average_processing_time=0.0,
            errors_count=0,
            last_run=datetime.now()
        )
        
        # Threading
        self._lock = threading.Lock()
        
        logger.info(f"📂 Optimized Document Loader v2.0 initialized")
        logger.info(f"   Cache: {'Enabled' if cache_enabled else 'Disabled'}")
        logger.info(f"   Workers: {max_workers}")
        logger.info(f"   Batch size: {batch_size}")

    def load_all_documents(self, progress_callback: Optional[Callable[[ProcessingProgress], None]] = None) -> List[Dict[str, Any]]:
        """Ładuje wszystkie dokumenty z optymalizacją"""
        start_time = time.time()
        
        # Znajdź wszystkie pliki
        all_files = self._discover_files()
        
        if not all_files:
            logger.warning("No documents found to load")
            return []
        
        logger.info(f"🔍 Found {len(all_files)} files to process")
        
        # Progress tracking
        progress = ProcessingProgress(
            total_files=len(all_files),
            processed_files=0,
            current_file="",
            percentage=0.0,
            start_time=datetime.now(),
            errors=[]
        )
        
        # Cleanup cache
        if self.cache:
            self.cache.cleanup_expired()
        
        # Process in batches
        all_documents = []
        
        for i in range(0, len(all_files), self.batch_size):
            batch = all_files[i:i + self.batch_size]
            
            # Process batch with threading
            batch_docs = self._process_batch(batch, progress, progress_callback)
            all_documents.extend(batch_docs)
            
            # Update progress
            progress.processed_files = min(i + self.batch_size, len(all_files))
            progress.percentage = (progress.processed_files / progress.total_files) * 100
            
            if progress_callback:
                progress_callback(progress)
        
        # Update stats
        processing_time = time.time() - start_time
        self.stats.total_documents = len(all_documents)
        self.stats.processing_time_total = processing_time
        self.stats.average_processing_time = processing_time / max(len(all_documents), 1)
        self.stats.last_run = datetime.now()
        
        logger.info(f"✅ Loaded {len(all_documents)} documents in {processing_time:.2f}s")
        logger.info(f"   Cache hits: {self.stats.cache_hits}")
        logger.info(f"   Cache misses: {self.stats.cache_misses}")
        logger.info(f"   Errors: {self.stats.errors_count}")
        
        return all_documents

    def _discover_files(self) -> List[str]:
        """Znajduje wszystkie pliki do przetworzenia"""
        files = []
        
        # Sprawdź główne katalogi z dokumentacją
        search_paths = [
            "BazaWiedzy",
            "../BazaWiedzy", 
            "backend/data/knowledge_base",
            "data/knowledge_base",
            "docs"
        ]
        
        for search_path in search_paths:
            if os.path.exists(search_path):
                files.extend(self._scan_directory(search_path))
        
        return files

    def _scan_directory(self, directory: str) -> List[str]:
        """Skanuje katalog rekurencyjnie"""
        files = []
        
        try:
            for root, dirs, filenames in os.walk(directory):
                for filename in filenames:
                    if self._is_supported_file(filename):
                        file_path = os.path.join(root, filename)
                        files.append(file_path)
        
        except Exception as e:
            logger.error(f"Directory scan failed for {directory}: {e}")
        
        return files

    def _is_supported_file(self, filename: str) -> bool:
        """Sprawdza czy plik jest obsługiwany"""
        supported_extensions = {'.html', '.xml', '.txt', '.md', '.json'}
        return any(filename.lower().endswith(ext) for ext in supported_extensions)

    def _process_batch(self, file_batch: List[str], progress: ProcessingProgress, 
                      progress_callback: Optional[Callable[[ProcessingProgress], None]]) -> List[Dict[str, Any]]:
        """Przetwarza batch plików z threading"""
        documents = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submit all files in batch
            futures = {
                executor.submit(self._process_single_file, file_path): file_path 
                for file_path in file_batch
            }
            
            # Collect results
            for future in futures:
                file_path = futures[future]
                
                try:
                    progress.current_file = os.path.basename(file_path)
                    if progress_callback:
                        progress_callback(progress)
                    
                    result = future.result(timeout=30)  # 30s timeout per file
                    
                    if result:
                        documents.append(result)
                    
                except Exception as e:
                    with self._lock:
                        self.stats.errors_count += 1
                        progress.errors.append(f"{file_path}: {str(e)}")
                    
                    logger.warning(f"Failed to process {file_path}: {e}")
        
        return documents

    def _process_single_file(self, file_path: str) -> Optional[Dict[str, Any]]:
        """Przetwarza pojedynczy plik"""
        start_time = time.time()
        
        try:
            # Check if file exists and get basic info
            if not os.path.exists(file_path):
                return None
            
            file_stat = os.stat(file_path)
            file_size = file_stat.st_size
            last_modified = datetime.fromtimestamp(file_stat.st_mtime)
            
            # Generate content hash
            file_hash = self._calculate_file_hash(file_path)
            
            # Try cache first
            if self.cache:
                cached_doc = self.cache.get(file_path, file_hash)
                if cached_doc:
                    with self._lock:
                        self.stats.cache_hits += 1
                    return self._create_document_dict(file_path, cached_doc['content'], cached_doc['metadata'])
            
            # Cache miss - process file
            with self._lock:
                self.stats.cache_misses += 1
            
            # Read and process content
            content = self._read_file_content(file_path)
            if not content:
                return None
            
            # Extract text from content
            text_content = self._extract_text_content(content, file_path)
            
            # Create metadata
            metadata = DocumentMetadata(
                source_path=file_path,
                file_name=os.path.basename(file_path),
                file_size=file_size,
                last_modified=last_modified,
                content_hash=file_hash,
                category=self._determine_category(file_path),
                document_type=self._determine_document_type(file_path),
                processing_time_ms=(time.time() - start_time) * 1000,
                word_count=len(text_content.split())
            )
            
            # Cache the result
            if self.cache:
                self.cache.put(file_path, file_hash, text_content, asdict(metadata))
            
            return self._create_document_dict(file_path, text_content, asdict(metadata))
            
        except Exception as e:
            logger.error(f"Error processing {file_path}: {e}")
            return None

    def _calculate_file_hash(self, file_path: str) -> str:
        """Oblicza hash pliku"""
        try:
            hasher = hashlib.md5()
            with open(file_path, 'rb') as f:
                for chunk in iter(lambda: f.read(4096), b""):
                    hasher.update(chunk)
            return hasher.hexdigest()
        except:
            return ""

    def _read_file_content(self, file_path: str) -> Optional[str]:
        """Czyta zawartość pliku"""
        try:
            # Try different encodings
            encodings = ['utf-8', 'utf-8-sig', 'cp1250', 'iso-8859-2', 'latin1']
            
            for encoding in encodings:
                try:
                    with open(file_path, 'r', encoding=encoding) as f:
                        return f.read()
                except UnicodeDecodeError:
                    continue
            
            # If all encodings fail, try binary mode
            with open(file_path, 'rb') as f:
                raw_content = f.read()
                return raw_content.decode('utf-8', errors='ignore')
                
        except Exception as e:
            logger.error(f"Failed to read {file_path}: {e}")
            return None

    def _extract_text_content(self, content: str, file_path: str) -> str:
        """Wyciąga tekst z różnych formatów"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext in ['.html', '.xml']:
            return self._extract_from_html_xml(content)
        elif file_ext == '.json':
            return self._extract_from_json(content)
        else:
            # Plain text
            return content

    def _extract_from_html_xml(self, content: str) -> str:
        """Wyciąga tekst z HTML/XML"""
        try:
            if HTML_PARSER_AVAILABLE and BeautifulSoup:
                soup = BeautifulSoup(content, 'html.parser')
                
                # Remove script and style elements
                for script in soup(["script", "style"]):
                    script.decompose()
                
                # Get text
                text = soup.get_text()
                
                # Clean up whitespace
                lines = (line.strip() for line in text.splitlines())
                chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
                text = ' '.join(chunk for chunk in chunks if chunk)
                
                return text
            else:
                # Fallback: simple regex
                import re
                text = re.sub(r'<[^>]+>', ' ', content)
                text = re.sub(r'\s+', ' ', text).strip()
                return text
                
        except Exception as e:
            logger.warning(f"HTML/XML extraction failed: {e}")
            # Fallback to simple regex
            import re
            text = re.sub(r'<[^>]+>', ' ', content)
            text = re.sub(r'\s+', ' ', text).strip()
            return text

    def _extract_from_json(self, content: str) -> str:
        """Wyciąga tekst z JSON"""
        try:
            data = json.loads(content)
            
            def extract_strings(obj):
                if isinstance(obj, dict):
                    return ' '.join(extract_strings(v) for v in obj.values())
                elif isinstance(obj, list):
                    return ' '.join(extract_strings(item) for item in obj)
                elif isinstance(obj, str):
                    return obj
                else:
                    return str(obj)
            
            return extract_strings(data)
            
        except:
            return content

    def _determine_category(self, file_path: str) -> str:
        """Określa kategorię dokumentu"""
        path_lower = file_path.lower()
        
        if 'ai_' in path_lower or 'chaterp' in path_lower:
            return 'ai_functions'
        elif 'tabele' in path_lower:
            return 'database_tables'
        elif 'procedur' in path_lower:
            return 'procedures'
        elif 'funkcj' in path_lower:
            return 'functions'
        elif 'raport' in path_lower:
            return 'reports'
        elif 'konfigur' in path_lower:
            return 'configuration'
        elif 'help' in path_lower or 'doc' in path_lower:
            return 'documentation'
        else:
            return 'general'

    def _determine_document_type(self, file_path: str) -> str:
        """Określa typ dokumentu"""
        file_ext = os.path.splitext(file_path)[1].lower()
        
        type_mapping = {
            '.html': 'html_documentation',
            '.xml': 'xml_configuration',
            '.txt': 'text_document',
            '.md': 'markdown_documentation',
            '.json': 'json_data'
        }
        
        return type_mapping.get(file_ext, 'unknown')

    def _create_document_dict(self, file_path: str, content: str, metadata: Dict[str, Any]) -> Dict[str, Any]:
        """Tworzy słownik dokumentu"""
        return {
            'content': content,
            'metadata': metadata,
            'source': metadata.get('file_name', os.path.basename(file_path)),
            'category': metadata.get('category', 'general'),
            'document_type': metadata.get('document_type', 'unknown'),
            'word_count': metadata.get('word_count', 0),
            'file_size': metadata.get('file_size', 0)
        }

    def load_documents_from_directory(self, directory: str) -> int:
        """Ładuje dokumenty z konkretnego katalogu"""
        if not os.path.exists(directory):
            logger.warning(f"Directory does not exist: {directory}")
            return 0
        
        files = self._scan_directory(directory)
        documents = []
        
        for file_path in files:
            doc = self._process_single_file(file_path)
            if doc:
                documents.append(doc)
        
        logger.info(f"Loaded {len(documents)} documents from {directory}")
        return len(documents)

    def get_loader_stats(self) -> Dict[str, Any]:
        """Pobiera statystyki loadera"""
        stats_dict = asdict(self.stats)
        
        if self.cache:
            stats_dict['cache_stats'] = self.cache.get_cache_stats()
        
        return stats_dict

    def clear_cache(self):
        """Czyści cache"""
        if self.cache:
            try:
                os.remove(self.cache.cache_file)
                self.cache._init_cache()
                logger.info("✅ Cache cleared")
            except Exception as e:
                logger.error(f"Failed to clear cache: {e}")
