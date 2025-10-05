import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '../../features/auth/components/AuthContext';

// Mock do tema do Ant Design para testes
const mockTheme = {
  token: {
    colorPrimary: '#8B5CF6',
    colorInfo: '#A78BFA',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgContainer: '#161B22',
    colorBgBase: '#0D1117',
    colorBgLayout: '#0D1117',
    colorText: '#F9FAFB',
    colorTextSecondary: '#6B7280',
    colorBorder: '#6B7280',
    borderRadius: 8,
  },
  components: {
    Layout: {
      siderBg: '#161B22',
      headerBg: '#161B22',
      bodyBg: '#0D1117',
    },
  },
};

// Wrapper customizado para testes
const AllTheProviders = ({ children }: { children: React.ReactNode }) => {
  return React.createElement(
    BrowserRouter,
    null,
    React.createElement(
      ConfigProvider,
      { theme: mockTheme },
      React.createElement(
        AuthProvider,
        null,
        children
      )
    )
  );
};

// Função de render customizada
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

// Mock de dados de usuário para testes
export const mockUser = {
  id: '1',
  name: 'João Silva',
  email: 'joao@test.com',
  isActive: true,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

// Mock de dados de login
export const mockLoginData = {
  email: 'joao@test.com',
  password: '123456',
};

// Mock de dados de registro
export const mockRegisterData = {
  name: 'João Silva',
  email: 'joao@test.com',
  password: '123456',
  confirmPassword: '123456',
};

// Mock de resposta de autenticação
export const mockAuthResponse = {
  access_token: 'mock-token-123',
  user: {
    id: '1',
    name: 'João Silva',
    email: 'joao@test.com',
  },
};

// Mock de status blockchain
export const mockBlockchainStatus = {
  status: 'CONFIRMED' as const,
  lastUpdate: new Date('2024-01-01T00:00:00.000Z'),
  retryCount: 0,
  maxRetries: 3,
  message: 'Transação confirmada com sucesso',
};

// Função para mockar localStorage
export const mockLocalStorage = () => {
  const store: { [key: string]: string } = {};

  return {
    getItem: jest.fn((key: string) => store[key] || null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: jest.fn((key: string) => {
      delete store[key];
    }),
    clear: jest.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
  };
};

// Função para mockar fetch/axios
export const mockFetch = (data: any, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(data),
  });
};

// Função para mockar axios
export const mockAxios: any = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
  create: jest.fn(() => mockAxios),
  interceptors: {
    request: {
      use: jest.fn(),
    },
    response: {
      use: jest.fn(),
    },
  },
};

// Função para aguardar elementos aparecerem
export const waitForElementToBeRemoved = async (element: HTMLElement): Promise<boolean> => {
  return new Promise((resolve) => {
    const observer = new MutationObserver(() => {
      if (!document.body.contains(element)) {
        observer.disconnect();
        resolve(true);
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };

// Test básico para evitar erro de "no tests"
describe('Test Utils', () => {
  it('should export custom render function', () => {
    expect(customRender).toBeDefined();
    expect(typeof customRender).toBe('function');
  });

  it('should export mock data', () => {
    expect(mockUser).toBeDefined();
    expect(mockLoginData).toBeDefined();
    expect(mockRegisterData).toBeDefined();
    expect(mockAuthResponse).toBeDefined();
    expect(mockBlockchainStatus).toBeDefined();
  });
});
