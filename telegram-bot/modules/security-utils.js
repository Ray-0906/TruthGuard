/**
 * Security Utilities Module for Telegram Bot
 * 
 * This module provides security features including content validation,
 * rate limiting support, and protection against malicious inputs.
 * 
 * @author Multi-Agent Verification Team
 * @version 1.0.0
 */

const validator = require('validator');

class SecurityUtils {
    constructor() {
        this.suspiciousPatterns = [
            // XSS patterns
            /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
            /javascript:/gi,
            /on\w+\s*=/gi,
            
            // SQL injection patterns
            /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b)/gi,
            /'.*OR.*'.*=.*'/gi,
            /\bOR\b.*\b1\s*=\s*1\b/gi,
            
            // Command injection patterns
            /[;&|`$()]/g,
            /\.\.\//g,
            
            // Excessive special characters
            /[!@#$%^&*()_+=\[\]{}|\\:";'<>?,./~`]{10,}/g
        ];

        this.maliciousDomains = [
            'bit.ly/malicious',
            'tinyurl.com/scam',
            'suspicious-domain.fake',
            'phishing-site.com',
            'malware-host.net'
        ];

        this.riskKeywords = {
            high: [
                'click here to claim',
                'urgent action required',
                'your account will be closed',
                'verify your password',
                'suspicious activity detected',
                'claim your prize now',
                'limited time offer',
                'act now or lose',
                'wire transfer',
                'bitcoin payment',
                'cryptocurrency required'
            ],
            medium: [
                'exclusive offer',
                'make money fast',
                'work from home',
                'guaranteed profit',
                'no experience needed',
                'easy money',
                'secret method',
                'insider information'
            ],
            low: [
                'special discount',
                'limited availability',
                'popular product',
                'recommended by experts'
            ]
        };
    }

    /**
     * Validate content for security threats
     */
    validateContent(content) {
        if (!content || typeof content !== 'string') {
            return false;
        }

        // Check content length
        if (content.length > 10000) {
            console.warn('⚠️ Content exceeds maximum length');
            return false;
        }

        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(content)) {
                console.warn('⚠️ Suspicious pattern detected in content');
                return false;
            }
        }

        // Check for malicious domains
        const lowerContent = content.toLowerCase();
        for (const domain of this.maliciousDomains) {
            if (lowerContent.includes(domain)) {
                console.warn(`⚠️ Malicious domain detected: ${domain}`);
                return false;
            }
        }

        return true;
    }

    /**
     * Assess risk level of content
     */
    assessRiskLevel(content) {
        if (!content) return 'UNKNOWN';

        const lowerContent = content.toLowerCase();
        let riskScore = 0;

        // Check high-risk keywords
        for (const keyword of this.riskKeywords.high) {
            if (lowerContent.includes(keyword)) {
                riskScore += 3;
            }
        }

        // Check medium-risk keywords
        for (const keyword of this.riskKeywords.medium) {
            if (lowerContent.includes(keyword)) {
                riskScore += 2;
            }
        }

        // Check low-risk keywords
        for (const keyword of this.riskKeywords.low) {
            if (lowerContent.includes(keyword)) {
                riskScore += 1;
            }
        }

        // Additional risk factors
        if (this.hasMultipleUrls(content)) riskScore += 2;
        if (this.hasUrgencyIndicators(content)) riskScore += 2;
        if (this.hasMoneyMentions(content)) riskScore += 1;
        if (this.hasSuspiciousFormatting(content)) riskScore += 1;

        // Determine risk level
        if (riskScore >= 8) return 'CRITICAL';
        if (riskScore >= 5) return 'HIGH';
        if (riskScore >= 3) return 'MEDIUM';
        if (riskScore >= 1) return 'LOW';
        return 'MINIMAL';
    }

    /**
     * Sanitize user input
     */
    sanitizeInput(input) {
        if (!input || typeof input !== 'string') {
            return '';
        }

        return input
            .trim()
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+\s*=/gi, '') // Remove event handlers
            .substring(0, 5000); // Limit length
    }

    /**
     * Validate URL safety
     */
    validateUrl(url) {
        try {
            // Basic URL validation
            if (!validator.isURL(url, {
                protocols: ['http', 'https'],
                require_protocol: true
            })) {
                return { valid: false, reason: 'Invalid URL format' };
            }

            // Check against malicious domains
            const lowerUrl = url.toLowerCase();
            for (const domain of this.maliciousDomains) {
                if (lowerUrl.includes(domain)) {
                    return { valid: false, reason: 'Known malicious domain' };
                }
            }

            // Check for suspicious URL patterns
            const suspiciousUrlPatterns = [
                /bit\.ly\/[a-zA-Z0-9]{6,}/g, // Shortened URLs with random strings
                /tinyurl\.com\/[a-zA-Z0-9]{6,}/g,
                /[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}/g, // IP addresses
                /[a-zA-Z0-9]+-[a-zA-Z0-9]+-[a-zA-Z0-9]+\.(tk|ml|ga|cf)/g // Suspicious TLDs
            ];

            for (const pattern of suspiciousUrlPatterns) {
                if (pattern.test(lowerUrl)) {
                    return { valid: true, suspicious: true, reason: 'Potentially suspicious URL pattern' };
                }
            }

            return { valid: true, suspicious: false };

        } catch (error) {
            return { valid: false, reason: 'URL validation error' };
        }
    }

    /**
     * Check if content has multiple URLs
     */
    hasMultipleUrls(content) {
        const urlPattern = /https?:\/\/[^\s]+/g;
        const matches = content.match(urlPattern);
        return matches && matches.length > 2;
    }

    /**
     * Check for urgency indicators
     */
    hasUrgencyIndicators(content) {
        const urgencyWords = [
            'urgent', 'immediately', 'asap', 'right now', 'expires today',
            'limited time', 'act fast', 'hurry', 'don\'t wait', 'emergency'
        ];

        const lowerContent = content.toLowerCase();
        return urgencyWords.some(word => lowerContent.includes(word));
    }

    /**
     * Check for money-related mentions
     */
    hasMoneyMentions(content) {
        const moneyPatterns = [
            /\$[0-9,]+/g,
            /[0-9,]+\s*(dollars?|euros?|pounds?|bitcoin|btc|crypto)/gi,
            /(free\s*money|cash\s*prize|win\s*money|lottery)/gi
        ];

        return moneyPatterns.some(pattern => pattern.test(content));
    }

    /**
     * Check for suspicious formatting
     */
    hasSuspiciousFormatting(content) {
        // Check for excessive capitalization
        const caps = (content.match(/[A-Z]/g) || []).length;
        const total = content.length;
        const capsRatio = caps / total;

        if (capsRatio > 0.3) return true;

        // Check for excessive exclamation marks
        const exclamations = (content.match(/!/g) || []).length;
        if (exclamations > 3) return true;

        // Check for excessive emojis (Unicode emoji pattern)
        const emojiPattern = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
        const emojis = (content.match(emojiPattern) || []).length;
        if (emojis > 5) return true;

        return false;
    }

    /**
     * Generate security report for content
     */
    generateSecurityReport(content) {
        const report = {
            timestamp: new Date().toISOString(),
            contentLength: content.length,
            riskLevel: this.assessRiskLevel(content),
            isValid: this.validateContent(content),
            flags: []
        };

        // Add specific flags
        if (this.hasMultipleUrls(content)) {
            report.flags.push('Multiple URLs detected');
        }

        if (this.hasUrgencyIndicators(content)) {
            report.flags.push('Urgency indicators present');
        }

        if (this.hasMoneyMentions(content)) {
            report.flags.push('Financial content detected');
        }

        if (this.hasSuspiciousFormatting(content)) {
            report.flags.push('Suspicious formatting patterns');
        }

        // Check for suspicious patterns
        for (const pattern of this.suspiciousPatterns) {
            if (pattern.test(content)) {
                report.flags.push('Potentially malicious pattern detected');
                break;
            }
        }

        return report;
    }

    /**
     * Rate limiting helper
     */
    shouldAllowRequest(userId, requests = [], maxRequests = 10, timeWindow = 60000) {
        const now = Date.now();
        
        // Clean old requests
        const recentRequests = requests.filter(timestamp => 
            now - timestamp < timeWindow
        );

        // Check if user has exceeded rate limit
        const userRequests = recentRequests.filter(req => req.userId === userId);
        
        return userRequests.length < maxRequests;
    }

    /**
     * Generate security recommendations
     */
    generateSecurityRecommendations(securityReport) {
        const recommendations = [];

        if (securityReport.riskLevel === 'CRITICAL' || securityReport.riskLevel === 'HIGH') {
            recommendations.push('🚨 HIGH RISK: Do not click any links or provide personal information');
            recommendations.push('📞 Consider reporting this content to relevant authorities');
            recommendations.push('🔒 Verify sender identity through alternative channels');
        }

        if (securityReport.flags.includes('Multiple URLs detected')) {
            recommendations.push('🔗 Be cautious of multiple links - verify each URL separately');
        }

        if (securityReport.flags.includes('Urgency indicators present')) {
            recommendations.push('⏰ Urgency tactics are common in scams - take time to verify');
        }

        if (securityReport.flags.includes('Financial content detected')) {
            recommendations.push('💰 Never provide financial information to unverified sources');
        }

        if (securityReport.flags.includes('Suspicious formatting patterns')) {
            recommendations.push('📝 Excessive formatting may indicate spam or manipulation');
        }

        if (recommendations.length === 0) {
            recommendations.push('✅ Content appears safe, but always verify important information');
            recommendations.push('🔍 Cross-check with multiple reliable sources');
        }

        return recommendations;
    }

    /**
     * Check if user input requires additional verification
     */
    requiresAdditionalVerification(content) {
        const riskLevel = this.assessRiskLevel(content);
        return ['HIGH', 'CRITICAL'].includes(riskLevel);
    }

    /**
     * Clean and prepare content for analysis
     */
    prepareContentForAnalysis(content) {
        if (!content) return '';

        return content
            .trim()
            .replace(/\s+/g, ' ') // Normalize whitespace
            .substring(0, 5000); // Limit length
    }
}

module.exports = SecurityUtils;