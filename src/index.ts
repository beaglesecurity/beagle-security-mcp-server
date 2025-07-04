#!/usr/bin/env node

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from "@modelcontextprotocol/sdk/types.js";
import fetch, { RequestInit } from "node-fetch";

const API_BASE_URL = "https://api.beaglesecurity.com/rest/v2";

interface BeagleSecurityConfig {
  apiToken: string;
}

class BeagleSecurityMCPServer {
  private server: Server;
  private config: BeagleSecurityConfig;

  constructor() {
    this.server = new Server(
      {
        name: "beagle-security-mcp-server",
        version: "1.0.0",
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.config = {
      apiToken: process.env.BEAGLE_SECURITY_API_TOKEN || "",
    };

    this.setupToolHandlers();
  }

  private async makeRequest(endpoint: string, options: RequestInit = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${this.config.apiToken}`,
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    } as RequestInit);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          // Project Management Tools
          {
            name: "beagle_create_project",
            description: "Create a new project in Beagle Security",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Project name" },
                description: { type: "string", description: "Project description" },
                teamId: { type: "string", description: "Team ID (optional)" },
              },
              required: ["name"],
            },
          },
          {
            name: "beagle_list_projects",
            description: "List all projects and applications",
            inputSchema: {
              type: "object",
              properties: {
                includeTeam: { type: "boolean", description: "Include team projects" },
              },
            },
          },
          {
            name: "beagle_delete_project",
            description: "Delete a project",
            inputSchema: {
              type: "object",
              properties: {
                projectKey: { type: "string", description: "Project key to delete" },
              },
              required: ["projectKey"],
            },
          },
          
          // Application Management Tools
          {
            name: "beagle_create_application",
            description: "Create a new application in a project",
            inputSchema: {
              type: "object",
              properties: {
                name: { type: "string", description: "Application name" },
                url: { type: "string", description: "Application URL" },
                projectKey: { type: "string", description: "Project key" },
                type: { type: "string", enum: ["WEB", "API"], description: "Application type" },
                description: { type: "string", description: "Application description" },
              },
              required: ["name", "url", "projectKey", "type"],
            },
          },
          {
            name: "beagle_get_application",
            description: "Get application details by token",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
              },
              required: ["applicationToken"],
            },
          },
          {
            name: "beagle_list_applications",
            description: "List all applications under a project",
            inputSchema: {
              type: "object",
              properties: {
                projectKey: { type: "string", description: "Project key" },
              },
              required: ["projectKey"],
            },
          },
          {
            name: "beagle_delete_application",
            description: "Delete an application",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
              },
              required: ["applicationToken"],
            },
          },

          // Domain Verification Tools
          {
            name: "beagle_get_domain_signature",
            description: "Get domain verification signature",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
              },
              required: ["applicationToken"],
            },
          },
          {
            name: "beagle_verify_domain",
            description: "Complete domain verification",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                signature: { type: "string", description: "Domain verification signature" },
              },
              required: ["applicationToken", "signature"],
            },
          },

          // Testing Tools
          {
            name: "beagle_start_test",
            description: "Start an automated penetration test",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                testType: { type: "string", description: "Type of test to run" },
              },
              required: ["applicationToken"],
            },
          },
          {
            name: "beagle_get_test_status",
            description: "Get the status of a running test",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                resultToken: { type: "string", description: "Result token from test start" },
              },
              required: ["applicationToken", "resultToken"],
            },
          },
          {
            name: "beagle_stop_test",
            description: "Stop a running test",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                resultToken: { type: "string", description: "Result token from test start" },
              },
              required: ["applicationToken", "resultToken"],
            },
          },
          {
            name: "beagle_get_test_result",
            description: "Get detailed test results in JSON format",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                resultToken: { type: "string", description: "Result token from test start" },
              },
              required: ["applicationToken", "resultToken"],
            },
          },
          {
            name: "beagle_list_test_sessions",
            description: "List all test sessions for an application",
            inputSchema: {
              type: "object",
              properties: {
                applicationToken: { type: "string", description: "Application token" },
                count: { type: "number", description: "Number of sessions to retrieve" },
              },
              required: ["applicationToken"],
            },
          },
          {
            name: "beagle_list_running_tests",
            description: "List all running tests for user or team",
            inputSchema: {
              type: "object",
              properties: {
                teamId: { type: "string", description: "Team ID (optional, for team tests)" },
              },
            },
          },
        ] satisfies Tool[],
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          // Project Management
          case "beagle_create_project":
            return await this.createProject(args);
          case "beagle_list_projects":
            return await this.listProjects(args);
          case "beagle_delete_project":
            return await this.deleteProject(args);

          // Application Management
          case "beagle_create_application":
            return await this.createApplication(args);
          case "beagle_get_application":
            return await this.getApplication(args);
          case "beagle_list_applications":
            return await this.listApplications(args);
          case "beagle_delete_application":
            return await this.deleteApplication(args);

          // Domain Verification
          case "beagle_get_domain_signature":
            return await this.getDomainSignature(args);
          case "beagle_verify_domain":
            return await this.verifyDomain(args);

          // Testing
          case "beagle_start_test":
            return await this.startTest(args);
          case "beagle_get_test_status":
            return await this.getTestStatus(args);
          case "beagle_stop_test":
            return await this.stopTest(args);
          case "beagle_get_test_result":
            return await this.getTestResult(args);
          case "beagle_list_test_sessions":
            return await this.listTestSessions(args);
          case "beagle_list_running_tests":
            return await this.listRunningTests(args);

          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
        };
      }
    });
  }

  // Project Management Methods
  private async createProject(args: any) {
    const endpoint = args.teamId 
      ? `/projects?teamId=${args.teamId}`
      : "/projects";
    
    const result = await this.makeRequest(endpoint, {
      method: "POST",
      body: JSON.stringify({
        name: args.name,
        description: args.description,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Project created successfully:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async listProjects(args: any) {
    const endpoint = args.includeTeam 
      ? "/projects?include_team=true" 
      : "/projects";
    
    const result = await this.makeRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: `Projects:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async deleteProject(args: any) {
    const result = await this.makeRequest(`/projects?project_key=${args.projectKey}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Project deleted:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  // Application Management Methods
  private async createApplication(args: any) {
    const result = await this.makeRequest("/applications", {
      method: "POST",
      body: JSON.stringify({
        name: args.name,
        url: args.url,
        project_key: args.projectKey,
        type: args.type,
        description: args.description,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Application created successfully:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async getApplication(args: any) {
    const result = await this.makeRequest(`/applications?application_token=${args.applicationToken}`);

    return {
      content: [
        {
          type: "text",
          text: `Application details:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async listApplications(args: any) {
    const result = await this.makeRequest(`/applications?project_key=${args.projectKey}`);

    return {
      content: [
        {
          type: "text",
          text: `Applications:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async deleteApplication(args: any) {
    const result = await this.makeRequest(`/applications?application_token=${args.applicationToken}`, {
      method: "DELETE",
    });

    return {
      content: [
        {
          type: "text",
          text: `Application deleted:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  // Domain Verification Methods
  private async getDomainSignature(args: any) {
    const result = await this.makeRequest(`/applications/signature?application_token=${args.applicationToken}`);

    return {
      content: [
        {
          type: "text",
          text: `Domain verification signature:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async verifyDomain(args: any) {
    const result = await this.makeRequest("/applications/signature/verify", {
      method: "POST",
      body: JSON.stringify({
        application_token: args.applicationToken,
        signature: args.signature,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Domain verification result:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  // Testing Methods
  private async startTest(args: any) {
    const result = await this.makeRequest("/test/start", {
      method: "POST",
      body: JSON.stringify({
        application_token: args.applicationToken,
        test_type: args.testType,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Test started:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async getTestStatus(args: any) {
    const result = await this.makeRequest(
      `/test/status?application_token=${args.applicationToken}&result_token=${args.resultToken}`
    );

    return {
      content: [
        {
          type: "text",
          text: `Test status:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async stopTest(args: any) {
    const result = await this.makeRequest("/test/stop", {
      method: "POST",
      body: JSON.stringify({
        application_token: args.applicationToken,
        result_token: args.resultToken,
      }),
    });

    return {
      content: [
        {
          type: "text",
          text: `Test stopped:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async getTestResult(args: any) {
    const result = await this.makeRequest(
      `/test/result?application_token=${args.applicationToken}&result_token=${args.resultToken}`
    );

    return {
      content: [
        {
          type: "text",
          text: `Test results:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async listTestSessions(args: any) {
    const endpoint = args.count 
      ? `/test/sessions?application_token=${args.applicationToken}&count=${args.count}`
      : `/test/sessions?application_token=${args.applicationToken}`;
    
    const result = await this.makeRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: `Test sessions:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  private async listRunningTests(args: any) {
    const endpoint = args.teamId 
      ? `/test/runningsessions?teamid=${args.teamId}`
      : "/test/runningsessions";
    
    const result = await this.makeRequest(endpoint);

    return {
      content: [
        {
          type: "text",
          text: `Running tests:\n${JSON.stringify(result, null, 2)}`,
        },
      ],
    };
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error("Beagle Security MCP server running on stdio");
  }
}

const server = new BeagleSecurityMCPServer();
server.run().catch(console.error);
