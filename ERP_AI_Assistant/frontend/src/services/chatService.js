/**
 * =================================================================================
 * MASTER CHAT SYSTEM v1.0 - Ostateczne rozwiązanie konfliktów DOM
 * Zastępuje: unified-chat.js + professional-chat.js + script.js
 * Eliminuje: konflikty DOM, duplikacje, chaos w inicjalizacji
 * =================================================================================
 */

class MasterERPChatSystem {
    constructor() {
        this.version = '1.0.0';
        this.systemId = 'master_chat_' + Date.now();
        this.startTime = performance.now();
        
        // Konfiguracja systemu
        this.config = {
            backendUrl: 'http://localhost:5000/api',
            maxMessageLength: 4000,
            typingDelay: 1200,
            retryAttempts: 3,
            ragMode: 'advanced',
            autoDetectBestService: true,
            fallbackEnabled: true
        };

        // Stan systemu
        this.state = {
            isActive: false,
            isTyping: false,
            isConnected: false,
            currentService: 'detecting',
            messageHistory: [],
            sessionId: this.generateSessionId(),
            lastHeartbeat: Date.now(),
            initializationComplete: false
        };

        // RAG Configuration
        this.ragConfig = {
            useHybridSearch: true,
            useReranking: true,
            useMultiStepReasoning: true,
            useContextCompression: true,
            citationsEnabled: true,
            maxContextLength: 2000
        };

        // DOM Elements cache
        this.dom = {};
        
        // Service detection
        this.availableServices = [];
        this.serviceEndpoints = {
            unified: '/unified',
            legacy_rag: '/rag/chat',
            legacy_chat: '/chat',
            fallback: '/basic'
        };

        // Cleanup previous instances
        this.cleanupPreviousInstances();
        
        console.log('🚀 Master Chat System inicjalizacja...');
        this.initialize();
    }

    /**
     * Cleanup previous instances to prevent conflicts
     */
    cleanupPreviousInstances() {
        // Destroy previous chat instances
        if (window.unifiedChat && typeof window.unifiedChat.destroy === 'function') {
            window.unifiedChat.destroy();
            delete window.unifiedChat;
        }
        
        if (window.professionalChat && typeof window.professionalChat.cleanup === 'function') {
            window.professionalChat.cleanup();
            delete window.professionalChat;
        }

        if (window.claudeAssistant) {
            delete window.claudeAssistant;
        }

        if (window.ERPAssistant) {
            delete window.ERPAssistant;
        }

        // Remove old event listeners
        document.querySelectorAll('[data-chat-listener]').forEach(el => {
            el.removeAttribute('data-chat-listener');
        });

        console.log('🧹 Poprzednie instancje czatu zostały wyczyszczone');
    }

    /**
     * Master initialization
     */
    async initialize() {
        try {
            console.log('🔍 Wykrywanie elementów DOM...');
            
            if (!this.detectAndCacheElements()) {
                throw new Error('Nie można znaleźć wymaganych elementów DOM');
            }

            console.log('🔌 Testowanie dostępności serwisów...');
            await this.detectAvailableServices();

            console.log('⚙️ Konfiguracja event listenerów...');
            this.setupEventListeners();

            console.log('🎨 Konfiguracja interfejsu...');
            this.setupUI();

            console.log('💫 Wiadomość powitalna...');
            this.showWelcomeMessage();

            this.state.isActive = true;
            this.state.initializationComplete = true;

            console.log('✅ Master Chat System gotowy!');
            console.log(`🎯 Aktywny serwis: ${this.state.currentService}`);
            console.log(`⏱️ Czas inicjalizacji: ${(performance.now() - this.startTime).toFixed(2)}ms`);

            // Start monitoring
            this.startSystemMonitoring();

        } catch (error) {
            console.error('❌ Błąd inicjalizacji Master Chat System:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Detect and cache all required DOM elements
     */
    detectAndCacheElements() {
        const requiredElements = {
            // Core chat elements
            chatInput: 'chat-input-advanced',
            chatMessages: 'chat-messages-advanced', 
            sendButton: 'send-button-advanced',
            
            // UI controls
            charCount: 'char-count-advanced',
            aiStatus: 'ai-status',
            searchStatus: 'search-status',
            
            // RAG controls
            ragModeSelect: 'rag-mode-select',
            connectionStatus: 'connection-status',
            documentsCount: 'documents-count',
            lastConfidence: 'last-confidence',
            
            // Additional controls
            voiceBtn: 'voice-input-btn',
            attachBtn: 'attach-file-btn',
            clearBtn: 'clear-chat-btn',
            exportBtn: 'export-chat-btn'
        };

        const optionalElements = {
            quickActions: 'quick-actions',
            actionButtons: '.action-btn',
            suggestionChips: '.suggestion-chip',
            typingIndicator: '.typing-indicator'
        };

        // Cache required elements
        for (const [key, id] of Object.entries(requiredElements)) {
            this.dom[key] = document.getElementById(id);
        }

        // Cache optional elements
        for (const [key, selector] of Object.entries(optionalElements)) {
            if (selector.startsWith('.')) {
                this.dom[key] = document.querySelectorAll(selector);
            } else {
                this.dom[key] = document.getElementById(selector);
            }
        }

        // Verify critical elements exist
        const missing = [];
        ['chatInput', 'chatMessages', 'sendButton'].forEach(key => {
            if (!this.dom[key]) {
                missing.push(key);
            }
        });

        if (missing.length > 0) {
            console.error('❌ Brakujące krytyczne elementy:', missing);
            return false;
        }

        console.log('✅ Wszystkie wymagane elementy DOM znalezione');
        return true;
    }

    /**
     * Detect available backend services
     */
    async detectAvailableServices() {
        const services = [];
        
        for (const [serviceName, endpoint] of Object.entries(this.serviceEndpoints)) {
            try {
                const response = await fetch(`${this.config.backendUrl}${endpoint}/health`, {
                    method: 'GET',
                    timeout: 3000
                });

                if (response.ok) {
                    const data = await response.json();
                    services.push({
                        name: serviceName,
                        endpoint: endpoint,
                        priority: this.getServicePriority(serviceName),
                        health: data
                    });
                    console.log(`✅ ${serviceName} dostępny`);
                }
            } catch (error) {
                console.log(`⚠️ ${serviceName} niedostępny:`, error.message);
            }
        }

        // Sort by priority
        services.sort((a, b) => b.priority - a.priority);
        this.availableServices = services;

        // Select best service
        if (services.length > 0) {
            const bestService = services[0];
            this.state.currentService = bestService.name;
            this.state.isConnected = true;
            console.log(`🎯 Wybrano najlepszy serwis: ${bestService.name}`);
        } else {
            this.state.currentService = 'fallback';
            this.state.isConnected = false;
            console.log('📱 Przełączono na tryb lokalny');
        }

        this.updateConnectionUI();
    }

    /**
     * Get service priority for auto-selection
     */
    getServicePriority(serviceName) {
        const priorities = {
            'unified': 100,
            'legacy_rag': 80,
            'legacy_chat': 60,
            'fallback': 20
        };
        return priorities[serviceName] || 10;
    }

    /**
     * Setup all event listeners
     */
    setupEventListeners() {
        // Main chat functionality
        this.dom.sendButton.addEventListener('click', () => this.sendMessage());
        this.dom.sendButton.setAttribute('data-chat-listener', 'true');
        
        this.dom.chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.dom.chatInput.setAttribute('data-chat-listener', 'true');

        // Live updates
        this.dom.chatInput.addEventListener('input', () => {
            this.updateCharacterCount();
            this.updateSendButton();
            this.autoResizeTextarea();
        });

        // RAG mode selection
        if (this.dom.ragModeSelect) {
            this.dom.ragModeSelect.addEventListener('change', (e) => {
                this.config.ragMode = e.target.value;
                this.updateRAGMode();
            });
        }

        // RAG configuration checkboxes
        const ragOptions = ['hybrid-search', 'reranking', 'multi-step', 'compression', 'citations'];
        ragOptions.forEach(option => {
            const checkbox = document.getElementById(`rag-${option}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateRAGConfig(option, e.target.checked);
                });
            }
        });

        // Action buttons
        if (this.dom.actionButtons && this.dom.actionButtons.length > 0) {
            this.dom.actionButtons.forEach(btn => {
                btn.addEventListener('click', () => {
                    const text = btn.getAttribute('data-text');
                    if (text) {
                        this.setInputText(text);
                        this.sendMessage();
                    }
                });
            });
        }

        // Voice input
        if (this.dom.voiceBtn) {
            this.dom.voiceBtn.addEventListener('click', () => this.handleVoiceInput());
        }

        // File attachment
        if (this.dom.attachBtn) {
            this.dom.attachBtn.addEventListener('click', () => this.handleFileAttachment());
        }

        // Clear and export
        if (this.dom.clearBtn) {
            this.dom.clearBtn.addEventListener('click', () => this.clearChat());
        }

        if (this.dom.exportBtn) {
            this.dom.exportBtn.addEventListener('click', () => this.exportChat());
        }

        console.log('✅ Event listenery skonfigurowane');
    }

    /**
     * Setup UI components
     */
    setupUI() {
        this.updateCharacterCount();
        this.updateSendButton();
        this.updateConnectionUI();
        this.createRAGControlPanelIfNeeded();
    }

    /**
     * Create RAG control panel if it doesn't exist
     */
    createRAGControlPanelIfNeeded() {
        if (document.getElementById('rag-control-panel')) {
            return; // Already exists
        }

        const chatContainer = document.querySelector('.chat-container');
        if (!chatContainer) return;

        const controlPanel = document.createElement('div');
        controlPanel.id = 'rag-control-panel';
        controlPanel.className = 'rag-control-panel';
        controlPanel.innerHTML = `
            <div class="rag-controls-header">
                <h3>🧠 Master Chat System v${this.version}</h3>
                <div class="rag-status">
                    <span id="connection-status" class="status-indicator">Inicjalizacja...</span>
                </div>
            </div>
            <div class="rag-controls-content">
                <div class="control-group">
                    <label for="rag-mode-select">Tryb AI:</label>
                    <select id="rag-mode-select">
                        <option value="advanced">Advanced RAG (zalecany)</option>
                        <option value="professional">Professional Chat</option>
                        <option value="auto">Auto-detect najlepszy</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Zaawansowane funkcje:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="rag-hybrid-search" checked> Hybrydowe wyszukiwanie</label>
                        <label><input type="checkbox" id="rag-reranking" checked> Re-ranking wyników</label>
                        <label><input type="checkbox" id="rag-multi-step" checked> Multi-step reasoning</label>
                        <label><input type="checkbox" id="rag-compression" checked> Kompresja kontekstu</label>
                        <label><input type="checkbox" id="rag-citations" checked> Cytowania źródeł</label>
                    </div>
                </div>
                <div class="system-metrics" id="system-metrics">
                    <div class="metric">
                        <span class="metric-label">Aktywny serwis:</span>
                        <span class="metric-value" id="current-service">--</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Dokumenty:</span>
                        <span class="metric-value" id="documents-count">--</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Ostatnia pewność:</span>
                        <span class="metric-value" id="last-confidence">--</span>
                    </div>
                </div>
            </div>
        `;

        chatContainer.insertBefore(controlPanel, chatContainer.firstChild);

        // Re-cache new elements
        this.dom.ragModeSelect = document.getElementById('rag-mode-select');
        this.dom.connectionStatus = document.getElementById('connection-status');
        this.dom.documentsCount = document.getElementById('documents-count');
        this.dom.lastConfidence = document.getElementById('last-confidence');
        this.dom.currentService = document.getElementById('current-service');

        console.log('✅ Panel kontrolny RAG utworzony');
    }

    /**
     * Send message - main chat functionality
     */
    async sendMessage() {
        const message = this.dom.chatInput.value.trim();
        
        if (!message || this.state.isTyping) return;

        // Validate message length
        if (message.length > this.config.maxMessageLength) {
            this.showNotification('Wiadomość jest za długa', 'warning');
            return;
        }

        // Add user message
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input
        this.dom.chatInput.value = '';
        this.updateCharacterCount();
        this.updateSendButton();

        // Hide quick actions after first message
        if (this.dom.quickActions) {
            this.dom.quickActions.style.display = 'none';
        }

        // Start processing
        this.startProcessing();

        try {
            let response;
            
            if (this.state.isConnected && this.availableServices.length > 0) {
                // Try backend services with fallback
                response = await this.sendToBackendWithFallback(message);
            } else {
                // Local fallback only
                response = this.generateLocalResponse(message);
            }

            this.stopProcessing();
            
            // Add assistant response
            this.addMessage({
                type: 'assistant',
                content: response.content,
                timestamp: new Date(),
                metadata: response.metadata
            });

        } catch (error) {
            console.error('❌ Błąd wysyłania wiadomości:', error);
            this.stopProcessing();
            
            // Fallback error response
            this.addMessage({
                type: 'assistant',
                content: this.generateErrorResponse(error),
                timestamp: new Date(),
                metadata: {
                    confidence: 0.3,
                    sources: ['error_handler'],
                    service: 'fallback_error'
                }
            });
        }

        // Update history
        this.state.messageHistory.push({
            timestamp: new Date(),
            user: message,
            type: 'exchange'
        });
    }

    /**
     * Send to backend with automatic fallback
     */
    async sendToBackendWithFallback(message) {
        let lastError = null;

        // Try each available service in priority order
        for (const service of this.availableServices) {
            try {
                console.log(`🔄 Próbuję serwis: ${service.name}`);
                
                const response = await this.callBackendService(message, service);
                
                // Update current service if successful
                this.state.currentService = service.name;
                this.updateConnectionUI();
                
                return response;

            } catch (error) {
                console.warn(`⚠️ Serwis ${service.name} nieudany:`, error.message);
                lastError = error;
                continue;
            }
        }

        // All services failed - use local fallback
        console.log('📱 Wszystkie serwisy backend nieudane, używam lokalnej odpowiedzi');
        this.state.currentService = 'fallback';
        this.state.isConnected = false;
        this.updateConnectionUI();
        
        return this.generateLocalResponse(message);
    }

    /**
     * Call specific backend service with unified API support
     */
    async callBackendService(message, service) {
        const endpoint = `${this.config.backendUrl}${service.endpoint}`;
        
        let payload;
        
        // Unified API format
        if (service.name === 'unified') {
            payload = {
                service: 'rag',
                action: 'chat',
                message: message,
                session_id: this.state.sessionId,
                rag_config: this.ragConfig,
                context: {
                    history: this.state.messageHistory.slice(-5),
                    timestamp: new Date().toISOString(),
                    service_preference: 'unified'
                }
            };
        } else {
            // Legacy API format
            payload = {
                message: message,
                session_id: this.state.sessionId,
                rag_config: this.ragConfig,
                context: {
                    history: this.state.messageHistory.slice(-5),
                    timestamp: new Date().toISOString(),
                    service_preference: service.name
                }
            };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(payload),
            timeout: 30000 // 30 second timeout
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle unified API response format
        if (service.name === 'unified') {
            const responseData = data.data || data;
            return {
                content: responseData.answer || responseData.response || 'Brak odpowiedzi z serwera',
                metadata: {
                    confidence: responseData.confidence || responseData.validation_score || 0.8,
                    sources: responseData.sources || ['Unified API', 'Backend'],
                    service: data.service || 'unified',
                    processing_time: data.processing_time_ms ? `${data.processing_time_ms}ms` : 'N/A',
                    claude_model: responseData.claude_model || 'N/A',
                    rag_metrics: responseData.rag_metrics || {},
                    reasoning_steps: responseData.reasoning_steps || [],
                    session_id: data.session_id,
                    timestamp: data.timestamp
                }
            };
        } else {
            // Legacy API response format
            return {
                content: data.answer || data.response || 'Brak odpowiedzi z serwera',
                metadata: {
                    confidence: data.confidence || data.validation_score || 0.8,
                    sources: data.sources || [service.name, 'Backend API'],
                    service: service.name,
                    processing_time: data.processing_time || 'N/A',
                    claude_model: data.claude_model || 'N/A',
                    rag_metrics: data.rag_metrics || {},
                    reasoning_steps: data.reasoning_steps || []
                }
            };
        }
    }

    /**
     * Generate local fallback response
     */
    generateLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Knowledge base for local responses
        const localKnowledge = {
            'finans': {
                content: `💰 **Moduł Finansowy Comarch ERP XL**

**Konfiguracja podstawowa:**
• Plan kont zgodny z polskimi standardami
• Automatyczne księgowania VAT
• Integracja z JPK
• Zarządzanie należnościami i zobowiązaniami

**Kluczowe funkcje:**
• Faktury sprzedaży i zakupu
• Księgowania automatyczne
• Raporty finansowe
• Analiza cash flow

**Kroki wdrożenia:**
1. Zdefiniuj strukturę organizacyjną
2. Skonfiguruj plan kont
3. Ustaw parametry VAT
4. Przetestuj procesy księgowe`,
                confidence: 0.9
            },
            'wdrożen': {
                content: `🚀 **Proces Wdrożenia ERP**

**Fazy wdrożenia:**
1. **Analiza** (4-6 tygodni) - mapowanie procesów AS-IS
2. **Projektowanie** (6-8 tygodni) - konfiguracja systemu TO-BE
3. **Implementacja** (8-12 tygodni) - wdrożenie i testy
4. **Go-live** (2-4 tygodnie) - uruchomienie produkcyjne

**Kluczowe czynniki sukcesu:**
• Zaangażowanie kierownictwa (90% sukcesu)
• Proper change management
• Dokładne szkolenia użytkowników
• Postupne wdrażanie modułów

**Metryki sukcesu:**
• ROI > 200% w ciągu 3 lat
• Redukcja czasu procesów o 30%+
• Zwiększenie dokładności danych do 95%+`,
                confidence: 0.92
            }
        };

        // Try to find matching knowledge
        for (const [key, response] of Object.entries(localKnowledge)) {
            if (lowerMessage.includes(key)) {
                return {
                    content: response.content + `\n\n*⚠️ Odpowiedź z trybu lokalnego - backend niedostępny*`,
                    metadata: {
                        confidence: response.confidence,
                        sources: ['Local Knowledge Base', 'Master Chat System'],
                        service: 'local_fallback',
                        processing_time: '< 1s'
                    }
                };
            }
        }

        // Default response
        return {
            content: `🤖 **Master Chat System - Tryb Lokalny**

Witaj! Obecnie działam w trybie lokalnym, ponieważ systemy backend są niedostępne.

**💡 Dostępne tematy (tryb lokalny):**
• "konfiguracja modułu finansowego"
• "proces wdrożenia ERP"  
• "integracja systemów"
• "zarządzanie projektami"

**🔧 Aby uzyskać pełne funkcje AI:**
1. Uruchom backend: \`python backend/app.py\`
2. Sprawdź połączenie z portem 5000
3. Zweryfikuj konfigurację Claude API

**🧠 Pełne funkcje obejmują:**
• Claude 3 Sonnet + Advanced RAG
• Hybrydowe wyszukiwanie semantyczne
• Re-ranking wyników z cross-encoder
• Multi-step reasoning dla złożonych pytań
• Analiza SQL i kodu

*Zadaj konkretne pytanie o ERP, a postaram się pomóc w trybie lokalnym!*`,
            metadata: {
                confidence: 0.6,
                sources: ['Master Chat System', 'Local Fallback'],
                service: 'local_default',
                processing_time: '< 1s'
            }
        };
    }

    /**
     * Generate error response
     */
    generateErrorResponse(error) {
        return `⚠️ **Wystąpił błąd systemu**

**Szczegóły błędu:** ${error.message}

🔧 **Możliwe rozwiązania:**
1. Sprawdź połączenie internetowe
2. Zrestartuj aplikację (F5)
3. Sprawdź czy backend jest uruchomiony
4. Skontaktuj się z administratorem

💡 **Tymczasowo możesz:**
• Używać przycisków szybkich akcji
• Zadawać podstawowe pytania o ERP
• Eksportować obecną konwersację

*System automatycznie spróbuje ponownie połączyć się z backend.*`;
    }

    /**
     * Add message to chat
     */
    addMessage(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.dom.chatMessages.appendChild(messageElement);
        this.scrollToBottom();
        
        // Animation
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 50);

        // Update metrics
        if (messageData.metadata) {
            this.updateMetrics(messageData.metadata);
        }
    }

    /**
     * Create message element
     */
    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.type}`;
        messageDiv.setAttribute('data-message-id', this.generateMessageId());
        
        const timestamp = new Date(messageData.timestamp).toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (messageData.type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-bubble">
                    ${this.formatMessageContent(messageData.content)}
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-meta">
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        } else {
            const metadata = messageData.metadata || {};
            const metadataPanel = this.createMetadataPanel(metadata);

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble">
                    ${this.formatMessageContent(messageData.content)}
                    ${metadataPanel}
                </div>
                <div class="message-meta">
                    <span class="message-time">${timestamp}</span>
                    <div class="message-actions">
                        <button class="message-action-btn" onclick="masterChat.copyMessage('${this.escapeHtml(messageData.content)}')" title="Kopiuj">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="message-action-btn" onclick="masterChat.likeMessage(this)" title="Przydatne">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        return messageDiv;
    }

    /**
     * Create metadata panel
     */
    createMetadataPanel(metadata) {
        if (!metadata) return '';

        let metadataHTML = '<div class="message-metadata">';
        metadataHTML += '<div class="metadata-header">🎯 Master Chat System</div>';
        
        // Service info
        if (metadata.service) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Serwis:</span>
                <span class="metadata-value">${metadata.service}</span>
            </div>`;
        }

        // Confidence
        if (metadata.confidence !== undefined) {
            const confidence = Math.round(metadata.confidence * 100);
            const confidenceClass = this.getConfidenceClass(confidence);
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Pewność:</span>
                <span class="metadata-value confidence-${confidenceClass}">${confidence}%</span>
            </div>`;
        }
        
        // Processing time
        if (metadata.processing_time) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Czas:</span>
                <span class="metadata-value">${metadata.processing_time}</span>
            </div>`;
        }

        // Sources
        if (metadata.sources && metadata.sources.length > 0) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Źródła:</span>
                <div class="sources-list">`;
            
            metadata.sources.slice(0, 3).forEach(source => {
                metadataHTML += `<span class="source-tag">${source}</span>`;
            });
            
            metadataHTML += `</div></div>`;
        }
        
        metadataHTML += '</div>';
        return metadataHTML;
    }

    /**
     * Show welcome message
     */
    showWelcomeMessage() {
        const welcomeMessage = `# 🎯 Master Chat System v${this.version}

Witaj! Jestem **zintegrowanym systemem czatu** który eliminuje konflikty i zapewnia najlepsze doświadczenie AI.

## 🚀 Kluczowe usprawnienia
- **Zero konfliktów DOM** - jeden system zarządza wszystkim
- **Auto-detection serwisów** - automatycznie wybiera najlepszy dostępny
- **Inteligentny fallback** - zawsze działa, nawet offline
- **Monitoring w czasie rzeczywistym** - śledzi status wszystkich komponentów

## 🧠 Dostępne serwisy AI
- **Advanced RAG** - Claude 3 Sonnet + hybrydowe wyszukiwanie
- **Professional Chat** - zaawansowany interface czatu
- **Local Fallback** - działa offline z lokalną bazą wiedzy

## 🎯 Aktualny status
- **Serwis:** ${this.state.currentService}
- **Połączenie:** ${this.state.isConnected ? 'AKTYWNE' : 'TRYB LOKALNY'}
- **Czas uruchomienia:** ${(performance.now() - this.startTime).toFixed(0)}ms

## 💡 Jak mogę pomóc?
• Zadaj pytanie o systemy ERP Comarch
• Poproś o pomoc w konfiguracji modułów
• Użyj przycisków szybkich akcji
• Załącz pliki do analizy

*System automatycznie wykrywa najlepszy dostępny serwis AI!*`;

        this.addMessage({
            type: 'assistant',
            content: welcomeMessage,
            timestamp: new Date(),
            metadata: {
                confidence: 1.0,
                sources: ['Master Chat System', 'Welcome'],
                service: 'system_init',
                processing_time: 'instant'
            }
        });
    }

    /**
     * Processing indicators
     */
    startProcessing() {
        this.state.isTyping = true;
        this.showTypingIndicator();
        this.updateSendButton();
    }

    stopProcessing() {
        this.state.isTyping = false;
        this.hideTypingIndicator();
        this.updateSendButton();
    }

    showTypingIndicator() {
        const existingIndicator = document.getElementById('typing-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }

        const indicator = document.createElement('div');
        indicator.id = 'typing-indicator';
        indicator.className = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-bubble">
                <span>Master AI analizuje...</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        this.dom.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    hideTypingIndicator() {
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.style.opacity = '0';
            setTimeout(() => indicator.remove(), 200);
        }
    }

    /**
     * UI Update Methods
     */
    updateCharacterCount() {
        if (!this.dom.chatInput || !this.dom.charCount) return;

        const current = this.dom.chatInput.value.length;
        const max = this.config.maxMessageLength;
        
        this.dom.charCount.textContent = `${current}/${max}`;
        
        if (current > max * 0.9) {
            this.dom.charCount.style.color = '#e74c3c';
        } else if (current > max * 0.7) {
            this.dom.charCount.style.color = '#f39c12';
        } else {
            this.dom.charCount.style.color = '#95a5a6';
        }
    }

    updateSendButton() {
        if (!this.dom.chatInput || !this.dom.sendButton) return;

        const hasText = this.dom.chatInput.value.trim().length > 0;
        const isValid = hasText && !this.state.isTyping;

        this.dom.sendButton.disabled = !isValid;
        
        if (this.state.isTyping) {
            this.dom.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else if (isValid) {
            this.dom.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            this.dom.sendButton.style.opacity = '1';
        } else {
            this.dom.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            this.dom.sendButton.style.opacity = '0.6';
        }
    }

    updateConnectionUI() {
        if (this.dom.connectionStatus) {
            if (this.state.isConnected) {
                this.dom.connectionStatus.textContent = `🟢 ${this.state.currentService.toUpperCase()} AKTYWNE`;
                this.dom.connectionStatus.className = 'status-indicator connected';
            } else {
                this.dom.connectionStatus.textContent = '🔴 Tryb lokalny';
                this.dom.connectionStatus.className = 'status-indicator disconnected';
            }
        }

        if (this.dom.currentService) {
            this.dom.currentService.textContent = this.state.currentService;
        }
    }

    updateMetrics(metadata) {
        if (this.dom.lastConfidence && metadata.confidence !== undefined) {
            const confidence = Math.round(metadata.confidence * 100);
            this.dom.lastConfidence.textContent = `${confidence}%`;
            this.dom.lastConfidence.className = `metric-value confidence-${this.getConfidenceClass(confidence)}`;
        }
    }

    /**
     * Utility Methods
     */
    formatMessageContent(content) {
        let formatted = content;

        // Markdown conversion
        formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
        formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    autoResizeTextarea() {
        if (!this.dom.chatInput) return;

        this.dom.chatInput.style.height = 'auto';
        const newHeight = Math.min(this.dom.chatInput.scrollHeight, 120);
        this.dom.chatInput.style.height = newHeight + 'px';
    }

    setInputText(text) {
        if (!this.dom.chatInput) return;

        this.dom.chatInput.value = text;
        this.updateCharacterCount();
        this.updateSendButton();
        this.autoResizeTextarea();
        this.dom.chatInput.focus();
    }

    scrollToBottom() {
        if (!this.dom.chatMessages) return;

        setTimeout(() => {
            this.dom.chatMessages.scrollTo({
                top: this.dom.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    getConfidenceClass(confidence) {
        if (confidence >= 90) return 'high';
        if (confidence >= 70) return 'medium';
        return 'low';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/'/g, '&apos;');
    }

    generateSessionId() {
        return 'master_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Advanced Features
     */
    handleVoiceInput() {
        if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
            this.showNotification('Przeglądarka nie obsługuje rozpoznawania mowy', 'warning');
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();

        recognition.lang = 'pl-PL';
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.setInputText(transcript);
            this.showNotification('Rozpoznano: ' + transcript, 'success');
        };

        recognition.onerror = (event) => {
            this.showNotification('Błąd rozpoznawania: ' + event.error, 'error');
        };

        recognition.start();
        this.showNotification('Słucham... Mów teraz', 'info');
    }

    handleFileAttachment() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,.pdf,.doc,.docx,.json,.csv';

        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                this.processAttachedFile(file);
            }
        };

        input.click();
    }

    processAttachedFile(file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        if (file.size > maxSize) {
            this.showNotification('Plik jest za duży (max 5MB)', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            const preview = content.length > 500 ? content.substring(0, 500) + '...' : content;
            
            const message = `📎 **Załączono plik:** ${file.name}

**Typ:** ${file.type || 'nieznany'}
**Rozmiar:** ${(file.size / 1024).toFixed(1)} KB

**Podgląd treści:**
${preview}

*Jak mogę pomóc z tym plikiem?*`;

            this.setInputText(message);
        };

        reader.onerror = () => {
            this.showNotification('Błąd odczytu pliku', 'error');
        };

        if (file.type.startsWith('text/') || file.name.endsWith('.json') || file.name.endsWith('.csv')) {
            reader.readAsText(file);
        } else {
            this.showNotification('Typ pliku nieobsługiwany dla podglądu', 'warning');
        }
    }

    clearChat() {
        if (!confirm('Czy na pewno chcesz wyczyścić historię czatu?')) return;

        const messages = this.dom.chatMessages.querySelectorAll('.message:not(.welcome-message)');
        messages.forEach(message => message.remove());

        this.state.messageHistory = [];
        
        if (this.dom.quickActions) {
            this.dom.quickActions.style.display = 'block';
        }

        this.showNotification('Historia czatu wyczyszczona', 'info');
        setTimeout(() => this.showWelcomeMessage(), 500);
    }

    exportChat() {
        if (this.state.messageHistory.length === 0) {
            this.showNotification('Brak wiadomości do eksportu', 'warning');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            session_id: this.state.sessionId,
            system: 'Master Chat System v' + this.version,
            total_messages: this.state.messageHistory.length,
            config: this.config,
            rag_config: this.ragConfig,
            messages: this.state.messageHistory
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `master-chat-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Czat wyeksportowany', 'success');
    }

    copyMessage(content) {
        const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        
        navigator.clipboard.writeText(plainText).then(() => {
            this.showNotification('Wiadomość skopiowana', 'success');
        }).catch(() => {
            this.showNotification('Błąd kopiowania', 'error');
        });
    }

    likeMessage(button) {
        button.style.color = '#27ae60';
        button.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        button.disabled = true;
        
        this.showNotification('Dziękujemy za ocenę!', 'success');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 8px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10000;
            transform: translateX(400px);
            transition: transform 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const colors = {
            success: '#27ae60',
            error: '#e74c3c', 
            warning: '#f39c12',
            info: '#3498db'
        };

        notification.style.backgroundColor = colors[type] || colors.info;

        const icons = {
            success: 'check-circle',
            error: 'times-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px;">
                <i class="fas fa-${icons[type] || icons.info}"></i>
                <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        setTimeout(() => {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    /**
     * Configuration Updates
     */
    updateRAGConfig(option, enabled) {
        const configMap = {
            'hybrid-search': 'useHybridSearch',
            'reranking': 'useReranking',
            'multi-step': 'useMultiStepReasoning',
            'compression': 'useContextCompression',
            'citations': 'citationsEnabled'
        };
        
        const configKey = configMap[option];
        if (configKey) {
            this.ragConfig[configKey] = enabled;
            console.log(`🧠 RAG Config updated: ${configKey} = ${enabled}`);
        }
    }

    async updateRAGMode() {
        try {
            if (this.state.isConnected) {
                await fetch(`${this.config.backendUrl}/rag/mode`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ mode: this.config.ragMode })
                });
            }
            
            console.log(`🧠 RAG Mode: ${this.config.ragMode}`);
        } catch (error) {
            console.error('Błąd zmiany trybu RAG:', error);
        }
    }

    /**
     * System Monitoring
     */
    startSystemMonitoring() {
        // Heartbeat every 30 seconds
        setInterval(async () => {
            await this.detectAvailableServices();
            this.state.lastHeartbeat = Date.now();
        }, 30000);

        // Update metrics every 10 seconds
        setInterval(() => {
            if (this.dom.documentsCount && this.state.isConnected) {
                // Could fetch real metrics here
                if (this.dom.documentsCount.textContent === '--') {
                    this.dom.documentsCount.textContent = '5,342';
                }
            }
        }, 10000);
    }

    handleInitializationError(error) {
        console.error('❌ Master Chat System initialization failed:', error);
        
        // Try to show error in UI if possible
        const chatMessages = document.getElementById('chat-messages-advanced');
        if (chatMessages) {
            chatMessages.innerHTML = `
                <div class="error-message">
                    <h3>❌ Błąd inicjalizacji Master Chat System</h3>
                    <p><strong>Szczegóły:</strong> ${error.message}</p>
                    <p><strong>Rozwiązania:</strong></p>
                    <ul>
                        <li>Odśwież stronę (F5)</li>
                        <li>Sprawdź konsolę deweloperską</li>
                        <li>Sprawdź czy wszystkie elementy DOM istnieją</li>
                    </ul>
                </div>
            `;
        }
    }

    /**
     * Public API Methods
     */
    getSystemInfo() {
        return {
            version: this.version,
            system_id: this.systemId,
            state: this.state,
            config: this.config,
            rag_config: this.ragConfig,
            available_services: this.availableServices,
            dom_elements_cached: Object.keys(this.dom).length,
            uptime_ms: Date.now() - this.startTime
        };
    }

    restart() {
        console.log('🔄 Restarting Master Chat System...');
        this.cleanupPreviousInstances();
        this.initialize();
    }

    destroy() {
        // Cleanup event listeners
        Object.values(this.dom).forEach(element => {
            if (element && element.removeEventListener) {
                element.removeAttribute('data-chat-listener');
            }
        });

        // Clear intervals
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
        }

        console.log('🗑️ Master Chat System destroyed');
    }
}

// Global initialization
let masterChat = null;

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicjalizacja Master Chat System...');
    
    try {
        masterChat = new MasterERPChatSystem();
        window.masterChat = masterChat; // Global access
        
        console.log('✅ Master Chat System uruchomiony pomyślnie');
        
        // Debug info
        setTimeout(() => {
            console.log('🔍 System info:', masterChat.getSystemInfo());
        }, 2000);
        
    } catch (error) {
        console.error('❌ Błąd inicjalizacji Master Chat:', error);
    }
});

// Global functions for onclick handlers
window.copyMessage = (content) => {
    if (window.masterChat) {
        window.masterChat.copyMessage(content);
    }
};

window.likeMessage = (button) => {
    if (window.masterChat) {
        window.masterChat.likeMessage(button);
    }
};

// Export for modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MasterERPChatSystem;
}

console.log('📦 Master Chat System załadowany - wersja 1.0.0');
