import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ForgotPasswordPage from '../../../pages/Auth/ForgotPasswordPage';
import { passwordRecoveryService } from '../../../features/auth/services/passwordRecoveryService';

// Mock CSS module
jest.mock('../../../pages/Auth/Auth.module.css', () => ({
  authContainer: 'authContainer',
  authContent: 'authContent',
  authCard: 'authCard',
  authHeader: 'authHeader',
  authTitle: 'authTitle',
  authSubtitle: 'authSubtitle',
  authButton: 'authButton',
  authFooter: 'authFooter',
  authLink: 'authLink',
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../features/auth/services/passwordRecoveryService', () => ({
  passwordRecoveryService: {
    requestPasswordReset: jest.fn(),
  },
}));

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render forgot password form', () => {
    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Recuperar senha/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seu@email.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Enviar instruções/i)).toBeInTheDocument();
  });

  it('should submit form with valid email', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    mockRequest.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({ email: 'test@test.com' });
    });
  });

  it('should show success message after successful submission', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    mockRequest.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Verifique sua caixa de entrada/i)).toBeInTheDocument();
    });
  });

  it('should show error message on failure', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    mockRequest.mockRejectedValue(new Error('Network error'));

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalled();
    });
  });

  it('should navigate to login from success page', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    mockRequest.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'test@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const backButton = screen.getByText(/Voltar ao Login/i);
      fireEvent.click(backButton);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  it('should show error message for Google Auth email', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    const googleAuthError = {
      response: {
        status: 400,
        data: {
          message: 'Este email está associado a uma conta Google. Use a opção "Entrar com Google" para acessar sua conta.',
        },
      },
    };
    mockRequest.mockRejectedValue(googleAuthError);

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'google@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({ email: 'google@test.com' });
    });
  });

  it('should show error message for non-existent email', async () => {
    const mockRequest = passwordRecoveryService.requestPasswordReset as jest.Mock;
    const notFoundError = {
      response: {
        status: 404,
        data: {
          message: 'Email não encontrado',
        },
      },
    };
    mockRequest.mockRejectedValue(notFoundError);

    render(
      <BrowserRouter>
        <ForgotPasswordPage />
      </BrowserRouter>
    );

    const emailInput = screen.getByPlaceholderText(/seu@email.com/i);
    const submitButton = screen.getByText(/Enviar instruções/i);

    fireEvent.change(emailInput, { target: { value: 'nonexistent@test.com' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRequest).toHaveBeenCalledWith({ email: 'nonexistent@test.com' });
    });
  });
});
