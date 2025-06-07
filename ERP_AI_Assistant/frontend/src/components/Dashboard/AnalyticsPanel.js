/**
 * ============================================
 * DIGITAL TWIN - ADVANCED SIMULATION ENGINE
 * ============================================
 * Professional ERP Implementation Simulator
 * Features: Monte Carlo, Neural Networks, Real-time Analytics
 */

class DigitalTwinEngine {
    constructor() {
        this.isRunning = false;
        this.simulationSpeed = 100;
        this.currentScenario = 'realistic';
        this.charts = {};
        this.metrics = {};
        this.threeScene = null;
        this.animationId = null;
        this.eventLog = [];
        this.realTimeData = new Map();
        this.neuralNetwork = new SimpleNeuralNetwork();
        this.monteCarloEngine = new MonteCarloSimulation();
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeCharts();
        this.init3DVisualization();
        this.initializeProcessFlow();
        this.startRealTimeUpdates();
        this.loadInitialData();
        this.log('INFO', 'SYSTEM', 'Digital Twin Engine zainicjalizowany');
    }

    setupEventListeners() {
        // Master Controls
        document.getElementById('master-start')?.addEventListener('click', () => this.startSimulation());
        document.getElementById('master-pause')?.addEventListener('click', () => this.pauseSimulation());
        document.getElementById('master-reset')?.addEventListener('click', () => this.resetSimulation());
        document.getElementById('master-export')?.addEventListener('click', () => this.exportData());

        // Tab Controls
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        // Analytics Tabs
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.switchAnalyticsTab(e.target.dataset.tab));
        });

        // Scenario Templates
        document.querySelectorAll('.load-template').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenario = e.target.closest('.template-card').dataset.scenario;
                this.loadScenario(scenario);
            });
        });

        // Speed Control
        const speedSlider = document.getElementById('simulation-speed');
        if (speedSlider) {
            speedSlider.addEventListener('input', (e) => {
                this.simulationSpeed = parseInt(e.target.value);
                document.getElementById('speed-display').textContent = `${this.simulationSpeed}x`;
            });
        }

        // View Controls
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchView(e.target.dataset.view));
        });

        // Flow Controls
        document.getElementById('animate-flow')?.addEventListener('click', () => this.animateProcessFlow());
        document.getElementById('highlight-bottlenecks')?.addEventListener('click', () => this.highlightBottlenecks());

        // Log Controls
        document.getElementById('clear-log')?.addEventListener('click', () => this.clearLog());
        document.getElementById('export-log')?.addEventListener('click', () => this.exportLog());
        document.getElementById('filter-log')?.addEventListener('click', () => this.toggleLogFilters());

        // AI Action Buttons
        document.querySelectorAll('.action-btn.primary').forEach(btn => {
            btn.addEventListener('click', (e) => this.executeAIRecommendation(e.target));
        });
    }

    // ============================================
    // SIMULATION CONTROL METHODS
    // ============================================

    startSimulation() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.updateControlStates();
        this.log('SUCCESS', 'SIMULATION', 'Symulacja uruchomiona');
        
        // Start main simulation loop
        this.simulationLoop();
        
        // Start AI predictions
        this.startAIPredictions();
        
        // Add visual feedback
        document.querySelector('.simulation-master-control').classList.add('simulation-active');
    }

    pauseSimulation() {
        this.isRunning = false;
        this.updateControlStates();
        this.log('WARNING', 'SIMULATION', 'Symulacja wstrzymana');
        
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    resetSimulation() {
        this.isRunning = false;
        this.updateControlStates();
        this.resetAllMetrics();
        this.log('INFO', 'SIMULATION', 'Symulacja zresetowana');
        
        // Reset visual states
        document.querySelector('.simulation-master-control')?.classList.remove('simulation-active');
        this.updateAllCharts();
    }

    updateControlStates() {
        const startBtn = document.getElementById('master-start');
        const pauseBtn = document.getElementById('master-pause');
        
        if (startBtn && pauseBtn) {
            startBtn.disabled = this.isRunning;
            pauseBtn.disabled = !this.isRunning;
        }
    }

    // ============================================
    // NEURAL NETWORK PREDICTIONS
    // ============================================

    startAIPredictions() {
        // Predict project completion probability
        const projectData = this.gatherProjectData();
        const successProbability = this.neuralNetwork.predict(projectData);
        
        // Update prediction display
        this.updatePredictionCard('ml-forecast', {
            probability: successProbability,
            timeline: this.calculateTimeline(projectData),
            budget: this.calculateBudget(projectData)
        });

        // Run trend analysis
        this.performTrendAnalysis();
    }

    gatherProjectData() {
        return {
            teamSize: this.getParameterValue('organization-size'),
            complexity: this.getParameterValue('integration-complexity'),
            methodology: this.getParameterValue('implementation-model'),
            currentProgress: this.metrics.completionRate || 0,
            riskFactors: this.calculateRiskFactors(),
            resourceUtilization: this.metrics.teamEfficiency || 0
        };
    }

    calculateTimeline(data) {
        const baseTimeline = {
            'small': 4,
            'medium': 6,
            'large': 8,
            'enterprise': 12
        };
        
        const complexityMultiplier = {
            'low': 0.8,
            'medium': 1.0,
            'high': 1.3,
            'extreme': 1.6
        };
        
        const methodologyMultiplier = {
            'agile': 0.9,
            'waterfall': 1.2,
            'hybrid': 1.0,
            'phased': 1.1
        };

        const base = baseTimeline[data.teamSize] || 6;
        const complexity = complexityMultiplier[data.complexity] || 1.0;
        const methodology = methodologyMultiplier[data.methodology] || 1.0;
        
        return Math.round((base * complexity * methodology) * 10) / 10;
    }

    calculateBudget(data) {
        const baseBudget = {
            'small': 300,
            'medium': 500,
            'large': 800,
            'enterprise': 1200
        };
        
        const base = baseBudget[data.teamSize] || 500;
        const riskMultiplier = 1 + (data.riskFactors * 0.1);
        
        return Math.round(base * riskMultiplier);
    }

    performTrendAnalysis() {
        const trends = {
            finance: this.generateTrendData('finance'),
            hr: this.generateTrendData('hr'),
            logistics: this.generateTrendData('logistics'),
            crm: this.generateTrendData('crm')
        };

        this.updateTrendDisplay(trends);
    }

    // ============================================
    // MONTE CARLO SIMULATION
    // ============================================

    runMonteCarloAnalysis() {
        const iterations = 10000;
        const results = this.monteCarloEngine.simulate(iterations, {
            taskDurations: this.getTaskDurations(),
            resourceAvailability: this.getResourceAvailability(),
            riskEvents: this.getRiskEvents()
        });

        this.updateRiskAnalysisChart(results);
        return results;
    }

    getTaskDurations() {
        return {
            analysis: { min: 15, max: 30, most_likely: 20 },
            design: { min: 20, max: 40, most_likely: 30 },
            development: { min: 60, max: 120, most_likely: 90 },
            testing: { min: 15, max: 45, most_likely: 25 },
            deployment: { min: 5, max: 15, most_likely: 10 }
        };
    }

    getResourceAvailability() {
        return {
            developers: { available: 5, required: 6 },
            analysts: { available: 3, required: 2 },
            testers: { available: 2, required: 3 },
            managers: { available: 1, required: 1 }
        };
    }

    getRiskEvents() {
        return [
            { name: 'Scope Creep', probability: 0.3, impact: 1.2 },
            { name: 'Key Resource Unavailable', probability: 0.15, impact: 1.4 },
            { name: 'Technical Issues', probability: 0.25, impact: 1.1 },
            { name: 'Integration Problems', probability: 0.2, impact: 1.3 },
            { name: 'Vendor Delays', probability: 0.1, impact: 1.5 }
        ];
    }

    // ============================================
    // 3D VISUALIZATION WITH THREE.JS
    // ============================================

    init3DVisualization() {
        const container = document.getElementById('three-js-container');
        if (!container) return;

        // Scene setup
        this.threeScene = new THREE.Scene();
        this.threeCamera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
        this.threeRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        
        this.threeRenderer.setSize(container.clientWidth, container.clientHeight);
        this.threeRenderer.setClearColor(0x0f172a, 1);
        container.appendChild(this.threeRenderer.domElement);

        // Add lights
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.threeScene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 50);
        this.threeScene.add(directionalLight);

        // Create 3D ERP system representation
        this.create3DERPSystem();
        
        // Position camera
        this.threeCamera.position.set(0, 10, 15);
        this.threeCamera.lookAt(0, 0, 0);

        // Add controls
        this.controls = new THREE.OrbitControls(this.threeCamera, this.threeRenderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;

        // Start render loop
        this.animate3D();
    }

    create3DERPSystem() {
        // Create main server representation
        const serverGeometry = new THREE.BoxGeometry(2, 3, 1);
        const serverMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x3b82f6,
            transparent: true,
            opacity: 0.8 
        });
        const server = new THREE.Mesh(serverGeometry, serverMaterial);
        this.threeScene.add(server);

        // Create module representations
        const modules = [
            { name: 'Finance', position: [-4, 0, 0], color: 0x10b981 },
            { name: 'HR', position: [4, 0, 0], color: 0xf59e0b },
            { name: 'Logistics', position: [0, 0, -4], color: 0xef4444 },
            { name: 'CRM', position: [0, 0, 4], color: 0x8b5cf6 }
        ];

        this.moduleObjects = {};
        modules.forEach(module => {
            const geometry = new THREE.BoxGeometry(1.5, 2, 1.5);
            const material = new THREE.MeshPhongMaterial({ 
                color: module.color,
                transparent: true,
                opacity: 0.7 
            });
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(...module.position);
            this.threeScene.add(mesh);
            this.moduleObjects[module.name.toLowerCase()] = mesh;

            // Add data flow connections
            this.createDataFlow(server.position, mesh.position, module.color);
        });

        // Add floating particles for active data
        this.createDataParticles();
    }

    createDataFlow(start, end, color) {
        const points = [];
        points.push(new THREE.Vector3(start.x, start.y, start.z));
        points.push(new THREE.Vector3(end.x, end.y, end.z));
        
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        const material = new THREE.LineBasicMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.6 
        });
        const line = new THREE.Line(geometry, material);
        this.threeScene.add(line);
    }

    createDataParticles() {
        const particleCount = 1000;
        const particles = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

            colors[i * 3] = Math.random();
            colors[i * 3 + 1] = Math.random();
            colors[i * 3 + 2] = 1;
        }

        particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const particleMaterial = new THREE.PointsMaterial({
            size: 0.1,
            vertexColors: true,
            transparent: true,
            opacity: 0.6
        });

        this.particleSystem = new THREE.Points(particles, particleMaterial);
        this.threeScene.add(this.particleSystem);
    }

    animate3D() {
        this.animationId = requestAnimationFrame(() => this.animate3D());

        // Rotate modules
        Object.values(this.moduleObjects).forEach(module => {
            module.rotation.y += 0.01;
        });

        // Animate particles
        if (this.particleSystem) {
            this.particleSystem.rotation.y += 0.005;
        }

        // Update controls
        if (this.controls) {
            this.controls.update();
        }

        this.threeRenderer.render(this.threeScene, this.threeCamera);
        this.update3DOverlay();
    }

    update3DOverlay() {
        // Update real-time 3D overlay data
        document.getElementById('active-nodes').textContent = Math.floor(Math.random() * 100) + 800;
        document.getElementById('data-flow').textContent = (Math.random() * 2 + 1).toFixed(1) + ' GB/s';
        document.getElementById('sync-status').textContent = (99.5 + Math.random() * 0.5).toFixed(1) + '%';
    }

    // ============================================
    // PROCESS FLOW VISUALIZATION WITH D3.JS
    // ============================================

    initializeProcessFlow() {
        const svg = d3.select('#process-flow-svg');
        if (!svg.node()) return;

        const width = 800;
        const height = 400;

        // Define process nodes
        const nodes = [
            { id: 'req', name: 'Requirements', x: 100, y: 200, status: 'completed' },
            { id: 'design', name: 'System Design', x: 250, y: 150, status: 'completed' },
            { id: 'config', name: 'Configuration', x: 400, y: 200, status: 'active' },
            { id: 'test', name: 'Testing', x: 550, y: 150, status: 'pending' },
            { id: 'deploy', name: 'Deployment', x: 700, y: 200, status: 'pending' }
        ];

        // Define connections
        const links = [
            { source: 'req', target: 'design' },
            { source: 'design', target: 'config' },
            { source: 'config', target: 'test' },
            { source: 'test', target: 'deploy' }
        ];

        this.processNodes = nodes;
        this.processLinks = links;
        this.renderProcessFlow(svg, width, height);
    }

    renderProcessFlow(svg, width, height) {
        svg.selectAll('*').remove();

        // Create links
        const linkElements = svg.selectAll('.link')
            .data(this.processLinks)
            .enter()
            .append('line')
            .attr('class', 'link')
            .attr('x1', d => this.processNodes.find(n => n.id === d.source).x)
            .attr('y1', d => this.processNodes.find(n => n.id === d.source).y)
            .attr('x2', d => this.processNodes.find(n => n.id === d.target).x)
            .attr('y2', d => this.processNodes.find(n => n.id === d.target).y)
            .attr('stroke', '#64748b')
            .attr('stroke-width', 2);

        // Create nodes
        const nodeElements = svg.selectAll('.node')
            .data(this.processNodes)
            .enter()
            .append('g')
            .attr('class', 'node')
            .attr('transform', d => `translate(${d.x}, ${d.y})`);

        // Node circles
        nodeElements.append('circle')
            .attr('r', 25)
            .attr('fill', d => {
                switch(d.status) {
                    case 'completed': return '#10b981';
                    case 'active': return '#3b82f6';
                    case 'pending': return '#64748b';
                    default: return '#64748b';
                }
            })
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 2);

        // Node labels
        nodeElements.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', 40)
            .attr('fill', '#e2e8f0')
            .attr('font-size', '12px')
            .attr('font-weight', '600')
            .text(d => d.name);

        // Node status indicators
        nodeElements.append('circle')
            .attr('r', 5)
            .attr('fill', '#ffffff')
            .attr('opacity', d => d.status === 'active' ? 1 : 0);
    }

    animateProcessFlow() {
        const svg = d3.select('#process-flow-svg');
        
        // Animate data flow
        svg.selectAll('.data-particle').remove();
        
        this.processLinks.forEach((link, index) => {
            setTimeout(() => {
                const source = this.processNodes.find(n => n.id === link.source);
                const target = this.processNodes.find(n => n.id === link.target);
                
                const particle = svg.append('circle')
                    .attr('class', 'data-particle')
                    .attr('r', 3)
                    .attr('fill', '#3b82f6')
                    .attr('cx', source.x)
                    .attr('cy', source.y);

                particle.transition()
                    .duration(2000)
                    .attr('cx', target.x)
                    .attr('cy', target.y)
                    .on('end', function() {
                        d3.select(this).remove();
                    });
            }, index * 500);
        });
    }

    // ============================================
    // CHART MANAGEMENT
    // ============================================

    initializeCharts() {
        this.initPerformanceChart();
        this.initPredictionChart();
        this.initRiskAnalysisChart();
        this.initBenchmarkChart();
        this.initFinancialChart();
        this.initGauges();
    }

    initPerformanceChart() {
        const ctx = document.getElementById('performance-chart');
        if (!ctx) return;

        this.charts.performance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateTimeLabels(30),
                datasets: [{
                    label: 'Ogólna wydajność',
                    data: this.generatePerformanceData(30),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }, {
                    label: 'Efektywność zespołu',
                    data: this.generateTeamEfficiencyData(30),
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        min: 0,
                        max: 100
                    }
                }
            }
        });
    }

    initPredictionChart() {
        const ctx = document.getElementById('prediction-chart');
        if (!ctx) return;

        this.charts.prediction = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateFutureLabels(12),
                datasets: [{
                    label: 'Predykcja AI',
                    data: this.generatePredictionData(12),
                    borderColor: '#8b5cf6',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    borderDash: [5, 5]
                }, {
                    label: 'Dolna granica (95%)',
                    data: this.generatePredictionData(12, 0.85),
                    borderColor: 'rgba(239, 68, 68, 0.5)',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0
                }, {
                    label: 'Górna granica (95%)',
                    data: this.generatePredictionData(12, 1.15),
                    borderColor: 'rgba(16, 185, 129, 0.5)',
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 0
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    initRiskAnalysisChart() {
        const ctx = document.getElementById('risk-analysis-chart');
        if (!ctx) return;

        this.charts.riskAnalysis = new Chart(ctx, {
            type: 'scatter',
            data: {
                datasets: [{
                    label: 'Symulacje Monte Carlo',
                    data: this.generateMonteCarloData(1000),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: '#3b82f6',
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Czas realizacji (miesiące)',
                            color: '#e2e8f0'
                        },
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        title: {
                            display: true,
                            text: 'Koszt projektu (k PLN)',
                            color: '#e2e8f0'
                        },
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    initBenchmarkChart() {
        const ctx = document.getElementById('benchmark-chart');
        if (!ctx) return;

        this.charts.benchmark = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Czas', 'Koszt', 'Jakość', 'Ryzyko', 'Adopcja', 'ROI'],
                datasets: [{
                    label: 'Nasz projekt',
                    data: [85, 92, 78, 88, 76, 90],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.2)',
                    pointBackgroundColor: '#3b82f6'
                }, {
                    label: 'Średnia branży',
                    data: [65, 70, 75, 60, 68, 72],
                    borderColor: '#94a3b8',
                    backgroundColor: 'rgba(148, 163, 184, 0.1)',
                    pointBackgroundColor: '#94a3b8'
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 100,
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' },
                        pointLabels: { color: '#e2e8f0' }
                    }
                }
            }
        });
    }

    initFinancialChart() {
        const ctx = document.getElementById('financial-timeline-chart');
        if (!ctx) return;

        this.charts.financial = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Rok 1', 'Rok 2', 'Rok 3', 'Rok 4', 'Rok 5'],
                datasets: [{
                    label: 'Koszty',
                    data: [-500, -35, -40, -45, -50],
                    backgroundColor: 'rgba(239, 68, 68, 0.7)',
                    borderColor: '#ef4444',
                    borderWidth: 1
                }, {
                    label: 'Korzyści',
                    data: [320, 650, 720, 780, 850],
                    backgroundColor: 'rgba(16, 185, 129, 0.7)',
                    borderColor: '#10b981',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        labels: { color: '#e2e8f0' }
                    }
                },
                scales: {
                    x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    y: {
                        ticks: { 
                            color: '#94a3b8',
                            callback: function(value) {
                                return value + 'k PLN';
                            }
                        },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                }
            }
        });
    }

    initGauges() {
        this.initGauge('cpu-gauge', 67, '#3b82f6');
        this.initGauge('memory-gauge', 43, '#10b981');
        this.initGauge('network-gauge', 28, '#f59e0b');
    }

    initGauge(canvasId, value, color) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 35;
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw background arc
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, 0.25 * Math.PI);
        ctx.lineWidth = 8;
        ctx.strokeStyle = 'rgba(148, 163, 184, 0.2)';
        ctx.stroke();
        
        // Draw progress arc
        const progressAngle = 0.75 * Math.PI + (value / 100) * 1.5 * Math.PI;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0.75 * Math.PI, progressAngle);
        ctx.lineWidth = 8;
        ctx.strokeStyle = color;
        ctx.stroke();
    }

    // ============================================
    // DATA GENERATION METHODS
    // ============================================

    generateTimeLabels(days) {
        const labels = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('pl-PL', { month: 'short', day: 'numeric' }));
        }
        return labels;
    }

    generateFutureLabels(months) {
        const labels = [];
        for (let i = 0; i <= months; i++) {
            const date = new Date();
            date.setMonth(date.getMonth() + i);
            labels.push(date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' }));
        }
        return labels;
    }

    generatePerformanceData(days) {
        const data = [];
        let current = 70;
        for (let i = 0; i <= days; i++) {
            current += (Math.random() - 0.5) * 10;
            current = Math.max(40, Math.min(95, current));
            data.push(Math.round(current));
        }
        return data;
    }

    generateTeamEfficiencyData(days) {
        const data = [];
        let current = 80;
        for (let i = 0; i <= days; i++) {
            current += (Math.random() - 0.5) * 8;
            current = Math.max(60, Math.min(100, current));
            data.push(Math.round(current));
        }
        return data;
    }

    generatePredictionData(months, multiplier = 1) {
        const data = [];
        let base = 75;
        for (let i = 0; i <= months; i++) {
            base += Math.random() * 5 - 2;
            base = Math.max(50, Math.min(100, base));
            data.push(Math.round(base * multiplier));
        }
        return data;
    }

    generateMonteCarloData(points) {
        const data = [];
        for (let i = 0; i < points; i++) {
            const time = this.normalRandom(6, 1.5);
            const cost = this.normalRandom(500, 100) + time * 20;
            data.push({ x: Math.max(3, time), y: Math.max(200, cost) });
        }
        return data;
    }

    generateTrendData(module) {
        const trends = {
            finance: { base: 94, volatility: 3 },
            hr: { base: 87, volatility: 5 },
            logistics: { base: 76, volatility: 8 },
            crm: { base: 91, volatility: 4 }
        };
        
        const config = trends[module] || { base: 85, volatility: 5 };
        return config.base + (Math.random() - 0.5) * config.volatility;
    }

    normalRandom(mean, stddev) {
        let u = 0, v = 0;
        while(u === 0) u = Math.random();
        while(v === 0) v = Math.random();
        const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
        return z * stddev + mean;
    }

    // ============================================
    // SIMULATION LOOP & REAL-TIME UPDATES
    // ============================================

    simulationLoop() {
        if (!this.isRunning) return;

        // Update metrics
        this.updateMetrics();
        
        // Update charts
        this.updateCharts();
        
        // Update 3D visualization
        this.update3DVisualization();
        
        // Update process flow
        this.updateProcessFlow();
        
        // Schedule next update
        setTimeout(() => this.simulationLoop(), 1000 / this.simulationSpeed * 100);
    }

    updateMetrics() {
        // Simulate metric changes
        this.metrics.completionRate = Math.min(100, (this.metrics.completionRate || 73.2) + Math.random() * 0.5);
        this.metrics.teamEfficiency = 85 + Math.sin(Date.now() / 10000) * 10 + Math.random() * 5;
        this.metrics.riskLevel = Math.max(0, Math.min(100, 25 + Math.random() * 10 - 5));
        this.metrics.budgetUsage = Math.min(100, (this.metrics.budgetUsage || 67.4) + Math.random() * 0.3);
        
        // Update DOM elements
        this.updateMetricDisplays();
    }

    updateMetricDisplays() {
        const updates = {
            'completion-rate': this.metrics.completionRate?.toFixed(1) + '%',
            'team-efficiency': this.metrics.teamEfficiency?.toFixed(1) + '%',
            'budget-usage': this.metrics.budgetUsage?.toFixed(1) + '%',
            'critical-issues': Math.floor(Math.random() * 5) + 1
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateCharts() {
        // Update performance chart with new data point
        if (this.charts.performance) {
            const chart = this.charts.performance;
            const newLabel = new Date().toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            
            chart.data.labels.push(newLabel);
            chart.data.datasets[0].data.push(this.metrics.completionRate);
            chart.data.datasets[1].data.push(this.metrics.teamEfficiency);
            
            // Keep only last 30 points
            if (chart.data.labels.length > 30) {
                chart.data.labels.shift();
                chart.data.datasets.forEach(dataset => dataset.data.shift());
            }
            
            chart.update('none');
        }
    }

    startRealTimeUpdates() {
        setInterval(() => {
            this.updateRealTimeMetrics();
            this.updateSystemStatus();
        }, 2000);
    }

    updateRealTimeMetrics() {
        // Update header metrics
        const updates = {
            'uptime': (99.9 + Math.random() * 0.09).toFixed(2) + '%',
            'latency': Math.floor(10 + Math.random() * 10) + 'ms',
            'tps': Math.floor(1000 + Math.random() * 500).toLocaleString()
        };

        Object.entries(updates).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    // ============================================
    // UTILITY METHODS
    // ============================================

    switchTab(tabName) {
        // Hide all tab contents
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.remove('active');
        });
        
        // Remove active class from all tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Show selected tab content
        const targetContent = document.getElementById(`${tabName}-tab`);
        if (targetContent) {
            targetContent.classList.add('active');
        }
        
        // Add active class to clicked tab
        const targetTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
        
        this.log('INFO', 'UI', `Przełączono na zakładkę: ${tabName}`);
    }

    switchAnalyticsTab(tabName) {
        // Similar to switchTab but for analytics section
        document.querySelectorAll('.analytics-panel').forEach(panel => {
            panel.classList.remove('active');
        });
        
        document.querySelectorAll('.analytics-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        
        const targetPanel = document.getElementById(`${tabName}-analytics`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }
        
        const targetTab = document.querySelector(`.analytics-tab[data-tab="${tabName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    loadScenario(scenarioName) {
        this.currentScenario = scenarioName;
        
        const scenarios = {
            success: { 
                completionRate: 95, 
                teamEfficiency: 98, 
                riskLevel: 5,
                timeline: 4.2,
                budget: 450
            },
            realistic: { 
                completionRate: 87, 
                teamEfficiency: 85, 
                riskLevel: 25,
                timeline: 5.8,
                budget: 520
            },
            challenging: { 
                completionRate: 76, 
                teamEfficiency: 70, 
                riskLevel: 45,
                timeline: 7.2,
                budget: 680
            },
            crisis: { 
                completionRate: 62, 
                teamEfficiency: 55, 
                riskLevel: 75,
                timeline: 9.5,
                budget: 850
            }
        };
        
        const scenario = scenarios[scenarioName];
        if (scenario) {
            Object.assign(this.metrics, scenario);
            this.updateMetricDisplays();
            this.log('SUCCESS', 'SCENARIO', `Załadowano scenariusz: ${scenarioName}`);
        }
    }

    getParameterValue(id) {
        const element = document.getElementById(id);
        return element ? element.value : null;
    }

    calculateRiskFactors() {
        const factors = {
            teamSize: this.getParameterValue('organization-size'),
            complexity: this.getParameterValue('integration-complexity'),
            methodology: this.getParameterValue('implementation-model')
        };
        
        let riskScore = 0;
        
        // Team size risk
        const teamRisk = { small: 0.2, medium: 0.4, large: 0.7, enterprise: 1.0 };
        riskScore += teamRisk[factors.teamSize] || 0.5;
        
        // Complexity risk
        const complexityRisk = { low: 0.1, medium: 0.4, high: 0.8, extreme: 1.0 };
        riskScore += complexityRisk[factors.complexity] || 0.5;
        
        // Methodology risk
        const methodRisk = { agile: 0.2, hybrid: 0.4, waterfall: 0.6, phased: 0.5 };
        riskScore += methodRisk[factors.methodology] || 0.4;
        
        return Math.min(1.0, riskScore / 3);
    }

    // ============================================
    // LOGGING SYSTEM
    // ============================================

    log(level, module, message) {
        const timestamp = new Date().toLocaleTimeString('pl-PL');
        const logEntry = { timestamp, level, module, message };
        
        this.eventLog.push(logEntry);
        
        // Keep only last 100 entries
        if (this.eventLog.length > 100) {
            this.eventLog.shift();
        }
        
        this.updateLogDisplay();
    }

    updateLogDisplay() {
        const logDisplay = document.getElementById('event-log-display');
        if (!logDisplay) return;
        
        const latestEntries = this.eventLog.slice(-10);
        
        logDisplay.innerHTML = latestEntries.map(entry => `
            <div class="log-entry ${entry.level.toLowerCase()}">
                <span class="log-timestamp">${entry.timestamp}</span>
                <span class="log-level">${entry.level}</span>
                <span class="log-module">${entry.module}</span>
                <span class="log-message">${entry.message}</span>
            </div>
        `).join('');
        
        // Auto-scroll to bottom
        logDisplay.scrollTop = logDisplay.scrollHeight;
    }

    clearLog() {
        this.eventLog = [];
        this.updateLogDisplay();
        this.log('INFO', 'SYSTEM', 'Dziennik zdarzeń wyczyszczony');
    }

    exportLog() {
        const logData = this.eventLog.map(entry => 
            `${entry.timestamp}\t${entry.level}\t${entry.module}\t${entry.message}`
        ).join('\n');
        
        const blob = new Blob([logData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-twin-log-${new Date().toISOString().slice(0, 10)}.txt`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('SUCCESS', 'EXPORT', 'Dziennik zdarzeń wyeksportowany');
    }

    exportData() {
        const data = {
            metrics: this.metrics,
            scenario: this.currentScenario,
            parameters: {
                implementationModel: this.getParameterValue('implementation-model'),
                organizationSize: this.getParameterValue('organization-size'),
                integrationComplexity: this.getParameterValue('integration-complexity'),
                simulationSpeed: this.simulationSpeed
            },
            timestamp: new Date().toISOString(),
            eventLog: this.eventLog
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `digital-twin-export-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.log('SUCCESS', 'EXPORT', 'Dane symulacji wyeksportowane');
    }

    // ============================================
    // AI RECOMMENDATIONS
    // ============================================

    executeAIRecommendation(button) {
        const card = button.closest('.insight-card');
        const recommendation = card.querySelector('.insight-content p strong').textContent;
        
        // Simulate AI recommendation execution
        this.log('INFO', 'AI', `Wykonywanie rekomendacji: ${recommendation}`);
        
        // Update button state
        button.textContent = 'Wykonywanie...';
        button.disabled = true;
        
        setTimeout(() => {
            button.textContent = 'Wykonano';
            button.classList.remove('primary');
            button.classList.add('secondary');
            this.log('SUCCESS', 'AI', `Rekomendacja wykonana: ${recommendation}`);
        }, 2000);
    }

    // ============================================
    // INITIALIZATION HELPERS
    // ============================================

    loadInitialData() {
        this.metrics = {
            completionRate: 73.2,
            teamEfficiency: 89.7,
            riskLevel: 25,
            budgetUsage: 67.4,
            criticalIssues: 3
        };
        
        this.updateMetricDisplays();
    }

    resetAllMetrics() {
        this.metrics = {};
        this.loadInitialData();
        
        // Reset charts
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.data) {
                chart.data.datasets.forEach(dataset => {
                    dataset.data = [];
                });
                chart.data.labels = [];
                chart.update();
            }
        });
    }

    updateAllCharts() {
        Object.values(this.charts).forEach(chart => {
            if (chart && chart.update) {
                chart.update();
            }
        });
    }
}

// ============================================
// SIMPLIFIED NEURAL NETWORK
// ============================================

class SimpleNeuralNetwork {
    constructor() {
        this.weights = this.initializeWeights();
    }
    
    initializeWeights() {
        return {
            teamSize: 0.3,
            complexity: 0.4,
            methodology: 0.2,
            progress: 0.5,
            risk: -0.3,
            resources: 0.4
        };
    }
    
    predict(data) {
        const inputs = this.normalizeInputs(data);
        let output = 0;
        
        output += inputs.teamSize * this.weights.teamSize;
        output += inputs.complexity * this.weights.complexity;
        output += inputs.methodology * this.weights.methodology;
        output += inputs.progress * this.weights.progress;
        output += inputs.risk * this.weights.risk;
        output += inputs.resources * this.weights.resources;
        
        return this.sigmoid(output);
    }
    
    normalizeInputs(data) {
        const teamSizeMap = { small: 0.2, medium: 0.5, large: 0.8, enterprise: 1.0 };
        const complexityMap = { low: 0.2, medium: 0.5, high: 0.8, extreme: 1.0 };
        const methodologyMap = { agile: 0.8, hybrid: 0.6, waterfall: 0.4, phased: 0.5 };
        
        return {
            teamSize: teamSizeMap[data.teamSize] || 0.5,
            complexity: complexityMap[data.complexity] || 0.5,
            methodology: methodologyMap[data.methodology] || 0.5,
            progress: data.currentProgress / 100,
            risk: 1 - data.riskFactors,
            resources: data.resourceUtilization / 100
        };
    }
    
    sigmoid(x) {
        return Math.max(0.5, Math.min(0.99, 1 / (1 + Math.exp(-x))));
    }
}

// ============================================
// MONTE CARLO SIMULATION ENGINE
// ============================================

class MonteCarloSimulation {
    simulate(iterations, parameters) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            const result = this.runSingleIteration(parameters);
            results.push(result);
        }
        
        return this.analyzeResults(results);
    }
    
    runSingleIteration(params) {
        let totalDuration = 0;
        let totalCost = 0;
        
        // Simulate task durations using triangular distribution
        Object.values(params.taskDurations).forEach(task => {
            const duration = this.triangularRandom(task.min, task.max, task.most_likely);
            totalDuration += duration;
        });
        
        // Apply resource constraints
        const resourceMultiplier = this.calculateResourceMultiplier(params.resourceAvailability);
        totalDuration *= resourceMultiplier;
        
        // Apply risk events
        params.riskEvents.forEach(risk => {
            if (Math.random() < risk.probability) {
                totalDuration *= risk.impact;
                totalCost += totalDuration * risk.impact * 10; // Cost impact
            }
        });
        
        totalCost += totalDuration * 50; // Base cost per day
        
        return { duration: totalDuration, cost: totalCost };
    }
    
    triangularRandom(min, max, mode) {
        const u = Math.random();
        const f = (mode - min) / (max - min);
        
        if (u < f) {
            return min + Math.sqrt(u * (max - min) * (mode - min));
        } else {
            return max - Math.sqrt((1 - u) * (max - min) * (max - mode));
        }
    }
    
    calculateResourceMultiplier(resources) {
        let multiplier = 1;
        
        Object.values(resources).forEach(resource => {
            if (resource.available < resource.required) {
                multiplier *= 1 + (resource.required - resource.available) * 0.2;
            }
        });
        
        return multiplier;
    }
    
    analyzeResults(results) {
        results.sort((a, b) => a.duration - b.duration);
        
        const percentiles = {
            p10: results[Math.floor(results.length * 0.1)],
            p50: results[Math.floor(results.length * 0.5)],
            p90: results[Math.floor(results.length * 0.9)]
        };
        
        return {
            results,
            percentiles,
            mean: {
                duration: results.reduce((sum, r) => sum + r.duration, 0) / results.length,
                cost: results.reduce((sum, r) => sum + r.cost, 0) / results.length
            }
        };
    }
}

// ============================================
// INITIALIZE APPLICATION
// ============================================

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Digital Twin Engine
    window.digitalTwin = new DigitalTwinEngine();
    
    console.log('🚀 Digital Twin Engine uruchomiony pomyślnie!');
    console.log('📊 Wszystkie systemy operacyjne');
    console.log('🔮 AI Predictions: AKTYWNE');
    console.log('📈 Real-time Analytics: AKTYWNE');
});

// Handle window resize for 3D scene
window.addEventListener('resize', () => {
    if (window.digitalTwin && window.digitalTwin.threeRenderer) {
        const container = document.getElementById('three-js-container');
        if (container) {
            const width = container.clientWidth;
            const height = container.clientHeight;
            
            window.digitalTwin.threeCamera.aspect = width / height;
            window.digitalTwin.threeCamera.updateProjectionMatrix();
            window.digitalTwin.threeRenderer.setSize(width, height);
        }
    }
});
