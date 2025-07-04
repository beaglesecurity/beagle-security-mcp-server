#!/usr/bin/env node

import { spawn } from 'child_process';
import { createInterface } from 'readline';

/**
 * MCP Tool Tester
 * Tests all 18 Beagle Security MCP tools by sending JSON-RPC requests
 */

class MCPToolTester {
  constructor() {
    this.server = null;
    this.testResults = [];
    this.currentTest = 0;
    this.totalTests = 0;
  }

  async startServer() {
    return new Promise((resolve, reject) => {
      console.log('🚀 Starting MCP server...');
      this.server = spawn('node', ['build/index.js'], {
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_ENV: 'development'
        }
      });

      this.server.stderr.on('data', (data) => {
        const message = data.toString();
        if (message.includes('MCP server running')) {
          console.log('✅ MCP server started successfully');
          resolve();
        }
      });

      this.server.on('error', (error) => {
        console.error('❌ Failed to start server:', error);
        reject(error);
      });

      setTimeout(() => {
        if (this.server && this.server.pid) {
          resolve(); // Assume success if no error within timeout
        } else {
          reject(new Error('Server start timeout'));
        }
      }, 3000);
    });
  }

  async sendRequest(method, params = {}) {
    return new Promise((resolve) => {
      const id = Date.now();
      const request = {
        jsonrpc: '2.0',
        id,
        method,
        params
      };

      const requestStr = JSON.stringify(request) + '\n';
      
      let responseData = '';
      const timeout = setTimeout(() => {
        resolve({ error: 'Request timeout' });
      }, 10000);

      const dataHandler = (data) => {
        responseData += data.toString();
        try {
          const lines = responseData.split('\n');
          for (const line of lines) {
            if (line.trim()) {
              const response = JSON.parse(line);
              if (response.id === id) {
                clearTimeout(timeout);
                this.server.stdout.removeListener('data', dataHandler);
                resolve(response);
                return;
              }
            }
          }
        } catch (e) {
          // Continue waiting for complete response
        }
      };

      this.server.stdout.on('data', dataHandler);
      this.server.stdin.write(requestStr);
    });
  }

  async testListTools() {
    console.log('\n📋 Testing tool listing...');
    const response = await this.sendRequest('tools/list');
    
    if (response.error) {
      console.log('❌ Failed to list tools:', response.error);
      return false;
    }

    if (response.result && response.result.tools) {
      const tools = response.result.tools;
      console.log(`✅ Found ${tools.length} tools:`);
      tools.forEach(tool => {
        console.log(`   - ${tool.name}: ${tool.description}`);
      });
      this.totalTests = tools.length;
      return tools;
    }

    console.log('❌ Invalid response format');
    return false;
  }

  async testTool(toolName, args, description) {
    this.currentTest++;
    console.log(`\n[${this.currentTest}/${this.totalTests}] 🔧 Testing ${toolName}...`);
    console.log(`   Description: ${description}`);
    
    if (args) {
      console.log(`   Parameters: ${JSON.stringify(args, null, 2)}`);
    }

    const response = await this.sendRequest('tools/call', {
      name: toolName,
      arguments: args || {}
    });

    const result = {
      tool: toolName,
      success: false,
      error: null,
      response: null
    };

    if (response.error) {
      result.error = response.error;
      console.log(`   ❌ Error: ${JSON.stringify(response.error)}`);
    } else if (response.result) {
      result.success = true;
      result.response = response.result;
      console.log('   ✅ Success!');
      
      if (response.result.content && response.result.content[0]) {
        const content = response.result.content[0].text;
        // Show first 200 characters of response
        const preview = content.length > 200 ? content.substring(0, 200) + '...' : content;
        console.log(`   Response preview: ${preview}`);
      }
    } else {
      result.error = 'No result or error in response';
      console.log('   ❌ Invalid response format');
    }

    this.testResults.push(result);
    return result;
  }

  getTestData() {
    // Sample test data - replace with your actual test data
    return {
      projectKey: 'test-project-key',
      applicationToken: 'test-app-token',
      resultToken: 'test-result-token',
      teamId: 'test-team-id'
    };
  }

  async runAllTests() {
    try {
      const testData = this.getTestData();
      
      // First, list all available tools
      const tools = await this.testListTools();
      if (!tools) {
        throw new Error('Failed to get tools list');
      }

      console.log('\n🧪 Starting tool tests...');
      console.log('⚠️  Note: Some tests may fail without valid API tokens and test data\n');

      // Test each tool with appropriate parameters
      await this.testTool('beagle_create_project', {
        name: 'Test Project',
        description: 'Test project description'
      }, 'Create a new project');

      await this.testTool('beagle_list_projects', {
        includeTeam: false
      }, 'List all projects');

      await this.testTool('beagle_modify_project', {
        projectKey: testData.projectKey,
        name: 'Modified Test Project',
        description: 'Modified description'
      }, 'Modify an existing project');

      await this.testTool('beagle_delete_project', {
        projectKey: testData.projectKey
      }, 'Delete a project');

      await this.testTool('beagle_create_application', {
        name: 'Test App',
        url: 'https://test.example.com',
        projectKey: testData.projectKey,
        type: 'WEB'
      }, 'Create a new application');

      await this.testTool('beagle_get_application', {
        applicationToken: testData.applicationToken
      }, 'Get application details');

      await this.testTool('beagle_modify_application', {
        applicationToken: testData.applicationToken,
        name: 'Modified Test App',
        url: 'https://modified.example.com'
      }, 'Modify an application');

      await this.testTool('beagle_list_applications', {
        projectKey: testData.projectKey
      }, 'List applications in project');

      await this.testTool('beagle_delete_application', {
        applicationToken: testData.applicationToken
      }, 'Delete an application');

      await this.testTool('beagle_get_domain_signature', {
        applicationToken: testData.applicationToken
      }, 'Get domain verification signature');

      await this.testTool('beagle_verify_domain', {
        applicationToken: testData.applicationToken,
        signatureType: 'FILE'
      }, 'Verify domain ownership');

      await this.testTool('beagle_start_test', {
        applicationToken: testData.applicationToken
      }, 'Start a security test');

      await this.testTool('beagle_get_test_status', {
        applicationToken: testData.applicationToken,
        resultToken: testData.resultToken
      }, 'Get test status');

      await this.testTool('beagle_stop_test', {
        applicationToken: testData.applicationToken
      }, 'Stop a running test');

      await this.testTool('beagle_get_test_result', {
        applicationToken: testData.applicationToken,
        resultToken: testData.resultToken
      }, 'Get test results');

      await this.testTool('beagle_list_test_sessions', {
        applicationToken: testData.applicationToken,
        count: 10
      }, 'List test sessions');

      await this.testTool('beagle_list_running_tests', {}, 'List running tests');

      await this.testTool('beagle_list_running_tests', {
        teamId: testData.teamId
      }, 'List running tests for team');

    } catch (error) {
      console.error('❌ Test execution failed:', error);
    }
  }

  generateReport() {
    console.log('\n📊 TEST RESULTS SUMMARY');
    console.log('=' * 50);
    
    const successful = this.testResults.filter(r => r.success).length;
    const failed = this.testResults.filter(r => !r.success).length;
    
    console.log(`Total tests: ${this.testResults.length}`);
    console.log(`Successful: ${successful} ✅`);
    console.log(`Failed: ${failed} ❌`);
    console.log(`Success rate: ${((successful / this.testResults.length) * 100).toFixed(1)}%\n`);

    if (failed > 0) {
      console.log('FAILED TESTS:');
      this.testResults
        .filter(r => !r.success)
        .forEach(r => {
          console.log(`  ❌ ${r.tool}: ${r.error}`);
        });
      console.log();
    }

    console.log('SUCCESSFUL TESTS:');
    this.testResults
      .filter(r => r.success)
      .forEach(r => {
        console.log(`  ✅ ${r.tool}`);
      });

    return {
      total: this.testResults.length,
      successful,
      failed,
      successRate: (successful / this.testResults.length) * 100
    };
  }

  async cleanup() {
    if (this.server) {
      console.log('\n🧹 Cleaning up...');
      this.server.kill();
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  async run() {
    try {
      await this.startServer();
      await this.runAllTests();
      const report = this.generateReport();
      
      if (report.failed > 0) {
        console.log('\n⚠️  Some tests failed. This is expected without valid API credentials.');
        console.log('   To run full integration tests, set BEAGLE_SECURITY_API_TOKEN and provide valid test data.');
      }
      
    } catch (error) {
      console.error('❌ Test run failed:', error);
    } finally {
      await this.cleanup();
    }
  }
}

// Run the tests
const tester = new MCPToolTester();
tester.run().catch(console.error);
