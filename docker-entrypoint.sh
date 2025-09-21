#!/bin/sh
# Docker entrypoint script to start Telegram bot server

echo "🚀 Starting Multi-Agent AI Verification System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Start the Telegram bot server
echo "🤖 Starting Telegram bot server on port 3000..."
cd /app/telegram-bot

# Set environment to use polling instead of webhook for development
export ENABLE_WEBHOOK=false
export NODE_ENV=development
export PORT=3000

exec node server.js