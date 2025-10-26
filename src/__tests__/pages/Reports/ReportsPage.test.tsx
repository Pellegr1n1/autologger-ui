import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
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
  it('should render reports page', () => {
    render(
      <BrowserRouter>
        <ReportsPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });
});

