// Digital Twin Advanced JavaScript with Three.js 3D Engine
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏭 Digital Twin Advanced 3D loaded');
    
    // DOM Elements
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const startBtn = document.getElementById('startSimulation');
    const pauseBtn = document.getElementById('pauseSimulation');
    const resetBtn = document.getElementById('resetSimulation');
    const viewBtns = document.querySelectorAll('.view-btn');
    const logsContent = document.getElementById('logsContent');
    const canvasContainer = document.getElementById('twin3D');
    
    // Three.js Scene Variables
    let scene, camera, renderer, controls;
    let erpBuilding, dataParticles = [];
    let animationId;
    let moduleBoxes = [];
    let flowLines = [];
    
    // Simulation State
    let isSimulationRunning = false;
    let simulationSpeed = 5;
    let logInterval;
    let moduleProgress = {
        'Finansowy': 75,
        'HR': 60,
        'Logistyka': 30,
        'CRM': 15
    };
    
    // 3D Scene Setup
    function init3DScene() {
        // Clear existing content
        const placeholder = canvasContainer.querySelector('.canvas-placeholder');
        if (placeholder) {
            placeholder.style.display = 'none';
        }
        
        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x1e293b);
        scene.fog = new THREE.Fog(0x1e293b, 50, 500);
        
        // Camera
        const width = canvasContainer.clientWidth;
        const height = canvasContainer.clientHeight;
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(30, 25, 30);
        camera.lookAt(0, 0, 0);
        
        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(width, height);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.outputEncoding = THREE.sRGBEncoding;
        
        canvasContainer.appendChild(renderer.domElement);
        
        // Lighting
        setupLighting();
        
        // Create ERP Building
        createERPBuilding();
        
        // Create Data Flows
        createDataFlows();
        
        // Add orbit controls
        if (window.THREE.OrbitControls) {
            controls = new THREE.OrbitControls(camera, renderer.domElement);
            controls.enableDamping = true;
            controls.dampingFactor = 0.05;
        }
        
        // Start render loop
        animate3D();
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        addLog('INFO', 'Digital Twin: Silnik 3D Three.js zainicjalizowany');
        console.log('✅ 3D Scene initialized with Three.js');
    }
    
    function setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        scene.add(ambientLight);
        
        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 50, 25);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        scene.add(directionalLight);
        
        // Point lights for dramatic effect
        const pointLight1 = new THREE.PointLight(0x4f46e5, 1, 100);
        pointLight1.position.set(10, 15, 10);
        scene.add(pointLight1);
        
        const pointLight2 = new THREE.PointLight(0x10b981, 0.8, 80);
        pointLight2.position.set(-10, 12, -10);
        scene.add(pointLight2);
    }
    
    function createERPBuilding() {
        erpBuilding = new THREE.Group();
        
        // Building base
        const baseGeometry = new THREE.BoxGeometry(20, 2, 15);
        const baseMaterial = new THREE.MeshLambertMaterial({ 
            color: 0x374151,
            transparent: true,
            opacity: 0.8
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = 1;
        base.castShadow = true;
        base.receiveShadow = true;
        erpBuilding.add(base);
        
        // Create module floors
        const modules = [
            { name: 'Finansowy', color: 0x4f46e5, y: 4, progress: 75 },
            { name: 'HR', color: 0x7c3aed, y: 8, progress: 60 },
            { name: 'Logistyka', color: 0x10b981, y: 12, progress: 30 },
            { name: 'CRM', color: 0xf59e0b, y: 16, progress: 15 }
        ];
        
        modules.forEach((module, index) => {
            const moduleGroup = new THREE.Group();
            
            // Main module box
            const moduleGeometry = new THREE.BoxGeometry(16, 3, 12);
            const moduleMaterial = new THREE.MeshPhongMaterial({ 
                color: module.color,
                transparent: true,
                opacity: 0.7
            });
            const moduleBox = new THREE.Mesh(moduleGeometry, moduleMaterial);
            moduleBox.position.y = module.y;
            moduleBox.castShadow = true;
            moduleBox.userData = { name: module.name, progress: module.progress };
            
            // Progress indicator
            const progressGeometry = new THREE.BoxGeometry(16 * (module.progress / 100), 0.5, 12);
            const progressMaterial = new THREE.MeshPhongMaterial({ 
                color: 0x10b981,
                emissive: 0x004422
            });
            const progressBox = new THREE.Mesh(progressGeometry, progressMaterial);
            progressBox.position.set(-(16 - 16 * (module.progress / 100)) / 2, module.y + 2, 0);
            
            moduleGroup.add(moduleBox);
            moduleGroup.add(progressBox);
            moduleBoxes.push({ group: moduleGroup, box: moduleBox, progress: progressBox, data: module });
            erpBuilding.add(moduleGroup);
            
            // Add floating text label
            createTextLabel(module.name, moduleBox.position.clone().add(new THREE.Vector3(10, 0, 0)));
        });
        
        scene.add(erpBuilding);
    }
    
    function createTextLabel(text, position) {
        // Simple text sprite (placeholder for WebGL text)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        context.font = '48px Arial';
        context.fillStyle = 'white';
        context.strokeStyle = 'black';
        context.lineWidth = 4;
        context.strokeText(text, 0, 48);
        context.fillText(text, 0, 48);
        
        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.position.copy(position);
        sprite.scale.set(8, 4, 1);
        scene.add(sprite);
    }
    
    function createDataFlows() {
        // Create animated particle systems for data flows
        const particleCount = 50;
        
        for (let i = 0; i < 3; i++) {
            const particles = new THREE.BufferGeometry();
            const positions = new Float32Array(particleCount * 3);
            const colors = new Float32Array(particleCount * 3);
            
            for (let j = 0; j < particleCount; j++) {
                positions[j * 3] = (Math.random() - 0.5) * 40;
                positions[j * 3 + 1] = Math.random() * 20;
                positions[j * 3 + 2] = (Math.random() - 0.5) * 30;
                
                const color = new THREE.Color();
                color.setHSL(0.6 + Math.random() * 0.4, 1, 0.5);
                colors[j * 3] = color.r;
                colors[j * 3 + 1] = color.g;
                colors[j * 3 + 2] = color.b;
            }
            
            particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            
            const particleMaterial = new THREE.PointsMaterial({
                size: 0.5,
                vertexColors: true,
                transparent: true,
                opacity: 0.8
            });
            
            const particleSystem = new THREE.Points(particles, particleMaterial);
            dataParticles.push(particleSystem);
            scene.add(particleSystem);
        }
    }
    
    function animate3D() {
        animationId = requestAnimationFrame(animate3D);
        
        if (isSimulationRunning) {
            // Rotate building slowly
            if (erpBuilding) {
                erpBuilding.rotation.y += 0.005 * simulationSpeed;
            }
            
            // Animate data particles
            dataParticles.forEach((particles, index) => {
                const positions = particles.geometry.attributes.position.array;
                for (let i = 0; i < positions.length; i += 3) {
                    positions[i + 1] += 0.1 * simulationSpeed; // Move up
                    if (positions[i + 1] > 25) {
                        positions[i + 1] = 0; // Reset to bottom
                        positions[i] = (Math.random() - 0.5) * 40; // Random X
                        positions[i + 2] = (Math.random() - 0.5) * 30; // Random Z
                    }
                }
                particles.geometry.attributes.position.needsUpdate = true;
            });
            
            // Update module progress animations
            updateModuleProgress();
        }
        
        // Update controls
        if (controls) {
            controls.update();
        }
        
        renderer.render(scene, camera);
    }
    
    function updateModuleProgress() {
        moduleBoxes.forEach(moduleObj => {
            if (isSimulationRunning && moduleObj.data.progress < 100) {
                // Slowly increase progress
                moduleObj.data.progress += 0.1 * simulationSpeed;
                moduleProgress[moduleObj.data.name] = Math.min(100, moduleObj.data.progress);
                
                // Update progress bar
                const newWidth = 16 * (moduleObj.data.progress / 100);
                moduleObj.progress.geometry.dispose();
                moduleObj.progress.geometry = new THREE.BoxGeometry(newWidth, 0.5, 12);
                moduleObj.progress.position.x = -(16 - newWidth) / 2;
                
                // Change color as progress increases
                const hue = 0.3 * (moduleObj.data.progress / 100); // Red to green
                moduleObj.progress.material.color.setHSL(hue, 1, 0.5);
                
                if (moduleObj.data.progress >= 100) {
                    addLog('INFO', `${moduleObj.data.name}: Implementacja zakończona (100%)`);
                }
            }
        });
    }
    
    function onWindowResize() {
        if (!camera || !renderer) return;
        
        const width = canvasContainer.clientWidth;
        const height = canvasContainer.clientHeight;
        
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }
    
    function cleanup3D() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        if (renderer) {
            canvasContainer.removeChild(renderer.domElement);
            renderer.dispose();
        }
        
        // Dispose geometries and materials
        scene.traverse((object) => {
            if (object.geometry) {
                object.geometry.dispose();
            }
            if (object.material) {
                if (object.material.length) {
                    object.material.forEach(material => material.dispose());
                } else {
                    object.material.dispose();
                }
            }
        });
    }
    
    // Speed control
    if (speedSlider) {
        speedSlider.addEventListener('input', function() {
            simulationSpeed = this.value;
            speedValue.textContent = simulationSpeed + 'x';
            updateSimulationSpeed();
        });
    }
    
    // Simulation controls
    if (startBtn) {
        startBtn.addEventListener('click', startSimulation);
    }
    
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseSimulation);
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetSimulation);
    }
    
    // View controls
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            viewBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            switchView(this.dataset.view);
        });
    });
    
    // Functions
    function startSimulation() {
        if (isSimulationRunning) return;
        
        isSimulationRunning = true;
        startBtn.textContent = '⏸️ Running...';
        startBtn.disabled = true;
        pauseBtn.disabled = false;
        
        addLog('INFO', 'Digital Twin: Symulacja uruchomiona');
        addLog('INFO', `System: Prędkość symulacji ustawiona na ${simulationSpeed}x`);
        
        // Start animation updates
        startAnimations();
        startLogGeneration();
        updateMetrics();
        
        console.log('✅ Simulation started');
    }
    
    function pauseSimulation() {
        if (!isSimulationRunning) return;
        
        isSimulationRunning = false;
        startBtn.textContent = '▶️ Uruchom Symulację';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        addLog('WARN', 'Digital Twin: Symulacja wstrzymana');
        
        // Stop animations
        stopAnimations();
        stopLogGeneration();
        
        console.log('⏸️ Simulation paused');
    }
    
    function resetSimulation() {
        isSimulationRunning = false;
        startBtn.textContent = '▶️ Uruchom Symulację';
        startBtn.disabled = false;
        pauseBtn.disabled = true;
        
        addLog('INFO', 'Digital Twin: Reset systemu wykonany');
        
        // Reset all values
        resetMetrics();
        clearLogs();
        stopAnimations();
        stopLogGeneration();
        
        console.log('🔄 Simulation reset');
    }
    
    function updateSimulationSpeed() {
        if (isSimulationRunning) {
            addLog('INFO', `System: Prędkość symulacji zmieniona na ${simulationSpeed}x`);
        }
    }
    
    function switchView(viewType) {
        addLog('INFO', `Digital Twin: Przełączono widok na ${viewType.toUpperCase()}`);
        
        const canvas = document.querySelector('.twin-canvas');
        if (!canvas) return;
        
        // Add view switching animation
        canvas.style.opacity = '0.5';
        setTimeout(() => {
            canvas.style.opacity = '1';
        }, 300);
        
        console.log(`📊 View switched to: ${viewType}`);
    }
    
    function startAnimations() {
        // Animate progress indicators
        const progressBars = document.querySelectorAll('.progress-indicator');
        progressBars.forEach((bar, index) => {
            animateProgress(bar, index);
        });
        
        // Animate flow lines
        const flowLines = document.querySelectorAll('.flow-line');
        flowLines.forEach(line => {
            line.style.animationDuration = `${2 / simulationSpeed}s`;
        });
    }
    
    function stopAnimations() {
        // Reset animations
        const flowLines = document.querySelectorAll('.flow-line');
        flowLines.forEach(line => {
            line.style.animationDuration = '2s';
        });
    }
    
    function animateProgress(progressBar, index) {
        if (!isSimulationRunning) return;
        
        const currentWidth = parseInt(progressBar.style.width) || 0;
        const increment = Math.random() * 2;
        const newWidth = Math.min(currentWidth + increment, 100);
        
        progressBar.style.width = newWidth + '%';
        
        if (newWidth >= 100) {
            addLog('INFO', `Moduł ${index + 1}: Implementacja zakończona (100%)`);
        }
        
        setTimeout(() => animateProgress(progressBar, index), 1000 / simulationSpeed);
    }
    
    function startLogGeneration() {
        const logMessages = [
            'Moduł finansowy: Importowanie danych księgowych',
            'Moduł HR: Aktualizacja struktury organizacyjnej',
            'System: Weryfikacja integralności danych',
            'Moduł logistyka: Konfiguracja magazynów',
            'Digital Twin: Synchronizacja modelu 3D',
            'AI Assistant: Analiza wzorców użytkowania',
            'System: Backup danych wykonany pomyślnie',
            'Moduł CRM: Import kontaktów klientów',
            'System: Optymalizacja wydajności bazy danych',
            'Digital Twin: Aktualizacja metryk rzeczywistych'
        ];
        
        logInterval = setInterval(() => {
            if (!isSimulationRunning) return;
            
            const randomMessage = logMessages[Math.floor(Math.random() * logMessages.length)];
            const logTypes = ['INFO', 'WARN', 'INFO', 'INFO']; // More INFO than WARN
            const randomType = logTypes[Math.floor(Math.random() * logTypes.length)];
            
            addLog(randomType, randomMessage);
        }, 2000 / simulationSpeed);
    }
    
    function stopLogGeneration() {
        if (logInterval) {
            clearInterval(logInterval);
        }
    }
    
    function addLog(level, message) {
        if (!logsContent) return;
        
        const timestamp = new Date().toLocaleTimeString('pl-PL');
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${level.toLowerCase()}`;
        
        logEntry.innerHTML = `
            <span class="timestamp">${timestamp}</span>
            <span class="level">${level}</span>
            <span class="message">${message}</span>
        `;
        
        logsContent.insertBefore(logEntry, logsContent.firstChild);
        
        // Keep only last 20 logs
        while (logsContent.children.length > 20) {
            logsContent.removeChild(logsContent.lastChild);
        }
    }
    
    function clearLogs() {
        if (logsContent) {
            logsContent.innerHTML = '';
            addLog('INFO', 'Digital Twin: Logi wyczyszczone');
        }
    }
    
    function updateMetrics() {
        if (!isSimulationRunning) return;
        
        // Update random metrics
        const cpuValue = document.querySelector('.status-item .value');
        if (cpuValue) {
            const cpu = Math.floor(Math.random() * 30) + 50;
            cpuValue.textContent = cpu + '%';
        }
        
        const transactionValue = document.querySelectorAll('.status-item .value')[2];
        if (transactionValue) {
            const transactions = Math.floor(Math.random() * 500) + 1000;
            transactionValue.textContent = transactions.toLocaleString();
        }
        
        setTimeout(() => updateMetrics(), 3000);
    }
    
    function resetMetrics() {
        // Reset progress bars
        const progressBars = document.querySelectorAll('.progress-indicator');
        progressBars.forEach(bar => {
            bar.style.width = '0%';
        });
        
        // Reset status values
        const statusValues = document.querySelectorAll('.status-item .value');
        if (statusValues[0]) statusValues[0].textContent = '0%';
        if (statusValues[1]) statusValues[1].textContent = '0GB';
        if (statusValues[2]) statusValues[2].textContent = '0';
        if (statusValues[3]) statusValues[3].textContent = '0';
    }
    
    // Log controls
    const clearLogsBtn = document.getElementById('clearLogs');
    const pauseLogsBtn = document.getElementById('pauseLogs');
    const exportLogsBtn = document.getElementById('exportLogs');
    
    if (clearLogsBtn) {
        clearLogsBtn.addEventListener('click', clearLogs);
    }
    
    if (pauseLogsBtn) {
        pauseLogsBtn.addEventListener('click', function() {
            // Toggle log generation
            if (this.textContent === 'Pause') {
                stopLogGeneration();
                this.textContent = 'Resume';
                addLog('WARN', 'Digital Twin: Logowanie wstrzymane');
            } else {
                startLogGeneration();
                this.textContent = 'Pause';
                addLog('INFO', 'Digital Twin: Logowanie wznowione');
            }
        });
    }
    
    if (exportLogsBtn) {
        exportLogsBtn.addEventListener('click', function() {
            const logs = Array.from(logsContent.children).map(entry => {
                const timestamp = entry.querySelector('.timestamp').textContent;
                const level = entry.querySelector('.level').textContent;
                const message = entry.querySelector('.message').textContent;
                return `${timestamp} [${level}] ${message}`;
            }).join('\n');
            
            const blob = new Blob([logs], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `digital-twin-logs-${new Date().toISOString().slice(0, 10)}.txt`;
            a.click();
            URL.revokeObjectURL(url);
            
            addLog('INFO', 'Digital Twin: Logi wyeksportowane do pliku');
        });
    }
    
    // Initialize with some default logs
    addLog('INFO', 'Digital Twin Advanced: System zainicjalizowany');
    addLog('INFO', 'System: Wszystkie moduły gotowe do symulacji');
    addLog('INFO', 'AI Assistant: Połączenie nawiązane');
    
    // Add floating elements animation
    const floors = document.querySelectorAll('.floor');
    floors.forEach((floor, index) => {
        floor.style.animationDelay = `${index * 0.5}s`;
    });
    
    // Initialize 3D Scene
    if (typeof THREE !== 'undefined') {
        try {
            init3DScene();
            addLog('INFO', 'Digital Twin: Silnik 3D Three.js załadowany pomyślnie');
        } catch (error) {
            console.error('Błąd inicjalizacji 3D:', error);
            addLog('WARN', 'Digital Twin: Błąd inicjalizacji 3D - używam tryb fallback');
        }
    } else {
        console.warn('Three.js nie jest załadowane - używam CSS fallback');
        addLog('WARN', 'Digital Twin: Three.js niedostępne - tryb CSS');
    }
    
    console.log('🎯 Digital Twin Advanced initialized successfully');
});

// Export functions for external use
window.DigitalTwin = {
    start: () => document.getElementById('startSimulation').click(),
    pause: () => document.getElementById('pauseSimulation').click(),
    reset: () => document.getElementById('resetSimulation').click(),
    setSpeed: (speed) => {
        const slider = document.getElementById('speedSlider');
        if (slider) {
            slider.value = speed;
            slider.dispatchEvent(new Event('input'));
        }
    }
};
