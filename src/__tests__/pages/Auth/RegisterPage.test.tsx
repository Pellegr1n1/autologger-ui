import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
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

// GoogleLoginButton is not used in RegisterPage, so no mock needed

// Mock googleAuthService (módulo pode não existir)
jest.mock('../../../features/auth/services/googleAuthService', () => ({
  googleAuthService: {
    authenticateWithGoogle: jest.fn(),
  },
}), { virtual: true });

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Mock console.log and console.error to avoid output in tests
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
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

  it('should render first step with name and email fields', () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    expect(screen.getByPlaceholderText('Seu nome completo')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument();
    expect(screen.getByText('Próximo')).toBeInTheDocument();
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
    const mockUser = { id: '1', email: 'john@test.com', name: 'John Doe' };
    mockRegister.mockResolvedValue(mockUser);

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

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(checkbox);

    const submitButton = screen.getByText('Criar Conta');
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    }, { timeout: 3000 });
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

    fireEvent.change(passwordInput, { target: { value: 'Password123!' } });
    fireEvent.change(confirmPasswordInput, { target: { value: 'Password123!' } });
    fireEvent.click(checkbox);

    const submitButton = screen.getByText('Criar Conta');
    
    await act(async () => {
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockRegister).toHaveBeenCalled();
    }, { timeout: 3000 });
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

  it('should show next button only on first step', async () => {
    render(
      <BrowserRouter>
        <RegisterPage />
      </BrowserRouter>
    );

    // On first step, should show "Próximo" button
    expect(screen.getByText('Próximo')).toBeInTheDocument();
    expect(screen.queryByText('Criar Conta')).not.toBeInTheDocument();

    const nameInput = screen.getByPlaceholderText('Seu nome completo');
    const emailInput = screen.getByPlaceholderText('seu@email.com');
    const nextButton = screen.getByText('Próximo');

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@test.com' } });
    fireEvent.click(nextButton);

    // After clicking next, should show "Criar Conta" button and "Voltar" button
    await waitFor(() => {
      expect(screen.getByText('Criar Conta')).toBeInTheDocument();
      expect(screen.getByText('Voltar')).toBeInTheDocument();
      expect(screen.queryByText('Próximo')).not.toBeInTheDocument();
    });
  });
});

