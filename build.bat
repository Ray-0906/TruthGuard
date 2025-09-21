@echo off
REM Build script for Multi-Agent AI Verification System (Windows)

echo 🐳 Building Multi-Agent AI Verification System Docker Container
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if docker-compose is available
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    docker compose version >nul 2>&1
    if %errorlevel% neq 0 (
        echo ❌ Docker Compose is not installed. Please install Docker Compose first.
        pause
        exit /b 1
    )
)

REM Create logs directory if it doesn't exist
if not exist logs mkdir logs

REM Copy environment file if it doesn't exist
if not exist .env (
    echo 📋 Creating .env file from template...
    copy .env.example .env
    echo ⚠️  Please edit .env file with your actual configuration before running!
)

REM Build the Docker image
echo 🔨 Building Docker image...
docker build -t multi-agent-verification:latest .

if %errorlevel% equ 0 (
    echo ✅ Build completed successfully!
    echo.
    echo 📝 Next steps:
    echo    1. Edit .env file with your Telegram bot token
    echo    2. Run: run.bat
    echo    3. Access web interface at http://localhost:8000
    echo    4. Bot server will be available at http://localhost:3000
) else (
    echo ❌ Build failed!
)

pause