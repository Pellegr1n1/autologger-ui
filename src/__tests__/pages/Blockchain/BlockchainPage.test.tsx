import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import BlockchainPage from '../../../pages/Blockchain/BlockchainPage';
import { BlockchainService } from '../../../features/blockchain/services/blockchainService';

// Mock CSS modules
jest.mock('../../../pages/Blockchain/BlockchainPage.module.css', () => ({}));
jest.mock('../../../components/layout/Components.module.css', () => ({}));

// Mock services
jest.mock('../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
    getBesuNetworkInfo: jest.fn(() => Promise.resolve(null)),
    getBesuContractStats: jest.fn(() => Promise.resolve(null)),
    getBesuConnectionStatus: jest.fn(() => Promise.resolve({ connected: false })),
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
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render blockchain page', () => {
    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    expect(screen.getByTestId('default-frame')).toBeInTheDocument();
  });

  it('should load blockchain data on mount', async () => {
    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
      expect(BlockchainService.getAllServices).toHaveBeenCalled();
    });
  });

  it('should handle data loading errors', async () => {
    (BlockchainService.getBesuConnectionStatus as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
    (BlockchainService.getAllServices as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
    });
  });

  it('should handle successful data load', async () => {
    (BlockchainService.getBesuConnectionStatus as jest.Mock).mockResolvedValueOnce({ connected: true });
    (BlockchainService.getAllServices as jest.Mock).mockResolvedValueOnce([
      { id: '1', hash: '0x123', status: 'CONFIRMED' },
    ]);

    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
    });
  });

  it('should handle network info data', async () => {
    (BlockchainService.getBesuNetworkInfo as jest.Mock).mockResolvedValueOnce({
      chainId: '123',
      networkId: '456',
    });
    (BlockchainService.getBesuConnectionStatus as jest.Mock).mockResolvedValueOnce({ connected: true });
    (BlockchainService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
    });
  });

  it('should handle contract stats data', async () => {
    (BlockchainService.getBesuContractStats as jest.Mock).mockResolvedValueOnce({
      totalRecords: 10,
      confirmedRecords: 8,
    });
    (BlockchainService.getBesuConnectionStatus as jest.Mock).mockResolvedValueOnce({ connected: true });
    (BlockchainService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
    });
  });

  it('should display transaction history component', async () => {
    (BlockchainService.getBesuConnectionStatus as jest.Mock).mockResolvedValueOnce({ connected: true });
    (BlockchainService.getAllServices as jest.Mock).mockResolvedValueOnce([]);

    render(
      <BrowserRouter>
        <BlockchainPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(BlockchainService.getBesuConnectionStatus).toHaveBeenCalled();
    });

    // Only TransactionHistory is actually rendered in the page
    expect(screen.getByTestId('transaction-history')).toBeInTheDocument();
  });
});

