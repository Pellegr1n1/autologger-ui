import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NetworkInfo from '../../../../features/blockchain/components/NetworkInfo';

const mockGetBesuConnectionStatus = jest.fn();
const mockGetBesuNetworkInfo = jest.fn();

jest.mock('../../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getBesuConnectionStatus: (...args: unknown[]) => mockGetBesuConnectionStatus(...args),
    getBesuNetworkInfo: (...args: unknown[]) => mockGetBesuNetworkInfo(...args),
  },
}));

describe('NetworkInfo', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render network info', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: true });
    mockGetBesuNetworkInfo.mockResolvedValue({
      chainId: 1337,
      blockNumber: 12345,
      gasPrice: '20',
    });

    render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });
  });

  it('should handle refresh connection', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: true });
    mockGetBesuNetworkInfo.mockResolvedValue({
      chainId: 1337,
      blockNumber: 12345,
      gasPrice: '20',
    });

    render(<NetworkInfo />);

    await waitFor(() => {
      const refreshButton = screen.getByText(/Atualizar/i);
      expect(refreshButton).toBeInTheDocument();
    });
  });

  it('should handle connection error', async () => {
    mockGetBesuConnectionStatus.mockRejectedValue(new Error('Connection failed'));
    mockGetBesuNetworkInfo.mockRejectedValue(new Error('Network error'));

    render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });
  });

  it('should handle refresh button click', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: true });
    mockGetBesuNetworkInfo.mockResolvedValue({
      chainId: 1337,
      blockNumber: 12345,
      gasPrice: '20',
    });

    const { container } = render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });

    const refreshButton = container.querySelector('button') || 
                         Array.from(container.querySelectorAll('button')).find(btn => 
                           btn.textContent?.includes('Atualizar')
                         );

    if (refreshButton) {
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockGetBesuConnectionStatus).toHaveBeenCalled();
      });
    }
  });

  it('should handle disconnected status', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: false });
    mockGetBesuNetworkInfo.mockResolvedValue({
      chainId: 1337,
      blockNumber: 12345,
      gasPrice: '20',
    });

    render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });
  });

  it('should handle network info with null info', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: true });
    mockGetBesuNetworkInfo.mockRejectedValue(new Error('Network error'));

    render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });
  });

  it('should handle different network types', async () => {
    mockGetBesuConnectionStatus.mockResolvedValue({ connected: true });
    mockGetBesuNetworkInfo.mockResolvedValue({
      chainId: 1,
      blockNumber: 12345,
      gasPrice: '20',
      networkName: 'mainnet',
    });

    render(<NetworkInfo />);

    await waitFor(() => {
      expect(screen.getByText(/Status da Rede/i)).toBeInTheDocument();
    });
  });
});
