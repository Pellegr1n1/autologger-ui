import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmailPage from '../../../pages/Auth/VerifyEmailPage';
import { emailVerificationService } from '../../../features/auth/services/emailVerificationService';

// Mock CSS module
jest.mock('../../../pages/Auth/Auth.module.css', () => ({
  authContainer: 'authContainer',
  authContent: 'authContent',
}));

const mockNavigate = jest.fn();
const mockRefreshUser = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ token: 'valid-token' }),
}));

jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    refreshUser: mockRefreshUser,
  }),
}));

jest.mock('../../../features/auth/services/emailVerificationService', () => ({
  emailVerificationService: {
    verifyEmail: jest.fn(),
  },
}));

describe('VerifyEmailPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  it('should render loading state initially', () => {
    render(
      <BrowserRouter>
        <VerifyEmailPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Verificando seu email/i)).toBeInTheDocument();
  });

  it('should verify email on mount', async () => {
    const mockVerify = emailVerificationService.verifyEmail as jest.Mock;
    mockVerify.mockResolvedValue({});

    await act(async () => {
      render(
        <BrowserRouter>
          <VerifyEmailPage />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(mockVerify).toHaveBeenCalledWith('valid-token');
      expect(mockRefreshUser).toHaveBeenCalled();
    });
  });

  it('should show success message after verification', async () => {
    const mockVerify = emailVerificationService.verifyEmail as jest.Mock;
    mockVerify.mockResolvedValue({});

    await act(async () => {
      render(
        <BrowserRouter>
          <VerifyEmailPage />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Email verificado com sucesso/i)).toBeInTheDocument();
    });
  });

  it('should navigate to vehicles on success', async () => {
    const mockVerify = emailVerificationService.verifyEmail as jest.Mock;
    mockVerify.mockResolvedValue({});

    await act(async () => {
      render(
        <BrowserRouter>
          <VerifyEmailPage />
        </BrowserRouter>
      );
    });

    await waitFor(() => {
      expect(screen.getByText(/Email verificado com sucesso/i)).toBeInTheDocument();
    });

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/vehicles');
    }, { timeout: 4000 });
  });

  it('should show error message on failure', async () => {
    const mockVerify = emailVerificationService.verifyEmail as jest.Mock;
    mockVerify.mockRejectedValue({ response: { status: 404 } });

    render(
      <BrowserRouter>
        <VerifyEmailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Falha na verificação/i)).toBeInTheDocument();
    });
  });

  it('should handle missing token', async () => {
    jest.spyOn(require('react-router-dom'), 'useParams').mockReturnValue({ token: undefined });

    render(
      <BrowserRouter>
        <VerifyEmailPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Falha na verificação/i)).toBeInTheDocument();
    });
  });
});
