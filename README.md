# Beagle Security MCP Server

This is a Model Context Protocol (MCP) server that provides integration with the Beagle Security API. It allows you to manage projects, applications, and automated security testing through the Beagle Security platform.

## Features

- **Project Management**: Create, modify, list, and delete projects
- **Application Management**: Create, get, modify, list, and delete applications
- **Domain Verification**: Get verification signatures and verify domain ownership with multiple signature types
- **Security Testing**: Start, monitor, stop, and retrieve results from automated penetration tests
- **Team Support**: Work with team projects and tests

## Installation

### Option 1: Docker (Recommended)

1. Clone this repository
2. Set up your environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API token
   ```
3. Build and run with Docker:
   ```bash
   npm run docker:build
   npm run docker:run
   ```

Or use Docker Compose:
```bash
docker-compose up -d
```

### Option 2: Local Installation

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the project:
   ```bash
   npm run build
   ```

## Configuration

### Environment Variables

Set your Beagle Security API token as an environment variable:

```bash
export BEAGLE_SECURITY_API_TOKEN=your_api_token_here
```

You can obtain an API token from your Beagle Security account settings (Profile → Personal access token).

### MCP Configuration

#### Docker Configuration

Add the server to your MCP configuration file:

```json
{
  "mcpServers": {
    "beagle-security": {
      "command": "docker",
      "args": [
        "run", 
        "--rm", 
        "-i", 
        "--env", "BEAGLE_SECURITY_API_TOKEN=your_api_token_here",
        "--env", "NODE_ENV=production",
        "mcp/beagle-security-mcp-server"
      ]
    }
  }
}
```

#### Local Configuration

For local installations:

```json
{
  "mcpServers": {
    "beagle-security": {
      "command": "node",
      "args": ["path/to/beagle-security-mcp-server/build/index.js"],
      "env": {
        "BEAGLE_SECURITY_API_TOKEN": "your_api_token_here"
      }
    }
  }
}
```

## Available Tools (18 Total)

### Project Management (4 tools)

- `beagle_create_project`: Create a new project
- `beagle_modify_project`: Modify an existing project
- `beagle_list_projects`: List all projects and applications
- `beagle_delete_project`: Delete a project

### Application Management (5 tools)

- `beagle_create_application`: Create a new application in a project
- `beagle_get_application`: Get application details by token
- `beagle_modify_application`: Modify an existing application
- `beagle_list_applications`: List all applications under a project
- `beagle_delete_application`: Delete an application

### Domain Verification (2 tools)

- `beagle_get_domain_signature`: Get domain verification signature
- `beagle_verify_domain`: Complete domain verification with FILE, DNS, or API signature types

### Security Testing (7 tools)

- `beagle_start_test`: Start an automated penetration test
- `beagle_get_test_status`: Get the status of a running test
- `beagle_stop_test`: Stop a running test
- `beagle_get_test_result`: Get detailed test results in JSON format
- `beagle_list_test_sessions`: List all test sessions for an application
- `beagle_list_running_tests`: List all running tests for user or team (supports team filtering)


## Testing

### Comprehensive Test Suite

Run all tests to validate functionality:

```bash
# Run complete test suite (recommended)
npm run test:all

# Test individual components
npm run test:tools          # Test all 18 MCP tools
npm run test:integration    # Integration & API tests
npm run test                # Unit tests

# Test with real API (requires token)
BEAGLE_SECURITY_API_TOKEN=your_token npm run test:all
```

### Test Features

- **Tool Validation**: Tests all 18 tools with proper parameters
- **API Integration**: Live API testing when credentials provided
- **Error Handling**: Validates error scenarios and edge cases
- **Cross-Platform**: Works on Linux, macOS, and Windows
- **Docker Testing**: Validates container functionality

For detailed testing information, see [TESTING.md](./TESTING.md).

## Development

### Docker Development

```bash
# Build Docker image
npm run docker:build

# Run with Docker
npm run docker:run

# Use Docker Compose
npm run docker:compose:up

# View logs
npm run docker:compose:logs

# Stop services
npm run docker:compose:down
```

### Local Development

```bash
# Running in Development Mode
npm run dev

# Building
npm run build

# Starting the Server
npm start
```

## API Reference

This server implements the Beagle Security API v2.0. For detailed API documentation, visit:
https://beaglesecurity.com/developer/apidoc

## API Compatibility

This server implements **Beagle Security API v2.0** with:
- ✅ **All endpoints verified** against official documentation
- ✅ **Correct parameter naming** (camelCase format)
- ✅ **Proper error handling** for all API response codes
- ✅ **Latest API features** including domain verification types

## Error Handling

The server includes comprehensive error handling for:
- Authentication errors (invalid API tokens)
- HTTP errors (network issues, server errors)  
- Validation errors (missing required parameters)
- API-specific errors (returned by Beagle Security)
- Cross-platform compatibility issues

## Security Considerations

- Keep your API token secure and never commit it to version control
- Use environment variables or secure configuration management
- Ensure proper scopes are set when generating API tokens
- Monitor API usage to detect unauthorized access

## Troubleshooting

### Common Issues

1. **Server won't start**: Run `npm run build` to check for build errors
2. **API calls failing**: Verify your `BEAGLE_SECURITY_API_TOKEN` is valid
3. **Docker issues**: Ensure Docker is installed and running
4. **macOS timeout errors**: Install with `brew install coreutils` or tests will auto-fallback

### Getting Help

- Run the test suite: `npm run test:all`
- Check the logs in development mode: `NODE_ENV=development npm start`
- Review [TESTING.md](./TESTING.md) for detailed troubleshooting

## API Reference

Complete API documentation: https://beaglesecurity.com/developer/apidoc

## License

MIT License
