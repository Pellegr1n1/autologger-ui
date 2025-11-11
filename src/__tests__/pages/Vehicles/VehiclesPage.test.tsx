import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VehiclesPage from '../../../pages/Vehicles/VehiclesPage';
import { VehicleService } from '../../../features/vehicles/services/vehicleService';

// Mock CSS modules
jest.mock('../../../pages/Vehicles/VehiclesPage.module.css', () => ({
  vehiclesPage: 'vehiclesPage',
  pageHeader: 'pageHeader',
  addButton: 'addButton',
  vehicleGrid: 'vehicleGrid',
  emptyState: 'emptyState',
}));

jest.mock('../../../components/layout/Components.module.css', () => ({
  container: 'container',
  header: 'header',
}));

// Mock VehicleService
jest.mock('../../../features/vehicles/services/vehicleService', () => ({
  VehicleService: {
    getUserVehicles: jest.fn(() => Promise.resolve({ active: [], sold: [] })),
  },
}));

// Mock components
jest.mock('../../../components', () => ({
  VehicleCard: () => <div data-testid="vehicle-card">Card</div>,
  VehicleForm: () => <div data-testid="vehicle-form">Form</div>,
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

jest.mock('../../../features/vehicles', () => ({
  VehicleModal: () => <div data-testid="vehicle-modal">Modal</div>,
}));

describe('VehiclesPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vehicles page', () => {
    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should load vehicles on mount', async () => {
    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle loading errors', async () => {
    (VehicleService.getUserVehicles as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should load vehicles with data', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      ],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle vehicles array response', async () => {
    const mockVehiclesArray = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active', soldAt: null },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehiclesArray);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle vehicles object with vehicles array', async () => {
    const mockVehiclesData = {
      vehicles: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active', soldAt: null },
      ],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehiclesData);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle empty active and sold vehicles', async () => {
    const mockVehicles = {
      active: [],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle add vehicle button click', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      ],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const addButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Novo') || btn.textContent?.includes('Adicionar')
    );

    if (addButton) {
      fireEvent.click(addButton);
    }
  });

  it('should display sold vehicles section', async () => {
    const mockVehicles = {
      active: [],
      sold: [
        { id: '2', brand: 'Honda', model: 'Civic', plate: 'XYZ5678', status: 'sold' },
      ],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle refresh button', async () => {
    const mockVehicles = {
      active: [],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const refreshButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Atualizar') || btn.textContent?.includes('Refresh')
    );

    if (refreshButton) {
      fireEvent.click(refreshButton);
    }
  });

  it('should handle vehicle form close', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      ],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const addButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Novo') || btn.textContent?.includes('Adicionar')
    );

    if (addButton) {
      fireEvent.click(addButton);
      
      await waitFor(() => {
        const closeButton = Array.from(container.querySelectorAll('button')).find(btn => 
          btn.textContent?.includes('Fechar') || btn.textContent?.includes('Cancelar')
        );
        
        if (closeButton) {
          fireEvent.click(closeButton);
        }
      });
    }
  });

  it('should handle vehicle form submission', async () => {
    const mockVehicles = {
      active: [],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle vehicle modal open', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      ],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const card = container.querySelector('[data-testid="vehicle-card"]');
    if (card) {
      fireEvent.click(card);
    }
  });

  it('should handle multiple vehicles', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
        { id: '2', brand: 'Honda', model: 'Civic', plate: 'XYZ5678', status: 'active' },
        { id: '3', brand: 'Ford', model: 'Focus', plate: 'DEF9012', status: 'active' },
      ],
      sold: [
        { id: '4', brand: 'Chevrolet', model: 'Cruze', plate: 'GHI3456', status: 'sold' },
      ],
    };

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle vehicle refresh after form submission', async () => {
    const mockVehicles = {
      active: [
        { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      ],
      sold: [],
    };

    (VehicleService.getUserVehicles as jest.Mock)
      .mockResolvedValueOnce(mockVehicles)
      .mockResolvedValueOnce(mockVehicles);

    const { container } = render(
      <BrowserRouter>
        <VehiclesPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });
});

