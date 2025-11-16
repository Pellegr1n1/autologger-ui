import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';

const mockUseAuth = jest.fn();
jest.mock('../../../../features/auth/components/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

jest.mock('../../../../features/auth/components/ResendVerificationButton', () => ({
  ResendVerificationButton: () => <button data-testid="resend-button">Resend</button>,
}));

import { EmailVerificationBanner } from '../../../../features/auth/components/EmailVerificationBanner';

describe('EmailVerificationBanner', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sessionStorage.clear();
  });

  it('should not render if user is verified', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', isEmailVerified: true },
    });

    const { container } = render(<EmailVerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should not render if user is null', () => {
    mockUseAuth.mockReturnValue({
      user: null,
    });

    const { container } = render(<EmailVerificationBanner />);
    expect(container.firstChild).toBeNull();
  });

  it('should render banner when user is not verified', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', isEmailVerified: false },
    });

    render(<EmailVerificationBanner />);
    expect(screen.getAllByText(/Verifique seu email/i).length).toBeGreaterThan(0);
  });

  it('should dismiss banner when close button is clicked', () => {
    mockUseAuth.mockReturnValue({
      user: { email: 'test@test.com', isEmailVerified: false },
    });

    const { container } = render(<EmailVerificationBanner />);
    
    const closeButtons = screen.getAllByRole('button', { hidden: true });
    // O botão de fechar é geralmente o último ou o que contém o ícone de close
    const closeButton = closeButtons.find(btn => 
      btn.querySelector('[aria-label="close"]') || 
      btn.querySelector('[data-icon="close"]')
    ) || closeButtons[closeButtons.length - 1];
    
    fireEvent.click(closeButton);

    expect(container.firstChild).toBeNull();
  });
});
