import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import CallbackPage from '../../../pages/Auth/CallbackPage';

// Mock CSS module
jest.mock('../../../pages/Auth/Auth.module.css', () => ({
  authContainer: 'authContainer',
  authContent: 'authContent',
  authCard: 'authCard',
}));

const mockNavigate = jest.fn();
const mockLogin = jest.fn();
const mockSetToken = jest.fn();
const mockGetToken = jest.fn().mockReturnValue('test-token');

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useSearchParams: () => [
    new URLSearchParams('?token=test-token&user=%7B%22id%22%3A%221%22%2C%22email%22%3A%22test%40test.com%22%7D')
  ],
}));

jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

jest.mock('../../../shared/services/api', () => ({
  apiBase: {
    setToken: mockSetToken,
    getToken: mockGetToken,
  },
}));

describe('CallbackPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Object.defineProperty(window, 'opener', {
      writable: true,
      value: null,
    });
    localStorage.clear();
  });

  it('should render loading state initially', () => {
    render(
      <BrowserRouter>
        <CallbackPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/Processando autenticação/i)).toBeInTheDocument();
  });

  it('should handle successful callback', async () => {
    // Atualizar mock para não incluir token na URL (token agora está em cookie httpOnly)
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?user=%7B%22id%22%3A%221%22%2C%22email%22%3A%22test%40test.com%22%7D')
    ]);

    render(
      <BrowserRouter>
        <CallbackPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
      expect(mockSetToken).not.toHaveBeenCalled();
      expect(mockLogin).toHaveBeenCalled();
    });
  });

  it('should handle error with error param', async () => {
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?error=access_denied')
    ]);

    render(
      <BrowserRouter>
        <CallbackPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Autenticação/i)).toBeInTheDocument();
    });
  });

  it('should handle missing user data', async () => {
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('')
    ]);

    render(
      <BrowserRouter>
        <CallbackPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro na Autenticação/i)).toBeInTheDocument();
    });
  });

  it('should navigate to login on error button click', async () => {
    jest.spyOn(require('react-router-dom'), 'useSearchParams').mockReturnValue([
      new URLSearchParams('?error=test')
    ]);

    render(
      <BrowserRouter>
        <CallbackPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const button = screen.getByText(/Voltar ao Login/i);
      expect(button).toBeInTheDocument();
      button.click();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
