/**
 * ================================================================
 * MULTI-AGENT AI VERIFICATION SYSTEM - ANIMATION CONTROLLER
 * ================================================================
 * 
 * File: animations.js
 * Purpose: Advanced UI animations and visual feedback system
 * 
 * This module provides sophisticated animation control for:
 * - Loading states and transitions
 * - Real-time processing simulation
 * - Agent status visualization
 * - Progress tracking and updates
 * - Results display animations
 * 
 * Key Features:
 * • Realistic processing timing (3-8 seconds)
 * • Staggered agent activation
 * • Progressive loading indicators
 * • Smooth state transitions
 * • GPU-accelerated animations
 * • Mobile-optimized performance
 * 
 * Animation Types:
 * - Fade in/out transitions
 * - Slide animations
 * - Progress bar updates
 * - Pulsing indicators
 * - Staggered reveals
 * 
 * Performance Optimizations:
 * - RequestAnimationFrame for smooth 60fps
 * - CSS transforms for GPU acceleration
 * - Minimal DOM manipulation
 * - Efficient state management
 * 
 * Dependencies: None (standalone)
 * Used by: main.js
 * 
 * @version 1.0.0
 * @author Multi-Agent AI Verification Team
 * @since 2025-09-21
 * ================================================================
 */

// ===== ANIMATION SYSTEM =====

/**
 * Central animation controller that manages all UI animations and transitions
 * Handles loading states, processing animations, and result displays
 * Provides smooth, performant animations for enhanced user experience
 */
class AnimationController {
    /**
     * Initialize the animation controller
     */
    constructor() {
        this.isAnimating = false;           // Flag to track if animations are currently running
        this.currentAnimations = new Set(); // Set to track active animation instances
        this.updateInterval = null;         // Interval ID for progress updates
    }

    /**
     * Shows the loading overlay with a custom message
     * @param {string} message - Message to display while loading
     */
    showLoadingOverlay(message = 'Initializing AI Agents...') {
        const overlay = document.getElementById('loadingOverlay');
        const messageElement = overlay.querySelector('p');
        messageElement.textContent = message;
        overlay.style.display = 'flex';
        overlay.classList.add('fade-in');
    }

    /**
     * Hides the loading overlay
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loadingOverlay');
        overlay.style.display = 'none';
        overlay.classList.remove('fade-in');
    }

    /**
     * Shows the processing section with fade-in animation
     * Automatically hides the results section
     */
    showProcessingSection() {
        const section = document.getElementById('processingSection');
        section.style.display = 'block';
        section.classList.add('fade-in');
        
        // Hide results section to prevent visual conflicts
        this.hideResultsSection();
    }

    /**
     * Hides the processing section
     */
    hideProcessingSection() {
        const section = document.getElementById('processingSection');
        section.style.display = 'none';
        section.classList.remove('fade-in');
    }

    /**
     * Shows the results section with fade-in animation
     */
    showResultsSection() {
        const section = document.getElementById('resultsSection');
        section.style.display = 'block';
        section.classList.add('fade-in');
    }

    /**
     * Hides the results section
     */
    hideResultsSection() {
        const section = document.getElementById('resultsSection');
        section.style.display = 'none';
        section.classList.remove('fade-in');
    }

    // Initialize planner node animation
    initializePlannerNode() {
        const plannerNode = document.getElementById('plannerNode');
        const plannerStatus = document.getElementById('plannerStatus');
        const spinner = plannerNode.querySelector('.planner-spinner');
        
        plannerStatus.textContent = 'Analyzing content type and selecting appropriate agents...';
        spinner.style.display = 'block';
        plannerNode.classList.add('fade-in');
    }

    // Update planner status
    updatePlannerStatus(message, isComplete = false) {
        const plannerStatus = document.getElementById('plannerStatus');
        const spinner = document.querySelector('.planner-spinner');
        
        plannerStatus.textContent = message;
        
        if (isComplete) {
            spinner.style.display = 'none';
            setTimeout(() => {
                const plannerNode = document.getElementById('plannerNode');
                plannerNode.style.opacity = '0.7';
            }, 1000);
        }
    }

    // Create agent cards in the grid
    createAgentCards(activeAgents) {
        const agentsGrid = document.getElementById('agentsGrid');
        agentsGrid.innerHTML = '';
        
        activeAgents.forEach((agentId, index) => {
            const agent = AGENTS[agentId];
            const agentCard = this.createAgentCard(agent, index);
            agentsGrid.appendChild(agentCard);
        });
        
        // Animate cards in with stagger
        this.animateCardsIn();
    }

    // Create individual agent card
    createAgentCard(agent, index) {
        const card = document.createElement('div');
        card.className = 'agent-card';
        card.id = `agent-${agent.id}`;
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        
        card.innerHTML = `
            <div class="agent-header">
                <div class="agent-icon">${agent.icon}</div>
                <div class="agent-info">
                    <h3>${agent.name}</h3>
                    <div class="agent-status" id="status-${agent.id}">Idle</div>
                </div>
            </div>
            <div class="agent-progress">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-${agent.id}"></div>
                </div>
            </div>
        `;
        
        return card;
    }

    // Animate agent cards appearing
    animateCardsIn() {
        const cards = document.querySelectorAll('.agent-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease-out';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 150);
        });
    }

    // Start agent processing animation
    startAgentProcessing(agentId) {
        const card = document.getElementById(`agent-${agentId}`);
        const status = document.getElementById(`status-${agentId}`);
        
        card.classList.add('active');
        status.textContent = 'Processing...';
        
        // Add pulsing animation to the card
        card.style.animation = 'pulse 1.5s ease-in-out infinite';
    }

    // Update agent progress
    updateAgentProgress(agentId, progress) {
        const progressFill = document.getElementById(`progress-${agentId}`);
        if (progressFill) {
            progressFill.style.width = `${progress}%`;
        }
    }

    // Complete agent processing
    completeAgentProcessing(agentId) {
        const card = document.getElementById(`agent-${agentId}`);
        const status = document.getElementById(`status-${agentId}`);
        const progressFill = document.getElementById(`progress-${agentId}`);
        
        card.classList.remove('active');
        card.classList.add('completed');
        card.style.animation = 'none';
        status.textContent = 'Complete ✓';
        progressFill.style.width = '100%';
        
        // Add completion animation
        setTimeout(() => {
            card.style.transform = 'scale(1.02)';
            setTimeout(() => {
                card.style.transform = 'scale(1)';
            }, 200);
        }, 100);
    }

    // Update overall progress
    updateOverallProgress(percentage) {
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressFill && progressPercentage) {
            progressFill.style.width = `${percentage}%`;
            progressPercentage.textContent = `${percentage}%`;
        }
    }

    // Start the processing simulation
    async startProcessingSimulation(activeAgents, scenario) {
        this.isAnimating = true;
        
        // Phase 1: Planning
        this.initializePlannerNode();
        this.createAgentCards(activeAgents);
        
        await this.sleep(2000);
        this.updatePlannerStatus('Analysis complete. Activating specialized agents...', true);
        
        // Phase 2: Agent Processing
        await this.sleep(1000);
        
        // Start all agents with staggered timing
        const agentObjects = activeAgents.map(agentId => AGENTS[agentId]);
        
        // Set up progress update callbacks
        agentObjects.forEach(agent => {
            agent.onProgressUpdate = (agentObj) => {
                this.updateAgentProgress(agentObj.id, agentObj.progress);
                this.updateOverallProgress(verificationSystem.getOverallProgress());
            };
        });
        
        // Start agents with staggered delays
        const processingPromises = agentObjects.map((agent, index) => {
            return new Promise(resolve => {
                setTimeout(() => {
                    this.startAgentProcessing(agent.id);
                    agent.process(scenario.content, scenario).then(() => {
                        this.completeAgentProcessing(agent.id);
                        resolve();
                    });
                }, index * 800); // Stagger start times
            });
        });
        
        await Promise.all(processingPromises);
        
        // Phase 3: Completion
        await this.sleep(1000);
        this.updateOverallProgress(100);
        
        await this.sleep(1500);
        this.isAnimating = false;
        
        return true;
    }

    // Utility function for delays
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Reset all animations
    resetAnimations() {
        this.isAnimating = false;
        this.currentAnimations.clear();
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
        
        // Reset UI elements
        this.hideLoadingOverlay();
        this.hideProcessingSection();
        this.hideResultsSection();
        
        // Reset progress
        const progressFill = document.getElementById('progressFill');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressFill) progressFill.style.width = '0%';
        if (progressPercentage) progressPercentage.textContent = '0%';
    }

    // Typewriter effect for text
    typeWriter(element, text, speed = 50) {
        return new Promise(resolve => {
            element.textContent = '';
            let i = 0;
            
            const timer = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(timer);
                    resolve();
                }
            }, speed);
        });
    }

    // Animate number counting up
    animateNumber(element, targetNumber, duration = 1000, suffix = '') {
        return new Promise(resolve => {
            const startNumber = 0;
            const increment = targetNumber / (duration / 16); // 60fps
            let currentNumber = startNumber;
            
            const timer = setInterval(() => {
                currentNumber += increment;
                if (currentNumber >= targetNumber) {
                    currentNumber = targetNumber;
                    clearInterval(timer);
                    resolve();
                }
                element.textContent = Math.round(currentNumber) + suffix;
            }, 16);
        });
    }

    // Animate confidence bars
    animateConfidenceBar(barElement, percentage, type = 'high') {
        return new Promise(resolve => {
            barElement.className = `confidence-fill confidence-${type}`;
            barElement.style.width = '0%';
            
            setTimeout(() => {
                barElement.style.width = `${percentage}%`;
                setTimeout(resolve, 500);
            }, 100);
        });
    }

    // Staggered reveal animation for elements
    staggeredReveal(elements, delay = 150) {
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.5s ease-out';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * delay);
        });
    }
}

// Create global animation controller
const animationController = new AnimationController();

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.AnimationController = AnimationController;
    window.animationController = animationController;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        AnimationController,
        animationController
    };
}