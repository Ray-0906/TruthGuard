# 🐳 Docker Deployment Guide

This guide covers deploying the Multi-Agent AI Verification System using Docker for easy deployment and scalability.

## 📦 What's Included

The Docker setup includes:
- **Unified Container**: Both web interface and Telegram bot in one container
- **Docker Compose**: Easy orchestration and configuration
- **Environment Management**: Secure configuration via environment variables
- **Health Checks**: Automatic health monitoring
- **Logging**: Persistent log storage
- **Security**: Non-root user, minimal attack surface

## 🚀 Quick Start

### Prerequisites
- Docker Desktop (Windows/Mac) or Docker Engine (Linux)
- Docker Compose v2.0+

### 1. Build the Container
```bash
# Linux/Mac
./build.sh

# Windows
build.bat
```

### 2. Configure Environment
Edit `.env` file with your configuration:
```env
BOT_TOKEN=your-telegram-bot-token-here
NODE_ENV=production
```

### 3. Run the Application
```bash
# Linux/Mac
./run.sh

# Windows
run.bat
```

## 📁 Docker Files Overview

```
multi-agent-verification/
├── Dockerfile              # Main container definition
├── docker-compose.yml      # Service orchestration
├── docker-entrypoint.sh    # Container startup script
├── .dockerignore           # Build optimization
├── .env.example            # Environment template
├── build.sh / build.bat    # Build scripts
└── run.sh / run.bat        # Run scripts
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram Bot Token (required) | - |
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Bot server port | `3000` |
| `WEB_PORT` | Web interface port | `8000` |
| `RATE_LIMIT_MAX_REQUESTS` | Rate limit per window | `100` |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window (ms) | `900000` |
| `ENABLE_WEBHOOK` | Use webhooks vs polling | `false` |
| `LOG_LEVEL` | Logging level | `info` |

### Docker Compose Services

#### Main Application
- **Container**: `multi-agent-verification-system`
- **Ports**: `3000` (bot), `8000` (web)
- **Health Check**: `/health` endpoint
- **Restart Policy**: `unless-stopped`

#### Optional Nginx Proxy (Production)
```bash
# Enable production profile
docker-compose --profile production up -d
```

## 🛠️ Management Commands

### Basic Operations
```bash
# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Restart services
docker-compose restart

# View running containers
docker-compose ps

# Update and restart
docker-compose pull && docker-compose up -d
```

### Maintenance
```bash
# Enter container shell
docker-compose exec multi-agent-verification sh

# View resource usage
docker stats

# Clean up unused images
docker image prune -f
```

## 📊 Monitoring

### Health Checks
- **Endpoint**: `http://localhost:3000/health`
- **Interval**: 30 seconds
- **Timeout**: 10 seconds
- **Retries**: 3

### Logging
Logs are persisted in `./logs` directory:
```bash
# Real-time logs
docker-compose logs -f

# Application logs
tail -f logs/app.log

# Error logs
tail -f logs/error.log
```

## 🚀 Production Deployment

### 1. Security Hardening
```bash
# Generate secure secrets
openssl rand -hex 32  # For SESSION_SECRET
openssl rand -hex 32  # For JWT_SECRET
```

### 2. Reverse Proxy (Optional)
Enable Nginx proxy for SSL termination:
```bash
# Create SSL certificates
mkdir -p ssl

# Update nginx.conf with your domain
# Start with production profile
docker-compose --profile production up -d
```

### 3. Environment Configuration
```env
NODE_ENV=production
ENABLE_WEBHOOK=true
WEBHOOK_URL=https://yourdomain.com/webhook
LOG_LEVEL=warn
```

## 🔒 Security Features

- **Non-root user**: Container runs as `appuser` (UID 1001)
- **Minimal base image**: Alpine Linux for smaller attack surface
- **Read-only config**: Environment file mounted read-only
- **Health monitoring**: Automatic restart on failure
- **Rate limiting**: Built-in request rate limiting
- **Input validation**: Comprehensive input sanitization

## 🌐 Scaling

### Horizontal Scaling
```yaml
# docker-compose.override.yml
version: '3.8'
services:
  multi-agent-verification:
    scale: 3
    ports:
      - "8000-8002:8000"
      - "3000-3002:3000"
```

### Load Balancing
Use Nginx or cloud load balancer to distribute traffic across instances.

## 🐛 Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clean Docker cache
docker system prune -f
docker builder prune -f

# Rebuild without cache
docker-compose build --no-cache
```

#### Port Conflicts
```bash
# Check port usage
netstat -tulpn | grep :3000
netstat -tulpn | grep :8000

# Use different ports
PORT=3001 WEB_PORT=8001 docker-compose up -d
```

#### Memory Issues
```bash
# Check container resource usage
docker stats

# Increase Docker memory limit in Docker Desktop
# Settings → Resources → Memory
```

### Log Analysis
```bash
# Container logs
docker-compose logs multi-agent-verification

# System logs
docker system events

# Health check logs
docker inspect --format='{{range .State.Health.Log}}{{.Output}}{{end}}' container_name
```

## 📈 Performance Optimization

### Image Size Optimization
- Multi-stage builds reduce final image size
- `.dockerignore` excludes unnecessary files
- Alpine base image (minimal footprint)

### Runtime Optimization
- Node.js production mode
- Dependency caching
- Health check intervals tuned for responsiveness

### Resource Limits
```yaml
# docker-compose.yml
services:
  multi-agent-verification:
    deploy:
      resources:
        limits:
          memory: 512M
          cpus: '1.0'
        reservations:
          memory: 256M
          cpus: '0.5'
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest code
git pull

# Rebuild and restart
./build.sh && ./run.sh
```

### Dependency Updates
```bash
# Update Node.js dependencies
docker-compose exec multi-agent-verification npm update

# Rebuild with latest base images
docker-compose build --pull
```

### Backup and Restore
```bash
# Backup configuration
cp .env .env.backup
tar -czf config-backup.tar.gz .env logs/

# Restore configuration
tar -xzf config-backup.tar.gz
```

This Docker setup provides a production-ready deployment solution for your Multi-Agent AI Verification System with comprehensive management, monitoring, and security features.