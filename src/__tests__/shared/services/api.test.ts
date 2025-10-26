import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('ApiBase', () => {
  // We need to import after mocks
  let ApiBase: any;
  let axios: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock localStorage
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value;
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
      };
    })();
    
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
  });

  afterEach(() => {
    jest.resetModules();
    localStorage.clear();
  });

  describe('token management', () => {
    it('should set token in localStorage', () => {
      const { apiBase } = require('../../../shared/services/api');
      apiBase.setToken('test-token-123');
      
      expect(localStorage.getItem('autologger_token')).toBe('test-token-123');
    });

    it('should get token from localStorage', () => {
      localStorage.setItem('autologger_token', 'test-token-123');
      const { apiBase } = require('../../../shared/services/api');
      
      const token = apiBase.getToken();
      expect(token).toBe('test-token-123');
    });

    it('should return null when token does not exist', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      const token = apiBase.getToken();
      expect(token).toBeNull();
    });

    it('should remove token from localStorage', () => {
      localStorage.setItem('autologger_token', 'test-token-123');
      const { apiBase } = require('../../../shared/services/api');
      
      apiBase.removeToken();
      expect(localStorage.getItem('autologger_token')).toBeNull();
    });

    it('should check if user is authenticated', () => {
      localStorage.setItem('autologger_token', 'test-token-123');
      const { apiBase } = require('../../../shared/services/api');
      
      expect(apiBase.isAuthenticated()).toBe(true);
    });

    it('should return false when user is not authenticated', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      expect(apiBase.isAuthenticated()).toBe(false);
    });
  });

  describe('logout', () => {
    it('should remove token and navigate to login when navigate function provided', () => {
      const mockNavigate = jest.fn();
      localStorage.setItem('autologger_token', 'test-token-123');
      const { apiBase } = require('../../../shared/services/api');
      
      apiBase.logout(mockNavigate);
      
      expect(localStorage.getItem('autologger_token')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect to login page when navigate function not provided', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // Mock window.location.href
      delete (window as any).location;
      (window as any).location = { href: '' };
      
      apiBase.logout();
      
      expect(localStorage.getItem('autologger_token')).toBeNull();
    });
  });

  describe('API configuration', () => {
    it('should get API instance', () => {
      const { apiBase } = require('../../../shared/services/api');
      const instance = apiBase.getApiInstance();
      
      expect(instance).toBeDefined();
      expect(instance.defaults).toBeDefined();
    });

    it('should set base URL', () => {
      const { apiBase } = require('../../../shared/services/api');
      apiBase.setBaseURL('https://api.example.com');
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.baseURL).toBe('https://api.example.com');
    });

    it('should set timeout', () => {
      const { apiBase } = require('../../../shared/services/api');
      apiBase.setTimeout(5000);
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.timeout).toBe(5000);
    });

    it('should set headers', () => {
      const { apiBase } = require('../../../shared/services/api');
      const customHeaders = { 'X-Custom-Header': 'test-value' };
      
      apiBase.setHeaders(customHeaders);
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.headers.common['X-Custom-Header']).toBe('test-value');
    });
  });
});

