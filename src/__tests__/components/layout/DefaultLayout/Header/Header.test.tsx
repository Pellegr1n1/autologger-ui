import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import Header from '../../../../../components/layout/DefaultLayout/Header/Header';

// Mock CSS module
jest.mock('../../../../../components/layout/DefaultLayout/Header/Header.module.css', () => ({
  header: 'header',
  icons: 'icons',
  user: 'user',
  userProfile: 'userProfile',
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUserAlt: () => <div data-testid="user-icon">Icon</div>,
}));

describe('DefaultLayout Header', () => {
  it('should render header with default collapsed state', () => {
    render(<Header />);
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });

  it('should render header with custom collapsed state', () => {
    render(<Header siderCollapsed={true} />);
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
  });
});

