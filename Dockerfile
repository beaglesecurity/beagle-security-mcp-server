# Use Node.js 20 Alpine for smaller image size
FROM node:20-alpine3.19

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for building)
RUN npm ci

# Copy source code
COPY src ./src
COPY tsconfig.json ./
COPY docker-entrypoint.sh ./

# Install TypeScript globally and build
RUN npm install -g typescript && \
    npm run build && \
    npm uninstall -g typescript

# Make entrypoint script executable and remove source files and dev dependencies
RUN chmod +x docker-entrypoint.sh && \
    rm -rf src tsconfig.json && \
    npm ci --only=production && \
    npm cache clean --force

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S mcpuser -u 1001

# Change ownership of the app directory
RUN chown -R mcpuser:nodejs /app
USER mcpuser

# Expose port (if needed for network mode)
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "console.log('MCP Server is healthy')" || exit 1

# Default command
ENTRYPOINT ["./docker-entrypoint.sh"]
