#!/usr/bin/env python3
"""
=================================================================================
SQL CODE SERVICE v2.0
Zaawansowany serwis analizy i generowania kodu SQL dla systemów ERP
=================================================================================
"""

import os
import re
import sqlite3
import logging
import time
from datetime import datetime
from typing import Dict, Any, List, Optional, Tuple
from dataclasses import dataclass, asdict
from enum import Enum

import anthropic
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

# ============================================================================
# DATA STRUCTURES
# ============================================================================

class SQLComplexity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class SQLQueryResult:
    """Wynik analizy zapytania SQL"""
    query: str
    is_valid: bool
    is_safe: bool
    complexity: SQLComplexity
    estimated_performance: str
    security_issues: List[str]
    optimization_suggestions: List[str]
    tables_accessed: List[str]
    query_type: str
    confidence_score: float

@dataclass
class CodeAnalysisResult:
    """Wynik analizy kodu programistycznego"""
    code: str
    language: str
    complexity_score: float
    issues: List[str]
    suggestions: List[str]
    security_warnings: List[str]
    maintainability_score: float
    performance_notes: List[str]

# ============================================================================
# SQL CODE SERVICE
# ============================================================================

class SQLCodeService:
    """Zaawansowany serwis analizy SQL i kodu"""
    
    def __init__(self, config, ai_service):
        self.config = config
        self.ai_service = ai_service
        self.claude_client = ai_service.claude_client
        
        # Baza danych demo
        self.db_path = "demo_erp.db"
        self._initialize_demo_database()
        
        # SQL patterns dla bezpieczeństwa
        self.dangerous_patterns = [
            r';\s*drop\s+table',
            r';\s*delete\s+from',
            r';\s*truncate',
            r';\s*alter\s+table',
            r'--',
            r'/\*.*\*/',
            r'union\s+select',
            r'or\s+1\s*=\s*1',
            r'and\s+1\s*=\s*1'
        ]
        
        logger.info("🗃️ SQL Code Service v2.0 initialized")

    def _initialize_demo_database(self):
        """Inicjalizuje demo bazę danych ERP"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabele ERP
            cursor.executescript("""
                -- Klienci
                CREATE TABLE IF NOT EXISTS Customers (
                    customer_id INTEGER PRIMARY KEY,
                    name TEXT NOT NULL,
                    email TEXT,
                    phone TEXT,
                    address TEXT,
                    city TEXT,
                    country TEXT,
                    credit_limit DECIMAL(10,2),
                    created_date DATE
                );
                
                -- Produkty
                CREATE TABLE IF NOT EXISTS Products (
                    product_id INTEGER PRIMARY KEY,
                    product_name TEXT NOT NULL,
                    category TEXT,
                    price DECIMAL(10,2),
                    stock_quantity INTEGER,
                    supplier_id INTEGER,
                    created_date DATE
                );
                
                -- Zamówienia
                CREATE TABLE IF NOT EXISTS Orders (
                    order_id INTEGER PRIMARY KEY,
                    customer_id INTEGER,
                    order_date DATE,
                    total_amount DECIMAL(10,2),
                    status TEXT,
                    shipped_date DATE,
                    FOREIGN KEY (customer_id) REFERENCES Customers(customer_id)
                );
                
                -- Pozycje zamówień
                CREATE TABLE IF NOT EXISTS OrderItems (
                    item_id INTEGER PRIMARY KEY,
                    order_id INTEGER,
                    product_id INTEGER,
                    quantity INTEGER,
                    unit_price DECIMAL(10,2),
                    FOREIGN KEY (order_id) REFERENCES Orders(order_id),
                    FOREIGN KEY (product_id) REFERENCES Products(product_id)
                );
                
                -- Faktury
                CREATE TABLE IF NOT EXISTS Invoices (
                    invoice_id INTEGER PRIMARY KEY,
                    order_id INTEGER,
                    invoice_date DATE,
                    due_date DATE,
                    amount DECIMAL(10,2),
                    status TEXT,
                    paid_date DATE,
                    FOREIGN KEY (order_id) REFERENCES Orders(order_id)
                );
                
                -- Pracownicy
                CREATE TABLE IF NOT EXISTS Employees (
                    employee_id INTEGER PRIMARY KEY,
                    first_name TEXT,
                    last_name TEXT,
                    email TEXT,
                    department TEXT,
                    position TEXT,
                    salary DECIMAL(10,2),
                    hire_date DATE
                );
                
                -- Dostawcy
                CREATE TABLE IF NOT EXISTS Suppliers (
                    supplier_id INTEGER PRIMARY KEY,
                    company_name TEXT NOT NULL,
                    contact_person TEXT,
                    email TEXT,
                    phone TEXT,
                    address TEXT,
                    rating INTEGER
                );
            """)
            
            # Przykładowe dane
            cursor.execute("SELECT COUNT(*) FROM Customers")
            if cursor.fetchone()[0] == 0:
                cursor.executescript("""
                    INSERT INTO Customers VALUES 
                    (1, 'ABC Manufacturing', 'contact@abc.com', '123-456-789', 'ul. Główna 1', 'Warszawa', 'Polska', 50000.00, '2024-01-15'),
                    (2, 'XYZ Corporation', 'info@xyz.com', '987-654-321', 'al. Biznesu 10', 'Kraków', 'Polska', 75000.00, '2024-02-20');
                    
                    INSERT INTO Products VALUES
                    (1, 'Licencja ERP Standard', 'Software', 5000.00, 100, 1, '2024-01-01'),
                    (2, 'Moduł CRM', 'Software', 2000.00, 50, 1, '2024-01-01'),
                    (3, 'Usługa wdrożenia', 'Services', 10000.00, 10, 1, '2024-01-01');
                    
                    INSERT INTO Orders VALUES
                    (1, 1, '2024-03-01', 15000.00, 'Completed', '2024-03-15'),
                    (2, 2, '2024-03-10', 7000.00, 'Processing', NULL);
                    
                    INSERT INTO Employees VALUES
                    (1, 'Jan', 'Kowalski', 'j.kowalski@company.com', 'IT', 'Developer', 8000.00, '2023-01-15'),
                    (2, 'Anna', 'Nowak', 'a.nowak@company.com', 'Sales', 'Manager', 12000.00, '2022-06-01');
                """)
            
            conn.commit()
            conn.close()
            logger.info("✅ Demo database initialized")
            
        except Exception as e:
            logger.error(f"❌ Database initialization failed: {e}")

    def analyze_sql_query(self, query: str) -> SQLQueryResult:
        """Analizuje zapytanie SQL pod kątem bezpieczeństwa i wydajności"""
        try:
            logger.info(f"🔍 Analyzing SQL query: {query[:100]}...")
            
            # Podstawowa walidacja
            is_valid = self._validate_sql_syntax(query)
            is_safe = self._check_sql_security(query)
            complexity = self._assess_sql_complexity(query)
            tables_accessed = self._extract_tables(query)
            query_type = self._determine_query_type(query)
            
            # Analiza wydajności
            performance = self._assess_performance(query)
            
            # Sugestie optymalizacji
            optimization_suggestions = self._generate_optimization_suggestions(query)
            
            # Problemy bezpieczeństwa
            security_issues = self._identify_security_issues(query)
            
            # Ocena pewności
            confidence = self._calculate_confidence(is_valid, is_safe, query)
            
            result = SQLQueryResult(
                query=query,
                is_valid=is_valid,
                is_safe=is_safe,
                complexity=complexity,
                estimated_performance=performance,
                security_issues=security_issues,
                optimization_suggestions=optimization_suggestions,
                tables_accessed=tables_accessed,
                query_type=query_type,
                confidence_score=confidence
            )
            
            logger.info(f"✅ SQL analysis complete: valid={is_valid}, safe={is_safe}")
            return result
            
        except Exception as e:
            logger.error(f"❌ SQL analysis failed: {e}")
            return SQLQueryResult(
                query=query,
                is_valid=False,
                is_safe=False,
                complexity=SQLComplexity.CRITICAL,
                estimated_performance="Unknown",
                security_issues=[f"Analysis error: {str(e)}"],
                optimization_suggestions=[],
                tables_accessed=[],
                query_type="Unknown",
                confidence_score=0.0
            )

    def generate_sql_query(self, description: str) -> str:
        """Generuje zapytanie SQL na podstawie opisu"""
        try:
            if not self.claude_client:
                return self._generate_simple_sql(description)
            
            schema_info = self.get_database_schema()
            schema_text = self._format_schema_for_prompt(schema_info)
            
            prompt = f"""Jesteś ekspertem SQL dla systemów ERP. Wygeneruj zapytanie SQL na podstawie opisu.

SCHEMAT BAZY DANYCH:
{schema_text}

OPIS ZAPYTANIA: {description}

WYMAGANIA:
1. Wygeneruj tylko jedno, poprawne zapytanie SQL
2. Użyj tylko tabel ze schematu powyżej
3. Zapytanie powinno być bezpieczne (bez DROP, DELETE bez WHERE itp.)
4. Dodaj komentarze wyjaśniające logikę
5. Użyj aliasów dla czytelności
6. Zapytanie powinno być optymalne wydajnościowo

SQL:"""

            message = self.claude_client.messages.create(
                model=self.config.CLAUDE_HAIKU_MODEL,
                max_tokens=1024,
                temperature=0.1,
                messages=[{"role": "user", "content": prompt}]
            )
            
            generated_sql = message.content[0].text.strip()
            
            # Oczyść odpowiedź z niepotrzebnych części
            if "```sql" in generated_sql:
                generated_sql = generated_sql.split("```sql")[1].split("```")[0].strip()
            elif "```" in generated_sql:
                generated_sql = generated_sql.split("```")[1].strip()
            
            return generated_sql
            
        except Exception as e:
            logger.error(f"SQL generation failed: {e}")
            return self._generate_simple_sql(description)

    def _generate_simple_sql(self, description: str) -> str:
        """Fallback generator SQL"""
        description_lower = description.lower()
        
        if "klient" in description_lower or "customer" in description_lower:
            return "SELECT * FROM Customers WHERE name LIKE '%przykład%' LIMIT 10;"
        elif "produkt" in description_lower or "product" in description_lower:
            return "SELECT * FROM Products ORDER BY price DESC LIMIT 10;"
        elif "zamówien" in description_lower or "order" in description_lower:
            return "SELECT o.*, c.name FROM Orders o JOIN Customers c ON o.customer_id = c.customer_id ORDER BY o.order_date DESC LIMIT 10;"
        elif "faktur" in description_lower or "invoice" in description_lower:
            return "SELECT * FROM Invoices WHERE status = 'Unpaid' ORDER BY due_date ASC;"
        elif "pracownik" in description_lower or "employee" in description_lower:
            return "SELECT first_name, last_name, department, position FROM Employees ORDER BY department, last_name;"
        else:
            return f"-- Zapytanie dla: {description}\nSELECT 'Proszę sprecyzować zapytanie' as message;"

    def analyze_code(self, code: str, language: str = None) -> CodeAnalysisResult:
        """Analizuje kod programistyczny"""
        try:
            if not language:
                language = self._detect_language(code)
            
            complexity_score = self._calculate_code_complexity(code)
            issues = self._identify_code_issues(code, language)
            suggestions = self._generate_code_suggestions(code, language)
            security_warnings = self._check_code_security(code, language)
            maintainability = self._assess_maintainability(code)
            performance_notes = self._analyze_performance_issues(code, language)
            
            return CodeAnalysisResult(
                code=code,
                language=language,
                complexity_score=complexity_score,
                issues=issues,
                suggestions=suggestions,
                security_warnings=security_warnings,
                maintainability_score=maintainability,
                performance_notes=performance_notes
            )
            
        except Exception as e:
            logger.error(f"Code analysis failed: {e}")
            return CodeAnalysisResult(
                code=code,
                language=language or "unknown",
                complexity_score=0.0,
                issues=[f"Analysis error: {str(e)}"],
                suggestions=[],
                security_warnings=[],
                maintainability_score=0.0,
                performance_notes=[]
            )

    def get_database_schema(self) -> Dict[str, Any]:
        """Zwraca schemat bazy danych"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Pobierz listę tabel
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
            tables = cursor.fetchall()
            
            schema = {}
            for table in tables:
                table_name = table[0]
                cursor.execute(f"PRAGMA table_info({table_name});")
                columns = cursor.fetchall()
                
                schema[table_name] = {
                    'columns': [
                        {
                            'name': col[1],
                            'type': col[2],
                            'not_null': bool(col[3]),
                            'primary_key': bool(col[5])
                        } for col in columns
                    ]
                }
            
            conn.close()
            return schema
            
        except Exception as e:
            logger.error(f"Schema retrieval failed: {e}")
            return {}

    # ============================================================================
    # HELPER METHODS
    # ============================================================================

    def _validate_sql_syntax(self, query: str) -> bool:
        """Waliduje składnię SQL"""
        try:
            conn = sqlite3.connect(":memory:")
            cursor = conn.cursor()
            cursor.execute(f"EXPLAIN QUERY PLAN {query}")
            conn.close()
            return True
        except:
            return False

    def _check_sql_security(self, query: str) -> bool:
        """Sprawdza bezpieczeństwo zapytania SQL"""
        query_lower = query.lower()
        
        for pattern in self.dangerous_patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                return False
        
        return True

    def _assess_sql_complexity(self, query: str) -> SQLComplexity:
        """Ocenia złożoność zapytania SQL"""
        query_lower = query.lower()
        complexity_score = 0
        
        # Liczba JOINów
        join_count = query_lower.count('join')
        complexity_score += join_count * 2
        
        # Subqueries
        subquery_count = query_lower.count('select') - 1
        complexity_score += subquery_count * 3
        
        # Funkcje agregujące
        agg_functions = ['sum', 'count', 'avg', 'max', 'min', 'group by']
        for func in agg_functions:
            if func in query_lower:
                complexity_score += 1
        
        # Window functions
        window_functions = ['over', 'partition by', 'row_number', 'rank']
        for func in window_functions:
            if func in query_lower:
                complexity_score += 2
        
        if complexity_score <= 3:
            return SQLComplexity.LOW
        elif complexity_score <= 7:
            return SQLComplexity.MEDIUM
        elif complexity_score <= 12:
            return SQLComplexity.HIGH
        else:
            return SQLComplexity.CRITICAL

    def _extract_tables(self, query: str) -> List[str]:
        """Wyciąga nazwy tabel z zapytania"""
        query_lower = query.lower()
        tables = []
        
        # Proste wyrażenie regularne dla tabel
        from_pattern = r'from\s+(\w+)'
        join_pattern = r'join\s+(\w+)'
        
        tables.extend(re.findall(from_pattern, query_lower))
        tables.extend(re.findall(join_pattern, query_lower))
        
        return list(set(tables))

    def _determine_query_type(self, query: str) -> str:
        """Określa typ zapytania"""
        query_lower = query.lower().strip()
        
        if query_lower.startswith('select'):
            return 'SELECT'
        elif query_lower.startswith('insert'):
            return 'INSERT'
        elif query_lower.startswith('update'):
            return 'UPDATE'
        elif query_lower.startswith('delete'):
            return 'DELETE'
        elif query_lower.startswith('create'):
            return 'CREATE'
        elif query_lower.startswith('drop'):
            return 'DROP'
        elif query_lower.startswith('alter'):
            return 'ALTER'
        else:
            return 'OTHER'

    def _assess_performance(self, query: str) -> str:
        """Ocenia wydajność zapytania"""
        query_lower = query.lower()
        
        issues = []
        
        if 'select *' in query_lower:
            issues.append("Unikaj SELECT *")
        
        if 'where' not in query_lower and 'select' in query_lower:
            issues.append("Brak klauzuli WHERE")
        
        if query_lower.count('join') > 3:
            issues.append("Wiele JOINów może wpłynąć na wydajność")
        
        if 'order by' in query_lower and 'limit' not in query_lower:
            issues.append("ORDER BY bez LIMIT może być kosztowne")
        
        if not issues:
            return "Dobra"
        elif len(issues) <= 2:
            return "Średnia"
        else:
            return "Słaba"

    def _generate_optimization_suggestions(self, query: str) -> List[str]:
        """Generuje sugestie optymalizacji"""
        suggestions = []
        query_lower = query.lower()
        
        if 'select *' in query_lower:
            suggestions.append("Wybierz tylko potrzebne kolumny zamiast SELECT *")
        
        if 'where' not in query_lower and ('update' in query_lower or 'delete' in query_lower):
            suggestions.append("Dodaj klauzulę WHERE dla bezpieczeństwa")
        
        if 'order by' in query_lower and 'limit' not in query_lower:
            suggestions.append("Rozważ dodanie LIMIT do ORDER BY")
        
        if query_lower.count('join') > 2:
            suggestions.append("Sprawdź czy wszystkie JOINy są konieczne")
        
        return suggestions

    def _identify_security_issues(self, query: str) -> List[str]:
        """Identyfikuje problemy bezpieczeństwa"""
        issues = []
        query_lower = query.lower()
        
        for pattern in self.dangerous_patterns:
            if re.search(pattern, query_lower, re.IGNORECASE):
                issues.append(f"Wykryto potencjalnie niebezpieczny pattern: {pattern}")
        
        if 'delete' in query_lower and 'where' not in query_lower:
            issues.append("DELETE bez WHERE - usuwa wszystkie rekordy!")
        
        if 'update' in query_lower and 'where' not in query_lower:
            issues.append("UPDATE bez WHERE - modyfikuje wszystkie rekordy!")
        
        return issues

    def _calculate_confidence(self, is_valid: bool, is_safe: bool, query: str) -> float:
        """Oblicza pewność analizy"""
        confidence = 0.5
        
        if is_valid:
            confidence += 0.3
        
        if is_safe:
            confidence += 0.2
        
        # Długość zapytania
        if 10 < len(query) < 1000:
            confidence += 0.1
        
        return min(confidence, 1.0)

    def _detect_language(self, code: str) -> str:
        """Wykrywa język programowania"""
        code_lower = code.lower()
        
        if 'def ' in code_lower or 'import ' in code_lower:
            return 'Python'
        elif 'function' in code_lower or 'var ' in code_lower or 'const ' in code_lower:
            return 'JavaScript'
        elif 'select ' in code_lower or 'from ' in code_lower:
            return 'SQL'
        elif 'public class' in code_lower or 'public static void' in code_lower:
            return 'Java'
        elif '#include' in code_lower or 'int main' in code_lower:
            return 'C/C++'
        else:
            return 'Unknown'

    def _calculate_code_complexity(self, code: str) -> float:
        """Oblicza złożoność kodu"""
        lines = code.split('\n')
        non_empty_lines = [line for line in lines if line.strip()]
        
        complexity = len(non_empty_lines) * 0.1
        
        # Dodaj punkty za struktury kontrolne
        complexity += code.lower().count('if ') * 0.5
        complexity += code.lower().count('for ') * 0.5
        complexity += code.lower().count('while ') * 0.5
        complexity += code.lower().count('try:') * 0.3
        
        return min(complexity, 10.0)

    def _identify_code_issues(self, code: str, language: str) -> List[str]:
        """Identyfikuje problemy w kodzie"""
        issues = []
        
        if len(code.split('\n')) > 100:
            issues.append("Funkcja/metoda bardzo długa - rozważ podział")
        
        if language == 'Python':
            if 'eval(' in code:
                issues.append("Użycie eval() może być niebezpieczne")
            if 'exec(' in code:
                issues.append("Użycie exec() może być niebezpieczne")
        
        return issues

    def _generate_code_suggestions(self, code: str, language: str) -> List[str]:
        """Generuje sugestie poprawy kodu"""
        suggestions = []
        
        if language == 'Python':
            if not code.strip().startswith('"""') and not code.strip().startswith("'''"):
                suggestions.append("Dodaj docstring do dokumentacji")
        
        if len(code.split('\n')) > 50:
            suggestions.append("Rozważ podział na mniejsze funkcje")
        
        return suggestions

    def _check_code_security(self, code: str, language: str) -> List[str]:
        """Sprawdza bezpieczeństwo kodu"""
        warnings = []
        
        dangerous_functions = ['eval', 'exec', 'system', 'shell_exec']
        for func in dangerous_functions:
            if func in code:
                warnings.append(f"Niebezpieczna funkcja: {func}")
        
        return warnings

    def _assess_maintainability(self, code: str) -> float:
        """Ocenia łatwość utrzymania kodu"""
        score = 1.0
        
        lines = code.split('\n')
        if len(lines) > 100:
            score -= 0.2
        
        # Komentarze
        comment_lines = [line for line in lines if line.strip().startswith('#') or line.strip().startswith('//')]
        if len(comment_lines) / len(lines) < 0.1:
            score -= 0.1
        
        return max(score, 0.0)

    def _analyze_performance_issues(self, code: str, language: str) -> List[str]:
        """Analizuje problemy wydajnościowe"""
        issues = []
        
        if language == 'Python':
            if 'for ' in code and 'append(' in code:
                issues.append("Rozważ użycie list comprehension zamiast pętli z append")
        
        if language == 'SQL':
            if 'select *' in code.lower():
                issues.append("Unikaj SELECT * - wybierz tylko potrzebne kolumny")
        
        return issues

    def _format_schema_for_prompt(self, schema: Dict[str, Any]) -> str:
        """Formatuje schemat dla prompt'u"""
        formatted = []
        for table_name, table_info in schema.items():
            formatted.append(f"\nTabela: {table_name}")
            for col in table_info['columns']:
                pk_marker = " (PK)" if col['primary_key'] else ""
                nn_marker = " NOT NULL" if col['not_null'] else ""
                formatted.append(f"  - {col['name']}: {col['type']}{pk_marker}{nn_marker}")
        
        return "\n".join(formatted)
