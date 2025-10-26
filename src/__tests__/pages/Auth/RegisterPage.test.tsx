import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import RegisterPage from '../../../pages/Auth/RegisterPage';

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
  stepsContainer: 'stepsContainer',
  formContainer: 'formContainer',
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock useAuth
const mockRegister = jest.fn();
jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    register: mockRegister,
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

// Mock googleAuthService
jest.mock('../../../features/auth/services/googleAuthService', () => ({
  googleAuthService: {
    authenticateWithGoogle: jest.fn(),
  },
}));

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Crie sua conta')).toBeInTheDocument();
  });

  it('should render first step form fields', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
  });

  it('should render Google login button on first step', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-login-button')).toBeInTheDocument();
  });

  it('should navigate to next step when clicking next', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)')).toBeInTheDocument();
    });
  });

  it('should not navigate to next step if validation fails', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nextButton = screen.getByText('Próximo');
    fireEvent.click(nextButton);

    // Should still be on first step
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    });
  });

  it('should go back to previous step', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Voltar');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    });
  });

  it('should complete registration successfully', async () => {
    mockRegister.mockResolvedValue({});

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // First step
    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)')).toBeInTheDocument();
    });

    // Second step
    const passwordInput = screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirme sua senha');
    const checkbox = screen.getByRole('checkbox');

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(checkbox);

    const submitButton = screen.getByText('Criar Conta');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    });
  });

  it('should handle registration error', async () => {
    const error = { 
      response: { 
        data: { 
          error: { 
            message: ['Error message 1', 'Error message 2'] 
          } 
        } 
      } 
    };
    mockRegister.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // First step
    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)')).toBeInTheDocument();
    });

    // Second step
    const passwordInput = screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirme sua senha');
    const checkbox = screen.getByRole('checkbox');

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123' } });
    fireEvent.click(checkbox);

    const submitButton = screen.getByText('Criar Conta');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Erro no cadastro/i)).toBeInTheDocument();
    });
  });

  it('should show error when passwords do not match', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // First step
    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)')).toBeInTheDocument();
    });

    // Second step
    const passwordInput = screen.getByPlaceholderText('Sua senha (mín. 8 caracteres)');
    const confirmPasswordInput = screen.getByPlaceholderText('Confirme sua senha');

    fireEvent.change(passwordInput, { target: { value: 'Password123' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'DifferentPassword123' } });

    // Password mismatch error should appear
    await waitFor(() => {
      expect(screen.getByText(/As senhas não coincidem/i)).toBeInTheDocument();
    });
  });

  it('should show Google login button only on first step', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('google-login-button')).toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(screen.queryByTestId('google-login-button')).not.toBeInTheDocument();
    });
  });
});

