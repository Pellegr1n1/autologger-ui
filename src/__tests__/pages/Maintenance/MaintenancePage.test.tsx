import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MaintenancePage from '../../../pages/Maintenance/MaintenancePage';

// Mock CSS modules
jest.mock('../../../pages/Maintenance/MaintenancePage.module.css', () => ({}));
jest.mock('../../../components/layout/Components.module.css', () => ({}));

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

jest.mock('../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
  },
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

jest.mock('../../../features/vehicles/components/ServiceModal', () => ({
  __esModule: true,
  default: () => <div data-testid="service-modal">Modal</div>,
}));

describe('MaintenancePage', () => {
  it('should render maintenance page', () => {
    render(
      <BrowserRouter>
        <MaintenancePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });
});

