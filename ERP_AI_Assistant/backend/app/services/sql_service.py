"""
=================================================================================
SQL & CODE SERVICE - ROZSZERZENIE ERP AI ASSISTANT
Obsługa zapytań SQL, analizy kodu i pomocy programistycznej
=================================================================================
"""

import os
import re
import json
import sqlite3
import logging
import subprocess
import tempfile
from typing import Dict, Any, List, Optional, Union
from dataclasses import dataclass
from datetime import datetime

# AI & ML
import anthropic
from sqlparse import parse as sql_parse
from sqlparse import format as sql_format

logger = logging.getLogger(__name__)

@dataclass
class SQLQueryResult:
    """Wynik zapytania SQL"""
    query: str
    formatted_query: str
    explanation: str
    is_valid: bool
    is_safe: bool
    execution_result: Optional[Any] = None
    error_message: Optional[str] = None
    suggestions: List[str] = None
    
@dataclass
class CodeAnalysisResult:
    """Wynik analizy kodu"""
    language: str
    code: str
    formatted_code: str
    explanation: str
    issues: List[Dict[str, str]]
    suggestions: List[str]
    complexity_score: int
    is_runnable: bool
    execution_result: Optional[str] = None

class SQLCodeService:
    """Service do obsługi SQL i kodowania"""
    
    def __init__(self, config, ai_service):
        self.config = config
        self.ai_service = ai_service
        self.demo_db_path = "demo_erp.db"
        self._setup_demo_database()
        
        # Dozwolone komendy SQL (tylko SELECT dla bezpieczeństwa)
        self.allowed_sql_keywords = {
            'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 
            'HAVING', 'JOIN', 'INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN',
            'UNION', 'LIMIT', 'DISTINCT', 'AS', 'COUNT', 'SUM', 'AVG',
            'MAX', 'MIN', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END'
        }
        
        # Obsługiwane języki programowania
        self.supported_languages = {
            'python': {'extension': '.py', 'executor': 'python'},
            'javascript': {'extension': '.js', 'executor': 'node'},
            'sql': {'extension': '.sql', 'executor': None},
            'csharp': {'extension': '.cs', 'executor': None},
            'java': {'extension': '.java', 'executor': None},
            'php': {'extension': '.php', 'executor': 'php'},
            'html': {'extension': '.html', 'executor': None},
            'css': {'extension': '.css', 'executor': None}
        }
        
        logger.info("✅ SQL & Code Service zainicjalizowany")
    
    def _setup_demo_database(self):
        """Tworzy demonstracyjną bazę danych ERP"""
        try:
            conn = sqlite3.connect(self.demo_db_path)
            cursor = conn.cursor()
            
            # Tabela kontrahentów
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS kontrahenci (
                    id INTEGER PRIMARY KEY,
                    kod VARCHAR(20) UNIQUE,
                    nazwa VARCHAR(255),
                    nip VARCHAR(15),
                    miasto VARCHAR(100),
                    kategoria VARCHAR(50),
                    obroty_2024 DECIMAL(15,2),
                    data_utworzenia DATE,
                    aktywny BOOLEAN DEFAULT 1
                )
            ''')
            
            # Tabela towarów
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS towary (
                    id INTEGER PRIMARY KEY,
                    kod VARCHAR(20) UNIQUE,
                    nazwa VARCHAR(255),
                    kategoria VARCHAR(100),
                    cena_zakupu DECIMAL(10,2),
                    cena_sprzedazy DECIMAL(10,2),
                    stan_magazynowy INTEGER,
                    jednostka VARCHAR(10),
                    dostawca_id INTEGER,
                    FOREIGN KEY (dostawca_id) REFERENCES kontrahenci(id)
                )
            ''')
            
            # Tabela faktur
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS faktury (
                    id INTEGER PRIMARY KEY,
                    numer VARCHAR(50) UNIQUE,
                    kontrahent_id INTEGER,
                    data_wystawienia DATE,
                    data_platnosci DATE,
                    wartosc_netto DECIMAL(15,2),
                    wartosc_vat DECIMAL(15,2),
                    wartosc_brutto DECIMAL(15,2),
                    status VARCHAR(20) DEFAULT 'Nieopłacona',
                    FOREIGN KEY (kontrahent_id) REFERENCES kontrahenci(id)
                )
            ''')
            
            # Tabela pozycji faktur
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS pozycje_faktur (
                    id INTEGER PRIMARY KEY,
                    faktura_id INTEGER,
                    towar_id INTEGER,
                    ilosc DECIMAL(10,3),
                    cena_jednostkowa DECIMAL(10,2),
                    wartosc_netto DECIMAL(15,2),
                    stawka_vat DECIMAL(5,2),
                    FOREIGN KEY (faktura_id) REFERENCES faktury(id),
                    FOREIGN KEY (towar_id) REFERENCES towary(id)
                )
            ''')
            
            # Wstaw przykładowe dane jeśli tabele są puste
            cursor.execute("SELECT COUNT(*) FROM kontrahenci")
            if cursor.fetchone()[0] == 0:
                self._insert_demo_data(cursor)
            
            conn.commit()
            conn.close()
            logger.info("✅ Demo baza danych ERP gotowa")
            
        except Exception as e:
            logger.error(f"❌ Błąd tworzenia demo bazy: {e}")
    
    def _insert_demo_data(self, cursor):
        """Wstawia przykładowe dane"""
        # Kontrahenci
        kontrahenci_data = [
            (1, 'KONT001', 'ABC Sp. z o.o.', '1234567890', 'Warszawa', 'A', 1250000.00, '2023-01-15', 1),
            (2, 'KONT002', 'XYZ S.A.', '9876543210', 'Kraków', 'A', 850000.00, '2023-02-20', 1),
            (3, 'KONT003', 'Tech Solutions', '5555666677', 'Wrocław', 'B', 450000.00, '2023-03-10', 1),
            (4, 'KONT004', 'Mega Dystrybutor', '1111222233', 'Gdańsk', 'A', 2100000.00, '2023-01-05', 1),
            (5, 'KONT005', 'Local Business', '9999888877', 'Poznań', 'C', 125000.00, '2023-04-12', 1)
        ]
        
        cursor.executemany('''
            INSERT OR REPLACE INTO kontrahenci VALUES (?,?,?,?,?,?,?,?,?)
        ''', kontrahenci_data)
        
        # Towary
        towary_data = [
            (1, 'TOW001', 'Laptop Dell XPS', 'Elektronika', 3200.00, 4500.00, 25, 'szt', 1),
            (2, 'TOW002', 'Monitor 24"', 'Elektronika', 450.00, 650.00, 50, 'szt', 1),
            (3, 'TOW003', 'Mysz optyczna', 'Akcesoria', 25.00, 45.00, 200, 'szt', 2),
            (4, 'TOW004', 'Klawiatura mechaniczna', 'Akcesoria', 180.00, 280.00, 75, 'szt', 2),
            (5, 'TOW005', 'Drukarka HP LaserJet', 'Urządzenia', 850.00, 1200.00, 15, 'szt', 3)
        ]
        
        cursor.executemany('''
            INSERT OR REPLACE INTO towary VALUES (?,?,?,?,?,?,?,?,?)
        ''', towary_data)
        
        # Faktury
        faktury_data = [
            (1, 'FV/001/2024', 1, '2024-01-15', '2024-02-14', 9000.00, 2070.00, 11070.00, 'Opłacona'),
            (2, 'FV/002/2024', 2, '2024-01-20', '2024-02-19', 1300.00, 299.00, 1599.00, 'Opłacona'),
            (3, 'FV/003/2024', 3, '2024-02-01', '2024-03-03', 560.00, 128.80, 688.80, 'Nieopłacona'),
            (4, 'FV/004/2024', 1, '2024-02-15', '2024-03-17', 2400.00, 552.00, 2952.00, 'Częściowo opłacona'),
            (5, 'FV/005/2024', 4, '2024-03-01', '2024-03-31', 12000.00, 2760.00, 14760.00, 'Nieopłacona')
        ]
        
        cursor.executemany('''
            INSERT OR REPLACE INTO faktury VALUES (?,?,?,?,?,?,?,?,?)
        ''', faktury_data)
    
    def analyze_sql_query(self, query: str) -> SQLQueryResult:
        """Analizuje zapytanie SQL"""
        try:
            # Formatowanie SQL
            formatted_query = sql_format(query, reindent=True, keyword_case='upper')
            
            # Sprawdzenie bezpieczeństwa
            is_safe = self._is_sql_safe(query)
            
            # Sprawdzenie składni
            is_valid = self._validate_sql_syntax(query)
            
            # Generowanie wyjaśnienia przez AI
            explanation = self._generate_sql_explanation(query)
            
            # Wykonanie zapytania jeśli bezpieczne
            execution_result = None
            error_message = None
            
            if is_safe and is_valid:
                try:
                    execution_result = self._execute_sql_query(query)
                except Exception as e:
                    error_message = str(e)
                    is_valid = False
            
            # Generowanie sugestii
            suggestions = self._generate_sql_suggestions(query, execution_result)
            
            return SQLQueryResult(
                query=query,
                formatted_query=formatted_query,
                explanation=explanation,
                is_valid=is_valid,
                is_safe=is_safe,
                execution_result=execution_result,
                error_message=error_message,
                suggestions=suggestions
            )
            
        except Exception as e:
            logger.error(f"❌ Błąd analizy SQL: {e}")
            return SQLQueryResult(
                query=query,
                formatted_query=query,
                explanation=f"Błąd podczas analizy: {e}",
                is_valid=False,
                is_safe=False,
                error_message=str(e)
            )
    
    def _is_sql_safe(self, query: str) -> bool:
        """Sprawdza bezpieczeństwo zapytania SQL"""
        query_upper = query.upper()
        
        # Sprawdź niebezpieczne słowa kluczowe
        dangerous_keywords = [
            'DROP', 'DELETE', 'UPDATE', 'INSERT', 'ALTER', 'CREATE',
            'TRUNCATE', 'EXEC', 'EXECUTE', 'GRANT', 'REVOKE'
        ]
        
        for keyword in dangerous_keywords:
            if keyword in query_upper:
                return False
        
        # Sprawdź dozwolone słowa kluczowe
        tokens = re.findall(r'\b\w+\b', query_upper)
        sql_tokens = [token for token in tokens if token in self.allowed_sql_keywords or token.isdigit()]
        
        return len(sql_tokens) > 0
    
    def _validate_sql_syntax(self, query: str) -> bool:
        """Sprawdza składnię SQL"""
        try:
            parsed = sql_parse(query)
            return len(parsed) > 0
        except:
            return False
    
    def _execute_sql_query(self, query: str) -> List[Dict]:
        """Wykonuje zapytanie SQL na demo bazie"""
        conn = sqlite3.connect(self.demo_db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        try:
            cursor.execute(query)
            rows = cursor.fetchall()
            
            # Konwertuj do listy słowników
            result = []
            for row in rows:
                result.append(dict(row))
            
            return result
            
        finally:
            conn.close()
    
    def _generate_sql_explanation(self, query: str) -> str:
        """Generuje wyjaśnienie zapytania SQL przez AI"""
        try:
            system_prompt = """Jesteś ekspertem SQL. Wyjaśnij dokładnie co robi to zapytanie SQL.
            
Skupi się na:
- Głównej logice zapytania
- Jakie tabele są używane
- Jakie warunki są stosowane
- Co zwraca zapytanie
- Czy są potencjalne problemy wydajnościowe

Odpowiadaj po polsku w sposób zrozumiały."""

            message = self.ai_service.claude_client.messages.create(
                model=self.config.CLAUDE_HAIKU_MODEL,
                max_tokens=500,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Wyjaśnij to zapytanie SQL:\n\n{query}"}]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Błąd generowania wyjaśnienia SQL: {e}")
            return "Nie można wygenerować wyjaśnienia zapytania."
    
    def _generate_sql_suggestions(self, query: str, result: List[Dict]) -> List[str]:
        """Generuje sugestie dla zapytania SQL"""
        suggestions = []
        
        query_upper = query.upper()
        
        # Sugestie wydajnościowe
        if 'SELECT *' in query_upper:
            suggestions.append("💡 Rozważ wymienienie konkretnych kolumn zamiast SELECT *")
        
        if 'ORDER BY' not in query_upper and result and len(result) > 10:
            suggestions.append("💡 Dodaj ORDER BY dla przewidywalnej kolejności wyników")
        
        if 'LIMIT' not in query_upper and result and len(result) > 100:
            suggestions.append("💡 Rozważ dodanie LIMIT dla ograniczenia liczby wyników")
        
        if 'WHERE' not in query_upper and 'JOIN' in query_upper:
            suggestions.append("💡 Sprawdź czy nie potrzebujesz warunków WHERE dla filtrowania")
        
        # Sugestie funkcjonalne
        if result:
            suggestions.append(f"✅ Zapytanie zwróciło {len(result)} rekordów")
            
            if len(result) > 0:
                columns = list(result[0].keys())
                suggestions.append(f"📊 Dostępne kolumny: {', '.join(columns)}")
        
        return suggestions
    
    def analyze_code(self, code: str, language: str = None) -> CodeAnalysisResult:
        """Analizuje kod w różnych językach"""
        try:
            # Auto-detekcja języka jeśli nie podano
            if not language:
                language = self._detect_language(code)
            
            # Formatowanie kodu
            formatted_code = self._format_code(code, language)
            
            # Analiza przez AI
            explanation = self._generate_code_explanation(code, language)
            
            # Znajdź potencjalne problemy
            issues = self._find_code_issues(code, language)
            
            # Oblicz złożoność
            complexity_score = self._calculate_complexity(code, language)
            
            # Sprawdź czy kod można uruchomić
            is_runnable = language in ['python', 'javascript', 'php']
            
            # Wykonaj kod jeśli możliwe i bezpieczne
            execution_result = None
            if is_runnable and self._is_code_safe(code, language):
                execution_result = self._execute_code(code, language)
            
            # Generuj sugestie
            suggestions = self._generate_code_suggestions(code, language, issues)
            
            return CodeAnalysisResult(
                language=language,
                code=code,
                formatted_code=formatted_code,
                explanation=explanation,
                issues=issues,
                suggestions=suggestions,
                complexity_score=complexity_score,
                is_runnable=is_runnable,
                execution_result=execution_result
            )
            
        except Exception as e:
            logger.error(f"❌ Błąd analizy kodu: {e}")
            return CodeAnalysisResult(
                language=language or 'unknown',
                code=code,
                formatted_code=code,
                explanation=f"Błąd podczas analizy: {e}",
                issues=[],
                suggestions=[],
                complexity_score=0,
                is_runnable=False
            )
    
    def _detect_language(self, code: str) -> str:
        """Auto-detekcja języka programowania"""
        code_lower = code.lower()
        
        # Wzorce charakterystyczne dla różnych języków
        patterns = {
            'python': [
                r'def\s+\w+\s*\(',
                r'import\s+\w+',
                r'from\s+\w+\s+import',
                r'if\s+__name__\s*==\s*["\']__main__["\']',
                r'print\s*\('
            ],
            'javascript': [
                r'function\s+\w+\s*\(',
                r'const\s+\w+\s*=',
                r'let\s+\w+\s*=',
                r'var\s+\w+\s*=',
                r'console\.log\s*\(',
                r'=>'
            ],
            'java': [
                r'public\s+class\s+\w+',
                r'public\s+static\s+void\s+main',
                r'System\.out\.println\s*\(',
                r'import\s+java\.'
            ],
            'csharp': [
                r'using\s+System',
                r'public\s+class\s+\w+',
                r'Console\.WriteLine\s*\(',
                r'namespace\s+\w+'
            ],
            'php': [
                r'<\?php',
                r'\$\w+\s*=',
                r'echo\s+',
                r'function\s+\w+\s*\('
            ],
            'sql': [
                r'SELECT\s+',
                r'FROM\s+\w+',
                r'WHERE\s+',
                r'INSERT\s+INTO',
                r'UPDATE\s+\w+\s+SET',
                r'CREATE\s+TABLE'
            ]
        }
        
        scores = {}
        for lang, lang_patterns in patterns.items():
            score = 0
            for pattern in lang_patterns:
                matches = len(re.findall(pattern, code, re.IGNORECASE))
                score += matches
            scores[lang] = score
        
        # Znajdź język z najwyższym wynikiem
        if scores:
            detected_lang = max(scores, key=scores.get)
            if scores[detected_lang] > 0:
                return detected_lang
        
        return 'text'
    
    def _format_code(self, code: str, language: str) -> str:
        """Formatuje kod w zależności od języka"""
        try:
            if language == 'sql':
                return sql_format(code, reindent=True, keyword_case='upper')
            elif language == 'python':
                # Podstawowe formatowanie Python
                lines = code.split('\n')
                formatted_lines = []
                indent_level = 0
                
                for line in lines:
                    stripped = line.strip()
                    if not stripped:
                        formatted_lines.append('')
                        continue
                    
                    # Zmniejsz wcięcie przed niektórymi słowami kluczowymi
                    if stripped.startswith(('else:', 'elif', 'except:', 'finally:')):
                        indent_level = max(0, indent_level - 1)
                    
                    formatted_lines.append('    ' * indent_level + stripped)
                    
                    # Zwiększ wcięcie po dwukropku
                    if stripped.endswith(':'):
                        indent_level += 1
                
                return '\n'.join(formatted_lines)
            
            return code  # Zwróć oryginalny kod jeśli nie ma formatera
            
        except Exception as e:
            logger.error(f"Błąd formatowania kodu: {e}")
            return code
    
    def _generate_code_explanation(self, code: str, language: str) -> str:
        """Generuje wyjaśnienie kodu przez AI"""
        try:
            system_prompt = f"""Jesteś ekspertem programowania w języku {language}. 
            Przeanalizuj podany kod i wyjaśnij:

1. Co robi ten kod (główna funkcjonalność)
2. Jak działa (krok po kroku dla kluczowych części)
3. Jakie są główne komponenty/funkcje
4. Czy kod jest napisany dobrze (best practices)
5. Potencjalne problemy lub areas for improvement

Odpowiadaj po polsku w sposób zrozumiały dla programistów."""

            message = self.ai_service.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=800,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Przeanalizuj ten kod {language}:\n\n```{language}\n{code}\n```"}]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"Błąd generowania wyjaśnienia kodu: {e}")
            return "Nie można wygenerować wyjaśnienia kodu."
    
    def _find_code_issues(self, code: str, language: str) -> List[Dict[str, str]]:
        """Znajduje potencjalne problemy w kodzie"""
        issues = []
        
        if language == 'python':
            # Sprawdź typowe problemy Python
            if 'eval(' in code:
                issues.append({
                    'type': 'security',
                    'severity': 'high',
                    'message': 'Użycie eval() może być niebezpieczne'
                })
            
            if 'exec(' in code:
                issues.append({
                    'type': 'security',
                    'severity': 'high',
                    'message': 'Użycie exec() może być niebezpieczne'
                })
            
            if 'import *' in code:
                issues.append({
                    'type': 'style',
                    'severity': 'medium',
                    'message': 'Wildcard import może powodować konflikty nazw'
                })
                
            # Sprawdź długość linii
            lines = code.split('\n')
            for i, line in enumerate(lines, 1):
                if len(line) > 79:
                    issues.append({
                        'type': 'style',
                        'severity': 'low',
                        'message': f'Linia {i} przekracza 79 znaków (PEP 8)'
                    })
                    break  # Tylko pierwsza długa linia
        
        elif language == 'javascript':
            # Sprawdź typowe problemy JavaScript
            if '==' in code and '===' not in code:
                issues.append({
                    'type': 'style',
                    'severity': 'medium',
                    'message': 'Rozważ użycie === zamiast == dla strict comparison'
                })
            
            if 'var ' in code:
                issues.append({
                    'type': 'style',
                    'severity': 'low',
                    'message': 'Rozważ użycie let/const zamiast var'
                })
        
        elif language == 'sql':
            # Sprawdź typowe problemy SQL
            if 'SELECT *' in code.upper():
                issues.append({
                    'type': 'performance',
                    'severity': 'medium',
                    'message': 'SELECT * może wpływać na wydajność'
                })
            
            if 'WHERE' not in code.upper() and 'SELECT' in code.upper():
                issues.append({
                    'type': 'performance',
                    'severity': 'low',
                    'message': 'Brak klauzuli WHERE może zwrócić dużo danych'
                })
        
        return issues
    
    def _calculate_complexity(self, code: str, language: str) -> int:
        """Oblicza złożoność cyklomatyczną kodu"""
        complexity = 1  # Bazowa złożoność
        
        # Słowa kluczowe zwiększające złożoność
        complexity_keywords = [
            'if', 'else', 'elif', 'while', 'for', 'case', 'catch',
            'try', 'except', 'finally', '&&', '||', '?', ':'
        ]
        
        code_lower = code.lower()
        for keyword in complexity_keywords:
            complexity += code_lower.count(keyword)
        
        return min(complexity, 10)  # Maksimum 10
    
    def _is_code_safe(self, code: str, language: str) -> bool:
        """Sprawdza czy kod jest bezpieczny do wykonania"""
        dangerous_patterns = [
            'import os', 'import subprocess', 'import sys',
            'exec(', 'eval(', '__import__',
            'open(', 'file(', 'input(',
            'raw_input(', 'execfile(',
            'system(', 'popen(', 'spawn',
            'rm ', 'del ', 'delete',
            'format(', 'globals(', 'locals(',
            'setattr(', 'getattr(', 'hasattr(',
            'compile(', 'reload('
        ]
        
        code_lower = code.lower()
        for pattern in dangerous_patterns:
            if pattern in code_lower:
                return False
        
        # Sprawdź długość kodu (max 1000 znaków)
        if len(code) > 1000:
            return False
        
        return True
    
    def _execute_code(self, code: str, language: str) -> str:
        """Wykonuje kod w bezpiecznym środowisku"""
        try:
            if not self._is_code_safe(code, language):
                return "❌ Kod zawiera potencjalnie niebezpieczne instrukcje"
            
            if language == 'python':
                return self._execute_python_code(code)
            elif language == 'javascript':
                return self._execute_javascript_code(code)
            else:
                return f"Wykonywanie kodu {language} nie jest obsługiwane"
                
        except Exception as e:
            return f"❌ Błąd wykonania: {str(e)}"
    
    def _execute_python_code(self, code: str) -> str:
        """Wykonuje kod Python"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                ['python', temp_file],
                capture_output=True,
                text=True,
                timeout=5  # 5 sekund timeout
            )
            
            output = ""
            if result.stdout:
                output += f"📤 Output:\n{result.stdout}"
            if result.stderr:
                output += f"\n❌ Errors:\n{result.stderr}"
            if result.returncode != 0:
                output += f"\n⚠️ Exit code: {result.returncode}"
            
            return output or "✅ Kod wykonał się bez outputu"
            
        except subprocess.TimeoutExpired:
            return "⏱️ Timeout - kod wykonywał się zbyt długo"
        except Exception as e:
            return f"❌ Błąd wykonania: {str(e)}"
        finally:
            try:
                os.unlink(temp_file)
            except:
                pass
    
    def _execute_javascript_code(self, code: str) -> str:
        """Wykonuje kod JavaScript"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.js', delete=False) as f:
            f.write(code)
            temp_file = f.name
        
        try:
            result = subprocess.run(
                ['node', temp_file],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            output = ""
            if result.stdout:
                output += f"📤 Output:\n{result.stdout}"
            if result.stderr:
                output += f"\n❌ Errors:\n{result.stderr}"
            if result.returncode != 0:
                output += f"\n⚠️ Exit code: {result.returncode}"
            
            return output or "✅ Kod wykonał się bez outputu"
            
        except subprocess.TimeoutExpired:
            return "⏱️ Timeout - kod wykonywał się zbyt długo"
        except Exception as e:
            return f"❌ Błąd wykonania: {str(e)}"
        finally:
            try:
                os.unlink(temp_file)
            except:
                pass
    
    def _generate_code_suggestions(self, code: str, language: str, issues: List[Dict]) -> List[str]:
        """Generuje sugestie dla kodu"""
        suggestions = []
        
        # Sugestie na podstawie problemów
        for issue in issues:
            if issue['severity'] == 'high':
                suggestions.append(f"🔴 {issue['message']}")
            elif issue['severity'] == 'medium':
                suggestions.append(f"🟡 {issue['message']}")
            else:
                suggestions.append(f"🔵 {issue['message']}")
        
        # Sugestie ogólne
        if language == 'python':
            if 'print(' in code:
                suggestions.append("💡 Rozważ użycie logging zamiast print() w kodzie produkcyjnym")
            
            if 'def ' in code and 'return' not in code:
                suggestions.append("💡 Sprawdź czy funkcje powinny zwracać wartości")
        
        elif language == 'javascript':
            if 'console.log(' in code:
                suggestions.append("💡 Pamiętaj o usunięciu console.log() przed produkcją")
        
        elif language == 'sql':
            if 'SELECT' in code.upper() and 'LIMIT' not in code.upper():
                suggestions.append("💡 Rozważ dodanie LIMIT dla bezpieczeństwa")
        
        return suggestions
    
    def get_database_schema(self) -> Dict[str, Any]:
        """Zwraca schemat demo bazy danych"""
        try:
            conn = sqlite3.connect(self.demo_db_path)
            cursor = conn.cursor()
            
            # Pobierz listę tabel
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            tables = [row[0] for row in cursor.fetchall()]
            
            schema = {}
            for table in tables:
                # Pobierz strukturę tabeli
                cursor.execute(f"PRAGMA table_info({table})")
                columns = []
                for col_info in cursor.fetchall():
                    columns.append({
                        'name': col_info[1],
                        'type': col_info[2],
                        'not_null': bool(col_info[3]),
                        'default': col_info[4],
                        'primary_key': bool(col_info[5])
                    })
                
                # Pobierz przykładowe dane
                cursor.execute(f"SELECT * FROM {table} LIMIT 3")
                sample_data = [dict(zip([col[0] for col in cursor.description], row)) 
                              for row in cursor.fetchall()]
                
                schema[table] = {
                    'columns': columns,
                    'sample_data': sample_data
                }
            
            conn.close()
            return schema
            
        except Exception as e:
            logger.error(f"❌ Błąd pobierania schematu: {e}")
            return {}
    
    def generate_sql_query(self, description: str) -> str:
        """Generuje zapytanie SQL na podstawie opisu"""
        try:
            schema = self.get_database_schema()
            
            system_prompt = f"""Jesteś ekspertem SQL. Na podstawie opisu użytkownika wygeneruj zapytanie SQL.

Dostępne tabele i kolumny:
{json.dumps(schema, indent=2, ensure_ascii=False)}

Zasady:
- Używaj tylko SELECT (bezpieczeństwo)
- Używaj prawidłowych nazw tabel i kolumn
- Dodaj odpowiednie JOINy jeśli potrzeba
- Formatuj zapytanie czytelnie
- Jeśli opis jest niejasny, wygeneruj najprostsze sensowne zapytanie

Zwróć tylko kod SQL bez dodatkowych komentarzy."""

            message = self.ai_service.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=400,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Wygeneruj zapytanie SQL dla: {description}"}]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"❌ Błąd generowania SQL: {e}")
            return f"-- Błąd generowania zapytania: {e}"
    
    def generate_code_snippet(self, description: str, language: str) -> str:
        """Generuje fragment kodu na podstawie opisu"""
        try:
            system_prompt = f"""Jesteś ekspertem programowania w języku {language}.
Na podstawie opisu użytkownika wygeneruj kod.

Zasady:
- Kod powinien być kompletny i funkcjonalny
- Dodaj komentarze wyjaśniające
- Użyj best practices dla {language}
- Kod powinien być bezpieczny
- Nie używaj zewnętrznych bibliotek jeśli nie jest to konieczne

Zwróć tylko kod bez dodatkowych wyjaśnień."""

            message = self.ai_service.claude_client.messages.create(
                model=self.config.CLAUDE_MODEL,
                max_tokens=600,
                system=system_prompt,
                messages=[{"role": "user", "content": f"Wygeneruj kod {language} dla: {description}"}]
            )
            
            return message.content[0].text.strip()
            
        except Exception as e:
            logger.error(f"❌ Błąd generowania kodu: {e}")
            return f"// Błąd generowania kodu: {e}"
