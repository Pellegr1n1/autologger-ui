import '@testing-library/jest-dom';

// Polyfills para Node.js
import { TextEncoder, TextDecoder } from 'util';

// Configurar polyfills
if (typeof globalThis.TextEncoder === 'undefined') {
  globalThis.TextEncoder = TextEncoder;
}
if (typeof globalThis.TextDecoder === 'undefined') {
  globalThis.TextDecoder = TextDecoder as any;
}

// jest-dom matchers já estão configurados via @testing-library/jest-dom

// Mock do localStorage
const localStorageMock = {
  getItem: jest.fn((key: string) => {
    return (localStorageMock as any)[key] || null;
  }),
  setItem: jest.fn((key: string, value: string) => {
    (localStorageMock as any)[key] = value;
  }),
  removeItem: jest.fn((key: string) => {
    delete (localStorageMock as any)[key];
  }),
  clear: jest.fn(() => {
    Object.keys(localStorageMock).forEach(key => {
      if (key !== 'getItem' && key !== 'setItem' && key !== 'removeItem' && key !== 'clear') {
        delete (localStorageMock as any)[key];
      }
    });
  }),
  length: 0,
  key: jest.fn()
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true
});

// Mock do window.location - não é necessário para a maioria dos testes

// Mock do console para evitar logs desnecessários nos testes
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  console.error = (...args: any[]) => {
    // Filtrar erros de navegação do JSDOM
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Not implemented: navigation'))
    ) {
      return;
    }
    // Filtrar erros do JSDOM sobre navegação
    if (args[0] && args[0].message && args[0].message.includes('Not implemented: navigation')) {
      return;
    }
    originalConsoleError.call(console, ...args);
  };

  console.warn = (...args: any[]) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Warning: ReactDOM.render is no longer supported') ||
       args[0].includes('Not implemented: navigation'))
    ) {
      return;
    }
    originalConsoleWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Limpar localStorage antes de cada teste
beforeEach(() => {
  localStorageMock.clear();
});

// Mock do IntersectionObserver
if (typeof globalThis.IntersectionObserver === 'undefined') {
  (globalThis as any).IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
}

// Mock do ResizeObserver
if (typeof globalThis.ResizeObserver === 'undefined') {
  (globalThis as any).ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  };
}

// Mock do matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock do fetch se necessário
if (typeof globalThis.fetch === 'undefined') {
  globalThis.fetch = jest.fn();
}

// Mock do apiBase será feito nos arquivos de teste específicos