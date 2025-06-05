/**
 * =================================================================================
 * ZAAWANSOWANY ASYSTENT AI - JAVASCRIPT
 * Implementacja promptu systemowego i zaawansowanych funkcjonalności czatu
 * =================================================================================
 */

class AdvancedAIAssistant {
    constructor() {
        this.settings = {
            detailLevel: 'intermediate',
            communicationStyle: 'professional',
            specializations: ['financial', 'analytics', 'integration'],
            autoSearch: true,
            useCitations: true,
            structuredResponses: true,
            codeExamples: false,
            experienceLevel: 'intermediate'
        };
        
        this.statistics = {
            interactions: 0,
            accuracyRate: 0,
            avgResponseTime: 0,
            searchQueries: 0,
            citationsUsed: 0
        };
        
        this.chatHistory = [];
        this.isTyping = false;
        this.isSearching = false;
        this.currentTheme = 'light';
        
        this.init();
    }

    /**
     * Inicjalizacja aplikacji
     */
    init() {
        this.loadSettings();
        this.loadStatistics();
        this.setupEventListeners();
        this.setupUI();
        this.initializeWelcomeMessage();
        console.log('🤖 ALEX - Zaawansowany Asystent AI zainicjalizowany');
    }

    /**
     * Konfiguracja nasłuchiwaczy zdarzeń
     */
    setupEventListeners() {
        // Panel ustawień
        const settingsBtn = document.getElementById('assistant-settings-btn');
        const closeSettings = document.getElementById('close-settings');
        const settingsPanel = document.getElementById('assistant-settings-panel');
        const saveSettings = document.getElementById('save-assistant-settings');

        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => this.toggleSettingsPanel());
        }
        
        if (closeSettings) {
            closeSettings.addEventListener('click', () => this.closeSettingsPanel());
        }
        
        if (saveSettings) {
            saveSettings.addEventListener('click', () => this.saveSettings());
        }

        // Kontrolki nagłówka
        const clearChatBtn = document.getElementById('clear-chat-btn');
        const exportChatBtn = document.getElementById('export-chat-btn');

        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => this.clearChat());
        }
        
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => this.exportChat());
        }

        // Obszar wejścia
        const chatInput = document.getElementById('chat-input-advanced');
        const sendBtn = document.getElementById('send-button-advanced');
        const voiceBtn = document.getElementById('voice-input-btn');
        const attachBtn = document.getElementById('attach-file-btn');

        if (chatInput) {
            chatInput.addEventListener('input', (e) => this.handleInputChange(e));
            chatInput.addEventListener('keydown', (e) => this.handleKeyDown(e));
        }
        
        if (sendBtn) {
            sendBtn.addEventListener('click', () => this.sendMessage());
        }
        
        if (voiceBtn) {
            voiceBtn.addEventListener('click', () => this.toggleVoiceInput());
        }
        
        if (attachBtn) {
            attachBtn.addEventListener('click', () => this.attachFile());
        }

        // Szybkie akcje
        this.setupQuickActions();
        
        // Odświeżanie sugestii
        const refreshBtn = document.getElementById('refresh-suggestions');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshSuggestions());
        }

        // Motyw
        this.setupThemeToggle();
    }

    /**
     * Konfiguracja szybkich akcji
     */
    setupQuickActions() {
        const actionBtns = document.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                if (text) {
                    this.setInputText(text);
                    this.sendMessage();
                }
            });
        });
    }

    /**
     * Konfiguracja przełącznika motywu
     */
    setupThemeToggle() {
        // Dodaj przycisk motywu jeśli nie istnieje
        const headerControls = document.querySelector('.header-controls');
        if (headerControls && !document.getElementById('theme-toggle')) {
            const themeBtn = document.createElement('button');
            themeBtn.id = 'theme-toggle';
            themeBtn.className = 'control-btn';
            themeBtn.title = 'Przełącz motyw';
            themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
            themeBtn.addEventListener('click', () => this.toggleTheme());
            headerControls.appendChild(themeBtn);
        }
    }

    /**
     * Konfiguracja interfejsu użytkownika
     */
    setupUI() {
        this.updateCharacterCount();
        this.updateStatistics();
        this.loadTheme();
    }

    /**
     * Inicjalizacja wiadomości powitalnej
     */
    initializeWelcomeMessage() {
        const welcomeMessage = document.getElementById('welcome-message');
        if (welcomeMessage) {
            this.addFadeInEffect(welcomeMessage);
        }
    }

    /**
     * Obsługa zmian w polu wejściowym
     */
    handleInputChange(e) {
        const input = e.target;
        const value = input.value;
        
        this.updateCharacterCount();
        this.updateSendButton();
        this.autoResize(input);
        
        // Symulacja inteligentnych sugestii
        if (value.length > 10) {
            this.showSmartSuggestions(value);
        }
    }

    /**
     * Obsługa naciśnięć klawiszy
     */
    handleKeyDown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            this.sendMessage();
        }
    }

    /**
     * Wysłanie wiadomości
     */
    async sendMessage() {
        const input = document.getElementById('chat-input-advanced');
        const message = input.value.trim();
        
        if (!message || this.isTyping) return;
        
        // Dodaj wiadomość użytkownika
        this.addUserMessage(message);
        
        // Wyczyść pole wejściowe
        input.value = '';
        this.updateCharacterCount();
        this.updateSendButton();
        
        // Rozpocznij "myślenie" asystenta
        this.startThinking();
        
        try {
            // Symulacja analizy i wyszukiwania
            await this.processMessage(message);
            
            // Generuj odpowiedź
            const response = await this.generateResponse(message);
            
            // Dodaj odpowiedź asystenta
            this.addAssistantMessage(response);
            
        } catch (error) {
            console.error('Błąd podczas przetwarzania wiadomości:', error);
            this.addErrorMessage('Przepraszam, wystąpił błąd podczas przetwarzania Twojej wiadomości.');
        } finally {
            this.stopThinking();
            this.updateStatistics();
        }
    }

    /**
     * Przetwarzanie wiadomości zgodnie z promptem systemowym
     */
    async processMessage(message) {
        const startTime = Date.now();
        
        // 1. Analiza potrzeby wyszukiwania
        const needsSearch = this.analyzeSearchNeed(message);
        
        if (needsSearch && this.settings.autoSearch) {
            this.showSearchingIndicator();
            await this.simulateSearch(message);
        }
        
        // 2. Aktualizacja statystyk
        this.statistics.interactions++;
        const responseTime = Date.now() - startTime;
        this.updateResponseTime(responseTime);
    }

    /**
     * Analiza potrzeby wyszukiwania według promptu systemowego
     */
    analyzeSearchNeed(message) {
        const searchKeywords = [
            'najnowsze', 'aktualne', 'obecne', 'dzisiaj', '2025', 
            'ceny', 'kursy', 'prognozy', 'trendy', 'ostatnie',
            'nowe', 'świeże', 'bieżące'
        ];
        
        const noSearchKeywords = [
            'jak', 'co to', 'definicja', 'wyjaśnij', 'podstawy',
            'teoria', 'historia', 'matematyka', 'fizyka'
        ];
        
        const hasSearchKeywords = searchKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
        
        const hasNoSearchKeywords = noSearchKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
        
        return hasSearchKeywords && !hasNoSearchKeywords;
    }

    /**
     * Symulacja wyszukiwania
     */
    async simulateSearch(query) {
        this.isSearching = true;
        this.statistics.searchQueries++;
        
        // Symulacja opóźnienia wyszukiwania
        await this.delay(1000 + Math.random() * 2000);
        
        this.isSearching = false;
        this.hideSearchingIndicator();
    }

    /**
     * Generowanie odpowiedzi według promptu systemowego
     */
    async generateResponse(message) {
        // Symulacja procesu myślenia AI
        await this.delay(500 + Math.random() * 1500);
        
        const response = this.createSystematicResponse(message);
        return response;
    }

    /**
     * Tworzenie systematycznej odpowiedzi zgodnie z promptem
     */
    createSystematicResponse(message) {
        const isERP = this.isERPRelated(message);
        const detailLevel = this.settings.detailLevel;
        const style = this.settings.communicationStyle;
        
        let response = {
            content: '',
            citations: [],
            hasCode: false,
            hasTable: false
        };

        if (isERP) {
            response = this.generateERPResponse(message, detailLevel, style);
        } else {
            response = this.generateGeneralResponse(message, detailLevel, style);
        }

        return this.formatResponse(response);
    }

    /**
     * Sprawdzenie czy pytanie dotyczy ERP
     */
    isERPRelated(message) {
        const erpKeywords = [
            'erp', 'comarch', 'sap', 'oracle', 'finansowy', 'księgowy',
            'magazyn', 'zapasy', 'crm', 'hr', 'płace', 'produkcja',
            'moduł', 'integracja', 'wdrożenie', 'implementacja'
        ];
        
        return erpKeywords.some(keyword => 
            message.toLowerCase().includes(keyword)
        );
    }

    /**
     * Generowanie odpowiedzi dotyczącej ERP
     */
    generateERPResponse(message, detailLevel, style) {
        const responses = {
            basic: {
                'konfiguracja finansów': `Konfiguracja modułu finansowego w Comarch ERP XL obejmuje:

**Podstawowe kroki:**
1. **Ustawienia firmy** - definicja danych podstawowych
2. **Plan kont** - wybór odpowiedniego planu księgowego  
3. **Parametry księgowe** - waluta, rok obrachunkowy, VAT
4. **Środki trwałe** - konfiguracja amortyzacji
5. **Bankowość** - połączenie z kontami bankowymi

Proces zazwyczaj trwa 2-3 dni robocze dla standardowej konfiguracji.`,

                'plan wdrożenia': `Plan wdrożenia systemu ERP składa się z kluczowych etapów:

**Fazy wdrożenia:**
1. **Analiza wymagań** (2-4 tygodnie)
2. **Projektowanie rozwiązania** (3-6 tygodni)  
3. **Konfiguracja systemu** (4-8 tygodni)
4. **Testy i szkolenia** (2-4 tygodnie)
5. **Go-live i wsparcie** (1-2 tygodnie)

Całkowity czas wdrożenia: **3-6 miesięcy** w zależności od złożoności.`
            },
            
            intermediate: {
                'konfiguracja finansów': `Konfiguracja modułu finansowego w Comarch ERP XL to kompleksowy proces wymagający systematycznego podejścia:

## Przygotowanie wstępne
**Analiza wymagań biznesowych:**
- Mapowanie istniejących procesów księgowych
- Identyfikacja specyficznych potrzeb branżowych
- Określenie wymagań raportowych i analitycznych

## Główne obszary konfiguracji

### 1. Struktura organizacyjna
- Definicja jednostek organizacyjnych
- Konfiguracja centrów kosztów i zysków
- Ustawienie hierarchii zarządzania

### 2. Plan kont księgowych
\`\`\`
Standardowe konta główne:
100-199: Aktywa trwałe
200-299: Zapasy i rozrachunki
300-399: Środki pieniężne
400-499: Kapitały własne  
500-599: Przychody
600-799: Koszty działalności
\`\`\`

### 3. Parametry księgowe
- **Waluta podstawowa:** PLN (z obsługą walut obcych)
- **Rok obrachunkowy:** kalendarzowy/niestandardowy
- **Zasady VAT:** stawki, rejestry, JPK_VAT
- **Amortyzacja:** metody liniowa/degresywna

### 4. Integracje
- Bankowość elektroniczna (MT940, SWIFT)
- Systemy płatnicze (PayU, Przelewy24)
- Urzędy (e-Deklaracje, JPK)

## Najlepsze praktyki
- Backup konfiguracji przed wprowadzeniem zmian
- Testowanie na środowisku testowym
- Dokumentacja wszystkich customizacji
- Szkolenie użytkowników końcowych

**Czas realizacji:** 4-6 tygodni dla pełnej konfiguracji z testami.

${this.addCitation('Dokumentacja Comarch ERP XL 2025', 'https://comarch.pl/erp')}`
            },
            
            expert: {
                'konfiguracja finansów': `Zaawansowana konfiguracja modułu finansowego w Comarch ERP XL wymaga głębokiej znajomości architektury systemu i najlepszych praktyk implementacyjnych:

## Architektura techniczna

### Warstwa danych
\`\`\`sql
-- Przykład struktury tabeli kont głównych
CREATE TABLE CDN.Accounts (
    Acc_GIDNumber INT PRIMARY KEY,
    Acc_Code NVARCHAR(20) NOT NULL,
    Acc_Name NVARCHAR(255),
    Acc_Type TINYINT, -- 1:Bilansowe, 2:WiR
    Acc_Category TINYINT, -- Kategoria konta
    Acc_IsAnalytic BIT DEFAULT 0
);
\`\`\`

### API Configuration
\`\`\`csharp
// Konfiguracja poprzez CDN API
using CDNBase;
using CDNConst;

public class FinanceConfiguration 
{
    private CDNBase.Application _app;
    
    public void ConfigureChart() 
    {
        var accounts = _app.CreateConnection()
            .Execute("SELECT * FROM CDN.Accounts");
        // Logika konfiguracji...
    }
}
\`\`\`

## Zaawansowane scenariusze

### 1. Multi-company setup
- **Holding structure:** konsolidacja między spółkami
- **Eliminacje:** automatyczne wyłączenia transakcji wewnętrznych  
- **Raportowanie skonsolidowane:** zgodnie z MSSF

### 2. Automatyzacja procesów
\`\`\`javascript
// Automatyczne księgowania przez workflow
const autoBookingRules = {
    purchaseInvoice: {
        trigger: 'OnApproval',
        accounts: {
            debit: '540-{CostCenter}',  
            credit: '201-{Supplier}'
        },
        validations: ['BudgetCheck', 'ApprovalMatrix']
    }
};
\`\`\`

### 3. Compliance i governance
- **SOX compliance:** segregacja obowiązków, audit trail
- **GDPR:** anonimizacja danych finansowych
- **Lokalne regulacje:** specyfika polska (KSeF, JPK_VAT3)

## Performance optimization

### Indexowanie
\`\`\`sql
-- Optymalizacja dla raportów finansowych
CREATE INDEX IX_Accounts_CategoryType 
ON CDN.Accounts (Acc_Category, Acc_Type)
INCLUDE (Acc_Code, Acc_Name);
\`\`\`

### Archiwizacja danych
- **Partycjonowanie tabel:** według okresów księgowych
- **Kompresja:** dane historyczne > 5 lat
- **Backup strategy:** pełny + incrementalny

## Monitoring i alerting

| Metryka | Próg alarmowy | Akcja |
|---------|---------------|-------|
| Czas księgowania | > 30s | Optymalizacja SQL |
| Błędy integracji | > 5% | Restart service |
| Wykorzystanie CPU | > 80% | Scale-up |

## Disaster recovery
1. **RTO:** 4 godziny (Recovery Time Objective)
2. **RPO:** 15 minut (Recovery Point Objective)  
3. **Failover:** automatyczny na DC backup
4. **Testy:** miesięczne symulacje awarii

**Szacowany effort:** 120-200 godzin dla enterprise setup z pełną customizacją.

${this.addCitation('Comarch ERP XL Technical Documentation v20250', 'internal')}`
            }
        };

        const responseKey = this.findBestMatch(message, Object.keys(responses[detailLevel]));
        return {
            content: responses[detailLevel][responseKey] || responses[detailLevel]['plan wdrożenia'],
            citations: this.settings.useCitations ? [`Źródło: Dokumentacja techniczna Comarch ERP XL`] : [],
            hasCode: detailLevel === 'expert',
            hasTable: detailLevel === 'expert'
        };
    }

    /**
     * Generowanie ogólnej odpowiedzi
     */
    generateGeneralResponse(message, detailLevel, style) {
        const templates = {
            basic: `Na podstawie Twojego pytania mogę powiedzieć, że to zagadnienie wymaga uwzględnienia kilku kluczowych aspektów. 

W kontekście Wrocławia i regionu Dolnego Śląska, lokalny rynek technologiczny rozwija się bardzo dynamicznie.`,

            intermediate: `Analizując Twoje pytanie w kontekście najnowszych trendów i praktyk branżowych:

**Kluczowe aspekty:**
- Analiza aktualnej sytuacji rynkowej
- Uwzględnienie specyfiki lokalnej (Wrocław, Dolny Śląsk)
- Zastosowanie sprawdzonych metodologii

**Rekomendacje:**
1. Przeprowadzenie wstępnej analizy
2. Zdefiniowanie jasnych celów
3. Implementacja etapowa z monitoringiem

Czy potrzebujesz bardziej szczegółowych informacji w którymś z tych obszarów?`,

            expert: `Kompleksowa analiza problematyki wymaga systematycznego podejścia z wykorzystaniem aktualnych danych i sprawdzonych metodik:

## Analiza kontekstowa
- **Środowisko lokalne:** Wrocław jako hub technologiczny
- **Trendy branżowe:** najnowsze rozwiązania i standardy
- **Compliance:** aktualne wymogi regulacyjne

## Metodologia rozwiązania
\`\`\`
1. Assessment → 2. Planning → 3. Implementation → 4. Validation
\`\`\`

## Rozważania techniczne
- Architektura rozwiązania
- Integracje z istniejącymi systemami  
- Skalowalność i wydajność
- Bezpieczeństwo i compliance

**Następne kroki:** Czy chciałbyś abym zagłębił się w konkretny aspekt tej problematyki?`
        };

        return {
            content: templates[detailLevel],
            citations: [],
            hasCode: false,
            hasTable: false
        };
    }

    /**
     * Formatowanie odpowiedzi
     */
    formatResponse(response) {
        let formattedContent = response.content;
        
        // Dodaj cytowania jeśli są dostępne
        if (response.citations && response.citations.length > 0 && this.settings.useCitations) {
            formattedContent += '\n\n**Źródła:**\n';
            response.citations.forEach((citation, index) => {
                formattedContent += `[${index + 1}] ${citation}\n`;
            });
            this.statistics.citationsUsed += response.citations.length;
        }
        
        return formattedContent;
    }

    /**
     * Znajdowanie najlepszego dopasowania
     */
    findBestMatch(message, keys) {
        const messageLower = message.toLowerCase();
        
        for (const key of keys) {
            if (messageLower.includes(key) || key.includes(messageLower.split(' ')[0])) {
                return key;
            }
        }
        
        return keys[0]; // Domyślny klucz
    }

    /**
     * Dodawanie cytowania
     */
    addCitation(title, url) {
        if (!this.settings.useCitations) return '';
        
        return `\n\n<div class="citation">
            "${title}"
            <div class="citation-source">Źródło: ${url}</div>
        </div>`;
    }

    /**
     * Dodawanie wiadomości użytkownika
     */
    addUserMessage(message) {
        const messageData = {
            type: 'user',
            content: message,
            timestamp: new Date(),
            id: this.generateMessageId()
        };
        
        this.chatHistory.push(messageData);
        this.renderMessage(messageData);
        this.scrollToBottom();
    }

    /**
     * Dodawanie wiadomości asystenta
     */
    addAssistantMessage(content) {
        const messageData = {
            type: 'assistant',
            content: content,
            timestamp: new Date(),
            id: this.generateMessageId()
        };
        
        this.chatHistory.push(messageData);
        this.renderMessage(messageData);
        this.scrollToBottom();
    }

    /**
     * Dodawanie wiadomości błędu
     */
    addErrorMessage(message) {
        const messageData = {
            type: 'error',
            content: `❌ **Błąd:** ${message}`,
            timestamp: new Date(),
            id: this.generateMessageId()
        };
        
        this.chatHistory.push(messageData);
        this.renderMessage(messageData);
        this.scrollToBottom();
    }

    /**
     * Renderowanie wiadomości
     */
    renderMessage(messageData) {
        const messagesContainer = document.getElementById('chat-messages-advanced');
        if (!messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${messageData.type}`;
        messageElement.setAttribute('data-message-id', messageData.id);

        const avatar = this.createAvatar(messageData.type);
        const bubble = this.createMessageBubble(messageData);
        
        if (messageData.type === 'user') {
            messageElement.appendChild(bubble);
            messageElement.appendChild(avatar);
        } else {
            messageElement.appendChild(avatar);
            messageElement.appendChild(bubble);
        }

        messagesContainer.appendChild(messageElement);
        
        // Dodaj animację
        this.addFadeInEffect(messageElement);
    }

    /**
     * Tworzenie awatara
     */
    createAvatar(type) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        if (type === 'user') {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
        } else if (type === 'assistant') {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
        } else {
            avatar.innerHTML = '<i class="fas fa-exclamation-triangle"></i>';
        }
        
        return avatar;
    }

    /**
     * Tworzenie bąbelka wiadomości
     */
    createMessageBubble(messageData) {
        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        
        // Konwertuj markdown na HTML
        const htmlContent = this.parseMarkdown(messageData.content);
        bubble.innerHTML = htmlContent;
        
        // Dodaj metadane
        const meta = this.createMessageMeta(messageData);
        bubble.appendChild(meta);
        
        return bubble;
    }

    /**
     * Parsowanie Markdown
     */
    parseMarkdown(text) {
        let html = text;
        
        // Nagłówki
        html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        
        // Pogrubienie
        html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        // Kursywa
        html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
        
        // Kod inline
        html = html.replace(/`(.*?)`/g, '<code>$1</code>');
        
        // Bloki kodu
        html = html.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            return `<div class="code-block">
                <div class="code-header">
                    <span>${lang || 'kod'}</span>
                    <button class="copy-code-btn" onclick="navigator.clipboard.writeText(\`${code.trim()}\`)">
                        Kopiuj
                    </button>
                </div>
                <pre><code>${this.escapeHtml(code.trim())}</code></pre>
            </div>`;
        });
        
        // Cytowania
        html = html.replace(/<div class="citation">([\s\S]*?)<\/div>/g, (match, content) => {
            return `<div class="citation">${content}</div>`;
        });
        
        // Listy
        html = html.replace(/^\d+\.\s(.*)$/gm, '<li>$1</li>');
        html = html.replace(/^-\s(.*)$/gm, '<li>$1</li>');
        
        // Tabele (podstawowe)
        html = this.parseMarkdownTables(html);
        
        // Nowe linie
        html = html.replace(/\n/g, '<br>');
        
        // Napraw listy
        html = html.replace(/(<li>.*<\/li>)/g, (match) => {
            return `<ul>${match}</ul>`;
        });
        
        return html;
    }

    /**
     * Parsowanie tabel Markdown
     */
    parseMarkdownTables(html) {
        const tableRegex = /\|(.+?)\|\n\|[-:| ]+\|\n((?:\|.+?\|\n?)*)/g;
        
        return html.replace(tableRegex, (match, headerRow, bodyRows) => {
            const headers = headerRow.split('|').map(h => h.trim()).filter(h => h);
            const rows = bodyRows.trim().split('\n').map(row => 
                row.split('|').map(cell => cell.trim()).filter(cell => cell)
            );
            
            let tableHtml = '<table class="message-table"><thead><tr>';
            headers.forEach(header => {
                tableHtml += `<th>${header}</th>`;
            });
            tableHtml += '</tr></thead><tbody>';
            
            rows.forEach(row => {
                tableHtml += '<tr>';
                row.forEach(cell => {
                    tableHtml += `<td>${cell}</td>`;
                });
                tableHtml += '</tr>';
            });
            
            tableHtml += '</tbody></table>';
            return tableHtml;
        });
    }

    /**
     * Escape HTML
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Tworzenie metadanych wiadomości
     */
    createMessageMeta(messageData) {
        const meta = document.createElement('div');
        meta.className = 'message-meta';
        
        const time = document.createElement('span');
        time.className = 'message-time';
        time.textContent = this.formatTime(messageData.timestamp);
        
        const actions = document.createElement('div');
        actions.className = 'message-actions';
        
        // Przycisk kopiowania
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-action-btn';
        copyBtn.title = 'Kopiuj wiadomość';
        copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
        copyBtn.addEventListener('click', () => this.copyMessage(messageData.content));
        
        actions.appendChild(copyBtn);
        
        meta.appendChild(time);
        meta.appendChild(actions);
        
        return meta;
    }

    /**
     * Formatowanie czasu
     */
    formatTime(date) {
        return date.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }

    /**
     * Generowanie ID wiadomości
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Pokazywanie wskaźnika myślenia
     */
    startThinking() {
        this.isTyping = true;
        this.showTypingIndicator();
    }

    /**
     * Ukrywanie wskaźnika myślenia
     */
    stopThinking() {
        this.isTyping = false;
        this.hideTypingIndicator();
    }

    /**
     * Pokazywanie wskaźnika pisania
     */
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages-advanced');
        if (!messagesContainer) return;

        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.id = 'typing-indicator';

        typingIndicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-bubble">
                <span>ALEX pisze</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingIndicator);
        this.scrollToBottom();
    }

    /**
     * Ukrywanie wskaźnika pisania
     */
    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    /**
     * Pokazywanie wskaźnika wyszukiwania
     */
    showSearchingIndicator() {
        const indicator = document.getElementById('search-status');
        if (indicator) {
            indicator.innerHTML = `
                <div class="search-spinner"></div>
                Smart Search: Searching...
            `;
        }
    }

    /**
     * Ukrywanie wskaźnika wyszukiwania
     */
    hideSearchingIndicator() {
        const indicator = document.getElementById('search-status');
        if (indicator) {
            indicator.innerHTML = `
                <i class="fas fa-search"></i>
                Smart Search: ON
            `;
        }
    }

    /**
     * Aktualizacja licznika znaków
     */
    updateCharacterCount() {
        const input = document.getElementById('chat-input-advanced');
        const counter = document.getElementById('char-count-advanced');
        
        if (input && counter) {
            const count = input.value.length;
            const maxLength = input.getAttribute('maxlength') || 4000;
            counter.textContent = `${count}/${maxLength}`;
            
            if (count > maxLength * 0.9) {
                counter.style.color = 'var(--warning-color)';
            } else if (count > maxLength * 0.8) {
                counter.style.color = 'var(--error-color)';
            } else {
                counter.style.color = 'var(--text-muted)';
            }
        }
    }

    /**
     * Aktualizacja przycisku wysyłania
     */
    updateSendButton() {
        const input = document.getElementById('chat-input-advanced');
        const sendBtn = document.getElementById('send-button-advanced');
        
        if (input && sendBtn) {
            const hasContent = input.value.trim().length > 0;
            sendBtn.disabled = !hasContent || this.isTyping;
        }
    }

    /**
     * Auto-resize textarea
     */
    autoResize(textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 200);
        textarea.style.height = newHeight + 'px';
    }

    /**
     * Ustawienie tekstu w polu wejściowym
     */
    setInputText(text) {
        const input = document.getElementById('chat-input-advanced');
        if (input) {
            input.value = text;
            this.updateCharacterCount();
            this.updateSendButton();
            this.autoResize(input);
            input.focus();
        }
    }

    /**
     * Przewijanie do dołu
     */
    scrollToBottom() {
        const container = document.getElementById('chat-messages-advanced');
        if (container) {
            setTimeout(() => {
                container.scrollTop = container.scrollHeight;
            }, 100);
        }
    }

    /**
     * Dodawanie efektu fade-in
     */
    addFadeInEffect(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }

    /**
     * Przełączanie panelu ustawień
     */
    toggleSettingsPanel() {
        const panel = document.getElementById('assistant-settings-panel');
        if (panel) {
            panel.classList.toggle('open');
        }
    }

    /**
     * Zamykanie panelu ustawień
     */
    closeSettingsPanel() {
        const panel = document.getElementById('assistant-settings-panel');
        if (panel) {
            panel.classList.remove('open');
        }
    }

    /**
     * Zapisywanie ustawień
     */
    saveSettings() {
        // Pobierz wartości z formularza
        const detailLevel = document.getElementById('detail-level')?.value || 'intermediate';
        const communicationStyle = document.getElementById('communication-style')?.value || 'professional';
        const experienceLevel = document.getElementById('experience-level')?.value || 'intermediate';
        const autoSearch = document.getElementById('auto-search')?.checked || true;
        const useCitations = document.getElementById('use-citations')?.checked || true;
        const structuredResponses = document.getElementById('structured-responses')?.checked || true;
        const codeExamples = document.getElementById('code-examples')?.checked || false;

        // Pobierz zaznaczone specjalizacje
        const specializationInputs = document.querySelectorAll('.checkbox-group input[type="checkbox"]:checked');
        const specializations = Array.from(specializationInputs).map(input => input.value);

        // Aktualizuj ustawienia
        this.settings = {
            detailLevel,
            communicationStyle,
            specializations,
            autoSearch,
            useCitations,
            structuredResponses,
            codeExamples,
            experienceLevel
        };

        // Zapisz do localStorage
        localStorage.setItem('assistantSettings', JSON.stringify(this.settings));

        // Pokaż potwierdzenie
        this.showNotification('Ustawienia zostały zapisane pomyślnie!', 'success');
        
        // Zamknij panel
        this.closeSettingsPanel();

        console.log('Ustawienia zapisane:', this.settings);
    }

    /**
     * Ładowanie ustawień
     */
    loadSettings() {
        const saved = localStorage.getItem('assistantSettings');
        if (saved) {
            try {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
                this.applySettingsToUI();
            } catch (e) {
                console.error('Błąd podczas ładowania ustawień:', e);
            }
        }
    }

    /**
     * Aplikowanie ustawień do UI
     */
    applySettingsToUI() {
        // Zastosuj ustawienia do elementów UI
        const elements = {
            'detail-level': this.settings.detailLevel,
            'communication-style': this.settings.communicationStyle,
            'experience-level': this.settings.experienceLevel,
            'auto-search': this.settings.autoSearch,
            'use-citations': this.settings.useCitations,
            'structured-responses': this.settings.structuredResponses,
            'code-examples': this.settings.codeExamples
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = value;
                } else {
                    element.value = value;
                }
            }
        });

        // Zastosuj specjalizacje
        const checkboxes = document.querySelectorAll('.checkbox-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.settings.specializations.includes(checkbox.value);
        });
    }

    /**
     * Aktualizacja statystyk
     */
    updateStatistics() {
        const elements = {
            'interactions-count': this.statistics.interactions,
            'accuracy-rate': this.statistics.accuracyRate > 0 ? `${this.statistics.accuracyRate}%` : '--',
            'avg-response-time': this.statistics.avgResponseTime > 0 ? `${this.statistics.avgResponseTime}s` : '--'
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = value;
            }
        });

        // Zapisz statystyki
        localStorage.setItem('assistantStatistics', JSON.stringify(this.statistics));
    }

    /**
     * Ładowanie statystyk
     */
    loadStatistics() {
        const saved = localStorage.getItem('assistantStatistics');
        if (saved) {
            try {
                this.statistics = { ...this.statistics, ...JSON.parse(saved) };
            } catch (e) {
                console.error('Błąd podczas ładowania statystyk:', e);
            }
        }
    }

    /**
     * Aktualizacja czasu odpowiedzi
     */
    updateResponseTime(responseTime) {
        const timeInSeconds = responseTime / 1000;
        
        if (this.statistics.avgResponseTime === 0) {
            this.statistics.avgResponseTime = timeInSeconds;
        } else {
            this.statistics.avgResponseTime = 
                (this.statistics.avgResponseTime + timeInSeconds) / 2;
        }
        
        this.statistics.avgResponseTime = 
            Math.round(this.statistics.avgResponseTime * 10) / 10;
    }

    /**
     * Czyszczenie czatu
     */
    clearChat() {
        if (confirm('Czy na pewno chcesz wyczyścić historię czatu?')) {
            this.chatHistory = [];
            const messagesContainer = document.getElementById('chat-messages-advanced');
            if (messagesContainer) {
                // Usuń wszystkie wiadomości oprócz wiadomości powitalnej
                const messages = messagesContainer.querySelectorAll('.message');
                messages.forEach(message => message.remove());
                
                // Usuń wskaźnik pisania jeśli istnieje
                const typingIndicator = document.getElementById('typing-indicator');
                if (typingIndicator) {
                    typingIndicator.remove();
                }
            }
            
            this.showNotification('Historia czatu została wyczyszczona', 'info');
        }
    }

    /**
     * Eksport czatu
     */
    exportChat() {
        if (this.chatHistory.length === 0) {
            this.showNotification('Brak wiadomości do eksportu', 'warning');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            assistant: 'ALEX - Asystent AI',
            organization: 'WPiA UWr',
            settings: this.settings,
            statistics: this.statistics,
            messages: this.chatHistory
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `alex-chat-export-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Czat został wyeksportowany', 'success');
    }

    /**
     * Kopiowanie wiadomości
     */
    copyMessage(content) {
        // Usuń markdown przed kopiowaniem
        const plainText = content.replace(/\*\*(.*?)\*\*/g, '$1')
                                .replace(/\*(.*?)\*/g, '$1')
                                .replace(/`(.*?)`/g, '$1')
                                .replace(/#{1,6}\s(.*)/g, '$1')
                                .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');

        navigator.clipboard.writeText(plainText).then(() => {
            this.showNotification('Wiadomość skopiowana do schowka', 'success');
        }).catch(() => {
            this.showNotification('Nie udało się skopiować wiadomości', 'error');
        });
    }

    /**
     * Przełączanie motywu
     */
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('theme', this.currentTheme);
        
        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) {
            const icon = themeBtn.querySelector('i');
            if (icon) {
                icon.className = this.currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
            }
        }
    }

    /**
     * Ładowanie motywu
     */
    loadTheme() {
        const saved = localStorage.getItem('theme');
        if (saved) {
            this.currentTheme = saved;
            document.documentElement.setAttribute('data-theme', this.currentTheme);
        }
    }

    /**
     * Przełączanie wprowadzania głosowego
     */
    toggleVoiceInput() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            this.startVoiceRecognition();
        } else {
            this.showNotification('Wprowadzanie głosowe nie jest obsługiwane w tej przeglądarce', 'warning');
        }
    }

    /**
     * Rozpoczęcie rozpoznawania mowy
     */
    startVoiceRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'pl-PL';
        recognition.continuous = false;
        recognition.interimResults = false;

        const voiceBtn = document.getElementById('voice-input-btn');
        if (voiceBtn) {
            voiceBtn.style.color = 'var(--error-color)';
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.setInputText(transcript);
        };

        recognition.onerror = (event) => {
            console.error('Błąd rozpoznawania mowy:', event.error);
            this.showNotification('Błąd podczas rozpoznawania mowy', 'error');
        };

        recognition.onend = () => {
            if (voiceBtn) {
                voiceBtn.style.color = '';
            }
        };

        recognition.start();
    }

    /**
     * Załączanie pliku
     */
    attachFile() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.pdf,.doc,.docx,.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processAttachedFile(file);
            }
        };
        
        input.click();
    }

    /**
     * Przetwarzanie załączonego pliku
     */
    processAttachedFile(file) {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const content = e.target.result;
            const message = `📎 Załączono plik: ${file.name}\n\nTreść pliku:\n${content.substring(0, 1000)}${content.length > 1000 ? '...' : ''}`;
            this.setInputText(message);
        };
        
        reader.onerror = () => {
            this.showNotification('Błąd podczas odczytywania pliku', 'error');
        };
        
        reader.readAsText(file);
    }

    /**
     * Odświeżanie sugestii
     */
    refreshSuggestions() {
        const suggestions = [
            "Jak zoptymalizować wydajność systemu ERP?",
            "Najlepsze praktyki w zarządzaniu danymi finansowymi",
            "Automatyzacja procesów księgowych w Comarch ERP XL",
            "Integracja systemu ERP z AI i machine learning",
            "Bezpieczeństwo danych w systemach enterprise",
            "Planowanie migracji do nowej wersji ERP"
        ];

        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.innerHTML = '';
            
            const randomSuggestions = suggestions
                .sort(() => 0.5 - Math.random())
                .slice(0, 6);

            randomSuggestions.forEach(suggestion => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.setAttribute('data-text', suggestion);
                btn.innerHTML = `
                    <i class="fas fa-lightbulb"></i>
                    <span>${suggestion}</span>
                `;
                btn.addEventListener('click', () => {
                    this.setInputText(suggestion);
                    this.sendMessage();
                });
                actionButtons.appendChild(btn);
            });
        }
    }

    /**
     * Pokazywanie inteligentnych sugestii
     */
    showSmartSuggestions(input) {
        // Symulacja inteligentnych sugestii na podstawie wprowadzonego tekstu
        const keywords = input.toLowerCase();
        let suggestions = [];

        if (keywords.includes('erp')) {
            suggestions = ['implementacja', 'konfiguracja', 'integracja'];
        } else if (keywords.includes('finans')) {
            suggestions = ['księgowość', 'raportowanie', 'budżetowanie'];
        } else if (keywords.includes('projekt')) {
            suggestions = ['zarządzanie', 'planowanie', 'realizacja'];
        }

        // Tutaj można dodać UI dla sugestii
        console.log('Sugestie:', suggestions);
    }

    /**
     * Pokazywanie powiadomień
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animacja pojawiania się
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Automatyczne usunięcie
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Pobieranie ikony powiadomienia
     */
    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    /**
     * Utility - opóźnienie
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Inicjalizacja aplikacji po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    window.assistantApp = new AdvancedAIAssistant();
});

// Style dla powiadomień (dodaj do CSS)
const notificationStyles = `
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 20px;
    border-radius: 8px;
    color: white;
    font-size: 14px;
    font-weight: 500;
    z-index: 10000;
    transform: translateX(400px);
    transition: transform 0.3s ease;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.notification.show {
    transform: translateX(0);
}

.notification-success { background: #10b981; }
.notification-error { background: #ef4444; }
.notification-warning { background: #f59e0b; }
.notification-info { background: #3b82f6; }

.notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
}
`;

// Dodaj style do head
const styleSheet = document.createElement('style');
styleSheet.textContent = notificationStyles;
document.head.appendChild(styleSheet);
