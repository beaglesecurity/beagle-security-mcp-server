#!/bin/sh

# Docker entrypoint script for Beagle Security MCP Server

# Check if running in network mode
if [ "$MCP_MODE" = "network" ]; then
    echo "Starting MCP server in network mode on port ${MCP_PORT:-3000}"
    # Future: Add network server implementation
    exec node build/index.js
else
    echo "Starting MCP server in stdio mode"
    exec node build/index.js
fi
