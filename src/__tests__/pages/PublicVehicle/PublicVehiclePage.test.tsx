import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PublicVehiclePage from '../../../pages/PublicVehicle/PublicVehiclePage';
import { VehicleShareService } from '../../../features/vehicles/services/vehicleShareService';

jest.mock('../../../shared/utils/env', () => ({
  getApiBaseUrl: jest.fn(() => 'http://localhost:3001'),
  getGoogleClientId: jest.fn(() => 'test-client-id'),
  getEnvVar: jest.fn((key: string, defaultValue?: string) => {
    if (key === 'VITE_API_URL' || key === 'VITE_API_BASE_URL') {
      return 'http://localhost:3001';
    }
    if (key === 'VITE_GOOGLE_CLIENT_ID') {
      return 'test-client-id';
    }
    return defaultValue;
  }),
}));

// Mock CSS module
jest.mock('../../../pages/PublicVehicle/PublicVehiclePage.module.css', () => ({
  container: 'container',
  header: 'header',
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({ shareToken: 'test-token' }),
}));

jest.mock('../../../features/vehicles/services/vehicleShareService', () => ({
  VehicleShareService: {
    getPublicVehicleInfo: jest.fn(),
  },
}));

describe('PublicVehiclePage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render loading state initially', () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockImplementation(() => new Promise(() => {}));

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should render vehicle info after loading', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    // getPublicVehicleInfo returns PublicVehicleInfo directly, not wrapped in an object
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [],
    });

    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    // Wait for loading to complete
    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Wait for vehicle title to appear (brand + model)
    await waitFor(() => {
      // The title shows "Toyota Corolla" so we can search for either
      expect(screen.getByText(/Toyota Corolla/i)).toBeInTheDocument();
    }, { timeout: 3000 });

    consoleSpy.mockRestore();
  });

  it('should render error message on failure', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockRejectedValue({ response: { data: { message: 'Token inválido' } } });

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Token inválido/i)).toBeInTheDocument();
    });
  });

  it('should handle vehicle with no maintenance history', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    consoleSpy.mockRestore();
  });

  it('should handle vehicle with maintenance history', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [
        {
          id: '1',
          description: 'Oil change',
          category: 'Maintenance',
          cost: 150,
          mileage: 10000,
          serviceDate: '2024-01-15',
          createdAt: '2024-01-15',
          type: 'maintenance',
        },
      ],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    consoleSpy.mockRestore();
  });

  it('should handle error without response', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockRejectedValue(new Error('Network error'));

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Erro ao carregar informações do veículo/i)).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('should handle vehicle with sold status', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'sold',
      photoUrl: null,
      maintenanceHistory: [],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    consoleSpy.mockRestore();
  });

  it('should handle filters', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [
        {
          id: '1',
          description: 'Oil change',
          category: 'Maintenance',
          cost: 150,
          mileage: 10000,
          serviceDate: '2024-01-15',
          createdAt: '2024-01-15',
          type: 'maintenance',
        },
      ],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const selects = container.querySelectorAll('.ant-select');
    if (selects.length > 0) {
      const firstSelect = selects[0];
      fireEvent.mouseDown(firstSelect);
    }

    const inputs = container.querySelectorAll('.ant-input');
    if (inputs.length > 0) {
      const firstInput = inputs[0];
      fireEvent.change(firstInput, { target: { value: 'test' } });
    }

    consoleSpy.mockRestore();
  });

  it('should handle pagination', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: Array.from({ length: 20 }, (_, i) => ({
        id: String(i + 1),
        description: `Service ${i + 1}`,
        category: 'Maintenance',
        cost: 100,
        mileage: 10000,
        serviceDate: '2024-01-15',
        createdAt: '2024-01-15',
        type: 'maintenance',
      })),
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const pagination = container.querySelector('.ant-pagination');
    if (pagination) {
      const nextButton = pagination.querySelector('.ant-pagination-next');
      if (nextButton) {
        fireEvent.click(nextButton);
      }
    }

    consoleSpy.mockRestore();
  });

  it('should handle date range filter', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [
        {
          id: '1',
          description: 'Oil change',
          category: 'Maintenance',
          cost: 150,
          mileage: 10000,
          serviceDate: '2024-01-15',
          createdAt: '2024-01-15',
          type: 'maintenance',
        },
      ],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const datePickers = container.querySelectorAll('.ant-picker');
    if (datePickers.length > 0) {
      const firstDatePicker = datePickers[0];
      fireEvent.mouseDown(firstDatePicker);
    }

    consoleSpy.mockRestore();
  });

  it('should handle clear filters', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const clearButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Limpar') || btn.textContent?.includes('Clear')
    );

    if (clearButton) {
      fireEvent.click(clearButton);
    }

    consoleSpy.mockRestore();
  });

  it('should handle back button click', async () => {
    const mockGetInfo = VehicleShareService.getPublicVehicleInfo as jest.Mock;
    mockGetInfo.mockResolvedValue({
      id: '1',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 50000,
      createdAt: '2024-01-01',
      status: 'active',
      photoUrl: null,
      maintenanceHistory: [],
    });

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    const { container } = render(
      <BrowserRouter>
        <PublicVehiclePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByText(/Carregando/i)).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const backButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Voltar') || btn.textContent?.includes('Back')
    );

    if (backButton) {
      fireEvent.click(backButton);
    }

    consoleSpy.mockRestore();
  });
});
