import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlockchainPage from '../../../pages/Blockchain/BlockchainPage';

// Mock CSS modules
jest.mock('../../../pages/Blockchain/BlockchainPage.module.css', () => ({}));
jest.mock('../../../components/layout/Components.module.css', () => ({}));

// Mock services
jest.mock('../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
    getBesuNetworkInfo: jest.fn(() => Promise.resolve(null)),
    getBesuContractStats: jest.fn(() => Promise.resolve(null)),
    getBesuConnectionStatus: jest.fn(() => Promise.resolve({ connectionStatus: false })),
    getAllServices: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../../components/layout', () => ({
  DefaultFrame: ({ children }: any) => <div data-testid="default-frame">{children}</div>,
}));

jest.mock('../../../features/blockchain/components/BlockchainOverview', () => ({
  __esModule: true,
  default: () => <div data-testid="blockchain-overview">Overview</div>,
}));

jest.mock('../../../features/blockchain/components/TransactionHistory', () => ({
  __esModule: true,
  default: () => <div data-testid="transaction-history">History</div>,
}));

jest.mock('../../../features/blockchain/components/NetworkInfo', () => ({
  __esModule: true,
  default: () => <div data-testid="network-info">Network</div>,
}));

describe('BlockchainPage', () => {
  it('should render blockchain page', () => {
    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });
});

