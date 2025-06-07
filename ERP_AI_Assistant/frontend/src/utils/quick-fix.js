/**
 * QUICK FIX - Natychmiastowe rozwiązanie konfliktów
 * Dodaj na początku index.html przed innymi skryptami
 */

// 1. Chat System Manager - zapobiega konfliktom
window.ChatSystemManager = {
    activeSystems: [],
    
    register(systemName, instance) {
        console.log(`🔧 Rejestruję system czatu: ${systemName}`);
        
        // Jeśli już jest aktywny system, ostrzeż
        if (this.activeSystems.length > 0) {
            console.warn(`⚠️ KONFLIKT: ${systemName} próbuje się zarejestrować, ale ${this.activeSystems[0]} już jest aktywny`);
            return false;
        }
        
        this.activeSystems.push(systemName);
        window[`${systemName}Instance`] = instance;
        return true;
    },
    
    unregister(systemName) {
        const index = this.activeSystems.indexOf(systemName);
        if (index > -1) {
            this.activeSystems.splice(index, 1);
            delete window[`${systemName}Instance`];
            console.log(`🗑️ Wyrejestrowałem system: ${systemName}`);
        }
    },
    
    getActive() {
        return this.activeSystems[0] || null;
    }
};

// 2. Unified API Client - standardowe API dla wszystkich systemów
window.UnifiedAPI = {
    baseUrl: 'http://localhost:5000/api',
    
    async call(endpoint, data = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const result = await response.json();
            
            // Standaryzuj format odpowiedzi
            return {
                content: result.answer || result.response || result.content || 'Brak odpowiedzi',
                confidence: result.confidence || result.validation_score || 0.5,
                sources: result.sources || [],
                metadata: result.metadata || result.rag_metrics || {},
                raw: result // Zachowaj oryginalną odpowiedź
            };
            
        } catch (error) {
            console.error(`❌ Błąd API ${endpoint}:`, error);
            throw error;
        }
    },
    
    // Główne metody
    async sendMessage(message, options = {}) {
        return this.call('/rag/chat', {
            message,
            session_id: this.getSessionId(),
            ...options
        });
    },
    
    async checkHealth() {
        return this.call('/health', {});
    },
    
    async analyzeSQL(query) {
        return this.call('/sql/analyze', { query });
    },
    
    getSessionId() {
        if (!window._erpSessionId) {
            window._erpSessionId = 'erp_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return window._erpSessionId;
    }
};

// 3. DOM Protection - sprawdza konflikty elementów
window.DOMProtection = {
    protectedElements: [
        'chat-input-advanced',
        'send-button-advanced', 
        'chat-messages-advanced'
    ],
    
    claimedBy: {},
    
    claim(elementId, systemName) {
        if (this.claimedBy[elementId] && this.claimedBy[elementId] !== systemName) {
            console.error(`🚨 KONFLIKT DOM: Element ${elementId} już jest używany przez ${this.claimedBy[elementId]}, a próbuje go przejąć ${systemName}`);
            return false;
        }
        
        this.claimedBy[elementId] = systemName;
        console.log(`🔒 ${systemName} przejął kontrolę nad ${elementId}`);
        return true;
    },
    
    release(elementId, systemName) {
        if (this.claimedBy[elementId] === systemName) {
            delete this.claimedBy[elementId];
            console.log(`🔓 ${systemName} zwolnił ${elementId}`);
        }
    },
    
    checkConflicts() {
        const conflicts = [];
        this.protectedElements.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                const listeners = getEventListeners ? getEventListeners(element) : {};
                if (Object.keys(listeners).length > 1) {
                    conflicts.push(`${id} ma ${Object.keys(listeners).length} event listenerów`);
                }
            }
        });
        
        if (conflicts.length > 0) {
            console.warn('⚠️ Wykryto potencjalne konflikty DOM:', conflicts);
        }
        
        return conflicts;
    }
};

// 4. Event Bus - komunikacja między modułami
window.ERPEventBus = {
    events: {},
    
    on(event, callback, context = 'global') {
        const fullEvent = `${context}:${event}`;
        if (!this.events[fullEvent]) this.events[fullEvent] = [];
        this.events[fullEvent].push(callback);
        console.log(`📡 Subskrypcja: ${fullEvent}`);
    },
    
    emit(event, data, context = 'global') {
        const fullEvent = `${context}:${event}`;
        if (this.events[fullEvent]) {
            this.events[fullEvent].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`❌ Błąd w event handler ${fullEvent}:`, error);
                }
            });
            console.log(`📤 Emitowane: ${fullEvent}`, data);
        }
    },
    
    off(event, callback, context = 'global') {
        const fullEvent = `${context}:${event}`;
        if (this.events[fullEvent]) {
            const index = this.events[fullEvent].indexOf(callback);
            if (index > -1) {
                this.events[fullEvent].splice(index, 1);
            }
        }
    }
};

// 5. System wyboru czatu
window.ChatSelector = {
    currentChat: null,
    
    available: {
        'advanced': {
            script: 'chat.js',
            class: 'ClaudeRAGAssistant',
            description: 'Zaawansowany RAG + Claude API'
        },
        'professional': {
            script: 'professional-chat.js', 
            class: 'ProfessionalERPChat',
            description: 'Profesjonalny interfejs czatu'
        },
        'basic': {
            script: 'script.js',
            class: 'ERPAssistant',
            description: 'Podstawowy asystent ERP'
        }
    },
    
    async switch(chatType) {
        console.log(`🔄 Przełączanie na system czatu: ${chatType}`);
        
        // Wyczyść aktualny system
        if (this.currentChat) {
            this.cleanup();
        }
        
        // Sprawdź czy typ jest dostępny
        if (!this.available[chatType]) {
            console.error(`❌ Nieznany typ czatu: ${chatType}`);
            return false;
        }
        
        try {
            // Ustaw nowy system
            this.currentChat = chatType;
            
            // Emituj event
            ERPEventBus.emit('chat-switched', { 
                from: this.currentChat,
                to: chatType 
            }, 'system');
            
            console.log(`✅ Przełączono na: ${this.available[chatType].description}`);
            return true;
            
        } catch (error) {
            console.error(`❌ Błąd przełączania czatu:`, error);
            return false;
        }
    },
    
    cleanup() {
        if (this.currentChat) {
            // Zwolnij zasoby aktualnego systemu
            ChatSystemManager.unregister(this.currentChat);
            
            // Zwolnij elementy DOM
            DOMProtection.protectedElements.forEach(id => {
                DOMProtection.release(id, this.currentChat);
            });
        }
    }
};

// 6. Diagnostic Tools
window.ERPDiagnostics = {
    checkHealth() {
        console.log('🔍 DIAGNOSTYKA SYSTEMU ERP');
        console.log('==========================');
        
        // Sprawdź systemy czatu
        console.log('📱 Aktywne systemy czatu:', ChatSystemManager.activeSystems);
        
        // Sprawdź API
        UnifiedAPI.checkHealth().then(result => {
            console.log('🌐 Backend status:', result.content ? 'OK' : 'ERROR');
        }).catch(error => {
            console.log('🌐 Backend status: OFFLINE');
        });
        
        // Sprawdź konflikty DOM
        const conflicts = DOMProtection.checkConflicts();
        console.log('🎯 Konflikty DOM:', conflicts.length > 0 ? conflicts : 'Brak');
        
        // Sprawdź event listenery
        const eventCount = Object.keys(ERPEventBus.events).length;
        console.log('📡 Zarejestrowane eventy:', eventCount);
        
        // Sprawdź elementy DOM
        const requiredElements = [
            'chat-input-advanced',
            'send-button-advanced',
            'chat-messages-advanced'
        ];
        
        const missingElements = requiredElements.filter(id => !document.getElementById(id));
        console.log('🏗️ Brakujące elementy DOM:', missingElements.length > 0 ? missingElements : 'Wszystkie dostępne');
        
        console.log('==========================');
        
        return {
            chatSystems: ChatSystemManager.activeSystems,
            domConflicts: conflicts,
            missingElements: missingElements,
            eventCount: eventCount
        };
    },
    
    repairConflicts() {
        console.log('🔧 Naprawianie konfliktów...');
        
        // Wyczyść wszystkie systemy czatu
        ChatSystemManager.activeSystems.forEach(system => {
            ChatSystemManager.unregister(system);
        });
        
        // Zwolnij wszystkie elementy DOM
        DOMProtection.protectedElements.forEach(id => {
            DOMProtection.claimedBy[id] = null;
        });
        
        // Wyczyść event bus
        ERPEventBus.events = {};
        
        console.log('✅ Konflikty wyczyszczone - możesz zainicjalizować system ponownie');
    }
};

// 7. Auto-inicjalizacja przy ładowaniu
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Quick Fix załadowany');
    
    // Sprawdź stan systemu
    setTimeout(() => {
        const health = ERPDiagnostics.checkHealth();
        
        if (health.chatSystems.length > 1) {
            console.warn('⚠️ Wykryto wiele systemów czatu - uruchamiam naprawę');
            ERPDiagnostics.repairConflicts();
        }
        
        if (health.domConflicts.length > 0) {
            console.warn('⚠️ Wykryto konflikty DOM');
        }
        
        if (health.missingElements.length > 0) {
            console.error('❌ Brakuje kluczowych elementów DOM:', health.missingElements);
        }
    }, 1000);
});

// 8. Global error handler
window.addEventListener('error', (event) => {
    if (event.error && event.error.message.includes('chat')) {
        console.error('🚨 Błąd związany z czatem:', event.error);
        console.log('💡 Spróbuj uruchomić ERPDiagnostics.repairConflicts()');
    }
});

console.log('✅ ERP Quick Fix załadowany - dostępne narzędzia:');
console.log('   🔧 ERPDiagnostics.checkHealth() - sprawdź stan systemu');
console.log('   🔧 ERPDiagnostics.repairConflicts() - napraw konflikty');
console.log('   🔧 ChatSelector.switch("advanced"|"professional"|"basic") - przełącz czat');
console.log('   🔧 UnifiedAPI.sendMessage("test") - testuj API');
