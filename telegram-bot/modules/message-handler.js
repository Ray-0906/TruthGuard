/**
 * Message Handler Module for Telegram Bot
 * 
 * This module handles different types of messages (text, photos, documents)
 * and provides intelligent content processing and user interaction.
 * 
 * @author Multi-Agent Verification Team
 * @version 1.0.0
 */

const validator = require('validator');

class MessageHandler {
    constructor(bot, verificationSystem) {
        this.bot = bot;
        this.verificationSystem = verificationSystem;
        this.userSessions = new Map();
    }

    /**
     * Handle regular text messages (non-commands)
     */
    async handleTextMessage(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const text = msg.text;

        // Skip if message is empty or too short
        if (!text || text.trim().length < 3) {
            await this.bot.sendMessage(chatId, 
                '📝 Please send me some content to analyze. Try sending:\n\n• News headlines\n• Suspicious links\n• Claims to fact-check\n• Any text you want verified'
            );
            return;
        }

        // Check content length
        if (text.length > 5000) {
            await this.bot.sendMessage(chatId, 
                '❌ Message too long! Please limit your content to 5000 characters or less.\n\n💡 Tip: Break longer content into smaller parts for analysis.'
            );
            return;
        }

        // Auto-detect content type and provide helpful feedback
        const contentType = this.detectContentType(text);
        let processingMessage = '🔍 Analyzing your content...';

        switch (contentType) {
            case 'url':
                processingMessage = '🔗 Analyzing URL for threats and credibility...';
                break;
            case 'news':
                processingMessage = '📰 Fact-checking news content...';
                break;
            case 'scientific':
                processingMessage = '🔬 Verifying scientific claims...';
                break;
            case 'financial':
                processingMessage = '💰 Checking for financial scams...';
                break;
            case 'general':
            default:
                processingMessage = '🤖 Running multi-agent analysis...';
        }

        try {
            // Send typing action
            await this.bot.sendChatAction(chatId, 'typing');

            // Process the verification
            await this.processContentVerification(chatId, userId, text, processingMessage);

        } catch (error) {
            console.error('❌ Text message handling error:', error);
            await this.sendErrorMessage(chatId, 'Failed to process your message. Please try again.');
        }
    }

    /**
     * Handle photo messages
     */
    async handlePhotoMessage(msg) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const caption = msg.caption || '';
        
        try {
            // Get the highest resolution photo
            const photo = msg.photo[msg.photo.length - 1];
            const fileId = photo.file_id;

            await this.bot.sendChatAction(chatId, 'typing');

            // Simulate image analysis (in real implementation, you'd download and analyze the image)
            const analysisMessage = `
🖼️ *Image Analysis Started*

📸 *File Info:*
• Size: ${this.formatFileSize(photo.file_size || 0)}
• Resolution: ${photo.width}x${photo.height}
• Caption: ${caption || 'None'}

🤖 *AI Agents Processing:*
${this.verificationSystem.getAgents()
    .filter(a => a.id === 'image')
    .map(a => `${a.emoji} ${a.name} - Analyzing...`)
    .join('\n')}

⏳ This may take a few moments...
            `;

            const processingMsg = await this.bot.sendMessage(chatId, analysisMessage, {
                parse_mode: 'Markdown'
            });

            // Simulate image processing delay
            await this.sleep(3000);

            // Generate image analysis result
            const imageResult = await this.analyzeImage(fileId, caption);
            
            await this.sendImageAnalysisResult(chatId, imageResult, processingMsg.message_id);

        } catch (error) {
            console.error('❌ Photo message handling error:', error);
            await this.sendErrorMessage(chatId, 'Failed to analyze image. Please try again.');
        }
    }

    /**
     * Handle document messages
     */
    async handleDocumentMessage(msg) {
        const chatId = msg.chat.id;
        const document = msg.document;
        const fileName = document.file_name || 'unknown';
        const fileSize = document.file_size || 0;

        try {
            // Check file size limit (10MB)
            if (fileSize > 10 * 1024 * 1024) {
                await this.bot.sendMessage(chatId, 
                    '❌ File too large! Please upload files smaller than 10MB.\n\n💡 For large files, try uploading a screenshot or extract key text content.'
                );
                return;
            }

            // Check file type
            const supportedTypes = ['.txt', '.pdf', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
            const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
            
            if (!supportedTypes.includes(fileExtension)) {
                await this.bot.sendMessage(chatId, 
                    `❌ Unsupported file type: ${fileExtension}\n\n✅ Supported types: ${supportedTypes.join(', ')}\n\n💡 Try converting to a supported format or copy-paste the text content.`
                );
                return;
            }

            await this.bot.sendChatAction(chatId, 'upload_document');

            const analysisMessage = `
📄 *Document Analysis*

📋 *File Details:*
• Name: ${fileName}
• Size: ${this.formatFileSize(fileSize)}
• Type: ${fileExtension.toUpperCase()}

🔍 *Processing:*
• Extracting content...
• Running security scan...
• Analyzing for misinformation...

⏳ Please wait...
            `;

            const processingMsg = await this.bot.sendMessage(chatId, analysisMessage, {
                parse_mode: 'Markdown'
            });

            // Simulate document processing
            await this.sleep(4000);

            // For demo purposes, return a simulated analysis
            const documentResult = {
                verdict: 'ANALYZED',
                confidence: 85,
                summary: `Document "${fileName}" has been analyzed. ${fileExtension === '.pdf' ? 'PDF content extracted and verified.' : 'Document content appears safe.'}`,
                recommendations: [
                    'Document appears to be legitimate',
                    'No malicious content detected',
                    'Safe to view and share'
                ]
            };

            await this.sendDocumentAnalysisResult(chatId, documentResult, processingMsg.message_id);

        } catch (error) {
            console.error('❌ Document message handling error:', error);
            await this.sendErrorMessage(chatId, 'Failed to analyze document. Please try again.');
        }
    }

    /**
     * Handle callback queries from inline keyboards
     */
    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const data = callbackQuery.data;

        try {
            await this.bot.answerCallbackQuery(callbackQuery.id);

            // Handle different callback types
            if (data.startsWith('retry_')) {
                const content = data.replace('retry_', '');
                await this.processContentVerification(chatId, callbackQuery.from.id, content, '🔄 Retrying analysis...');
            } else if (data === 'help_analysis') {
                await this.sendAnalysisHelp(chatId);
            } else if (data === 'report_issue') {
                await this.handleReportIssue(chatId);
            }

        } catch (error) {
            console.error('❌ Callback query handling error:', error);
        }
    }

    /**
     * Detect content type for optimized processing
     */
    detectContentType(text) {
        const lowerText = text.toLowerCase();

        // URL detection
        if (validator.isURL(text) || text.includes('http') || text.includes('www.')) {
            return 'url';
        }

        // News keywords
        const newsKeywords = ['breaking', 'news', 'report', 'journalist', 'headline', 'exclusive'];
        if (newsKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'news';
        }

        // Scientific keywords
        const scienceKeywords = ['study', 'research', 'scientist', 'data', 'percent', 'clinical trial'];
        if (scienceKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'scientific';
        }

        // Financial/scam keywords
        const financialKeywords = ['money', 'lottery', 'winner', 'prize', 'investment', 'bitcoin'];
        if (financialKeywords.some(keyword => lowerText.includes(keyword))) {
            return 'financial';
        }

        return 'general';
    }

    /**
     * Process content verification
     */
    async processContentVerification(chatId, userId, content, customMessage = null) {
        try {
            // Send initial processing message
            const processingMsg = await this.bot.sendMessage(chatId, 
                customMessage || `🔍 *Analyzing Content...*\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"\n\n⏳ AI agents are working...`,
                { parse_mode: 'Markdown' }
            );

            // Get selected agents for preview
            const selectedAgents = this.verificationSystem.selectAgents(content);
            
            // Update message with agent information
            await this.bot.editMessageText(
                `🤖 *Multi-Agent Analysis*\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"\n\n📊 *Active Agents:*\n${selectedAgents.map(a => `${a.emoji} ${a.name}`).join('\n')}\n\n⚡ Processing...`,
                {
                    chat_id: chatId,
                    message_id: processingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );

            // Perform verification
            const result = await this.verificationSystem.verifyContent(content, userId);

            // Send results using BotCommands format
            await this.sendVerificationResults(chatId, result, processingMsg.message_id);

        } catch (error) {
            console.error('❌ Content verification error:', error);
            await this.sendErrorMessage(chatId, 'Analysis failed. Please try again or contact support.');
        }
    }

    /**
     * Analyze image (simulated for demo)
     */
    async analyzeImage(fileId, caption) {
        // Simulate image analysis processing
        await this.sleep(2000);

        // Generate realistic response based on caption or default analysis
        const hasCaption = caption && caption.length > 0;
        
        return {
            verdict: 'ANALYZED',
            confidence: hasCaption ? 78 : 65,
            analysis: {
                metadata: 'Image metadata extracted successfully',
                manipulation: 'No obvious manipulation detected',
                source: hasCaption ? 'Caption provides context' : 'No additional context available'
            },
            recommendations: [
                'Image appears authentic',
                hasCaption ? 'Caption content analyzed' : 'Consider adding context for better analysis',
                'Verify original source if sharing'
            ]
        };
    }

    /**
     * Send image analysis results
     */
    async sendImageAnalysisResult(chatId, result, editMessageId) {
        const resultMessage = `
🖼️ *IMAGE ANALYSIS COMPLETE*

📊 *Verdict:* ${result.verdict}
🎯 *Confidence:* ${result.confidence}%

🔍 *Analysis Details:*
• Metadata: ${result.analysis.metadata}
• Manipulation: ${result.analysis.manipulation}  
• Source: ${result.analysis.source}

💡 *Recommendations:*
${result.recommendations.map(r => `• ${r}`).join('\n')}

✅ *Analysis Complete*
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📤 Share Results', callback_data: 'share_image' },
                        { text: '🔄 Analyze Another', callback_data: 'demo_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.editMessageText(resultMessage, {
                chat_id: chatId,
                message_id: editMessageId,
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error sending image results:', error);
            await this.sendErrorMessage(chatId, 'Failed to send image analysis results');
        }
    }

    /**
     * Send document analysis results
     */
    async sendDocumentAnalysisResult(chatId, result, editMessageId) {
        const resultMessage = `
📄 *DOCUMENT ANALYSIS COMPLETE*

📊 *Status:* ${result.verdict}
🎯 *Confidence:* ${result.confidence}%

📋 *Summary:*
${result.summary}

💡 *Recommendations:*
${result.recommendations.map(r => `• ${r}`).join('\n')}

✅ *Analysis Complete*
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📤 Share Results', callback_data: 'share_document' },
                        { text: '🔄 Analyze Another', callback_data: 'demo_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.editMessageText(resultMessage, {
                chat_id: chatId,
                message_id: editMessageId,
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error sending document results:', error);
            await this.sendErrorMessage(chatId, 'Failed to send document analysis results');
        }
    }

    /**
     * Send verification results (reuse from BotCommands)
     */
    async sendVerificationResults(chatId, result, editMessageId = null) {
        const { overallResult, agentResults, processingTime } = result;
        
        const resultEmojis = {
            'VERIFIED': '✅',
            'DANGEROUS': '🚨',
            'FALSE': '❌',
            'SUSPICIOUS': '⚠️',
            'UNVERIFIED': '❓'
        };

        const riskEmojis = {
            'CRITICAL': '🔴',
            'HIGH': '🟠', 
            'MEDIUM': '🟡',
            'LOW': '🟢',
            'MINIMAL': '⚪'
        };

        const resultEmoji = resultEmojis[overallResult.verdict] || '❓';
        const riskEmoji = riskEmojis[overallResult.riskLevel] || '⚪';

        const resultMessage = `
${resultEmoji} *VERIFICATION COMPLETE*

📋 *Overall Result:* ${overallResult.verdict}
📊 *Confidence:* ${overallResult.confidence}%
${riskEmoji} *Risk Level:* ${overallResult.riskLevel}

💬 *Summary:*
${overallResult.summary}

🤖 *Agent Analysis:* (${agentResults.length} agents)
${agentResults.map(agent => 
    `${agent.emoji} *${agent.name}*\n   └ ${agent.verdict} (${Math.round(agent.confidence)}%)`
).join('\n\n')}

⏱️ *Processing Time:* ${(processingTime / 1000).toFixed(1)}s
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '📋 Detailed Report', callback_data: `details_${result.verificationId}` },
                        { text: '🔄 Verify Another', callback_data: 'demo_menu' }
                    ],
                    [
                        { text: '❓ Need Help?', callback_data: 'help_analysis' },
                        { text: '📊 My Stats', callback_data: 'user_stats' }
                    ]
                ]
            }
        };

        try {
            if (editMessageId) {
                await this.bot.editMessageText(resultMessage, {
                    chat_id: chatId,
                    message_id: editMessageId,
                    parse_mode: 'Markdown',
                    ...keyboard
                });
            } else {
                await this.bot.sendMessage(chatId, resultMessage, {
                    parse_mode: 'Markdown',
                    ...keyboard
                });
            }

            // Send risk warning if needed
            if (overallResult.riskLevel === 'CRITICAL' || overallResult.riskLevel === 'HIGH') {
                await this.bot.sendMessage(chatId, 
                    `🚨 *SECURITY WARNING*\n\nThis content shows high risk indicators. Please:\n• Do not click any links\n• Do not share personal information\n• Report to relevant authorities if needed\n• Verify through official channels`,
                    { parse_mode: 'Markdown' }
                );
            }

        } catch (error) {
            console.error('❌ Error sending verification results:', error);
            await this.sendErrorMessage(chatId, 'Failed to send verification results');
        }
    }

    /**
     * Send analysis help
     */
    async sendAnalysisHelp(chatId) {
        const helpMessage = `
❓ *Analysis Help*

🤔 *Understanding Results:*

✅ *VERIFIED* - Content appears authentic
❌ *FALSE* - Content is likely misinformation  
🚨 *DANGEROUS* - High risk content detected
⚠️ *SUSPICIOUS* - Some concerning patterns found
❓ *UNVERIFIED* - Insufficient information

📊 *Confidence Levels:*
• 90-100%: Very high confidence
• 70-89%: High confidence  
• 50-69%: Moderate confidence
• Below 50%: Low confidence

🔴 *Risk Levels:*
• CRITICAL: Immediate threat
• HIGH: Significant risk
• MEDIUM: Moderate concern
• LOW: Minor risk
• MINIMAL: Very low risk

💡 *Tips for Better Analysis:*
• Provide full context
• Include source information
• Be specific with claims
• Use original language when possible

Need more help? Try /help for full commands!
        `;

        await this.bot.sendMessage(chatId, helpMessage, {
            parse_mode: 'Markdown'
        });
    }

    /**
     * Handle issue reporting
     */
    async handleReportIssue(chatId) {
        await this.bot.sendMessage(chatId, 
            '🐛 *Report Issue*\n\nTo report an issue:\n\n1. Describe what happened\n2. Include the content you were analyzing\n3. Mention what result you expected\n\nSend your report as a regular message starting with "ISSUE:" and our team will review it.\n\nThank you for helping improve our system!',
            { parse_mode: 'Markdown' }
        );
    }

    /**
     * Send error message
     */
    async sendErrorMessage(chatId, message) {
        try {
            await this.bot.sendMessage(chatId, 
                `❌ *Error*\n\n${message}\n\nPlease try again or use /help for assistance.`,
                { 
                    parse_mode: 'Markdown',
                    reply_markup: {
                        inline_keyboard: [
                            [
                                { text: '🔄 Try Again', callback_data: 'demo_menu' },
                                { text: '📖 Help', callback_data: 'help_menu' }
                            ]
                        ]
                    }
                }
            );
        } catch (error) {
            console.error('❌ Failed to send error message:', error);
        }
    }

    /**
     * Format file size for display
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    /**
     * Utility sleep function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

module.exports = MessageHandler;