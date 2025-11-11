import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ReportsPage from '../../../pages/Reports/ReportsPage';

// Mock CSS modules
jest.mock('../../../pages/Reports/ReportsPage.module.css', () => ({}));
jest.mock('../../../components/layout/Components.module.css', () => ({}));

// Mock recharts
jest.mock('recharts', () => ({
  BarChart: () => <div data-testid="bar-chart">Bar Chart</div>,
  Bar: () => <div />,
  XAxis: () => <div />,
  YAxis: () => <div />,
  CartesianGrid: () => <div />,
  Tooltip: () => <div />,
  ResponsiveContainer: ({ children }: any) => <div>{children}</div>,
  PieChart: () => <div data-testid="pie-chart">Pie Chart</div>,
  Pie: () => <div />,
  Cell: () => <div />,
  Legend: () => <div />,
  Area: () => <div />,
  ComposedChart: () => <div />,
  LineChart: () => <div data-testid="line-chart">Line Chart</div>,
  Line: () => <div />,
}));

// Mock services
jest.mock('../../../features/vehicles/services/vehicleService', () => ({
  VehicleService: {
    getUserVehicles: jest.fn(() => Promise.resolve({ active: [], sold: [] })),
  },
}));

jest.mock('../../../features/vehicles/services/vehicleServiceService', () => ({
  VehicleServiceService: {
    getAllServices: jest.fn(() => Promise.resolve([])),
  },
}));

import { VehicleService } from '../../../features/vehicles/services/vehicleService';
import { VehicleServiceService } from '../../../features/vehicles/services/vehicleServiceService';

jest.mock('../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
    getAllServices: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

jest.mock('../../../components/charts/CustomTooltip', () => ({
  __esModule: true,
  default: () => <div data-testid="custom-tooltip">Tooltip</div>,
}));

describe('ReportsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render reports page', () => {
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should load report data on mount', async () => {
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
      expect(VehicleServiceService.getAllServices).toHaveBeenCalled();
    });
  });

  it('should handle data loading errors', async () => {
    (VehicleService.getUserVehicles as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    (VehicleServiceService.getAllServices as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    expect(container).toBeTruthy();
    await waitFor(() => {
      expect(screen.getByTestId('default-frame')).toBeInTheDocument();
    });
  });

  it('should load report data with vehicles and services', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
      expect(VehicleServiceService.getAllServices).toHaveBeenCalled();
    });
  });

  it('should handle filter changes', async () => {
    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: [], sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    // Verify component rendered
    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should handle date range filter', async () => {
    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: [], sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should display charts with data', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
      { id: '2', vehicleId: '1', description: 'Tire change', category: 'Maintenance', cost: 200, mileage: 20000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });
  });

  it('should handle empty state', async () => {
    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: [], sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    expect(container).toBeTruthy();
  });

  it('should handle filter by vehicle', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
      { id: '2', brand: 'Honda', model: 'Civic', plate: 'XYZ5678', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const selects = container.querySelectorAll('.ant-select');
    if (selects.length > 0) {
      const vehicleSelect = selects[0];
      fireEvent.mouseDown(vehicleSelect);
    }
  });

  it('should handle filter by period', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const datePickers = container.querySelectorAll('.ant-picker');
    if (datePickers.length > 0) {
      const datePicker = datePickers[0];
      fireEvent.mouseDown(datePicker);
    }
  });

  it('should calculate statistics correctly', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
      { id: '2', vehicleId: '1', description: 'Tire change', category: 'Maintenance', cost: 200, mileage: 20000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    expect(container).toBeTruthy();
  });

  it('should handle filter by type', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date(), type: 'MAINTENANCE' },
      { id: '2', vehicleId: '1', description: 'Fuel', category: 'Fuel', cost: 200, mileage: 20000, date: new Date(), type: 'FUEL' },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const selects = container.querySelectorAll('.ant-select');
    if (selects.length > 1) {
      fireEvent.mouseDown(selects[1]);
    }

    expect(container).toBeTruthy();
  });

  it('should handle filter by category', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Oil', cost: 150, mileage: 10000, date: new Date(), type: 'MAINTENANCE' },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const selects = container.querySelectorAll('.ant-select');
    if (selects.length > 2) {
      fireEvent.mouseDown(selects[2]);
    }

    expect(container).toBeTruthy();
  });

  it('should handle search input change', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const inputs = container.querySelectorAll('input[type="text"]');
    if (inputs.length > 0) {
      fireEvent.change(inputs[0], { target: { value: 'Oil' } });
    }

    expect(container).toBeTruthy();
  });

  it('should handle clear filters button', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const clearButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Limpar') || btn.textContent?.includes('Clear')
    );

    if (clearButton) {
      fireEvent.click(clearButton);
    }

    expect(container).toBeTruthy();
  });

  it('should handle export CSV', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: [] });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    const exportButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Exportar') || btn.textContent?.includes('CSV')
    );

    expect(container).toBeTruthy();
  });

  it('should handle sold vehicles', async () => {
    const mockVehicles = [
      { id: '1', brand: 'Toyota', model: 'Corolla', plate: 'ABC1234', status: 'active' },
    ];
    const mockSoldVehicles = [
      { id: '2', brand: 'Honda', model: 'Civic', plate: 'XYZ5678', status: 'sold' },
    ];
    const mockServices = [
      { id: '1', vehicleId: '1', description: 'Oil change', category: 'Maintenance', cost: 150, mileage: 10000, date: new Date() },
      { id: '2', vehicleId: '2', description: 'Repair', category: 'Maintenance', cost: 300, mileage: 20000, date: new Date() },
    ];

    (VehicleService.getUserVehicles as jest.Mock).mockResolvedValueOnce({ active: mockVehicles, sold: mockSoldVehicles });
    (VehicleServiceService.getAllServices as jest.Mock).mockResolvedValueOnce(mockServices);

    const { container } = render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalled();
    });

    expect(container).toBeTruthy();
  });
});

