# Multi-Agent AI Verification System - Docker Container
# This container runs both the web interface and Telegram bot

FROM node:18-alpine AS base

# Install Python for the web server
RUN apk add --no-cache python3 py3-pip

# Set working directory
WORKDIR /app

# Copy package files for dependency installation
COPY telegram-bot/package*.json ./telegram-bot/

# Install Node.js dependencies
WORKDIR /app/telegram-bot
RUN npm ci --only=production && npm cache clean --force

# Copy the entire application
WORKDIR /app
COPY . .

# Create a non-root user for security
RUN addgroup -g 1001 -S appgroup && \
    adduser -S appuser -u 1001 -G appgroup

# Change ownership of app directory
RUN chown -R appuser:appgroup /app

# Switch to non-root user
USER appuser

# Expose ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/health || exit 1

# Create startup script
COPY --chown=appuser:appgroup docker-entrypoint.sh /app/
RUN chmod +x /app/docker-entrypoint.sh

# Start both services
CMD ["/app/docker-entrypoint.sh"]