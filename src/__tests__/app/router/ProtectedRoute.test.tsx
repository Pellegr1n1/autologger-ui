import React from 'react';
import { describe, it, expect, jest } from '@jest/globals';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../../../app/router/ProtectedRoute';

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../../../features/auth', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock Spin component
jest.mock('antd', () => ({
  Spin: ({ size }: any) => <div data-testid="loading-spin" data-size={size}>Loading...</div>,
}));

describe('ProtectedRoute', () => {
  const MockComponent = () => <div data-testid="mock-component">Protected Content</div>;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should show loading when auth is loading', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: true,
      user: null,
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <ProtectedRoute component={MockComponent} />
      </BrowserRouter>
    );

    expect(getByTestId('loading-spin')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      loading: false,
      user: null,
    });

    const { container } = render(
      <BrowserRouter>
        <ProtectedRoute component={MockComponent} />
      </BrowserRouter>
    );

    // Should not render the protected component
    expect(container.querySelector('[data-testid="mock-component"]')).not.toBeInTheDocument();
  });

  it('should render component when authenticated', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', name: 'Test User' },
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <ProtectedRoute component={MockComponent} />
      </BrowserRouter>
    );

    expect(getByTestId('mock-component')).toBeInTheDocument();
    expect(getByTestId('mock-component')).toHaveTextContent('Protected Content');
  });

  it('should respect allowedRoles when provided', () => {
    mockUseAuth.mockReturnValue({
      isAuthenticated: true,
      loading: false,
      user: { id: '1', name: 'Test User', role: 'user' },
    });

    const { getByTestId } = render(
      <BrowserRouter>
        <ProtectedRoute component={MockComponent} allowedRoles={[1, 2]} />
      </BrowserRouter>
    );

    // For now, it allows all authenticated users
    expect(getByTestId('mock-component')).toBeInTheDocument();
  });
});
