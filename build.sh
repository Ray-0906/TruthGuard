#!/bin/bash
# Build script for Multi-Agent AI Verification System

set -e

echo "🐳 Building Multi-Agent AI Verification System Docker Container"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create logs directory if it doesn't exist
mkdir -p logs

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your actual configuration before running!"
fi

# Build the Docker image
echo "🔨 Building Docker image..."
docker build -t multi-agent-verification:latest .

echo "✅ Build completed successfully!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env file with your Telegram bot token"
echo "   2. Run: ./run.sh (Linux/Mac) or run.bat (Windows)"
echo "   3. Access web interface at http://localhost:8000"
echo "   4. Bot server will be available at http://localhost:3000"