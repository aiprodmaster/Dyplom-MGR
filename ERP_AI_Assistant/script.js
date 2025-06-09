// Główny obiekt aplikacji
const ERPAssistant = {
    // ✅ POPRAWIONA konfiguracja Claude API - BEZ KLUCZA!
    claudeConfig: {
        apiUrl: '/api/claude', // Proxy przez backend
        model: 'claude-3-sonnet-20240229',
        maxTokens: 1000,
        // API key będzie obsługiwany przez backend
        headers: {
            'Content-Type': 'application/json'
        }
    },

    // ✅ DODANE: Security headers i validation
    securityConfig: {
        maxMessageLength: 4000,
        rateLimitDelay: 1000, // 1 sekunda między requestami
        maxRequestsPerMinute: 30,
        lastRequestTime: 0,
        requestCount: 0,
        requestWindow: 60000 // 1 minuta
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

    // ✅ DODANE: Loaded modules tracking dla lazy loading
    loadedModules: new Set(['chat']), // Chat jest zawsze załadowany

    // ✅ DODANE: Error handling state
    errorState: {
        lastError: null,
        errorCount: 0,
        isOnline: navigator.onLine
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
            name: "AI LUKAS - Architekt IT",
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

    // ✅ POPRAWIONA inicjalizacja aplikacji
    init() {
        console.log('🚀 Inicjalizacja ERP Assistant...');
        
        // Sprawdź dostępność wymaganych API
        this.checkBrowserSupport();
        
        // Inicjalizuj moduły core
        this.setupNavigation();
        this.setupChatModule();
        this.setupErrorHandling();
        
        // Lazy load pozostałych modułów
        this.setupLazyLoading();
        
        // Uruchom monitoring
        this.startRealTimeUpdates();
        this.setupOnlineStatusMonitoring();
        
        console.log('✅ ERP Assistant zainicjalizowany');
    },

    // ✅ NOWA: Sprawdzenie wsparcia przeglądarki
    checkBrowserSupport() {
        const requiredFeatures = {
            'localStorage': typeof Storage !== 'undefined',
            'fetch': typeof fetch !== 'undefined',
            'Promise': typeof Promise !== 'undefined',
            'addEventListener': typeof EventTarget !== 'undefined'
        };

        const missingFeatures = Object.entries(requiredFeatures)
            .filter(([feature, supported]) => !supported)
            .map(([feature]) => feature);

        if (missingFeatures.length > 0) {
            console.warn('⚠️ Brakuje wsparcia dla:', missingFeatures);
            this.showCompatibilityWarning(missingFeatures);
        }
    },

    // ✅ NOWA: Ostrzeżenie o kompatybilności
    showCompatibilityWarning(missingFeatures) {
        const warning = document.createElement('div');
        warning.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            background: #e74c3c;
            color: white;
            padding: 15px;
            text-align: center;
            z-index: 10000;
            font-weight: bold;
        `;
        warning.innerHTML = `
            ⚠️ Twoja przeglądarka może nie obsługiwać wszystkich funkcji. 
            Brakuje: ${missingFeatures.join(', ')}. 
            Zalecamy aktualizację przeglądarki.
        `;
        document.body.insertBefore(warning, document.body.firstChild);
    },

    // ✅ POPRAWIONA konfiguracja nawigacji z lazy loading
    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        const modules = document.querySelectorAll('.module-panel');

        if (navItems.length === 0) {
            console.log('Brak elementów nawigacji - ładowanie w trybie standalone');
            return;
        }

        navItems.forEach(item => {
            item.addEventListener('click', async () => {
                const targetModule = item.dataset.module;
                
                try {
                    // Pokaż loading indicator
                    this.showLoadingIndicator(item);
                    
                    // Lazy load modułu jeśli jeszcze nie załadowany
                    if (!this.loadedModules.has(targetModule)) {
                        await this.loadModule(targetModule);
                        this.loadedModules.add(targetModule);
                    }
                    
                    // Usunięcie aktywnej klasy z wszystkich elementów
                    navItems.forEach(nav => nav.classList.remove('active'));
                    modules.forEach(module => module.classList.remove('active'));
                    
                    // Dodanie aktywnej klasy
                    item.classList.add('active');
                    const modulePanel = document.getElementById(`${targetModule}-module`);
                    if (modulePanel) {
                        modulePanel.classList.add('active');
                    }
                    
                    // Animacja przejścia
                    this.animateModuleTransition(targetModule);
                    
                } catch (error) {
                    console.error('Błąd ładowania modułu:', error);
                    this.handleModuleLoadError(targetModule, error);
                } finally {
                    this.hideLoadingIndicator(item);
                }
            });
        });
    },

    // ✅ NOWA: Lazy loading modułów
    async loadModule(moduleName) {
        const loadStartTime = performance.now();
        console.log(`📦 Ładowanie modułu: ${moduleName}`);
        
        try {
            switch (moduleName) {
                case 'analytics':
                    await this.setupAnalyticsModule();
                    break;
                case 'documentation':
                    await this.setupDocumentationModule();
                    break;
                case 'risk':
                    await this.setupRiskModule();
                    break;
                case 'personalization':
                    await this.setupPersonalizationModule();
                    break;
                case 'training':
                    await this.setupTrainingModule();
                    break;
                case 'simulator':
                    await this.setupSimulatorModule();
                    break;
                case 'roi':
                    await this.setupROIModule();
                    break;
                default:
                    console.warn(`Nieznany moduł: ${moduleName}`);
            }
            
            const loadTime = performance.now() - loadStartTime;
            console.log(`✅ Moduł ${moduleName} załadowany w ${loadTime.toFixed(2)}ms`);
            
        } catch (error) {
            console.error(`❌ Błąd ładowania modułu ${moduleName}:`, error);
            throw error;
        }
    },

    // ✅ NOWA: Loading indicators
    showLoadingIndicator(element) {
        const loader = document.createElement('div');
        loader.className = 'nav-loading';
        loader.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            right: 10px;
            transform: translateY(-50%);
            color: #3498db;
        `;
        element.style.position = 'relative';
        element.appendChild(loader);
    },

    hideLoadingIndicator(element) {
        const loader = element.querySelector('.nav-loading');
        if (loader) {
            loader.remove();
        }
    },

    // ✅ NOWA: Error handling dla modułów
    handleModuleLoadError(moduleName, error) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #e74c3c;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        `;
        errorDiv.innerHTML = `
            <strong>❌ Błąd ładowania modułu</strong><br>
            <small>Moduł "${moduleName}" nie mógł zostać załadowany</small>
            <button onclick="this.parentElement.remove()" style="
                position: absolute;
                top: 5px;
                right: 8px;
                background: none;
                border: none;
                color: white;
                cursor: pointer;
                font-size: 16px;
            ">×</button>
        `;
        
        document.body.appendChild(errorDiv);
        
        // Auto-remove po 5 sekundach
        setTimeout(() => {
            if (errorDiv.parentElement) {
                errorDiv.remove();
            }
        }, 5000);
    },

    // ✅ NOWA: Monitoring stanu online
    setupOnlineStatusMonitoring() {
        const updateOnlineStatus = () => {
            this.errorState.isOnline = navigator.onLine;
            const statusIndicators = document.querySelectorAll('.status-indicator, .ai-indicator');
            
            statusIndicators.forEach(indicator => {
                if (navigator.onLine) {
                    indicator.classList.add('active');
                    indicator.classList.remove('offline');
                } else {
                    indicator.classList.remove('active');
                    indicator.classList.add('offline');
                }
            });

            // Pokaż powiadomienie
            if (!navigator.onLine) {
                this.showOfflineNotification();
            } else if (this.errorState.isOnline === false) {
                this.showOnlineNotification();
            }
        };

        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Sprawdź początkowy stan
        updateOnlineStatus();
    },

    // ✅ NOWA: Powiadomienia offline/online
    showOfflineNotification() {
        this.showNotification('⚠️ Brak połączenia z internetem', 'warning', 5000);
    },

    showOnlineNotification() {
        this.showNotification('✅ Połączenie przywrócone', 'success', 3000);
    },

    showNotification(message, type = 'info', duration = 3000) {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            z-index: 1000;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
        `;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        // Animacja wejścia
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Auto-remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, duration);
    },

    // ✅ POPRAWIONA konfiguracja modułu czatu z rate limiting
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

        // ✅ DODANA: Rate limiting funkcja
        const checkRateLimit = () => {
            const now = Date.now();
            const timeSinceLastRequest = now - this.securityConfig.lastRequestTime;
            
            // Reset licznika co minutę
            if (timeSinceLastRequest > this.securityConfig.requestWindow) {
                this.securityConfig.requestCount = 0;
            }
            
            // Sprawdź limity
            if (this.securityConfig.requestCount >= this.securityConfig.maxRequestsPerMinute) {
                throw new Error('Zbyt wiele zapytań. Spróbuj ponownie za chwilę.');
            }
            
            if (timeSinceLastRequest < this.securityConfig.rateLimitDelay) {
                throw new Error('Wysyłasz wiadomości zbyt szybko. Poczekaj chwilę.');
            }
            
            return true;
        };

        // ✅ POPRAWIONA funkcja wysyłania wiadomości z security checks
        const sendAdvancedMessage = async () => {
            const message = chatInputAdvanced.value.trim();
            
            try {
                // Security validation
                if (!message) return;
                
                if (message.length > this.securityConfig.maxMessageLength) {
                    throw new Error(`Wiadomość jest zbyt długa. Maksymalnie ${this.securityConfig.maxMessageLength} znaków.`);
                }
                
                // Rate limiting
                checkRateLimit();
                
                // Sanitize input
                const sanitizedMessage = this.sanitizeInput(message);
                
                // Update rate limiting counters
                this.securityConfig.lastRequestTime = Date.now();
                this.securityConfig.requestCount++;
                
                // Dodanie wiadomości użytkownika
                this.addAdvancedChatMessage(sanitizedMessage, 'user');
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
                const response = await this.generateRAGResponse(sanitizedMessage);
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
                console.error('Błąd wysyłania wiadomości:', error);
                this.hideAdvancedTypingIndicator();
                
                let errorMessage = 'Przepraszam, wystąpił błąd podczas przetwarzania Twojej wiadomości.';
                
                if (error.message.includes('Rate limit') || error.message.includes('zbyt szybko') || error.message.includes('zbyt wiele')) {
                    errorMessage = error.message;
                }
                
                this.addAdvancedChatMessage(errorMessage, 'assistant');
                this.showNotification(error.message, 'warning');
            }
        };

        // ✅ NOWA: Input sanitization
        this.sanitizeInput = (input) => {
            // Usuń potencjalnie niebezpieczne znaki
            return input
                .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // Remove scripts
                .replace(/javascript:/gi, '') // Remove javascript: protocols
                .replace(/on\w+="[^"]*"/gi, '') // Remove event handlers
                .trim();
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

        // ✅ POPRAWIONA obsługa licznika znaków z debounce
        let debounceTimer;
        chatInputAdvanced.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                this.updateCharCount();
                this.updateSendButton();
                this.autoResizeTextarea(chatInputAdvanced);
            }, 100);
        });

        // ✅ DODANA: Obsługa przycisków brakujących funkcji
        this.setupAdditionalChatControls();

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

    // ✅ NOWA: Obsługa dodatkowych kontrolek czatu
    setupAdditionalChatControls() {
        // Przycisk ustawień asystenta
        const assistantSettingsBtn = document.getElementById('assistant-settings-btn');
        const assistantSettingsPanel = document.getElementById('assistant-settings-panel');
        const closeSettingsBtn = document.getElementById('close-settings');

        if (assistantSettingsBtn && assistantSettingsPanel) {
            assistantSettingsBtn.addEventListener('click', () => {
                assistantSettingsPanel.classList.toggle('active');
            });
        }

        if (closeSettingsBtn && assistantSettingsPanel) {
            closeSettingsBtn.addEventListener('click', () => {
                assistantSettingsPanel.classList.remove('active');
            });
        }

        // Przycisk czyszczenia czatu
        const clearChatBtn = document.getElementById('clear-chat-btn');
        if (clearChatBtn) {
            clearChatBtn.addEventListener('click', () => {
                this.clearChatHistory();
            });
        }

        // Przycisk eksportu czatu  
        const exportChatBtn = document.getElementById('export-chat-btn');
        if (exportChatBtn) {
            exportChatBtn.addEventListener('click', () => {
                this.exportChatHistory();
            });
        }

        // Przycisk załącznika
        const attachFileBtn = document.getElementById('attach-file-btn');
        if (attachFileBtn) {
            attachFileBtn.addEventListener('click', () => {
                this.openFileDialog();
            });
        }

        // Przycisk voice input
        const voiceInputBtn = document.getElementById('voice-input-btn');
        if (voiceInputBtn) {
            voiceInputBtn.addEventListener('click', () => {
                this.startVoiceRecognition();
            });
        }

        // Przycisk odświeżania sugestii
        const refreshSuggestionsBtn = document.getElementById('refresh-suggestions');
        if (refreshSuggestionsBtn) {
            refreshSuggestionsBtn.addEventListener('click', () => {
                this.refreshSuggestions();
            });
        }
    },

    // ✅ NOWA: Error handling setup
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            console.error('Global Error:', event.error);
            this.errorState.lastError = event.error;
            this.errorState.errorCount++;
            
            // Pokaż powiadomienie tylko dla krytycznych błędów
            if (this.errorState.errorCount > 5) {
                this.showNotification('Wykryto wiele błędów. Spróbuj odświeżyć stronę.', 'warning', 10000);
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled Promise Rejection:', event.reason);
            this.errorState.lastError = event.reason;
            this.errorState.errorCount++;
        });
    },

    // ✅ NOWA: Lazy loading setup
    setupLazyLoading() {
        // Implementacja intersection observer dla lazy loading modułów
        if ('IntersectionObserver' in window) {
            const moduleObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const moduleId = entry.target.id;
                        const moduleName = moduleId.replace('-module', '');
                        
                        if (!this.loadedModules.has(moduleName)) {
                            this.loadModule(moduleName).catch(console.error);
                        }
                    }
                });
            }, { threshold: 0.1 });

            // Obserwuj moduły
            document.querySelectorAll('.module-panel').forEach(module => {
                moduleObserver.observe(module);
            });
        }
    },

    // ✅ NOWA: Real-time updates
    startRealTimeUpdates() {
        // Symulacja real-time updates
        setInterval(() => {
            this.updateSystemStats();
        }, 30000); // Co 30 sekund

        // Update czasu sesji
        setInterval(() => {
            this.updateSessionTime();
        }, 1000);
    },

    updateSystemStats() {
        // Symulacja aktualizacji statystyk systemu
        const stats = {
            uptime: Math.floor(performance.now() / 1000),
            memory: Math.floor(Math.random() * 100),
            requests: this.securityConfig.requestCount
        };

        // Aktualizuj UI jeśli istnieje
        const statsElement = document.getElementById('system-stats');
        if (statsElement) {
            statsElement.innerHTML = `
                Uptime: ${stats.uptime}s | 
                Memory: ${stats.memory}% | 
                Requests: ${stats.requests}
            `;
        }
    },

    updateSessionTime() {
        const sessionTime = document.getElementById('session-time');
        if (sessionTime) {
            const now = new Date();
            sessionTime.textContent = now.toLocaleTimeString('pl-PL');
        }
    },

    // ✅ POMOCNICZE METODY

    updateCharCount() {
        const chatInput = document.getElementById('chat-input-advanced');
        const charCount = document.querySelector('.character-count');
        
        if (chatInput && charCount) {
            const current = chatInput.value.length;
            const max = this.securityConfig.maxMessageLength;
            charCount.textContent = `${current}/${max}`;
            
            // Zmień kolor w zależności od długości
            if (current >= max * 0.9) {
                charCount.style.color = '#e74c3c';
            } else if (current >= max * 0.7) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#7f8c8d';
            }
        }
    },

    updateSendButton() {
        const chatInput = document.getElementById('chat-input-advanced');
        const sendButton = document.querySelector('.send-btn');
        
        if (chatInput && sendButton) {
            const hasText = chatInput.value.trim().length > 0;
            const withinLimit = chatInput.value.length <= this.securityConfig.maxMessageLength;
            
            sendButton.disabled = !hasText || !withinLimit;
            sendButton.style.opacity = (hasText && withinLimit) ? '1' : '0.5';
        }
    },

    autoResizeTextarea(textarea) {
        if (!textarea) return;
        
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, 120); // Max 120px
        textarea.style.height = newHeight + 'px';
    },

    // ✅ POZOSTAŁE METODY

    clearChatHistory() {
        if (confirm('Czy na pewno chcesz wyczyścić historię czatu?')) {
            const messagesContent = document.querySelector('.messages-content');
            if (messagesContent) {
                const welcomeMessage = messagesContent.querySelector('.welcome-message');
                messagesContent.innerHTML = '';
                if (welcomeMessage) {
                    messagesContent.appendChild(welcomeMessage);
                }
            }
            
            this.conversationContext.history = [];
            this.conversationContext.currentTopic = null;
            this.conversationContext.sessionData = {
                questionsAsked: 0,
                topicsDiscussed: [],
                lastInteraction: null
            };
            
            const quickActions = document.querySelector('.quick-actions');
            if (quickActions) {
                quickActions.style.display = 'block';
            }
            
            this.showNotification('Historia czatu została wyczyszczona', 'success');
        }
    },

    exportChatHistory() {
        try {
            const exportData = {
                timestamp: new Date().toISOString(),
                sessionId: this.getSessionId(),
                messages: this.conversationContext.history,
                userProfile: this.conversationContext.userProfile,
                sessionData: this.conversationContext.sessionData,
                exportVersion: '1.0'
            };
            
            const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                type: 'application/json'
            });
            
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `chat-export-${new Date().toISOString().split('T')[0]}-${Date.now()}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showNotification('Historia czatu została wyeksportowana', 'success');
        } catch (error) {
            console.error('Błąd eksportu:', error);
            this.showNotification('Błąd podczas eksportu czatu', 'warning');
        }
    },

    openFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.pdf,.doc,.docx,.txt,.csv,.xlsx,.png,.jpg,.jpeg';
        input.multiple = true;
        
        input.onchange = (e) => {
            const files = Array.from(e.target.files);
            this.handleFileUpload(files);
        };
        
        input.click();
    },

    handleFileUpload(files) {
        if (files.length === 0) return;
        
        const maxFileSize = 10 * 1024 * 1024; // 10MB
        const supportedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'text/csv',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'image/png',
            'image/jpeg',
            'image/jpg'
        ];
        
        const validFiles = [];
        const errors = [];
        
        files.forEach(file => {
            if (file.size > maxFileSize) {
                errors.push(`${file.name}: plik zbyt duży (max 10MB)`);
            } else if (!supportedTypes.includes(file.type)) {
                errors.push(`${file.name}: nieobsługiwany typ pliku`);
            } else {
                validFiles.push(file);
            }
        });
        
        if (errors.length > 0) {
            this.showNotification(`Błędy: ${errors.join(', ')}`, 'warning', 5000);
        }
        
        if (validFiles.length > 0) {
            this.processUploadedFiles(validFiles);
        }
    },

    processUploadedFiles(files) {
        files.forEach(file => {
            this.addAdvancedChatMessage(
                `📎 Przesłano plik: <strong>${file.name}</strong> (${(file.size / 1024).toFixed(1)} KB)<br>
                <em>Funkcja analizy plików będzie dostępna po implementacji backend.</em>`, 
                'assistant'
            );
        });
        
        this.showNotification(`Przesłano ${files.length} plik(ów)`, 'success');
    },

    startVoiceRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            this.showNotification('Twoja przeglądarka nie obsługuje rozpoznawania mowy', 'warning');
            return;
        }
        
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        recognition.lang = 'pl-PL';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        
        const voiceBtn = document.getElementById('voice-input-btn');
        const originalContent = voiceBtn ? voiceBtn.innerHTML : '';
        
        recognition.onstart = () => {
            if (voiceBtn) {
                voiceBtn.innerHTML = '<i class="fas fa-microphone-slash"></i>';
                voiceBtn.style.background = '#e74c3c';
            }
            this.showNotification('🎤 Słucham... Mów teraz', 'info');
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const confidence = event.results[0][0].confidence;
            
            const chatInput = document.getElementById('chat-input-advanced');
            if (chatInput) {
                chatInput.value = transcript;
                this.updateCharCount();
                this.updateSendButton();
                chatInput.focus();
            }
            
            this.showNotification(`✅ Rozpoznano: "${transcript}" (${(confidence * 100).toFixed(0)}%)`, 'success');
        };
        
        recognition.onerror = (event) => {
            console.error('Błąd rozpoznawania mowy:', event.error);
            this.showNotification(`Błąd rozpoznawania mowy: ${event.error}`, 'warning');
        };
        
        recognition.onend = () => {
            if (voiceBtn) {
                voiceBtn.innerHTML = originalContent;
                voiceBtn.style.background = '';
            }
        };
        
        try {
            recognition.start();
        } catch (error) {
            console.error('Błąd uruchamiania rozpoznawania mowy:', error);
            this.showNotification('Nie można uruchomić rozpoznawania mowy', 'warning');
        }
    },

    refreshSuggestions() {
        const suggestions = [
            {
                icon: 'fas fa-calculator',
                text: 'Jak skonfigurować moduł finansowy w Comarch ERP XL zgodnie z najnowszymi standardami?',
                label: 'Konfiguracja finansów'
            },
            {
                icon: 'fas fa-rocket',
                text: 'Przedstaw szczegółowy plan wdrożenia systemu ERP z analizą ryzyka',
                label: 'Plan wdrożenia'
            },
            {
                icon: 'fas fa-link',
                text: 'Jak bezpiecznie zintegrować system CRM z ERP zachowując zgodność z RODO?',
                label: 'Integracja CRM'
            },
            {
                icon: 'fas fa-shield-alt',
                text: 'Przeprowadź analizę predykcyjną ryzyka w projekcie ERP',
                label: 'Analiza ryzyka'
            }
        ];
        
        const actionButtons = document.querySelector('.action-buttons');
        if (actionButtons) {
            actionButtons.innerHTML = '';
            
            suggestions.forEach(suggestion => {
                const button = document.createElement('button');
                button.className = 'action-btn';
                button.setAttribute('data-text', suggestion.text);
                button.innerHTML = `
                    <i class="${suggestion.icon}"></i>
                    <span>${suggestion.label}</span>
                `;
                
                button.addEventListener('click', () => {
                    const chatInput = document.getElementById('chat-input-advanced');
                    if (chatInput) {
                        chatInput.value = suggestion.text;
                        this.updateCharCount();
                        this.updateSendButton();
                        chatInput.focus();
                    }
                });
                
                actionButtons.appendChild(button);
            });
        }
        
        this.showNotification('Sugestie zostały odświeżone', 'success', 2000);
    },

    // ✅ GENEROWANIE ODPOWIEDZI AI

    async generateRAGResponse(message) {
        try {
            // Najpierw sprawdź lokalną bazę wiedzy
            const localResponse = this.searchKnowledgeBase(message);
            if (localResponse) {
                return localResponse;
            }

            // Jeśli nie ma odpowiedzi lokalnej, użyj Claude API
            const response = await fetch(this.claudeConfig.apiUrl, {
                method: 'POST',
                headers: this.claudeConfig.headers,
                body: JSON.stringify({
                    message: message,
                    model: this.claudeConfig.model,
                    max_tokens: this.claudeConfig.maxTokens
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            return {
                answer: data.response || data.content || 'Brak odpowiedzi z API',
                confidence: data.confidence || 0.8,
                sources: data.sources || ['Claude AI'],
                specialist: this.determineSpecialist(message)
            };

        } catch (error) {
            console.error('Błąd generowania odpowiedzi:', error);
            
            // Fallback do lokalnej bazy wiedzy
            return {
                answer: `Przepraszam, wystąpił problem z połączeniem. Oto co mogę powiedzieć na podstawie lokalnej bazy wiedzy: ${this.generateFallbackResponse(message)}`,
                confidence: 0.6,
                sources: ['Lokalna baza wiedzy'],
                specialist: null
            };
        }
    },

    searchKnowledgeBase(query) {
        const lowercaseQuery = query.toLowerCase();
        
        for (const [key, entry] of Object.entries(this.knowledgeBase)) {
            if (lowercaseQuery.includes(key)) {
                this.conversationContext.history.push({
                    query: query,
                    response: entry,
                    timestamp: new Date().toISOString()
                });
                
                return entry;
            }
        }
        
        return null;
    },

    generateFallbackResponse(message) {
        const fallbackResponses = [
            "To interesujące pytanie dotyczące systemów ERP. Polecam skonsultowanie się z dokumentacją Comarch ERP XL.",
            "W kontekście wdrożeń ERP, kluczowe jest podejście etapowe i dokładna analiza procesów biznesowych.",
            "Systemy ERP wymagają indywidualnego podejścia do każdej organizacji. Czy możesz sprecyzować swoje pytanie?",
            "To zagadnienie związane z ERP wymaga głębszej analizy. Mogę pomóc, jeśli podasz więcej szczegółów."
        ];
        
        return fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    },

    determineSpecialist(message) {
        const lowercaseMessage = message.toLowerCase();
        
        if (lowercaseMessage.includes('finans') || lowercaseMessage.includes('księg') || lowercaseMessage.includes('vat')) {
            return 'financial';
        } else if (lowercaseMessage.includes('integr') || lowercaseMessage.includes('api') || lowercaseMessage.includes('technical')) {
            return 'technical';
        } else if (lowercaseMessage.includes('projekt') || lowercaseMessage.includes('zespół') || lowercaseMessage.includes('plan')) {
            return 'project';
        } else if (lowercaseMessage.includes('ryzyko') || lowercaseMessage.includes('bezpieczeń') || lowercaseMessage.includes('audit')) {
            return 'risk';
        }
        
        return null;
    },

    // ✅ DODAWANIE WIADOMOŚCI DO CZATU

    addAdvancedChatMessage(message, sender, confidence = null, sources = null, specialist = null) {
        const messagesContainer = document.getElementById('chat-messages-advanced') || 
                                 document.querySelector('.messages-content');
        
        if (!messagesContainer) {
            console.warn('Kontener wiadomości nie znaleziony');
            return;
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        let avatarHtml = '';
        let specialistInfo = '';
        
        if (sender === 'assistant') {
            const currentSpecialist = specialist ? this.aiSpecialists[specialist] : null;
            const avatar = currentSpecialist ? currentSpecialist.avatar : '🤖';
            const name = currentSpecialist ? currentSpecialist.name : 'ERP Assistant';
            
            avatarHtml = `<div class="avatar">${avatar}</div>`;
            
            if (currentSpecialist) {
                specialistInfo = `<div class="specialist-info">
                    <small>${name} - ${currentSpecialist.personality}</small>
                </div>`;
            }
        } else {
            avatarHtml = `<div class="avatar">👤</div>`;
        }

        let confidenceBar = '';
        if (confidence && sender === 'assistant') {
            const confidencePercent = Math.round(confidence * 100);
            const confidenceColor = confidence > 0.8 ? '#27ae60' : confidence > 0.6 ? '#f39c12' : '#e74c3c';
            
            confidenceBar = `
                <div class="confidence-bar">
                    <div class="confidence-label">Pewność: ${confidencePercent}%</div>
                    <div class="confidence-progress">
                        <div class="confidence-fill" style="width: ${confidencePercent}%; background: ${confidenceColor}"></div>
                    </div>
                </div>
            `;
        }

        let sourcesInfo = '';
        if (sources && sources.length > 0 && sender === 'assistant') {
            sourcesInfo = `
                <div class="sources-info">
                    <details>
                        <summary>Źródła (${sources.length})</summary>
                        <ul>
                            ${sources.map(source => `<li>${source}</li>`).join('')}
                        </ul>
                    </details>
                </div>
            `;
        }

        messageDiv.innerHTML = `
            ${avatarHtml}
            <div class="message-content">
                ${specialistInfo}
                <div class="message-text">${message}</div>
                ${confidenceBar}
                ${sourcesInfo}
                <div class="message-time">${new Date().toLocaleTimeString('pl-PL')}</div>
            </div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Animacja wejścia
        setTimeout(() => {
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        }, 50);
    },

    showAdvancedTypingIndicator() {
        const messagesContainer = document.getElementById('chat-messages-advanced') || 
                                 document.querySelector('.messages-content');
        
        if (!messagesContainer) return;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        
        typingDiv.innerHTML = `
            <div class="avatar">🤖</div>
            <div class="message-content">
                <div class="typing-animation">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <div class="typing-text">Asystent pisze...</div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    },

    hideAdvancedTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    },

    // ✅ POMOCNICZE METODY

    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    },

    animateModuleTransition(moduleName) {
        console.log(`Animacja przejścia do modułu: ${moduleName}`);
        // Placeholder dla animacji przejścia między modułami
    },

    // ✅ MODUŁY SETUP (PLACEHOLDER IMPLEMENTATIONS)

    async setupAnalyticsModule() {
        console.log('📊 Ładowanie modułu analityki...');
        await new Promise(resolve => setTimeout(resolve, 500));
    },

    async setupDocumentationModule() {
        console.log('📄 Ładowanie modułu dokumentacji...');
        await new Promise(resolve => setTimeout(resolve, 300));
    },

    async setupRiskModule() {
        console.log('⚠️ Ładowanie modułu analizy ryzyka...');
        await new Promise(resolve => setTimeout(resolve, 400));
    },

    async setupPersonalizationModule() {
        console.log('👤 Ładowanie modułu personalizacji...');
        await new Promise(resolve => setTimeout(resolve, 200));
    },

    async setupTrainingModule() {
        console.log('🎓 Ładowanie modułu szkoleń...');
        await new Promise(resolve => setTimeout(resolve, 350));
    },

    async setupSimulatorModule() {
        console.log('🎮 Ładowanie modułu symulatora...');
        await new Promise(resolve => setTimeout(resolve, 600));
    },

    async setupROIModule() {
        console.log('💰 Ładowanie modułu ROI...');
        await new Promise(resolve => setTimeout(resolve, 250));
    }
};

// ✅ AUTOMATYCZNA INICJALIZACJA
document.addEventListener('DOMContentLoaded', function() {
    console.log('🌟 DOM załadowany - inicjalizacja ERP Assistant');
    ERPAssistant.init();
});

// ✅ GLOBALNE UDOSTĘPNIENIE
window.ERPAssistant = ERPAssistant;
