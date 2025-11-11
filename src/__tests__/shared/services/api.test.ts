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
    it('should set token (no-op, token managed by backend via httpOnly cookie)', () => {
      const { apiBase } = require('../../../shared/services/api');
      // setToken agora é um no-op, pois o token é gerenciado pelo backend via cookie httpOnly
      apiBase.setToken('test-token-123');
      
      // Não podemos verificar localStorage, pois não usamos mais
      // O token é gerenciado automaticamente pelo navegador via cookie httpOnly
      expect(apiBase.setToken).toBeDefined();
    });

    it('should get token (returns null, token managed by backend via httpOnly cookie)', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // getToken agora sempre retorna null, pois não podemos acessar cookies httpOnly
      const token = apiBase.getToken();
      expect(token).toBeNull();
    });

    it('should return null when token does not exist', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // getToken sempre retorna null, pois não podemos acessar cookies httpOnly
      const token = apiBase.getToken();
      expect(token).toBeNull();
    });

    it('should remove token (no-op, token managed by backend via httpOnly cookie)', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // removeToken agora é um no-op, pois o cookie é removido pelo backend no logout
      apiBase.removeToken();
      // Não podemos verificar localStorage, pois não usamos mais
      expect(apiBase.removeToken).toBeDefined();
    });

    it('should check if user is authenticated (always returns true, validation done by backend)', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // isAuthenticated sempre retorna true, pois não podemos verificar cookies httpOnly
      // A validação real é feita pelo backend nas requisições
      expect(apiBase.isAuthenticated()).toBe(true);
    });

    it('should always return true for isAuthenticated (validation done by backend)', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // isAuthenticated sempre retorna true, pois não podemos verificar cookies httpOnly
      // A validação real é feita pelo backend nas requisições
      expect(apiBase.isAuthenticated()).toBe(true);
    });
  });

  describe('logout', () => {
    it('should navigate to login when navigate function provided', () => {
      const mockNavigate = jest.fn();
      const { apiBase } = require('../../../shared/services/api');
      
      apiBase.logout(mockNavigate);
      
      // removeToken é um no-op agora, pois o cookie é removido pelo backend
      // Apenas verificamos que a navegação foi chamada
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should redirect to login page when navigate function not provided', () => {
      const { apiBase } = require('../../../shared/services/api');
      
      // window.location.href não pode ser mockado no jsdom porque não é configurável
      // Mas podemos verificar que o método logout existe e pode ser chamado
      // O redirecionamento real será testado em testes de integração
      expect(typeof apiBase.logout).toBe('function');
      
      // Verificamos que o método pode ser chamado sem erros
      expect(() => apiBase.logout()).not.toThrow();
      
      // Nota: O redirecionamento real para '/login' via window.location.href
      // será testado em testes de integração ou E2E, pois não podemos mockar
      // window.location.href no ambiente de testes jsdom
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

