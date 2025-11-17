import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HeaderPage from '../../../../components/layout/Header/Header';

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('HeaderPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render header component', () => {
    render(
      <BrowserRouter>
        <HeaderPage />
      </BrowserRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toBeInTheDocument();
  });

  it('should apply default left position when sider is not collapsed', () => {
    render(
      <BrowserRouter>
        <HeaderPage siderCollapsed={false} />
      </BrowserRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      left: '200px',
    });
  });

  it('should apply collapsed left position when sider is collapsed', () => {
    render(
      <BrowserRouter>
        <HeaderPage siderCollapsed={true} />
      </BrowserRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      left: '80px',
    });
  });

  it('should apply transition style', () => {
    render(
      <BrowserRouter>
        <HeaderPage />
      </BrowserRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    });
  });

  it('should use default siderCollapsed value when not provided', () => {
    render(
      <BrowserRouter>
        <HeaderPage />
      </BrowserRouter>
    );

    const header = screen.getByRole('banner');
    expect(header).toHaveStyle({
      left: '200px',
    });
  });
});

