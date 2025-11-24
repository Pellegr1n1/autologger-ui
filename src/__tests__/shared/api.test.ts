import { describe, it, expect, jest, beforeEach } from '@jest/globals';

jest.mock('../../shared/utils/env', () => ({
  getApiBaseUrl: jest.fn(() => 'http://localhost:3001'),
  getGoogleClientId: jest.fn(() => 'test-client-id'),
  getEnvVar: jest.fn((key: string, defaultValue?: string) => {
    if (key === 'VITE_API_URL' || key === 'VITE_API_BASE_URL') {
      return 'http://localhost:3001';
    }
    if (key === 'VITE_GOOGLE_CLIENT_ID') {
      return 'test-client-id';
    }
    return defaultValue;
  }),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value.toString();
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock axios
jest.mock('axios', () => ({
  create: jest.fn(() => ({
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    patch: jest.fn(),
  })),
}));

describe('API Base', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should have api instance', () => {
    const { apiBase } = require('../../shared/services/api');
    expect(apiBase).toBeDefined();
    expect(apiBase.api).toBeDefined();
  });

  it('should have HTTP methods', () => {
    const { apiBase } = require('../../shared/services/api');
    expect(apiBase.api.get).toBeDefined();
    expect(apiBase.api.post).toBeDefined();
    expect(apiBase.api.put).toBeDefined();
    expect(apiBase.api.delete).toBeDefined();
    expect(apiBase.api.patch).toBeDefined();
  });
});

