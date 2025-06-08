// Digital Twin Advanced JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏭 Digital Twin Advanced loaded');
    
    // DOM Elements
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const startBtn = document.getElementById('startSimulation');
    const pauseBtn = document.getElementById('pauseSimulation');
    const resetBtn = document.getElementById('resetSimulation');
    const viewBtns = document.querySelectorAll('.view-btn');
    const logsContent = document.getElementById('logsContent');
    
    // State
    let isSimulationRunning = false;
    let simulationSpeed = 5;
    let logInterval;
    
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
