import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import LoginPage from '../../../pages/Auth/LoginPage';

// Mock CSS module
jest.mock('../../../pages/Auth/Auth.module.css', () => ({
  authContainer: 'authContainer',
  authContent: 'authContent',
  authCard: 'authCard',
  authHeader: 'authHeader',
  authTitle: 'authTitle',
  authSubtitle: 'authSubtitle',
  formOptions: 'formOptions',
  forgotLink: 'forgotLink',
  authButton: 'authButton',
  divider: 'divider',
  googleButtonContainer: 'googleButtonContainer',
  authFooter: 'authFooter',
  authLink: 'authLink',
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAuth
const mockLogin = jest.fn();
jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

// Mock GoogleLoginButton
jest.mock('../../../components/GoogleLoginButton', () => ({
  GoogleLoginButton: ({ onSuccess, onError, disabled }: any) => (
    <div data-testid="google-login-button">
      <button 
        data-testid="mock-google-success"
        onClick={() => onSuccess({ token: 'test-token', user: { id: '1', email: 'test@test.com' } })}
        disabled={disabled}
      >
        Success
      </button>
      <button 
        data-testid="mock-google-error"
        onClick={() => onError(new Error('Test error'))}
        disabled={disabled}
      >
        Error
      </button>
    </div>
  ),
}));

// Mock apiBase
jest.mock('../../../shared/services/api', () => ({
  apiBase: {
    setToken: jest.fn(),
  },
}));

describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render login form', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Bem-vindo de volta')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Sua senha')).toBeInTheDocument();
  });

  it('should render registration link', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Registre-se/i)).toBeInTheDocument();
  });

  it('should render Google login button', () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
  });

  it('should handle successful form submission', async () => {
    mockLogin.mockResolvedValue({});
    mockNavigate.mockReturnValue(undefined);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByText('Entrar');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'test@test.com',
        password: 'password123',
      });
    });
  });

  it('should show error for 401 status', async () => {
    const error = { response: { status: 401 } };
    mockLogin.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByText('Entrar');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Email ou senha incorretos/i)).toBeInTheDocument();
    });
  });

  it('should show error for 404 status', async () => {
    const error = { response: { status: 404 } };
    mockLogin.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByText('Entrar');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Usuário não encontrado/i)).toBeInTheDocument();
    });
  });

  it('should show generic error for other errors', async () => {
    const error = { response: { status: 500 } };
    mockLogin.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const passwordInput = screen.getByPlaceholderText('Sua senha');
    const submitButton = screen.getByText('Entrar');

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro ao fazer login/i)).toBeInTheDocument();
    });
  });

  it('should handle Google login success', async () => {
    mockLogin.mockResolvedValue({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const successButton = screen.getByTestId('mock-google-success');
    fireEvent.click(successButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vehicles');
    });
  });

  it('should handle Google login error', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const errorButton = screen.getByTestId('mock-google-error');
    fireEvent.click(errorButton);

    await waitFor(() => {
      expect(screen.getByText('Test error')).toBeInTheDocument();
    });
  });

  it('should handle message event for OAuth success', async () => {
    mockLogin.mockResolvedValue({});

    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const event = new MessageEvent('message', {
      data: {
        type: 'GOOGLE_AUTH_SUCCESS',
        token: 'test-token',
        user: { id: '1', email: 'test@test.com' },
      },
      origin: window.location.origin,
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vehicles');
    });
  });

  it('should handle message event for OAuth error', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const event = new MessageEvent('message', {
      data: {
        type: 'GOOGLE_AUTH_ERROR',
        error: 'OAuth error',
      },
      origin: window.location.origin,
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(screen.getByText('OAuth error')).toBeInTheDocument();
    });
  });

  it('should ignore messages from different origins', async () => {
    render(
      <BrowserRouter>
        <LoginPage />
      </BrowserRouter>
    );

    const event = new MessageEvent('message', {
      data: {
        type: 'GOOGLE_AUTH_SUCCESS',
        token: 'test-token',
        user: { id: '1', email: 'test@test.com' },
      },
      origin: 'http://malicious-site.com',
    });

    window.dispatchEvent(event);

    await waitFor(() => {
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });
});

