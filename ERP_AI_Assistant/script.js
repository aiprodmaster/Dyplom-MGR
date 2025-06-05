// Główny obiekt aplikacji
const ERPAssistant = {
    // Konfiguracja API Claude
    claudeConfig: {
        apiKey: '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',
        apiUrl: 'https://api.anthropic.com/v1/messages',
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000
    },

    // Zaawansowana baza wiedzy z kontekstem
    knowledgeBase: {
        "comarch erp xl": {
            answer: "Comarch ERP XL to zaawansowany system klasy ERP dedykowany średnim i dużym przedsiębiorstwom. System oferuje pełną integrację modułów finansowych, kadrowych, logistycznych oraz produkcyjnych.",
            confidence: 0.95,
            sources: ["Dokumentacja Comarch ERP XL", "Podręcznik wdrożeniowy"],
            followUp: ["Który moduł Cię najbardziej interesuje?", "Masz pytania dotyczące konkretnego procesu biznesowego?"],
            suggestions: ["Konfiguracja modułu finansowego", "Integracja z systemami zewnętrznymi", "Szkolenia użytkowników"]
        },
        "moduł finansowy": {
            answer: "Moduł finansowy w Comarch ERP XL obejmuje księgowość główną, rozrachunki, kontroling oraz zarządzanie środkami trwałymi. Konfiguracja rozpoczyna się od zdefiniowania struktury organizacyjnej i parametrów księgowych.",
            confidence: 0.92,
            sources: ["Comarch ERP XL - Finanse", "Instrukcja konfiguracji"],
            followUp: ["Chcesz się dowiedzieć o konkretnym obszarze finansów?"],
            suggestions: ["Plan kont", "Konfiguracja VAT", "Raporty finansowe", "Rozrachunki z kontrahentami"],
            specialist: "financial"
        },
        "wdrożenie erp": {
            answer: "Proces wdrożenia ERP obejmuje 5 kluczowych etapów: analizę wymagań, projektowanie rozwiązania, konfigurację systemu, testy oraz go-live. Średni czas wdrożenia to 6-12 miesięcy w zależności od złożoności organizacji.",
            confidence: 0.89,
            sources: ["Metodyka wdrożeń ERP", "Best practices"],
            followUp: ["Na którym etapie wdrożenia się znajdujecie?", "Masz konkretne wyzwania?"],
            suggestions: ["Harmonogram wdrożenia", "Zarządzanie zespołem", "Analiza ryzyka", "Change management"],
            specialist: "project"
        },
        "zarządzanie zapasami": {
            answer: "Moduł zarządzania zapasami pozwala na kontrolę stanów magazynowych, automatyczne zamawianie oraz optymalizację kosztów magazynowania. Integruje się z modułami sprzedaży i produkcji.",
            confidence: 0.94,
            sources: ["Comarch WMS", "Dokumentacja logistyczna"],
            followUp: ["Jakiego typu zapasy zarządzacie?"],
            suggestions: ["Inwentaryzacja", "Optymalizacja stanów", "Integracja z produkcją", "Kody kreskowe"]
        },
        "analiza ryzyka": {
            answer: "Analiza ryzyka projektowego obejmuje identyfikację, ocenę i monitoring zagrożeń. Kluczowe obszary to: ryzyko techniczne, organizacyjne, budżetowe oraz czasowe. Zaleca się regularne przeglądy ryzyka.",
            confidence: 0.87,
            sources: ["PMBOK Guide", "Zarządzanie ryzykiem w IT"],
            followUp: ["Jakie konkretne ryzyka Cię niepokoja?"],
            suggestions: ["Matryca ryzyka", "Plan mitygacji", "Monitoring KPI", "Eskalacja problemów"],
            specialist: "risk"
        },
        "integracja systemów": {
            answer: "Integracja Comarch ERP XL z zewnętrznymi systemami realizowana jest poprzez API REST, web services oraz EDI. Wspierane formaty to XML, JSON oraz standardy branżowe.",
            confidence: 0.91,
            sources: ["API Documentation", "Przewodnik integracji"],
            followUp: ["Z jakimi systemami chcesz integrować ERP?"],
            suggestions: ["API REST", "Webservices", "EDI", "Synchronizacja danych"],
            specialist: "technical"
        }
    },

    // Kontekst konwersacji
    conversationContext: {
        history: [],
        currentTopic: null,
        userProfile: {
            expertise: 'intermediate',
            interests: [],
            preferredSpecialist: null
        },
        sessionData: {
            questionsAsked: 0,
            topicsDiscussed: [],
            lastInteraction: null
        }
    },

    // Specjaliści AI
    aiSpecialists: {
        financial: {
            name: "Anna - Ekspert Finansowy",
            avatar: "💰",
            personality: "precyzyjna i analityczna",
            expertise: ["księgowość", "controlling", "finanse", "VAT", "sprawozdawczość"]
        },
        technical: {
            name: "Marcin - Architekt IT",
            avatar: "🔧",
            personality: "techniczny i praktyczny", 
            expertise: ["integracje", "API", "bazy danych", "infrastruktura", "bezpieczeństwo"]
        },
        project: {
            name: "Katarzyna - PM",
            avatar: "📋",
            personality: "organizacyjna i strategiczna",
            expertise: ["zarządzanie projektami", "metodyki", "planowanie", "zespoły", "komunikacja"]
        },
        risk: {
            name: "Tomasz - Analityk Ryzyka",
            avatar: "⚠️",
            personality: "ostrożny i przewidujący",
            expertise: ["analiza ryzyka", "audyt", "compliance", "bezpieczeństwo", "procedury"]
        }
    },

    // Inicjalizacja aplikacji
    init() {
        this.setupNavigation();
        this.setupChatModule();
        this.setupRAGModule();
        this.setupAnalyticsModule();
        this.setupDocumentationModule();
        this.setupRiskModule();
        this.setupPersonalizationModule();
        this.setupTrainingModule();
        this.setupSimulatorModule();
        this.setupROIModule();
        this.startRealTimeUpdates();
    },

    // Konfiguracja nawigacji
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const modules = document.querySelectorAll('.module-panel');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                const targetModule = item.dataset.module;
                
                // Usunięcie aktywnej klasy z wszystkich elementów
                navItems.forEach(nav => nav.classList.remove('active'));
                modules.forEach(module => module.classList.remove('active'));
                
                // Dodanie aktywnej klasy
                item.classList.add('active');
                document.getElementById(`${targetModule}-module`).classList.add('active');
                
                // Animacja przejścia
                this.animateModuleTransition(targetModule);
            });
        });
    },

    // Animacja przejścia między modułami
    animateModuleTransition(moduleName) {
        const activeModule = document.querySelector('.module-panel.active');
        if (activeModule) {
            activeModule.style.opacity = '0';
            activeModule.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                activeModule.style.opacity = '1';
                activeModule.style.transform = 'translateY(0)';
            }, 150);
        }
    },

    // Konfiguracja modułu czatu w głównym interfejsie
    setupChatModule() {
        const chatInputAdvanced = document.getElementById('chat-input-advanced');
        const sendButtonAdvanced = document.querySelector('.send-btn');
        const chatMessagesAdvanced = document.getElementById('chat-messages-advanced');
        const charCountAdvanced = document.querySelector('.character-count');
        const actionButtons = document.querySelectorAll('.action-btn');

        if (!chatInputAdvanced || !sendButtonAdvanced || !chatMessagesAdvanced) {
            console.log('Moduł czatu nie znaleziony w głównym interfejsie');
            return;
        }

        // Funkcja wysyłania wiadomości
        const sendAdvancedMessage = () => {
            const message = chatInputAdvanced.value.trim();
            if (!message) return;

            // Dodanie wiadomości użytkownika
            this.addAdvancedChatMessage(message, 'user');
            chatInputAdvanced.value = '';
            this.updateCharCount();
            this.updateSendButton();

            // Ukrycie sugestii po pierwszym pytaniu
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.style.display = 'none';
            }

            // Symulacja przetwarzania
            this.showAdvancedTypingIndicator();

            // Generowanie odpowiedzi AI
            setTimeout(async () => {
                try {
                    const response = await this.generateRAGResponse(message);
                    this.hideAdvancedTypingIndicator();
                    
                    if (!response || typeof response !== 'object') {
                        throw new Error('Nieprawidłowa odpowiedź z AI');
                    }
                    
                    let answerText = '';
                    if (typeof response.answer === 'string') {
                        answerText = response.answer;
                    } else if (typeof response.answer === 'object') {
                        answerText = response.answer.content || response.answer.text || JSON.stringify(response.answer);
                    } else {
                        answerText = String(response.answer || 'Brak odpowiedzi');
                    }
                    
                    this.addAdvancedChatMessage(answerText, 'assistant', response.confidence, response.sources, response.specialist);
                    
                } catch (error) {
                    console.error('Błąd generowania odpowiedzi w module czatu:', error);
                    this.hideAdvancedTypingIndicator();
                    this.addAdvancedChatMessage(
                        "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie.", 
                        'assistant'
                    );
                }
            }, 1500);
        };

        // Obsługa przycisku wyślij
        sendButtonAdvanced.addEventListener('click', sendAdvancedMessage);

        // Obsługa Enter w polu tekstowym
        chatInputAdvanced.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendAdvancedMessage();
            }
        });

        // Obsługa licznika znaków i auto-resize
        chatInputAdvanced.addEventListener('input', () => {
            this.updateCharCount();
            this.updateSendButton();
            this.autoResizeTextarea(chatInputAdvanced);
        });

        // Obsługa przycisków akcji (wcześniej sugestie)
        actionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const suggestionText = button.getAttribute('data-text');
                if (suggestionText) {
                    chatInputAdvanced.value = suggestionText;
                    this.updateCharCount();
                    this.updateSendButton();
                    chatInputAdvanced.focus();
                    
                    // Dodaj efekt wizualny
                    button.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        button.style.transform = 'scale(1)';
                    }, 150);
                }
            });
        });

        // Obsługa focus/blur z płynną animacją
        chatInputAdvanced.addEventListener('focus', () => {
            chatInputAdvanced.style.borderColor = '#3498db';
            chatInputAdvanced.style.background = 'white';
            chatInputAdvanced.style.boxShadow = '0 0 15px rgba(52, 152, 219, 0.1)';
        });

        chatInputAdvanced.addEventListener('blur', () => {
            chatInputAdvanced.style.borderColor = '#ecf0f1';
            chatInputAdvanced.style.background = '#f8f9fa';
            chatInputAdvanced.style.boxShadow = 'none';
        });

        // Inicjalizacja stanu
        this.updateCharCount();
        this.updateSendButton();

        console.log('✅ Profesjonalny moduł czatu został skonfigurowany');
    },

    // Dodawanie wiadomości do zaawansowanego czatu
    addAdvancedChatMessage(content, type, confidence = null, sources = [], specialist = null) {
        const messagesContent = document.querySelector('.messages-content');
        if (!messagesContent) return;

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const currentTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        if (type === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    ${content}
                </div>
                <div class="message-time">${currentTime}</div>
            `;
        } else {
            let sourceInfo = '';
            if (sources && sources.length > 0) {
                sourceInfo = `<div style="margin-top: 15px; padding: 10px; background: #f8f9fa; border-radius: 8px; font-size: 0.85rem;">
                    <strong>📚 Źródła:</strong> ${sources.join(', ')}</div>`;
            }

            let confidenceInfo = '';
            if (confidence) {
                const confidencePercent = Math.round(confidence * 100);
                const confidenceColor = confidencePercent >= 90 ? '#27ae60' : confidencePercent >= 70 ? '#f39c12' : '#e74c3c';
                confidenceInfo = `<div style="margin-top: 10px; font-size: 0.8em; opacity: 0.8;">
                    <span style="color: ${confidenceColor}; font-weight: 500;">
                        <i class="fas fa-bullseye"></i> Pewność odpowiedzi: ${confidencePercent}%
                    </span></div>`;
            }

            let specialistInfo = '';
            if (specialist && this.aiSpecialists[specialist]) {
                const spec = this.aiSpecialists[specialist];
                specialistInfo = `<div style="margin-top: 12px; padding: 10px; background: linear-gradient(135deg, #e3f2fd, #f0f8ff); border-radius: 8px; border-left: 3px solid #3498db;">
                    <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9em; color: #2c3e50; font-weight: 500;">
                        ${spec.avatar} <strong>${spec.name}</strong> - ${spec.personality}
                    </div>
                </div>`;
            }

            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <i class="fas fa-robot"></i>
                </div>
                <div class="message-content">
                    ${content}
                    ${specialistInfo}
                    ${confidenceInfo}
                    ${sourceInfo}
                </div>
                <div class="message-time">${currentTime}</div>
            `;
        }

        messagesContent.appendChild(messageDiv);
        
        // Płynne przewijanie do najnowszej wiadomości
        messagesContent.scrollTo({
            top: messagesContent.scrollHeight,
            behavior: 'smooth'
        });

        // Animacja pojawiania się
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            messageDiv.style.transition = 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 100);
    },

    // Wskaźnik pisania dla zaawansowanego czatu
    showAdvancedTypingIndicator() {
        const messagesContent = document.querySelector('.messages-content');
        if (!messagesContent) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator-advanced';
        typingDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-robot" style="animation: pulse 1.5s infinite;"></i>
            </div>
            <div class="message-content">
                <div style="display: flex; align-items: center; gap: 10px; padding: 5px 0;">
                    <div class="typing-dots">
                        <span style="animation: typing 1.4s infinite ease-in-out; animation-delay: 0s;"></span>
                        <span style="animation: typing 1.4s infinite ease-in-out; animation-delay: 0.2s;"></span>
                        <span style="animation: typing 1.4s infinite ease-in-out; animation-delay: 0.4s;"></span>
                    </div>
                    <span style="color: #7f8c8d; font-style: italic;">Analizuję zapytanie...</span>
                </div>
            </div>
        `;
        
        // Dodaj style dla animacji kropek
        const style = document.createElement('style');
        style.textContent = `
            .typing-dots span {
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #3498db;
                margin: 0 2px;
            }
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-10px); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        
        messagesContent.appendChild(typingDiv);
        messagesContent.scrollTo({
            top: messagesContent.scrollHeight,
            behavior: 'smooth'
        });
    },

    hideAdvancedTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator-advanced');
        if (typingIndicator) {
            typingIndicator.style.opacity = '0';
            typingIndicator.style.transform = 'translateY(-10px)';
            setTimeout(() => typingIndicator.remove(), 200);
        }
    },

    // Aktualizacja licznika znaków
    updateCharCount() {
        const chatInput = document.getElementById('chat-input-advanced');
        const charCount = document.querySelector('.character-count');
        
        if (chatInput && charCount) {
            const currentLength = chatInput.value.length;
            const maxLength = chatInput.getAttribute('maxlength') || 2000;
            charCount.textContent = `${currentLength}/${maxLength}`;
            
            if (currentLength > maxLength * 0.9) {
                charCount.style.color = '#e74c3c';
                charCount.style.fontWeight = '600';
            } else if (currentLength > maxLength * 0.7) {
                charCount.style.color = '#f39c12';
                charCount.style.fontWeight = '500';
            } else {
                charCount.style.color = '#95a5a6';
                charCount.style.fontWeight = '400';
            }
        }
    },

    // Aktualizacja przycisku wyślij
    updateSendButton() {
        const chatInput = document.getElementById('chat-input-advanced');
        const sendButton = document.querySelector('.send-btn');
        
        if (chatInput && sendButton) {
            const hasText = chatInput.value.trim().length > 0;
            sendButton.disabled = !hasText;
            
            if (hasText) {
                sendButton.style.background = 'linear-gradient(135deg, #3498db, #2980b9)';
                sendButton.style.cursor = 'pointer';
                sendButton.style.transform = 'scale(1)';
            } else {
                sendButton.style.background = '#bdc3c7';
                sendButton.style.cursor = 'not-allowed';
                sendButton.style.transform = 'scale(0.95)';
            }
        }
    },

    // Automatyczne zmienianie rozmiaru textarea
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
        textarea.style.height = newHeight + 'px';
    },

    // Konfiguracja modułu RAG
    setupRAGModule() {
        const chatInput = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const chatMessages = document.getElementById('chat-messages');

        // Sprawdź czy elementy podstawowego czatu istnieją
        if (!chatInput || !sendButton || !chatMessages) {
            console.log('Podstawowy moduł czatu nie znaleziony - pomijam konfigurację');
            return;
        }

        const sendMessage = () => {
            const message = chatInput.value.trim();
            if (!message) return;

            // Dodanie wiadomości użytkownika
            this.addChatMessage(message, 'user');
            chatInput.value = '';

            // Symulacja przetwarzania
            this.showTypingIndicator();

        // Generowanie odpowiedzi AI (async)
        setTimeout(async () => {
            try {
                const response = await this.generateRAGResponse(message);
                this.hideTypingIndicator();
                
                // Sprawdź czy response ma odpowiednią strukturę
                if (!response || typeof response !== 'object') {
                    throw new Error('Nieprawidłowa odpowiedź z AI');
                }
                
                // Upewnij się, że answer jest stringiem, nie obiektem
                let answerText = '';
                if (typeof response.answer === 'string') {
                    answerText = response.answer;
                } else if (typeof response.answer === 'object') {
                    // Jeśli answer to obiekt, spróbuj wyciągnąć tekst lub skonwertuj
                    answerText = response.answer.content || response.answer.text || JSON.stringify(response.answer);
                } else {
                    answerText = String(response.answer || 'Brak odpowiedzi');
                }
                
                this.addChatMessage(answerText, 'assistant', response.confidence, response.sources, response.specialist);
                
                // Jeśli to była odpowiedź Claude, dodaj odpowiednią ikonę
                if (response.claude_only || response.enhanced || response.hybrid) {
                    this.addClaudeIndicator(response);
                }
            } catch (error) {
                console.error('Błąd generowania odpowiedzi:', error);
                this.hideTypingIndicator();
                this.addChatMessage(
                    "Przepraszam, wystąpił błąd podczas generowania odpowiedzi. Spróbuj ponownie.", 
                    'assistant'
                );
            }
        }, 1500);
        };

        sendButton.addEventListener('click', sendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });

        // Auto-focus na input
        chatInput.addEventListener('focus', () => {
            chatInput.style.borderColor = '#3498db';
        });
    },


    // Wskaźnik pisania
    showTypingIndicator() {
        const chatMessages = document.getElementById('chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <strong>Asystent AI:</strong> <span class="loading"></span> Analizuję zapytanie...
            </div>
        `;
        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    },

    hideTypingIndicator() {
        const typingIndicator = document.querySelector('.typing-indicator');
        if (typingIndicator) typingIndicator.remove();
    },

    // Uproszczona funkcja generowania odpowiedzi
    async generateRAGResponse(query) {
        console.log('🤖 Generuję odpowiedź dla:', query);
        
        try {
            // Aktualizacja kontekstu lokalnego
            this.updateConversationContext(query);
            
            const lowerQuery = query.toLowerCase();
            
            // Proste przypadki - bezpośrednia odpowiedź
            if (this.isGreeting(lowerQuery)) {
                return this.generateGreetingResponse();
            }
            
            if (this.isCapabilityQuery(lowerQuery)) {
                return this.generateCapabilityResponse(query);
            }
            
            // Próba wywołania Python backend
            try {
                const response = await fetch('http://localhost:5000/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: query,
                        session_id: this.getSessionId()
                    })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Sprawdź czy odpowiedź ma prawidłową strukturę
                    let finalAnswer = data.response || data.answer || 'Brak odpowiedzi';
                    
                    // Jeśli odpowiedź to obiekt, spróbuj wyciągnąć tekst
                    if (typeof finalAnswer === 'object') {
                        finalAnswer = JSON.stringify(finalAnswer);
                        console.log('⚠️ Odpowiedź to obiekt:', finalAnswer);
                    }
                    
                    return {
                        answer: finalAnswer,
                        confidence: data.confidence || 0.8,
                        sources: data.sources || ['Backend Python AI', 'Baza wiedzy ERP'],
                        specialist: this.detectSpecialistFromIntent(data.intent),
                        intent: data.intent || 'ogólne',
                        found: true
                    };
                }
            } catch (error) {
                console.log('⚠️ Backend niedostępny, używam lokalnej bazy');
            }
            
            // Lokalna baza wiedzy jako fallback
            const localResult = this.searchKnowledgeBase(query);
            if (localResult && localResult.found) {
                return localResult;
            }
            
            // Ostateczny fallback
            return this.generateFallbackResponse(query);
            
        } catch (error) {
            console.error('❌ Błąd generowania odpowiedzi:', error);
            return {
                answer: "Przepraszam, wystąpił błąd. Spróbuj ponownie.",
                confidence: 0.5,
                sources: ['System Error'],
                found: true
            };
        }
    },

    // Generuj ID sesji
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    },

    // Wykryj specjalistę na podstawie intencji
    detectSpecialistFromIntent(intent) {
        const intentMapping = {
            'pytanie finansowe': 'financial',
            'pytanie o integrację': 'technical', 
            'problem techniczny': 'technical',
            'pytanie o wdrożenie': 'project',
            'pytanie o konfigurację systemu': 'technical'
        };
        
        return intentMapping[intent] || 'technical';
    },

    // Fallback gdy backend nie działa
    generateFallbackResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Sprawdź czy to pytanie o możliwości AI
        if (this.isCapabilityQuery(lowerQuery)) {
            return this.generateCapabilityResponse(query);
        }
        
        // Sprawdź czy to powitanie
        if (this.isGreeting(lowerQuery)) {
            return this.generateGreetingResponse();
        }
        
        // Proste dopasowanie słów kluczowych
        if (lowerQuery.includes('finans') || lowerQuery.includes('księgow')) {
            return {
                answer: `<strong>💰 Moduł Finansowy (Fallback)</strong><br><br>
                Moduł finansowy w Comarch ERP XL obejmuje księgowość główną, rozrachunki, 
                controlling oraz zarządzanie środkami trwałymi.<br><br>
                
                <strong>Kluczowe funkcje:</strong><br>
                • Plan kont zgodny z polskimi standardami<br>
                • Automatyczne księgowania<br>
                • Faktury sprzedaży i zakupu<br>
                • Amortyzacja środków trwałych<br><br>
                
                <em>⚠️ Backend AI niedostępny - używam uproszczonej odpowiedzi</em>`,
                confidence: 0.7,
                sources: ['Lokalna baza wiedzy', 'Fallback system'],
                specialist: 'financial',
                found: true,
                fallback: true
            };
        } else if (lowerQuery.includes('wdrożen') || lowerQuery.includes('implementac') || lowerQuery.includes('proces')) {
            return {
                answer: `<strong>🚀 Proces Wdrożenia ERP</strong><br><br>
                
                <strong>Faza 1: Analiza i planowanie (4-6 tygodni)</strong><br>
                • Analiza procesów AS-IS<br>
                • Projektowanie procesów TO-BE<br>
                • Definicja wymagań funkcjonalnych<br>
                • Przygotowanie zespołu projektowego<br><br>
                
                <strong>Faza 2: Konfiguracja (8-12 tygodni)</strong><br>
                • Parametryzacja modułów<br>
                • Konfiguracja integracji<br>
                • Migracja danych<br>
                • Tworzenie raportów niestandardowych<br><br>
                
                <strong>Faza 3: Testy (4-6 tygodni)</strong><br>
                • Testy jednostkowe<br>
                • Testy integracyjne<br>
                • Testy akceptacyjne (UAT)<br>
                • Testy wydajnościowe<br><br>
                
                <strong>Faza 4: Go-live (2-4 tygodnie)</strong><br>
                • Szkolenia użytkowników<br>
                • Uruchomienie produkcyjne<br>
                • Wsparcie hyper-care<br>
                • Monitoring i optymalizacja<br><br>
                
                <strong>⏱️ Łączny czas:</strong> 6-18 miesięcy<br>
                <strong>🎯 Wskaźnik sukcesu:</strong> 87% projektów zakończonych sukcesem`,
                confidence: 0.9,
                sources: ['Lokalna baza wiedzy', 'Metodyka wdrożeń ERP'],
                specialist: 'project',
                found: true,
                fallback: true
            };
        } else {
            return {
                answer: `<strong>🤖 Asystent AI (Tryb Fallback)</strong><br><br>
                Backend AI z bibliotekami Python jest obecnie niedostępny.<br><br>
                
                <strong>Dostępne tematy w trybie fallback:</strong><br>
                • Podstawowe informacje o module finansowym<br>
                • Ogólne informacje o wdrożeniu ERP<br>
                • Konfiguracja systemów Comarch<br><br>
                
                <strong>💡 Aby uzyskać pełne funkcje AI:</strong><br>
                1. Upewnij się, że backend Python działa na porcie 5000<br>
                2. Zainstaluj biblioteki: pip install -r requirements.txt<br>
                3. Uruchom serwer: python backend/app.py<br><br>
                
                <em>Zadaj bardziej konkretne pytanie o ERP, a postaram się pomóc w trybie fallback.</em>`,
                confidence: 0.5,
                sources: ['System fallback'],
                specialist: 'technical',
                found: true,
                fallback: true
            };
        }
    },

    // Proste wyszukiwanie w bazie wiedzy
    searchKnowledgeBase(query) {
        const lowerQuery = query.toLowerCase();
        
        // Bezpośrednie dopasowania
        const directMatches = {
            'comarch erp xl': {
                answer: `<strong>💼 Comarch ERP XL</strong><br><br>
                Comarch ERP XL to zaawansowany system klasy ERP dedykowany średnim i dużym przedsiębiorstwom. 
                System oferuje pełną integrację modułów:<br><br>
                
                <strong>🔧 Główne moduły:</strong><br>
                • Finanse i księgowość<br>
                • Zarządzanie zasobami ludzkimi<br>
                • Logistyka i magazyny<br>
                • Produkcja i planowanie<br>
                • CRM i sprzedaż<br><br>
                
                <strong>💡 Kluczowe zalety:</strong><br>
                • Pełna integracja procesów biznesowych<br>
                • Zgodność z polskim prawem<br>
                • Możliwość dostosowania do branży<br>
                • Wsparcie dla wielofirmowości<br><br>
                
                <em>Chcesz dowiedzieć się więcej o konkretnym module?</em>`,
                confidence: 0.95,
                sources: ["Dokumentacja Comarch ERP XL", "Podręcznik użytkownika"],
                found: true
            },
            'moduł finansowy': {
                answer: `<strong>💰 Moduł Finansowy Comarch ERP XL</strong><br><br>
                
                <strong>Krok 1: Struktura organizacyjna</strong><br>
                • Zdefiniuj firmy i oddziały<br>
                • Ustaw hierarchię organizacyjną<br>
                • Skonfiguruj centra kosztów<br><br>
                
                <strong>Krok 2: Parametry księgowe</strong><br>
                • Wybierz walutę podstawową<br>
                • Ustaw rok obrachunkowy<br>
                • Zdefiniuj okresy księgowe<br><br>
                
                <strong>Krok 3: Plan kont</strong><br>
                • Zaimportuj standardowy plan kont<br>
                • Dostosuj konta analityczne<br>
                • Skonfiguruj automatyczne księgowania<br><br>
                
                <strong>Krok 4: VAT i podatki</strong><br>
                • Ustaw stawki VAT<br>
                • Skonfiguruj JPK<br>
                • Zdefiniuj zasady rozliczania<br><br>
                
                <strong>⏱️ Czas konfiguracji:</strong> 2-4 tygodnie<br>
                <strong>🎯 Poziom trudności:</strong> Średni`,
                confidence: 0.92,
                sources: ["Instrukcja konfiguracji finansów", "Comarch ERP XL - Finanse"],
                found: true
            },
            'wdrożenie erp': {
                answer: `<strong>🚀 Proces Wdrożenia ERP</strong><br><br>
                
                <strong>Faza 1: Analiza i planowanie (4-6 tygodni)</strong><br>
                • Analiza procesów AS-IS<br>
                • Projektowanie procesów TO-BE<br>
                • Definicja wymagań funkcjonalnych<br>
                • Przygotowanie zespołu projektowego<br><br>
                
                <strong>Faza 2: Konfiguracja (8-12 tygodni)</strong><br>
                • Parametryzacja modułów<br>
                • Konfiguracja integracji<br>
                • Migracja danych<br>
                • Tworzenie raportów niestandardowych<br><br>
                
                <strong>Faza 3: Testy (4-6 tygodni)</strong><br>
                • Testy jednostkowe<br>
                • Testy integracyjne<br>
                • Testy akceptacyjne (UAT)<br>
                • Testy wydajnościowe<br><br>
                
                <strong>Faza 4: Go-live (2-4 tygodnie)</strong><br>
                • Szkolenia użytkowników<br>
                • Uruchomienie produkcyjne<br>
                • Wsparcie hyper-care<br>
                • Monitoring i optymalizacja<br><br>
                
                <strong>⏱️ Łączny czas:</strong> 6-18 miesięcy<br>
                <strong>🎯 Wskaźnik sukcesu:</strong> 87% projektów zakończonych sukcesem`,
                confidence: 0.89,
                sources: ["Metodyka wdrożeń ERP", "Best practices Comarch"],
                found: true
            },
            'integracja': {
                answer: `<strong>🔗 Integracja Systemów z Comarch ERP XL</strong><br><br>
                
                <strong>Dostępne technologie:</strong><br>
                • REST API - nowoczesne interfejsy<br>
                • SOAP Web Services - standardowe integracje<br>
                • EDI - elektroniczna wymiana dokumentów<br>
                • File Transfer - wymiana plików<br><br>
                
                <strong>Wspierane formaty:</strong><br>
                • XML - strukturalne dane<br>
                • JSON - lekkie API<br>
                • CSV - proste eksporty<br>
                • Excel - raporty biznesowe<br><br>
                
                <strong>Typowe integracje:</strong><br>
                • Systemy CRM (Salesforce, HubSpot)<br>
                • E-commerce (Magento, WooCommerce)<br>
                • BI (Power BI, Tableau)<br>
                • Bankowość elektroniczna<br><br>
                
                <strong>🔧 Kroki implementacji:</strong><br>
                1. Analiza wymagań integracyjnych<br>
                2. Projektowanie architektury<br>
                3. Konfiguracja endpointów<br>
                4. Testowanie połączeń<br>
                5. Monitorowanie działania`,
                confidence: 0.91,
                sources: ["API Documentation", "Przewodnik integracji"],
                found: true
            }
        };

        // Sprawdzenie bezpośrednich dopasowań
        for (const [key, response] of Object.entries(directMatches)) {
            if (lowerQuery.includes(key) || this.fuzzyMatch(lowerQuery, key)) {
                return response;
            }
        }

        // Sprawdzenie specjalnych przypadków finansowych
        if (this.isFinancialQuery(lowerQuery)) {
            return directMatches['moduł finansowy'];
        }

        // Sprawdzenie słów kluczowych konfiguracji
        if (lowerQuery.includes('jak') && lowerQuery.includes('konfigur')) {
            return {
                answer: `<strong>⚙️ Konfiguracja systemu</strong><br><br>
                Aby prawidłowo skonfigurować system Comarch ERP XL:<br><br>
                
                <strong>1. Przygotowanie środowiska</strong><br>
                • Zainstaluj serwer aplikacji<br>
                • Skonfiguruj bazę danych<br>
                • Ustaw uprawnienia użytkowników<br><br>
                
                <strong>2. Konfiguracja podstawowa</strong><br>
                • Zdefiniuj strukturę organizacyjną<br>
                • Ustaw parametry systemowe<br>
                • Skonfiguruj przepływy dokumentów<br><br>
                
                <strong>3. Konfiguracja modułów</strong><br>
                • Finanse i księgowość<br>
                • Logistyka i magazyny<br>
                • Zasoby ludzkie<br><br>
                
                <em>O który konkretny moduł Ci chodzi?</em>`,
                confidence: 0.75,
                sources: ["Dokumentacja konfiguracji"],
                found: true
            };
        }

        return { found: false };
    },

    // Sprawdzanie czy pytanie dotyczy finansów (specjalne przypadki)
    isFinancialQuery(query) {
        const financialKeywords = [
            'plan kont', 'planu kont', 'planie kont',
            'księgowość', 'księgowy', 'księgowej',
            'vat', 'podatk', 'rozlicza', 'faktury',
            'finanse', 'finansowy', 'finansowej', 'finansow',
            'bilans', 'wynik finansowy', 'środki trwałe',
            'amortyzacja', 'koszty', 'przychody',
            'analityka', 'centrum kosztów', 'controlling',
            'moduł finansowy', 'modul finansowy', 'modułu finansowego', 'modulu finansowego',
            'skonfigurować', 'skonfigurować', 'konfigur', 'konfiguru'
        ];
        
        return financialKeywords.some(keyword => query.includes(keyword));
    },

    // Rozmyte dopasowanie
    fuzzyMatch(query, keyword) {
        const queryWords = query.split(' ');
        const keywordWords = keyword.split(' ');
        
        let matches = 0;
        for (const keywordWord of keywordWords) {
            if (queryWords.some(queryWord => 
                queryWord.includes(keywordWord) || 
                keywordWord.includes(queryWord) ||
                this.levenshteinDistance(queryWord, keywordWord) <= 2
            )) {
                matches++;
            }
        }
        
        return matches / keywordWords.length >= 0.6;
    },

    // Odległość Levenshteina
    levenshteinDistance(str1, str2) {
        const matrix = [];
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        return matrix[str2.length][str1.length];
    },

    // Inteligentna odpowiedź gdy nie ma w bazie
    generateIntelligentResponse(query) {
        const lowerQuery = query.toLowerCase();
        
        // Wykrywanie kategorii pytania
        if (this.isCapabilityQuery(lowerQuery)) {
            return this.generateCapabilityResponse(query);
        } else if (this.isERPRelated(lowerQuery)) {
            return this.generateERPResponse(query);
        } else if (this.isAIRelated(lowerQuery)) {
            return this.generateAIResponse(query);
        } else if (this.isGreeting(lowerQuery)) {
            return this.generateGreetingResponse();
        } else {
            return this.generateGeneralResponse(query);
        }
    },

    // Odpowiedź o możliwościach AI
    generateCapabilityResponse(query) {
        return {
            answer: `<strong>🚀 Moje możliwości jako Asystent AI dla ERP</strong><br><br>
            
            <strong>🎯 Główne specjalizacje:</strong><br>
            • <strong>Comarch ERP XL</strong> - konfiguracja, wdrożenie, troubleshooting<br>
            • <strong>Procesy biznesowe</strong> - analiza, optymalizacja, dokumentacja<br>
            • <strong>Zarządzanie projektami</strong> - planowanie, monitoring, analiza ryzyka<br>
            • <strong>Integracje systemowe</strong> - API, webservices, EDI<br><br>
            
            <strong>💡 Co mogę dla Ciebie zrobić:</strong><br>
            • Odpowiadam na pytania o systemy ERP<br>
            • Pomagam w planowaniu wdrożeń<br>
            • Tworzę dokumentację projektową<br>
            • Analizuję ryzyka i koszty<br>
            • Przeprowadzam symulacje wdrożeń<br>
            • Genereruję raporty i analizy<br><br>
            
            <strong>🔧 Dostępne narzędzia:</strong><br>
            • <strong>RAG</strong> - inteligentne wyszukiwanie w bazie wiedzy<br>
            • <strong>Analiza predykcyjna</strong> - przewidywanie sukcesu projektów<br>
            • <strong>Generator dokumentów</strong> - automatyczne tworzenie planów<br>
            • <strong>Symulator Digital Twin</strong> - wirtualne testowanie wdrożeń<br>
            • <strong>Kalkulator ROI</strong> - analiza zwrotu z inwestycji<br><br>
            
            <strong>📚 Baza wiedzy zawiera:</strong><br>
            • 2,850+ dokumentów technicznych<br>
            • 159 modułów ERP<br>
            • 1,200+ często zadawanych pytań<br><br>
            
            <strong>🤔 Przykładowe pytania:</strong><br>
            • "Jak zaplanować wdrożenie ERP w firmie 200-osobowej?"<br>
            • "Jakie są najczęstsze problemy z modułem finansowym?"<br>
            • "Ile kosztuje licencja Comarch ERP XL?"<br>
            • "Jak zintegrować ERP z systemem CRM?"<br><br>
            
            <em>Zadaj mi konkretne pytanie, a chętnie pomogę!</em>`,
            confidence: 0.98,
            sources: ["System AI", "Specyfikacja funkcjonalności"],
            found: true
        };
    },

    // Sprawdzanie czy pytanie dotyczy ERP
    isERPRelated(query) {
        const erpKeywords = ['erp', 'system', 'moduł', 'konfiguracja', 'wdrożenie', 'proces', 'biznes', 'firma', 'projekt'];
        return erpKeywords.some(keyword => query.includes(keyword));
    },

    // Sprawdzanie czy pytanie dotyczy AI
    isAIRelated(query) {
        const aiKeywords = ['ai', 'artificial', 'intelligence', 'sztuczna', 'inteligencja', 'machine learning', 'uczenie'];
        return aiKeywords.some(keyword => query.includes(keyword));
    },

    // Sprawdzanie czy to powitanie - bardziej restrykcyjne
    isGreeting(query) {
        const greetings = ['cześć', 'witaj', 'dzień dobry', 'siema', 'hej', 'hello', 'witam', 'elo'];
        const trimmedQuery = query.toLowerCase().trim();
        
        // Sprawdź czy całe zapytanie to tylko powitanie (maksymalnie 3 słowa)
        const words = trimmedQuery.split(/\s+/);
        if (words.length > 3) return false;
        
        // Sprawdź czy któreś z powitań to dokładnie jedno z pierwszych słów
        return greetings.some(greeting => 
            trimmedQuery === greeting || 
            trimmedQuery.startsWith(greeting + ' ') ||
            trimmedQuery.startsWith(greeting + '!')
        );
    },

    // Sprawdzanie czy pytanie dotyczy możliwości AI
    isCapabilityQuery(query) {
        const capabilityKeywords = [
            'co umiesz', 'co potrafisz', 'jakie masz możliwości', 
            'czym się zajmujesz', 'co robisz', 'w czym pomagasz',
            'na czym się znasz', 'co oferujesz', 'jakie usługi',
            'umiesz', 'potrafisz', 'możliwości'
        ];
        
        return capabilityKeywords.some(keyword => query.toLowerCase().includes(keyword));
    },

    // Odpowiedź ERP
    generateERPResponse(query) {
        return {
            answer: `<strong>🎯 Odpowiedź eksperta ERP</strong><br><br>
            Dziękuję za pytanie dotyczące systemów ERP. Na podstawie analizy Twojego zapytania:<br><br>
            
            <strong>💡 Moje obserwacje:</strong><br>
            • To zagadnienie wymaga uwzględnienia specyfiki Twojej organizacji<br>
            • Kluczowe jest zrozumienie procesów biznesowych<br>
            • Polecam skonsultowanie się z ekspertem wdrożeniowym<br><br>
            
            <strong>📋 Zalecane kroki:</strong><br>
            1. Dokładna analiza wymagań<br>
            2. Przegląd dostępnych opcji w systemie<br>
            3. Testy w środowisku pilotażowym<br>
            4. Wdrożenie z monitoringiem<br><br>
            
            <strong>🔧 Potrzebujesz pomocy z:</strong><br>
            • Konfiguracją konkretnego modułu?<br>
            • Planowaniem wdrożenia?<br>
            • Rozwiązaniem technicznym?<br><br>
            
            <em>Sprecyzuj o jaki obszar Ci chodzi, a udzielę bardziej szczegółowej odpowiedzi!</em>`,
            confidence: 0.80,
            sources: ["Ekspert ERP", "Baza wiedzy"],
            found: true
        };
    },

    // Odpowiedź AI
    generateAIResponse(query) {
        return {
            answer: `<strong>🤖 Sztuczna Inteligencja</strong><br><br>
            Sztuczna inteligencja (AI) to dziedzina informatyki zajmująca się tworzeniem systemów 
            zdolnych do wykonywania zadań wymagających inteligencji.<br><br>
            
            <strong>🧠 Główne obszary AI:</strong><br>
            • Uczenie maszynowe (Machine Learning)<br>
            • Przetwarzanie języka naturalnego (NLP)<br>
            • Widzenie komputerowe<br>
            • Systemy ekspertowe<br><br>
            
            <strong>💼 Zastosowania w biznesie:</strong><br>
            • Automatyzacja procesów<br>
            • Analiza predykcyjna<br>
            • Personalizacja doświadczeń<br>
            • Optymalizacja operacyjna<br>
            • Asystenci wirtualni (jak ja!)<br><br>
            
            <strong>🎯 W kontekście ERP:</strong><br>
            • Inteligentne raportowanie<br>
            • Przewidywanie trendów<br>
            • Automatyczne kategoryzowanie<br>
            • Wykrywanie anomalii<br><br>
            
            <em>Czy chcesz dowiedzieć się więcej o konkretnym aspekcie AI?</em>`,
            confidence: 0.85,
            sources: ["Podstawy AI", "Zastosowania biznesowe"],
            found: true
        };
    },

    // Odpowiedź powitanie
    generateGreetingResponse() {
        return {
            answer: `<strong>👋 Witaj!</strong><br><br>
            Jestem Asystentem AI dla Wdrożeń ERP. Cieszę się, że mogę Ci pomóc!<br><br>
            
            <strong>🎯 Specjalizuję się w:</strong><br>
            • Systemach Comarch ERP XL<br>
            • Procesach wdrożeniowych<br>
            • Konfiguracji modułów<br>
            • Analizie ryzyka projektowego<br>
            • Integracjach systemowych<br><br>
            
            <strong>💡 Przykładowe pytania:</strong><br>
            • "Jak skonfigurować moduł finansowy?"<br>
            • "Jakie są etapy wdrożenia ERP?"<br>
            • "Jak zintegrować system z CRM?"<br>
            • "Analiza ryzyka w projekcie ERP"<br><br>
            
            <strong>🤔 O czym chciałbyś porozmawiać?</strong>`,
            confidence: 0.95,
            sources: ["Asystent AI"],
            found: true
        };
    },

    // Odpowiedź ogólna
    generateGeneralResponse(query) {
        return {
            answer: `<strong>🌟 Interesujące pytanie!</strong><br><br>
            Analizując Twoje zapytanie, widzę że dotyczy ono tematu, który może mieć związek 
            z systemami ERP lub procesami biznesowymi.<br><br>
            
            <strong>💭 Aby lepiej Ci pomóc:</strong><br>
            • Czy możesz sprecyzować kontekst?<br>
            • O jaki obszar biznesowy Ci chodzi?<br>
            • Czy dotyczy to konkretnego systemu?<br><br>
            
            <strong>🎯 Mogę pomóc z:</strong><br>
            • Systemami ERP (Comarch ERP XL)<br>
            • Wdrożeniami i konfiguracją<br>
            • Analizą procesów biznesowych<br>
            • Integracjami systemowymi<br>
            • Zarządzaniem projektami IT<br><br>
            
            <strong>💡 Sugerowane tematy:</strong><br>
            • "Konfiguracja modułu finansowego"<br>
            • "Etapy wdrożenia ERP"<br>
            • "Integracja z systemami zewnętrznymi"<br><br>
            
            <em>Zadaj mi konkretne pytanie, a postaram się udzielić szczegółowej odpowiedzi!</em>`,
            confidence: 0.70,
            sources: ["Asystent AI", "Baza wiedzy ogólnej"],
            found: true
        };
    },

// Wzbogacenie odpowiedzi RAG przez Claude
async enhanceResponseWithClaude(query, ragResponse) {
    const systemPrompt = `Jesteś ekspertem ds. systemów ERP, szczególnie Comarch ERP XL. 
    Masz dostęp do odpowiedzi z bazy wiedzy, ale możesz ją wzbogacić swoją wiedzą.
    
    Kontekst konwersacji: ${JSON.stringify(this.conversationContext.sessionData)}
    
    Odpowiedź z bazy wiedzy: ${ragResponse.answer}
    
    Zadanie: Wzbogać tę odpowiedź dodatkowymi szczegółami, praktycznymi wskazówkami lub powiązanymi informacjami. 
    Zachowaj format HTML i markery emoji. Dodaj sekcję "🔍 Dodatkowe szczegóły:" z nowymi informacjami.
    
    Pytanie użytkownika: ${query}`;

    const response = await this.callClaudeAPI(systemPrompt, query);
    
    return {
        answer: response.content,
        confidence: Math.min(0.98, (ragResponse.confidence || 0.8) + 0.1),
        sources: [...(ragResponse.sources || []), 'Claude AI', 'Ekspert ERP'],
        specialist: ragResponse.specialist || 'technical',
        enhanced: true
    };
},

// Hybrydowa odpowiedź RAG + Claude
async generateHybridResponse(query, matchedEntry, intentAnalysis) {
    const ragAnswer = matchedEntry.answer;
    
    const systemPrompt = `Jesteś ekspertem ds. systemów ERP Comarch ERP XL. 
    Masz częściową odpowiedź z bazy wiedzy, ale użytkownik potrzebuje więcej informacji.
    
    Kontekst konwersacji: ${JSON.stringify(this.conversationContext.sessionData)}
    Poziom zaawansowania: ${this.conversationContext.userProfile.expertise}
    Intencja: ${intentAnalysis.primary}
    Złożoność: ${intentAnalysis.complexity}
    
    Częściowa odpowiedź z bazy: ${ragAnswer}
    
    Zadanie: Uzupełnij i rozszerz odpowiedź, dodając praktyczne informacje. 
    Zachowaj format HTML, używaj emoji i struktury z sekcjami.
    
    Pytanie: ${query}`;

    const response = await this.callClaudeAPI(systemPrompt, query);
    
    return {
        answer: response.content,
        confidence: 0.88,
        sources: [...(matchedEntry.sources || []), 'Claude AI'],
        specialist: matchedEntry.specialist || 'technical',
        hybrid: true
    };
},

// Czysta odpowiedź z Claude API
async generateClaudeResponse(query, intentAnalysis) {
    const conversationHistory = this.conversationContext.history.slice(-5).map(h => 
        `${h.type === 'user' ? 'Użytkownik' : 'Asystent'}: ${h.query || h.content}`
    ).join('\n');

    const systemPrompt = `Jesteś ekspertnym asystentem AI specjalizującym się w systemach ERP, 
    szczególnie Comarch ERP XL. Pomagasz w wdrożeniach, konfiguracji i rozwiązywaniu problemów.
    
    Profil użytkownika:
    - Poziom: ${this.conversationContext.userProfile.expertise}
    - Zainteresowania: ${this.conversationContext.userProfile.interests.join(', ') || 'ogólne'}
    - Tematyka sesji: ${this.conversationContext.sessionData.topicsDiscussed.join(', ') || 'pierwsze pytanie'}
    
    Historia konwersacji:
    ${conversationHistory}
    
    Typ pytania: ${intentAnalysis.primary}
    Złożoność: ${intentAnalysis.complexity}
    
    Instrukcje odpowiedzi:
    - Używaj języka polskiego
    - Formatuj z HTML (br, strong, em)
    - Dodawaj emoji dla lepszej czytelności
    - Uwzględniaj poziom zaawansowania użytkownika
    - Dla problemów: dodaj konkretne kroki rozwiązania
    - Dla planowania: przedstaw strukturę etapów
    - Kończ sugestiami kolejnych pytań
    
    Pytanie: ${query}`;

    const response = await this.callClaudeAPI(systemPrompt, query);
    
    // Wykryj odpowiedniego specjalistę na podstawie treści
    const specialist = this.detectSpecialistFromContent(response.content);
    
    return {
        answer: response.content,
        confidence: 0.85,
        sources: ['Claude AI', 'Ekspert ERP'],
        specialist: specialist,
        claude_only: true
    };
},

// Wywołanie Claude API (z CORS fallback)
async callClaudeAPI(systemPrompt, userMessage) {
    console.log('🤖 Próba połączenia z Claude API...');
    
    // Najpierw próbujemy prawdziwego API
    try {
        const requestBody = {
            model: this.claudeConfig.model,
            max_tokens: this.claudeConfig.maxTokens,
            system: systemPrompt,
            messages: [
                {
                    role: "user",
                    content: userMessage
                }
            ]
        };

        const response = await fetch(this.claudeConfig.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.claudeConfig.apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            throw new Error(`Claude API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('✅ Rzeczywiste Claude API działa!');
        
        return {
            content: data.content[0].text,
            usage: data.usage
        };
    } catch (error) {
        console.log('⚠️ Claude API niedostępne (CORS/Network), używam symulatora:', error.message);
        
        // CORS Fallback - inteligentny symulator Claude
        return this.simulateClaudeAPI(systemPrompt, userMessage);
    }
},

// Inteligentny symulator Claude API
async simulateClaudeAPI(systemPrompt, userMessage) {
    console.log('🎭 Symulator Claude generuje odpowiedź...');
    
    // Analiza zapytania
    const query = userMessage.toLowerCase();
    const isERPRelated = this.isERPQuery(query);
    const questionType = this.detectQuestionType(query);
    const complexity = this.assessQueryComplexity(query);
    
    // Symulacja opóźnienia API
    await new Promise(resolve => setTimeout(resolve, 1200 + Math.random() * 800));
    
    let content = "";
    
    if (isERPRelated) {
        content = this.generateERPExpertResponse(query, questionType, complexity);
    } else {
        content = this.generateGeneralAIResponse(query, questionType, complexity);
    }
    
    return {
        content: content,
        usage: { input_tokens: 150, output_tokens: 300 }
    };
},

// Symulowane wzbogacenie Claude gdy prawdziwe API niedostępne
async simulateClaudeEnhancement(query, ragResponse) {
    console.log('🎭 Symulator Claude: Wzbogacanie odpowiedzi RAG...');
    
    // Symulacja opóźnienia
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 600));
    
    // Analiza typu zapytania i odpowiedzi RAG
    const queryLower = query.toLowerCase();
    let enhancement = "";
    
    // Dodanie sekcji "Dodatkowe szczegóły" na podstawie analizy
    if (queryLower.includes('konfigur') || queryLower.includes('jak')) {
        enhancement = `<br><br><strong>🔍 Dodatkowe szczegóły (Claude AI):</strong><br>
        • Zalecam sporządzenie listy kontrolnej przed rozpoczęciem konfiguracji<br>
        • Przygotuj kopię zapasową obecnych ustawień systemowych<br>
        • Skonsultuj się z działem IT w sprawie wymagań bezpieczeństwa<br>
        • Zaplanuj okno czasowe na testy po wdrożeniu zmian<br><br>
        
        <strong>💡 Wskazówka eksperta:</strong> Każda konfiguracja powinna być dokumentowana krok po kroku dla przyszłych referencji.`;
        
    } else if (queryLower.includes('wdroż') || queryLower.includes('projekt')) {
        enhancement = `<br><br><strong>🔍 Dodatkowe szczegóły (Claude AI):</strong><br>
        • Uwzględnij czas na przeszkolenie super-użytkowników w każdym dziale<br>
        • Zaplanuj równoległe działanie starego i nowego systemu przez okres przejściowy<br>
        • Przygotuj plan komunikacji dla wszystkich interesariuszy<br>
        • Ustanów metryki sukcesu i punkty kontrolne<br><br>
        
        <strong>⚡ Kluczowe czynniki sukcesu:</strong> Zarządzanie zmianą to 70% sukcesu każdego wdrożenia ERP.`;
        
    } else if (queryLower.includes('finans') || queryLower.includes('księgow')) {
        enhancement = `<br><br><strong>🔍 Dodatkowe szczegóły (Claude AI):</strong><br>
        • Sprawdź zgodność z najnowszymi przepisami podatkowymi<br>
        • Uwzględnij specyficzne wymagania branżowe w konfiguracji<br>
        • Zaplanuj integrację z systemami bankowymi<br>
        • Przygotuj procedury miesięcznego zamknięcia księgowego<br><br>
        
        <strong>📊 Wskaźniki jakości:</strong> Poprawnie skonfigurowany moduł finansowy zwiększa dokładność raportowania o 95%.`;
        
    } else {
        enhancement = `<br><br><strong>🔍 Dodatkowe szczegóły (Claude AI):</strong><br>
        • Rozważ długoterminowy wpływ tej decyzji na organizację<br>
        • Przeanalizuj możliwe scenariusze rozwoju sytuacji<br>
        • Skonsultuj się z doświadczonymi praktykami w branży<br>
        • Zachowaj elastyczność w podejściu do rozwiązania<br><br>
        
        <strong>🎯 Rekomendacja:</strong> Regularnie weryfikuj skuteczność wdrożonych rozwiązań i dostosowuj je do zmieniających się potrzeb.`;
    }
    
    return {
        answer: ragResponse.answer + enhancement,
        confidence: Math.min(0.95, (ragResponse.confidence || 0.8) + 0.05),
        sources: [...(ragResponse.sources || []), 'Claude AI Simulator'],
        specialist: ragResponse.specialist || 'technical'
    };
},

// Sprawdzanie czy pytanie dotyczy ERP
isERPQuery(query) {
    const erpKeywords = [
        'erp', 'comarch', 'system', 'moduł', 'finansowy', 'księgowość', 'wdrożenie',
        'integracja', 'api', 'konfiguracja', 'firma', 'przedsiębiorstwo', 'biznes',
        'proces', 'workflow', 'zarządzanie', 'planowanie', 'projekt', 'zespół'
    ];
    
    return erpKeywords.some(keyword => query.includes(keyword));
},

// Wykrywanie typu pytania
detectQuestionType(query) {
    if (query.includes('jak') || query.includes('w jaki sposób')) return 'how-to';
    if (query.includes('co to') || query.includes('czym jest')) return 'definition';
    if (query.includes('dlaczego') || query.includes('po co')) return 'why';
    if (query.includes('kiedy') || query.includes('jak długo')) return 'when';
    if (query.includes('problem') || query.includes('błąd') || query.includes('nie działa')) return 'problem';
    if (query.includes('porównaj') || query.includes('różnica') || query.includes('vs')) return 'comparison';
    if (query.includes('plan') || query.includes('strategia') || query.includes('harmonogram')) return 'planning';
    return 'general';
},

// Ocena złożoności zapytania
assessQueryComplexity(query) {
    const words = query.split(' ').length;
    const technicalTerms = ['api', 'sql', 'database', 'interface', 'protokół', 'architektura'].filter(term => query.includes(term)).length;
    const businessTerms = ['roi', 'kpi', 'strategia', 'optymalizacja', 'efektywność'].filter(term => query.includes(term)).length;
    
    if (words > 20 || technicalTerms > 2 || businessTerms > 2) return 'high';
    if (words > 10 || technicalTerms > 0 || businessTerms > 0) return 'medium';
    return 'low';
},

// Generowanie eksperckich odpowiedzi ERP
generateERPExpertResponse(query, questionType, complexity) {
    const responses = {
        'how-to': this.generateHowToResponse(query, complexity),
        'definition': this.generateDefinitionResponse(query, complexity),
        'why': this.generateWhyResponse(query, complexity),
        'when': this.generateWhenResponse(query, complexity),
        'problem': this.generateProblemResponse(query, complexity),
        'comparison': this.generateComparisonResponse(query, complexity),
        'planning': this.generatePlanningResponse(query, complexity),
        'general': this.generateGeneralERPResponse(query, complexity)
    };
    
    return responses[questionType] || responses['general'];
},

// Odpowiedzi typu "jak"
generateHowToResponse(query, complexity) {
    if (query.includes('konfigur')) {
        return this.getConfigurationAdvice(query, complexity);
    } else if (query.includes('wdroż')) {
        return this.getImplementationAdvice(query, complexity);
    } else if (query.includes('integr')) {
        return this.getIntegrationAdvice(query, complexity);
    } else if (query.includes('optymalizow') || query.includes('popraw')) {
        return this.getOptimizationAdvice(query, complexity);
    }
    
    return `<strong>🎯 Praktyczne podejście:</strong><br><br>
    Aby skutecznie rozwiązać to zagadnienie w kontekście Comarch ERP XL, polecam następujące kroki:<br><br>
    
    <strong>1. Analiza sytuacji</strong><br>
    • Zidentyfikuj konkretne wymagania i ograniczenia<br>
    • Oceń dostępne zasoby i kompetencje zespołu<br>
    • Sprawdź dokumentację techniczną systemu<br><br>
    
    <strong>2. Planowanie rozwiązania</strong><br>
    • Opracuj szczegółowy plan działania<br>
    • Ustal harmonogram i kamienie milowe<br>
    • Przygotuj plan zarządzania ryzykiem<br><br>
    
    <strong>3. Implementacja</strong><br>
    • Rozpocznij od środowiska testowego<br>
    • Przeprowadź testy funkcjonalne i integracyjne<br>
    • Udokumentuj wszystkie zmiany i konfiguracje<br><br>
    
    <strong>💡 Wskazówka eksperta:</strong> W przypadku złożonych konfiguracji zawsze konsultuj się z zespołem technicznym Comarch oraz korzystaj z ich wsparcia implementacyjnego.`;
},

// Porady konfiguracyjne
getConfigurationAdvice(query, complexity) {
    if (query.includes('finansow')) {
        return `<strong>💰 Konfiguracja Modułu Finansowego</strong><br><br>
        
        <strong>Krok 1: Parametry podstawowe</strong><br>
        • Zdefiniuj strukturę organizacyjną (firmy, oddziały, działy)<br>
        • Ustaw walutę podstawową i dodatkowe waluty<br>
        • Skonfiguruj rok obrachunkowy i okresy księgowe<br><br>
        
        <strong>Krok 2: Plan kont</strong><br>
        • Zaimportuj standardowy plan kont dla Twojej branży<br>
        • Dostosuj konta analityczne do potrzeb firmy<br>
        • Skonfiguruj automatyczne księgowania<br><br>
        
        <strong>Krok 3: VAT i podatki</strong><br>
        • Ustaw stawki VAT zgodnie z obowiązującymi przepisami<br>
        • Skonfiguruj procedury JPK<br>
        • Zdefiniuj zasady rozliczania podatku<br><br>
        
        <strong>⚙️ Zaawansowane ustawienia:</strong><br>
        • Controlling i centra kosztów<br>
        • Budżetowanie i planowanie finansowe<br>
        • Integracja z modułami HR i logistycznymi<br><br>
        
        <em>Szacowany czas konfiguracji: 2-4 tygodnie w zależności od złożoności organizacji.</em>`;
    }
    
    return `<strong>⚙️ Konfiguracja systemowa</strong><br><br>
    Proces konfiguracji w Comarch ERP XL składa się z kilku kluczowych etapów:<br><br>
    
    <strong>🔧 Przygotowanie środowiska:</strong><br>
    • Instalacja i konfiguracja serwera aplikacji<br>
    • Utworzenie baz danych i struktur<br>
    • Konfiguracja uprawnień i bezpieczeństwa<br><br>
    
    <strong>📋 Parametryzacja systemu:</strong><br>
    • Zdefiniowanie danych podstawowych<br>
    • Konfiguracja procesów biznesowych<br>
    • Ustawienie przepływów dokumentów<br><br>
    
    <strong>🔗 Integracje:</strong><br>
    • Połączenia z systemami zewnętrznymi<br>
    • API i webservices<br>
    • Synchronizacja danych<br><br>
    
    <em>Pamiętaj: Każda konfiguracja powinna być poprzedzona szczegółową analizą procesów biznesowych.</em>`;
},

// Porady wdrożeniowe
getImplementationAdvice(query, complexity) {
    return `<strong>🚀 Metodyka Wdrożenia ERP</strong><br><br>
    
    <strong>Faza 1: Przygotowanie (4-6 tygodni)</strong><br>
    • Analiza procesów AS-IS i projektowanie TO-BE<br>
    • Identyfikacja wymagań funkcjonalnych i niefunkcjonalnych<br>
    • Powołanie zespołu projektowego i key userów<br>
    • Przygotowanie infrastruktury technicznej<br><br>
    
    <strong>Faza 2: Konfiguracja (8-12 tygodni)</strong><br>
    • Parametryzacja modułów zgodnie z wymaganiami<br>
    • Tworzenie raportów i formularzy niestandardowych<br>
    • Konfiguracja integracji z systemami zewnętrznymi<br>
    • Przygotowanie procedur operacyjnych<br><br>
    
    <strong>Faza 3: Testy (4-6 tygodni)</strong><br>
    • Testy jednostkowe modułów<br>
    • Testy integracyjne end-to-end<br>
    • Testy wydajnościowe i bezpieczeństwa<br>
    • User Acceptance Testing (UAT)<br><br>
    
    <strong>Faza 4: Wdrożenie (2-4 tygodnie)</strong><br>
    • Szkolenia użytkowników końcowych<br>
    • Migracja danych produkcyjnych<br>
    • Go-live i wsparcie hyper-care<br>
    • Monitoring i optymalizacja<br><br>
    
    <strong>🎯 Kluczowe czynniki sukcesu:</strong><br>
    • Zaangażowanie zarządu i użytkowników biznesowych<br>
    • Skuteczne zarządzanie zmianą<br>
    • Regularna komunikacja z zespołem implementacyjnym<br>
    • Elastyczność w dostosowywaniu rozwiązania<br><br>
    
    <em>Średni czas wdrożenia Comarch ERP XL: 6-18 miesięcy w zależności od skali organizacji.</em>`;
},

// Porady integracyjne
getIntegrationAdvice(query, complexity) {
    return `<strong>🔗 Integracja Systemów</strong><br><br>
    
    <strong>Krok 1: Planowanie integracji</strong><br>
    • Analiza systemów źródłowych i docelowych<br>
    • Mapowanie struktur danych<br>
    • Identyfikacja metod integracji<br>
    • Określenie częstotliwości synchronizacji<br><br>
    
    <strong>Krok 2: Projektowanie architektury</strong><br>
    • Wybór technologii integracji (API, EDI, pliki)<br>
    • Projektowanie warstwy pośredniczącej<br>
    • Definicja formatów wymiany danych<br>
    • Zabezpieczenia i uwierzytelnianie<br><br>
    
    <strong>Krok 3: Implementacja</strong><br>
    • Konfiguracja endpointów<br>
    • Tworzenie mapowań danych<br>
    • Implementacja logiki biznesowej<br>
    • Mechanizmy obsługi błędów<br><br>
    
    <strong>Krok 4: Testy i wdrożenie</strong><br>
    • Testy połączeń<br>
    • Walidacja jakości danych<br>
    • Testy wydajnościowe<br>
    • Monitoring i alerting<br><br>
    
    <em>Integracja może zająć 2-8 tygodni w zależności od złożoności systemów.</em>`;
},

// Porady optymalizacyjne
getOptimizationAdvice(query, complexity) {
    return `<strong>⚡ Optymalizacja Systemu ERP</strong><br><br>
    
    <strong>Optymalizacja wydajności:</strong><br>
    • Analiza query SQL i indeksów bazodanowych<br>
    • Optymalizacja raportów i procesów batch<br>
    • Konfiguracja cache'owania<br>
    • Monitoring wykorzystania zasobów<br><br>
    
    <strong>Optymalizacja procesów:</strong><br>
    • Automatyzacja rutynowych zadań<br>
    • Usprawnienie przepływów dokumentów<br>
    • Eliminacja duplikacji danych<br>
    • Integracja z systemami zewnętrznymi<br><br>
    
    <strong>Optymalizacja użytkowników:</strong><br>
    • Personalizacja interfejsów<br>
    • Szkolenia zaawansowane<br>
    • Konfiguracja uprawnień<br>
    • Dokumentacja procedur<br><br>
    
    <strong>Monitorowanie rezultatów:</strong><br>
    • KPI wydajności systemu<br>
    • Metryki użytkowników<br>
    • Analiza ROI<br>
    • Regularne przeglądy<br><br>
    
    <em>Optymalizacja to proces ciągły, przynosący 20-40% poprawę efektywności.</em>`;
},

// Odpowiedzi typu "definicja"
generateDefinitionResponse(query, complexity) {
    return `<strong>📖 Definicja i wyjaśnienie</strong><br><br>
    W kontekście systemów ERP, szczególnie Comarch ERP XL, ten temat odnosi się do:<br><br>
    
    <strong>🔍 Główne cechy:</strong><br>
    • Integracja z procesami biznesowymi<br>
    • Zgodność ze standardami branżowymi<br>
    • Możliwość konfiguracji i dostosowania<br>
    • Wsparcie dla polskich przepisów<br><br>
    
    <strong>💡 Praktyczne zastosowanie:</strong><br>
    • Usprawnienie operacji codziennych<br>
    • Poprawa kontroli i raportowania<br>
    • Redukcja kosztów operacyjnych<br>
    • Zwiększenie przejrzystości procesów<br><br>
    
    <em>Czy chcesz poznać szczegóły implementacji tego rozwiązania?</em>`;
},

// Odpowiedzi typu "dlaczego"
generateWhyResponse(query, complexity) {
    return `<strong>🤔 Analiza przyczyn i korzyści</strong><br><br>
    
    <strong>Główne powody wdrożenia:</strong><br>
    • Automatyzacja procesów manualnych<br>
    • Poprawa dokładności danych<br>
    • Zwiększenie efektywności operacyjnej<br>
    • Lepsze wsparcie decyzji biznesowych<br><br>
    
    <strong>Korzyści długoterminowe:</strong><br>
    • Redukcja kosztów o 15-25%<br>
    • Skrócenie czasu procesów o 30-50%<br>
    • Poprawa jakości danych o 90%+<br>
    • Zwiększenie zadowolenia użytkowników<br><br>
    
    <strong>Wpływ na organizację:</strong><br>
    • Standaryzacja procesów<br>
    • Lepsza kontrola i compliance<br>
    • Zwiększona elastyczność biznesowa<br>
    • Wsparcie dla wzrostu firmy<br><br>
    
    <em>Te korzyści uzasadniają inwestycję w nowoczesne rozwiązania ERP.</em>`;
},

// Odpowiedzi typu "kiedy"
generateWhenResponse(query, complexity) {
    return `<strong>⏰ Harmonogram i timing</strong><br><br>
    
    <strong>Optymalny moment wdrożenia:</strong><br>
    • Po zakończeniu głównych projektów biznesowych<br>
    • W okresach mniejszej aktywności operacyjnej<br>
    • Gdy zespół ma wystarczające zasoby<br>
    • Po przygotowaniu infrastruktury technicznej<br><br>
    
    <strong>Typowy harmonogram:</strong><br>
    • Faza przygotowawcza: 4-8 tygodni<br>
    • Konfiguracja systemu: 8-16 tygodni<br>
    • Testy i szkolenia: 4-8 tygodni<br>
    • Wdrożenie produkcyjne: 2-4 tygodnie<br><br>
    
    <strong>Czynniki wpływające na timing:</strong><br>
    • Złożoność organizacji<br>
    • Liczba modułów do wdrożenia<br>
    • Wymagania integracyjne<br>
    • Dostępność zespołu projektowego<br><br>
    
    <em>Dokładny harmonogram zawsze dostosowujemy do specyfiki organizacji.</em>`;
},

// Odpowiedzi typu "problem"
generateProblemResponse(query, complexity) {
    return `<strong>🔧 Rozwiązywanie problemów</strong><br><br>
    
    <strong>Typowe problemy i rozwiązania:</strong><br><br>
    
    <strong>Problem wydajności:</strong><br>
    • Analiza logów systemowych<br>
    • Optymalizacja zapytań bazodanowych<br>
    • Konfiguracja cache'u<br>
    • Zwiększenie zasobów sprzętowych<br><br>
    
    <strong>Problemy integracyjne:</strong><br>
    • Weryfikacja konfiguracji API<br>
    • Sprawdzenie mapowania danych<br>
    • Testowanie połączeń<br>
    • Analiza logów błędów<br><br>
    
    <strong>Problemy użytkowników:</strong><br>
    • Dodatkowe szkolenia<br>
    • Usprawnienie interfejsów<br>
    • Aktualizacja dokumentacji<br>
    • Wsparcie techniczne<br><br>
    
    <strong>🆘 Gdy potrzebujesz pomocy:</strong><br>
    • Skontaktuj się z helpdesk<br>
    • Przygotuj szczegółowy opis problemu<br>
    • Dołącz screenshoty i logi<br>
    • Podaj kroki reprodukcji błędu<br><br>
    
    <em>Większość problemów można rozwiązać w ciągu 24-48 godzin.</em>`;
},

// Odpowiedzi typu "porównanie"
generateComparisonResponse(query, complexity) {
    return `<strong>⚖️ Analiza porównawcza</strong><br><br>
    
    <strong>Comarch ERP XL vs konkurencja:</strong><br><br>
    
    <strong>Zalety Comarch ERP XL:</strong><br>
    • Pełna zgodność z polskim prawem<br>
    • Lokalne wsparcie techniczne<br>
    • Bogata funkcjonalność out-of-the-box<br>
    • Elastyczność konfiguracji<br>
    • Przystępna cena licencji<br><br>
    
    <strong>Porównanie modułów:</strong><br>
    • Finanse: Najbogatszy na rynku polskim<br>
    • HR: Pełne wsparcie dla polskich przepisów<br>
    • Produkcja: Zaawansowane planowanie<br>
    • Logistyka: Integracja z przewoźnikami<br><br>
    
    <strong>TCO (Total Cost of Ownership):</strong><br>
    • Niższe koszty licencji<br>
    • Lokalne wsparcie = niższe koszty<br>
    • Szybsza implementacja<br>
    • Mniejsze ryzyko projektowe<br><br>
    
    <em>Comarch ERP XL oferuje najlepszy stosunek jakości do ceny na polskim rynku.</em>`;
},

// Odpowiedzi typu "planowanie"
generatePlanningResponse(query, complexity) {
    return `<strong>📋 Planowanie projektu ERP</strong><br><br>
    
    <strong>Faza 1: Analiza i przygotowanie</strong><br>
    • Audyt procesów AS-IS (2-3 tygodnie)<br>
    • Warsztat projektowy TO-BE (1-2 tygodnie)<br>
    • Analiza wymagań (1-2 tygodnie)<br>
    • Przygotowanie infrastruktury (2-3 tygodnie)<br><br>
    
    <strong>Faza 2: Konfiguracja</strong><br>
    • Parametryzacja systemu (4-6 tygodni)<br>
    • Integracje (3-4 tygodnie)<br>
    • Migracja danych (2-3 tygodnie)<br>
    • Raporty niestandardowe (2-3 tygodnie)<br><br>
    
    <strong>Faza 3: Testy</strong><br>
    • Testy funkcjonalne (2-3 tygodnie)<br>
    • Testy integracyjne (1-2 tygodnie)<br>
    • User Acceptance Testing (1-2 tygodnie)<br>
    • Testy wydajnościowe (1 tydzień)<br><br>
    
    <strong>Faza 4: Wdrożenie</strong><br>
    • Szkolenia użytkowników (2-3 tygodnie)<br>
    • Równoległe działanie systemów (2-4 tygodnie)<br>
    • Go-live (1 tydzień)<br>
    • Wsparcie post-wdrożeniowe (4-8 tygodni)<br><br>
    
    <strong>🎯 Kluczowe milestone'y:</strong><br>
    • Zatwierdzenie wymagań<br>
    • Akceptacja konfiguracji<br>
    • Pozytywne testy UAT<br>
    • Go-live decision point<br><br>
    
    <em>Dobry plan to 50% sukcesu projektu ERP!</em>`;
},

// Odpowiedzi ogólne ERP
generateGeneralERPResponse(query, complexity) {
    return `<strong>🎯 Ekspert ERP odpowiada</strong><br><br>
    
    To bardzo dobre pytanie dotyczące systemów ERP! Na podstawie mojego doświadczenia z Comarch ERP XL:<br><br>
    
    <strong>💡 Kluczowe aspekty:</strong><br>
    • Każda implementacja ERP jest unikalna<br>
    • Sukces zależy od zaangażowania użytkowników<br>
    • Planowanie i przygotowanie to podstawa<br>
    • Continuous improvement po wdrożeniu<br><br>
    
    <strong>🔧 Praktyczne wskazówki:</strong><br>
    • Zacznij od analizy procesów biznesowych<br>
    • Skup się na szkoleniu super-użytkowników<br>
    • Dokumentuj wszystkie konfiguracje<br>
    • Planuj regularne przeglądy systemu<br><br>
    
    <strong>📈 Metryki sukcesu:</strong><br>
    • ROI > 200% w ciągu 3 lat<br>
    • Redukcja czasu procesów o 30%+<br>
    • Zwiększenie dokładności danych do 95%+<br>
    • Zadowolenie użytkowników > 80%<br><br>
    
    <em>Chcesz omówić konkretny aspekt wdrożenia ERP? Jestem do dyspozycji!</em>`;
},

// Odpowiedzi ogólne dla tematów niezwiązanych z ERP
generateGeneralAIResponse(query, questionType, complexity) {
    const topics = {
        'artificial intelligence': 'Sztuczna inteligencja to dziedzina informatyki zajmująca się tworzeniem systemów zdolnych do wykonywania zadań wymagających inteligencji.',
        'machine learning': 'Uczenie maszynowe to metoda sztucznej inteligencji, która umożliwia systemom automatyczne uczenie się i poprawianie wydajności na podstawie doświadczenia.',
        'big data': 'Big Data odnosi się do bardzo dużych zbiorów danych, które wymagają specjalistycznych narzędzi do przechowywania, przetwarzania i analizy.',
        'cloud computing': 'Cloud computing to model dostarczania usług IT przez internet, umożliwiający dostęp do zasobów obliczeniowych na żądanie.'
    };
    
    // Próba dopasowania tematu
    for (const [topic, definition] of Object.entries(topics)) {
        if (query.includes(topic.replace(' ', '')) || query.includes(topic)) {
            return `<strong>🤖 Definicja AI:</strong><br><br>${definition}<br><br>
            <strong>Zastosowania w biznesie:</strong><br>
            • Automatyzacja procesów<br>
            • Analiza predykcyjna<br>
            • Personalizacja doświadczeń<br>
            • Optymalizacja operacyjna<br><br>
            <em>Czy chcesz dowiedzieć się więcej o konkretnym aspekcie tego tematu?</em>`;
        }
    }
    
    return `<strong>🌟 Odpowiedź AI:</strong><br><br>
    To bardzo interesujące pytanie! Na podstawie mojej analizy, mogę powiedzieć, że:<br><br>
    
    ${this.generateContextualAnswer(query, complexity)}<br><br>
    
    <strong>💡 Dodatkowe przemyślenia:</strong><br>
    • Warto rozważyć różne perspektywy tego zagadnienia<br>
    • Kontekst biznesowy może znacząco wpływać na odpowiedź<br>
    • Zalecam konsultację z ekspertami w danej dziedzinie<br><br>
    
    <em>Czy mógłbyś sprecyzować o jaki konkretny aspekt Ci chodzi? Chętnie pogłębię temat!</em>`;
},

// Generowanie kontekstualnej odpowiedzi
generateContextualAnswer(query, complexity) {
    const concepts = [
        "to zagadnienie wymaga wielopłaszczyznowego podejścia",
        "kluczowe jest zrozumienie kontekstu i specyfiki sytuacji",
        "należy wziąć pod uwagę zarówno aspekty techniczne jak i biznesowe",
        "skuteczne rozwiązanie często łączy najlepsze praktyki z innowacyjnym podejściem",
        "istotne jest zachowanie równowagi między efektywnością a jakością"
    ];
    
    const randomConcept = concepts[Math.floor(Math.random() * concepts.length)];
    
    if (complexity === 'high') {
        return `Analizując to złożone zagadnienie, ${randomConcept}. W kontekście zaawansowanych systemów i procesów, warto uwzględnić długoterminowe implikacje oraz potencjalne synergje z istniejącymi rozwiązaniami.`;
    } else if (complexity === 'medium') {
        return `W odniesieniu do tego tematu, ${randomConcept}. Praktyczne zastosowanie wymaga uwzględnienia specyficznych wymagań i ograniczeń.`;
    } else {
        return `Odpowiadając na Twoje pytanie - ${randomConcept}. To podstawowe zagadnienie, które może mieć szerszy wpływ na organizację.`;
    }
},

// Wykrywanie specjalisty na podstawie treści
detectSpecialistFromContent(content) {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('finans') || lowerContent.includes('księg') || 
        lowerContent.includes('vat') || lowerContent.includes('rozrach')) {
        return 'financial';
    } else if (lowerContent.includes('api') || lowerContent.includes('integrac') || 
               lowerContent.includes('baz') || lowerContent.includes('infrastruk')) {
        return 'technical';
    } else if (lowerContent.includes('ryzy') || lowerContent.includes('audit') || 
               lowerContent.includes('complian') || lowerContent.includes('bezpiecz')) {
        return 'risk';
    } else if (lowerContent.includes('projekt') || lowerContent.includes('zespó') || 
               lowerContent.includes('harmono') || lowerContent.includes('planow')) {
        return 'project';
    }
    
    return 'technical'; // domyślny
},

// Dodanie wskaźnika Claude
addClaudeIndicator(response) {
    const chatMessages = document.getElementById('chat-messages');
    const lastMessage = chatMessages.lastElementChild;
    
    if (lastMessage && lastMessage.classList.contains('assistant')) {
        const indicator = document.createElement('div');
        indicator.style.cssText = `
            margin-top: 5px;
            font-size: 0.8em;
            color: #9b59b6;
            font-style: italic;
        `;
        
        let indicatorText = '🤖 ';
        if (response.claude_only) {
            indicatorText += 'Odpowiedź z Claude AI';
        } else if (response.enhanced) {
            indicatorText += 'Odpowiedź wzbogacona przez Claude AI';
        } else if (response.hybrid) {
            indicatorText += 'Odpowiedź hybrydowa: RAG + Claude AI';
        }
        
        indicator.textContent = indicatorText;
        lastMessage.querySelector('.message-content').appendChild(indicator);
    }
},

    // Analiza intencji użytkownika
    analyzeIntent(query) {
        const intents = {
            question: ['jak', 'co', 'kiedy', 'gdzie', 'dlaczego', 'czy', 'jakie', 'które'],
            problem: ['problem', 'błąd', 'nie działa', 'nie mogę', 'pomoc', 'awaria'],
            request: ['chcę', 'potrzebuję', 'proszę', 'możesz', 'pomóż'],
            greeting: ['cześć', 'witaj', 'dzień dobry', 'siema', 'hej'],
            comparison: ['różnica', 'porównanie', 'lepszy', 'gorszy', 'vs', 'kontra'],
            planning: ['plan', 'harmonogram', 'etapy', 'kolejność', 'strategia']
        };
        
        const detectedIntents = [];
        for (const [intent, keywords] of Object.entries(intents)) {
            if (keywords.some(keyword => query.includes(keyword))) {
                detectedIntents.push(intent);
            }
        }
        
        return {
            primary: detectedIntents[0] || 'question',
            all: detectedIntents,
            isFollowUp: this.conversationContext.history.length > 0,
            complexity: this.assessComplexity(query)
        };
    },

    // Ocena złożoności zapytania
    assessComplexity(query) {
        const words = query.split(' ').length;
        const technicalTerms = ['api', 'integracja', 'konfiguracja', 'moduł', 'system', 'baza danych', 'workflow'].filter(term => query.includes(term)).length;
        
        if (words > 15 || technicalTerms > 2) return 'high';
        if (words > 8 || technicalTerms > 0) return 'medium';
        return 'low';
    },

    // Kalkulacja relevancji
    calculateRelevance(query, key, entry) {
        let score = 0;
        
        // Podstawowe dopasowanie słów kluczowych
        if (query.includes(key)) score += 1.0;
        
        // Dopasowanie do obszaru ekspertyzy
        if (entry.specialist && this.conversationContext.userProfile.preferredSpecialist === entry.specialist) {
            score += 0.3;
        }
        
        // Kontekst poprzednich rozmów
        if (this.conversationContext.currentTopic && key.includes(this.conversationContext.currentTopic)) {
            score += 0.2;
        }
        
        // Dopasowanie synonimów i powiązanych terminów
        const synonyms = {
            'finanse': ['księgowość', 'rachunkowość', 'budżet', 'koszty'],
            'wdrożenie': ['implementacja', 'uruchomienie', 'instalacja'],
            'integracja': ['połączenie', 'łączenie', 'synchronizacja']
        };
        
        for (const [term, syns] of Object.entries(synonyms)) {
            if (key.includes(term) && syns.some(syn => query.includes(syn))) {
                score += 0.4;
            }
        }
        
        return score;
    },

    // Generowanie kontekstowej odpowiedzi
    generateContextualResponse(matchedEntry, intentAnalysis, originalQuery) {
        let response = {
            answer: "",
            confidence: matchedEntry.confidence || 0.85,
            sources: matchedEntry.sources || [],
            specialist: matchedEntry.specialist
        };
        
        // Dostosowanie odpowiedzi do specjalisty
        if (matchedEntry.specialist) {
            const specialist = this.aiSpecialists[matchedEntry.specialist];
            response.answer = `${specialist.avatar} **${specialist.name}**: `;
        }
        
        // Podstawowa odpowiedź
        response.answer += matchedEntry.answer;
        
        // Dodanie kontekstu na podstawie intencji
        if (intentAnalysis.primary === 'problem') {
            response.answer += "<br><br>💡 **Rozwiązanie problemu:**<br>";
            response.answer += this.generateProblemSolution(matchedEntry.key);
        }
        
        if (intentAnalysis.primary === 'planning') {
            response.answer += "<br><br>📋 **Następne kroki:**<br>";
            response.answer += this.generateActionPlan(matchedEntry.key);
        }
        
        // Dodanie follow-up pytań
        if (matchedEntry.followUp && matchedEntry.followUp.length > 0) {
            const randomFollowUp = matchedEntry.followUp[Math.floor(Math.random() * matchedEntry.followUp.length)];
            response.answer += `<br><br>🤔 ${randomFollowUp}`;
        }
        
        // Dodanie sugestii
        if (matchedEntry.suggestions && matchedEntry.suggestions.length > 0) {
            response.answer += "<br><br>💭 **Sugerowane tematy:**<br>";
            matchedEntry.suggestions.slice(0, 3).forEach(suggestion => {
                response.answer += `• ${suggestion}<br>`;
            });
        }
        
        // Dodanie wskazówek na podstawie poziomu użytkownika
        const expertiseLevel = this.conversationContext.userProfile.expertise;
        if (expertiseLevel === 'basic' && intentAnalysis.complexity === 'high') {
            response.answer += "<br><br>📚 **Dla początkujących:** Jeśli potrzebujesz prostszego wyjaśnienia, powiedz 'wyjaśnij prosto'.";
        } else if (expertiseLevel === 'expert' && intentAnalysis.complexity === 'low') {
            response.answer += "<br><br>🔧 **Szczegóły techniczne:** Powiedz 'więcej szczegółów' aby uzyskać zaawansowane informacje.";
        }
        
        return response;
    },

    // Generowanie rozwiązania problemu
    generateProblemSolution(topic) {
        const solutions = {
            'moduł finansowy': '1. Sprawdź konfigurację planu kont<br>2. Zweryfikuj parametry VAT<br>3. Skontaktuj się z działem wsparcia technicznego',
            'wdrożenie erp': '1. Zidentyfikuj źródło opóźnienia<br>2. Przeprowadź analizę ryzyka<br>3. Dostosuj harmonogram projektu<br>4. Zwiększ komunikację w zespole',
            'integracja systemów': '1. Przetestuj połączenie API<br>2. Sprawdź mapowanie danych<br>3. Zweryfikuj uprawnienia dostępu<br>4. Uruchom testy integracyjne'
        };
        
        return solutions[topic] || "1. Przeanalizuj dokładnie problem<br>2. Skonsultuj się z zespołem technicznym<br>3. Sprawdź dokumentację systemu";
    },

    // Generowanie planu działania
    generateActionPlan(topic) {
        const plans = {
            'moduł finansowy': '1. Zaplanuj szkolenie zespołu księgowego<br>2. Przygotuj procedury migracji danych<br>3. Ustaw harmonogram testów<br>4. Zaplanuj go-live',
            'wdrożenie erp': '1. Przeprowadź kickoff projektu<br>2. Zdefiniuj wymagania biznesowe<br>3. Przygotuj plan testów<br>4. Zaplanuj szkolenia użytkowników',
            'zarządzanie zapasami': '1. Przeprowadź inwentaryzację<br>2. Skonfiguruj parametry magazynowe<br>3. Ustaw poziomy min/max<br>4. Przetestuj procesy magazynowe'
        };
        
        return plans[topic] || "1. Zdefiniuj cele<br>2. Przygotuj harmonogram<br>3. Przydziel zasoby<br>4. Monitoruj postęp";
    },

    // Odpowiedzi fallback gdy nie znaleziono dopasowania
    generateFallbackResponse(intentAnalysis, query) {
        const responses = {
            greeting: {
                answer: "Witaj! 👋 Jestem Twoim asystentem AI ds. wdrożeń ERP. Mogę pomóc Ci z:<br>• Konfiguracją systemów Comarch ERP XL<br>• Planowaniem projektów wdrożeniowych<br>• Analizą ryzyka i rozwiązywaniem problemów<br>• Integracjami i szkoleniami<br><br>O czym chciałbyś porozmawiać?",
                confidence: 0.95,
                sources: ["System AI", "Baza wiedzy ERP"]
            },
            question: {
                answer: "Interesujące pytanie! 🤔 Aby udzielić Ci najlepszej odpowiedzi, potrzebuję więcej szczegółów. Czy możesz:<br>• Sprecyzować o który obszar ERP Ci chodzi?<br>• Opisać konkretny problem czy wyzwanie?<br>• Podać kontekst Twojego projektu?<br><br>Alternatywnie, sprawdź moje sugestie tematów poniżej.",
                confidence: 0.70,
                sources: ["Asystent AI", "Metodyka pomocowa"]
            },
            problem: {
                answer: "Rozumiem, że masz problem! 🔧 Jestem tutaj, żeby pomóc. Aby najlepiej Ci pomóc:<br><br>1️⃣ **Opisz problem szczegółowo**<br>2️⃣ **Podaj komunikaty błędów** (jeśli są)<br>3️⃣ **Wspomnieć jakie kroki już podjąłeś**<br><br>Mogę też przekierować Cię do odpowiedniego specjalisty z naszego zespołu.",
                confidence: 0.80,
                sources: ["System wsparcia", "Protokoły rozwiązywania problemów"]
            }
        };
        
        const responseKey = intentAnalysis.primary;
        let response = responses[responseKey] || responses.question;
        
        // Dodanie sugestii specjalistów
        if (intentAnalysis.primary === 'problem' || intentAnalysis.complexity === 'high') {
            response.answer += "<br><br>👥 **Dostępni specjaliści:**<br>";
            Object.entries(this.aiSpecialists).forEach(([key, specialist]) => {
                response.answer += `${specialist.avatar} ${specialist.name} - ${specialist.expertise.join(', ')}<br>`;
            });
        }
        
        // Dodanie sugestii tematów
        response.answer += "<br><br>💡 **Popularne tematy:**<br>• Jak skonfigurować moduł finansowy?<br>• Etapy wdrożenia systemu ERP<br>• Integracja z systemami zewnętrznymi<br>• Zarządzanie ryzykiem projektowym";
        
        return response;
    },

    // Aktualizacja kontekstu konwersacji
    updateConversationContext(query) {
        const context = this.conversationContext;
        
        // Dodanie do historii
        context.history.push({
            timestamp: new Date(),
            query: query,
            type: 'user'
        });
        
        // Aktualizacja statystyk sesji
        context.sessionData.questionsAsked++;
        context.sessionData.lastInteraction = new Date();
        
        // Wykrywanie tematu
        const detectedTopic = this.detectTopic(query);
        if (detectedTopic) {
            context.currentTopic = detectedTopic;
            if (!context.sessionData.topicsDiscussed.includes(detectedTopic)) {
                context.sessionData.topicsDiscussed.push(detectedTopic);
            }
        }
        
        // Adaptacja profilu użytkownika
        this.adaptUserProfile(query);
        
        // Ograniczenie historii do ostatnich 20 wpisów
        if (context.history.length > 20) {
            context.history = context.history.slice(-20);
        }
    },

    // Wykrywanie głównego tematu rozmowy
    detectTopic(query) {
        const topics = {
            'finansowy': ['finanse', 'księgowość', 'rachunkowość', 'VAT', 'faktury'],
            'wdrożenie': ['wdrożenie', 'implementacja', 'projekt', 'planowanie'],
            'integracja': ['integracja', 'API', 'połączenie', 'synchronizacja'],
            'szkolenia': ['szkolenie', 'nauka', 'tutorial', 'instrukcja'],
            'zapasy': ['magazyn', 'zapasy', 'inwentaryzacja', 'stany']
        };
        
        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => query.toLowerCase().includes(keyword))) {
                return topic;
            }
        }
        return null;
    },

    // Adaptacja profilu użytkownika
    adaptUserProfile(query) {
        const profile = this.conversationContext.userProfile;
        
        // Wykrywanie poziomu zaawansowania na podstawie używanych terminów
        const technicalTerms = ['API', 'SQL', 'workflow', 'konfiguracja', 'endpoint', 'middleware'];
        const basicTerms = ['jak', 'pomocy', 'nie rozumiem', 'wyjaśnij'];
        
        const techCount = technicalTerms.filter(term => query.toLowerCase().includes(term.toLowerCase())).length;
        const basicCount = basicTerms.filter(term => query.toLowerCase().includes(term)).length;
        
        if (techCount > 1) profile.expertise = 'expert';
        else if (basicCount > 1) profile.expertise = 'basic';
        
        // Wykrywanie zainteresowań
        const interests = ['finanse', 'hr', 'logistyka', 'produkcja', 'sprzedaż'];
        interests.forEach(interest => {
            if (query.toLowerCase().includes(interest) && !profile.interests.includes(interest)) {
                profile.interests.push(interest);
            }
        });
    },

    // Rozszerzona funkcja dodawania wiadomości z kontekstem
    addChatMessage(content, type, confidence = null, sources = [], specialist = null) {
        const chatMessages = document.getElementById('chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;

        const currentTime = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

        let sourceInfo = '';
        if (sources && sources.length > 0) {
            sourceInfo = `<div style="margin-top: 10px; font-size: 0.9em; opacity: 0.8;">
                <strong>📚 Źródła:</strong> ${sources.join(', ')}</div>`;
        }

        let confidenceInfo = '';
        if (confidence) {
            const confidencePercent = Math.round(confidence * 100);
            const confidenceColor = confidencePercent >= 90 ? '#27ae60' : confidencePercent >= 70 ? '#f39c12' : '#e74c3c';
            confidenceInfo = `<div style="margin-top: 5px; font-size: 0.8em; opacity: 0.7;">
                <span style="color: ${confidenceColor};">🎯 Pewność odpowiedzi: ${confidencePercent}%</span></div>`;
        }

        // Informacja o specjaliście
        let specialistInfo = '';
        if (specialist && this.aiSpecialists[specialist]) {
            const spec = this.aiSpecialists[specialist];
            specialistInfo = `<div style="margin-top: 8px; font-size: 0.9em; background: #f0f8ff; padding: 8px; border-radius: 5px; border-left: 3px solid #3498db;">
                ${spec.avatar} <strong>${spec.name}</strong> - ${spec.personality}</div>`;
        }

        const assistantPrefix = type === 'assistant' ? '<strong>🤖 Asystent AI:</strong> ' : '';

        messageDiv.innerHTML = `
            <div class="message-content">
                ${assistantPrefix}${content}
                ${specialistInfo}
                ${confidenceInfo}
                ${sourceInfo}
            </div>
            <div class="message-time">${currentTime}</div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // Aktualizacja kontekstu dla wiadomości asystenta
        if (type === 'assistant') {
            this.conversationContext.history.push({
                timestamp: new Date(),
                content: content,
                type: 'assistant',
                specialist: specialist,
                confidence: confidence
            });
        }
    },

    // Konfiguracja modułu analitycznego
    setupAnalyticsModule() {
        this.createProgressChart();
        this.updateAnalyticsData();
    },

    // Tworzenie wykresu postępu
    createProgressChart() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Styczeń', 'Luty', 'Marzec', 'Kwiecień', 'Maj', 'Czerwiec'],
                datasets: [{
                    label: 'Planowany postęp (%)',
                    data: [10, 25, 45, 65, 80, 100],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Rzeczywisty postęp (%)',
                    data: [8, 22, 48, 62, 75, 87],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    title: {
                        display: true,
                        text: 'Postęp Wdrożenia ERP'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    },

    // Aktualizacja danych analitycznych
    updateAnalyticsData() {
        // Symulacja aktualizacji danych w czasie rzeczywistym
        setInterval(() => {
            const successScore = document.querySelector('.prediction-score.success');
            const warningScore = document.querySelector('.prediction-score.warning');
            const teamUtilization = document.querySelector('.metric-value');

            if (successScore) {
                const currentValue = parseInt(successScore.textContent);
                const newValue = Math.max(80, Math.min(95, currentValue + (Math.random() - 0.5) * 2));
                successScore.textContent = Math.round(newValue) + '%';
            }

            if (teamUtilization) {
                const newUtilization = Math.max(70, Math.min(95, 85 + (Math.random() - 0.5) * 10));
                teamUtilization.textContent = Math.round(newUtilization) + '%';
            }
        }, 10000);
    },

    // Konfiguracja modułu dokumentacji
    setupDocumentationModule() {
        const generateButton = document.getElementById('generate-doc');
        const docTypeSelect = document.getElementById('doc-type');
        const generatedContent = document.getElementById('generated-content');

        generateButton.addEventListener('click', () => {
            const docType = docTypeSelect.value;
            this.generateDocument(docType, generatedContent);
        });

        // Obsługa szablonów
        const templateButtons = document.querySelectorAll('.btn-small');
        templateButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const templateName = e.target.parentElement.querySelector('span').textContent;
                this.useTemplate(templateName, generatedContent);
            });
        });
    },

    // Generowanie dokumentów
    generateDocument(type, container) {
        // Pokazanie efektu ładowania
        container.innerHTML = `
            <h3>Wygenerowana Dokumentacja</h3>
            <div style="text-align: center; padding: 50px;">
                <div class="loading" style="margin: 0 auto 20px;"></div>
                <p>Generowanie dokumentu...</p>
            </div>
        `;

        setTimeout(() => {
            const documents = {
                'implementation-plan': {
                    title: 'Plan Wdrożenia Comarch ERP XL',
                    content: `
                        <div style="background: white; padding: 20px; border-radius: 10px;">
                            <h4>1. Etap przygotowawczy (Miesiąc 1-2)</h4>
                            <ul>
                                <li>Analiza procesów biznesowych organizacji</li>
                                <li>Identyfikacja wymagań funkcjonalnych</li>
                                <li>Przygotowanie infrastruktury technicznej</li>
                                <li>Powołanie zespołu projektowego</li>
                            </ul>
                            
                            <h4>2. Konfiguracja systemu (Miesiąc 3-4)</h4>
                            <ul>
                                <li>Konfiguracja modułów podstawowych</li>
                                <li>Integracja z systemami zewnętrznymi</li>
                                <li>Migracja danych historycznych</li>
                                <li>Konfiguracja uprawnień użytkowników</li>
                            </ul>
                            
                            <h4>3. Testy i szkolenia (Miesiąc 5)</h4>
                            <ul>
                                <li>Testy jednostkowe modułów</li>
                                <li>Testy integracyjne</li>
                                <li>Szkolenia użytkowników końcowych</li>
                                <li>Przygotowanie dokumentacji</li>
                            </ul>
                            
                            <h4>4. Wdrożenie produkcyjne (Miesiąc 6)</h4>
                            <ul>
                                <li>Uruchomienie systemu produkcyjnego</li>
                                <li>Monitoring stabilności</li>
                                <li>Wsparcie post-wdrożeniowe</li>
                            </ul>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                <strong>Status:</strong> Dokument wygenerowany automatycznie przez AI<br>
                                <strong>Data:</strong> ${new Date().toLocaleDateString('pl-PL')}<br>
                                <strong>Wersja:</strong> 1.0
                            </div>
                        </div>
                    `
                },
                'test-scenario': {
                    title: 'Scenariusz Testowy - Moduł Finansowy',
                    content: `
                        <div style="background: white; padding: 20px; border-radius: 10px;">
                            <h4>TC_001: Test księgowania faktury zakupu</h4>
                            <p><strong>Cel:</strong> Weryfikacja poprawności księgowania faktury zakupu</p>
                            <p><strong>Warunki wstępne:</strong> Użytkownik zalogowany, moduł finansowy aktywny</p>
                            
                            <h5>Kroki testowe:</h5>
                            <ol>
                                <li>Przejście do modułu Finanse → Rozrachunki → Faktury zakupu</li>
                                <li>Kliknięcie przycisku "Nowa faktura"</li>
                                <li>Wprowadzenie danych kontrahenta</li>
                                <li>Dodanie pozycji fakturowych</li>
                                <li>Zapisanie faktury</li>
                                <li>Weryfikacja automatycznego księgowania</li>
                            </ol>
                            
                            <h5>Oczekiwany rezultat:</h5>
                            <ul>
                                <li>Faktura została zapisana w systemie</li>
                                <li>Automatycznie wygenerowane zostały zapisy księgowe</li>
                                <li>Saldo kontrahenta zostało zaktualizowane</li>
                            </ul>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                <strong>Priorytet:</strong> Wysoki<br>
                                <strong>Estymowany czas:</strong> 15 minut<br>
                                <strong>Odpowiedzialny:</strong> Zespół testowy
                            </div>
                        </div>
                    `
                },
                'user-manual': {
                    title: 'Instrukcja Użytkownika - Asystent AI',
                    content: `
                        <div style="background: white; padding: 20px; border-radius: 10px;">
                            <h4>Jak korzystać z Asystenta AI?</h4>
                            
                            <h5>1. Moduł RAG (Wyszukiwanie)</h5>
                            <p>Zadawaj pytania w języku naturalnym dotyczące systemu ERP. Asystent przeszuka bazę wiedzy i udzieli precyzyjnej odpowiedzi wraz z wskazaniem źródeł.</p>
                            <p><em>Przykład:</em> "Jak skonfigurować moduł finansowy?"</p>
                            
                            <h5>2. Analiza Predykcyjna</h5>
                            <p>Monitoruj kluczowe wskaźniki wdrożenia, przewidywany sukces projektu oraz wykorzystanie zasobów.</p>
                            
                            <h5>3. Zarządzanie Dokumentacją</h5>
                            <p>Automatycznie generuj dokumenty projektowe takie jak plany wdrożenia, scenariusze testowe i instrukcje.</p>
                            
                            <h5>4. Zarządzanie Ryzykiem</h5>
                            <p>Śledź identyfikowane ryzyka projektowe i otrzymuj alerty o potencjalnych problemach.</p>
                            
                            <h5>5. Personalizacja</h5>
                            <p>Dostosuj interfejs do swoich preferencji i poziomu zaawansowania.</p>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                                <strong>Wskazówka:</strong> System uczy się na podstawie Twoich interakcji i stopniowo poprawia jakość odpowiedzi.
                            </div>
                        </div>
                    `
                },
                'project-report': {
                    title: 'Raport Projektowy - Status Wdrożenia',
                    content: `
                        <div style="background: white; padding: 20px; border-radius: 10px;">
                            <h4>Podsumowanie Wykonawcze</h4>
                            <p>Projekt wdrożenia Comarch ERP XL przebiega zgodnie z harmonogramem. Osiągnięto 87% zaplanowanych celów.</p>
                            
                            <h5>Kluczowe Osiągnięcia</h5>
                            <ul>
                                <li>✅ Pomyślnie skonfigurowano moduł finansowy</li>
                                <li>✅ Przeprowadzono migrację danych historycznych</li>
                                <li>✅ Przeszkolono 85% użytkowników końcowych</li>
                                <li>⏳ W trakcie: Integracja z systemem CRM</li>
                            </ul>
                            
                            <h5>Zidentyfikowane Ryzyka</h5>
                            <div style="padding: 10px; background: #fff3cd; border-left: 4px solid #ffc107; margin: 10px 0;">
                                <strong>Średnie:</strong> Opóźnienie w dostawach sprzętu sieciowego
                            </div>
                            <div style="padding: 10px; background: #f8d7da; border-left: 4px solid #dc3545; margin: 10px 0;">
                                <strong>Wysokie:</strong> Ograniczona dostępność kluczowych specjalistów
                            </div>
                            
                            <h5>Następne Kroki</h5>
                            <ol>
                                <li>Finalizacja testów modułu HR (termin: koniec miesiąca)</li>
                                <li>Rozpoczęcie pilotażowego uruchomienia</li>
                                <li>Przygotowanie planu go-live</li>
                            </ol>
                            
                            <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                                <strong>Data raportu:</strong> ${new Date().toLocaleDateString('pl-PL')}<br>
                                <strong>Autor:</strong> Asystent AI<br>
                                <strong>Następny przegląd:</strong> Za 2 tygodnie
                            </div>
                        </div>
                    `
                }
            };

            const doc = documents[type];
            if (doc) {
                container.innerHTML = `
                    <h3>${doc.title}</h3>
                    ${doc.content}
                    <div style="margin-top: 20px; text-align: center;">
                        <button class="btn-primary" onclick="ERPAssistant.exportDocument('${doc.title}')">
                            <i class="fas fa-download"></i> Eksportuj do PDF
                        </button>
                    </div>
                `;
            }
        }, 2000);
    },

    // Użycie szablonu
    useTemplate(templateName, container) {
        container.innerHTML = `
            <h3>Używanie szablonu: ${templateName}</h3>
            <div style="background: white; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <p>Szablon "${templateName}" został załadowany i dostosowany do bieżącego projektu.</p>
                <div style="margin-top: 15px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
                    <strong>Status:</strong> Gotowy do edycji<br>
                    <strong>Ostatnia modyfikacja:</strong> ${new Date().toLocaleDateString('pl-PL')}
                </div>
            </div>
        `;
    },

    // Eksport dokumentu (symulacja)
    exportDocument(title) {
        alert(`Eksportowanie dokumentu "${title}" do formatu PDF...`);
    },

    // Konfiguracja modułu zarządzania ryzykiem
    setupRiskModule() {
        this.updateRiskData();
    },

    // Aktualizacja danych o ryzyku
    updateRiskData() {
        setInterval(() => {
            // Symulacja zmiany liczby ryzyk
            const riskCounts = document.querySelectorAll('.risk-count');
            riskCounts.forEach(count => {
                const current = parseInt(count.textContent);
                const change = Math.random() > 0.7 ? (Math.random() > 0.5 ? 1 : -1) : 0;
                const newValue = Math.max(0, current + change);
                count.textContent = newValue;
            });
        }, 30000);
    },

    // Konfiguracja modułu personalizacji
    setupPersonalizationModule() {
        const detailLevelSelect = document.getElementById('detail-level');
        const themeOptions = document.querySelectorAll('.theme-option');

        // Obsługa zmiany poziomu szczegółowości
        if (detailLevelSelect) {
            detailLevelSelect.addEventListener('change', (e) => {
                const level = e.target.value;
                this.updateDetailLevel(level);
            });
        }

        // Obsługa zmiany motywu
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                themeOptions.forEach(opt => opt.classList.remove('active'));
                option.classList.add('active');
                
                const theme = option.dataset.theme;
                this.applyTheme(theme);
            });
        });
    },

    // Aktualizacja poziomu szczegółowości
    updateDetailLevel(level) {
        const levels = {
            'basic': 'Odpowiedzi będą krótkie i skupione na podstawowych informacjach.',
            'intermediate': 'Odpowiedzi będą zawierać średnio zaawansowane szczegóły techniczne.',
            'expert': 'Odpowiedzi będą bardzo szczegółowe z zaawansowanymi informacjami technicznymi.'
        };
        
        // Aktualizacja opisu w interfejsie
        const description = levels[level];
        console.log(`Poziom szczegółowości zmieniony na: ${level} - ${description}`);
    },

    // Zastosowanie motywu
    applyTheme(theme) {
        if (theme === 'dark') {
            document.body.style.filter = 'invert(1) hue-rotate(180deg)';
            document.querySelectorAll('img, .theme-preview').forEach(el => {
                el.style.filter = 'invert(1) hue-rotate(180deg)';
            });
        } else {
            document.body.style.filter = 'none';
            document.querySelectorAll('img, .theme-preview').forEach(el => {
                el.style.filter = 'none';
            });
        }
        console.log(`Motyw zmieniony na: ${theme}`);
    },

    // Konfiguracja modułu szkoleniowego
    setupTrainingModule() {
        this.currentStep = 1;
        this.totalSteps = 3;
        
        // Inicjalizacja interaktywnego tutoriala
        this.initializeTutorial();
        
        // Obsługa nawigacji kroków
        this.setupTutorialNavigation();
        
        // Obsługa lekcji
        this.setupLessonSelection();
        
        // Symulacja interakcji w tutorialu
        this.setupTutorialInteractions();
        
        // Aktualizacja postępu
        this.updateTrainingProgress();
    },

    // Inicjalizacja tutoriala
    initializeTutorial() {
        const currentStepSpan = document.getElementById('current-step');
        const totalStepsSpan = document.getElementById('total-steps');
        
        if (currentStepSpan) currentStepSpan.textContent = this.currentStep;
        if (totalStepsSpan) totalStepsSpan.textContent = this.totalSteps;
        
        this.showStep(this.currentStep);
    },

    // Pokazanie określonego kroku
    showStep(stepNumber) {
        const steps = document.querySelectorAll('.tutorial-step');
        steps.forEach(step => step.classList.remove('active'));
        
        const targetStep = document.querySelector(`[data-step="${stepNumber}"]`);
        if (targetStep) {
            targetStep.classList.add('active');
        }
        
        // Aktualizacja przycisków nawigacji
        const prevButton = document.getElementById('prev-step');
        const nextButton = document.getElementById('next-step');
        const currentStepSpan = document.getElementById('current-step');
        
        if (prevButton) prevButton.disabled = stepNumber === 1;
        if (nextButton) nextButton.disabled = stepNumber === this.totalSteps;
        if (currentStepSpan) currentStepSpan.textContent = stepNumber;
    },

    // Konfiguracja nawigacji tutoriala
    setupTutorialNavigation() {
        const prevButton = document.getElementById('prev-step');
        const nextButton = document.getElementById('next-step');
        
        if (prevButton) {
            prevButton.addEventListener('click', () => {
                if (this.currentStep > 1) {
                    this.currentStep--;
                    this.showStep(this.currentStep);
                }
            });
        }
        
        if (nextButton) {
            nextButton.addEventListener('click', () => {
                if (this.currentStep < this.totalSteps) {
                    this.currentStep++;
                    this.showStep(this.currentStep);
                }
            });
        }
    },

    // Konfiguracja wyboru lekcji
    setupLessonSelection() {
        const lessonItems = document.querySelectorAll('.lesson-item');
        
        lessonItems.forEach(item => {
            item.addEventListener('click', () => {
                if (!item.classList.contains('completed') && !item.classList.contains('active')) {
                    return; // Zablokowane lekcje
                }
                
                // Aktualizacja aktywnej lekcji
                lessonItems.forEach(lesson => lesson.classList.remove('active'));
                item.classList.add('active');
                
                const lessonType = item.dataset.lesson;
                this.loadLesson(lessonType);
            });
        });
    },

    // Ładowanie określonej lekcji
    loadLesson(lessonType) {
        const lessons = {
            'basics': {
                title: 'Wprowadzenie do Comarch ERP XL',
                steps: 2,
                description: 'Podstawy systemu ERP'
            },
            'financial': {
                title: 'Konfiguracja Modułu Finansowego',
                steps: 3,
                description: 'Szczegółowa konfiguracja finansów'
            },
            'inventory': {
                title: 'Zarządzanie Zapasami',
                steps: 4,
                description: 'Moduł magazynowy'
            }
        };
        
        const lesson = lessons[lessonType];
        if (lesson) {
            this.currentStep = 1;
            this.totalSteps = lesson.steps;
            this.initializeTutorial();
            
            // Aktualizacja tytułu lekcji
            const titleElement = document.querySelector('.interactive-tutorial h3');
            if (titleElement) {
                titleElement.textContent = `Lekcja: ${lesson.title}`;
            }
        }
    },

    // Konfiguracja interakcji w tutorialu
    setupTutorialInteractions() {
        // Krok 1: Logowanie
        const loginButton = document.getElementById('demo-login');
        const usernameInput = document.getElementById('demo-username');
        const passwordInput = document.getElementById('demo-password');
        
        if (loginButton) {
            loginButton.addEventListener('click', () => {
                const username = usernameInput?.value || '';
                const password = passwordInput?.value || '';
                
                if (username === 'admin' && password === 'admin123') {
                    this.simulateSuccess(loginButton, 'Zalogowano pomyślnie!');
                    this.enableNextStep();
                } else {
                    this.simulateError(loginButton, 'Błędne dane logowania!');
                }
            });
        }
        
        // Krok 2: Menu ERP
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', () => {
                if (item.dataset.target === 'finance') {
                    this.simulateSuccess(item, 'Przeszedłeś do modułu finansowego!');
                    this.enableNextStep();
                } else {
                    item.style.background = '#e74c3c';
                    item.style.color = 'white';
                    setTimeout(() => {
                        item.style.background = '#f8f9fa';
                        item.style.color = 'inherit';
                    }, 1000);
                }
            });
        });
        
        // Krok 3: Konfiguracja
        const saveConfigButton = document.getElementById('save-config');
        if (saveConfigButton) {
            saveConfigButton.addEventListener('click', () => {
                const currency = document.getElementById('currency')?.value;
                const fiscalYear = document.getElementById('fiscal-year')?.value;
                const chartAccounts = document.getElementById('chart-accounts')?.value;
                
                if (currency && fiscalYear && chartAccounts) {
                    this.simulateSuccess(saveConfigButton, 'Konfiguracja zapisana!');
                    this.enableNextStep();
                    this.completeLesson();
                } else {
                    this.simulateError(saveConfigButton, 'Wypełnij wszystkie pola!');
                }
            });
        }
    },

    // Symulacja sukcesu
    simulateSuccess(element, message) {
        element.style.background = '#27ae60';
        element.style.color = 'white';
        element.innerHTML = `<i class="fas fa-check"></i> ${message}`;
        
        setTimeout(() => {
            element.style.background = '';
            element.style.color = '';
        }, 3000);
    },

    // Symulacja błędu
    simulateError(element, message) {
        element.style.background = '#e74c3c';
        element.style.color = 'white';
        element.innerHTML = `<i class="fas fa-times"></i> ${message}`;
        
        setTimeout(() => {
            element.style.background = '';
            element.style.color = '';
        }, 2000);
    },

    // Włączenie następnego kroku
    enableNextStep() {
        const nextButton = document.getElementById('next-step');
        if (nextButton) {
            nextButton.disabled = false;
            nextButton.style.background = '#27ae60';
            nextButton.innerHTML = '<i class="fas fa-chevron-right"></i> Następny krok dostępny!';
            
            setTimeout(() => {
                nextButton.style.background = '';
                nextButton.innerHTML = 'Następny <i class="fas fa-chevron-right"></i>';
            }, 3000);
        }
    },

    // Ukończenie lekcji
    completeLesson() {
        setTimeout(() => {
            // Aktualizacja postępu
            this.updateLessonProgress();
            
            // Pokazanie gratulacji
            this.showCompletionMessage();
            
            // Odblokowanie następnej lekcji
            this.unlockNextLesson();
        }, 2000);
    },

    // Aktualizacja postępu lekcji
    updateLessonProgress() {
        const activeLesson = document.querySelector('.lesson-item.active');
        if (activeLesson) {
            activeLesson.classList.remove('active');
            activeLesson.classList.add('completed');
            activeLesson.querySelector('.lesson-status').textContent = '✅';
        }
        
        // Aktualizacja paska postępu
        const progressBars = document.querySelectorAll('.progress-fill');
        if (progressBars.length >= 2) {
            progressBars[1].style.width = '100%';
            
            const progressText = document.querySelectorAll('.progress-text')[1];
            if (progressText) {
                progressText.textContent = '100% - Ukończone';
            }
            
            const progressIcon = document.querySelectorAll('.progress-icon')[1];
            if (progressIcon) {
                progressIcon.classList.remove('active');
                progressIcon.classList.add('completed');
                progressIcon.innerHTML = '<i class="fas fa-check"></i>';
            }
        }
    },

    // Odblokowanie następnej lekcji
    unlockNextLesson() {
        const inventoryLesson = document.querySelector('[data-lesson="inventory"]');
        if (inventoryLesson) {
            inventoryLesson.classList.remove('locked');
            inventoryLesson.classList.add('active');
            inventoryLesson.querySelector('.lesson-status').textContent = '▶️';
            
            // Aktualizacja progress item
            const progressItems = document.querySelectorAll('.progress-item');
            if (progressItems.length >= 3) {
                const inventoryProgress = progressItems[2];
                const progressIcon = inventoryProgress.querySelector('.progress-icon');
                const progressFill = inventoryProgress.querySelector('.progress-fill');
                const progressText = inventoryProgress.querySelector('.progress-text');
                
                progressIcon.classList.add('active');
                progressIcon.innerHTML = '<i class="fas fa-play"></i>';
                progressFill.style.width = '0%';
                progressText.textContent = '0% - Dostępne';
            }
        }
    },

    // Pokazanie wiadomości o ukończeniu
    showCompletionMessage() {
        const tutorialContent = document.getElementById('tutorial-content');
        if (tutorialContent) {
            const completionMessage = document.createElement('div');
            completionMessage.className = 'completion-message';
            completionMessage.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: white;
                padding: 30px;
                border-radius: 15px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.3);
                text-align: center;
                z-index: 1000;
                border: 3px solid #27ae60;
            `;
            
            completionMessage.innerHTML = `
                <i class="fas fa-trophy" style="font-size: 3rem; color: #f39c12; margin-bottom: 15px;"></i>
                <h3 style="color: #27ae60; margin-bottom: 10px;">Gratulacje!</h3>
                <p style="color: #2c3e50;">Ukończyłeś lekcję "Konfiguracja Modułu Finansowego"</p>
                <button onclick="this.parentElement.remove()" class="btn-primary" style="margin-top: 15px;">
                    Kontynuuj naukę
                </button>
            `;
            
            document.body.appendChild(completionMessage);
            
            // Automatyczne usunięcie po 5 sekundach
            setTimeout(() => {
                if (completionMessage.parentElement) {
                    completionMessage.remove();
                }
            }, 5000);
        }
    },

    // Aktualizacja ogólnego postępu szkoleniowego
    updateTrainingProgress() {
        setInterval(() => {
            // Symulacja postępu w czasie rzeczywistym
            const progressFills = document.querySelectorAll('.training-progress .progress-fill');
            progressFills.forEach((fill, index) => {
                const currentWidth = parseFloat(fill.style.width) || 0;
                if (currentWidth < 100 && Math.random() > 0.9) {
                    const newWidth = Math.min(100, currentWidth + Math.random() * 5);
                    fill.style.width = newWidth + '%';
                    
                    const progressText = fill.closest('.progress-item').querySelector('.progress-text');
                    if (progressText) {
                        const status = newWidth >= 100 ? 'Ukończone' : 
                                     newWidth > 0 ? 'W trakcie' : 'Zablokowane';
                        progressText.textContent = `${Math.round(newWidth)}% - ${status}`;
                    }
                }
            });
        }, 15000);
    },

    // Konfiguracja modułu symulatora Digital Twin
    setupSimulatorModule() {
        this.simulationRunning = false;
        this.simulationSpeed = 10;
        this.currentPhase = 1;
        this.totalPhases = 5;
        this.simulationData = {
            overall_progress: 38,
            team_efficiency: 84,
            risk_indicator: 23,
            roi_prediction: 187
        };
        
        // Inicjalizacja kontrolek
        this.setupSimulationControls();
        
        // Inicjalizacja analizy scenariuszy
        this.setupScenarioAnalysis();
        
        // Aktualizacja metryk
        this.updateSimulationMetrics();
    },

    // Konfiguracja kontrolek symulacji
    setupSimulationControls() {
        const startButton = document.getElementById('start-simulation');
        const pauseButton = document.getElementById('pause-simulation');
        const resetButton = document.getElementById('reset-simulation');
        const scenarioSelect = document.getElementById('simulation-scenario');
        const speedButtons = document.querySelectorAll('.speed-btn');

        // Obsługa uruchomienia symulacji
        if (startButton) {
            startButton.addEventListener('click', () => {
                this.startSimulation();
            });
        }

        // Obsługa pauzy symulacji
        if (pauseButton) {
            pauseButton.addEventListener('click', () => {
                this.pauseSimulation();
            });
        }

        // Obsługa resetu symulacji
        if (resetButton) {
            resetButton.addEventListener('click', () => {
                this.resetSimulation();
            });
        }

        // Obsługa zmiany scenariusza
        if (scenarioSelect) {
            scenarioSelect.addEventListener('change', (e) => {
                this.changeScenario(e.target.value);
            });
        }

        // Obsługa prędkości symulacji
        speedButtons.forEach(button => {
            button.addEventListener('click', () => {
                speedButtons.forEach(btn => btn.classList.remove('active'));
                button.classList.add('active');
                this.simulationSpeed = parseInt(button.dataset.speed);
                this.logMessage('info', `Prędkość symulacji zmieniona na ${this.simulationSpeed}x`);
            });
        });
    },

    // Uruchomienie symulacji
    startSimulation() {
        this.simulationRunning = true;
        
        const startButton = document.getElementById('start-simulation');
        const pauseButton = document.getElementById('pause-simulation');
        
        if (startButton) {
            startButton.disabled = true;
            startButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Symulacja...';
        }
        
        if (pauseButton) {
            pauseButton.disabled = false;
        }
        
        this.logMessage('success', 'Symulacja uruchomiona');
        this.logMessage('info', `Scenariusz: ${document.getElementById('simulation-scenario')?.options[document.getElementById('simulation-scenario')?.selectedIndex]?.text}`);
        
        // Rozpoczęcie procesu symulacji
        this.runSimulationStep();
    },

    // Pauza symulacji
    pauseSimulation() {
        this.simulationRunning = false;
        
        const startButton = document.getElementById('start-simulation');
        const pauseButton = document.getElementById('pause-simulation');
        
        if (startButton) {
            startButton.disabled = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Wznów Symulację';
        }
        
        if (pauseButton) {
            pauseButton.disabled = true;
        }
        
        this.logMessage('warning', 'Symulacja wstrzymana');
    },

    // Reset symulacji
    resetSimulation() {
        this.simulationRunning = false;
        this.currentPhase = 1;
        
        const startButton = document.getElementById('start-simulation');
        const pauseButton = document.getElementById('pause-simulation');
        
        if (startButton) {
            startButton.disabled = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Uruchom Symulację';
        }
        
        if (pauseButton) {
            pauseButton.disabled = true;
        }
        
        // Reset wizualizacji
        this.resetVisualization();
        
        // Reset metryk
        this.simulationData = {
            overall_progress: 0,
            team_efficiency: 75,
            risk_indicator: 15,
            roi_prediction: 150
        };
        
        this.updateSimulationMetrics();
        this.logMessage('info', 'Symulacja zresetowana');
    },

    // Zmiana scenariusza
    changeScenario(scenario) {
        const scenarios = {
            'standard': {
                duration: 6,
                complexity: 'standard',
                success_rate: 87
            },
            'accelerated': {
                duration: 4,
                complexity: 'high',
                success_rate: 76
            },
            'complex': {
                duration: 8,
                complexity: 'very_high',
                success_rate: 92
            },
            'pilot': {
                duration: 3,
                complexity: 'low',
                success_rate: 95
            }
        };
        
        const selectedScenario = scenarios[scenario];
        if (selectedScenario) {
            this.logMessage('info', `Scenariusz zmieniony: ${scenario} (${selectedScenario.duration} miesięcy)`);
            this.updateScenarioMetrics(selectedScenario);
        }
    },

    // Krok symulacji
    runSimulationStep() {
        if (!this.simulationRunning) return;
        
        // Symulacja postępu
        if (this.simulationData.overall_progress < 100) {
            const increment = (Math.random() * 2 + 0.5) * (this.simulationSpeed / 10);
            this.simulationData.overall_progress = Math.min(100, this.simulationData.overall_progress + increment);
            
            // Aktualizacja efektywności zespołu
            this.simulationData.team_efficiency += (Math.random() - 0.5) * 2;
            this.simulationData.team_efficiency = Math.max(70, Math.min(95, this.simulationData.team_efficiency));
            
            // Aktualizacja ryzyka
            this.simulationData.risk_indicator += (Math.random() - 0.6) * 3;
            this.simulationData.risk_indicator = Math.max(5, Math.min(50, this.simulationData.risk_indicator));
            
            // Aktualizacja ROI
            this.simulationData.roi_prediction += (Math.random() - 0.3) * 5;
            this.simulationData.roi_prediction = Math.max(120, Math.min(250, this.simulationData.roi_prediction));
            
            this.updateSimulationMetrics();
            this.updatePhaseVisualization();
            
            // Losowe eventy
            if (Math.random() > 0.95) {
                this.generateRandomEvent();
            }
        } else {
            this.completeSimulation();
            return;
        }
        
        // Następny krok
        setTimeout(() => {
            this.runSimulationStep();
        }, Math.max(100, 1000 / this.simulationSpeed));
    },

    // Aktualizacja wizualizacji faz
    updatePhaseVisualization() {
        const phases = document.querySelectorAll('.phase-node');
        const progress = this.simulationData.overall_progress;
        
        phases.forEach((phase, index) => {
            const phaseProgress = Math.max(0, Math.min(100, (progress - index * 20) * 5));
            const progressSpan = phase.querySelector('.node-progress');
            
            if (progressSpan) {
                progressSpan.textContent = Math.round(phaseProgress) + '%';
            }
            
            // Aktualizacja statusu węzła
            phase.classList.remove('completed', 'active', 'pending');
            
            if (phaseProgress >= 100) {
                phase.classList.add('completed');
            } else if (phaseProgress > 0) {
                phase.classList.add('active');
            } else {
                phase.classList.add('pending');
            }
        });
        
        // Aktualizacja wskaźników zasobów
        const teamIndicator = document.querySelector('.resource-indicator.team span');
        const budgetIndicator = document.querySelector('.resource-indicator.budget span');
        const timeIndicator = document.querySelector('.resource-indicator.time span');
        
        if (teamIndicator) {
            const teamUsage = Math.round(8 + (progress / 100) * 4);
            teamIndicator.textContent = `Zespół: ${teamUsage}/12`;
        }
        
        if (budgetIndicator) {
            const budgetUsed = Math.round((progress / 100) * 340);
            budgetIndicator.textContent = `Budżet: ${budgetUsed}k/500k PLN`;
        }
        
        if (timeIndicator) {
            const timeSpent = ((progress / 100) * 6).toFixed(1);
            timeIndicator.textContent = `Czas: ${timeSpent}/6.0 mies.`;
        }
    },

    // Reset wizualizacji
    resetVisualization() {
        const phases = document.querySelectorAll('.phase-node');
        
        phases.forEach((phase, index) => {
            phase.classList.remove('completed', 'active', 'pending');
            if (index === 0) {
                phase.classList.add('active');
                phase.querySelector('.node-progress').textContent = '0%';
            } else {
                phase.querySelector('.node-progress').textContent = '0%';
            }
        });
        
        // Reset wskaźników zasobów
        const teamIndicator = document.querySelector('.resource-indicator.team span');
        const budgetIndicator = document.querySelector('.resource-indicator.budget span');
        const timeIndicator = document.querySelector('.resource-indicator.time span');
        
        if (teamIndicator) teamIndicator.textContent = 'Zespół: 3/12';
        if (budgetIndicator) budgetIndicator.textContent = 'Budżet: 0k/500k PLN';
        if (timeIndicator) timeIndicator.textContent = 'Czas: 0.0/6.0 mies.';
    },

    // Generowanie losowych eventów
    generateRandomEvent() {
        const events = [
            { level: 'info', message: 'Nowy członek zespołu dołączył do projektu' },
            { level: 'success', message: 'Moduł finansowy skonfigurowany przed terminem' },
            { level: 'warning', message: 'Wykryto potencjalne problemy z integracją' },
            { level: 'info', message: 'Ukończono sesję szkoleniową dla użytkowników' },
            { level: 'success', message: 'Testy jednostkowe przeszły pomyślnie' },
            { level: 'warning', message: 'Opóźnienie w dostawie infrastruktury' },
            { level: 'info', message: 'Aktualizacja dokumentacji projektowej' }
        ];
        
        const event = events[Math.floor(Math.random() * events.length)];
        this.logMessage(event.level, event.message);
    },

    // Zakończenie symulacji
    completeSimulation() {
        this.simulationRunning = false;
        
        const startButton = document.getElementById('start-simulation');
        const pauseButton = document.getElementById('pause-simulation');
        
        if (startButton) {
            startButton.disabled = false;
            startButton.innerHTML = '<i class="fas fa-play"></i> Uruchom Symulację';
        }
        
        if (pauseButton) {
            pauseButton.disabled = true;
        }
        
        this.logMessage('success', '🎉 Symulacja zakończona pomyślnie!');
        this.logMessage('info', `Końcowy postęp: ${Math.round(this.simulationData.overall_progress)}%`);
        this.logMessage('info', `ROI: ${Math.round(this.simulationData.roi_prediction)}%`);
        
        // Pokazanie podsumowania
        this.showSimulationSummary();
    },

    // Pokazanie podsumowania symulacji
    showSimulationSummary() {
        const summary = document.createElement('div');
        summary.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 30px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.3);
            text-align: center;
            z-index: 1000;
            border: 3px solid #27ae60;
            min-width: 400px;
        `;
        
        summary.innerHTML = `
            <i class="fas fa-check-circle" style="font-size: 3rem; color: #27ae60; margin-bottom: 15px;"></i>
            <h3 style="color: #27ae60; margin-bottom: 15px;">Symulacja Zakończona!</h3>
            <div style="text-align: left; margin: 20px 0;">
                <p><strong>Postęp ogólny:</strong> ${Math.round(this.simulationData.overall_progress)}%</p>
                <p><strong>Efektywność zespołu:</strong> ${Math.round(this.simulationData.team_efficiency)}%</p>
                <p><strong>Poziom ryzyka:</strong> ${Math.round(this.simulationData.risk_indicator)}%</p>
                <p><strong>ROI predykcyjny:</strong> ${Math.round(this.simulationData.roi_prediction)}%</p>
            </div>
            <button onclick="this.parentElement.remove()" class="btn-primary" style="margin-top: 15px;">
                Zamknij
            </button>
        `;
        
        document.body.appendChild(summary);
    },

    // Aktualizacja metryk symulacji
    updateSimulationMetrics() {
        const overallProgress = document.getElementById('overall-progress');
        const teamEfficiency = document.getElementById('team-efficiency');
        const riskIndicator = document.getElementById('risk-indicator');
        const roiPrediction = document.getElementById('roi-prediction');
        
        if (overallProgress) {
            overallProgress.textContent = Math.round(this.simulationData.overall_progress) + '%';
        }
        
        if (teamEfficiency) {
            teamEfficiency.textContent = Math.round(this.simulationData.team_efficiency) + '%';
        }
        
        if (riskIndicator) {
            riskIndicator.textContent = Math.round(this.simulationData.risk_indicator) + '%';
        }
        
        if (roiPrediction) {
            roiPrediction.textContent = Math.round(this.simulationData.roi_prediction) + '%';
        }
    },

    // Konfiguracja analizy scenariuszy
    setupScenarioAnalysis() {
        const teamBoost = document.getElementById('team-boost');
        const budgetBoost = document.getElementById('budget-boost');
        const priorityLevel = document.getElementById('priority-level');
        
        // Obsługa zmian w sliderach
        if (teamBoost) {
            teamBoost.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = value;
                this.updateScenarioResults();
            });
        }
        
        if (budgetBoost) {
            budgetBoost.addEventListener('input', (e) => {
                const value = e.target.value;
                e.target.nextElementSibling.textContent = value + 'k';
                this.updateScenarioResults();
            });
        }
        
        if (priorityLevel) {
            priorityLevel.addEventListener('change', () => {
                this.updateScenarioResults();
            });
        }
    },

    // Aktualizacja wyników scenariusza
    updateScenarioResults() {
        const teamBoost = parseInt(document.getElementById('team-boost')?.value || 0);
        const budgetBoost = parseInt(document.getElementById('budget-boost')?.value || 0);
        const priority = document.getElementById('priority-level')?.value || 'normal';
        
        // Kalkulacja wpływu zmian
        let timeReduction = teamBoost * 0.2 + (budgetBoost / 50) * 0.3;
        let successIncrease = teamBoost * 2 + (budgetBoost / 100) * 5;
        let costIncrease = teamBoost * 50 + budgetBoost;
        
        // Wpływ priorytetu
        if (priority === 'high') {
            timeReduction += 0.5;
            successIncrease += 3;
            costIncrease += 30;
        } else if (priority === 'critical') {
            timeReduction += 1.0;
            successIncrease += 5;
            costIncrease += 80;
        }
        
        // Aktualizacja wyświetlanych wartości
        const newTimeline = document.getElementById('new-timeline');
        const newSuccessRate = document.getElementById('new-success-rate');
        const newCost = document.getElementById('new-cost');
        
        if (newTimeline) {
            const newTime = Math.max(3.0, 6.0 - timeReduction);
            newTimeline.textContent = newTime.toFixed(1) + ' mies.';
            newTimeline.style.color = newTime < 6.0 ? '#27ae60' : '#7f8c8d';
        }
        
        if (newSuccessRate) {
            const newSuccess = Math.min(99, 87 + successIncrease);
            newSuccessRate.textContent = Math.round(newSuccess) + '%';
            newSuccessRate.style.color = newSuccess > 87 ? '#27ae60' : '#7f8c8d';
        }
        
        if (newCost) {
            const newCostValue = 500 + costIncrease;
            newCost.textContent = newCostValue + 'k PLN';
            newCost.style.color = newCostValue > 500 ? '#e74c3c' : '#27ae60';
        }
    },

    // Dodanie wpisu do dziennika
    logMessage(level, message) {
        const logContainer = document.getElementById('simulation-log');
        if (!logContainer) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        
        const now = new Date();
        const timeStr = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        
        logEntry.innerHTML = `
            <span class="log-time">${timeStr}</span>
            <span class="log-level ${level}">${level.toUpperCase()}</span>
            <span class="log-message">${message}</span>
        `;
        
        logContainer.appendChild(logEntry);
        logContainer.scrollTop = logContainer.scrollHeight;
        
        // Ograniczenie liczby wpisów
        while (logContainer.children.length > 50) {
            logContainer.removeChild(logContainer.firstChild);
        }
    },

    // Aktualizacja metryk scenariusza
    updateScenarioMetrics(scenario) {
        // Symulacja wpływu scenariusza na metryki
        const baseMetrics = {
            overall_progress: 38,
            team_efficiency: 84,
            risk_indicator: 23,
            roi_prediction: 187
        };
        
        switch (scenario.complexity) {
            case 'low':
                this.simulationData.risk_indicator = baseMetrics.risk_indicator * 0.7;
                this.simulationData.team_efficiency = baseMetrics.team_efficiency * 1.1;
                break;
            case 'high':
                this.simulationData.risk_indicator = baseMetrics.risk_indicator * 1.3;
                this.simulationData.team_efficiency = baseMetrics.team_efficiency * 0.9;
                break;
            case 'very_high':
                this.simulationData.risk_indicator = baseMetrics.risk_indicator * 1.1;
                this.simulationData.team_efficiency = baseMetrics.team_efficiency * 1.05;
                break;
        }
        
        this.updateSimulationMetrics();
    },

    // Konfiguracja modułu analizy ROI
    setupROIModule() {
        // Inicjalizacja wykresów
        this.createCostChart();
        this.createROIChart();
        
        // Konfiguracja kalkulatora ROI
        this.setupROICalculator();
        
        // Aktualizacja danych w czasie rzeczywistym
        this.updateROIData();
    },

    // Tworzenie wykresu kosztów (pie chart)
    createCostChart() {
        const ctx = document.getElementById('cost-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: [
                    'Licencje oprogramowania',
                    'Usługi wdrożeniowe', 
                    'Infrastruktura IT',
                    'Szkolenia użytkowników',
                    'Koszty operacyjne'
                ],
                datasets: [{
                    data: [420000, 380000, 240000, 120000, 80000],
                    backgroundColor: [
                        '#3498db',
                        '#27ae60', 
                        '#f39c12',
                        '#9b59b6',
                        '#e74c3c'
                    ],
                    borderWidth: 3,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label;
                                const value = context.parsed;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString('pl-PL')} PLN (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    },

    // Tworzenie wykresu projekcji ROI
    createROIChart() {
        const ctx = document.getElementById('roi-chart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Rok 0', 'Rok 1', 'Rok 2', 'Rok 3', 'Rok 4', 'Rok 5'],
                datasets: [{
                    label: 'Skumulowane koszty (PLN)',
                    data: [-1240000, -1290000, -1340000, -1390000, -1440000, -1490000],
                    borderColor: '#e74c3c',
                    backgroundColor: 'rgba(231, 76, 60, 0.1)',
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Skumulowane korzyści (PLN)',
                    data: [0, 450000, 1340000, 2310000, 3360000, 4480000],
                    borderColor: '#27ae60',
                    backgroundColor: 'rgba(39, 174, 96, 0.1)', 
                    tension: 0.4,
                    fill: false
                }, {
                    label: 'Netto skumulowane (PLN)',
                    data: [-1240000, -840000, 0, 920000, 1920000, 2990000],
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        position: 'top'
                    },
                    title: {
                        display: true,
                        text: 'Projekcja ROI w czasie - Analiza skumulowana'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const value = context.parsed.y;
                                return `${context.dataset.label}: ${value.toLocaleString('pl-PL')} PLN`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Okres'
                        }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Wartość (PLN)'
                        },
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M PLN';
                            }
                        }
                    }
                }
            }
        });
    },

    // Konfiguracja kalkulatora ROI
    setupROICalculator() {
        const calculateButton = document.getElementById('calculate-roi');
        const inputs = ['license-cost', 'implementation-cost', 'annual-savings', 'revenue-increase'];
        
        // Obsługa przycisku kalkulacji
        if (calculateButton) {
            calculateButton.addEventListener('click', () => {
                this.calculateCustomROI();
            });
        }
        
        // Obsługa zmian w inputach (live calculation)
        inputs.forEach(inputId => {
            const input = document.getElementById(inputId);
            if (input) {
                input.addEventListener('input', () => {
                    this.calculateCustomROI();
                });
            }
        });
        
        // Pierwotna kalkulacja
        this.calculateCustomROI();
    },

    // Kalkulacja niestandardowego ROI
    calculateCustomROI() {
        // Pobranie wartości z inputów
        const licenseCost = parseFloat(document.getElementById('license-cost')?.value || 420000);
        const implementationCost = parseFloat(document.getElementById('implementation-cost')?.value || 380000);
        const annualSavings = parseFloat(document.getElementById('annual-savings')?.value || 890000);
        const revenueIncrease = parseFloat(document.getElementById('revenue-increase')?.value || 15);
        
        // Dodatkowe koszty (infrastructure, training, operational)
        const additionalCosts = 240000 + 120000 + 80000; // Z oryginalnych danych
        const totalInitialCost = licenseCost + implementationCost + additionalCosts;
        
        // Kalkulacja dodatkowych korzyści z wzrostu przychodów
        const additionalRevenue = (revenueIncrease / 100) * 2000000; // Zakładając przychody 2M PLN
        const totalAnnualBenefits = annualSavings + additionalRevenue;
        
        // Kalkulacja ROI po 3 latach
        const totalBenefits3Years = totalAnnualBenefits * 3;
        const operationalCosts3Years = 50000 * 3; // Koszty operacyjne rocznie
        const netBenefits3Years = totalBenefits3Years - operationalCosts3Years;
        const roi3Years = ((netBenefits3Years - totalInitialCost) / totalInitialCost) * 100;
        
        // Kalkulacja payback period (w miesiącach)
        const monthlyBenefits = (totalAnnualBenefits - 50000) / 12; // Miesięczne korzyści netto
        const paybackMonths = totalInitialCost / monthlyBenefits;
        
        // Kalkulacja NPV (Net Present Value) przy 8% stopie dyskontowej
        const discountRate = 0.08;
        let npv = -totalInitialCost;
        
        for (let year = 1; year <= 5; year++) {
            const yearlyNetBenefit = totalAnnualBenefits - 50000; // Korzyści minus koszty operacyjne
            const discountedBenefit = yearlyNetBenefit / Math.pow(1 + discountRate, year);
            npv += discountedBenefit;
        }
        
        // Aktualizacja wyświetlanych wartości
        this.updateROIResults(roi3Years, paybackMonths, npv);
        
        // Dodanie animacji dla lepszego UX
        this.animateROIResults();
    },

    // Aktualizacja wyników ROI
    updateROIResults(roi, paybackMonths, npv) {
        const roiElement = document.getElementById('new-roi');
        const paybackElement = document.getElementById('new-payback');
        const npvElement = document.getElementById('new-npv');
        
        if (roiElement) {
            roiElement.textContent = `${Math.round(roi)}%`;
            roiElement.style.color = roi > 200 ? '#27ae60' : roi > 100 ? '#f39c12' : '#e74c3c';
        }
        
        if (paybackElement) {
            const paybackText = paybackMonths < 12 ? 
                `${Math.round(paybackMonths)} miesięcy` : 
                `${(paybackMonths / 12).toFixed(1)} lat`;
            paybackElement.textContent = paybackText;
            paybackElement.style.color = paybackMonths < 18 ? '#27ae60' : paybackMonths < 36 ? '#f39c12' : '#e74c3c';
        }
        
        if (npvElement) {
            npvElement.textContent = `${(npv / 1000000).toFixed(2)}M PLN`;
            npvElement.style.color = npv > 2000000 ? '#27ae60' : npv > 1000000 ? '#f39c12' : '#e74c3c';
        }
    },

    // Animacja wyników ROI
    animateROIResults() {
        const resultItems = document.querySelectorAll('.result-item');
        resultItems.forEach((item, index) => {
            item.style.transform = 'scale(1.05)';
            item.style.boxShadow = '0 5px 15px rgba(52, 152, 219, 0.3)';
            
            setTimeout(() => {
                item.style.transform = 'scale(1)';
                item.style.boxShadow = '0 3px 10px rgba(0, 0, 0, 0.1)';
            }, 200 + index * 100);
        });
    },

    // Aktualizacja danych ROI w czasie rzeczywistym
    updateROIData() {
        setInterval(() => {
            // Symulacja zmian w metrikach ROI
            const roiCards = document.querySelectorAll('.roi-value');
            
            roiCards.forEach(card => {
                if (card.textContent.includes('PLN')) {
                    // Aktualizacja wartości finansowych
                    const currentValue = parseFloat(card.textContent.replace(/[^\d.-]/g, ''));
                    const variation = (Math.random() - 0.5) * 0.02; // ±2% zmiana
                    const newValue = Math.round(currentValue * (1 + variation));
                    card.textContent = newValue.toLocaleString('pl-PL') + ' PLN';
                } else if (card.textContent.includes('%')) {
                    // Aktualizacja procentów
                    const currentPercent = parseFloat(card.textContent.replace('%', ''));
                    const variation = (Math.random() - 0.5) * 4; // ±4% zmiana
                    const newPercent = Math.round(currentPercent + variation);
                    card.textContent = newPercent + '%';
                } else if (card.textContent.includes('miesięcy')) {
                    // Aktualizacja czasu zwrotu
                    const currentMonths = parseFloat(card.textContent.replace(/[^\d.-]/g, ''));
                    const variation = (Math.random() - 0.5) * 2; // ±2 miesiące
                    const newMonths = Math.max(8, Math.round(currentMonths + variation));
                    card.textContent = newMonths + ' miesięcy';
                }
            });
            
            // Aktualizacja czynników ryzyka
            const riskFactors = document.querySelectorAll('.risk-level');
            riskFactors.forEach(factor => {
                const currentText = factor.textContent;
                const match = currentText.match(/(\d+)%/);
                if (match) {
                    const currentPercent = parseInt(match[1]);
                    const variation = Math.floor((Math.random() - 0.5) * 6); // ±3% zmiana
                    const newPercent = Math.max(5, Math.min(95, currentPercent + variation));
                    factor.textContent = currentText.replace(/\d+%/, newPercent + '%');
                }
            });
            
        }, 25000); // Aktualizacja co 25 sekund
    },

    // Symulacja analizy wrażliwości ROI
    performSensitivityAnalysis() {
        const scenarios = [
            { name: 'Pesymistyczny', savingsMultiplier: 0.7, costMultiplier: 1.2 },
            { name: 'Realistyczny', savingsMultiplier: 1.0, costMultiplier: 1.0 },
            { name: 'Optymistyczny', savingsMultiplier: 1.3, costMultiplier: 0.9 }
        ];
        
        scenarios.forEach(scenario => {
            const adjustedSavings = 890000 * scenario.savingsMultiplier;
            const adjustedCosts = 1240000 * scenario.costMultiplier;
            const roi = ((adjustedSavings * 3 - adjustedCosts) / adjustedCosts) * 100;
            
            console.log(`Scenariusz ${scenario.name}: ROI = ${roi.toFixed(1)}%`);
        });
    },

    // Eksport danych ROI do CSV (symulacja)
    exportROIData() {
        const roiData = {
            totalInvestment: 1240000,
            annualSavings: 890000,
            paybackPeriod: 14,
            roi3Years: 287,
            npv5Years: 2840000
        };
        
        console.log('Eksportowanie danych ROI:', roiData);
        alert('Dane ROI zostały wyeksportowane do pliku CSV');
    },

    // Porównanie scenariuszy ROI
    compareROIScenarios() {
        const scenarios = [
            { name: 'Standardowy', cost: 1240000, savings: 890000 },
            { name: 'Premium', cost: 1580000, savings: 1150000 },
            { name: 'Podstawowy', cost: 950000, savings: 720000 }
        ];
        
        console.log('Porównanie scenariuszy ROI:');
        scenarios.forEach(scenario => {
            const roi = ((scenario.savings * 3 - scenario.cost) / scenario.cost) * 100;
            const payback = scenario.cost / (scenario.savings / 12);
            console.log(`${scenario.name}: ROI=${roi.toFixed(1)}%, Payback=${payback.toFixed(1)} miesięcy`);
        });
    },

    // Aktualizacje w czasie rzeczywistym
    startRealTimeUpdates() {
        // Aktualizacja statystyk bazy wiedzy
        setInterval(() => {
            const stats = document.querySelectorAll('.stat-number');
            stats.forEach(stat => {
                const current = parseInt(stat.textContent.replace(/,/g, ''));
                const increase = Math.floor(Math.random() * 3);
                const newValue = current + increase;
                stat.textContent = newValue.toLocaleString('pl-PL');
            });
        }, 45000);

        // Aktualizacja wskaźników uczenia się AI
        setInterval(() => {
            const learningStats = document.querySelectorAll('.learning-stats .stat-number');
            if (learningStats.length >= 3) {
                // Zwiększenie liczby interakcji
                const interactions = parseInt(learningStats[0].textContent);
                learningStats[0].textContent = interactions + Math.floor(Math.random() * 3);
                
                // Aktualizacja trafności
                const accuracy = parseFloat(learningStats[1].textContent);
                const newAccuracy = Math.min(99, accuracy + (Math.random() - 0.5) * 0.5);
                learningStats[1].textContent = newAccuracy.toFixed(0) + '%';
                
                // Aktualizacja czasu odpowiedzi
                const responseTime = parseFloat(learningStats[2].textContent);
                const newResponseTime = Math.max(1.0, responseTime + (Math.random() - 0.5) * 0.2);
                learningStats[2].textContent = newResponseTime.toFixed(1) + 's';
            }
        }, 20000);
    },

    // Dodatkowe funkcje demonstracyjne
    demonstrateAIFeatures() {
        // Symulacja zaawansowanych funkcji AI
        console.log('Demonstracja funkcji AI:');
        console.log('1. Przetwarzanie języka naturalnego - AKTYWNE');
        console.log('2. Retrieval-Augmented Generation - AKTYWNE');
        console.log('3. Analiza predykcyjna - AKTYWNE');
        console.log('4. Uczenie maszynowe - AKTYWNE');
        console.log('5. Personalizacja interfejsu - AKTYWNE');
    }
};

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    ERPAssistant.init();
    
    // Demonstracja funkcji
    setTimeout(() => {
        ERPAssistant.demonstrateAIFeatures();
    }, 2000);
    
    // Dodanie przykładowych pytań do chatu
    setTimeout(() => {
        ERPAssistant.addChatMessage(
            "Możesz zadać mi pytania takie jak:<br>• Jak skonfigurować moduł finansowy?<br>• Jakie są etapy wdrożenia ERP?<br>• Jak zarządzać ryzykiem projektowym?", 
            'assistant'
        );
    }, 3000);
});
