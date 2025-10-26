import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProfilePage from '../../../pages/Profile/ProfilePage';

// Mock CSS modules
jest.mock('../../../pages/Profile/ProfilePage.module.css', () => ({
  profilePage: 'profilePage',
  profileHeader: 'profileHeader',
  profileContent: 'profileContent',
  profileForm: 'profileForm',
  profileActions: 'profileActions',
  passwordSection: 'passwordSection',
}));

jest.mock('../../../components/layout/Components.module.css', () => ({
  container: 'container',
  header: 'header',
}));

// Mock useAuth
const mockUpdateProfile = jest.fn();
const mockUser = {
  id: '1',
  name: 'Test User',
  email: 'test@example.com',
};

jest.mock('../../../features/auth', () => ({
  useAuth: () => ({
    user: mockUser,
    updateProfile: mockUpdateProfile,
  }),
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render profile page', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should display user information', () => {
    render(
      <BrowserRouter>
        <ProfilePage />
      </BrowserRouter>
    );

    expect(screen.getByDisplayValue('Test User')).toBeInTheDocument();
    expect(screen.getByDisplayValue('test@example.com')).toBeInTheDocument();
  });
});

