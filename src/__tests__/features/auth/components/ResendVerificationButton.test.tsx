import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const mockResendVerificationEmail = jest.fn();

jest.mock('../../../../features/auth/services/emailVerificationService', () => ({
  emailVerificationService: {
    resendVerificationEmail: mockResendVerificationEmail,
  },
}));

import { ResendVerificationButton } from '../../../../features/auth/components/ResendVerificationButton';

describe('ResendVerificationButton', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should render button', () => {
    render(<ResendVerificationButton />);
    expect(screen.getByText(/Reenviar email/i)).toBeInTheDocument();
  });

  it('should call service on click', async () => {
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalled();
    });
  });

  it('should be disabled during cooldown', async () => {
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      const buttonAfterClick = screen.getByRole('button');
      expect(buttonAfterClick).toBeDisabled();
    });
  });

  it('should call onSuccess callback', async () => {
    const mockOnSuccess = jest.fn();
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton onSuccess={mockOnSuccess} />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('should handle link variant', () => {
    render(<ResendVerificationButton variant="link" />);
    expect(screen.getByText(/Reenviar email/i)).toBeInTheDocument();
  });

  it('should handle error on resend', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockResendVerificationEmail.mockRejectedValue(new Error('Network error'));

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(console.error).toHaveBeenCalled();
    });

    jest.restoreAllMocks();
  });

  it('should handle cooldown from localStorage', () => {
    const futureTime = Math.floor(Date.now() / 1000) + 30;
    localStorage.setItem('emailVerificationCooldown', futureTime.toString());

    render(<ResendVerificationButton />);
    
    // Quando há cooldown, o botão mostra "Aguarde X:XX" em vez de "Reenviar email"
    expect(screen.getByText(/Aguarde/i)).toBeInTheDocument();
  });

  it('should handle expired cooldown from localStorage', () => {
    const pastTime = Math.floor(Date.now() / 1000) - 100;
    localStorage.setItem('emailVerificationCooldown', pastTime.toString());

    render(<ResendVerificationButton />);
    
    // Quando o cooldown expirou, o botão deve mostrar "Reenviar email de verificação"
    expect(screen.getByText(/Reenviar email/i)).toBeInTheDocument();
  });

  it('should format time correctly', async () => {
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      const buttonAfterClick = screen.getByRole('button');
      expect(buttonAfterClick).toBeDisabled();
    });
  });

  it('should handle button click during loading', async () => {
    mockResendVerificationEmail.mockImplementation(() => new Promise(() => {}));

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalled();
    });

    // Try clicking again while loading
    const buttonDuringLoading = screen.getByRole('button');
    fireEvent.click(buttonDuringLoading);

    expect(mockResendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('should handle button click during cooldown', async () => {
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      const buttonAfterClick = screen.getByRole('button');
      expect(buttonAfterClick).toBeDisabled();
    });

    // Try clicking again during cooldown
    const buttonDuringCooldown = screen.getByRole('button');
    fireEvent.click(buttonDuringCooldown);

    expect(mockResendVerificationEmail).toHaveBeenCalledTimes(1);
  });

  it('should clear cooldown from localStorage when it reaches zero', async () => {
    const removeItemSpy = jest.spyOn(Storage.prototype, 'removeItem');
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockResendVerificationEmail).toHaveBeenCalled();
    });

    // Fast-forward time to clear cooldown (60 seconds + a bit more to trigger removal)
    jest.advanceTimersByTime(61000);
    
    // Wait for the interval to process and remove the item
    await waitFor(() => {
      expect(removeItemSpy).toHaveBeenCalledWith('emailVerificationCooldown');
    }, { timeout: 1000 });
    
    removeItemSpy.mockRestore();
  });

  it('should display cooldown text in link variant', async () => {
    mockResendVerificationEmail.mockResolvedValue({});

    render(<ResendVerificationButton variant="link" />);
    
    const button = screen.getByText(/Reenviar email/i);
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Aguarde/i)).toBeInTheDocument();
    });
  });
});
