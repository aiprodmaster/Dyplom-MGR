// ROI Calculator - Profesjonalny Kalkulator Zwrotu z Inwestycji ERP
// Enterprise-grade Financial Analysis Tool
// Autor: AI Assistant ERP | Data: 2025 | v2.0 Professional

class ROICalculator {
    constructor() {
        this.projectData = {
            // === KOSZTY WDROŻENIA ===
            licenseCosts: 420000,
            implementationCosts: 380000,
            infrastructureCosts: 240000,
            trainingCosts: 120000,
            operationalCosts: 50000,
            maintenanceCosts: 85000, // Nowe
            consultingCosts: 150000, // Nowe
            migrationCosts: 75000,   // Nowe
            
            // === KORZYŚCI ROCZNE ===
            annualSavings: 890000,
            revenueIncrease: 15, // procent
            productivityGains: 25, // procent
            automationSavings: 180000, // Nowe
            complianceSavings: 65000,   // Nowe
            inventoryOptimization: 120000, // Nowe
            
            // === PARAMETRY FINANSOWE ===
            discountRate: 0.08,
            analysisYears: 5,
            inflationRate: 0.025, // Nowe
            taxRate: 0.19,        // Nowe
            wacc: 0.095,          // Weighted Average Cost of Capital
            
            // === OCENA RYZYKA ===
            implementationRisk: 0.15,
            adoptionRisk: 0.10,
            technologyRisk: 0.08,
            budgetRisk: 0.12,     // Nowe
            timelineRisk: 0.18,   // Nowe
            
            // === PARAMETRY BIZNESOWE ===
            currentRevenue: 2500000,
            employeeCount: 150,
            currentProcessEfficiency: 0.72,
            targetEfficiency: 0.92
        };
        
        this.scenarios = {
            conservative: { 
                costMultiplier: 1.35, 
                benefitMultiplier: 0.65, 
                riskMultiplier: 1.8,
                timelineMultiplier: 1.4,
                description: "Konserwatywny - wysokie koszty, niskie korzyści"
            },
            realistic: { 
                costMultiplier: 1.0, 
                benefitMultiplier: 1.0, 
                riskMultiplier: 1.0,
                timelineMultiplier: 1.0,
                description: "Realistyczny - bazowe założenia"
            },
            optimistic: { 
                costMultiplier: 0.85, 
                benefitMultiplier: 1.25, 
                riskMultiplier: 0.6,
                timelineMultiplier: 0.8,
                description: "Optymistyczny - sprawna realizacja"
            },
            aggressive: {
                costMultiplier: 0.75,
                benefitMultiplier: 1.45,
                riskMultiplier: 0.4,
                timelineMultiplier: 0.7,
                description: "Agresywny - maksymalne korzyści"
            }
        };
        
        // Benchmarki branżowe
        this.industryBenchmarks = {
            manufacturingROI: 245,
            retailROI: 185,
            servicesROI: 220,
            averagePayback: 2.1,
            implementationSuccess: 0.78
        };
        
        // Historia kalkulacji
        this.calculationHistory = [];
        this.currentScenario = 'realistic';
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createCharts();
        this.calculateROI();
        this.startRealTimeUpdates();
    }
    
    setupEventListeners() {
        // Input change listeners
        const inputs = ['license-cost', 'implementation-cost', 'annual-savings', 'revenue-increase'];
        inputs.forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('input', () => this.calculateROI());
            }
        });
        
        // Scenario buttons
        document.querySelectorAll('.scenario-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.loadScenario(e.target.dataset.scenario));
        });
        
        // Export button
        const exportBtn = document.getElementById('export-roi-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }
        
        // Sensitivity analysis
        const sensitivityBtn = document.getElementById('run-sensitivity');
        if (sensitivityBtn) {
            sensitivityBtn.addEventListener('click', () => this.runSensitivityAnalysis());
        }
    }
    
    calculateROI() {
        try {
            // Pobierz dane z inputów (jeśli istnieją)
            this.updateDataFromInputs();
            
            // Oblicz koszty całkowite - używaj nowej metody
            const totalCosts = this.calculateTotalCosts();
            
            // Oblicz korzyści roczne - teraz zwraca obiekt
            const benefitsData = this.calculateAnnualBenefits();
            const annualBenefits = benefitsData.total;
            
            // Oblicz zaawansowane metryki finansowe
            const tco = this.calculateTCO();
            const irr = this.calculateIRR();
            const ebitdaImpact = this.calculateEBITDA();
            const riskAdjustedROI = this.calculateRiskAdjustedROI();
            
            // Oblicz ROI dla różnych okresów
            const roi1Year = this.calculateROIForPeriod(1, totalCosts, annualBenefits);
            const roi3Years = this.calculateROIForPeriod(3, totalCosts, annualBenefits);
            const roi5Years = this.calculateROIForPeriod(5, totalCosts, annualBenefits);
            
            // Oblicz NPV z nową metodą
            const npv = this.calculateNPV(totalCosts, annualBenefits);
            
            // Oblicz okres zwrotu
            const paybackPeriod = this.calculatePaybackPeriod(totalCosts, annualBenefits);
            
            // Pobierz benchmark comparison
            const benchmarks = this.getBenchmarkComparison();
            
            // Aktualizuj wyświetlane wartości
            this.updateDisplay({
                totalCosts: totalCosts,
                annualBenefits: annualBenefits,
                benefitsBreakdown: benefitsData.breakdown,
                tco: tco,
                irr: irr,
                ebitdaImpact: ebitdaImpact,
                riskAdjustedROI: riskAdjustedROI,
                roi1Year: roi1Year,
                roi3Years: roi3Years,
                roi5Years: roi5Years,
                npv: npv,
                paybackPeriod: paybackPeriod,
                benchmarks: benchmarks
            });
            
            // Aktualizuj wykresy
            this.updateCharts({
                totalCosts: totalCosts,
                annualBenefits: annualBenefits,
                benefitsBreakdown: benefitsData.breakdown,
                npv: npv
            });
            
            // Zapisz do historii
            this.saveCalculationToHistory({
                timestamp: new Date(),
                scenario: this.currentScenario,
                totalCosts,
                annualBenefits,
                roi3Years,
                npv,
                paybackPeriod
            });
            
        } catch (error) {
            console.error('Błąd kalkulacji ROI:', error);
            this.showNotification('Błąd w kalkulacji ROI', 'error');
        }
    }
    
    saveCalculationToHistory(calculation) {
        this.calculationHistory.push(calculation);
        // Zachowaj tylko ostatnie 10 kalkulacji
        if (this.calculationHistory.length > 10) {
            this.calculationHistory.shift();
        }
    }
    
    updateDataFromInputs() {
        const getValue = (id, defaultValue) => {
            const element = document.getElementById(id);
            return element ? parseFloat(element.value) || defaultValue : defaultValue;
        };
        
        this.projectData.licenseCosts = getValue('license-cost', 420000);
        this.projectData.implementationCosts = getValue('implementation-cost', 380000);
        this.projectData.annualSavings = getValue('annual-savings', 890000);
        this.projectData.revenueIncrease = getValue('revenue-increase', 15);
    }
    
    calculateAnnualBenefits() {
        // === OSZCZĘDNOŚCI OPERACYJNE ===
        const operationalSavings = this.projectData.annualSavings;
        
        // === DODATKOWE PRZYCHODY ===
        const baseRevenue = this.projectData.currentRevenue;
        const additionalRevenue = baseRevenue * (this.projectData.revenueIncrease / 100);
        
        // === WZROST PRODUKTYWNOŚCI ===
        const efficiencyGain = this.projectData.targetEfficiency - this.projectData.currentProcessEfficiency;
        const productivityValue = this.projectData.employeeCount * 60000 * efficiencyGain; // 60k avg salary
        
        // === AUTOMATYZACJA I OSZCZĘDNOŚCI ===
        const automationSavings = this.projectData.automationSavings;
        const complianceSavings = this.projectData.complianceSavings;
        const inventoryOptimization = this.projectData.inventoryOptimization;
        
        // === REDUKCJA KOSZTÓW BŁĘDÓW ===
        const errorReductionValue = baseRevenue * 0.035; // 3.5% reduction in errors
        
        // === OSZCZĘDNOŚCI Z INTEGRACJI ===
        const integrationSavings = this.calculateIntegrationSavings();
        
        // === KORZYŚCI STRATEGICZNE ===
        const strategicBenefits = this.calculateStrategicBenefits();
        
        return {
            total: operationalSavings + additionalRevenue + productivityValue + 
                   automationSavings + complianceSavings + inventoryOptimization + 
                   errorReductionValue + integrationSavings + strategicBenefits,
            breakdown: {
                operationalSavings,
                additionalRevenue,
                productivityValue,
                automationSavings,
                complianceSavings,
                inventoryOptimization,
                errorReductionValue,
                integrationSavings,
                strategicBenefits
            }
        };
    }
    
    calculateIntegrationSavings() {
        // Oszczędności z eliminacji redundantnych systemów
        const systemConsolidation = 45000;
        // Redukcja czasu na reporting
        const reportingEfficiency = 35000;
        // Automatyzacja reconciliation
        const reconciliationSavings = 28000;
        
        return systemConsolidation + reportingEfficiency + reconciliationSavings;
    }
    
    calculateStrategicBenefits() {
        // Lepsza visibility = lepsze decyzje biznesowe
        const decisionQuality = this.projectData.currentRevenue * 0.015; // 1.5% improvement
        // Faster time-to-market
        const timeToMarket = 75000;
        // Customer satisfaction improvements
        const customerSatisfaction = 55000;
        
        return decisionQuality + timeToMarket + customerSatisfaction;
    }
    
    calculateTotalCosts() {
        return this.projectData.licenseCosts + 
               this.projectData.implementationCosts + 
               this.projectData.infrastructureCosts + 
               this.projectData.trainingCosts +
               this.projectData.maintenanceCosts +
               this.projectData.consultingCosts +
               this.projectData.migrationCosts;
    }
    
    calculateTCO(years = 5) {
        // Total Cost of Ownership
        const initialCosts = this.calculateTotalCosts();
        const annualOperationalCosts = this.projectData.operationalCosts + 
                                     this.projectData.maintenanceCosts;
        
        // Inflation adjustment for future costs
        let totalTCO = initialCosts;
        for (let year = 1; year <= years; year++) {
            const inflationFactor = Math.pow(1 + this.projectData.inflationRate, year);
            totalTCO += annualOperationalCosts * inflationFactor;
        }
        
        return totalTCO;
    }
    
    calculateIRR() {
        // Internal Rate of Return calculation using Newton-Raphson method
        const cashFlows = this.getCashFlowStream();
        let irr = 0.1; // Initial guess 10%
        let iteration = 0;
        const maxIterations = 100;
        const tolerance = 0.00001;
        
        while (iteration < maxIterations) {
            const npv = this.calculateNPVWithRate(cashFlows, irr);
            const derivativeNPV = this.calculateNPVDerivative(cashFlows, irr);
            
            if (Math.abs(npv) < tolerance) break;
            
            irr = irr - (npv / derivativeNPV);
            iteration++;
        }
        
        return irr * 100; // Return as percentage
    }
    
    getCashFlowStream() {
        const totalCosts = this.calculateTotalCosts();
        const benefitsData = this.calculateAnnualBenefits();
        const annualNetBenefit = benefitsData.total - this.projectData.operationalCosts;
        
        const cashFlows = [-totalCosts]; // Year 0 - initial investment
        
        for (let year = 1; year <= this.projectData.analysisYears; year++) {
            // Apply inflation to benefits and costs
            const inflationFactor = Math.pow(1 + this.projectData.inflationRate, year);
            const adjustedBenefit = annualNetBenefit * inflationFactor;
            cashFlows.push(adjustedBenefit);
        }
        
        return cashFlows;
    }
    
    calculateNPVWithRate(cashFlows, rate) {
        let npv = 0;
        for (let i = 0; i < cashFlows.length; i++) {
            npv += cashFlows[i] / Math.pow(1 + rate, i);
        }
        return npv;
    }
    
    calculateNPVDerivative(cashFlows, rate) {
        let derivative = 0;
        for (let i = 1; i < cashFlows.length; i++) {
            derivative -= (i * cashFlows[i]) / Math.pow(1 + rate, i + 1);
        }
        return derivative;
    }
    
    calculateEBITDA() {
        // Estimated EBITDA impact from ERP implementation
        const benefitsData = this.calculateAnnualBenefits();
        const operationalImprovements = benefitsData.breakdown.operationalSavings + 
                                      benefitsData.breakdown.automationSavings +
                                      benefitsData.breakdown.productivityValue;
        
        // EBITDA improvement (before tax considerations)
        return operationalImprovements * (1 - this.projectData.taxRate);
    }
    
    calculateRiskAdjustedROI() {
        const baseROI = this.calculateROIForPeriod(3, this.calculateTotalCosts(), this.calculateAnnualBenefits().total);
        
        // Risk adjustment factors
        const implementationRisk = this.projectData.implementationRisk;
        const adoptionRisk = this.projectData.adoptionRisk;
        const technologyRisk = this.projectData.technologyRisk;
        const budgetRisk = this.projectData.budgetRisk;
        const timelineRisk = this.projectData.timelineRisk;
        
        // Combined risk factor (using Monte Carlo approach)
        const overallRisk = 1 - Math.sqrt(
            (1 - implementationRisk) * 
            (1 - adoptionRisk) * 
            (1 - technologyRisk) * 
            (1 - budgetRisk) * 
            (1 - timelineRisk)
        );
        
        // Risk-adjusted ROI
        return baseROI * (1 - overallRisk);
    }
    
    runMonteCarloSimulation(iterations = 1000) {
        const results = [];
        
        for (let i = 0; i < iterations; i++) {
            // Generate random variations for key parameters
            const costVariation = this.generateRandomVariation(0.15); // ±15%
            const benefitVariation = this.generateRandomVariation(0.20); // ±20%
            const timelineVariation = this.generateRandomVariation(0.25); // ±25%
            
            // Calculate scenario
            const adjustedCosts = this.calculateTotalCosts() * costVariation;
            const adjustedBenefits = this.calculateAnnualBenefits().total * benefitVariation;
            const adjustedTimeline = this.projectData.analysisYears * timelineVariation;
            
            const scenarioROI = this.calculateROIForPeriod(adjustedTimeline, adjustedCosts, adjustedBenefits);
            const scenarioNPV = this.calculateNPV(adjustedCosts, adjustedBenefits);
            
            results.push({
                roi: scenarioROI,
                npv: scenarioNPV,
                payback: adjustedCosts / (adjustedBenefits - this.projectData.operationalCosts)
            });
        }
        
        return this.analyzeMonteCarloResults(results);
    }
    
    generateRandomVariation(stdDev) {
        // Box-Muller transformation for normal distribution
        const u1 = Math.random();
        const u2 = Math.random();
        const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        return 1 + (z * stdDev);
    }
    
    analyzeMonteCarloResults(results) {
        const rois = results.map(r => r.roi).sort((a, b) => a - b);
        const npvs = results.map(r => r.npv).sort((a, b) => a - b);
        const paybacks = results.map(r => r.payback).sort((a, b) => a - b);
        
        const percentile = (arr, p) => arr[Math.floor(arr.length * p / 100)];
        
        return {
            roi: {
                mean: rois.reduce((a, b) => a + b) / rois.length,
                median: rois[Math.floor(rois.length / 2)],
                p10: percentile(rois, 10),
                p90: percentile(rois, 90),
                min: rois[0],
                max: rois[rois.length - 1]
            },
            npv: {
                mean: npvs.reduce((a, b) => a + b) / npvs.length,
                median: npvs[Math.floor(npvs.length / 2)],
                p10: percentile(npvs, 10),
                p90: percentile(npvs, 90),
                positive: npvs.filter(n => n > 0).length / npvs.length
            },
            payback: {
                mean: paybacks.reduce((a, b) => a + b) / paybacks.length,
                median: paybacks[Math.floor(paybacks.length / 2)],
                p10: percentile(paybacks, 10),
                p90: percentile(paybacks, 90)
            }
        };
    }
    
    getBenchmarkComparison() {
        const currentROI = this.calculateROIForPeriod(3, this.calculateTotalCosts(), this.calculateAnnualBenefits().total);
        const currentPayback = this.calculatePaybackPeriod(this.calculateTotalCosts(), this.calculateAnnualBenefits().total);
        
        return {
            roi: {
                current: currentROI,
                manufacturing: this.industryBenchmarks.manufacturingROI,
                retail: this.industryBenchmarks.retailROI,
                services: this.industryBenchmarks.servicesROI,
                performance: currentROI >= this.industryBenchmarks.manufacturingROI ? 'excellent' :
                           currentROI >= this.industryBenchmarks.retailROI ? 'good' :
                           currentROI >= 100 ? 'average' : 'below'
            },
            payback: {
                current: currentPayback,
                benchmark: this.industryBenchmarks.averagePayback,
                performance: currentPayback <= 1.5 ? 'excellent' :
                           currentPayback <= 2.5 ? 'good' :
                           currentPayback <= 4 ? 'average' : 'below'
            }
        };
    }
    
    calculateROIForPeriod(years, totalCosts, annualBenefits) {
        const totalBenefits = annualBenefits * years;
        const operationalCosts = this.projectData.operationalCosts * years;
        const netBenefits = totalBenefits - operationalCosts;
        
        return ((netBenefits - totalCosts) / totalCosts) * 100;
    }
    
    calculateNPV(totalCosts, annualBenefits) {
        let npv = -totalCosts; // Koszty początkowe
        
        for (let year = 1; year <= this.projectData.analysisYears; year++) {
            const netAnnualBenefit = annualBenefits - this.projectData.operationalCosts;
            const discountedBenefit = netAnnualBenefit / Math.pow(1 + this.projectData.discountRate, year);
            npv += discountedBenefit;
        }
        
        return npv;
    }
    
    calculatePaybackPeriod(totalCosts, annualBenefits) {
        const netAnnualBenefit = annualBenefits - this.projectData.operationalCosts;
        return totalCosts / netAnnualBenefit; // w latach
    }
    
    updateDisplay(results) {
        const updateElement = (id, value, formatter = null) => {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = formatter ? formatter(value) : value;
                this.animateValue(element, value);
            }
        };
        
        // Formatery
        const currencyFormatter = (value) => `${(value / 1000000).toFixed(2)}M PLN`;
        const percentFormatter = (value) => `${Math.round(value)}%`;
        const timeFormatter = (value) => value < 1 ? 
            `${Math.round(value * 12)} miesięcy` : 
            `${value.toFixed(1)} lat`;
        
        // Aktualizuj elementy
        updateElement('total-investment', results.totalCosts, currencyFormatter);
        updateElement('annual-benefits', results.annualBenefits, currencyFormatter);
        updateElement('roi-1-year', results.roi1Year, percentFormatter);
        updateElement('roi-3-years', results.roi3Years, percentFormatter);
        updateElement('roi-5-years', results.roi5Years, percentFormatter);
        updateElement('npv-value', results.npv, currencyFormatter);
        updateElement('payback-period', results.paybackPeriod, timeFormatter);
        
        // Kolorowanie na podstawie wartości
        this.applyConditionalFormatting(results);
    }
    
    applyConditionalFormatting(results) {
        const elements = {
            'roi-3-years': results.roi3Years,
            'npv-value': results.npv,
            'payback-period': results.paybackPeriod
        };
        
        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (!element) return;
            
            element.classList.remove('excellent', 'good', 'average', 'poor');
            
            if (id === 'roi-3-years') {
                if (value > 200) element.classList.add('excellent');
                else if (value > 150) element.classList.add('good');
                else if (value > 100) element.classList.add('average');
                else element.classList.add('poor');
            } else if (id === 'npv-value') {
                if (value > 2000000) element.classList.add('excellent');
                else if (value > 1000000) element.classList.add('good');
                else if (value > 0) element.classList.add('average');
                else element.classList.add('poor');
            } else if (id === 'payback-period') {
                if (value < 1.5) element.classList.add('excellent');
                else if (value < 2.5) element.classList.add('good');
                else if (value < 4) element.classList.add('average');
                else element.classList.add('poor');
            }
        });
    }
    
    animateValue(element, targetValue) {
        element.style.transform = 'scale(1.05)';
        element.style.transition = 'transform 0.2s ease';
        
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 200);
    }
    
    createCharts() {
        this.createCashFlowChart();
        this.createROIComparisonChart();
        this.createSensitivityChart();
        this.createRiskAssessmentChart();
    }
    
    createCashFlowChart() {
        const ctx = document.getElementById('cash-flow-chart');
        if (!ctx) return;
        
        const years = Array.from({length: 6}, (_, i) => `Rok ${i}`);
        const cumulativeCashFlow = this.calculateCumulativeCashFlow();
        
        this.cashFlowChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: years,
                datasets: [{
                    label: 'Skumulowany Cash Flow (PLN)',
                    data: cumulativeCashFlow,
                    borderColor: '#3498db',
                    backgroundColor: 'rgba(52, 152, 219, 0.1)',
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Próg rentowności',
                    data: new Array(6).fill(0),
                    borderColor: '#e74c3c',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        ticks: {
                            callback: function(value) {
                                return (value / 1000000).toFixed(1) + 'M PLN';
                            }
                        }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${(context.parsed.y / 1000000).toFixed(2)}M PLN`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    createROIComparisonChart() {
        const ctx = document.getElementById('roi-comparison-chart');
        if (!ctx) return;
        
        const scenarios = ['Pesymistyczny', 'Realistyczny', 'Optymistyczny'];
        const roiData = scenarios.map(scenario => {
            const scenarioKey = scenario.toLowerCase().includes('optym') ? 'optimistic' :
                               scenario.toLowerCase().includes('pesym') ? 'pessimistic' : 'realistic';
            return this.calculateScenarioROI(scenarioKey);
        });
        
        this.roiComparisonChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: scenarios,
                datasets: [{
                    label: 'ROI 3-letni (%)',
                    data: roiData,
                    backgroundColor: [
                        'rgba(231, 76, 60, 0.8)',
                        'rgba(52, 152, 219, 0.8)',
                        'rgba(39, 174, 96, 0.8)'
                    ],
                    borderColor: [
                        '#e74c3c',
                        '#3498db',
                        '#27ae60'
                    ],
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }
    
    createSensitivityChart() {
        const ctx = document.getElementById('sensitivity-chart');
        if (!ctx) return;
        
        const factors = ['Koszty licencji', 'Koszty wdrożenia', 'Oszczędności roczne', 'Wzrost przychodów'];
        const sensitivity = this.calculateSensitivity();
        
        this.sensitivityChart = new Chart(ctx, {
            type: 'horizontalBar',
            data: {
                labels: factors,
                datasets: [{
                    label: 'Wpływ na ROI (%)',
                    data: sensitivity,
                    backgroundColor: sensitivity.map(val => 
                        val > 0 ? 'rgba(39, 174, 96, 0.8)' : 'rgba(231, 76, 60, 0.8)'
                    )
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        beginAtZero: true
                    }
                }
            }
        });
    }
    
    createRiskAssessmentChart() {
        const ctx = document.getElementById('risk-assessment-chart');
        if (!ctx) return;
        
        const riskFactors = ['Ryzyko implementacji', 'Ryzyko adopcji', 'Ryzyko technologiczne', 'Ryzyko budżetowe'];
        const riskValues = [15, 10, 8, 12];
        
        this.riskChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: riskFactors,
                datasets: [{
                    label: 'Poziom ryzyka (%)',
                    data: riskValues,
                    borderColor: '#f39c12',
                    backgroundColor: 'rgba(243, 156, 18, 0.2)',
                    pointBackgroundColor: '#f39c12'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 25
                    }
                }
            }
        });
    }
    
    calculateCumulativeCashFlow() {
        const totalCosts = this.calculateTotalCosts();
        const benefitsData = this.calculateAnnualBenefits();
        const netAnnualBenefit = benefitsData.total - this.projectData.operationalCosts;
        
        const cashFlow = [-totalCosts]; // Rok 0
        
        for (let year = 1; year <= 5; year++) {
            const previousValue = cashFlow[year - 1];
            const inflationFactor = Math.pow(1 + this.projectData.inflationRate, year);
            const adjustedBenefit = netAnnualBenefit * inflationFactor;
            cashFlow.push(previousValue + adjustedBenefit);
        }
        
        return cashFlow;
    }
    
    calculateScenarioROI(scenarioKey) {
        const scenario = this.scenarios[scenarioKey];
        if (!scenario) return 0;
        
        const adjustedCosts = this.calculateTotalCosts() * scenario.costMultiplier;
        const benefitsData = this.calculateAnnualBenefits();
        const adjustedBenefits = benefitsData.total * scenario.benefitMultiplier;
        
        return this.calculateROIForPeriod(3, adjustedCosts, adjustedBenefits);
    }
    
    calculateSensitivity() {
        const totalCosts = this.calculateTotalCosts();
        const benefitsData = this.calculateAnnualBenefits();
        const baseROI = this.calculateROIForPeriod(3, totalCosts, benefitsData.total);
        
        // Symulacja 10% zmian w każdym czynniku
        const changePercent = 0.1;
        
        // === WPŁYW WZROSTU KOSZTÓW LICENCJI ===
        const originalLicense = this.projectData.licenseCosts;
        this.projectData.licenseCosts *= (1 + changePercent);
        const newCosts1 = this.calculateTotalCosts();
        const licenseCostImpact = this.calculateROIForPeriod(3, newCosts1, benefitsData.total) - baseROI;
        this.projectData.licenseCosts = originalLicense; // Przywróć
        
        // === WPŁYW WZROSTU KOSZTÓW WDROŻENIA ===
        const originalImpl = this.projectData.implementationCosts;
        this.projectData.implementationCosts *= (1 + changePercent);
        const newCosts2 = this.calculateTotalCosts();
        const implCostImpact = this.calculateROIForPeriod(3, newCosts2, benefitsData.total) - baseROI;
        this.projectData.implementationCosts = originalImpl; // Przywróć
        
        // === WPŁYW WZROSTU OSZCZĘDNOŚCI ===
        const originalSavings = this.projectData.annualSavings;
        this.projectData.annualSavings *= (1 + changePercent);
        const newBenefits1 = this.calculateAnnualBenefits();
        const savingsImpact = this.calculateROIForPeriod(3, totalCosts, newBenefits1.total) - baseROI;
        this.projectData.annualSavings = originalSavings; // Przywróć
        
        // === WPŁYW WZROSTU PRZYCHODÓW ===
        const originalRevenue = this.projectData.revenueIncrease;
        this.projectData.revenueIncrease *= (1 + changePercent);
        const newBenefits2 = this.calculateAnnualBenefits();
        const revenueImpact = this.calculateROIForPeriod(3, totalCosts, newBenefits2.total) - baseROI;
        this.projectData.revenueIncrease = originalRevenue; // Przywróć
        
        return [licenseCostImpact, implCostImpact, savingsImpact, revenueImpact];
    }
    
    updateCharts(data) {
        // Aktualizuj wykres cash flow
        if (this.cashFlowChart) {
            this.cashFlowChart.data.datasets[0].data = this.calculateCumulativeCashFlow();
            this.cashFlowChart.update();
        }
        
        // Aktualizuj wykres porównania ROI
        if (this.roiComparisonChart) {
            const scenarios = ['pessimistic', 'realistic', 'optimistic'];
            this.roiComparisonChart.data.datasets[0].data = scenarios.map(scenario => 
                this.calculateScenarioROI(scenario)
            );
            this.roiComparisonChart.update();
        }
        
        // Aktualizuj wykres wrażliwości
        if (this.sensitivityChart) {
            this.sensitivityChart.data.datasets[0].data = this.calculateSensitivity();
            this.sensitivityChart.update();
        }
    }
    
    loadScenario(scenarioKey) {
        const scenario = this.scenarios[scenarioKey];
        if (!scenario) return;
        
        // Aktualizuj dane projektu na podstawie scenariusza
        const baseLicenseCosts = 420000;
        const baseImplCosts = 380000;
        const baseSavings = 890000;
        
        this.projectData.licenseCosts = baseLicenseCosts * scenario.costMultiplier;
        this.projectData.implementationCosts = baseImplCosts * scenario.costMultiplier;
        this.projectData.annualSavings = baseSavings * scenario.benefitMultiplier;
        
        // Aktualizuj pola input (jeśli istnieją)
        const updateInput = (id, value) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        };
        
        updateInput('license-cost', this.projectData.licenseCosts);
        updateInput('implementation-cost', this.projectData.implementationCosts);
        updateInput('annual-savings', this.projectData.annualSavings);
        
        // Przelicz ROI
        this.calculateROI();
        
        // Pokaż notyfikację
        this.showNotification(`Załadowano scenariusz: ${scenarioKey}`, 'success');
    }
    
    runSensitivityAnalysis() {
        const sensitivity = this.calculateSensitivity();
        const factors = ['Koszty licencji', 'Koszty wdrożenia', 'Oszczędności roczne', 'Wzrost przychodów'];
        
        // Znajdź najbardziej istotny czynnik
        const maxImpactIndex = sensitivity.reduce((maxIdx, current, index, array) => {
            return Math.abs(current) > Math.abs(array[maxIdx]) ? index : maxIdx;
        }, 0);
        
        const mostSensitiveFactor = factors[maxImpactIndex];
        const impact = sensitivity[maxImpactIndex];
        
        // Pokaż wyniki analizy
        this.showSensitivityResults(mostSensitiveFactor, impact, sensitivity);
    }
    
    showSensitivityResults(factor, impact, allResults) {
        const resultsHtml = `
            <div class="sensitivity-results">
                <h3>Wyniki Analizy Wrażliwości</h3>
                <p><strong>Najbardziej wrażliwy czynnik:</strong> ${factor}</p>
                <p><strong>Wpływ 10% zmiany:</strong> ${impact.toFixed(1)}% zmiany ROI</p>
                <div class="all-factors">
                    <h4>Pełna analiza:</h4>
                    <ul>
                        ${['Koszty licencji', 'Koszty wdrożenia', 'Oszczędności roczne', 'Wzrost przychodów']
                          .map((f, i) => `<li>${f}: ${allResults[i].toFixed(1)}% wpływu na ROI</li>`)
                          .join('')}
                    </ul>
                </div>
            </div>
        `;
        
        this.showModal('Analiza Wrażliwości', resultsHtml);
    }
    
    exportData() {
        const results = {
            timestamp: new Date().toISOString(),
            projectData: this.projectData,
            calculations: {
                totalCosts: this.projectData.licenseCosts + this.projectData.implementationCosts + 
                           this.projectData.infrastructureCosts + this.projectData.trainingCosts,
                annualBenefits: this.calculateAnnualBenefits(),
                roi3Years: this.calculateROIForPeriod(3, 
                    this.projectData.licenseCosts + this.projectData.implementationCosts + 
                    this.projectData.infrastructureCosts + this.projectData.trainingCosts,
                    this.calculateAnnualBenefits()),
                npv: this.calculateNPV(
                    this.projectData.licenseCosts + this.projectData.implementationCosts + 
                    this.projectData.infrastructureCosts + this.projectData.trainingCosts,
                    this.calculateAnnualBenefits()),
                paybackPeriod: this.calculatePaybackPeriod(
                    this.projectData.licenseCosts + this.projectData.implementationCosts + 
                    this.projectData.infrastructureCosts + this.projectData.trainingCosts,
                    this.calculateAnnualBenefits())
            },
            scenarios: Object.keys(this.scenarios).map(key => ({
                name: key,
                roi: this.calculateScenarioROI(key)
            }))
        };
        
        // Symulacja eksportu
        const dataStr = JSON.stringify(results, null, 2);
        console.log('Eksportowane dane ROI:', results);
        
        this.showNotification('Dane ROI wyeksportowane do konsoli', 'success');
        
        // W prawdziwej aplikacji można by użyć:
        // const blob = new Blob([dataStr], {type: 'application/json'});
        // const url = URL.createObjectURL(blob);
        // const a = document.createElement('a');
        // a.href = url;
        // a.download = 'roi-analysis.json';
        // a.click();
    }
    
    startRealTimeUpdates() {
        // Symulacja aktualizacji danych w czasie rzeczywistym
        setInterval(() => {
            // Małe wahania w danych (±2%)
            const variance = 0.02;
            
            // Aktualizacja kosztów operacyjnych
            this.projectData.operationalCosts *= (1 + (Math.random() - 0.5) * variance);
            
            // Aktualizacja oszczędności
            this.projectData.annualSavings *= (1 + (Math.random() - 0.5) * variance);
            
            // Przelicz ROI (bez aktualizacji inputów)
            this.calculateROI();
            
        }, 30000); // Co 30 sekund
    }
    
    showNotification(message, type = 'info') {
        // Prosta notyfikacja
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            z-index: 1000;
            font-weight: 500;
            background: ${type === 'success' ? '#27ae60' : type === 'warning' ? '#f39c12' : '#3498db'};
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    showModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'roi-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="modal-close">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
        `;
        
        modal.querySelector('.modal-content').style.cssText = `
            background: white;
            border-radius: 10px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            padding: 0;
        `;
        
        modal.querySelector('.modal-header').style.cssText = `
            padding: 20px;
            border-bottom: 1px solid #ecf0f1;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        modal.querySelector('.modal-body').style.cssText = `
            padding: 20px;
        `;
        
        modal.querySelector('.modal-close').style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #7f8c8d;
        `;
        
        modal.querySelector('.modal-close').addEventListener('click', () => {
            modal.remove();
        });
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
        
        document.body.appendChild(modal);
    }
}

// Auto-inicjalizacja jeśli DOM jest gotowy
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('roi-module') || document.querySelector('.roi-calculator')) {
        window.roiCalculator = new ROICalculator();
        console.log('✅ ROI Calculator zainicjalizowany');
    }
});

// Eksport dla innych modułów
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ROICalculator;
}
