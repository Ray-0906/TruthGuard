# 📝 Code Style Guide

## Multi-Agent AI Verification System - Development Standards

This document outlines the coding standards, conventions, and best practices used in the Multi-Agent AI Verification System.

---

## 📋 Table of Contents

- [General Principles](#general-principles)
- [JavaScript Standards](#javascript-standards)
- [CSS Standards](#css-standards)
- [HTML Standards](#html-standards)
- [Documentation Standards](#documentation-standards)
- [File Organization](#file-organization)
- [Performance Guidelines](#performance-guidelines)

---

## 🎯 General Principles

### Code Philosophy
1. **Clarity over Cleverness** - Write code that tells a story
2. **Consistency is Key** - Follow established patterns throughout
3. **Performance Matters** - Optimize for smooth 60fps animations
4. **Accessibility First** - Ensure inclusive user experiences
5. **Mobile Responsive** - Design for all screen sizes

### Naming Conventions
```javascript
// Use descriptive, self-documenting names
const verificationSystem = new VerificationSystem(); // ✅ Good
const vs = new VerificationSystem();                // ❌ Bad

// Classes: PascalCase
class VerificationAgent {}

// Functions/Variables: camelCase
function analyzeContent() {}
const processingTime = 3500;

// Constants: SCREAMING_SNAKE_CASE
const PROCESSING_TIMEOUT = 30000;

// CSS Classes: kebab-case
.agent-result-header {}
.processing-section {}
```

---

## 🟨 JavaScript Standards

### ES6+ Features
```javascript
// Use modern JavaScript features
const agents = [...activeAgents]; // Spread operator
const {id, name} = agent;         // Destructuring
const result = await agent.process(); // Async/await

// Arrow functions for callbacks
agents.forEach(agent => agent.reset());

// Template literals for strings
const message = `Agent ${agent.name} completed in ${time}s`;
```

### Class Structure
```javascript
/**
 * Class documentation
 */
class ExampleClass {
    /**
     * Constructor documentation
     */
    constructor(param1, param2) {
        this.property1 = param1;
        this.property2 = param2;
    }

    /**
     * Method documentation
     * @param {string} input - Description
     * @returns {Promise<Object>} Description
     */
    async methodName(input) {
        // Implementation
    }

    /**
     * Private method (indicated by underscore)
     */
    _privateMethod() {
        // Implementation
    }
}
```

### Error Handling
```javascript
// Use try-catch for async operations
try {
    const result = await this.analyzeContent(content);
    this.displayResults(result);
} catch (error) {
    console.error('Analysis failed:', error);
    this.showError('Analysis failed. Please try again.');
}

// Validate inputs
function analyzeContent(content) {
    if (!content || typeof content !== 'string') {
        throw new Error('Content must be a non-empty string');
    }
    // Continue with analysis
}
```

### State Management
```javascript
// Use clear state patterns
class SystemState {
    constructor() {
        this.status = 'idle'; // idle, processing, completed, error
        this.data = null;
        this.timestamp = null;
    }

    reset() {
        this.status = 'idle';
        this.data = null;
        this.timestamp = null;
    }

    isProcessing() {
        return this.status === 'processing';
    }
}
```

### Event Handling
```javascript
// Use descriptive event handler names
handleAnalyzeClick() {
    // Implementation
}

handleKeyboardShortcut(event) {
    // Implementation
}

// Clean up event listeners
destroy() {
    this.removeEventListeners();
    this.cleanup();
}
```

---

## 🎨 CSS Standards

### CSS Custom Properties
```css
/* Define meaningful custom properties */
:root {
    /* Color system */
    --primary-color: #4285f4;
    --success-color: #34a853;
    --warning-color: #fbbc04;
    --danger-color: #ea4335;
    
    /* Typography */
    --font-family: 'Inter', sans-serif;
    --font-size-base: 1rem;
    --line-height-base: 1.6;
    
    /* Spacing system */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    
    /* Transitions */
    --transition-fast: 0.15s ease-out;
    --transition-normal: 0.3s ease-out;
}
```

### BEM-Style Class Naming
```css
/* Block Element Modifier methodology */
.agent-card {}                    /* Block */
.agent-card__header {}            /* Element */
.agent-card__header--active {}    /* Modifier */

/* Utility classes */
.u-text-center { text-align: center; }
.u-margin-bottom-md { margin-bottom: var(--spacing-md); }
```

### Responsive Design
```css
/* Mobile-first approach */
.component {
    /* Mobile styles (default) */
    display: block;
    padding: var(--spacing-sm);
}

@media (min-width: 768px) {
    .component {
        /* Tablet styles */
        display: flex;
        padding: var(--spacing-md);
    }
}

@media (min-width: 1200px) {
    .component {
        /* Desktop styles */
        padding: var(--spacing-lg);
    }
}
```

### Animation Guidelines
```css
/* Use CSS custom properties for consistency */
.animate-fade-in {
    animation: fadeIn var(--transition-normal) ease-out;
}

/* Respect user preferences */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        transition-duration: 0.01ms !important;
    }
}

/* GPU acceleration for smooth animations */
.will-animate {
    transform: translateZ(0); /* Create new layer */
    will-change: transform;   /* Hint to browser */
}
```

---

## 📄 HTML Standards

### Semantic Structure
```html
<!-- Use semantic HTML5 elements -->
<main class="main-content">
    <section class="input-section">
        <h2 class="section-title">Content to Verify</h2>
        <!-- Content -->
    </section>
    
    <section class="results-section">
        <h2 class="section-title">Verification Results</h2>
        <!-- Results -->
    </section>
</main>
```

### Accessibility
```html
<!-- Proper ARIA labels and roles -->
<button 
    id="analyzeBtn" 
    class="btn btn-primary"
    aria-describedby="analyze-help"
    aria-label="Analyze content for verification">
    <span class="btn-icon">🔍</span>
    Analyze Content
</button>

<div id="analyze-help" class="help-text">
    Our AI agents will analyze your content for accuracy and threats
</div>

<!-- Screen reader only text -->
<span class="sr-only">Processing agent status updates</span>
```

### Form Best Practices
```html
<!-- Proper form structure -->
<div class="input-container">
    <label for="contentInput" class="sr-only">Content to verify</label>
    <textarea 
        id="contentInput" 
        class="content-input"
        placeholder="Enter text, URLs, or describe media content..."
        aria-label="Content to verify"
        rows="4"
        required>
    </textarea>
</div>
```

---

## 📚 Documentation Standards

### File Headers
```javascript
/**
 * ================================================================
 * MODULE NAME - BRIEF DESCRIPTION
 * ================================================================
 * 
 * File: filename.js
 * Purpose: Detailed purpose description
 * 
 * Key Features:
 * • Feature 1
 * • Feature 2
 * 
 * Dependencies: list dependencies
 * Used by: list usage
 * 
 * @version 1.0.0
 * @author Team Name
 * @since 2025-09-21
 * ================================================================
 */
```

### Function Documentation
```javascript
/**
 * Brief function description
 * 
 * Longer description if needed, explaining the algorithm,
 * approach, or important considerations.
 * 
 * @param {string} content - The content to analyze
 * @param {Object} [options] - Optional configuration object
 * @param {boolean} [options.strict=false] - Use strict validation
 * @returns {Promise<Object>} Verification results object
 * @throws {Error} When content is invalid
 * 
 * @example
 * const result = await analyzeContent('Sample text', {strict: true});
 * console.log(result.verdict);
 */
async function analyzeContent(content, options = {}) {
    // Implementation
}
```

### Inline Comments
```javascript
// High-level algorithm explanation
const activeAgents = this.selectAgents(content);

// Parallel processing for performance
const promises = activeAgents.map(agent => agent.process(content));

// Aggregate results (order doesn't matter due to parallel execution)
const results = await Promise.all(promises);

/* 
 * Multi-line explanation for complex logic:
 * This algorithm uses a weighted scoring system where each agent's
 * confidence is multiplied by its reliability factor to produce
 * an overall confidence score.
 */
const overallConfidence = this.calculateWeightedConfidence(results);
```

---

## 📁 File Organization

### Directory Structure
```
multi-agent-verification/
├── index.html                  # Main entry point
├── assets/
│   ├── css/
│   │   └── style.css          # All styles (no fragmentation)
│   └── js/
│       ├── agents.js          # Agent system core
│       ├── scenarios.js       # Demo scenarios & management
│       ├── animations.js      # Animation controller
│       └── main.js           # Application entry point
├── docs/
│   ├── README.md             # User documentation
│   ├── TECHNICAL_DOCS.md     # Developer documentation
│   └── STYLE_GUIDE.md        # This file
└── LICENSE                   # MIT License
```

### Module Dependencies
```javascript
// Clear dependency chain
// main.js → agents.js, scenarios.js, animations.js
// animations.js → agents.js (for agent references)
// scenarios.js → agents.js (for AgentSelector)
```

---

## ⚡ Performance Guidelines

### JavaScript Performance
```javascript
// Prefer const over let when possible
const config = getConfiguration();

// Use efficient array methods
const activeAgents = agents.filter(agent => agent.isActive());

// Debounce expensive operations
const debouncedAnalyze = debounce(this.analyzeContent, 300);

// Cache DOM queries
const elements = {
    analyzeBtn: document.getElementById('analyzeBtn'),
    contentInput: document.getElementById('contentInput'),
    resultsSection: document.getElementById('resultsSection')
};
```

### CSS Performance
```css
/* Use efficient selectors */
.btn { /* Good - single class */ }
.card .btn { /* Okay - simple descendant */ }
div.card ul.list li.item a.link { /* Bad - too specific */ }

/* Avoid expensive properties */
.efficient {
    transform: translateX(10px); /* GPU accelerated */
}

.expensive {
    left: 10px; /* Triggers layout */
}
```

### Animation Performance
```javascript
// Use requestAnimationFrame for smooth animations
function animateProgress(targetProgress) {
    let currentProgress = 0;
    
    function frame() {
        if (currentProgress < targetProgress) {
            currentProgress += 2;
            updateProgressBar(currentProgress);
            requestAnimationFrame(frame);
        }
    }
    
    requestAnimationFrame(frame);
}
```

---

## 🧪 Testing Standards

### Unit Test Structure
```javascript
describe('VerificationAgent', () => {
    let agent;
    
    beforeEach(() => {
        agent = new VerificationAgent('test', 'Test Agent', '🧪', 'Test', [], 1000);
    });
    
    describe('initialization', () => {
        it('should initialize with correct properties', () => {
            expect(agent.id).toBe('test');
            expect(agent.status).toBe('idle');
        });
    });
    
    describe('processing', () => {
        it('should complete processing successfully', async () => {
            const scenario = createMockScenario();
            const result = await agent.process('test content', scenario);
            
            expect(agent.status).toBe('completed');
            expect(result).toBeDefined();
        });
    });
});
```

### Integration Test Patterns
```javascript
// Test complete workflows
describe('Full Verification Workflow', () => {
    it('should analyze content and display results', async () => {
        const app = new VerificationApp();
        const content = 'Test news content';
        
        // Mock dependencies
        jest.spyOn(animationController, 'startProcessingSimulation').mockResolvedValue(true);
        
        // Execute workflow
        await app.analyzeContent(content);
        
        // Verify results
        expect(app.currentScenario).toBeDefined();
        expect(app.currentScenario.verdict).toBeTruthy();
    });
});
```

---

## 🔧 Code Review Checklist

### Before Submitting
- [ ] Code follows established naming conventions
- [ ] Functions are properly documented
- [ ] Error handling is appropriate
- [ ] Performance considerations addressed
- [ ] Accessibility requirements met
- [ ] Mobile responsiveness verified
- [ ] Cross-browser compatibility tested
- [ ] No console.log statements in production code
- [ ] Code is properly formatted and linted

### Review Criteria
- [ ] Code clarity and readability
- [ ] Proper separation of concerns
- [ ] Efficient algorithms and data structures
- [ ] Memory leak prevention
- [ ] Security considerations
- [ ] Test coverage adequacy
- [ ] Documentation completeness

---

This style guide ensures consistent, maintainable, and high-quality code across the Multi-Agent AI Verification System project.