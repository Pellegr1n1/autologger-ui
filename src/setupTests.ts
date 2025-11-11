import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// Polyfills para APIs do Node.js que não estão disponíveis no jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock para window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Polyfill para ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};

// Mock para import.meta.env (Vite) usando process.env
process.env.VITE_GOOGLE_CLIENT_ID = 'test-client-id';
process.env.VITE_API_BASE_URL = 'http://localhost:3001';
process.env.MODE = 'test';
process.env.PROD = 'false';
process.env.DEV = 'true';

// Mock globalThis.import.meta for Jest
(globalThis as any).import = {
  meta: {
    env: {
      VITE_GOOGLE_CLIENT_ID: 'test-client-id',
      VITE_API_BASE_URL: 'http://localhost:3001',
      MODE: 'test',
      PROD: false,
      DEV: true,
    },
  },
};

// Suppress console errors and warnings in tests
const originalError = console.error;
const originalWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Convert all args to string for checking
    const errorMessages = args.map(arg => {
      if (typeof arg === 'string') return arg;
      if (arg instanceof Error) {
        return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ''}`;
      }
      if (arg && typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    // Suppress React 18 act warnings and Ant Design warnings
    if (
      errorMessages.includes('act(') ||
      errorMessages.includes('Warning: [antd:') ||
      errorMessages.includes('not wrapped in act') ||
      errorMessages.includes('Warning: `value` in Select options should not be `null`') ||
      errorMessages.includes('Warning: Instance created by `useForm` is not connected') ||
      errorMessages.includes('Forget to pass `form` prop') ||
      errorMessages.includes('is using incorrect casing') ||
      errorMessages.includes('is unrecognized in this browser') ||
      errorMessages.includes('Received `true` for a non-boolean attribute') ||
      errorMessages.includes('React does not recognize the') ||
      errorMessages.includes('If you want to write it to the DOM') ||
      errorMessages.includes('If you meant to render a React component') ||
      errorMessages.includes('The tag <') ||
      errorMessages.includes('Use PascalCase for React components')
    ) {
      return;
    }
    
    // Suppress network errors during tests
    if (
      errorMessages.includes('Network error') ||
      errorMessages.includes('Network Error') ||
      errorMessages.includes('ECONNREFUSED') ||
      errorMessages.includes('connect ECONNREFUSED') ||
      errorMessages.includes('Erro ao solicitar recuperação de senha') ||
      errorMessages.includes('Erro ao enviar email de verificação') ||
      errorMessages.includes('Erro ao verificar email') ||
      errorMessages.includes('Erro ao carregar informações do veículo') ||
      errorMessages.includes('Erro no registro') ||
      errorMessages.includes('AxiosError') ||
      errorMessages.includes('ERR_NETWORK') ||
      errorMessages.includes('Not implemented: window.getComputedStyle') ||
      errorMessages.includes('Not implemented: navigation') ||
      (args[0]?.message && (
        args[0].message.includes('Network') ||
        args[0].message.includes('ECONNREFUSED') ||
        args[0].message.includes('ERR_NETWORK') ||
        args[0].message.includes('Not implemented')
      )) ||
      (args[0]?.name === 'AxiosError')
    ) {
      return;
    }
    
    originalError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    const warnMessages = args.map(arg => String(arg)).join(' ');
    
    // Suppress Ant Design warnings and React warnings
    if (
      args[0]?.includes?.('Warning: [antd:') ||
      warnMessages.includes('Warning: `value` in Select options') ||
      warnMessages.includes('Warning: Instance created by `useForm`') ||
      warnMessages.includes('act(') ||
      warnMessages.includes('not wrapped in act')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalError;
  console.warn = originalWarn;
});

