@echo off
REM Run script for Multi-Agent AI Verification System (Windows)

echo 🚀 Starting Multi-Agent AI Verification System
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Check if .env file exists
if not exist .env (
    echo ❌ .env file not found. Please run build.bat first or copy .env.example to .env
    pause
    exit /b 1
)

REM Check if Docker image exists
docker image inspect multi-agent-verification:latest >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker image not found. Please run build.bat first.
    pause
    exit /b 1
)

REM Stop any existing containers
echo 🛑 Stopping existing containers...
docker-compose down >nul 2>&1

REM Start the services
echo 🐳 Starting Docker containers...
docker-compose up -d

if %errorlevel% equ 0 (
    REM Wait a moment for services to start
    timeout /t 5 /nobreak >nul
    
    echo ✅ Services started successfully!
    echo.
    echo 🌐 Access Points:
    echo    • Web Interface: http://localhost:8000
    echo    • Bot Admin Panel: http://localhost:3000
    echo    • Health Check: http://localhost:3000/health
    echo.
    echo 📱 Your Telegram bot is now active!
    echo    Send /start to your bot to begin verification
    echo.
    echo 📋 Management Commands:
    echo    • View logs: docker-compose logs -f
    echo    • Stop services: docker-compose down
    echo    • Restart: docker-compose restart
    echo.
    echo Press any key to continue...
) else (
    echo ❌ Failed to start services. Check logs with: docker-compose logs
)

pause