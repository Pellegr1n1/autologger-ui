import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPasswordPage from '../../../pages/Auth/ResetPasswordPage';
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
  useParams: () => ({ token: 'valid-token' }),
}));

jest.mock('../../../features/auth/services/passwordRecoveryService', () => ({
  passwordRecoveryService: {
    validateResetToken: jest.fn().mockResolvedValue(true),
    resetPassword: jest.fn(),
  },
}));

describe('ResetPasswordPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render reset password form', async () => {
    render(
      <BrowserRouter>
        <ResetPasswordPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Criar nova senha/i)).toBeInTheDocument();
    });
  });

  it('should validate token on mount', async () => {
    const mockValidate = passwordRecoveryService.validateResetToken as jest.Mock;
    mockValidate.mockResolvedValue(true);

    render(
      <BrowserRouter>
        <ResetPasswordPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(mockValidate).toHaveBeenCalledWith('valid-token');
    });
  });

  it('should show invalid token message when token is invalid', async () => {
    const mockValidate = passwordRecoveryService.validateResetToken as jest.Mock;
    mockValidate.mockRejectedValue(new Error('Invalid token'));

    render(
      <BrowserRouter>
        <ResetPasswordPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      // Use getAllByText and check the first one (title)
      const elements = screen.getAllByText(/Token inválido ou expirado/i);
      expect(elements.length).toBeGreaterThan(0);
    });
  });

  it('should submit form with valid passwords', async () => {
    const mockValidate = passwordRecoveryService.validateResetToken as jest.Mock;
    const mockReset = passwordRecoveryService.resetPassword as jest.Mock;
    
    mockValidate.mockResolvedValue(true);
    mockReset.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ResetPasswordPage />
      </BrowserRouter>
    );

    // Wait for form to be rendered after token validation
    await waitFor(() => {
      expect(screen.getByText(/Criar nova senha/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for inputs to be available
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/Sua nova senha/i).length).toBeGreaterThan(0);
    });

    const passwordInputs = screen.getAllByPlaceholderText(/Sua nova senha/i);
    const passwordInput = passwordInputs[0];
    const confirmInput = screen.getByPlaceholderText(/Confirme sua nova senha/i);
    const submitButton = screen.getByText(/Alterar senha/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockReset).toHaveBeenCalledWith({
        token: 'valid-token',
        newPassword: 'Password123!',
        confirmPassword: 'Password123!',
      });
    }, { timeout: 5000 });
  });

  it('should show success message after successful reset', async () => {
    const mockValidate = passwordRecoveryService.validateResetToken as jest.Mock;
    const mockReset = passwordRecoveryService.resetPassword as jest.Mock;
    
    mockValidate.mockResolvedValue(true);
    mockReset.mockResolvedValue({});

    render(
      <BrowserRouter>
        <ResetPasswordPage />
      </BrowserRouter>
    );

    // Wait for form to be rendered
    await waitFor(() => {
      expect(screen.getByText(/Criar nova senha/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for inputs to be available
    await waitFor(() => {
      expect(screen.getAllByPlaceholderText(/Sua nova senha/i).length).toBeGreaterThan(0);
    });

    const passwordInputs = screen.getAllByPlaceholderText(/Sua nova senha/i);
    const passwordInput = passwordInputs[0];
    const confirmInput = screen.getByPlaceholderText(/Confirme sua nova senha/i);
    const submitButton = screen.getByText(/Alterar senha/i);

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmInput, { target: { value: 'Password123!' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Senha alterada com sucesso/i)).toBeInTheDocument();
    }, { timeout: 5000 });
  });
});
