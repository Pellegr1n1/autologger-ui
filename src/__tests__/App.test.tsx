import { describe, it, expect, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import App from '../App';

// Mock do BrowserRouter
jest.mock('react-router-dom', () => ({
  BrowserRouter: ({ children }: { children: React.ReactNode }) => <div data-testid="browser-router">{children}</div>,
  Route: ({ children }: { children: React.ReactNode }) => <div data-testid="route">{children}</div>,
}));

// Mock do AuthProvider
jest.mock('../features/auth', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="auth-provider">{children}</div>,
}));

// Mock do Router
jest.mock('../app/router/Router', () => ({
  __esModule: true,
  default: () => <div data-testid="router">Router Component</div>,
}));

// Mock do ConfigProvider
jest.mock('antd', () => ({
  ConfigProvider: ({ children }: { children: React.ReactNode }) => <div data-testid="config-provider">{children}</div>,
}));

describe('App', () => {
  it('should render without crashing', () => {
    render(<App />);
  });

  it('should render ConfigProvider', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('config-provider')).toBeInTheDocument();
  });

  it('should render BrowserRouter', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('browser-router')).toBeInTheDocument();
  });

  it('should render AuthProvider', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('auth-provider')).toBeInTheDocument();
  });

  it('should render Router component', () => {
    const { getByTestId } = render(<App />);
    expect(getByTestId('router')).toBeInTheDocument();
  });
});
