# 🤖 Telegram Bot Deployment Guide

This guide provides comprehensive instructions for deploying the Multi-Agent AI Verification Telegram Bot. The bot integrates with the existing web application to provide verification services through Telegram chat interface.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Bot Setup](#bot-setup)
- [Local Development](#local-development)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Testing](#testing)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 8.0.0 or higher
- **Git**: For version control
- **Modern web browser**: For testing web interface integration

### Hosting Requirements
- **VPS/Cloud Server**: 1GB RAM, 1 vCPU minimum
- **Domain**: For webhook setup (production only)
- **SSL Certificate**: Required for Telegram webhooks
- **Internet Connection**: Stable connection for real-time bot responses

### Telegram Requirements
- **Telegram Account**: Personal account to create bot
- **BotFather Access**: Telegram's official bot for creating bots

## 🤖 Bot Setup

### Step 1: Create Telegram Bot

1. **Start a chat with BotFather**:
   - Open Telegram and search for `@BotFather`
   - Start a conversation with `/start`

2. **Create a new bot**:
   ```
   /newbot
   ```

3. **Choose bot name and username**:
   ```
   Bot Name: Multi-Agent Verification Bot
   Username: your_verification_bot (must end with 'bot')
   ```

4. **Save the bot token**:
   - BotFather will provide a token like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`
   - **Keep this token secure** - it's your bot's password

5. **Configure bot settings**:
   ```
   /setdescription - Set bot description
   /setabouttext - Set about text
   /setuserpic - Upload bot profile picture
   /setcommands - Set bot commands menu
   ```

### Step 2: Configure Bot Commands

Send `/setcommands` to BotFather and paste:

```
start - Welcome message and quick start guide
verify - Analyze specific content for misinformation
demo - Try example verification scenarios
help - Show detailed help and command guide
stats - View your verification statistics
settings - Configure bot preferences and notifications
```

### Step 3: Configure Bot Privacy

```
/setprivacy - Disable (allows bot to read group messages)
/setjoingroups - Enable (allows adding bot to groups)
/setinline - Enable (allows inline queries)
```

## 💻 Local Development

### Step 1: Install Dependencies

```bash
# Navigate to telegram-bot directory
cd telegram-bot

# Install Node.js dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Step 2: Configure Environment

Edit `.env` file with your settings:

```bash
# Required settings
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
NODE_ENV=development
PORT=3000

# Optional settings for development
ENABLE_DEV_COMMANDS=true
DEBUG_MODE=true
```

### Step 3: Start Development Server

```bash
# Start in development mode (with auto-restart)
npm run dev

# Or start normally
npm start
```

### Step 4: Test Bot Locally

1. **Start the server**: You should see:
   ```
   🚀 Multi-Agent Verification Bot Server
   📡 Server running on port 3000
   🤖 Bot mode: Polling
   ```

2. **Test in Telegram**:
   - Find your bot in Telegram (search for username)
   - Send `/start` to begin
   - Try `/demo` for test scenarios
   - Send any text to trigger verification

3. **Test Web Integration**:
   - Open `http://localhost:3000` in browser
   - Should show the original web interface
   - API endpoint available at `/api/verify`

## 🌐 Production Deployment

### Option 1: Heroku Deployment (Recommended for Beginners)

#### Prerequisites
- Heroku CLI installed
- Git repository set up

#### Steps

1. **Prepare for Heroku**:
   ```bash
   # Create Procfile
   echo "web: node server.js" > Procfile
   
   # Ensure package.json has start script
   # "start": "node server.js"
   ```

2. **Deploy to Heroku**:
   ```bash
   # Login to Heroku
   heroku login
   
   # Create Heroku app
   heroku create your-verification-bot
   
   # Set environment variables
   heroku config:set TELEGRAM_BOT_TOKEN=your_token
   heroku config:set NODE_ENV=production
   heroku config:set WEBHOOK_URL=https://your-verification-bot.herokuapp.com
   
   # Deploy
   git add .
   git commit -m "Deploy bot to Heroku"
   git push heroku main
   ```

3. **Verify Deployment**:
   ```bash
   # Check app status
   heroku ps:scale web=1
   heroku logs --tail
   
   # Test webhook
   heroku open
   ```

### Option 2: DigitalOcean/VPS Deployment

#### Prerequisites
- VPS with Ubuntu 20.04+
- Domain name pointed to server
- SSH access to server

#### Steps

1. **Server Setup**:
   ```bash
   # Update system
   sudo apt update && sudo apt upgrade -y
   
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Install Nginx
   sudo apt install nginx
   ```

2. **Deploy Application**:
   ```bash
   # Clone repository
   git clone https://github.com/username/multi-agent-verification.git
   cd multi-agent-verification/telegram-bot
   
   # Install dependencies
   npm install --production
   
   # Copy environment file
   cp .env.example .env
   
   # Edit environment variables
   nano .env
   ```

3. **Configure Environment**:
   ```bash
   # .env file for production
   TELEGRAM_BOT_TOKEN=your_token
   NODE_ENV=production
   PORT=3000
   WEBHOOK_URL=https://your-domain.com
   ```

4. **Setup SSL with Let's Encrypt**:
   ```bash
   # Install Certbot
   sudo apt install certbot python3-certbot-nginx
   
   # Get SSL certificate
   sudo certbot --nginx -d your-domain.com
   ```

5. **Configure Nginx**:
   ```bash
   # Create Nginx config
   sudo nano /etc/nginx/sites-available/verification-bot
   ```

   Add configuration:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       return 301 https://$server_name$request_uri;
   }
   
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
       ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   ```bash
   # Enable site
   sudo ln -s /etc/nginx/sites-available/verification-bot /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl reload nginx
   ```

6. **Start Application**:
   ```bash
   # Start with PM2
   pm2 start server.js --name verification-bot
   pm2 startup
   pm2 save
   ```

### Option 3: Railway Deployment

#### Steps

1. **Prepare Repository**:
   ```bash
   # Ensure package.json has correct start script
   # "start": "node server.js"
   ```

2. **Deploy to Railway**:
   ```bash
   # Install Railway CLI
   npm install -g @railway/cli
   
   # Login to Railway
   railway login
   
   # Initialize project
   railway init
   
   # Set environment variables
   railway variables set TELEGRAM_BOT_TOKEN=your_token
   railway variables set NODE_ENV=production
   
   # Deploy
   railway up
   ```

3. **Configure Webhook**:
   ```bash
   # Get Railway URL
   railway domain
   
   # Set webhook URL
   railway variables set WEBHOOK_URL=https://your-app.railway.app
   ```

### Option 4: Docker Deployment

#### Create Dockerfile

```dockerfile
# Create telegram-bot/Dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S botuser -u 1001

# Change ownership
RUN chown -R botuser:nodejs /app
USER botuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js

# Start application
CMD ["node", "server.js"]
```

#### Deploy with Docker

```bash
# Build image
docker build -t verification-bot .

# Run container
docker run -d \
  --name verification-bot \
  -p 3000:3000 \
  -e TELEGRAM_BOT_TOKEN=your_token \
  -e NODE_ENV=production \
  -e WEBHOOK_URL=https://your-domain.com \
  verification-bot

# Check logs
docker logs verification-bot
```

## ⚙️ Environment Configuration

### Required Variables

```bash
# Bot Configuration
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
NODE_ENV=development|production
PORT=3000

# Webhook (Production Only)
WEBHOOK_URL=https://your-domain.com
```

### Optional Variables

```bash
# Security
ALLOWED_ORIGINS=http://localhost:8000,https://your-domain.com
RATE_LIMIT_POINTS=10
RATE_LIMIT_DURATION=60
MAX_CONTENT_LENGTH=5000
MAX_FILE_SIZE_MB=10

# Features
ENABLE_NEWS_AGENT=true
ENABLE_FACT_AGENT=true
ENABLE_SCAM_AGENT=true
ENABLE_PHISHING_AGENT=true
ENABLE_IMAGE_AGENT=true
ENABLE_VIDEO_AGENT=true

# Development
ENABLE_DEV_COMMANDS=true
DEBUG_MODE=false
MOCK_RESPONSE_DELAY=true

# Logging
LOG_LEVEL=info
ENABLE_REQUEST_LOGGING=false

# External APIs (Optional)
OPENAI_API_KEY=your_openai_key
GOOGLE_FACTCHECK_API_KEY=your_google_key
```

## 🧪 Testing

### Manual Testing Checklist

#### Bot Commands
- [ ] `/start` - Shows welcome message
- [ ] `/help` - Displays help information
- [ ] `/verify text` - Analyzes provided text
- [ ] `/demo` - Shows demo scenarios
- [ ] `/stats` - Displays user statistics
- [ ] `/settings` - Shows settings menu

#### Message Types
- [ ] **Text Messages** - Automatic analysis
- [ ] **Photos** - Image analysis simulation
- [ ] **Documents** - Document processing
- [ ] **Forwarded Messages** - Handles forwarded content
- [ ] **Long Messages** - Proper length validation

#### Interactive Features
- [ ] **Inline Keyboards** - Button responses work
- [ ] **Demo Scenarios** - All scenarios trigger correctly
- [ ] **Callback Queries** - Button actions function
- [ ] **Error Handling** - Graceful error messages

#### Security Features
- [ ] **Rate Limiting** - Prevents spam
- [ ] **Content Validation** - Blocks malicious input
- [ ] **File Size Limits** - Rejects large files
- [ ] **URL Validation** - Identifies suspicious links

### Automated Testing

```bash
# Run tests (if implemented)
npm test

# Test specific components
npm run test:bot
npm run test:verification
npm run test:security
```

### Load Testing

```bash
# Install artillery for load testing
npm install -g artillery

# Create load test config
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 5
scenarios:
  - name: "API Load Test"
    requests:
      - post:
          url: "/api/verify"
          json:
            content: "Test content for verification"
            userId: "test-user"
EOF

# Run load test
artillery run load-test.yml
```

## 📊 Monitoring

### Health Checks

```bash
# Check application health
curl http://localhost:3000/health

# Check metrics
curl http://localhost:3000/metrics
```

### PM2 Monitoring (Production)

```bash
# View process status
pm2 status

# View logs
pm2 logs verification-bot

# Monitor in real-time
pm2 monit

# Restart if needed
pm2 restart verification-bot
```

### Log Monitoring

```bash
# View application logs
tail -f /var/log/verification-bot/app.log

# View Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### Uptime Monitoring

Set up external monitoring with services like:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Advanced monitoring features
- **StatusCake**: Comprehensive monitoring

## 🔧 Troubleshooting

### Common Issues

#### Bot Not Responding

**Problem**: Bot doesn't respond to messages

**Solutions**:
```bash
# Check bot token
echo $TELEGRAM_BOT_TOKEN

# Verify bot is running
ps aux | grep node

# Check logs for errors
tail -f logs/app.log

# Test webhook (production)
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo
```

#### Webhook Errors

**Problem**: Webhook not receiving updates

**Solutions**:
```bash
# Check webhook status
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/getWebhookInfo

# Delete and reset webhook
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/deleteWebhook

# Set webhook again
curl -X POST https://api.telegram.org/bot$TELEGRAM_BOT_TOKEN/setWebhook \
  -d "url=https://your-domain.com/bot$TELEGRAM_BOT_TOKEN"

# Check SSL certificate
curl -I https://your-domain.com
```

#### High Memory Usage

**Problem**: Application using too much memory

**Solutions**:
```bash
# Check memory usage
free -m
top -p $(pgrep node)

# Restart application
pm2 restart verification-bot

# Optimize memory (add to package.json)
"start": "node --max-old-space-size=512 server.js"
```

#### Rate Limiting Issues

**Problem**: Users getting rate limited

**Solutions**:
```bash
# Adjust rate limits in .env
RATE_LIMIT_POINTS=20
RATE_LIMIT_DURATION=60

# Clear rate limit cache (restart app)
pm2 restart verification-bot
```

### Debug Mode

Enable debug mode for detailed logging:

```bash
# Set environment variable
DEBUG_MODE=true

# Or run with debug flag
DEBUG=* npm start
```

### Performance Issues

```bash
# Monitor CPU usage
top -p $(pgrep node)

# Profile memory
node --inspect server.js

# Optimize for production
NODE_ENV=production npm start
```

### SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in /etc/letsencrypt/live/your-domain.com/fullchain.pem -text -noout

# Renew certificate
sudo certbot renew

# Test SSL
curl -I https://your-domain.com
```

## 🔄 Updates and Maintenance

### Regular Maintenance Tasks

#### Daily
- [ ] Check application logs for errors
- [ ] Monitor bot response times
- [ ] Verify webhook status

#### Weekly
- [ ] Review rate limiting statistics
- [ ] Check disk space usage
- [ ] Update security patches

#### Monthly
- [ ] Update Node.js dependencies
- [ ] Review SSL certificate expiration
- [ ] Backup configuration files
- [ ] Performance optimization review

### Update Procedure

```bash
# 1. Backup current version
cp -r telegram-bot telegram-bot-backup

# 2. Pull updates
git pull origin main

# 3. Install dependencies
npm install

# 4. Test in development
NODE_ENV=development npm start

# 5. Deploy to production
pm2 restart verification-bot

# 6. Verify deployment
curl http://localhost:3000/health
```

### Rollback Procedure

```bash
# If deployment fails, rollback
cp -r telegram-bot-backup/* telegram-bot/
pm2 restart verification-bot
```

## 📞 Support

For additional support:

- **Documentation**: Check inline code comments
- **Issues**: Create GitHub issue with error logs
- **Community**: Join project discussions
- **Email**: Contact development team

---

**🎉 Congratulations! Your Multi-Agent Verification Bot is ready to fight misinformation on Telegram!**