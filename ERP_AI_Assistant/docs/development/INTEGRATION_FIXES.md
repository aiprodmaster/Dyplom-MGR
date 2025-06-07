# PLAN NAPRAWY INTEGRACJI

## 1. UNIFIKACJA SYSTEMÓW CZATU

### Problem:
Trzy różne implementacje czatu używają tych samych elementów DOM, co powoduje konflikty.

### Rozwiązanie:
```javascript
// Utwórz centralny ChatManager w script.js
class ChatManager {
    constructor() {
        this.activeChat = null;
        this.availableChats = {
            'advanced': ClaudeRAGAssistant,
            'professional': ProfessionalERPChat,
            'basic': BasicChat
        };
    }
    
    switchChat(type) {
        if (this.activeChat) {
            this.activeChat.destroy();
        }
        this.activeChat = new this.availableChats[type]();
    }
}
```

## 2. STANDARYZACJA API

### Problem:
Różne endpointy i formaty odpowiedzi.

### Rozwiązanie:
```javascript
// Utwórz unified API client
class UnifiedAPIClient {
    constructor() {
        this.baseUrl = 'http://localhost:5000/api';
        this.endpoints = {
            chat: '/rag/chat',        // Standardowy endpoint
            health: '/health',
            sql: '/sql/analyze'
        };
    }
    
    async sendMessage(message, options = {}) {
        const response = await fetch(`${this.baseUrl}${this.endpoints.chat}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message,
                session_id: this.getSessionId(),
                ...options
            })
        });
        
        const data = await response.json();
        
        // Standaryzuj format odpowiedzi
        return {
            content: data.answer || data.response || 'Brak odpowiedzi',
            confidence: data.confidence || 0.5,
            sources: data.sources || [],
            metadata: data.metadata || {}
        };
    }
}
```

## 3. REFAKTORING GŁÓWNEGO SKRYPTU

### Zmodyfikuj script.js:
```javascript
// Na początku script.js dodaj:
// Sprawdź czy inne systemy czatu są aktywne
if (window.claudeAssistant || window.professionalChat) {
    console.log('⚠️ Wykryto inne systemy czatu - pomijam inicjalizację');
    return;
}

// Lub lepiej - utwórz system wyboru
ERPAssistant.selectChatSystem = function(type) {
    // Wyczyść poprzednie
    this.cleanup();
    
    // Załaduj wybrany
    switch(type) {
        case 'claude':
            this.loadScript('chat.js');
            break;
        case 'professional':
            this.loadScript('professional-chat.js');
            break;
        default:
            this.setupChatModule(); // domyślny
    }
};
```

## 4. POPRAWKI BACKEND

### Dodaj unified endpoint w app.py:
```python
@app.route('/api/chat', methods=['POST'])
def unified_chat():
    """Unified chat endpoint - przekierowuje do odpowiedniego serwisu"""
    data = request.get_json()
    chat_type = data.get('chat_type', 'advanced')
    
    if chat_type == 'advanced' and advanced_rag:
        return advanced_rag_chat()
    elif chat_type == 'sql' and sql_code_service:
        return analyze_sql()
    else:
        # Fallback response
        return jsonify({
            'answer': 'Backend dostępny - wybierz konkretny tryb',
            'confidence': 0.8,
            'sources': ['Unified API'],
            'available_modes': ['advanced', 'sql', 'code']
        })
```

## 5. KOORDINACJA MIĘDZY MODUŁAMI

### Utwórz centralny EventBus:
```javascript
class ERPEventBus {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) this.events[event] = [];
        this.events[event].push(callback);
    }
    
    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(cb => cb(data));
        }
    }
}

// Użycie w modułach:
window.erpEventBus = new ERPEventBus();

// W chat systemie:
erpEventBus.emit('chat:message-sent', { message, response });

// W analytics:
erpEventBus.on('chat:message-sent', (data) => {
    this.updateMetrics(data);
});
```

## 6. KONFIGURACJA ŚRODOWISKA

### Utwórz config.js:
```javascript
// config.js
window.ERPConfig = {
    api: {
        baseUrl: 'http://localhost:5000/api',
        timeout: 10000,
        retries: 3
    },
    chat: {
        defaultSystem: 'advanced', // 'professional', 'basic'
        maxMessageLength: 4000,
        enableVoice: true,
        enableFiles: true
    },
    features: {
        advancedRAG: true,
        sqlAnalysis: true,
        digitalTwin: true,
        roiCalculator: true
    },
    debug: true
};
```

## 7. TESTY INTEGRACJI

### Utwórz test suite:
```javascript
// integration-tests.js
class IntegrationTests {
    async runAllTests() {
        const tests = [
            this.testChatIntegration,
            this.testAPIConnectivity,
            this.testModuleCommunication,
            this.testFallbackMechanisms
        ];
        
        for (const test of tests) {
            try {
                await test.call(this);
                console.log(`✅ ${test.name} - PASSED`);
            } catch (error) {
                console.error(`❌ ${test.name} - FAILED:`, error);
            }
        }
    }
    
    async testChatIntegration() {
        // Test czy chat systems nie kolidują
        const chatElements = document.querySelectorAll('[id*="chat"]');
        // Sprawdź czy są event listenery...
    }
}
```

## PRIORYTET IMPLEMENTACJI:

1. **Wysokí**: Napraw konflikty DOM w systemach czatu
2. **Wysokı**: Standaryzuj API endpoints  
3. **Średni**: Dodaj EventBus dla komunikacji między modułami
4. **Średni**: Utwórz centralną konfigurację
5. **Niski**: Dodaj testy integracji

## SZACOWANY CZAS: 2-3 dni pracy
