# Beagle Security MCP Server

This is a Model Context Protocol (MCP) server that provides integration with the Beagle Security API. It allows you to manage projects, applications, and automated security testing through the Beagle Security platform.

## Features

- **Project Management**: Create, list, and delete projects
- **Application Management**: Create, retrieve, update, and delete applications
- **Domain Verification**: Get verification signatures and verify domain ownership
- **Security Testing**: Start, monitor, and retrieve results from automated penetration tests
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
        "beagle-security-mcp-server"
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

## Available Tools

### Project Management

- `beagle_create_project`: Create a new project
- `beagle_list_projects`: List all projects and applications
- `beagle_delete_project`: Delete a project

### Application Management

- `beagle_create_application`: Create a new application in a project
- `beagle_get_application`: Get application details by token
- `beagle_list_applications`: List all applications under a project
- `beagle_delete_application`: Delete an application

### Domain Verification

- `beagle_get_domain_signature`: Get domain verification signature
- `beagle_verify_domain`: Complete domain verification

### Security Testing

- `beagle_start_test`: Start an automated penetration test
- `beagle_get_test_status`: Get the status of a running test
- `beagle_stop_test`: Stop a running test
- `beagle_get_test_result`: Get detailed test results in JSON format
- `beagle_list_test_sessions`: List all test sessions for an application
- `beagle_list_running_tests`: List all running tests for user or team

## Usage Examples

### Creating a Project

```typescript
// Create a new project
{
  "name": "My Security Project",
  "description": "Project for testing web applications"
}
```

### Creating an Application

```typescript
// Create a new web application
{
  "name": "My Web App",
  "url": "https://myapp.example.com",
  "projectKey": "project-key-123",
  "type": "WEB",
  "description": "Main web application"
}
```

### Starting a Security Test

```typescript
// Start a penetration test
{
  "applicationToken": "app-token-123",
  "testType": "comprehensive"
}
```

### Getting Test Results

```typescript
// Get test results
{
  "applicationToken": "app-token-123",
  "resultToken": "result-token-456"
}
```

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

## Error Handling

The server includes comprehensive error handling for:
- Authentication errors (invalid API tokens)
- HTTP errors (network issues, server errors)
- Validation errors (missing required parameters)
- API-specific errors (returned by Beagle Security)

## Security Considerations

- Keep your API token secure and never commit it to version control
- Use environment variables or secure configuration management
- Ensure proper scopes are set when generating API tokens
- Monitor API usage to detect unauthorized access

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
