/**
 * ================================================================
 * MULTI-AGENT AI VERIFICATION SYSTEM - MAIN APPLICATION
 * ================================================================
 * 
 * File: main.js
 * Purpose: Primary application controller and user interaction handler
 * 
 * This is the main orchestrator that coordinates all system components:
 * - User interface event handling
 * - Application state management
 * - Workflow coordination between modules
 * - Error handling and user feedback
 * 
 * Core Responsibilities:
 * • Process user input and demo scenarios
 * • Coordinate with verification system
 * • Manage UI state transitions
 * • Handle processing animations
 * • Display verification results
 * • Provide keyboard shortcuts
 * • Export functionality (bonus feature)
 * 
 * User Interaction Flow:
 * 1. Content Input (manual or demo)
 * 2. Agent Selection & Activation
 * 3. Processing Animation (3-8s)
 * 4. Results Display with Evidence
 * 5. Reset/Clear for Next Analysis
 * 
 * Keyboard Shortcuts:
 * • Ctrl+Enter: Analyze content
 * • Ctrl+R: Reset application
 * • Ctrl+S: Export results (future)
 * 
 * Error Handling:
 * - Graceful failure recovery
 * - User-friendly error messages
 * - Debug logging for development
 * 
 * Dependencies: agents.js, scenarios.js, animations.js
 * Entry Point: DOMContentLoaded event
 * 
 * @version 1.0.0
 * @author Multi-Agent AI Verification Team
 * @since 2025-09-21
 * ================================================================
 */

// ===== MAIN APPLICATION =====

/**
 * Main application class that orchestrates the entire verification system
 * Handles user interactions, coordinates with agents, and manages UI state
 * Serves as the primary controller for the multi-agent verification workflow
 */
class VerificationApp {
    /**
     * Initialize the application
     */
    constructor() {
        this.isProcessing = false;     // Flag to prevent concurrent processing
        this.currentContent = '';      // Store the currently analyzed content
        this.currentScenario = null;   // Store the current scenario being processed
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and initial state
     */
    init() {
        this.bindEventListeners();
        this.setupInitialState();
        console.log('🛡️ Multi-Agent AI Verification System Initialized');
    }

    /**
     * Set up all event listeners for user interactions
     * Includes button clicks, keyboard shortcuts, and form submissions
     */
    bindEventListeners() {
        // Main action buttons
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const contentInput = document.getElementById('contentInput');

        analyzeBtn.addEventListener('click', () => this.handleAnalyzeClick());
        clearBtn.addEventListener('click', () => this.handleClearClick());
        
        // Keyboard shortcut: Ctrl+Enter to analyze content
        contentInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && e.ctrlKey) {
                this.handleAnalyzeClick();
            }
        });

        // Demo scenario buttons - bind click handlers to load predefined scenarios
        const demoButtons = document.querySelectorAll('.demo-btn');
        demoButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const scenarioId = e.currentTarget.dataset.scenario;
                this.loadDemoScenario(scenarioId);
            });
        });
    }

    /**
     * Set up the initial application state
     * Hides processing/results sections and resets the verification system
     */
    setupInitialState() {
        // Hide processing and results sections initially
        animationController.hideProcessingSection();
        animationController.hideResultsSection();
        
        // Reset verification system to clean state
        verificationSystem.reset();
    }

    async handleAnalyzeClick() {
        if (this.isProcessing) return;

        const contentInput = document.getElementById('contentInput');
        const content = contentInput.value.trim();

        if (!content) {
            this.showError('Please enter content to analyze');
            return;
        }

        await this.analyzeContent(content);
    }

    handleClearClick() {
        if (this.isProcessing) return;

        // Clear input
        document.getElementById('contentInput').value = '';
        
        // Reset state
        this.resetApplication();
    }

    async loadDemoScenario(scenarioId) {
        if (this.isProcessing) return;

        const scenario = ScenarioManager.getScenario(scenarioId);
        if (!scenario) {
            this.showError('Scenario not found');
            return;
        }

        // Load content into textarea
        document.getElementById('contentInput').value = scenario.content;
        this.currentContent = scenario.content;

        // Analyze the scenario
        await this.analyzeContent(scenario.content, scenario);
    }

    async analyzeContent(content, predefinedScenario = null) {
        try {
            this.isProcessing = true;
            this.currentContent = content;
            
            // Update UI state
            this.setButtonsDisabled(true);
            
            // Show loading overlay briefly
            animationController.showLoadingOverlay('Initializing AI Agents...');
            await animationController.sleep(1000);
            animationController.hideLoadingOverlay();

            // Show processing section
            animationController.showProcessingSection();

            // Determine scenario
            let scenario;
            if (predefinedScenario) {
                scenario = predefinedScenario;
            } else {
                // For custom content, create a basic scenario and then enhance it
                scenario = ScenarioManager.createCustomScenario(content);
            }

            this.currentScenario = scenario;

            // Start processing simulation
            await animationController.startProcessingSimulation(scenario.activeAgents, scenario);

            // If this is custom content, generate fallback analysis
            if (!predefinedScenario) {
                scenario = ScenarioManager.generateFallbackAnalysis(content);
                this.currentScenario = scenario;
            }

            // Run verification system (this updates agent states)
            await verificationSystem.analyzeContent(content, scenario);

            // Display results
            this.displayResults(scenario);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError('An error occurred during analysis. Please try again.');
        } finally {
            this.isProcessing = false;
            this.setButtonsDisabled(false);
        }
    }

    displayResults(scenario) {
        try {
            // Hide processing section
            animationController.hideProcessingSection();

            // Create and display results
            this.createOverallVerdict(scenario);
            this.createAgentResults(scenario);
            this.createProcessingSummary(scenario);

            // Show results section with animation
            animationController.showResultsSection();

            // Add staggered animations to result elements
            setTimeout(() => {
                const resultElements = document.querySelectorAll('.agent-result');
                animationController.staggeredReveal(resultElements);
            }, 300);

        } catch (error) {
            console.error('Error displaying results:', error);
            this.showError('Error displaying results');
        }
    }

    createOverallVerdict(scenario) {
        const verdictContainer = document.getElementById('overallVerdict');
        
        verdictContainer.innerHTML = `
            <div class="verdict-badge verdict-${scenario.verdictType}">
                ${scenario.verdict}
            </div>
            <div class="verdict-summary">
                ${scenario.summary}
            </div>
            <div class="verdict-recommendation">
                <strong>Recommendation:</strong> ${scenario.recommendation}
            </div>
        `;
    }

    createAgentResults(scenario) {
        const resultsContainer = document.getElementById('agentResults');
        resultsContainer.innerHTML = '';

        scenario.activeAgents.forEach(agentId => {
            const agent = AGENTS[agentId];
            const result = scenario.agentResults[agentId];
            
            if (!result) return;

            const resultElement = this.createAgentResultElement(agent, result);
            resultsContainer.appendChild(resultElement);
        });
    }

    createAgentResultElement(agent, result) {
        const resultDiv = document.createElement('div');
        resultDiv.className = 'agent-result';
        
        // Determine confidence level class
        let confidenceClass = 'confidence-high';
        if (result.confidence < 70) confidenceClass = 'confidence-low';
        else if (result.confidence < 85) confidenceClass = 'confidence-medium';

        // Determine result badge class
        let badgeClass = 'result-verified';
        const verdict = result.verdict.toLowerCase();
        if (verdict.includes('false') || verdict.includes('malicious') || verdict.includes('scam')) {
            badgeClass = 'result-false';
        } else if (verdict.includes('suspicious') || verdict.includes('unverified')) {
            badgeClass = 'result-suspicious';
        }

        resultDiv.innerHTML = `
            <div class="agent-result-header">
                <div class="agent-result-title">
                    <span class="agent-icon">${agent.icon}</span>
                    <span>${agent.name}</span>
                </div>
                <span class="result-badge ${badgeClass}">${result.verdict}</span>
            </div>
            <div class="agent-result-content">
                <div class="confidence-level">
                    <div class="confidence-label">
                        <span>Confidence Level</span>
                        <span>${result.confidence}%</span>
                    </div>
                    <div class="confidence-bar">
                        <div class="confidence-fill ${confidenceClass}" style="width: ${result.confidence}%"></div>
                    </div>
                </div>
                
                <div class="evidence-list">
                    <h4>Evidence:</h4>
                    <ul>
                        ${result.evidence.map(item => `<li>${item}</li>`).join('')}
                    </ul>
                </div>
                
                <div class="sources-section">
                    <strong>Sources:</strong>
                    <div class="sources-list">
                        ${result.sources.map(source => `<span class="source-tag">${source}</span>`).join('')}
                    </div>
                </div>
            </div>
        `;

        // Animate confidence bar after element is added to DOM
        setTimeout(() => {
            const confidenceBar = resultDiv.querySelector('.confidence-fill');
            animationController.animateConfidenceBar(confidenceBar, result.confidence, confidenceClass.split('-')[1]);
        }, 100);

        return resultDiv;
    }

    createProcessingSummary(scenario) {
        const summaryContainer = document.getElementById('processingSummary');
        
        const processingTime = verificationSystem.getProcessingTime();
        const agentCount = scenario.activeAgents.length;
        const overallConfidence = Math.round(
            scenario.activeAgents.reduce((sum, agentId) => {
                return sum + (scenario.agentResults[agentId]?.confidence || 0);
            }, 0) / agentCount
        );

        summaryContainer.innerHTML = `
            <div class="summary-grid">
                <div class="summary-item">
                    <span class="summary-value">${processingTime}s</span>
                    <span class="summary-label">Processing Time</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${agentCount}</span>
                    <span class="summary-label">Agents Used</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${overallConfidence}%</span>
                    <span class="summary-label">Avg. Confidence</span>
                </div>
                <div class="summary-item">
                    <span class="summary-value">${scenario.verdict}</span>
                    <span class="summary-label">Final Verdict</span>
                </div>
            </div>
        `;

        // Animate the summary numbers
        setTimeout(() => {
            const valueElements = summaryContainer.querySelectorAll('.summary-value');
            valueElements.forEach((element, index) => {
                setTimeout(() => {
                    element.style.transform = 'scale(1.2)';
                    setTimeout(() => {
                        element.style.transform = 'scale(1)';
                    }, 200);
                }, index * 100);
            });
        }, 500);
    }

    setButtonsDisabled(disabled) {
        const analyzeBtn = document.getElementById('analyzeBtn');
        const clearBtn = document.getElementById('clearBtn');
        const demoButtons = document.querySelectorAll('.demo-btn');

        analyzeBtn.disabled = disabled;
        clearBtn.disabled = disabled;
        
        demoButtons.forEach(btn => {
            btn.disabled = disabled;
        });

        // Update button text
        if (disabled) {
            analyzeBtn.innerHTML = '<span class="btn-icon">⏳</span>Processing...';
        } else {
            analyzeBtn.innerHTML = '<span class="btn-icon">🔍</span>Analyze Content';
        }
    }

    resetApplication() {
        // Reset verification system
        verificationSystem.reset();
        
        // Reset animations
        animationController.resetAnimations();
        
        // Reset state
        this.isProcessing = false;
        this.currentContent = '';
        this.currentScenario = null;
        
        // Re-enable buttons
        this.setButtonsDisabled(false);
        
        console.log('Application reset');
    }

    showError(message) {
        // Simple error display - could be enhanced with a proper modal
        alert(`Error: ${message}`);
        console.error('Application Error:', message);
    }

    // Export functionality (bonus feature)
    exportResults(format = 'json') {
        if (!this.currentScenario) {
            this.showError('No results to export');
            return;
        }

        const data = {
            timestamp: new Date().toISOString(),
            content: this.currentContent,
            scenario: this.currentScenario,
            processingTime: verificationSystem.getProcessingTime(),
            systemVersion: '1.0.0'
        };

        if (format === 'json') {
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            this.downloadFile(blob, 'verification-results.json');
        }
    }

    downloadFile(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // Keyboard shortcuts (bonus feature)
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'Enter':
                        e.preventDefault();
                        this.handleAnalyzeClick();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetApplication();
                        break;
                    case 's':
                        e.preventDefault();
                        this.exportResults();
                        break;
                }
            }
        });
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.verificationApp = new VerificationApp();
    
    // Setup keyboard shortcuts
    verificationApp.setupKeyboardShortcuts();
    
    console.log('🚀 Multi-Agent AI Verification System Ready');
    console.log('Keyboard shortcuts:');
    console.log('  Ctrl+Enter: Analyze content');
    console.log('  Ctrl+R: Reset application');
    console.log('  Ctrl+S: Export results');
});

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        // Pause animations if page is hidden
        if (animationController.isAnimating) {
            console.log('Page hidden, pausing animations');
        }
    } else {
        // Resume animations if page is visible
        console.log('Page visible, resuming normal operation');
    }
});

// Error handling for unhandled promises
window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    event.preventDefault();
});

// Export for potential use in other contexts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VerificationApp
    };
}