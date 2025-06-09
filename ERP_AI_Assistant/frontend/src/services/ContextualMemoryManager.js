/**
 * 🧠 CONTEXTUAL MEMORY MANAGER - Advanced Multi-turn Context System
 * Remembers entire conversation sessions with sophisticated context management
 * 
 * @version 2.0.0
 * @author ERP AI Assistant Team
 * @date 2025-06-08
 */

export class ContextualMemoryManager {
    constructor({ eventBus, stateManager, configManager }) {
        this.eventBus = eventBus;
        this.stateManager = stateManager;
        this.configManager = configManager;
        
        // Memory layers
        this.conversationMemory = new ConversationMemory();
        this.sessionMemory = new SessionMemory();
        this.longTermMemory = new LongTermMemory();
        this.workingMemory = new WorkingMemory();
        
        // Context analysis
        this.contextAnalyzer = new ContextAnalyzer();
        this.intentTracker = new IntentTracker();
        this.topicTracker = new TopicTracker();
        
        // Memory configuration
        this.config = {
            maxConversationLength: 50,
            contextWindowSize: 10,
            memoryDecayRate: 0.95,
            relevanceThreshold: 0.7,
            autoSummaryThreshold: 20
        };
        
        // Context state
        this.currentContext = {
            sessionId: null,
            conversationId: null,
            activeTopic: null,
            userIntent: null,
            contextEntities: new Map(),
            relationshipGraph: new Map()
        };
        
        this.initialized = false;
    }

    /**
     * Initialize the context memory system
     */
    async initialize() {
        console.log('🧠 ContextualMemoryManager: Initializing...');
        
        // Load configuration
        await this.loadConfiguration();
        
        // Initialize memory layers
        await this.conversationMemory.initialize();
        await this.sessionMemory.initialize();
        await this.longTermMemory.initialize();
        await this.workingMemory.initialize();
        
        // Setup event listeners
        this.setupEventListeners();
        
        // Start session
        await this.startNewSession();
        
        this.initialized = true;
        console.log('✅ ContextualMemoryManager: Initialized successfully');
    }

    /**
     * Setup comprehensive event tracking
     */
    setupEventListeners() {
        // Message events
        this.eventBus.on('message:send', this.processUserMessage.bind(this));
        this.eventBus.on('message:completed', this.processAIResponse.bind(this));
        this.eventBus.on('message:rated', this.updateMessageFeedback.bind(this));
        
        // Context events
        this.eventBus.on('context:topic-change', this.handleTopicChange.bind(this));
        this.eventBus.on('context:entity-mentioned', this.trackEntity.bind(this));
        this.eventBus.on('context:reference-made', this.resolveReference.bind(this));
        
        // Session events
        this.eventBus.on('session:start', this.startNewSession.bind(this));
        this.eventBus.on('session:end', this.endSession.bind(this));
        this.eventBus.on('system:idle', this.handleSystemIdle.bind(this));
    }

    /**
     * Process incoming user message and update context
     */
    async processUserMessage(data) {
        const { message, messageId, timestamp } = data;
        
        // Create message context
        const messageContext = await this.createMessageContext(message, 'user', messageId, timestamp);
        
        // Add to working memory
        this.workingMemory.addMessage(messageContext);
        
        // Update conversation memory
        this.conversationMemory.addMessage(messageContext);
        
        // Analyze context changes
        await this.analyzeContextChanges(messageContext);
        
        // Update current context state
        await this.updateCurrentContext(messageContext);
        
        // Emit context update
        this.eventBus.emit('context:updated', this.getCurrentContext());
        
        return messageContext;
    }

    /**
     * Process AI response and maintain context continuity
     */
    async processAIResponse(data) {
        const { response, messageId, processingTime } = data;
        
        // Create response context
        const responseContext = await this.createMessageContext(
            response.answer || response.response, 
            'ai', 
            messageId, 
            Date.now(),
            { processingTime, confidence: response.confidence, sources: response.sources }
        );
        
        // Add to memories
        this.workingMemory.addMessage(responseContext);
        this.conversationMemory.addMessage(responseContext);
        
        // Update relationship graph
        this.updateRelationshipGraph(responseContext);
        
        // Check for auto-summary trigger
        if (this.conversationMemory.getLength() >= this.config.autoSummaryThreshold) {
            await this.generateConversationSummary();
        }
        
        return responseContext;
    }

    /**
     * Create comprehensive message context
     */
    async createMessageContext(content, sender, messageId, timestamp, metadata = {}) {
        const context = {
            id: messageId,
            content,
            sender,
            timestamp,
            sessionId: this.currentContext.sessionId,
            conversationId: this.currentContext.conversationId,
            
            // Content analysis
            entities: await this.contextAnalyzer.extractEntities(content),
            intent: await this.contextAnalyzer.classifyIntent(content),
            topic: await this.contextAnalyzer.identifyTopic(content),
            keywords: await this.contextAnalyzer.extractKeywords(content),
            
            // Context relationships
            references: await this.findReferences(content),
            dependencies: await this.findDependencies(content),
            
            // Metadata
            ...metadata,
            
            // Memory weights
            importance: this.calculateImportance(content, sender),
            relevance: 1.0, // Initial relevance
            decay: 1.0 // Initial decay factor
        };
        
        return context;
    }

    /**
     * Analyze context changes and track transitions
     */
    async analyzeContextChanges(messageContext) {
        const changes = {
            topicShift: false,
            intentChange: false,
            newEntities: [],
            entityUpdates: []
        };
        
        // Check topic changes
        if (this.currentContext.activeTopic !== messageContext.topic) {
            changes.topicShift = true;
            this.eventBus.emit('context:topic-change', {
                from: this.currentContext.activeTopic,
                to: messageContext.topic,
                messageId: messageContext.id
            });
        }
        
        // Check intent changes
        if (this.currentContext.userIntent !== messageContext.intent) {
            changes.intentChange = true;
            this.intentTracker.recordTransition(
                this.currentContext.userIntent,
                messageContext.intent
            );
        }
        
        // Track entity changes
        for (const entity of messageContext.entities) {
            if (!this.currentContext.contextEntities.has(entity.name)) {
                changes.newEntities.push(entity);
                this.currentContext.contextEntities.set(entity.name, entity);
            } else {
                const existing = this.currentContext.contextEntities.get(entity.name);
                if (this.hasEntityChanged(existing, entity)) {
                    changes.entityUpdates.push({ old: existing, new: entity });
                    this.currentContext.contextEntities.set(entity.name, entity);
                }
            }
        }
        
        return changes;
    }

    /**
     * Update current context state
     */
    async updateCurrentContext(messageContext) {
        // Update active topic
        this.currentContext.activeTopic = messageContext.topic;
        
        // Update user intent (if from user)
        if (messageContext.sender === 'user') {
            this.currentContext.userIntent = messageContext.intent;
        }
        
        // Update topic tracker
        this.topicTracker.updateTopic(messageContext.topic, messageContext.timestamp);
        
        // Maintain context window
        this.maintainContextWindow();
    }

    /**
     * Smart reference resolution - "Wróć do tego raportu z wczoraj"
     */
    async resolveReference(referenceText, currentContext) {
        const resolvedReferences = [];
        
        // Time-based references
        const timeReferences = this.findTimeReferences(referenceText);
        for (const timeRef of timeReferences) {
            const messages = await this.findMessagesByTimeframe(timeRef);
            resolvedReferences.push(...messages);
        }
        
        // Entity-based references
        const entityReferences = this.findEntityReferences(referenceText);
        for (const entityRef of entityReferences) {
            const messages = await this.findMessagesByEntity(entityRef);
            resolvedReferences.push(...messages);
        }
        
        // Topic-based references
        const topicReferences = this.findTopicReferences(referenceText);
        for (const topicRef of topicReferences) {
            const messages = await this.findMessagesByTopic(topicRef);
            resolvedReferences.push(...messages);
        }
        
        // Similarity-based references
        const semanticMatches = await this.findSemanticMatches(referenceText);
        resolvedReferences.push(...semanticMatches);
        
        // Rank and return best matches
        return this.rankReferences(resolvedReferences, currentContext);
    }

    /**
     * Find time-based references like "wczoraj", "przed chwilą", "w zeszłym tygodniu"
     */
    findTimeReferences(text) {
        const timePatterns = {
            'wczoraj|yesterday': { days: -1 },
            'dziś|today': { days: 0 },
            'przed chwilą|moment ago': { minutes: -5 },
            'w zeszłym tygodniu|last week': { days: -7 },
            'miesiąc temu|month ago': { days: -30 },
            'rano|morning': { timeOfDay: 'morning' },
            'po południu|afternoon': { timeOfDay: 'afternoon' },
            'wieczorem|evening': { timeOfDay: 'evening' }
        };
        
        const references = [];
        for (const [pattern, timeSpec] of Object.entries(timePatterns)) {
            const regex = new RegExp(pattern, 'i');
            if (regex.test(text)) {
                references.push(this.calculateTimeframe(timeSpec));
            }
        }
        
        return references;
    }

    /**
     * Generate conversation summary for long-term memory
     */
    async generateConversationSummary() {
        const recentMessages = this.conversationMemory.getRecentMessages(this.config.autoSummaryThreshold);
        
        const summary = {
            id: `summary_${Date.now()}`,
            type: 'conversation_summary',
            timeframe: {
                start: recentMessages[0].timestamp,
                end: recentMessages[recentMessages.length - 1].timestamp
            },
            
            // Content summary
            mainTopics: this.extractMainTopics(recentMessages),
            keyEntities: this.extractKeyEntities(recentMessages),
            userIntents: this.extractUserIntents(recentMessages),
            outcomes: this.extractOutcomes(recentMessages),
            
            // Metadata
            messageCount: recentMessages.length,
            confidence: this.calculateSummaryConfidence(recentMessages),
            importance: this.calculateSummaryImportance(recentMessages)
        };
        
        // Store in long-term memory
        await this.longTermMemory.storeSummary(summary);
        
        // Archive processed messages
        this.conversationMemory.archiveMessages(recentMessages.map(m => m.id));
        
        this.eventBus.emit('context:summary-generated', summary);
        
        return summary;
    }

    /**
     * Proactive context suggestions - "Możesz teraz..."
     */
    generateContextualSuggestions() {
        const suggestions = [];
        
        // Based on current topic
        const topicSuggestions = this.getTopicBasedSuggestions();
        suggestions.push(...topicSuggestions);
        
        // Based on conversation flow
        const flowSuggestions = this.getFlowBasedSuggestions();
        suggestions.push(...flowSuggestions);
        
        // Based on user patterns
        const patternSuggestions = this.getPatternBasedSuggestions();
        suggestions.push(...patternSuggestions);
        
        // Based on time context
        const timeSuggestions = this.getTimeBasedSuggestions();
        suggestions.push(...timeSuggestions);
        
        return this.rankSuggestions(suggestions);
    }

    /**
     * Cross-session memory retrieval
     */
    async retrieveCrossSessionContext(query) {
        const contexts = [];
        
        // Search session memory
        const sessionResults = await this.sessionMemory.search(query);
        contexts.push(...sessionResults);
        
        // Search long-term memory
        const longTermResults = await this.longTermMemory.search(query);
        contexts.push(...longTermResults);
        
        // Rank by relevance and recency
        return this.rankContexts(contexts, query);
    }

    /**
     * Memory consolidation and optimization
     */
    async consolidateMemory() {
        console.log('🧠 Consolidating memory...');
        
        // Decay old memories
        this.applyMemoryDecay();
        
        // Merge similar contexts
        await this.mergeSimilarContexts();
        
        // Archive low-importance memories
        await this.archiveLowImportanceMemories();
        
        // Optimize relationship graph
        this.optimizeRelationshipGraph();
        
        // Generate insights
        const insights = await this.generateMemoryInsights();
        
        this.eventBus.emit('memory:consolidated', insights);
        
        return insights;
    }

    /**
     * Export context for analysis or backup
     */
    exportContext() {
        return {
            sessionId: this.currentContext.sessionId,
            timestamp: Date.now(),
            
            // Memory layers
            conversation: this.conversationMemory.export(),
            session: this.sessionMemory.export(),
            longTerm: this.longTermMemory.export(),
            working: this.workingMemory.export(),
            
            // Context state
            currentContext: this.currentContext,
            
            // Analysis data
            topicEvolution: this.topicTracker.getEvolution(),
            intentPatterns: this.intentTracker.getPatterns(),
            entityGraph: Object.fromEntries(this.currentContext.relationshipGraph)
        };
    }

    /**
     * Get current context for UI display
     */
    getCurrentContext() {
        return {
            sessionId: this.currentContext.sessionId,
            activeTopic: this.currentContext.activeTopic,
            userIntent: this.currentContext.userIntent,
            entities: Array.from(this.currentContext.contextEntities.values()),
            recentMessages: this.workingMemory.getRecentMessages(5),
            suggestions: this.generateContextualSuggestions(),
            memoryStats: this.getMemoryStats()
        };
    }

    /**
     * Helper methods
     */
    calculateImportance(content, sender) {
        let importance = 0.5; // Base importance
        
        // User messages are generally more important
        if (sender === 'user') importance += 0.2;
        
        // Length factor
        const wordCount = content.split(' ').length;
        if (wordCount > 20) importance += 0.1;
        if (wordCount > 50) importance += 0.1;
        
        // Question factor
        if (content.includes('?')) importance += 0.1;
        
        // ERP keywords
        const erpKeywords = ['konfiguracja', 'moduł', 'system', 'ERP', 'baza', 'raport'];
        const keywordCount = erpKeywords.filter(keyword => 
            content.toLowerCase().includes(keyword.toLowerCase())
        ).length;
        importance += keywordCount * 0.05;
        
        return Math.min(importance, 1.0);
    }

    applyMemoryDecay() {
        const now = Date.now();
        const decayRate = this.config.memoryDecayRate;
        
        // Decay conversation memory
        this.conversationMemory.applyDecay(now, decayRate);
        
        // Decay working memory
        this.workingMemory.applyDecay(now, decayRate);
        
        // Clean up low-relevance memories
        this.conversationMemory.cleanupLowRelevance(this.config.relevanceThreshold);
    }

    getMemoryStats() {
        return {
            conversation: {
                messageCount: this.conversationMemory.getLength(),
                averageImportance: this.conversationMemory.getAverageImportance(),
                topTopics: this.conversationMemory.getTopTopics(5)
            },
            session: {
                duration: Date.now() - this.sessionMemory.startTime,
                messageCount: this.sessionMemory.getMessageCount(),
                topicCount: this.sessionMemory.getUniqueTopicCount()
            },
            working: {
                activeMessages: this.workingMemory.getLength(),
                contextWindow: this.config.contextWindowSize
            }
        };
    }

    async startNewSession() {
        const sessionId = this.generateSessionId();
        
        this.currentContext.sessionId = sessionId;
        this.currentContext.conversationId = this.generateConversationId();
        
        // Initialize session memory
        await this.sessionMemory.startSession(sessionId);
        
        console.log(`🧠 New session started: ${sessionId}`);
        
        this.eventBus.emit('context:session-started', {
            sessionId,
            timestamp: Date.now()
        });
    }

    generateSessionId() {
        return 'ctx_session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    generateConversationId() {
        return 'ctx_conv_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
}

/**
 * Conversation Memory - Short-term conversation tracking
 */
class ConversationMemory {
    constructor() {
        this.messages = [];
        this.maxLength = 50;
        this.archived = [];
    }

    async initialize() {
        console.log('💾 ConversationMemory: Initialized');
    }

    addMessage(messageContext) {
        this.messages.push(messageContext);
        
        // Maintain max length
        if (this.messages.length > this.maxLength) {
            const removed = this.messages.shift();
            this.archived.push(removed);
        }
    }

    getRecentMessages(count = 10) {
        return this.messages.slice(-count);
    }

    getLength() {
        return this.messages.length;
    }

    applyDecay(currentTime, decayRate) {
        this.messages.forEach(message => {
            const age = currentTime - message.timestamp;
            const hoursSinceCreated = age / (1000 * 60 * 60);
            message.decay = Math.pow(decayRate, hoursSinceCreated);
            message.relevance = message.importance * message.decay;
        });
    }

    cleanupLowRelevance(threshold) {
        const initialLength = this.messages.length;
        this.messages = this.messages.filter(message => 
            message.relevance >= threshold
        );
        
        const removed = initialLength - this.messages.length;
        if (removed > 0) {
            console.log(`🧹 Cleaned up ${removed} low-relevance messages`);
        }
    }

    archiveMessages(messageIds) {
        const toArchive = this.messages.filter(m => messageIds.includes(m.id));
        this.archived.push(...toArchive);
        this.messages = this.messages.filter(m => !messageIds.includes(m.id));
    }

    export() {
        return {
            messages: this.messages,
            archived: this.archived,
            stats: {
                activeCount: this.messages.length,
                archivedCount: this.archived.length
            }
        };
    }
}

/**
 * Session Memory - Cross-conversation session tracking
 */
class SessionMemory {
    constructor() {
        this.sessions = new Map();
        this.currentSession = null;
        this.startTime = null;
    }

    async initialize() {
        console.log('🗃️ SessionMemory: Initialized');
    }

    async startSession(sessionId) {
        this.currentSession = sessionId;
        this.startTime = Date.now();
        
        this.sessions.set(sessionId, {
            id: sessionId,
            startTime: this.startTime,
            messages: [],
            topics: new Set(),
            entities: new Map(),
            summaries: []
        });
    }

    async search(query) {
        const results = [];
        
        for (const [sessionId, session] of this.sessions) {
            // Search messages
            const matchingMessages = session.messages.filter(message =>
                message.content.toLowerCase().includes(query.toLowerCase())
            );
            
            if (matchingMessages.length > 0) {
                results.push({
                    type: 'session',
                    sessionId,
                    messages: matchingMessages,
                    relevance: this.calculateSessionRelevance(matchingMessages, query)
                });
            }
        }
        
        return results;
    }

    getMessageCount() {
        return this.currentSession ? 
            this.sessions.get(this.currentSession)?.messages.length || 0 : 0;
    }

    export() {
        return {
            sessions: Object.fromEntries(this.sessions),
            currentSession: this.currentSession,
            startTime: this.startTime
        };
    }
}

/**
 * Long-term Memory - Persistent cross-session storage
 */
class LongTermMemory {
    constructor() {
        this.summaries = [];
        this.patterns = new Map();
        this.knowledge = new Map();
    }

    async initialize() {
        // Load from localStorage or IndexedDB
        await this.loadFromStorage();
        console.log('🏛️ LongTermMemory: Initialized');
    }

    async storeSummary(summary) {
        this.summaries.push(summary);
        await this.saveToStorage();
    }

    async search(query) {
        const results = [];
        
        // Search summaries
        for (const summary of this.summaries) {
            if (this.matchesSummary(summary, query)) {
                results.push({
                    type: 'summary',
                    summary,
                    relevance: this.calculateSummaryRelevance(summary, query)
                });
            }
        }
        
        return results;
    }

    async loadFromStorage() {
        try {
            const stored = localStorage.getItem('erp_longterm_memory');
            if (stored) {
                const data = JSON.parse(stored);
                this.summaries = data.summaries || [];
                this.patterns = new Map(data.patterns || []);
                this.knowledge = new Map(data.knowledge || []);
            }
        } catch (error) {
            console.warn('Failed to load long-term memory:', error);
        }
    }

    async saveToStorage() {
        try {
            const data = {
                summaries: this.summaries,
                patterns: Array.from(this.patterns.entries()),
                knowledge: Array.from(this.knowledge.entries())
            };
            localStorage.setItem('erp_longterm_memory', JSON.stringify(data));
        } catch (error) {
            console.warn('Failed to save long-term memory:', error);
        }
    }

    export() {
        return {
            summaries: this.summaries,
            patterns: Object.fromEntries(this.patterns),
            knowledge: Object.fromEntries(this.knowledge)
        };
    }
}

/**
 * Working Memory - Active context window
 */
class WorkingMemory {
    constructor() {
        this.activeMessages = [];
        this.maxSize = 10;
    }

    async initialize() {
        console.log('⚡ WorkingMemory: Initialized');
    }

    addMessage(messageContext) {
        this.activeMessages.push(messageContext);
        
        // Maintain working memory size
        if (this.activeMessages.length > this.maxSize) {
            this.activeMessages.shift();
        }
    }

    getRecentMessages(count = 5) {
        return this.activeMessages.slice(-count);
    }

    getLength() {
        return this.activeMessages.length;
    }

    applyDecay(currentTime, decayRate) {
        this.activeMessages.forEach(message => {
            const age = currentTime - message.timestamp;
            const minutesSinceCreated = age / (1000 * 60);
            message.decay = Math.pow(decayRate, minutesSinceCreated / 60);
            message.relevance = message.importance * message.decay;
        });
    }

    export() {
        return {
            activeMessages: this.activeMessages,
            stats: {
                count: this.activeMessages.length,
                maxSize: this.maxSize
            }
        };
    }
}

/**
 * Context Analyzer - Advanced content analysis
 */
class ContextAnalyzer {
    constructor() {
        this.erpEntities = new Map([
            ['moduł', { type: 'system_component', category: 'erp' }],
            ['konfiguracja', { type: 'action', category: 'setup' }],
            ['raport', { type: 'document', category: 'output' }],
            ['baza', { type: 'data_store', category: 'database' }],
            ['użytkownik', { type: 'actor', category: 'person' }],
            ['system', { type: 'system', category: 'technology' }]
        ]);
        
        this.intentClassifiers = new Map([
            ['query', ['jak', 'gdzie', 'co', 'kiedy', 'dlaczego']],
            ['request', ['pokaż', 'generuj', 'stwórz', 'wykonaj']],
            ['problem', ['błąd', 'problem', 'nie działa', 'pomoc']],
            ['config', ['ustaw', 'skonfiguruj', 'zmień', 'dostosuj']]
        ]);
    }

    async extractEntities(content) {
        const entities = [];
        const words = content.toLowerCase().split(/\s+/);
        
        for (const word of words) {
            if (this.erpEntities.has(word)) {
                entities.push({
                    name: word,
                    ...this.erpEntities.get(word),
                    position: content.toLowerCase().indexOf(word)
                });
            }
        }
        
        return entities;
    }

    async classifyIntent(content) {
        const scores = new Map();
        
        for (const [intent, keywords] of this.intentClassifiers) {
            let score = 0;
            for (const keyword of keywords) {
                if (content.toLowerCase().includes(keyword)) {
                    score += 1;
                }
            }
            scores.set(intent, score);
        }
        
        const bestIntent = Array.from(scores.entries())
            .sort((a, b) => b[1] - a[1])
            .find(([intent, score]) => score > 0);
        
        return bestIntent ? bestIntent[0] : 'unknown';
    }

    async identifyTopic(content) {
        const topics = {
            'sql': ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'CREATE', 'ALTER'],
            'finanse': ['faktura', 'płatność', 'koszt', 'przychód', 'księgowość'],
            'hr': ['pracownik', 'wynagrodzenie', 'urlop', 'zatrudnienie'],
            'magazyn': ['towar', 'stan', 'dostawa', 'inwentaryzacja'],
            'system': ['konfiguracja', 'instalacja', 'aktualizacja', 'backup']
        };
        
        for (const [topic, keywords] of Object.entries(topics)) {
            for (const keyword of keywords) {
                if (content.toLowerCase().includes(keyword.toLowerCase())) {
                    return topic;
                }
            }
        }
        
        return 'general';
    }

    async extractKeywords(content) {
        // Simple keyword extraction
        const words = content.toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3);
        
        // Remove common Polish stop words
        const stopWords = ['jest', 'być', 'mieć', 'móc', 'chcieć', 'wiedzieć'];
        return words.filter(word => !stopWords.includes(word));
    }
}

/**
 * Intent Tracker - Track intent transitions
 */
class IntentTracker {
    constructor() {
        this.transitions = [];
        this.patterns = new Map();
    }

    recordTransition(fromIntent, toIntent) {
        const transition = {
            from: fromIntent,
            to: toIntent,
            timestamp: Date.now()
        };
        
        this.transitions.push(transition);
        
        // Update patterns
        const key = `${fromIntent}->${toIntent}`;
        if (!this.patterns.has(key)) {
            this.patterns.set(key, 0);
        }
        this.patterns.set(key, this.patterns.get(key) + 1);
    }

    getPatterns() {
        return Object.fromEntries(this.patterns);
    }
}

/**
 * Topic Tracker - Track topic evolution
 */
class TopicTracker {
    constructor() {
        this.topicHistory = [];
        this.topicDurations = new Map();
        this.currentTopic = null;
        this.topicStartTime = null;
    }

    updateTopic(topic, timestamp) {
        if (this.currentTopic !== topic) {
            // Record duration of previous topic
            if (this.currentTopic && this.topicStartTime) {
                const duration = timestamp - this.topicStartTime;
                if (!this.topicDurations.has(this.currentTopic)) {
                    this.topicDurations.set(this.currentTopic, []);
                }
                this.topicDurations.get(this.currentTopic).push(duration);
            }
            
            // Start new topic
            this.currentTopic = topic;
            this.topicStartTime = timestamp;
            
            // Add to history
            this.topicHistory.push({
                topic,
                timestamp,
                transition: this.topicHistory.length > 0 ? 
                    `${this.topicHistory[this.topicHistory.length - 1].topic} -> ${topic}` : 
                    `start -> ${topic}`
            });
        }
    }

    getEvolution() {
        return {
            history: this.topicHistory,
            durations: Object.fromEntries(this.topicDurations),
            currentTopic: this.currentTopic,
            topicCount: this.topicHistory.length
        };
    }

    getAverageDuration(topic) {
        const durations = this.topicDurations.get(topic);
        if (!durations || durations.length === 0) return 0;
        
        const total = durations.reduce((sum, duration) => sum + duration, 0);
        return total / durations.length;
    }
}

export default ContextualMemoryManager;
