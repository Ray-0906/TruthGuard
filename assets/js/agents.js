/**
 * ================================================================
 * MULTI-AGENT AI VERIFICATION SYSTEM - AGENT FOUNDATION
 * ================================================================
 * 
 * File: agents.js
 * Purpose: Core agent system implementation and intelligent agent selection
 * 
 * This module defines the foundation of the multi-agent verification system:
 * - VerificationAgent class: Individual AI agent representation
 * - AGENTS configuration: 6 specialized verification agents
 * - AgentSelector: Intelligent content-based agent selection
 * - VerificationSystem: Central coordination and state management
 * 
 * Key Components:
 * • 📰 News Verification Agent (3.5s processing)
 * • 📚 Fact Verification Agent (4.2s processing)
 * • ⚠️  Scam Detection Agent (2.8s processing)
 * • 🔗 Phishing Link Detector (3.1s processing)
 * • 🖼️ Image Forgery Detector (5.5s processing)
 * • 📹 Video Forgery Detector (6.8s processing)
 * 
 * Architecture:
 * Content Input → Agent Selection → Parallel Processing → Result Aggregation
 * 
 * Dependencies: None (standalone module)
 * Used by: main.js, animations.js
 * 
 * @version 1.0.0
 * @author Multi-Agent AI Verification Team
 * @since 2025-09-21
 * ================================================================
 */

// ===== AGENT SYSTEM FOUNDATION =====

/**
 * Represents a specialized AI verification agent that can analyze specific types of content
 * Each agent has unique capabilities and processing characteristics
 */
class VerificationAgent {
    /**
     * Creates a new verification agent
     * @param {string} id - Unique identifier for the agent
     * @param {string} name - Human-readable name for the agent
     * @param {string} icon - Emoji icon representing the agent
     * @param {string} description - Brief description of agent capabilities
     * @param {Array<string>} capabilities - List of agent's analytical capabilities
     * @param {number} processingTime - Simulated processing time in milliseconds
     */
    constructor(id, name, icon, description, capabilities, processingTime) {
        this.id = id;
        this.name = name;
        this.icon = icon;
        this.description = description;
        this.capabilities = capabilities;
        this.processingTime = processingTime; // in milliseconds
        this.status = 'idle'; // idle, processing, completed, error
        this.progress = 0;
        this.result = null;
    }

    /**
     * Simulates the agent's content analysis process
     * Updates progress incrementally and returns verification results
     * @param {string} content - The content to be analyzed
     * @param {Object} scenario - The scenario object containing expected results
     * @returns {Promise<Object>} The verification result from this agent
     */
    async process(content, scenario) {
        this.status = 'processing';
        this.progress = 0;
        
        // Simulate progressive processing with realistic timing
        const steps = 10;
        const stepTime = this.processingTime / steps;
        
        for (let i = 0; i <= steps; i++) {
            this.progress = (i / steps) * 100;
            await new Promise(resolve => setTimeout(resolve, stepTime));
            
            // Update UI if callback exists (set by animation controller)
            if (this.onProgressUpdate) {
                this.onProgressUpdate(this);
            }
        }
        
        this.status = 'completed';
        this.result = scenario.agentResults[this.id];
        return this.result;
    }

    /**
     * Resets the agent to its initial idle state
     * Clears progress and any previous results
     */
    reset() {
        this.status = 'idle';
        this.progress = 0;
        this.result = null;
    }
}

/**
 * Configuration object containing all 6 specialized verification agents
 * Each agent is pre-configured with specific capabilities and processing times
 * 
 * Agent Processing Times (realistic simulation):
 * - News: 3.5s (fast fact-checking against news databases)
 * - Fact: 4.2s (thorough scientific/academic verification)
 * - Scam: 2.8s (quick pattern matching for fraud detection)
 * - Phishing: 3.1s (URL and domain analysis)
 * - Image: 5.5s (complex image processing and metadata analysis)
 * - Video: 6.8s (most intensive - deepfake detection and frame analysis)
 */
const AGENTS = {
    news: new VerificationAgent(
        'news',
        'News Verification Agent',
        '📰',
        'Validates news claims against credible sources',
        ['fact-checking', 'source-verification', 'news-analysis'],
        3500 // 3.5 seconds - Optimized for quick news database lookups
    ),
    
    fact: new VerificationAgent(
        'fact',
        'Fact Verification Agent',
        '📚',
        'Checks scientific and historical facts',
        ['scientific-analysis', 'historical-verification', 'data-validation'],
        4200 // 4.2 seconds - Thorough academic and scientific database searches
    ),
    
    scam: new VerificationAgent(
        'scam',
        'Scam Detection Agent',
        '⚠️',
        'Identifies fraud patterns and suspicious content',
        ['fraud-detection', 'pattern-analysis', 'risk-assessment'],
        2800 // 2.8 seconds - Fast pattern matching against known scam databases
    ),
    
    phishing: new VerificationAgent(
        'phishing',
        'Phishing Link Detector',
        '🔗',
        'Analyzes URLs and links for threats',
        ['url-analysis', 'domain-verification', 'threat-detection'],
        3100 // 3.1 seconds - Domain lookup and threat database checking
    ),
    
    image: new VerificationAgent(
        'image',
        'Image Forgery Detector',
        '🖼️',
        'Detects manipulated and synthetic images',
        ['image-analysis', 'metadata-extraction', 'forgery-detection'],
        5500 // 5.5 seconds - Complex image processing and AI detection algorithms
    ),
    
    video: new VerificationAgent(
        'video',
        'Video Forgery Detector',
        '📹',
        'Identifies deepfakes and video manipulation',
        ['deepfake-detection', 'video-analysis', 'temporal-consistency'],
        6800 // 6.8 seconds - Most intensive processing for frame-by-frame analysis
    )
};

/**
 * Intelligent agent selection system that determines which agents should analyze content
 * Uses keyword triggers and content analysis to activate relevant verification agents
 */
class AgentSelector {
    /**
     * Analyzes content and determines which agents should be activated
     * Uses keyword matching and content patterns to make intelligent selections
     * @param {string} content - The content to analyze for agent selection
     * @returns {Array<string>} Array of agent IDs that should process this content
     */
    static determineActiveAgents(content) {
        const activeAgents = [];
        const contentLower = content.toLowerCase();
        
        // Keyword triggers that activate specific agents
        // These patterns are based on common content types and threat indicators
        const triggers = {
            news: ['news', 'breaking', 'report', 'journalist', 'media', 'press', 'headline', 'story'],
            fact: ['research', 'study', 'scientist', 'professor', 'university', 'published', 'data', 'statistics', 'percent', '%', 'climate', 'medical', 'health'],
            scam: ['winner', 'lottery', 'prize', 'money', 'fee', 'transfer', 'bank', 'account', 'urgent', 'limited time', 'congratulations', 'claim', 'inheritance'],
            phishing: ['click', 'link', 'http', 'www', 'login', 'password', 'secure', 'verify', 'account', 'suspended', 'expired'],
            image: ['image', 'photo', 'picture', 'edited', 'photoshop', 'fake photo', 'manipulated'],
            video: ['video', 'footage', 'clip', 'deepfake', 'recorded', 'filmed']
        };
        
        // Special case: URLs always trigger phishing detection
        if (contentLower.match(/https?:\/\/[^\s]+/)) {
            activeAgents.push('phishing');
        }
        
        // Check content against keyword triggers for each agent type
        for (const [agentId, keywords] of Object.entries(triggers)) {
            if (keywords.some(keyword => contentLower.includes(keyword))) {
                if (!activeAgents.includes(agentId)) {
                    activeAgents.push(agentId);
                }
            }
        }
        
        // Fallback: if no specific triggers found, use general-purpose agents
        if (activeAgents.length === 0) {
            activeAgents.push('news', 'fact');
        }
        
        // Optimize for UX: limit to 4 agents maximum for reasonable processing time
        if (activeAgents.length > 4) {
            return activeAgents.slice(0, 4);
        }
        
        return activeAgents;
    }
}

/**
 * Central verification system that coordinates all agents and manages application state
 * Handles the complete verification workflow from content input to results display
 */
class VerificationSystem {
    /**
     * Initialize the verification system with default state
     */
    constructor() {
        this.currentScenario = null;      // Currently active scenario being processed
        this.activeAgents = [];           // List of agent IDs currently processing content
        this.processingState = 'idle';    // Current system state: idle, planning, processing, completed
        this.startTime = null;            // Processing start timestamp
        this.endTime = null;              // Processing completion timestamp
    }

    /**
     * Resets the system to initial state
     * Clears all agents and processing state
     */
    reset() {
        // Reset all agents to idle state
        Object.values(AGENTS).forEach(agent => agent.reset());
        
        // Clear system state
        this.currentScenario = null;
        this.activeAgents = [];
        this.processingState = 'idle';
        this.startTime = null;
        this.endTime = null;
    }

    /**
     * Main content analysis workflow
     * Coordinates agent selection, processing simulation, and result generation
     * @param {string} content - Content to be verified
     * @param {Object|null} scenario - Predefined scenario or null for custom analysis
     * @returns {Promise<Object>} Complete verification results
     */
    async analyzeContent(content, scenario = null) {
        this.reset();
        this.startTime = Date.now();
        this.processingState = 'planning';
        
        // Phase 1: Agent Selection
        if (scenario) {
            // Use predefined scenario configuration
            this.activeAgents = scenario.activeAgents;
            this.currentScenario = scenario;
        } else {
            // Intelligent agent selection for custom content
            this.activeAgents = AgentSelector.determineActiveAgents(content);
            // Create basic scenario structure for custom analysis
            this.currentScenario = {
                content: content,
                activeAgents: this.activeAgents,
                verdict: 'ANALYZING...',
                confidence: 0,
                agentResults: {}
            };
        }
        
        // Phase 2: Planning Simulation (realistic delay for content analysis)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Phase 3: Agent Processing
        this.processingState = 'processing';
        
        // Execute all active agents in parallel (realistic concurrent processing)
        const processingPromises = this.activeAgents.map(agentId => {
            const agent = AGENTS[agentId];
            return agent.process(content, this.currentScenario);
        });
        
        await Promise.all(processingPromises);
        
        // Phase 4: Completion
        this.processingState = 'completed';
        this.endTime = Date.now();
        
        return this.currentScenario;
    }

    /**
     * Calculates total processing time in seconds
     * @returns {string} Processing time formatted to 1 decimal place
     */
    getProcessingTime() {
        if (this.startTime && this.endTime) {
            return ((this.endTime - this.startTime) / 1000).toFixed(1);
        }
        return '0.0';
    }

    /**
     * Gets agent objects for all currently active agents
     * @returns {Array<VerificationAgent>} Array of active agent instances
     */
    getActiveAgentObjects() {
        return this.activeAgents.map(agentId => AGENTS[agentId]);
    }

    /**
     * Calculates overall processing progress across all active agents
     * @returns {number} Progress percentage (0-100)
     */
    getOverallProgress() {
        if (this.activeAgents.length === 0) return 0;
        
        const totalProgress = this.activeAgents.reduce((sum, agentId) => {
            return sum + AGENTS[agentId].progress;
        }, 0);
        
        return Math.round(totalProgress / this.activeAgents.length);
    }
}

/**
 * Global verification system instance
 * Single instance pattern ensures consistent state management across the application
 */
const verificationSystem = new VerificationSystem();

// Make available globally for browser use
if (typeof window !== 'undefined') {
    window.VerificationAgent = VerificationAgent;
    window.AGENTS = AGENTS;
    window.AgentSelector = AgentSelector;
    window.VerificationSystem = VerificationSystem;
    window.verificationSystem = verificationSystem;
}

/**
 * Export configuration for use in Node.js environments or testing
 * All classes and the global instance are available for import
 */
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        VerificationAgent,
        AGENTS,
        AgentSelector,
        VerificationSystem,
        verificationSystem
    };
}