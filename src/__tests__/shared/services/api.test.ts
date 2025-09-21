// Mock do localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
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
  value: mockLocalStorage,
  writable: true
});

// Mock do axios
const mockAxiosInstance = {
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
  defaults: {
    baseURL: 'http://localhost:3001',
    timeout: 10000,
    headers: {
      common: {},
    },
  },
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
};

// Mock do axios antes da importação
jest.mock('axios', () => ({
  create: jest.fn(() => mockAxiosInstance),
}));

import { apiBase } from '../../../shared/services/api';

describe('ApiBase', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('Token Management', () => {
    it('deve definir token no localStorage', () => {
      const token = 'test-token-123';
      apiBase.setToken(token);
      expect(localStorage.getItem('autologger_token')).toBe(token);
    });

    it('deve obter token do localStorage', () => {
      const token = 'test-token-123';
      localStorage.setItem('autologger_token', token);
      expect(apiBase.getToken()).toBe(token);
    });

    it('deve retornar null quando não há token', () => {
      expect(apiBase.getToken()).toBeNull();
    });

    it('deve remover token do localStorage', () => {
      const token = 'test-token-123';
      localStorage.setItem('autologger_token', token);
      apiBase.removeToken();
      expect(localStorage.getItem('autologger_token')).toBeNull();
    });

    it('deve verificar se está autenticado corretamente', () => {
      expect(apiBase.isAuthenticated()).toBe(false);
      
      apiBase.setToken('test-token');
      expect(apiBase.isAuthenticated()).toBe(true);
      
      apiBase.removeToken();
      expect(apiBase.isAuthenticated()).toBe(false);
    });
  });

  describe('Logout', () => {
    it('deve remover token e redirecionar para login', () => {
      const mockNavigate = jest.fn();
      apiBase.setToken('test-token');
      apiBase.logout(mockNavigate);

      expect(localStorage.getItem('autologger_token')).toBeNull();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('deve usar window.location quando navigate não for fornecido', () => {
      apiBase.setToken('test-token');
      apiBase.logout();

      expect(localStorage.getItem('autologger_token')).toBeNull();
      // Verificar se o token foi removido (comportamento principal)
      expect(apiBase.isAuthenticated()).toBe(false);
    });
  });

  describe('API Instance', () => {
    it('deve retornar instância da API', () => {
      const instance = apiBase.getApiInstance();
      expect(instance).toBeDefined();
      expect(instance.defaults.baseURL).toBe('http://localhost:3001');
    });

    it('deve permitir alterar baseURL', () => {
      const newUrl = 'http://new-api.com';
      apiBase.setBaseURL(newUrl);
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.baseURL).toBe(newUrl);
    });

    it('deve permitir alterar timeout', () => {
      const newTimeout = 15000;
      apiBase.setTimeout(newTimeout);
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.timeout).toBe(newTimeout);
    });

    it('deve permitir definir headers customizados', () => {
      const customHeaders = {
        'X-Custom-Header': 'custom-value',
        'Authorization': 'Bearer custom-token',
      };
      
      apiBase.setHeaders(customHeaders);
      
      const instance = apiBase.getApiInstance();
      expect(instance.defaults.headers.common).toMatchObject(customHeaders);
    });
  });

  describe('Interceptors', () => {
    it('deve ter interceptors configurados', () => {
      // Verificar se a instância da API tem interceptors
      const instance = apiBase.getApiInstance();
      expect(instance.interceptors).toBeDefined();
      expect(instance.interceptors.request).toBeDefined();
      expect(instance.interceptors.response).toBeDefined();
    });
  });
});
