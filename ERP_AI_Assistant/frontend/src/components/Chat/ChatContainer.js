/**
 * Professional ERP Chat Interface v2.0
 * Zaawansowany interface czatu z RAG i AI dla systemów ERP
 */

class ProfessionalERPChat {
    constructor() {
        this.sessionId = this.generateSessionId();
        this.messagesContainer = null;
        this.messageInput = null;
        this.sendButton = null;
        this.isTyping = false;
        this.messageHistory = [];
        this.ragEndpoint = 'http://localhost:5000/api/rag/chat';
        this.initializeEndpoint = 'http://localhost:5000/api/initialize';
        this.connectionStatus = 'disconnected';
        this.startTime = Date.now();
        
        console.log('🤖 Professional ERP Chat inicjalizacja...');
        this.init();
    }

    generateSessionId() {
        return 'erp_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async init() {
        try {
            this.initializeElements();
            this.setupEventListeners();
            await this.initializeRAGSystem();
            this.showWelcomeMessage();
            this.connectionStatus = 'connected';
            console.log('✅ Professional ERP Chat gotowy!');
        } catch (error) {
            console.error('❌ Błąd inicjalizacji:', error);
            this.showErrorMessage('Błąd inicjalizacji systemu czatu');
        }
    }

    initializeElements() {
        this.messagesContainer = document.getElementById('chat-messages-advanced');
        this.messageInput = document.getElementById('chat-input-advanced');
        this.sendButton = document.getElementById('send-button-advanced');
        this.typingIndicator = document.querySelector('.typing-indicator');
        this.clearChatBtn = document.getElementById('clear-chat-btn');
        this.exportChatBtn = document.getElementById('export-chat-btn');

        if (!this.messagesContainer || !this.messageInput || !this.sendButton) {
            throw new Error('Nie znaleziono kluczowych elementów interfejsu');
        }
    }

    setupEventListeners() {
        // Przycisk wyślij
        this.sendButton.addEventListener('click', () => this.sendMessage());
        
        // Enter w textarea
        this.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Auto-resize textarea
        this.messageInput.addEventListener('input', () => {
            this.autoResizeTextarea();
            this.updateCharacterCount();
        });

        // Clear chat
        if (this.clearChatBtn) {
            this.clearChatBtn.addEventListener('click', () => this.clearChat());
        }

        // Export chat
        if (this.exportChatBtn) {
            this.exportChatBtn.addEventListener('click', () => this.exportChat());
        }

        // Quick action buttons
        document.querySelectorAll('.quick-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const text = e.target.closest('.quick-btn').getAttribute('data-text');
                if (text) {
                    this.setInputText(text);
                }
            });
        });

        // Suggestion chips
        document.querySelectorAll('.suggestion-chip').forEach(chip => {
            chip.addEventListener('click', (e) => {
                const text = e.target.getAttribute('data-text');
                if (text) {
                    this.setInputText(text);
                }
            });
        });
    }

    async initializeRAGSystem() {
        try {
            console.log('🚀 Inicjalizacja systemu RAG...');
            
            const response = await fetch(this.initializeEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ System RAG zainicjalizowany:', data);
                return data;
            } else {
                console.warn('⚠️ Problem z inicjalizacją RAG:', response.status);
            }
        } catch (error) {
            console.error('❌ Błąd inicjalizacji RAG:', error);
        }
    }

    showWelcomeMessage() {
        const welcomeMessage = {
            type: 'assistant',
            content: `# 👋 Witaj! Jestem Marcin - Twój Asystent ERP

🎯 **Specjalizuję się w:**
- Konfiguracji systemów Comarch ERP XL
- Rozwiązywaniu problemów wdrożeniowych
- Optymalizacji procesów biznesowych
- Integracjach systemowych

💡 **Jak mogę Ci pomóc?**
- Zadaj pytanie o konkretny moduł ERP
- Użyj szybkich akcji powyżej
- Opisz problem, który napotkałeś

🔧 **System gotowy:** Advanced RAG + Claude AI + Baza wiedzy Comarch`,
            timestamp: new Date(),
            metadata: {
                confidence: 1.0,
                sources: ['system_init'],
                response_time: '0.1s'
            }
        };
        
        this.addMessage(welcomeMessage);
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();
        if (!message || this.isTyping) return;

        // Dodaj wiadomość użytkownika
        this.addMessage({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Wyczyść input
        this.messageInput.value = '';
        this.autoResizeTextarea();
        this.updateCharacterCount();

        // Pokaż typing indicator
        this.showTypingIndicator();

        try {
            // Wyślij do RAG API
            const response = await this.callRAGAPI(message);
            this.hideTypingIndicator();
            
            // Dodaj odpowiedź asystenta
            this.addMessage({
                type: 'assistant',
                content: response.answer || 'Przepraszam, wystąpił problem z generowaniem odpowiedzi.',
                timestamp: new Date(),
                metadata: {
                    confidence: response.confidence || 0.5,
                    sources: response.sources || [],
                    response_time: response.processing_time || 'N/A',
                    reasoning_steps: response.reasoning_steps || [],
                    validation_score: response.validation_score || 0.5
                }
            });

        } catch (error) {
            console.error('❌ Błąd wysyłania wiadomości:', error);
            this.hideTypingIndicator();
            
            this.addMessage({
                type: 'assistant',
                content: `⚠️ **Wystąpił błąd podczas przetwarzania zapytania**

🔧 **Możliwe przyczyny:**
- Problem z połączeniem sieciowym
- Tymczasowa niedostępność serwisu AI
- Przekroczenie limitów API

💡 **Spróbuj:**
- Odświeżyć stronę
- Zadać pytanie ponownie za chwilę
- Uprościć zapytanie

🎯 Możesz też użyć przycisków "Restart" poniżej.`,
                timestamp: new Date(),
                metadata: {
                    confidence: 0.3,
                    sources: ['error_handler'],
                    response_time: 'N/A'
                }
            });
        }
    }

    async callRAGAPI(message) {
        const payload = {
            message: message,
            session_id: this.sessionId
        };

        const response = await fetch(this.ragEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
    }

    addMessage(messageData) {
        const messageElement = this.createMessageElement(messageData);
        this.messagesContainer.appendChild(messageElement);
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        
        // Dodaj do historii
        this.messageHistory.push(messageData);
        
        // Animacja pojawienia
        setTimeout(() => {
            messageElement.classList.add('visible');
        }, 50);
    }

    createMessageElement(messageData) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${messageData.type}`;
        
        const timestamp = messageData.timestamp ? new Date(messageData.timestamp) : new Date();
        const timeString = timestamp.toLocaleTimeString('pl-PL', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

        if (messageData.type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-text">${this.escapeHtml(messageData.content)}</div>
                    <div class="message-meta">
                        <span class="timestamp">${timeString}</span>
                    </div>
                </div>
                <div class="message-avatar">👤</div>
            `;
        } else {
            const formattedContent = this.formatAssistantMessage(messageData.content);
            const metadata = messageData.metadata || {};
            
            messageDiv.innerHTML = `
                <div class="message-avatar">🤖</div>
                <div class="message-content">
                    <div class="message-text">${formattedContent}</div>
                    <div class="message-meta">
                        <span class="confidence">
                            <i class="fas fa-bullseye"></i>
                            ${Math.round((metadata.confidence || 0.5) * 100)}%
                        </span>
                        ${metadata.sources && metadata.sources.length > 0 ? `
                            <span class="sources">
                                <i class="fas fa-books"></i>
                                ${metadata.sources.length} źródeł
                            </span>
                        ` : ''}
                        <span class="timestamp">${timeString}</span>
                        <div class="message-actions">
                            <button class="action-btn" onclick="copyMessage('${this.escapeHtml(messageData.content)}')" title="Kopiuj">
                                <i class="fas fa-copy"></i>
                            </button>
                            <button class="action-btn like-btn" onclick="likeMessage(this)" title="Oceń pozytywnie">
                                <i class="fas fa-thumbs-up"></i>
                            </button>
                        </div>
                    </div>
                    ${metadata.sources && metadata.sources.length > 0 ? `
                        <div class="sources-detail">
                            <strong>📚 Źródła:</strong> ${metadata.sources.slice(0, 3).join(', ')}
                        </div>
                    ` : ''}
                </div>
            `;
        }

        return messageDiv;
    }

    formatAssistantMessage(content) {
        // Konwertuj Markdown na HTML
        let formatted = content
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold i italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Lista
            .replace(/^- (.*$)/gm, '<li>$1</li>')
            // Links (jeśli są)
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>')
            // Nowe linie
            .replace(/\n/g, '<br>');

        // Owinięcie list w <ul>
        formatted = formatted.replace(/(<li>.*<\/li>)/g, '<ul>$1</ul>');
        
        return formatted;
    }

    showTypingIndicator() {
        this.isTyping = true;
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'flex';
        }
        this.sendButton.disabled = true;
        this.sendButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
    }

    hideTypingIndicator() {
        this.isTyping = false;
        if (this.typingIndicator) {
            this.typingIndicator.style.display = 'none';
        }
        this.sendButton.disabled = false;
        this.sendButton.innerHTML = '<span class="send-text">Wyślij</span><i class="fas fa-paper-plane"></i>';
    }

    autoResizeTextarea() {
        this.messageInput.style.height = 'auto';
        this.messageInput.style.height = Math.min(this.messageInput.scrollHeight, 120) + 'px';
    }

    updateCharacterCount() {
        const count = this.messageInput.value.length;
        const counter = document.querySelector('.character-count');
        if (counter) {
            counter.textContent = `${count}/4000`;
            counter.style.color = count > 3500 ? '#dc3545' : '#6c757d';
        }
    }

    setInputText(text) {
        this.messageInput.value = text;
        this.autoResizeTextarea();
        this.updateCharacterCount();
        this.messageInput.focus();
    }

    clearChat() {
        if (confirm('Czy na pewno chcesz wyczyścić całą rozmowę?')) {
            this.messagesContainer.innerHTML = '';
            this.messageHistory = [];
            this.showWelcomeMessage();
        }
    }

    exportChat() {
        const chatData = {
            session_id: this.sessionId,
            timestamp: new Date().toISOString(),
            messages: this.messageHistory,
            system_info: {
                version: '2.0',
                agent: 'Marcin - Professional ERP Assistant'
            }
        };

        const blob = new Blob([JSON.stringify(chatData, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `erp_chat_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    async restartConnection() {
        console.log('🔄 Restart połączenia...');
        this.connectionStatus = 'reconnecting';
        
        try {
            await this.initializeRAGSystem();
            this.connectionStatus = 'connected';
            
            this.addMessage({
                type: 'assistant',
                content: '✅ **Połączenie zostało przywrócone!**\n\nSystem RAG został ponownie zainicjalizowany i jest gotowy do pracy.',
                timestamp: new Date(),
                metadata: { confidence: 1.0, sources: ['system'] }
            });
        } catch (error) {
            this.connectionStatus = 'error';
            console.error('❌ Błąd restartu:', error);
        }
    }

    copyMessage(content) {
        navigator.clipboard.writeText(content).then(() => {
            // Pokaż krótką notyfikację
            const notification = document.createElement('div');
            notification.textContent = 'Skopiowano!';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: #28a745;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                z-index: 10000;
                font-size: 14px;
            `;
            document.body.appendChild(notification);
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 2000);
        });
    }

    likeMessage(button) {
        button.classList.toggle('liked');
        button.style.color = button.classList.contains('liked') ? '#28a745' : '';
        
        // Track feedback (można rozszerzyć o wysyłanie do backend)
        console.log('👍 Message feedback:', button.classList.contains('liked'));
    }

    showErrorMessage(message) {
        this.addMessage({
            type: 'assistant',
            content: `⚠️ **Błąd systemu**: ${message}`,
            timestamp: new Date(),
            metadata: { confidence: 0.0, sources: ['error'] }
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    getDebugInfo() {
        return {
            version: '2.0.0',
            session_id: this.sessionId,
            connection_status: this.connectionStatus,
            elements_found: this.messagesContainer ? 5 : 0,
            total_elements: 5,
            session_stats: {
                messages_sent: this.messageHistory.filter(m => m.type === 'user').length,
                messages_received: this.messageHistory.filter(m => m.type === 'assistant').length,
                uptime: Date.now() - this.startTime,
                session_id: this.sessionId,
                connection_status: this.connectionStatus
            }
        };
    }
}

// Globalna instancja
window.professionalChat = null;

// Inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    try {
        window.professionalChat = new ProfessionalERPChat();
        
        // Globalne funkcje dla compatibility
        window.copyMessage = function(content) {
            window.professionalChat.copyMessage(content);
        };
        
        window.likeMessage = function(button) {
            window.professionalChat.likeMessage(button);
        };
        
    } catch (error) {
        console.error('❌ Błąd inicjalizacji Professional Chat:', error);
    }
});

// Export dla modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProfessionalERPChat;
}
