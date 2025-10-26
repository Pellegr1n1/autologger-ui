import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
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

    expect(VehicleService.getUserVehicles).toHaveBeenCalled();
  });
});

