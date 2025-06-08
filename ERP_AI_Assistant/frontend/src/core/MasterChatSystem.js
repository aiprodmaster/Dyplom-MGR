/**
 * 🏗️ MASTER CHAT SYSTEM - CORE CONTROLLER
 * Główny kontroler aplikacji eliminujący konflikty DOM i zarządzający wszystkimi modułami
 * 
 * @version 2.0.0
 * @author ERP AI Assistant Team
 * @date 2025-06-07
 */

import { EventBus } from './EventBus.js';
import { DOMManager } from './DOMManager.js';
import { StateManager } from './StateManager.js';
import { ConfigManager } from './ConfigManager.js';
import { ErrorHandler } from '../services/ErrorHandler.js';
import { APIService } from '../services/APIService.js';
import { PerformanceMonitor } from '../services/PerformanceMonitor.js';

/**
 * MasterChatSystem - Singleton kontroler zarządzający całym systemem
 * Eliminuje konflikty DOM i zapewnia centralne zarządzanie
 */
class MasterChatSystem {
    constructor() {
        // Singleton pattern implementation
        if (MasterChatSystem.instance) {
            console.log('🔄 MasterChatSystem: Returning existing instance');
            return MasterChatSystem.instance;
        }

        console.log('🚀 MasterChatSystem: Initializing new instance');
        
        // Core system state
        this.initialized = false;
        this.isDestroying = false;
        this.startTime = Date.now();
        
        // Core services initialization
        this.eventBus = new EventBus();
        this.configManager = new ConfigManager();
        this.stateManager = new StateManager(this.eventBus);
        this.domManager = new DOMManager(this.eventBus);
        this.errorHandler = new ErrorHandler(this.eventBus);
        this.apiService = new APIService(this.configManager);
        this.performanceMonitor = new PerformanceMonitor(this.eventBus);
        
        // Module registry
        this.modules = new Map();
        this.services = new Map();
        this.activeComponents = new Set();
        
        // Bind methods to preserve context
        this.handleMessage = this.handleMessage.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.handleVisibilityChange = this.handleVisibilityChange.bind(this);
        this.handleBeforeUnload = this.handleBeforeUnload.bind(this);
        
        // Set singleton instance
        MasterChatSystem.instance = this;
        
        // Global error handling
        this.setupGlobalErrorHandling();
        
        return this;
    }

    /**
     * Główna metoda inicjalizacji systemu
     * Wykonuje pełną sekwencję uruchomienia z error handling
     */
    async initialize() {
        if (this.initialized) {
            console.log('⚠️ MasterChatSystem: Already initialized');
            return this;
        }

        if (this.isDestroying) {
            console.log('⚠️ MasterChatSystem: Cannot initialize during destruction');
            return this;
        }

        const initStartTime = performance.now();
        
        try {
            console.log('🏗️ MasterChatSystem: Starting initialization sequence...');
            
            // Phase 1: Cleanup and conflict resolution
            await this.cleanupPreviousInstances();
            
            // Phase 2: Core systems initialization
            await this.initializeCore();
            
            // Phase 3: DOM setup and management
            await this.setupDOM();
            
            // Phase 4: Load and register modules
            await this.loadModules();
            
            // Phase 5: Services activation
            await this.startServices();
            
            // Phase 6: Event listeners setup
            await this.setupEventListeners();
            
            // Phase 7: Health checks and validation
            await this.performHealthChecks();
            
            // Mark as initialized
            this.initialized = true;
            const initTime = performance.now() - initStartTime;
            
            console.log(`✅ MasterChatSystem: Initialized successfully in ${initTime.toFixed(2)}ms`);
            
            // Emit system ready event
            this.eventBus.emit('system:initialized', {
                initTime,
                timestamp: Date.now(),
                modules: Array.from(this.modules.keys()),
                services: Array.from(this.services.keys())
            });
            
            // Start performance monitoring
            this.performanceMonitor.startMonitoring();
            
            return this;
            
        } catch (error) {
            this.errorHandler.handleCriticalError('System initialization failed', error);
            throw error;
        }
    }

    /**
     * Czyści poprzednie instancje systemów czatu i rozwiązuje konflikty
     */
    async cleanupPreviousInstances() {
        console.log('🧹 MasterChatSystem: Cleaning up previous instances...');
        
        try {
            // Remove legacy chat systems
            const legacySystems = [
                'claudeAssistant',
                'professionalChat',
                'unifiedChat',
                'basicChat'
            ];
            
            for (const systemName of legacySystems) {
                if (window[systemName]) {
                    console.log(`🗑️ Cleaning up legacy system: ${systemName}`);
                    
                    // Call destroy method if available
                    if (typeof window[systemName].destroy === 'function') {
                        await window[systemName].destroy();
                    }
                    
                    // Remove from global scope
                    delete window[systemName];
                }
            }
            
            // Clear DOM conflicts
            await this.domManager.clearConflicts();
            
            // Remove conflicting event listeners
            this.removeConflictingEventListeners();
            
            // Clear any existing intervals/timeouts
            this.clearExistingTimers();
            
            console.log('✅ Previous instances cleaned up successfully');
            
        } catch (error) {
            console.warn('⚠️ Error during cleanup:', error);
            // Don't throw - cleanup errors shouldn't prevent initialization
        }
    }

    /**
     * Inicjalizuje podstawowe systemy core
     */
    async initializeCore() {
        console.log('🔧 MasterChatSystem: Initializing core systems...');
        
        // Initialize configuration
        await this.configManager.initialize();
        
        // Initialize state management
        await this.stateManager.initialize();
        
        // Initialize error handling
        await this.errorHandler.initialize();
        
        // Initialize API service
        await this.apiService.initialize();
        
        // Set up core event handlers
        this.eventBus.on('config:changed', this.handleConfigChange.bind(this));
        this.eventBus.on('error:critical', this.handleCriticalError.bind(this));
        this.eventBus.on('state:changed', this.handleStateChange.bind(this));
        
        console.log('✅ Core systems initialized');
    }

    /**
     * Konfiguruje zarządzanie DOM i rozwiązuje konflikty
     */
    async setupDOM() {
        console.log('🎨 MasterChatSystem: Setting up DOM management...');
        
        // Initialize DOM manager
        await this.domManager.initialize();
        
        // Ensure unique element IDs
        this.domManager.ensureUniqueIds();
        
        // Setup DOM observer for conflicts detection
        this.domManager.setupConflictDetection();
        
        // Register DOM elements
        this.registerDOMElements();
        
        console.log('✅ DOM management configured');
    }

    /**
     * Ładuje i rejestruje moduły funkcjonalne
     */
    async loadModules() {
        console.log('🧩 MasterChatSystem: Loading functional modules...');
        
        const moduleConfig = this.configManager.get('modules');
        const modulesToLoad = [
            { name: 'ChatInterface', enabled: true },
            { name: 'RAGController', enabled: moduleConfig?.rag !== false },
            { name: 'VoiceInput', enabled: moduleConfig?.voice !== false },
            { name: 'FileHandler', enabled: moduleConfig?.files !== false },
            { name: 'ERPSpecialist', enabled: moduleConfig?.erp !== false },
            { name: 'AnalyticsTracker', enabled: moduleConfig?.analytics !== false }
        ];
        
        for (const moduleInfo of modulesToLoad) {
            if (moduleInfo.enabled) {
                try {
                    await this.loadModule(moduleInfo.name);
                } catch (error) {
                    console.warn(`⚠️ Failed to load module ${moduleInfo.name}:`, error);
                    // Continue loading other modules
                }
            }
        }
        
        console.log(`✅ Loaded ${this.modules.size} modules successfully`);
    }

    /**
     * Ładuje pojedynczy moduł
     */
    async loadModule(moduleName) {
        try {
            const modulePath = `../modules/${moduleName}.js`;
            const moduleClass = await import(modulePath);
            
            const moduleInstance = new moduleClass.default({
                eventBus: this.eventBus,
                stateManager: this.stateManager,
                configManager: this.configManager,
                apiService: this.apiService
            });
            
            await moduleInstance.initialize?.();
            
            this.modules.set(moduleName, moduleInstance);
            console.log(`✅ Module loaded: ${moduleName}`);
            
            // Emit module loaded event
            this.eventBus.emit('module:loaded', { name: moduleName });
            
        } catch (error) {
            console.error(`❌ Failed to load module ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Uruchamia serwisy systemowe
     */
    async startServices() {
        console.log('⚙️ MasterChatSystem: Starting services...');
        
        const servicesToStart = [
            'CacheManager',
            'SessionManager',
            'SecurityService',
            'PerformanceMonitor'
        ];
        
        for (const serviceName of servicesToStart) {
            try {
                await this.startService(serviceName);
            } catch (error) {
                console.warn(`⚠️ Failed to start service ${serviceName}:`, error);
            }
        }
        
        console.log(`✅ Started ${this.services.size} services`);
    }

    /**
     * Uruchamia pojedynczy serwis
     */
    async startService(serviceName) {
        try {
            const servicePath = `../services/${serviceName}.js`;
            const ServiceClass = await import(servicePath);
            
            const serviceInstance = new ServiceClass.default({
                eventBus: this.eventBus,
                configManager: this.configManager
            });
            
            await serviceInstance.initialize?.();
            
            this.services.set(serviceName, serviceInstance);
            console.log(`✅ Service started: ${serviceName}`);
            
        } catch (error) {
            console.error(`❌ Failed to start service ${serviceName}:`, error);
            throw error;
        }
    }

    /**
     * Konfiguruje event listenery
     */
    async setupEventListeners() {
        console.log('👂 MasterChatSystem: Setting up event listeners...');
        
        // Document level listeners
        document.addEventListener('keydown', this.handleKeyPress);
        document.addEventListener('visibilitychange', this.handleVisibilityChange);
        
        // Window level listeners
        window.addEventListener('beforeunload', this.handleBeforeUnload);
        window.addEventListener('error', this.handleWindowError.bind(this));
        window.addEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
        
        // Custom events
        this.eventBus.on('message:send', this.handleMessage);
        this.eventBus.on('system:shutdown', this.destroy.bind(this));
        
        console.log('✅ Event listeners configured');
    }

    /**
     * Wykonuje health checks systemu
     */
    async performHealthChecks() {
        console.log('🏥 MasterChatSystem: Performing health checks...');
        
        const healthChecks = [
            this.checkDOMIntegrity(),
            this.checkAPIConnectivity(),
            this.checkModuleHealth(),
            this.checkServiceHealth()
        ];
        
        const results = await Promise.allSettled(healthChecks);
        const failures = results.filter(result => result.status === 'rejected');
        
        if (failures.length > 0) {
            console.warn(`⚠️ ${failures.length} health checks failed:`, failures);
        } else {
            console.log('✅ All health checks passed');
        }
        
        // Emit health check results
        this.eventBus.emit('system:health-check', {
            passed: results.length - failures.length,
            failed: failures.length,
            results
        });
    }

    /**
     * Sprawdza integralność DOM
     */
    async checkDOMIntegrity() {
        const requiredElements = [
            'messagesContent',
            'messageInput',
            'sendButton'
        ];
        
        for (const elementId of requiredElements) {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Required DOM element not found: ${elementId}`);
            }
        }
        
        return true;
    }

    /**
     * Sprawdza połączenie z API
     */
    async checkAPIConnectivity() {
        try {
            const response = await this.apiService.healthCheck();
            if (!response.ok) {
                throw new Error('API health check failed');
            }
            return true;
        } catch (error) {
            console.warn('API connectivity check failed:', error);
            // Don't throw - system can work in offline mode
            return false;
        }
    }

    /**
     * Sprawdza stan modułów
     */
    async checkModuleHealth() {
        for (const [name, module] of this.modules) {
            if (module.healthCheck && typeof module.healthCheck === 'function') {
                try {
                    await module.healthCheck();
                } catch (error) {
                    console.warn(`Module ${name} health check failed:`, error);
                }
            }
        }
        return true;
    }

    /**
     * Sprawdza stan serwisów
     */
    async checkServiceHealth() {
        for (const [name, service] of this.services) {
            if (service.healthCheck && typeof service.healthCheck === 'function') {
                try {
                    await service.healthCheck();
                } catch (error) {
                    console.warn(`Service ${name} health check failed:`, error);
                }
            }
        }
        return true;
    }

    /**
     * Rejestruje elementy DOM do zarządzania
     */
    registerDOMElements() {
        const elements = {
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            messagesContent: document.getElementById('messagesContent'),
            quickButtons: document.querySelectorAll('.quick-btn'),
            controlButtons: document.querySelectorAll('.control-btn')
        };
        
        // Register with DOM manager
        for (const [name, element] of Object.entries(elements)) {
            if (element) {
                this.domManager.registerElement(name, element);
            }
        }
    }

    /**
     * Obsługuje wysyłanie wiadomości - główna funkcja czatu
     */
    async handleMessage(data) {
        const { message, options = {} } = data;
        
        if (!message || message.trim().length === 0) {
            return;
        }
        
        const messageId = this.generateMessageId();
        const startTime = performance.now();
        
        try {
            // Aktualizuj stan - message sending
            this.stateManager.setState('chat.isProcessing', true);
            this.stateManager.setState('chat.currentMessage', { id: messageId, content: message });
            
            // Emit message started event
            this.eventBus.emit('message:started', { messageId, message, options });
            
            // Add user message to UI
            this.addUserMessage(message, messageId);
            
            // Show typing indicator
            const typingId = this.showTypingIndicator();
            
            // Process message through API
            const response = await this.processMessage(message, options);
            
            // Remove typing indicator
            this.removeTypingIndicator(typingId);
            
            // Add AI response to UI
            this.addAIMessage(response, messageId);
            
            // Calculate processing time
            const processingTime = performance.now() - startTime;
            
            // Update state - message completed
            this.stateManager.setState('chat.isProcessing', false);
            this.stateManager.setState('chat.lastResponse', response);
            
            // Track performance
            this.performanceMonitor.trackAPICall('/chat', startTime, performance.now(), 'success');
            
            // Emit message completed event
            this.eventBus.emit('message:completed', {
                messageId,
                message,
                response,
                processingTime
            });
            
        } catch (error) {
            // Handle error
            this.stateManager.setState('chat.isProcessing', false);
            this.stateManager.setState('chat.error', error.message);
            
            // Track error
            this.performanceMonitor.trackAPICall('/chat', startTime, performance.now(), 'error');
            
            // Show error message
            this.addErrorMessage(error.message, messageId);
            
            // Emit error event
            this.eventBus.emit('message:error', { messageId, message, error });
            
            console.error('Message handling error:', error);
        }
    }

    /**
     * Przetwarza wiadomość przez odpowiedni serwis
     */
    async processMessage(message, options) {
        // Detect service type
        const serviceType = this.detectServiceType(message, options);
        
        // Get appropriate service configuration
        const serviceConfig = this.configManager.get(`services.${serviceType}`);
        
        // Process through API
        const response = await this.apiService.sendMessage(message, {
            ...options,
            serviceType,
            config: serviceConfig
        });
        
        return response;
    }

    /**
     * Wykrywa typ serwisu na podstawie wiadomości
     */
    detectServiceType(message, options) {
        if (options.forceService) {
            return options.forceService;
        }
        
        // Simple heuristics - can be enhanced with ML
        const sqlKeywords = ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER'];
        const erpKeywords = ['moduł', 'konfiguracja', 'wdrożenie', 'system', 'ERP'];
        
        const upperMessage = message.toUpperCase();
        
        if (sqlKeywords.some(keyword => upperMessage.includes(keyword))) {
            return 'sql';
        }
        
        if (erpKeywords.some(keyword => upperMessage.includes(keyword))) {
            return 'erp';
        }
        
        return 'rag'; // Default to RAG
    }

    /**
     * Dodaje wiadomość użytkownika do UI
     */
    addUserMessage(message, messageId) {
        const messagesContent = document.getElementById('messagesContent');
        if (!messagesContent) return;
        
        const timestamp = new Date().toLocaleString('pl-PL');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message user-message';
        messageElement.dataset.messageId = messageId;
        messageElement.innerHTML = `
            <div class="user-bubble">
                <div class="structured-content">${this.escapeHtml(message)}</div>
                <div class="message-timestamp">
                    <span>Wysłano: ${timestamp}</span>
                    <span>👤 Użytkownik</span>
                </div>
            </div>
            <div class="user-avatar">
                <i class="fas fa-user"></i>
            </div>
        `;
        
        messagesContent.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to message history
        this.stateManager.addMessage({
            id: messageId,
            type: 'user',
            content: message,
            timestamp
        });
    }

    /**
     * Generuje unikalny ID wiadomości
     */
    generateMessageId() {
        return 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Usuwa konfliktujące event listenery
     */
    removeConflictingEventListeners() {
        // Remove legacy event listeners that might conflict
        const events = ['click', 'keydown', 'submit'];
        const selectors = ['#sendButton', '#messageInput', '.quick-btn'];
        
        selectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                events.forEach(event => {
                    element.removeEventListener(event, this.legacyHandler);
                });
            });
        });
    }

    /**
     * Czyści istniejące timery
     */
    clearExistingTimers() {
        // Clear any intervals that might be running
        for (let i = 1; i < 10000; i++) {
            clearInterval(i);
            clearTimeout(i);
        }
    }

    /**
     * Konfiguruje globalne zarządzanie błędami
     */
    setupGlobalErrorHandling() {
        // Set up global error boundaries
        this.originalErrorHandler = window.onerror;
        this.originalRejectionHandler = window.onunhandledrejection;
    }

    /**
     * Obsługuje zmiany konfiguracji
     */
    handleConfigChange(data) {
        console.log('Config changed:', data);
        this.eventBus.emit('system:config-updated', data);
    }

    /**
     * Obsługuje krytyczne błędy
     */
    handleCriticalError(data) {
        console.error('Critical error occurred:', data);
        this.errorHandler.handleCriticalError(data.error, data.context);
    }

    /**
     * Obsługuje zmiany stanu
     */
    handleStateChange(data) {
        console.log('State changed:', data);
        // Update UI based on state changes
    }

    /**
     * Obsługuje naciśnięcia klawiszy
     */
    handleKeyPress(event) {
        if (event.key === 'Enter' && !event.shiftKey) {
            const messageInput = document.getElementById('messageInput');
            if (document.activeElement === messageInput) {
                event.preventDefault();
                const message = messageInput.value.trim();
                if (message) {
                    this.eventBus.emit('message:send', { message });
                    messageInput.value = '';
                }
            }
        }
    }

    /**
     * Obsługuje zmiany widoczności strony
     */
    handleVisibilityChange() {
        if (document.hidden) {
            this.eventBus.emit('system:hidden');
        } else {
            this.eventBus.emit('system:visible');
        }
    }

    /**
     * Obsługuje zamknięcie strony
     */
    handleBeforeUnload(event) {
        // Save state before page unload
        this.stateManager.saveState();
        
        // Cleanup resources
        this.performanceMonitor.stopMonitoring();
        
        // Don't prevent unload unless there's unsaved data
        if (this.stateManager.hasUnsavedData()) {
            event.preventDefault();
            event.returnValue = 'Masz niezapisane dane. Czy na pewno chcesz opuścić stronę?';
            return event.returnValue;
        }
    }

    /**
     * Obsługuje błędy window
     */
    handleWindowError(event) {
        this.errorHandler.handleError('Window Error', event.error);
    }

    /**
     * Obsługuje nieobsłużone promise rejections
     */
    handleUnhandledRejection(event) {
        this.errorHandler.handleError('Unhandled Promise Rejection', event.reason);
    }

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    /**
     * Przewija do dołu obszaru wiadomości
     */
    scrollToBottom() {
        const messagesContent = document.getElementById('messagesContent');
        if (messagesContent) {
            setTimeout(() => {
                messagesContent.scrollTop = messagesContent.scrollHeight;
            }, 100);
        }
    }

    /**
     * Pokazuje wskaźnik pisania
     */
    showTypingIndicator() {
        const messagesContent = document.getElementById('messagesContent');
        if (!messagesContent) return null;
        
        const typingId = 'typing_' + Date.now();
        
        const typingElement = document.createElement('div');
        typingElement.className = 'message ai-message typing-indicator';
        typingElement.id = typingId;
        typingElement.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-bubble">
                <div class="loading-indicator">
                    <span>Marcin analizuje pytanie</span>
                    <div class="loading-dots">
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                        <div class="loading-dot"></div>
                    </div>
                </div>
            </div>
        `;
        
        messagesContent.appendChild(typingElement);
        this.scrollToBottom();
        
        return typingId;
    }

    /**
     * Usuwa wskaźnik pisania
     */
    removeTypingIndicator(typingId) {
        if (typingId) {
            const typingElement = document.getElementById(typingId);
            if (typingElement) {
                typingElement.remove();
            }
        }
    }

    /**
     * Dodaje odpowiedź AI do UI
     */
    addAIMessage(response, messageId) {
        const messagesContent = document.getElementById('messagesContent');
        if (!messagesContent) return;
        
        const timestamp = new Date().toLocaleString('pl-PL');
        const confidence = response.confidence || 0.8;
        
        // Determine confidence class
        let confidenceClass = 'confidence-medium';
        if (confidence >= 0.8) confidenceClass = 'confidence-high';
        else if (confidence < 0.6) confidenceClass = 'confidence-low';
        
        // Format sources
        const sources = response.sources || [];
        const sourcesHtml = sources.length > 0 ? 
            sources.map(source => `<span class="source-tag">${source}</span>`).join('') :
            '<span class="source-tag">AI-Knowledge</span>';
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message';
        messageElement.dataset.messageId = messageId;
        messageElement.innerHTML = `
            <div class="ai-avatar">🤖</div>
            <div class="ai-bubble">
                <div class="message-header">
                    <div class="message-type">
                        <i class="fas fa-robot"></i>
                        ${response.service_type || 'Advanced RAG'}
                    </div>
                    <div class="confidence-indicator">
                        <span class="confidence-badge ${confidenceClass}">
                            Pewność: ${Math.round(confidence * 100)}%
                        </span>
                    </div>
                </div>
                
                <div class="structured-content">
                    ${this.formatAIResponse(response.answer || response.response)}
                </div>
                
                <div class="message-footer">
                    <div class="sources-section">
                        <span class="sources-label">Źródła:</span>
                        ${sourcesHtml}
                    </div>
                    <div class="action-buttons">
                        <button class="action-btn" onclick="masterChat.rateMessage('${messageId}', 'up')" title="Przydatne">
                            <i class="fas fa-thumbs-up"></i>
                        </button>
                        <button class="action-btn" onclick="masterChat.rateMessage('${messageId}', 'down')" title="Nieprzydatne">
                            <i class="fas fa-thumbs-down"></i>
                        </button>
                        <button class="action-btn" onclick="masterChat.copyMessage('${messageId}')" title="Kopiuj">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
                
                <div class="ai-message-timestamp">
                    <span>Wygenerowano: ${timestamp}</span>
                    <span>${response.model || 'Claude-3.5-Sonnet'} • ${response.processing_time || 0}ms</span>
                </div>
            </div>
        `;
        
        messagesContent.appendChild(messageElement);
        this.scrollToBottom();
        
        // Add to message history
        this.stateManager.addMessage({
            id: messageId,
            type: 'ai',
            content: response,
            timestamp
        });
    }

    /**
     * Dodaje komunikat o błędzie do UI
     */
    addErrorMessage(errorText, messageId) {
        const messagesContent = document.getElementById('messagesContent');
        if (!messagesContent) return;
        
        const timestamp = new Date().toLocaleString('pl-PL');
        
        const messageElement = document.createElement('div');
        messageElement.className = 'message ai-message error-message';
        messageElement.dataset.messageId = messageId;
        messageElement.innerHTML = `
            <div class="ai-avatar" style="background: var(--gradient-warning);">⚠️</div>
            <div class="ai-bubble" style="border-left: 4px solid var(--accent-red);">
                <div class="message-header">
                    <div class="message-type" style="color: var(--accent-red);">
                        <i class="fas fa-exclamation-triangle"></i>
                        Błąd systemu
                    </div>
                    <div class="confidence-indicator">
                        <span class="confidence-badge confidence-low">Błąd</span>
                    </div>
                </div>
                
                <div class="structured-content">
                    <p>${this.escapeHtml(errorText)}</p>
                    <p><strong>Sugestie:</strong></p>
                    <ul class="step-list">
                        <li class="step-item">Sprawdź połączenie internetowe</li>
                        <li class="step-item">Spróbuj ponownie za chwilę</li>
                        <li class="step-item">Skontaktuj się z administratorem jeśli problem się powtarza</li>
                    </ul>
                </div>
                
                <div class="ai-message-timestamp">
                    <span>Błąd: ${timestamp}</span>
                    <span>System Error Handler</span>
                </div>
            </div>
        `;
        
        messagesContent.appendChild(messageElement);
        this.scrollToBottom();
    }

    /**
     * Formatuje odpowiedź AI
     */
    formatAIResponse(text) {
        if (!text) return '';
        
        // Convert newlines to paragraphs
        return text.split('\n\n').map(paragraph => {
            if (paragraph.trim()) {
                return `<p>${this.escapeHtml(paragraph.trim())}</p>`;
            }
            return '';
        }).join('');
    }

    /**
     * Ocenia wiadomość (thumbs up/down)
     */
    rateMessage(messageId, rating) {
        // Emit rating event
        this.eventBus.emit('message:rated', { messageId, rating });
        
        // Update UI
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const button = messageElement.querySelector(`.action-btn[onclick*="${rating}"]`);
            if (button) {
                button.style.color = rating === 'up' ? 'var(--accent-green)' : 'var(--accent-red)';
                button.style.transform = 'scale(1.2)';
                
                setTimeout(() => {
                    button.style.transform = 'scale(1)';
                }, 200);
            }
        }
        
        console.log(`Message ${messageId} rated: ${rating}`);
    }

    /**
     * Kopiuje wiadomość do schowka
     */
    async copyMessage(messageId) {
        const messageElement = document.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const content = messageElement.querySelector('.structured-content');
            if (content) {
                try {
                    await navigator.clipboard.writeText(content.textContent);
                    
                    // Visual feedback
                    const button = messageElement.querySelector('.action-btn[onclick*="copyMessage"]');
                    if (button) {
                        button.style.color = 'var(--accent-green)';
                        setTimeout(() => {
                            button.style.color = '';
                        }, 1000);
                    }
                    
                } catch (error) {
                    console.error('Failed to copy message:', error);
                }
            }
        }
    }

    /**
     * Eksportuje dane czatu
     */
    exportChatData() {
        const chatData = {
            session_id: this.stateManager.getState('session.id'),
            timestamp: new Date().toISOString(),
            messages: this.stateManager.getState('chat.messages'),
            configuration: this.configManager.getAllConfig()
        };
        
        const blob = new Blob([JSON.stringify(chatData, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erp_chat_export_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.eventBus.emit('data:exported', { type: 'chat', timestamp: Date.now() });
    }

    /**
     * Czyści historię czatu
     */
    clearChatHistory() {
        // Clear messages from DOM
        const messagesContent = document.getElementById('messagesContent');
        if (messagesContent) {
            const userMessages = messagesContent.querySelectorAll('.user-message, .ai-message:not(.welcome-message)');
            userMessages.forEach(msg => msg.remove());
        }
        
        // Clear from state
        this.stateManager.setState('chat.messages', []);
        
        this.eventBus.emit('chat:cleared');
        console.log('Chat history cleared');
    }

    /**
     * Otrzymuje metryki systemu
     */
    getSystemMetrics() {
        return {
            uptime: Date.now() - this.startTime,
            initialized: this.initialized,
            modules: this.modules.size,
            services: this.services.size,
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null,
            performance: this.performanceMonitor.getMetrics()
        };
    }

    /**
     * Niszczy system i czyści zasoby
     */
    async destroy() {
        if (this.isDestroying) {
            console.log('⚠️ MasterChatSystem: Already destroying');
            return;
        }
        
        this.isDestroying = true;
        console.log('🔥 MasterChatSystem: Starting destruction sequence...');
        
        try {
            // Stop performance monitoring
            this.performanceMonitor.stopMonitoring();
            
            // Destroy all modules
            for (const [name, module] of this.modules) {
                try {
                    if (module.destroy && typeof module.destroy === 'function') {
                        await module.destroy();
                    }
                    console.log(`✅ Module destroyed: ${name}`);
                } catch (error) {
                    console.warn(`⚠️ Error destroying module ${name}:`, error);
                }
            }
            
            // Stop all services
            for (const [name, service] of this.services) {
                try {
                    if (service.stop && typeof service.stop === 'function') {
                        await service.stop();
                    }
                    console.log(`✅ Service stopped: ${name}`);
                } catch (error) {
                    console.warn(`⚠️ Error stopping service ${name}:`, error);
                }
            }
            
            // Remove event listeners
            document.removeEventListener('keydown', this.handleKeyPress);
            document.removeEventListener('visibilitychange', this.handleVisibilityChange);
            window.removeEventListener('beforeunload', this.handleBeforeUnload);
            window.removeEventListener('error', this.handleWindowError.bind(this));
            window.removeEventListener('unhandledrejection', this.handleUnhandledRejection.bind(this));
            
            // Clear all maps and sets
            this.modules.clear();
            this.services.clear();
            this.activeComponents.clear();
            
            // Reset state
            this.initialized = false;
            
            // Remove singleton instance
            delete MasterChatSystem.instance;
            
            console.log('✅ MasterChatSystem: Destroyed successfully');
            
        } catch (error) {
            console.error('❌ Error during destruction:', error);
        } finally {
            this.isDestroying = false;
        }
    }

    /**
     * Restart całego systemu
     */
    async restart() {
        console.log('🔄 MasterChatSystem: Restarting system...');
        
        await this.destroy();
        
        // Wait a bit for cleanup
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Create new instance
        const newInstance = new MasterChatSystem();
        await newInstance.initialize();
        
        return newInstance;
    }

    /**
     * Otrzymuje status systemu
     */
    getStatus() {
        return {
            initialized: this.initialized,
            destroying: this.isDestroying,
            uptime: Date.now() - this.startTime,
            modules: Array.from(this.modules.keys()),
            services: Array.from(this.services.keys()),
            health: this.performanceMonitor.getHealthStatus()
        };
    }
}

// Export the class
export default MasterChatSystem;

// Create global instance for legacy compatibility
if (typeof window !== 'undefined') {
    window.MasterChatSystem = MasterChatSystem;
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', async () => {
            try {
                window.masterChat = new MasterChatSystem();
                await window.masterChat.initialize();
                console.log('🎉 Master Chat System initialized automatically');
            } catch (error) {
                console.error('❌ Failed to auto-initialize Master Chat System:', error);
            }
        });
    } else {
        // DOM is already ready
        setTimeout(async () => {
            try {
                window.masterChat = new MasterChatSystem();
                await window.masterChat.initialize();
                console.log('🎉 Master Chat System initialized automatically');
            } catch (error) {
                console.error('❌ Failed to auto-initialize Master Chat System:', error);
            }
        }, 0);
    }
}
