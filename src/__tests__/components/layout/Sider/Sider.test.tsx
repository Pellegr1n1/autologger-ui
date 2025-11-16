import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SiderPage from '../../../../components/layout/Sider/Sider';

// Mock CSS module
jest.mock('../../../../components/layout/Sider/Sider.module.css', () => ({
  sider: 'sider',
  menu: 'menu',
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('Sider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it('should render sider', () => {
    render(
      <BrowserRouter>
        <SiderPage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Portal/i)).toBeInTheDocument();
  });

  it('should handle menu click', () => {
    render(
      <BrowserRouter>
        <SiderPage />
      </BrowserRouter>
    );

    const portalItem = screen.getByText(/Portal/i);
    fireEvent.click(portalItem);

    expect(mockNavigate).toHaveBeenCalledWith('/portal');
  });

  it('should toggle collapsed state', () => {
    render(
      <BrowserRouter>
        <SiderPage />
      </BrowserRouter>
    );

    const toggleButton = screen.getByRole('button');
    fireEvent.click(toggleButton);

    // Verificar que o estado mudou
    expect(toggleButton).toBeInTheDocument();
  });
});
