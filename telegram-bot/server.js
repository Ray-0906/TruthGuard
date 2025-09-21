/**
 * Multi-Agent AI Verification System - Telegram Bot Server
 * 
 * This server provides Telegram bot integration for the verification system,
 * allowing users to interact with AI agents through Telegram chat interface.
 * 
 * Features:
 * - Webhook-based Telegram bot integration
 * - Real-time content verification through chat
 * - Support for text, images, and links
 * - Rate limiting and security measures
 * - Comprehensive logging and error handling
 * 
 * @author Multi-Agent Verification Team
 * @version 1.0.0
 * @license MIT
 */

require('dotenv').config();
const express = require('express');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const helmet = require('helmet');
const { RateLimiterMemory } = require('rate-limiter-flexible');
const { v4: uuidv4 } = require('uuid');
const validator = require('validator');
const path = require('path');

// Import verification system modules
const VerificationSystem = require('./modules/verification-system');
const BotCommands = require('./modules/bot-commands');
const MessageHandler = require('./modules/message-handler');
const SecurityUtils = require('./modules/security-utils');

// Configuration
const PORT = process.env.PORT || 3000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate required environment variables
if (!BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN is required in environment variables');
    process.exit(1);
}

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'"],
        },
    },
}));

app.use(cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:8000'],
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
    keyMappingFunction: (req) => req.body?.message?.from?.id || req.ip,
    points: 10, // 10 requests
    duration: 60, // per 60 seconds
});

// Rate limiting middleware
const rateLimitMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.body?.message?.from?.id || req.ip);
        next();
    } catch (rejRes) {
        const timeRemaining = Math.round(rejRes.msBeforeNext / 1000);
        console.warn(`⚠️ Rate limit exceeded for user: ${req.body?.message?.from?.id || req.ip}`);
        
        // Send rate limit message to user if it's a Telegram webhook
        if (req.body?.message?.chat?.id) {
            bot.sendMessage(
                req.body.message.chat.id,
                `⏱️ Too many requests! Please wait ${timeRemaining} seconds before trying again.`
            );
        }
        
        res.status(429).json({
            error: 'Rate limit exceeded',
            retryAfter: timeRemaining
        });
    }
};

// Initialize Telegram Bot with enhanced configuration
const bot = new TelegramBot(BOT_TOKEN, {
    webHook: NODE_ENV === 'production' ? {
        port: PORT,
        host: '0.0.0.0'
    } : false,
    polling: NODE_ENV === 'development' ? {
        interval: 1000, // Poll every second
        autoStart: true,
        params: {
            timeout: 10, // Timeout for each poll request
        }
    } : false
});

// Validate bot token by trying to get bot info
async function validateBotToken() {
    try {
        const botInfo = await bot.getMe();
        console.log(`✅ Bot connected successfully: @${botInfo.username} (${botInfo.first_name})`);
        return true;
    } catch (error) {
        console.error('❌ Bot token validation failed:', error.message);
        console.warn('⚠️ This might be due to:');
        console.warn('   • Invalid or revoked bot token');
        console.warn('   • Network connectivity issues');
        console.warn('   • Firewall blocking Telegram API access');
        console.warn('💡 Server will continue running for local web interface testing');
        return false;
    }
}

// Only validate token in development mode
if (NODE_ENV === 'development') {
    validateBotToken();
}

// Initialize system modules
const verificationSystem = new VerificationSystem();
const botCommands = new BotCommands(bot, verificationSystem);
const messageHandler = new MessageHandler(bot, verificationSystem);
const securityUtils = new SecurityUtils();

// Set webhook for production
if (NODE_ENV === 'production' && WEBHOOK_URL) {
    bot.setWebHook(`${WEBHOOK_URL}/bot${BOT_TOKEN}`)
        .then(() => {
            console.log('✅ Webhook set successfully');
        })
        .catch((error) => {
            console.error('❌ Failed to set webhook:', error);
        });
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: require('./package.json').version,
        uptime: process.uptime(),
        environment: NODE_ENV
    });
});

// Metrics endpoint
app.get('/metrics', (req, res) => {
    res.json({
        memory: process.memoryUsage(),
        cpu: process.cpuUsage(),
        uptime: process.uptime(),
        activeVerifications: verificationSystem.getActiveVerifications(),
        totalVerifications: verificationSystem.getTotalVerifications()
    });
});

// Bot webhook endpoint (production)
if (NODE_ENV === 'production') {
    app.post(`/bot${BOT_TOKEN}`, rateLimitMiddleware, (req, res) => {
        try {
            bot.processUpdate(req.body);
            res.sendStatus(200);
        } catch (error) {
            console.error('❌ Error processing webhook:', error);
            res.sendStatus(500);
        }
    });
}

// API endpoint for web interface integration
app.post('/api/verify', rateLimitMiddleware, async (req, res) => {
    try {
        const { content, userId = 'web-user', sessionId } = req.body;
        
        if (!content || typeof content !== 'string') {
            return res.status(400).json({
                error: 'Content is required and must be a string'
            });
        }

        // Security validation
        if (!securityUtils.validateContent(content)) {
            return res.status(400).json({
                error: 'Content contains potentially harmful elements'
            });
        }

        const verificationId = sessionId || uuidv4();
        const result = await verificationSystem.verifyContent(content, userId, verificationId);
        
        res.json({
            success: true,
            verificationId,
            result
        });
    } catch (error) {
        console.error('❌ API verification error:', error);
        res.status(500).json({
            error: 'Internal server error',
            message: NODE_ENV === 'development' ? error.message : 'Verification failed'
        });
    }
});

// Static file serving for web interface
app.use(express.static(path.join(__dirname, '../'), {
    index: 'index.html',
    setHeaders: (res, path) => {
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
        } else if (path.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg)$/)) {
            res.setHeader('Cache-Control', 'public, max-age=31536000');
        }
    }
}));

// Bot command handlers
bot.onText(/\/start/, (msg) => botCommands.handleStart(msg));
bot.onText(/\/help/, (msg) => botCommands.handleHelp(msg));
bot.onText(/\/verify (.+)/, (msg, match) => botCommands.handleVerify(msg, match[1]));
bot.onText(/\/demo/, (msg) => botCommands.handleDemo(msg));
bot.onText(/\/stats/, (msg) => botCommands.handleStats(msg));
bot.onText(/\/settings/, (msg) => botCommands.handleSettings(msg));

// Handle all text messages that don't match commands
bot.on('message', (msg) => {
    if (!msg.text?.startsWith('/')) {
        messageHandler.handleTextMessage(msg);
    }
});

// Handle photos
bot.on('photo', (msg) => messageHandler.handlePhotoMessage(msg));

// Handle documents
bot.on('document', (msg) => messageHandler.handleDocumentMessage(msg));

// Handle callback queries from inline keyboards
bot.on('callback_query', (callbackQuery) => {
    messageHandler.handleCallbackQuery(callbackQuery);
});

// Error handling
bot.on('error', (error) => {
    console.error('❌ Telegram Bot Error:', error);
});

bot.on('webhook_error', (error) => {
    console.error('❌ Webhook Error:', error);
});

// Handle polling errors specifically
bot.on('polling_error', (error) => {
    console.error('❌ Polling Error:', error);
    
    // Check if it's a network connectivity issue
    if (error.code === 'EFATAL' || error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
        console.warn('⚠️ Network connectivity issue detected. This might be due to:');
        console.warn('   • Firewall blocking outbound connections to Telegram servers');
        console.warn('   • Invalid or revoked bot token');
        console.warn('   • Network restrictions in your environment');
        console.warn('   • Docker container network configuration');
        console.warn('💡 Bot server will continue running for webhook mode or local testing');
        
        // Don't exit the process, just log the error
        return;
    }
    
    // For other types of polling errors, log but don't crash
    console.warn('⚠️ Polling error occurred, bot will continue running');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`\n🔄 Received ${signal}. Starting graceful shutdown...`);
    
    // Stop accepting new connections
    server.close((err) => {
        if (err) {
            console.error('❌ Error during server shutdown:', err);
            process.exit(1);
        }
        
        console.log('✅ Server closed successfully');
        
        // Close bot connection
        if (NODE_ENV === 'development') {
            bot.stopPolling();
        }
        
        console.log('✅ Bot stopped successfully');
        process.exit(0);
    });
    
    // Force shutdown after 30 seconds
    setTimeout(() => {
        console.error('❌ Forced shutdown after timeout');
        process.exit(1);
    }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const server = app.listen(PORT, () => {
    console.log('🚀 Multi-Agent Verification Bot Server');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📡 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${NODE_ENV}`);
    console.log(`🤖 Bot mode: ${NODE_ENV === 'production' ? 'Webhook' : 'Polling'}`);
    console.log(`⏰ Started at: ${new Date().toISOString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    if (NODE_ENV === 'development') {
        console.log('💡 Development tips:');
        console.log('   • Web interface: http://localhost:' + PORT);
        console.log('   • Health check: http://localhost:' + PORT + '/health');
        console.log('   • Bot will poll for messages automatically');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    }
});

module.exports = { app, bot, server };