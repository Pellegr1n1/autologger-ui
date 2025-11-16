import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import HeaderPage from '../../../components/layout/Header/Header';

// Mock CSS modules
jest.mock('../../../components/layout/Header/Header.module.css', () => ({
  header: 'header',
  icons: 'icons',
  user: 'user',
  userProfile: 'userProfile',
}));

// Mock react-icons
jest.mock('react-icons/fa', () => ({
  FaUserAlt: () => <div data-testid="user-icon">UserIcon</div>,
}));

describe('Header', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render header component', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      expect(container.querySelector('.header')).toBeInTheDocument();
    });

    it('should render user icon', () => {
      render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    it('should apply correct left position when sider is collapsed', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage siderCollapsed={true} />
        </MemoryRouter>
      );
      const header = container.querySelector('.header');
      expect(header).toHaveStyle({ left: '80px' });
    });

    it('should apply correct left position when sider is not collapsed', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage siderCollapsed={false} />
        </MemoryRouter>
      );
      const header = container.querySelector('.header');
      expect(header).toHaveStyle({ left: '200px' });
    });

    it('should apply default siderCollapsed value', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      const header = container.querySelector('.header');
      expect(header).toHaveStyle({ left: '200px' });
    });

    it('should render logo image', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      const logo = container.querySelector('img[alt="Logo"]');
      expect(logo).toBeInTheDocument();
    });
  });

  describe('Responsive styles', () => {
    it('should apply transition for left position', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage siderCollapsed={true} />
        </MemoryRouter>
      );
      const header = container.querySelector('.header');
      expect(header).toHaveStyle({ 
        transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)' 
      });
    });

    it('should have icons container', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      expect(container.querySelector('.icons')).toBeInTheDocument();
    });
  });

  describe('User Dropdown', () => {
    it('should render user dropdown with profile menu', () => {
      const { container } = render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      const dropdown = container.querySelector('.icons');
      expect(dropdown).toBeInTheDocument();
    });

    it('should have user icon in the dropdown trigger', () => {
      render(
        <MemoryRouter>
          <HeaderPage />
        </MemoryRouter>
      );
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });
  });
});

