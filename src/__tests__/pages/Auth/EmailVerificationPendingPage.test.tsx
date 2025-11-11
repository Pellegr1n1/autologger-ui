import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmailVerificationPendingPage from '../../../pages/Auth/EmailVerificationPendingPage';

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
}));

const mockNavigate = jest.fn();
const mockRefreshUser = jest.fn();
const mockLogout = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    user: { email: 'test@test.com', isEmailVerified: false },
    refreshUser: mockRefreshUser,
    logout: mockLogout,
  }),
}));

jest.mock('../../../features/auth/services/emailVerificationService', () => ({
  emailVerificationService: {
    resendVerificationEmail: jest.fn().mockResolvedValue({}),
  },
}));

describe('EmailVerificationPendingPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render email verification pending page', () => {
    render(
      <BrowserRouter>
        <EmailVerificationPendingPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Verifique seu email/i)).toBeInTheDocument();
    expect(screen.getByText(/Reenviar email de verificação/i)).toBeInTheDocument();
  });

  it('should display masked email', () => {
    render(
      <BrowserRouter>
        <EmailVerificationPendingPage />
      </BrowserRouter>
    );

    // Email is masked, so we look for the domain part
    expect(screen.getByText(/@test.com/i)).toBeInTheDocument();
  });

  it('should handle resend email', async () => {
    const { emailVerificationService } = require('../../../features/auth/services/emailVerificationService');

    render(
      <BrowserRouter>
        <EmailVerificationPendingPage />
      </BrowserRouter>
    );

    const resendButton = screen.getByText(/Reenviar email de verificação/i);
    fireEvent.click(resendButton);

    await waitFor(() => {
      expect(emailVerificationService.resendVerificationEmail).toHaveBeenCalled();
    });
  });

  it('should handle logout', () => {
    render(
      <BrowserRouter>
        <EmailVerificationPendingPage />
      </BrowserRouter>
    );

    const logoutButton = screen.getByText(/Sair e fazer login novamente/i);
    fireEvent.click(logoutButton);

    expect(mockLogout).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });

  it('should navigate when email is verified', async () => {
    // Mock useAuth to return verified user
    jest.spyOn(require('../../../features/auth'), 'useAuth').mockReturnValue({
      user: { email: 'test@test.com', isEmailVerified: true },
      refreshUser: mockRefreshUser,
      logout: mockLogout,
    });

    render(
      <BrowserRouter>
        <EmailVerificationPendingPage />
      </BrowserRouter>
    );

    jest.advanceTimersByTime(5000);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vehicles');
    });
  });
});
