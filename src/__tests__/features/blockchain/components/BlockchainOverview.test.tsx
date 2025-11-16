import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import BlockchainOverview from '../../../../features/blockchain/components/BlockchainOverview';

const mockData = {
  totalTransactions: 100,
  confirmedTransactions: 90,
  pendingTransactions: 5,
  failedTransactions: 5,
  reliabilityScore: 90,
  networkStatus: 'active',
  averageConfirmationTime: 2.5,
  lastSyncTime: new Date(),
};

const mockBesuData = {
  connectionStatus: true,
  networkInfo: {
    chainId: 1337,
    blockNumber: 12345,
    gasPrice: '20',
    networkName: 'Besu Network',
  },
  contractStats: {
    totalHashes: 1000,
    contractBalance: '1.5',
  },
  error: null,
};

describe('BlockchainOverview', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render blockchain overview', () => {
    render(<BlockchainOverview data={mockData} besuData={mockBesuData} />);

    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
    expect(screen.getByText(/Análise de Segurança/i)).toBeInTheDocument();
  });

  it('should render without besuData', () => {
    render(<BlockchainOverview data={mockData} />);

    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
  });

  it('should display transaction statistics', () => {
    render(<BlockchainOverview data={mockData} />);

    expect(screen.getByText(/90 de 100 transações/i)).toBeInTheDocument();
  });

  it('should display reliability score', () => {
    render(<BlockchainOverview data={mockData} />);

    expect(screen.getAllByText(/Excelente/i).length).toBeGreaterThan(0);
  });

  it('should handle different reliability scores', () => {
    const lowScoreData = { ...mockData, reliabilityScore: 60 };
    const { rerender } = render(<BlockchainOverview data={lowScoreData} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();

    const mediumScoreData = { ...mockData, reliabilityScore: 75 };
    rerender(<BlockchainOverview data={mediumScoreData} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();

    const highScoreData = { ...mockData, reliabilityScore: 95 };
    rerender(<BlockchainOverview data={highScoreData} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
  });

  it('should handle zero total transactions', () => {
    const zeroData = {
      ...mockData,
      totalTransactions: 0,
      confirmedTransactions: 0,
      pendingTransactions: 0,
      failedTransactions: 0,
    };

    render(<BlockchainOverview data={zeroData} />);

    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
  });

  it('should display all transaction types', () => {
    render(<BlockchainOverview data={mockData} />);

    expect(screen.getByText(/90 de 100 transações/i)).toBeInTheDocument();
    const pendingTexts = screen.queryAllByText(/5 de 100 transações/i);
    expect(pendingTexts.length).toBeGreaterThan(0);
  });

  it('should handle besuData with connection info', () => {
    render(<BlockchainOverview data={mockData} besuData={mockBesuData} />);

    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
  });

  it('should handle reliability score edge cases', () => {
    const score70Data = { ...mockData, reliabilityScore: 70 };
    const { rerender } = render(<BlockchainOverview data={score70Data} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();

    const score89Data = { ...mockData, reliabilityScore: 89 };
    rerender(<BlockchainOverview data={score89Data} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();

    const score90Data = { ...mockData, reliabilityScore: 90 };
    rerender(<BlockchainOverview data={score90Data} />);
    
    expect(screen.getByText(/Status das Transações/i)).toBeInTheDocument();
  });
});
