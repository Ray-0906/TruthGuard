/**
 * Bot Commands Module for Telegram Integration
 * 
 * This module handles all Telegram bot commands and provides
 * user-friendly interactions with the verification system.
 * 
 * @author Multi-Agent Verification Team
 * @version 1.0.0
 */

class BotCommands {
    constructor(bot, verificationSystem) {
        this.bot = bot;
        this.verificationSystem = verificationSystem;
        this.userSessions = new Map();
    }

    /**
     * Handle /start command
     */
    async handleStart(msg) {
        const chatId = msg.chat.id;
        const firstName = msg.from.first_name || 'User';

        const welcomeMessage = `
🛡️ *Welcome to Multi-Agent AI Verification System*

Hello ${firstName}! I'm your AI-powered misinformation detection assistant.

🤖 *What I can do:*
• Analyze text for misinformation and scams
• Detect phishing links and suspicious URLs  
• Verify news claims and scientific facts
• Check images and videos for manipulation
• Provide detailed evidence and recommendations

🚀 *Quick Start:*
• Send me any text to analyze
• Use /verify followed by content to analyze
• Try /demo for example scenarios
• Use /help for detailed commands

💡 *Pro tip:* Just send me any suspicious content and I'll automatically analyze it with my specialized AI agents!

Ready to fight misinformation together? 🦾
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎯 Try Demo', callback_data: 'demo_menu' },
                        { text: '📖 Help', callback_data: 'help_menu' }
                    ],
                    [
                        { text: '📊 My Stats', callback_data: 'user_stats' },
                        { text: '⚙️ Settings', callback_data: 'settings_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.sendMessage(chatId, welcomeMessage, {
                parse_mode: 'Markdown',
                ...keyboard
            });

            // Initialize user session
            this.userSessions.set(chatId, {
                startTime: new Date(),
                verificationsCount: 0,
                lastActivity: new Date()
            });

            console.log(`👋 New user started: ${firstName} (${chatId})`);
        } catch (error) {
            console.error('❌ Error in /start command:', error);
            await this.sendErrorMessage(chatId, 'Welcome message failed to send');
        }
    }

    /**
     * Handle /help command
     */
    async handleHelp(msg) {
        const chatId = msg.chat.id;

        const helpMessage = `
📚 *Multi-Agent Verification Bot - Help Guide*

🔧 *Available Commands:*

🔹 \`/start\` - Welcome message and quick start
🔹 \`/verify <content>\` - Analyze specific content
🔹 \`/demo\` - Try example scenarios
🔹 \`/stats\` - View your verification statistics
🔹 \`/settings\` - Configure bot preferences
🔹 \`/help\` - Show this help message

📝 *How to Use:*

*Method 1: Direct Text*
Just send me any text message and I'll analyze it automatically.

*Method 2: Verify Command*
\`/verify Your content here\`

*Method 3: Forward Messages*
Forward suspicious messages to me for analysis.

🤖 *AI Agents Available:*

📰 *News Agent* - Validates news claims
📚 *Fact Agent* - Checks scientific/historical facts  
⚠️ *Scam Agent* - Detects fraud patterns
🔗 *Phishing Agent* - Analyzes suspicious links
🖼️ *Image Agent* - Detects image manipulation
📹 *Video Agent* - Identifies deepfakes

⚡ *Features:*

✅ Real-time content analysis
✅ Multiple AI agents working together
✅ Detailed evidence and explanations
✅ Risk level assessment
✅ Confidence scoring
✅ Prevention recommendations

🛡️ *Privacy & Security:*

• No personal data stored permanently
• Messages analyzed locally by AI
• No data shared with third parties
• Session-based temporary storage only

💡 *Pro Tips:*

• Be specific with your content
• Include context when helpful
• Try different types of content
• Use demo scenarios to learn
• Report false positives to improve accuracy

Need more help? Try \`/demo\` for examples!
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎯 Try Demo', callback_data: 'demo_menu' },
                        { text: '🔧 Settings', callback_data: 'settings_menu' }
                    ],
                    [
                        { text: '📊 My Stats', callback_data: 'user_stats' },
                        { text: '🏠 Main Menu', callback_data: 'main_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.sendMessage(chatId, helpMessage, {
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error in /help command:', error);
            await this.sendErrorMessage(chatId, 'Help message failed to send');
        }
    }

    /**
     * Handle /verify command with content
     */
    async handleVerify(msg, content) {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        if (!content || content.trim().length === 0) {
            await this.bot.sendMessage(chatId, 
                '❌ Please provide content to verify.\n\nExample: `/verify Breaking news about AI breakthrough`',
                { parse_mode: 'Markdown' }
            );
            return;
        }

        if (content.length > 5000) {
            await this.bot.sendMessage(chatId, 
                '❌ Content too long. Please limit to 5000 characters or less.'
            );
            return;
        }

        await this.processVerification(chatId, userId, content.trim());
    }

    /**
     * Handle /demo command
     */
    async handleDemo(msg) {
        const chatId = msg.chat.id;
        const scenarios = this.verificationSystem.getScenarios();

        const demoMessage = `
🎯 *Demo Scenarios*

Try these example scenarios to see how different AI agents work:

Click any scenario below to analyze it:
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    ...scenarios.map(scenario => [
                        { 
                            text: scenario.title, 
                            callback_data: `demo_${scenario.id}` 
                        }
                    ]),
                    [
                        { text: '🔙 Back to Help', callback_data: 'help_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.sendMessage(chatId, demoMessage, {
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error in /demo command:', error);
            await this.sendErrorMessage(chatId, 'Demo menu failed to load');
        }
    }

    /**
     * Handle /stats command
     */
    async handleStats(msg) {
        const chatId = msg.chat.id;
        const session = this.userSessions.get(chatId) || {};

        const userStats = {
            verificationsCount: session.verificationsCount || 0,
            startTime: session.startTime || new Date(),
            lastActivity: session.lastActivity || new Date()
        };

        const systemStats = {
            totalVerifications: this.verificationSystem.getTotalVerifications(),
            activeVerifications: this.verificationSystem.getActiveVerifications(),
            availableAgents: this.verificationSystem.getAgents().length
        };

        const uptime = Date.now() - userStats.startTime.getTime();
        const days = Math.floor(uptime / (1000 * 60 * 60 * 24));
        const hours = Math.floor((uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

        const statsMessage = `
📊 *Your Verification Statistics*

👤 *Personal Stats:*
🔍 Verifications: ${userStats.verificationsCount}
📅 Member since: ${userStats.startTime.toLocaleDateString()}
⏱️ Time with us: ${days}d ${hours}h
🕐 Last activity: ${userStats.lastActivity.toLocaleTimeString()}

🌐 *System Stats:*
🔄 Total verifications: ${systemStats.totalVerifications}
⚡ Currently processing: ${systemStats.activeVerifications}
🤖 Active agents: ${systemStats.availableAgents}

🏆 *Your Impact:*
${userStats.verificationsCount > 0 ? 
    `Great job! You've helped fight misinformation ${userStats.verificationsCount} times!` :
    'Start your first verification to make an impact!'
}

Keep up the great work! 🛡️
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🎯 Try Verification', callback_data: 'demo_menu' },
                        { text: '📖 Help', callback_data: 'help_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.sendMessage(chatId, statsMessage, {
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error in /stats command:', error);
            await this.sendErrorMessage(chatId, 'Stats failed to load');
        }
    }

    /**
     * Handle /settings command
     */
    async handleSettings(msg) {
        const chatId = msg.chat.id;

        const settingsMessage = `
⚙️ *Bot Settings*

Configure your verification preferences:

🔧 *Current Settings:*
• Notifications: Enabled ✅
• Detailed Results: Enabled ✅
• Processing Updates: Enabled ✅
• Risk Warnings: Enabled ✅

🎛️ *Available Options:*
        `;

        const keyboard = {
            reply_markup: {
                inline_keyboard: [
                    [
                        { text: '🔔 Toggle Notifications', callback_data: 'toggle_notifications' },
                        { text: '📋 Toggle Details', callback_data: 'toggle_details' }
                    ],
                    [
                        { text: '⚡ Toggle Updates', callback_data: 'toggle_updates' },
                        { text: '⚠️ Toggle Warnings', callback_data: 'toggle_warnings' }
                    ],
                    [
                        { text: '🗑️ Clear History', callback_data: 'clear_history' },
                        { text: '🔙 Back', callback_data: 'main_menu' }
                    ]
                ]
            }
        };

        try {
            await this.bot.sendMessage(chatId, settingsMessage, {
                parse_mode: 'Markdown',
                ...keyboard
            });
        } catch (error) {
            console.error('❌ Error in /settings command:', error);
            await this.sendErrorMessage(chatId, 'Settings failed to load');
        }
    }

    /**
     * Process content verification
     */
    async processVerification(chatId, userId, content) {
        try {
            // Send initial processing message
            const processingMsg = await this.bot.sendMessage(chatId, 
                `🔍 *Analyzing Content...*\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"\n\n⏳ AI agents are working...`,
                { parse_mode: 'Markdown' }
            );

            // Update user session
            const session = this.userSessions.get(chatId) || {};
            session.verificationsCount = (session.verificationsCount || 0) + 1;
            session.lastActivity = new Date();
            this.userSessions.set(chatId, session);

            // Start verification process
            const selectedAgents = this.verificationSystem.selectAgents(content);
            
            // Send agent selection message
            await this.bot.editMessageText(
                `🤖 *Analysis in Progress*\n\n"${content.substring(0, 100)}${content.length > 100 ? '...' : ''}"\n\n📊 *Active Agents:*\n${selectedAgents.map(a => `${a.emoji} ${a.name}`).join('\n')}\n\n⚡ Processing...`,
                {
                    chat_id: chatId,
                    message_id: processingMsg.message_id,
                    parse_mode: 'Markdown'
                }
            );

            // Perform verification
            const result = await this.verificationSystem.verifyContent(content, userId);

            // Send final results
            await this.sendVerificationResults(chatId, result, processingMsg.message_id);

        } catch (error) {
            console.error('❌ Verification error:', error);
            await this.sendErrorMessage(chatId, 'Analysis failed. Please try again.');
        }
    }

    /**
     * Send formatted verification results
     */
    async sendVerificationResults(chatId, result, editMessageId = null) {
        const { overallResult, agentResults, processingTime } = result;
        
        // Determine result emoji and color
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

        // Format main result message
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
                        { text: '📤 Share Results', callback_data: `share_${result.verificationId}` },
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
            console.error('❌ Error sending results:', error);
            await this.sendErrorMessage(chatId, 'Failed to send verification results');
        }
    }

    /**
     * Send error message
     */
    async sendErrorMessage(chatId, message) {
        try {
            await this.bot.sendMessage(chatId, 
                `❌ *Error*\n\n${message}\n\nPlease try again or contact support if the problem persists.`,
                { parse_mode: 'Markdown' }
            );
        } catch (error) {
            console.error('❌ Failed to send error message:', error);
        }
    }

    /**
     * Handle callback queries from inline keyboards
     */
    async handleCallbackQuery(callbackQuery) {
        const chatId = callbackQuery.message.chat.id;
        const userId = callbackQuery.from.id;
        const data = callbackQuery.data;

        try {
            // Acknowledge the callback query
            await this.bot.answerCallbackQuery(callbackQuery.id);

            if (data.startsWith('demo_')) {
                await this.handleDemoCallback(chatId, userId, data);
            } else if (data.startsWith('details_')) {
                await this.handleDetailsCallback(chatId, data);
            } else if (data.startsWith('share_')) {
                await this.handleShareCallback(chatId, data);
            } else {
                await this.handleGeneralCallback(chatId, data);
            }

        } catch (error) {
            console.error('❌ Callback query error:', error);
            await this.sendErrorMessage(chatId, 'Button action failed');
        }
    }

    /**
     * Handle demo scenario callbacks
     */
    async handleDemoCallback(chatId, userId, data) {
        if (data === 'demo_menu') {
            // Show demo menu again
            const msg = { chat: { id: chatId } };
            await this.handleDemo(msg);
            return;
        }

        const scenarioId = data.replace('demo_', '');
        const scenarios = this.verificationSystem.getScenarios();
        const scenario = scenarios.find(s => s.id === scenarioId);

        if (scenario) {
            await this.processVerification(chatId, userId, scenario.content);
        } else {
            await this.sendErrorMessage(chatId, 'Demo scenario not found');
        }
    }

    /**
     * Handle other callback queries
     */
    async handleGeneralCallback(chatId, data) {
        switch (data) {
            case 'help_menu':
                const helpMsg = { chat: { id: chatId } };
                await this.handleHelp(helpMsg);
                break;
            case 'user_stats':
                const statsMsg = { chat: { id: chatId } };
                await this.handleStats(statsMsg);
                break;
            case 'settings_menu':
                const settingsMsg = { chat: { id: chatId } };
                await this.handleSettings(settingsMsg);
                break;
            case 'main_menu':
                const startMsg = { chat: { id: chatId }, from: { first_name: 'User' } };
                await this.handleStart(startMsg);
                break;
            default:
                await this.bot.sendMessage(chatId, '🔧 This feature is coming soon!');
        }
    }

    /**
     * Handle details callback
     */
    async handleDetailsCallback(chatId, data) {
        const verificationId = data.replace('details_', '');
        const verification = this.verificationSystem.getVerification(verificationId);

        if (!verification || !verification.result) {
            await this.sendErrorMessage(chatId, 'Verification details not found');
            return;
        }

        const result = verification.result;
        const detailsMessage = `
📋 *DETAILED VERIFICATION REPORT*

📝 *Original Content:*
"${result.content}"

🕐 *Timestamp:* ${new Date(result.timestamp).toLocaleString()}
⏱️ *Processing Time:* ${(result.processingTime / 1000).toFixed(1)}s

🤖 *Agent Details:*

${result.agentResults.map(agent => `
${agent.emoji} *${agent.name}*
📊 Verdict: ${agent.verdict}
🎯 Confidence: ${Math.round(agent.confidence)}%
🕐 Processing: ${(agent.processingTime / 1000).toFixed(1)}s

📋 Evidence:
${agent.evidence.map(e => `• ${e}`).join('\n')}

💡 Recommendations:
${agent.recommendations.map(r => `• ${r}`).join('\n')}
`).join('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')}

🎯 *Final Assessment:*
${result.overallResult.summary}
        `;

        try {
            await this.bot.sendMessage(chatId, detailsMessage, {
                parse_mode: 'Markdown'
            });
        } catch (error) {
            console.error('❌ Error sending details:', error);
            await this.sendErrorMessage(chatId, 'Failed to load detailed report');
        }
    }

    /**
     * Handle share callback
     */
    async handleShareCallback(chatId, data) {
        await this.bot.sendMessage(chatId, 
            '📤 *Share Results*\n\nSharing feature coming soon! You can manually copy the verification results to share with others.',
            { parse_mode: 'Markdown' }
        );
    }
}

module.exports = BotCommands;