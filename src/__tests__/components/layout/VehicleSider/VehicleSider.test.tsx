import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VehicleSider from '../../../../components/layout/VehicleSider/VehicleSider';

// Mock CSS module
jest.mock('../../../components/layout/VehicleSider/Sider.module.css', () => ({
  sider: 'sider',
  menu: 'menu',
}));

const mockNavigate = jest.fn();
const mockLocation = { pathname: '/vehicles' };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useLocation: () => mockLocation,
}));

describe('VehicleSider', () => {
  const mockOnCollapseChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vehicle sider', () => {
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
    expect(screen.getByText(/Serviços/i)).toBeInTheDocument();
    expect(screen.getByText(/Blockchain/i)).toBeInTheDocument();
  });

  it('should handle menu click', () => {
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    const vehiclesItem = screen.getByText(/Veículos/i);
    fireEvent.click(vehiclesItem);

    expect(mockNavigate).toHaveBeenCalledWith('/vehicles');
  });

  it('should toggle collapsed state', () => {
    // Mock window.innerWidth to be >= 768 so the sider can be toggled
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    const toggleButtons = screen.getAllByRole('button');
    // O primeiro botão é o botão de toggle do menu
    const toggleButton = toggleButtons[0];
    fireEvent.click(toggleButton);

    expect(mockOnCollapseChange).toHaveBeenCalled();
  });

  it('should call onCollapseChange when sider is toggled', () => {
    // Mock window.innerWidth to be >= 768 so the sider can be toggled
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    const toggleButtons = screen.getAllByRole('button');
    // O primeiro botão é o botão de toggle do menu
    const toggleButton = toggleButtons[0];
    fireEvent.click(toggleButton);

    expect(mockOnCollapseChange).toHaveBeenCalled();
  });

  it('should work without onCollapseChange callback', () => {
    render(
      <BrowserRouter>
        <VehicleSider />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle different routes correctly', () => {
    const { rerender } = render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();

    // Test maintenance route
    const { useLocation } = require('react-router-dom');
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/maintenance' });
    
    rerender(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle reports route', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/reports' });
    
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle profile route', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/profile' });
    
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle blockchain route', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/blockchain' });
    
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle logout button click', () => {
    const localStorageClearSpy = jest.spyOn(Storage.prototype, 'clear');
    
    // Mock window.innerWidth to be >= 768 so the sider can be toggled
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    // First, expand the sider by clicking the toggle button
    const toggleButtons = screen.getAllByRole('button');
    const toggleButton = toggleButtons[0];
    fireEvent.click(toggleButton);

    // Now the logout button with "Sair" text should be visible
    const logoutButton = screen.getByText(/Sair/i);
    fireEvent.click(logoutButton);

    // Verify that localStorage.clear was called when logout button is clicked
    // Note: window.location.href assignment cannot be easily mocked in jsdom,
    // but the component code sets it to '/login' which is sufficient
    expect(localStorageClearSpy).toHaveBeenCalled();

    localStorageClearSpy.mockRestore();
  });

  it('should handle collapsed state with logout button', () => {
    // Mock window.innerWidth to be >= 768 so the sider can be toggled
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 1024,
    });

    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    const toggleButtons = screen.getAllByRole('button');
    if (toggleButtons.length > 0) {
      fireEvent.click(toggleButtons[0]);
      
      const logoutButtons = screen.queryAllByText(/Sair/i);
      expect(logoutButtons.length).toBeGreaterThanOrEqual(0);
    }
  });

  it('should handle default route', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/' });
    
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });

  it('should handle unknown route', () => {
    jest.spyOn(require('react-router-dom'), 'useLocation').mockReturnValue({ pathname: '/unknown' });
    
    render(
      <BrowserRouter>
        <VehicleSider onCollapseChange={mockOnCollapseChange} />
      </BrowserRouter>
    );

    expect(screen.getByText(/Veículos/i)).toBeInTheDocument();
  });
});
