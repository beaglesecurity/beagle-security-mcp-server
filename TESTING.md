# Testing Guide for Beagle Security MCP Server

This document provides comprehensive testing strategies and tools for validating the Beagle Security MCP server functionality.

## 🧪 Test Suite Overview

The testing framework includes multiple test types to ensure reliability and functionality:

1. **Unit Tests** - Individual component testing
2. **Tool Tests** - MCP tool functionality validation
3. **Integration Tests** - Real API integration testing
4. **Performance Tests** - Load and response time testing
5. **Docker Tests** - Container functionality validation

## 🚀 Quick Start

### Run All Tests
```bash
npm run test:all
```

### Run Individual Test Types
```bash
# Tool functionality tests
npm run test:tools

# Integration tests
npm run test:integration

# Unit tests (Jest)
npm run test

# With API token for live testing
BEAGLE_SECURITY_API_TOKEN=your_token npm run test:integration
```

## 📋 Test Categories

### 1. Tool Functionality Tests (`npm run test:tools`)

Tests all 18 MCP tools to ensure they:
- Accept correct parameters
- Reject invalid parameters
- Handle errors gracefully
- Return proper response formats

**Tools Tested:**
- **Projects (4):** create, modify, list, delete
- **Applications (5):** create, get, modify, list, delete  
- **Domain Verification (2):** get signature, verify domain
- **Testing (7):** start, status, stop, results, sessions, running tests

### 2. Integration Tests (`npm run test:integration`)

Tests real API integration when credentials are provided:
- Live API connectivity
- Authentication validation
- Response format verification
- Error handling with real API responses

### 3. Mock Testing

When no API token is provided, tests run in mock mode:
- Parameter validation
- Request/response structure
- Error handling
- Tool chaining workflows

## 🔧 Test Configuration

### Environment Variables

```bash
# Required for live API testing
BEAGLE_SECURITY_API_TOKEN=your_api_token

# Optional test data
TEST_PROJECT_KEY=existing_project_key
TEST_APPLICATION_TOKEN=existing_app_token
TEST_TEAM_ID=your_team_id
```

### Test Data

Mock test data is defined in `tests/mock-data.js`:
- Sample projects, applications, and test results
- Error scenarios and edge cases
- Expected API responses

## 📊 Test Reports

### Sample Output

```
🧪 Beagle Security MCP Server Test Suite
========================================

📦 Phase 1: Build and Syntax Validation
✅ Build successful

🔍 Phase 2: TypeScript Type Checking  
✅ Type checking passed

🚀 Phase 3: Server Startup Test
✅ Server starts without errors

🔧 Phase 4: Tool Discovery and Validation
[1/18] 🔧 Testing beagle_create_project...
   ✅ Success!
[2/18] 🔧 Testing beagle_list_projects...
   ✅ Success!
...

📊 TEST RESULTS SUMMARY
===============================
Total tests: 18
Successful: 16 ✅
Failed: 2 ❌
Success rate: 88.9%
```

## 🐛 Troubleshooting

### Common Issues

1. **Server Won't Start**
   ```bash
   # Check build
   npm run build
   
   # Check TypeScript
   npx tsc --noEmit
   ```

2. **"timeout: command not found" on macOS**
   ```bash
   # Install coreutils via Homebrew
   brew install coreutils
   
   # Or run tests without timeout (automatic fallback)
   npm run test:all
   ```

3. **API Tests Failing**
   ```bash
   # Verify API token
   echo $BEAGLE_SECURITY_API_TOKEN
   
   # Test with curl
   curl -H "Authorization: Bearer $BEAGLE_SECURITY_API_TOKEN" \
        https://api.beaglesecurity.com/rest/v2/projects
   ```

4. **Docker Tests Failing**
   ```bash
   # Check Docker installation
   docker --version
   
   # Rebuild image
   npm run docker:build
   ```

### Debug Mode

Enable detailed logging for debugging:

```bash
# Run tools test with debug output
DEBUG=1 npm run test:tools

# Run server in development mode
NODE_ENV=development npm start
```

## 📝 Writing Custom Tests

### Adding New Tool Tests

1. **Update test-tools.js:**
   ```javascript
   await this.testTool('your_new_tool', {
     parameter1: 'value1',
     parameter2: 'value2'
   }, 'Description of what it tests');
   ```

2. **Add mock data in mock-data.js:**
   ```javascript
   export const mockApiResponses = {
     yourNewTool: {
       code: 'SUCCESS',
       message: 'Tool executed successfully',
       // ... expected response
     }
   };
   ```

### Custom Integration Tests

Create test scenarios in `tests/integration.js`:

```javascript
async testCustomWorkflow() {
  // Step 1: Setup
  const project = await this.createTestProject();
  
  // Step 2: Execute
  const result = await this.executeWorkflow(project);
  
  // Step 3: Validate
  this.validateResult(result);
}
```

## 🔄 Continuous Integration

### GitHub Actions Example

```yaml
name: Test MCP Server
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm install
      - run: npm run test:all
        env:
          BEAGLE_SECURITY_API_TOKEN: ${{ secrets.BEAGLE_API_TOKEN }}
```

### Docker Testing in CI

```yaml
  docker-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm run docker:build
      - run: docker run --rm mcp/beagle-security-mcp-server
```

## 📈 Performance Testing

### Load Testing

Test concurrent tool calls:
```bash
# Test server under load
for i in {1..10}; do
  npm run test:tools &
done
wait
```

### Memory Testing

Monitor resource usage:
```bash
# Start server and monitor
npm start &
SERVER_PID=$!
while kill -0 $SERVER_PID 2>/dev/null; do
  ps -p $SERVER_PID -o pid,vsz,rss,pcpu,pmem,comm
  sleep 5
done
```

## 🎯 Test Coverage Goals

- **Tool Coverage:** 100% (all 18 tools tested)
- **Parameter Validation:** 100% (all required/optional params)
- **Error Scenarios:** 90% (common error conditions)
- **Integration Paths:** 80% (major API workflows)

## 📞 Support

For testing issues:

1. Check the [main README](./README.md) for setup instructions
2. Review the [API documentation](https://beaglesecurity.com/developer/apidoc)
3. Run diagnostics: `npm run test:all`
4. Check server logs in development mode

## 🔮 Future Enhancements

- [ ] Automated performance benchmarking
- [ ] Visual test reporting dashboard
- [ ] API response validation schemas
- [ ] Parallel test execution
- [ ] Test data generation tools
