#!/bin/bash
# Run script for Multi-Agent AI Verification System

set -e

echo "🚀 Starting Multi-Agent AI Verification System"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ .env file not found. Please run build.sh first or copy .env.example to .env"
    exit 1
fi

# Check if Docker image exists
if ! docker image inspect multi-agent-verification:latest >/dev/null 2>&1; then
    echo "❌ Docker image not found. Please run build.sh first."
    exit 1
fi

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Start the services
echo "🐳 Starting Docker containers..."
docker-compose up -d

# Wait a moment for services to start
sleep 5

# Check if services are running
echo "🔍 Checking service health..."
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services started successfully!"
    echo ""
    echo "🌐 Access Points:"
    echo "   • Web Interface: http://localhost:8000"
    echo "   • Bot Admin Panel: http://localhost:3000"
    echo "   • Health Check: http://localhost:3000/health"
    echo ""
    echo "📱 Your Telegram bot is now active!"
    echo "   Send /start to your bot to begin verification"
    echo ""
    echo "📋 Management Commands:"
    echo "   • View logs: docker-compose logs -f"
    echo "   • Stop services: docker-compose down"
    echo "   • Restart: docker-compose restart"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi