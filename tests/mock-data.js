/**
 * Mock test data for Beagle Security MCP server testing
 */

export const mockTestData = {
  // Project data
  project: {
    name: 'Test Security Project',
    description: 'A test project for security scanning',
    projectKey: 'test-proj-12345'
  },

  // Application data
  application: {
    name: 'Test Web Application',
    url: 'https://example.com',
    applicationToken: 'test-app-token-67890',
    type: 'WEB'
  },

  // Test session data
  testSession: {
    resultToken: 'test-result-token-abcdef',
    status: 'running',
    progress: 75
  },

  // Team data
  team: {
    teamId: 'test-team-id-xyz123',
    teamName: 'Security Team'
  }
};

export const mockApiResponses = {
  // Project responses
  createProject: {
    code: 'SUCCESS',
    message: 'Project created successfully',
    name: 'Test Security Project',
    description: 'A test project for security scanning',
    projectKey: 'test-proj-12345'
  },

  listProjects: {
    code: 'SUCCESS',
    message: 'Projects retrieved successfully',
    projects: [
      {
        name: 'Test Security Project',
        description: 'A test project for security scanning',
        projectKey: 'test-proj-12345',
        applications: [
          {
            name: 'Test Web Application',
            url: 'https://example.com',
            applicationToken: 'test-app-token-67890',
            applicationType: 'WEB',
            signatureStatus: 'Verified',
            hostingType: 'public'
          }
        ]
      }
    ]
  },

  // Application responses
  createApplication: {
    code: 'SUCCESS',
    message: 'Application created successfully',
    name: 'Test Web Application',
    url: 'https://example.com',
    applicationToken: 'test-app-token-67890',
    projectKey: 'test-proj-12345',
    signatureStatus: 'NotVerified',
    hostingType: 'public'
  },

  getApplication: {
    code: 'SUCCESS',
    message: 'Application retrieved successfully',
    application: {
      name: 'Test Web Application',
      url: 'https://example.com',
      applicationToken: 'test-app-token-67890',
      applicationType: 'WEB',
      signatureStatus: 'Verified',
      hostingType: 'public'
    }
  },

  // Domain verification responses
  getDomainSignature: {
    code: 'SUCCESS',
    message: 'Domain signatures retrieved successfully',
    status: 'NotVerified',
    url: 'https://example.com',
    fileSignature: {
      signature: 'beagle-security-verification-12345abcdef'
    },
    dnsSignature: {
      type: 'TXT',
      name: '_beagle-security-verification',
      value: 'beagle-security=12345abcdef'
    },
    apiSignature: {
      type: 'API',
      path: '/.well-known/beagle-security-verification.txt',
      value: 'beagle-security-verification-12345abcdef'
    }
  },

  verifyDomain: {
    code: 'SUCCESS_SIGNATURE_VERIFICATION',
    message: 'Domain verification successful'
  },

  // Test responses
  startTest: {
    code: 'SUCCESS',
    message: 'Test has been started successfully',
    statusUrl: 'https://api.beaglesecurity.com/rest/v2/test/status',
    resultUrl: 'https://api.beaglesecurity.com/rest/v2/test/result',
    resultToken: 'test-result-token-abcdef'
  },

  getTestStatus: {
    code: 'SUCCESS',
    message: 'Test status retrieved successfully',
    status: 'running',
    progress: 75
  },

  stopTest: {
    code: 'SUCCESS',
    message: 'Test stopped successfully'
  },

  getTestResult: {
    code: 'SUCCESS',
    message: 'Test results retrieved successfully',
    result: JSON.stringify({
      summary: {
        totalVulnerabilities: 5,
        highRisk: 1,
        mediumRisk: 2,
        lowRisk: 2
      },
      vulnerabilities: [
        {
          title: 'SQL Injection',
          severity: 'High',
          description: 'SQL injection vulnerability detected',
          recommendation: 'Use parameterized queries'
        }
      ]
    })
  },

  listTestSessions: {
    code: 'SUCCESS',
    message: 'Test sessions retrieved successfully',
    sessions: [
      {
        resultToken: 'test-result-token-1',
        startTime: 1640995200000,
        endTime: 1640998800000
      },
      {
        resultToken: 'test-result-token-2',
        startTime: 1640908800000,
        endTime: 1640912400000
      }
    ]
  },

  listRunningTests: {
    code: 'SUCCESS',
    message: 'Running tests retrieved successfully',
    sessions: [
      {
        title: 'Security Scan - Test Web Application',
        url: 'https://example.com',
        applicationToken: 'test-app-token-67890',
        resultToken: 'test-result-token-running',
        startTime: 1640995200000
      }
    ]
  }
};

export const testScenarios = {
  // Happy path scenarios
  happyPath: {
    'beagle_create_project': {
      args: {
        name: mockTestData.project.name,
        description: mockTestData.project.description
      },
      expectedResponse: mockApiResponses.createProject
    },
    
    'beagle_list_projects': {
      args: { includeTeam: false },
      expectedResponse: mockApiResponses.listProjects
    },

    'beagle_create_application': {
      args: {
        name: mockTestData.application.name,
        url: mockTestData.application.url,
        projectKey: mockTestData.project.projectKey,
        type: mockTestData.application.type
      },
      expectedResponse: mockApiResponses.createApplication
    },

    'beagle_start_test': {
      args: {
        applicationToken: mockTestData.application.applicationToken
      },
      expectedResponse: mockApiResponses.startTest
    }
  },

  // Error scenarios
  errorCases: {
    'beagle_create_project': [
      {
        name: 'missing_name',
        args: { description: 'Test description' },
        expectedError: 'Missing required parameter: name'
      },
      {
        name: 'empty_name',
        args: { name: '', description: 'Test description' },
        expectedError: 'Invalid parameter: name cannot be empty'
      }
    ],

    'beagle_create_application': [
      {
        name: 'invalid_type',
        args: {
          name: 'Test App',
          url: 'https://example.com',
          projectKey: 'test-key',
          type: 'INVALID'
        },
        expectedError: 'Invalid application type'
      }
    ]
  }
};
