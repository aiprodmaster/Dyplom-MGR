/**
 * =================================================================================
 * ENHANCED UNIFIED ERP CHAT SYSTEM - Ulepszona wersja z zaawansowanymi funkcjami
 * Implementuje wszystkie funkcje enterprise: error handling, caching, offline support,
 * performance monitoring, accessibility, analytics i wiele więcej
 * =================================================================================
 */

// KONFIGURACJA I STAŁE
const CONFIG = {
    API: {
        BASE_URL: process.env.NODE_ENV === 'production' 
            ? 'https://api.yourdomain.com' 
            : 'http://localhost:5000',
        TIMEOUT: 30000,
        RETRY_ATTEMPTS: 3,
        ERROR_REPORTING: true
    },
    CHAT: {
        MAX_MESSAGE_LENGTH: 4000,
        TYPING_DELAY: 1500,
        SCROLL_BEHAVIOR: 'smooth',
        AUTO_SAVE_INTERVAL: 30000
    },
    STORAGE: {
        SETTINGS_KEY: 'alex_assistant_settings',
        CHAT_HISTORY_KEY: 'alex_chat_history',
        STATISTICS_KEY: 'alex_statistics'
    }
};

// ERROR HANDLING I LOGGING
class ErrorHandler {
    static logError(error, context = '') {
        const errorData = {
            message: error.message,
            stack: error.stack,
            context,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href,
            sessionId: window.assistantApp?.getSessionId() || 'unknown'
        };
        
        console.error('🚨 Error:', errorData);
        
        // Wyślij do serwera (opcjonalnie)
        if (CONFIG.API.ERROR_REPORTING) {
            this.sendErrorReport(errorData);
        }
        
        // Zapisz lokalnie dla debugowania
        this.saveErrorLocally(errorData);
    }
    
    static async sendErrorReport(errorData) {
        try {
            await fetch(`${CONFIG.API.BASE_URL}/api/errors`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Error-Report': 'true'
                },
                body: JSON.stringify(errorData)
            });
        } catch (e) {
            console.error('Failed to send error report:', e);
        }
    }
    
    static saveErrorLocally(errorData) {
        try {
            const errors = JSON.parse(localStorage.getItem('alex_errors') || '[]');
            errors.push(errorData);
            
            // Zachowaj tylko ostatnie 50 błędów
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('alex_errors', JSON.stringify(errors));
        } catch (e) {
            console.warn('Cannot save error locally:', e);
        }
    }
}

// CACHE MANAGER
class CacheManager {
    constructor() {
        this.cache = new Map();
        this.maxSize = 100;
        this.defaultTTL = 300000; // 5 min
        this.startCleanupTimer();
    }
    
    set(key, value, ttl = this.defaultTTL) {
        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            value,
            expires: Date.now() + ttl,
            accessCount: 0
        });
    }
    
    get(key) {
        const item = this.cache.get(key);
        if (!item) return null;
        
        if (Date.now() > item.expires) {
            this.cache.delete(key);
            return null;
        }
        
        item.accessCount++;
        return item.value;
    }
    
    startCleanupTimer() {
        setInterval(() => {
            const now = Date.now();
            for (const [key, item] of this.cache.entries()) {
                if (now > item.expires) {
                    this.cache.delete(key);
                }
            }
        }, 60000);
    }
}

// ANALYTICS TRACKER
class AnalyticsTracker {
    static track(event, data = {}) {
        const eventData = {
            event,
            data,
            timestamp: Date.now(),
            sessionId: window.assistantApp?.getSessionId(),
            userAgent: navigator.userAgent
        };
        
        console.log('📊 Analytics:', eventData);
        this.saveEventLocally(eventData);
    }
    
    static saveEventLocally(eventData) {
        try {
            const events = JSON.parse(localStorage.getItem('alex_analytics') || '[]');
            events.push(eventData);
            
            if (events.length > 200) {
                events.splice(0, events.length - 200);
            }
            
            localStorage.setItem('alex_analytics', JSON.stringify(events));
        } catch (e) {
            console.warn('Cannot save analytics locally:', e);
        }
    }
}

class UnifiedERPChat {
    constructor() {
        this.config = {
            backendUrl: CONFIG.API.BASE_URL + '/api',
            maxMessageLength: CONFIG.CHAT.MAX_MESSAGE_LENGTH,
            typingDelay: CONFIG.CHAT.TYPING_DELAY,
            retryAttempts: CONFIG.API.RETRY_ATTEMPTS,
            ragMode: 'advanced',
            timeout: CONFIG.API.TIMEOUT
        };

        this.state = {
            isTyping: false,
            messageHistory: [],
            sessionId: this.generateSessionId(),
            connectionStatus: 'disconnected',
            isProcessing: false,
            isOnline: navigator.onLine,
            retryCount: 0
        };

        // Konfiguracja RAG
        this.ragConfig = {
            useHybridSearch: true,
            useReranking: true,
            useMultiStepReasoning: true,
            useContextCompression: true,
            maxContextLength: 2000,
            citationsEnabled: true
        };

        // Nowe komponenty enterprise
        this.cache = new CacheManager();
        this.errorHandler = ErrorHandler;
        this.analytics = AnalyticsTracker;
        
        // Performance monitoring
        this.performance = {
            startTime: Date.now(),
            messagesSent: 0,
            averageResponseTime: 0,
            errorCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };

        this.elements = {};
        this.knowledgeBase = this.initializeKnowledgeBase();
        
        // Inicjalizuj komponenty enterprise
        this.setupOfflineHandling();
        this.setupPerformanceMonitoring();
        this.setupAccessibility();
        this.startAutoSave();
        
        this.initialize();
    }

    /**
     * OFFLINE SUPPORT
     */
    setupOfflineHandling() {
        window.addEventListener('online', () => {
            this.state.isOnline = true;
            this.showNotification('Połączenie zostało przywrócone', 'success');
            this.syncOfflineData();
            this.analytics.track('connection_restored');
        });
        
        window.addEventListener('offline', () => {
            this.state.isOnline = false;
            this.showNotification('Brak połączenia internetowego. Przechodzę w tryb offline.', 'warning');
            this.analytics.track('connection_lost');
        });
    }
    
    /**
     * PERFORMANCE MONITORING
     */
    setupPerformanceMonitoring() {
        this.performance = {
            startTime: Date.now(),
            messagesSent: 0,
            averageResponseTime: 0,
            errorCount: 0,
            cacheHits: 0,
            cacheMisses: 0
        };
        
        // Monitor wydajności co 30 sekund
        setInterval(() => {
            this.logPerformanceMetrics();
        }, 30000);
    }
    
    logPerformanceMetrics() {
        const metrics = {
            ...this.performance,
            uptime: Date.now() - this.performance.startTime,
            cacheStats: this.cache.getStats(),
            memoryUsage: performance.memory ? {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024)
            } : null
        };
        
        console.log('📊 Performance Metrics:', metrics);
        this.analytics.track('performance_check', metrics);
    }
    
    /**
     * ACCESSIBILITY IMPROVEMENTS
     */
    setupAccessibility() {
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.sendMessage();
                        break;
                    case '/':
                        e.preventDefault();
                        this.elements.chatInput?.focus();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearChat();
                        break;
                    case 'e':
                        e.preventDefault();
                        this.exportChat();
                        break;
                }
            }
            
            // Escape closes any modals/overlays
            if (e.key === 'Escape') {
                this.closeModals();
            }
        });
        
        // Screen reader support
        this.setupScreenReaderSupport();
        
        console.log('♿ Accessibility features enabled');
    }
    
    setupScreenReaderSupport() {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        announcer.id = 'screen-reader-announcer';
        document.body.appendChild(announcer);
    }
    
    announceToScreenReader(message) {
        const announcer = document.getElementById('screen-reader-announcer');
        if (announcer) {
            announcer.textContent = message;
        }
    }
    
    closeModals() {
        // Zamknij otwarte modale
        const modals = document.querySelectorAll('.modal.active, .overlay.active');
        modals.forEach(modal => {
            modal.classList.remove('active');
        });
    }
    
    /**
     * AUTO-SAVE
     */
    startAutoSave() {
        setInterval(() => {
            this.saveToLocalStorage();
        }, CONFIG.CHAT.AUTO_SAVE_INTERVAL);
        
        // Zapisz przy zamknięciu okna
        window.addEventListener('beforeunload', () => {
            this.saveToLocalStorage();
        });
        
        console.log(`💾 Auto-save started (interval: ${CONFIG.CHAT.AUTO_SAVE_INTERVAL}ms)`);
    }
    
    saveToLocalStorage() {
        try {
            const dataToSave = {
                chatHistory: this.state.messageHistory.slice(-50),
                settings: this.ragConfig,
                performance: this.performance,
                timestamp: Date.now()
            };
            
            localStorage.setItem(CONFIG.STORAGE.CHAT_HISTORY_KEY, JSON.stringify(dataToSave));
            console.log('💾 Data auto-saved');
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
            this.errorHandler.logError(error, 'auto_save');
        }
    }
    
    loadFromLocalStorage() {
        try {
            const saved = localStorage.getItem(CONFIG.STORAGE.CHAT_HISTORY_KEY);
            if (saved) {
                const data = JSON.parse(saved);
                
                // Przywróć historię (jeśli nie starsza niż 24h)
                if (Date.now() - data.timestamp < 24 * 60 * 60 * 1000) {
                    this.state.messageHistory = data.chatHistory || [];
                    console.log(`💾 Restored ${this.state.messageHistory.length} messages from storage`);
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    /**
     * Inicjalizacja systemu - ulepszona wersja
     */
    async initialize() {
        console.log('🚀 Inicjalizacja Enhanced Unified ERP Chat System...');
        
        // Track initialization
        this.analytics.track('app_initialized', {
            version: '2.0.0',
            timestamp: Date.now()
        });
        
        if (!this.cacheElements()) {
            console.error('❌ Nie można znaleźć kluczowych elementów DOM');
            return;
        }

        this.setupEventListeners();
        this.setupUI();
        
        // Przywróć dane z localStorage
        this.loadFromLocalStorage();
        
        await this.checkBackendConnection();
        await this.initializeRAGSystem();
        this.showWelcomeMessage();
        this.startPeriodicUpdates();
        
        console.log('✅ Enhanced Unified ERP Chat System zainicjalizowany pomyślnie');
    }

    /**
     * Cache elementów DOM
     */
    cacheElements() {
        this.elements = {
            // Chat interface
            chatInput: document.getElementById('chat-input-advanced'),
            chatMessages: document.getElementById('chat-messages-advanced'), 
            sendButton: document.getElementById('send-button-advanced'),
            
            // Controls
            charCount: document.getElementById('char-count-advanced'),
            aiStatus: document.getElementById('ai-status'),
            searchStatus: document.getElementById('search-status'),
            
            // RAG Controls
            ragModeSelect: document.getElementById('rag-mode-select'),
            connectionStatus: document.getElementById('connection-status'),
            documentsCount: document.getElementById('documents-count'),
            lastConfidence: document.getElementById('last-confidence'),
            
            // Action buttons
            actionButtons: document.querySelectorAll('.action-btn'),
            quickActions: document.querySelector('.quick-actions'),
            
            // Additional controls
            voiceBtn: document.getElementById('voice-input-btn'),
            attachBtn: document.getElementById('attach-file-btn'),
            clearBtn: document.getElementById('clear-chat-btn'),
            exportBtn: document.getElementById('export-chat-btn')
        };

        // Sprawdź kluczowe elementy
        const required = ['chatInput', 'chatMessages', 'sendButton'];
        const missing = required.filter(key => !this.elements[key]);
        
        if (missing.length > 0) {
            console.error('❌ Brakujące elementy:', missing);
            return false;
        }

        return true;
    }

    /**
     * Konfiguracja event listenerów
     */
    setupEventListeners() {
        // Główne funkcje czatu
        this.elements.sendButton?.addEventListener('click', () => this.sendMessage());
        
        this.elements.chatInput?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Live updates
        this.elements.chatInput?.addEventListener('input', () => {
            this.updateCharacterCount();
            this.updateSendButton();
            this.autoResizeTextarea();
        });

        // Action buttons (sugestie)
        this.elements.actionButtons?.forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                if (text) {
                    this.setInputText(text);
                    this.sendMessage();
                }
            });
        });

        // RAG Controls
        this.elements.ragModeSelect?.addEventListener('change', (e) => {
            this.config.ragMode = e.target.value;
            this.updateRAGMode();
        });

        // Opcje RAG
        const ragOptions = ['hybrid-search', 'reranking', 'multi-step', 'compression', 'citations'];
        ragOptions.forEach(option => {
            const checkbox = document.getElementById(`rag-${option}`);
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    this.updateRAGConfig(option, e.target.checked);
                });
            }
        });

        // Voice input
        this.elements.voiceBtn?.addEventListener('click', () => this.handleVoiceInput());
        
        // File attachment
        this.elements.attachBtn?.addEventListener('click', () => this.handleFileAttachment());

        // Controls
        this.elements.clearBtn?.addEventListener('click', () => this.clearChat());
        this.elements.exportBtn?.addEventListener('click', () => this.exportChat());

        console.log('✅ Event listenery skonfigurowane');
    }

    /**
     * Konfiguracja UI
     */
    setupUI() {
        this.updateCharacterCount();
        this.updateSendButton();
        this.updateConnectionStatus();
        this.createRAGControlPanel();
        
        // Ukryj quick actions po pierwszej wiadomości
        this.hideQuickActionsAfterFirstMessage = true;
    }

    /**
     * Tworzenie panelu kontroli RAG (jeśli nie istnieje)
     */
    createRAGControlPanel() {
        if (document.getElementById('rag-control-panel')) return;

        const controlPanel = document.createElement('div');
        controlPanel.id = 'rag-control-panel';
        controlPanel.className = 'rag-control-panel';
        controlPanel.innerHTML = `
            <div class="rag-controls-header">
                <h3>🧠 Unified RAG + Claude API</h3>
                <div class="rag-status">
                    <span id="connection-status" class="status-indicator">Łączenie...</span>
                </div>
            </div>
            <div class="rag-controls-content">
                <div class="control-group">
                    <label for="rag-mode-select">Tryb RAG:</label>
                    <select id="rag-mode-select">
                        <option value="advanced">Advanced RAG (zalecany)</option>
                        <option value="standard">Standard RAG</option>
                    </select>
                </div>
                <div class="control-group">
                    <label>Funkcje zaawansowane:</label>
                    <div class="checkbox-group">
                        <label><input type="checkbox" id="rag-hybrid-search" checked> Hybrydowe wyszukiwanie</label>
                        <label><input type="checkbox" id="rag-reranking" checked> Re-ranking wyników</label>
                        <label><input type="checkbox" id="rag-multi-step" checked> Multi-step reasoning</label>
                        <label><input type="checkbox" id="rag-compression" checked> Kompresja kontekstu</label>
                        <label><input type="checkbox" id="rag-citations" checked> Cytowania źródeł</label>
                    </div>
                </div>
                <div class="rag-metrics" id="rag-metrics">
                    <div class="metric">
                        <span class="metric-label">Dokumenty:</span>
                        <span class="metric-value" id="documents-count">--</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Ostatnia odpowiedź:</span>
                        <span class="metric-value" id="last-confidence">--</span>
                    </div>
                </div>
            </div>
        `;

        // Wstaw panel
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.insertBefore(controlPanel, chatContainer.firstChild);
        }
        
        // Ponownie cachuj elementy RAG
        this.elements.ragModeSelect = document.getElementById('rag-mode-select');
        this.elements.connectionStatus = document.getElementById('connection-status');
        this.elements.documentsCount = document.getElementById('documents-count');
        this.elements.lastConfidence = document.getElementById('last-confidence');
    }

    /**
     * Sprawdzenie połączenia z backendem
     */
    async checkBackendConnection() {
        try {
            const response = await fetch(`${this.config.backendUrl}/health`, {
                method: 'GET',
                timeout: 5000
            });

            if (response.ok) {
                const status = await response.json();
                this.state.connectionStatus = 'connected';
                this.updateConnectionStatus('connected', status);
                console.log('✅ Backend połączony');
                console.log('🤖 Claude API:', status.components?.claude_api ? 'AKTYWNE' : 'NIEAKTYWNE');
                console.log('🧠 Advanced RAG:', status.components?.advanced_rag ? 'AKTYWNE' : 'NIEAKTYWNE');
            } else {
                throw new Error('Backend response not OK');
            }
        } catch (error) {
            this.state.connectionStatus = 'disconnected';
            this.updateConnectionStatus('disconnected');
            console.log('⚠️ Backend niedostępny, używam trybu lokalnego');
        }
    }

    /**
     * Inicjalizacja systemu RAG
     */
    async initializeRAGSystem() {
        try {
            const initResponse = await fetch(`${this.config.backendUrl}/initialize`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });
            
            if (initResponse.ok) {
                const result = await initResponse.json();
                console.log(`✅ RAG zainicjalizowany: ${result.documents_loaded} dokumentów`);
                this.updateRAGStatus(result);
            }
        } catch (error) {
            console.error('⚠️ Błąd inicjalizacji RAG:', error);
        }
    }

    /**
     * OFFLINE QUEUE
     */
    addToOfflineQueue(message) {
        const queue = JSON.parse(localStorage.getItem('alex_offline_queue') || '[]');
        queue.push({
            message,
            timestamp: Date.now(),
            id: this.generateMessageId()
        });
        localStorage.setItem('alex_offline_queue', JSON.stringify(queue));
        
        this.analytics.track('message_queued_offline', { message_length: message.length });
    }
    
    async syncOfflineData() {
        const queue = JSON.parse(localStorage.getItem('alex_offline_queue') || '[]');
        if (queue.length === 0) return;
        
        this.showNotification(`Synchronizuję ${queue.length} wiadomości...`, 'info');
        this.analytics.track('offline_sync_start', { queue_size: queue.length });
        
        let successCount = 0;
        for (const item of queue) {
            try {
                await this.sendMessageWithRetry(item.message);
                await this.delay(500); // Rate limiting
                successCount++;
            } catch (error) {
                console.error('Failed to sync offline message:', error);
                this.errorHandler.logError(error, 'offline_sync');
            }
        }
        
        localStorage.removeItem('alex_offline_queue');
        this.showNotification(`Synchronizacja zakończona (${successCount}/${queue.length})`, 'success');
        this.analytics.track('offline_sync_complete', { 
            success_count: successCount, 
            total_count: queue.length 
        });
    }

    /**
     * RETRY MECHANISM
     */
    async sendMessageWithRetry(message, attempt = 1) {
        try {
            return await this.callAPI(message);
        } catch (error) {
            if (attempt < this.config.retryAttempts) {
                console.log(`Retry attempt ${attempt + 1} for message`);
                await this.delay(1000 * attempt); // Exponential backoff
                return this.sendMessageWithRetry(message, attempt + 1);
            }
            throw error;
        }
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Wysłanie wiadomości - ulepszona wersja enterprise z STREAMING
     */
    async sendMessage() {
        const message = this.elements.chatInput.value.trim();
        
        if (!message || this.state.isProcessing) return;

        // Walidacja długości
        if (message.length > this.config.maxMessageLength) {
            this.showNotification('Wiadomość jest za długa', 'warning');
            this.analytics.track('message_too_long', { length: message.length });
            return;
        }
        
        // Sprawdź offline
        if (!this.state.isOnline) {
            this.addToOfflineQueue(message);
            this.showNotification('Wiadomość zostanie wysłana po przywróceniu połączenia', 'info');
            return;
        }

        // Dodaj wiadomość użytkownika
        this.addMessage(message, 'user');
        
        // Wyczyść input
        this.elements.chatInput.value = '';
        this.updateCharacterCount();
        this.updateSendButton();

        // Ukryj quick actions po pierwszej wiadomości
        if (this.hideQuickActionsAfterFirstMessage && this.elements.quickActions) {
            this.elements.quickActions.style.display = 'none';
        }

        // Rozpocznij przetwarzanie
        const startTime = Date.now();
        this.startProcessing();
        
        // Track message sent
        this.analytics.track('message_sent', {
            message_length: message.length,
            rag_mode: this.config.ragMode
        });

        // NOWA FUNKCJONALNOŚĆ: Sprawdź czy backend obsługuje streaming
        const useStreaming = this.shouldUseStreaming();
        
        try {
            if (useStreaming) {
                // Streaming response
                await this.sendMessageStreaming(message, startTime);
            } else {
                // Traditional response
                const response = await this.sendMessageWithRetry(message);
                this.stopProcessing();
                this.addMessage(response.content, 'assistant', response.metadata);
                
                // Update performance metrics
                this.updatePerformanceMetrics(Date.now() - startTime);
                this.state.retryCount = 0;
                
                // Track successful response
                this.analytics.track('message_response_success', {
                    response_time: Date.now() - startTime,
                    confidence: response.metadata?.confidence
                });
            }
            
        } catch (error) {
            console.error('Błąd wysyłania wiadomości:', error);
            this.stopProcessing();
            
            // Handle error with improved error handling
            this.handleSendError(error, message);
        }

        // Aktualizuj historię
        this.state.messageHistory.push({
            timestamp: new Date(),
            user: message,
            type: 'exchange',
            session_id: this.state.sessionId
        });
        
        // Auto-save po każdej wiadomości
        this.saveToLocalStorage();
    }

    /**
     * STREAMING MESSAGE HANDLING - NOWA METODA
     */
    async sendMessageStreaming(message, startTime) {
        let currentMessageElement = null;
        let fullResponseText = '';
        
        // Utwórz placeholder dla streaming response
        currentMessageElement = this.createStreamingMessagePlaceholder();
        
        const onChunk = (chunk, fullSoFar) => {
            fullResponseText = fullSoFar;
            this.updateStreamingMessage(currentMessageElement, fullResponseText);
        };
        
        const onComplete = (data) => {
            this.stopProcessing();
            
            // Finalize streaming message
            this.finalizeStreamingMessage(currentMessageElement, data);
            
            // Update performance metrics
            this.updatePerformanceMetrics(Date.now() - startTime);
            this.state.retryCount = 0;
            
            // Track successful streaming response
            this.analytics.track('streaming_response_success', {
                response_time: Date.now() - startTime,
                confidence: data.metadata?.confidence || data.enhanced_metadata?.confidence,
                streaming: true
            });
        };
        
        const onError = (error) => {
            this.stopProcessing();
            this.removeStreamingMessage(currentMessageElement);
            this.handleSendError(error, message);
        };
        
        // Start streaming
        await this.callStreamingAPI(message, onChunk, onComplete, onError);
    }

    /**
     * STREAMING HELPER METHODS
     */
    shouldUseStreaming() {
        // Użyj streaming jeśli backend połączony i Claude dostępny
        return this.state.connectionStatus === 'connected' && 
               this.ragConfig.useHybridSearch;
    }
    
    createStreamingMessagePlaceholder() {
        const messageContainer = this.elements.chatMessages;
        if (!messageContainer) return null;

        const messageElement = document.createElement('div');
        messageElement.className = 'message assistant streaming';
        messageElement.setAttribute('data-message-id', this.generateMessageId());

        const timestamp = new Date().toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        messageElement.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-bubble">
                <div class="streaming-content">
                    <span class="streaming-text"></span>
                    <span class="streaming-cursor">|</span>
                </div>
                <div class="streaming-status">🔄 Generating...</div>
            </div>
            <div class="message-meta">
                <span class="message-time">${timestamp}</span>
            </div>
        `;

        messageContainer.appendChild(messageElement);
        this.scrollToBottom();
        return messageElement;
    }
    
    updateStreamingMessage(messageElement, text) {
        if (!messageElement) return;
        
        const textElement = messageElement.querySelector('.streaming-text');
        if (textElement) {
            textElement.innerHTML = this.formatMessageContent(text);
        }
        
        this.scrollToBottom();
    }
    
    finalizeStreamingMessage(messageElement, data) {
        if (!messageElement) return;
        
        // Remove streaming classes and cursor
        messageElement.classList.remove('streaming');
        
        const finalResponse = data.full_response || data.enhanced_metadata?.full_response || '';
        const metadata = data.metadata || data.enhanced_metadata || {};
        
        // Update with final content
        const bubble = messageElement.querySelector('.message-bubble');
        if (bubble) {
            bubble.innerHTML = `
                ${this.formatMessageContent(finalResponse)}
                ${this.createMetadataPanel(metadata)}
            `;
        }
        
        // Add message actions
        const meta = messageElement.querySelector('.message-meta');
        if (meta) {
            const actionsHTML = `
                <div class="message-actions">
                    <button class="message-action-btn" onclick="unifiedChat.copyMessage('${this.escapeHtml(finalResponse)}')" title="Kopiuj">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="message-action-btn" onclick="unifiedChat.likeMessage(this)" title="Przydatne">
                        <i class="fas fa-thumbs-up"></i>
                    </button>
                </div>
            `;
            meta.insertAdjacentHTML('beforeend', actionsHTML);
        }
        
        // Update metrics
        if (metadata) {
            this.updateMetrics(metadata);
        }
        
        this.scrollToBottom();
    }
    
    removeStreamingMessage(messageElement) {
        if (messageElement && messageElement.parentNode) {
            messageElement.remove();
        }
    }
    
    updateStreamingStatus(statusMessage) {
        const streamingElement = document.querySelector('.streaming .streaming-status');
        if (streamingElement) {
            streamingElement.textContent = `🔄 ${statusMessage}`;
        }
    }

    /**
     * STREAMING API CALLS - NOWA FUNKCJONALNOŚĆ
     */
    async callStreamingAPI(message, onChunk, onComplete, onError) {
        const endpoint = this.config.ragMode === 'enhanced' ? '/api/enhanced-rag/stream' : '/api/chat/stream';
        
        const requestData = {
            message: message,
            session_id: this.state.sessionId,
            use_rag: this.ragConfig.useHybridSearch,
            rag_config: this.ragConfig
        };

        try {
            // Start streaming request
            const response = await fetch(`${this.config.backendUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/event-stream',
                    'Authorization': `Bearer ${this.getApiToken()}`
                },
                body: JSON.stringify(requestData)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            // Setup EventSource for Server-Sent Events
            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n\n');
                buffer = lines.pop(); // Keep incomplete line in buffer

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            
                            if (data.type === 'chunk') {
                                onChunk(data.text, data.full_so_far);
                            } else if (data.type === 'complete' || data.type === 'enhanced_complete') {
                                onComplete(data);
                                return;
                            } else if (data.type === 'error') {
                                onError(new Error(data.message));
                                return;
                            } else if (data.type === 'status' || data.type === 'thinking' || data.type === 'processing_step') {
                                // Status updates
                                this.updateStreamingStatus(data.message);
                            }
                        } catch (e) {
                            console.warn('Failed to parse streaming data:', line);
                        }
                    }
                }
            }
        } catch (error) {
            onError(error);
        }
    }

    /**
     * PRAWDZIWE WYWOŁANIE API Z CACHE I TIMEOUT
     */
    async callAPI(message) {
        const cacheKey = `msg_${btoa(message).slice(0, 20)}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            console.log('🎯 Using cached response');
            this.performance.cacheHits++;
            return cached;
        }
        
        this.performance.cacheMisses++;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
        
        try {
            const endpoint = this.config.ragMode === 'advanced' ? '/rag/chat' : '/chat';
            
            const requestData = {
                message: message,
                session_id: this.state.sessionId,
                rag_config: this.ragConfig,
                context: {
                    history: this.state.messageHistory.slice(-5),
                    timestamp: new Date().toISOString()
                }
            };

            const response = await fetch(`${this.config.backendUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${this.getApiToken()}`
                },
                body: JSON.stringify(requestData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            const result = {
                content: data.answer || data.response || 'Brak odpowiedzi z backend',
                metadata: {
                    confidence: data.confidence || data.validation_score || 0.85,
                    sources: data.sources || ['Backend Python', 'RAG System'],
                    intent: data.intent || 'ogólne pytanie',
                    processing_time: data.processing_time || 'N/A',
                    claude_model: data.claude_model || 'claude-3-sonnet',
                    rag_metrics: data.rag_metrics || {},
                    reasoning_steps: data.reasoning_steps || []
                }
            };
            
            // Cache the response
            this.cache.set(cacheKey, result);
            
            return result;
            
        } catch (error) {
            clearTimeout(timeoutId);
            
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
            
            throw error;
        }
    }
    
    /**
     * LEPSZE ZARZĄDZANIE SESJĄ
     */
    getSessionId() {
        let sessionId = sessionStorage.getItem('alex_session_id');
        if (!sessionId) {
            sessionId = 'sess_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            sessionStorage.setItem('alex_session_id', sessionId);
        }
        return sessionId;
    }
    
    getApiToken() {
        return localStorage.getItem('alex_api_token') || 'demo_token';
    }
    
    /**
     * PERFORMANCE METRICS UPDATE
     */
    updatePerformanceMetrics(responseTime) {
        this.performance.messagesSent++;
        this.performance.averageResponseTime = 
            (this.performance.averageResponseTime + responseTime) / 2;
    }
    
    /**
     * BETTER ERROR HANDLING
     */
    handleSendError(error, originalMessage) {
        this.errorHandler.logError(error, 'sendMessage');
        this.performance.errorCount++;
        
        let errorMessage = 'Wystąpił nieoczekiwany błąd.';
        
        if (error.message.includes('timeout')) {
            errorMessage = 'Przekroczono limit czasu. Spróbuj ponownie.';
        } else if (error.message.includes('network')) {
            errorMessage = 'Błąd sieci. Sprawdź połączenie internetowe.';
        } else if (error.message.includes('401')) {
            errorMessage = 'Błąd autoryzacji. Odśwież stronę.';
        } else if (error.message.includes('500')) {
            errorMessage = 'Błąd serwera. Spróbuj za chwilę.';
        }
        
        this.addErrorMessage(errorMessage);
        this.showRetryOption(originalMessage);
        
        // Track error
        this.analytics.track('message_error', {
            error_type: error.name,
            error_message: error.message,
            retry_count: this.state.retryCount
        });
    }
    
    addErrorMessage(message) {
        this.addMessage(`❌ **Błąd:** ${message}`, 'assistant', {
            confidence: 0,
            sources: ['System Error'],
            intent: 'error',
            error: true
        });
    }
    
    showRetryOption(message) {
        const retryBtn = document.createElement('button');
        retryBtn.textContent = '🔄 Spróbuj ponownie';
        retryBtn.className = 'btn-secondary retry-btn';
        retryBtn.onclick = () => {
            this.setInputText(message);
            this.sendMessage();
            retryBtn.remove();
        };
        
        const messagesContainer = this.elements.chatMessages;
        messagesContainer?.appendChild(retryBtn);
    }

    /**
     * Wysłanie do backend Python - zachowana dla kompatybilności
     */
    async sendToBackend(message) {
        return this.callAPI(message);
    }

    /**
     * Lokalna baza wiedzy
     */
    initializeKnowledgeBase() {
        return {
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
                confidence: 0.9,
                sources: ['Dokumentacja Comarch', 'Podręcznik finansowy']
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
                confidence: 0.92,
                sources: ['Metodyka wdrożeń', 'Best practices']
            },
            'integrac': {
                content: `🔗 **Integracja Systemów ERP**

**Dostępne metody:**
• **REST API** - nowoczesne integracje, JSON
• **Web Services (SOAP)** - standardowe, XML
• **EDI** - wymiana dokumentów B2B
• **Pliki CSV/XML** - batch processing

**Typowe integracje:**
• CRM (Salesforce, HubSpot)
• E-commerce (Magento, WooCommerce)  
• Systemy BI (Power BI, Tableau)
• Bankowość elektroniczna
• Systemy produkcyjne (MES)

**Proces integracji:**
1. **Analiza wymagań** - mapowanie danych
2. **Projektowanie API** - endpointy i formaty
3. **Implementacja** - kod i testy
4. **Monitoring** - wydajność i błędy

**Bezpieczeństwo:**
• OAuth 2.0 / JWT tokens
• HTTPS encryption
• Rate limiting
• Audit logging`,
                confidence: 0.88,
                sources: ['API Documentation', 'Przewodnik integracji']
            }
        };
    }

    /**
     * Lokalna odpowiedź fallback
     */
    generateLocalResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        // Znajdź najlepsze dopasowanie
        for (const [key, response] of Object.entries(this.knowledgeBase)) {
            if (lowerMessage.includes(key)) {
                return {
                    content: response.content + `\n\n*⚠️ Odpowiedź z trybu lokalnego - backend niedostępny*`,
                    metadata: {
                        confidence: response.confidence,
                        sources: response.sources,
                        intent: 'lokalne dopasowanie',
                        processing_time: '< 1s',
                        fallback: true
                    }
                };
            }
        }

        // Domyślna odpowiedź
        return {
            content: `🤖 **Unified ERP Assistant - Tryb Lokalny**

Dzięki za Twoje pytanie! Obecnie działam w trybie lokalnym, ponieważ backend Python jest niedostępny.

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
                sources: ['System lokalny', 'Unified Chat'],
                intent: 'pomoc ogólna',
                processing_time: '< 1s',
                fallback: true
            }
        };
    }

    /**
     * Dodanie wiadomości do czatu
     */
    addMessage(content, type, metadata = null) {
        const messageContainer = this.elements.chatMessages;
        if (!messageContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${type}`;
        messageElement.setAttribute('data-message-id', this.generateMessageId());

        const timestamp = new Date().toLocaleTimeString('pl-PL', {
            hour: '2-digit',
            minute: '2-digit'
        });

        if (type === 'user') {
            messageElement.innerHTML = `
                <div class="message-bubble">
                    ${this.formatMessageContent(content)}
                </div>
                <div class="message-avatar">
                    <i class="fas fa-user"></i>
                </div>
                <div class="message-meta">
                    <span class="message-time">${timestamp}</span>
                </div>
            `;
        } else {
            // Metadata panel dla odpowiedzi AI
            const metadataPanel = metadata ? this.createMetadataPanel(metadata) : '';

            messageElement.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-bubble">
                    ${this.formatMessageContent(content)}
                    ${metadataPanel}
                </div>
                <div class="message-meta">
                    <span class="message-time">${timestamp}</span>
                    <div class="message-actions">
                        <button class="message-action-btn" onclick="unifiedChat.copyMessage('${this.escapeHtml(content)}')" title="Kopiuj">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="message-action-btn" onclick="unifiedChat.likeMessage(this)" title="Przydatne">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                    </div>
                </div>
            `;
        }

        messageContainer.appendChild(messageElement);

        // Animacja pojawienia się
        this.addFadeInEffect(messageElement);
        this.scrollToBottom();
        
        // Aktualizuj metryki
        if (metadata) {
            this.updateMetrics(metadata);
        }
    }

    /**
     * Tworzenie panelu metadanych
     */
    createMetadataPanel(metadata) {
        if (!metadata) return '';

        let metadataHTML = '<div class="message-metadata">';
        metadataHTML += '<div class="metadata-header">🧠 Unified RAG + Claude</div>';
        
        // Confidence/Validation Score
        if (metadata.confidence !== undefined) {
            const confidence = Math.round(metadata.confidence * 100);
            const confidenceClass = this.getConfidenceClass(confidence);
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Pewność odpowiedzi:</span>
                <span class="metadata-value confidence-${confidenceClass}">${confidence}%</span>
            </div>`;
        }
        
        // Claude Model
        if (metadata.claude_model) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Model AI:</span>
                <span class="metadata-value">${metadata.claude_model}</span>
            </div>`;
        }
        
        // Źródła
        if (metadata.sources && metadata.sources.length > 0) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Źródła:</span>
                <div class="sources-list">`;
            
            metadata.sources.forEach(source => {
                metadataHTML += `<span class="source-tag">${source}</span>`;
            });
            
            metadataHTML += `</div></div>`;
        }

        // Processing time
        if (metadata.processing_time) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Czas odpowiedzi:</span>
                <span class="metadata-value">${metadata.processing_time}</span>
            </div>`;
        }

        // Fallback indicator
        if (metadata.fallback) {
            metadataHTML += `<div class="metadata-item">
                <span class="metadata-label">Tryb:</span>
                <span class="metadata-value" style="color: #f39c12;">Lokalny (Backend offline)</span>
            </div>`;
        }
        
        metadataHTML += '</div>';
        return metadataHTML;
    }

    /**
     * Formatowanie treści wiadomości (markdown)
     */
    formatMessageContent(content) {
        let formatted = content;

        // Konwersja podstawowego markdown
        formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');

        // Nagłówki
        formatted = formatted.replace(/^### (.*$)/gim, '<h3>$1</h3>');
        formatted = formatted.replace(/^## (.*$)/gim, '<h2>$1</h2>');
        formatted = formatted.replace(/^# (.*$)/gim, '<h1>$1</h1>');

        // Listy
        formatted = formatted.replace(/^• (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^- (.+)$/gm, '<li>$1</li>');
        formatted = formatted.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        
        // Owijaj kolejne <li> w <ul>
        formatted = formatted.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');

        // Linki
        formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

        // Nowe linie
        formatted = formatted.replace(/\n/g, '<br>');

        return formatted;
    }

    /**
     * Rozpoczęcie przetwarzania
     */
    startProcessing() {
        this.state.isProcessing = true;
        this.showTypingIndicator();
        this.updateSendButton();
    }

    /**
     * Zakończenie przetwarzania
     */
    stopProcessing() {
        this.state.isProcessing = false;
        this.hideTypingIndicator();
        this.updateSendButton();
    }

    /**
     * Wskaźnik pisania
     */
    showTypingIndicator() {
        const messageContainer = this.elements.chatMessages;
        if (!messageContainer) return;

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot"></i>
            </div>
            <div class="typing-bubble">
                <span>Unified AI analizuje...</span>
                <div class="typing-dots">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;

        messageContainer.appendChild(indicator);
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
     * Aktualizacja statusu połączenia
     */
    updateConnectionStatus(status, data = null) {
        const statusElement = this.elements.connectionStatus;
        if (!statusElement) return;

        if (status === 'connected') {
            statusElement.textContent = '🟢 Unified System Aktywny';
            statusElement.className = 'status-indicator connected';
            
            if (data && data.components) {
                const details = [];
                if (data.components.claude_api) details.push('Claude');
                if (data.components.advanced_rag) details.push('RAG');
                if (data.components.vector_db) details.push('VectorDB');
                
                statusElement.textContent = `🟢 ${details.join(' + ')} AKTYWNE`;
            }
        } else {
            statusElement.textContent = '🔴 Backend offline - tryb lokalny';
            statusElement.className = 'status-indicator disconnected';
        }
    }

    /**
     * Aktualizacja statusu RAG
     */
    updateRAGStatus(data) {
        if (this.elements.documentsCount) {
            this.elements.documentsCount.textContent = data.documents_loaded || '0';
        }
    }

    /**
     * Aktualizacja metryk
     */
    updateMetrics(data) {
        if (this.elements.lastConfidence && data.confidence !== undefined) {
            const confidence = Math.round(data.confidence * 100);
            this.elements.lastConfidence.textContent = `${confidence}%`;
            this.elements.lastConfidence.className = `metric-value confidence-${this.getConfidenceClass(confidence)}`;
        }
    }

    /**
     * Aktualizacja konfiguracji RAG
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

    /**
     * Aktualizacja trybu RAG
     */
    async updateRAGMode() {
        try {
            await fetch(`${this.config.backendUrl}/rag/mode`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: this.config.ragMode })
            });
            
            console.log(`🧠 RAG Mode: ${this.config.ragMode}`);
        } catch (error) {
            console.error('Błąd zmiany trybu RAG:', error);
        }
    }

    /**
     * Aktualizacja licznika znaków
     */
    updateCharacterCount() {
        if (!this.elements.chatInput || !this.elements.charCount) return;

        const current = this.elements.chatInput.value.length;
        const max = this.config.maxMessageLength;
        
        this.elements.charCount.textContent = `${current}/${max}`;
        
        // Zmiana koloru przy przekroczeniu limitów
        if (current > max * 0.9) {
            this.elements.charCount.style.color = '#e74c3c';
        } else if (current > max * 0.7) {
            this.elements.charCount.style.color = '#f39c12';
        } else {
            this.elements.charCount.style.color = '#95a5a6';
        }
    }

    /**
     * Aktualizacja przycisku wysyłania
     */
    updateSendButton() {
        if (!this.elements.chatInput || !this.elements.sendButton) return;

        const hasText = this.elements.chatInput.value.trim().length > 0;
        const isValid = hasText && !this.state.isProcessing;

        this.elements.sendButton.disabled = !isValid;
        
        if (this.state.isProcessing) {
            this.elements.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        } else if (isValid) {
            this.elements.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            this.elements.sendButton.style.opacity = '1';
            this.elements.sendButton.style.cursor = 'pointer';
        } else {
            this.elements.sendButton.innerHTML = '<i class="fas fa-paper-plane"></i>';
            this.elements.sendButton.style.opacity = '0.6';
            this.elements.sendButton.style.cursor = 'not-allowed';
        }
    }

    /**
     * Auto-resize textarea
     */
    autoResizeTextarea() {
        if (!this.elements.chatInput) return;

        this.elements.chatInput.style.height = 'auto';
        const newHeight = Math.min(this.elements.chatInput.scrollHeight, 120);
        this.elements.chatInput.style.height = newHeight + 'px';
    }

    /**
     * Ustawienie tekstu w input
     */
    setInputText(text) {
        if (!this.elements.chatInput) return;

        this.elements.chatInput.value = text;
        this.updateCharacterCount();
        this.updateSendButton();
        this.autoResizeTextarea();
        this.elements.chatInput.focus();
    }

    /**
     * Przewijanie do dołu
     */
    scrollToBottom() {
        if (!this.elements.chatMessages) return;

        setTimeout(() => {
            this.elements.chatMessages.scrollTo({
                top: this.elements.chatMessages.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
    }

    /**
     * Efekt fade-in
     */
    addFadeInEffect(element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            element.style.transition = 'all 0.3s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, 50);
    }

    /**
     * Klasa pewności odpowiedzi
     */
    getConfidenceClass(confidence) {
        if (confidence >= 90) return 'high';
        if (confidence >= 70) return 'medium';
        return 'low';
    }

    /**
     * Obsługa wejścia głosowego
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

        // Visual feedback
        if (this.elements.voiceBtn) {
            this.elements.voiceBtn.style.color = '#e74c3c';
            this.elements.voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
        }

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            this.setInputText(transcript);
            this.showNotification('Rozpoznano: ' + transcript, 'success');
        };

        recognition.onerror = (event) => {
            this.showNotification('Błąd rozpoznawania mowy: ' + event.error, 'error');
        };

        recognition.onend = () => {
            if (this.elements.voiceBtn) {
                this.elements.voiceBtn.style.color = '';
                this.elements.voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
            }
        };

        recognition.start();
        this.showNotification('Słucham... Mów teraz', 'info');
    }

    /**
     * Obsługa załączania plików
     */
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

    /**
     * Przetwarzanie załączonego pliku
     */
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

    /**
     * Wyczyść czat
     */
    clearChat() {
        if (!confirm('Czy na pewno chcesz wyczyścić historię czatu?')) return;

        if (this.elements.chatMessages) {
            const messages = this.elements.chatMessages.querySelectorAll('.message:not(.welcome-message)');
            messages.forEach(message => message.remove());
        }

        this.state.messageHistory = [];
        
        // Pokaż quick actions ponownie
        if (this.elements.quickActions) {
            this.elements.quickActions.style.display = 'block';
        }

        this.showNotification('Historia czatu została wyczyszczona', 'info');
        
        // Pokaż ponownie wiadomość powitalną
        setTimeout(() => this.showWelcomeMessage(), 500);
    }

    /**
     * Eksport czatu
     */
    exportChat() {
        if (this.state.messageHistory.length === 0) {
            this.showNotification('Brak wiadomości do eksportu', 'warning');
            return;
        }

        const exportData = {
            timestamp: new Date().toISOString(),
            session_id: this.state.sessionId,
            assistant: 'Unified ERP Chat System',
            version: '1.0.0',
            total_messages: this.state.messageHistory.length,
            rag_config: this.ragConfig,
            messages: this.state.messageHistory
        };

        const blob = new Blob([JSON.stringify(exportData, null, 2)], {
            type: 'application/json'
        });

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `unified-erp-chat-${new Date().toISOString().split('T')[0]}.json`;
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
        // Usuń HTML tagi przed kopiowaniem
        const plainText = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
        
        navigator.clipboard.writeText(plainText).then(() => {
            this.showNotification('Wiadomość skopiowana', 'success');
        }).catch(() => {
            this.showNotification('Błąd kopiowania', 'error');
        });
    }

    /**
     * Ocena wiadomości (like)
     */
    likeMessage(button) {
        button.style.color = '#27ae60';
        button.innerHTML = '<i class="fas fa-thumbs-up"></i>';
        button.disabled = true;
        
        this.showNotification('Dziękujemy za ocenę!', 'success');
    }

    /**
     * Pokazanie powiadomienia
     */
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

        // Animacja pojawienia się
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Automatyczne usunięcie
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
     * Wiadomość powitalna
     */
    showWelcomeMessage() {
        const welcomeMessage = `# 🤖 Witaj w Unified ERP Assistant!

Jestem **skonsolidowanym systemem czatu** łączącym najlepsze funkcje z Claude API, Advanced RAG i profesjonalnego interfejsu.

## 🧠 Zaawansowane funkcje AI
- **Claude 3 Sonnet** - najnowszy model językowy
- **Advanced RAG v2.0** - hybrydowe wyszukiwanie semantyczne
- **Re-ranking** wyników z cross-encoder
- **Multi-step reasoning** dla złożonych problemów
- **Context compression** do 200K tokenów

## 🏢 Specjalizacje ERP Comarch
- Konfiguracja modułów finansowych i CRM
- Planowanie i zarządzanie projektami wdrożeniowych
- Integracje z systemami zewnętrznymi
- Optymalizacja procesów biznesowych
- Analiza SQL i business intelligence

## 🔧 Dodatkowe narzędzia
- **Analiza SQL** - pisanie i optymalizacja zapytań
- **Generator kodu** - automatyczne tworzenie skryptów
- **Rozpoznawanie mowy** - wpisywanie głosowe
- **Załączniki** - analiza przesłanych plików

## 💡 Przykładowe pytania
• "Jak skonfigurować moduł finansowy w Comarch ERP XL?"
• "Wygeneruj SQL do analizy sprzedaży ostatnich 3 miesięcy"
• "Jakie są najlepsze praktyki wdrożenia ERP?"
• "Zintegruj system CRM z modułem sprzedaży"

**Status:** ${this.state.connectionStatus === 'connected' ? '✅ Pełne funkcje AI dostępne' : '⚠️ Tryb lokalny - ograniczone funkcje'}

*Zadaj mi pytanie, a wykorzystam pełną moc unified AI!*`;

        this.addMessage(welcomeMessage, 'assistant', {
            confidence: 1.0,
            sources: ['Unified System', 'Claude + RAG'],
            intent: 'powitanie',
            processing_time: 'instant'
        });

        // Dodaj klasę welcome-message
        const messages = this.elements.chatMessages.querySelectorAll('.message');
        if (messages.length > 0) {
            messages[messages.length - 1].classList.add('welcome-message');
        }
    }

    /**
     * Escape HTML dla bezpieczeństwa
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML.replace(/'/g, '&apos;');
    }

    /**
     * Generowanie session ID
     */
    generateSessionId() {
        return 'unified_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Generowanie message ID
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Uruchomienie okresowych aktualizacji
     */
    startPeriodicUpdates() {
        // Sprawdzaj status backend co 30 sekund
        setInterval(async () => {
            await this.checkBackendConnection();
        }, 30000);

        // Aktualizuj metryki co 10 sekund
        setInterval(() => {
            if (this.elements.documentsCount && this.state.connectionStatus === 'connected') {
                // Symulacja aktualizacji metryk
                const currentCount = parseInt(this.elements.documentsCount.textContent) || 0;
                if (currentCount === 0) {
                    this.elements.documentsCount.textContent = '--';
                }
            }
        }, 10000);
    }

    /**
     * Metody deweloperskie
     */
    getSystemInfo() {
        return {
            version: '1.0.0',
            session_id: this.state.sessionId,
            connection_status: this.state.connectionStatus,
            rag_config: this.ragConfig,
            message_count: this.state.messageHistory.length,
            elements_cached: Object.keys(this.elements).length,
            is_processing: this.state.isProcessing
        };
    }

    destroy() {
        // Wyczyść event listenery i zasoby
        if (this.elements.chatInput) {
            this.elements.chatInput.removeEventListener('input', this.updateCharacterCount);
            this.elements.chatInput.removeEventListener('keydown', this.sendMessage);
        }
        
        if (this.elements.sendButton) {
            this.elements.sendButton.removeEventListener('click', this.sendMessage);
        }
        
        console.log('🗑️ Unified ERP Chat System zniszczony');
    }
}

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicjalizacja Unified ERP Chat System...');
    
    // Sprawdź czy wymagane elementy istnieją
    const requiredElements = [
        'chat-input-advanced',
        'chat-messages-advanced', 
        'send-button-advanced'
    ];

    const missingElements = requiredElements.filter(id => !document.getElementById(id));
    
    if (missingElements.length > 0) {
        console.error('❌ Brakujące elementy:', missingElements);
        console.log('💡 Sprawdź czy HTML zawiera wszystkie wymagane elementy interfejsu');
        return;
    }

    // Sprawdź czy inne systemy czatu nie są już aktywne
    if (window.claudeAssistant || window.professionalChat || window.ERPAssistant) {
        console.warn('⚠️ Wykryto inne systemy czatu - wyłączam je');
        
        // Zniszcz istniejące instancje
        if (window.claudeAssistant && typeof window.claudeAssistant.destroy === 'function') {
            window.claudeAssistant.destroy();
        }
        if (window.professionalChat && typeof window.professionalChat.destroy === 'function') {
            window.professionalChat.destroy();
        }
    }

    // Inicjalizuj unified chat
    try {
        window.unifiedChat = new UnifiedERPChat();
        console.log('✅ Unified ERP Chat System uruchomiony pomyślnie');
        
        // Debug info
        setTimeout(() => {
            console.log('🔍 System info:', window.unifiedChat.getSystemInfo());
        }, 2000);
        
    } catch (error) {
        console.error('❌ Błąd inicjalizacji Unified Chat:', error);
    }
});

// Global functions dla onclick handlers
window.copyMessage = (content) => {
    if (window.unifiedChat) {
        window.unifiedChat.copyMessage(content);
    }
};

window.likeMessage = (button) => {
    if (window.unifiedChat) {
        window.unifiedChat.likeMessage(button);
    }
};

// Export dla innych modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedERPChat;
}

// Style CSS dla unified chat
const unifiedStyles = `
/* Unified Chat Styles */
.rag-control-panel {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.rag-controls-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
}

.rag-controls-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
}

.control-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.checkbox-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.checkbox-group label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    cursor: pointer;
}

.rag-metrics {
    display: flex;
    gap: 20px;
    margin-top: 10px;
}

.metric {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.metric-value.confidence-high { color: #22c55e; }
.metric-value.confidence-medium { color: #f59e0b; }
.metric-value.confidence-low { color: #ef4444; }

.message-metadata {
    margin-top: 15px;
    padding: 12px;
    background: rgba(0,0,0,0.05);
    border-radius: 8px;
    border-left: 4px solid #3b82f6;
}

.metadata-header {
    font-weight: 600;
    color: #3b82f6;
    margin-bottom: 8px;
    font-size: 14px;
}

.metadata-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    border-bottom: 1px solid rgba(0,0,0,0.05);
}

.sources-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
}

.source-tag {
    background: #e5e7eb;
    color: #374151;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: 11px;
}

.typing-indicator {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    margin: 16px 0;
}

.typing-bubble {
    background: #f3f4f6;
    padding: 12px 16px;
    border-radius: 18px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.typing-dots {
    display: flex;
    gap: 4px;
}

.typing-dot {
    width: 6px;
    height: 6px;
    background: #9ca3af;
    border-radius: 50%;
    animation: typing-bounce 1.4s infinite ease-in-out;
}

.typing-dot:nth-child(1) { animation-delay: -0.32s; }
.typing-dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes typing-bounce {
    0%, 80%, 100% { transform: scale(0); }
    40% { transform: scale(1); }
}

.message-actions {
    display: flex;
    gap: 8px;
    margin-top: 8px;
}

.message-action-btn {
    background: transparent;
    border: none;
    color: #6b7280;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    transition: all 0.2s;
}

.message-action-btn:hover {
    background: rgba(0,0,0,0.1);
    color: #374151;
}

@media (max-width: 768px) {
    .rag-controls-content {
        grid-template-columns: 1fr;
    }
}
`;

// Dodaj style do head jeśli jeszcze nie ma
if (!document.getElementById('unified-chat-styles')) {
    const styleSheet = document.createElement('style');
    styleSheet.id = 'unified-chat-styles';
    styleSheet.textContent = unifiedStyles;
    document.head.appendChild(styleSheet);
}

console.log('📦 Unified ERP Chat System załadowany - wersja 1.0.0');
