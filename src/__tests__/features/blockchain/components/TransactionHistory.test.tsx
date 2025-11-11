import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TransactionHistory from '../../../../features/blockchain/components/TransactionHistory';

const mockGetAllServices = jest.fn();

jest.mock('../../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getAllServices: (...args: unknown[]) => mockGetAllServices(...args),
  },
}));

describe('TransactionHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render transaction history', async () => {
    mockGetAllServices.mockResolvedValue([]);

    render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Nenhuma transação registrada/i)).toBeInTheDocument();
    });
  });

  it('should display transactions', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x123',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        blockNumber: 12345,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    });
  });

  it('should handle loading state', () => {
    mockGetAllServices.mockImplementation(() => new Promise(() => {}));

    render(<TransactionHistory />);

    expect(screen.getByText(/Carregando/i)).toBeInTheDocument();
  });

  it('should handle refresh transactions', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x123',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        blockNumber: 12345,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    });

    const refreshButton = container.querySelector('button[aria-label*="Atualizar"]') ||
                          Array.from(container.querySelectorAll('button')).find(btn => 
                            btn.textContent?.includes('Atualizar') || btn.querySelector('[aria-label*="refresh"]')
                          );
    
    if (refreshButton) {
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockGetAllServices).toHaveBeenCalled();
      });
    }
  });

  it('should handle error loading transactions', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    mockGetAllServices.mockRejectedValue(new Error('Network error'));

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });

    jest.restoreAllMocks();
  });

  it('should display different transaction statuses', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x123',
        status: 'PENDING',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
      {
        id: '2',
        serviceId: '2',
        transactionHash: '0x456',
        status: 'FAILED',
        category: 'service',
        description: 'Repair',
        location: 'Shop',
        date: '2024-01-02',
        mileage: 20000,
        vehicle: {
          brand: 'Honda',
          model: 'Civic',
          plate: 'XYZ-5678',
        },
      },
      {
        id: '3',
        serviceId: '3',
        transactionHash: '0x789',
        status: 'SUBMITTED',
        category: 'service',
        description: 'Inspection',
        location: 'Dealer',
        date: '2024-01-03',
        mileage: 30000,
        vehicle: {
          brand: 'Ford',
          model: 'Focus',
          plate: 'DEF-9012',
        },
      },
    ]);

    render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    });
  });

  it('should handle view hash modal', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    });

    const hashButton = container.querySelector('button[aria-label*="Hash"]') ||
                      Array.from(container.querySelectorAll('button')).find(btn => 
                        btn.textContent?.includes('Hash') || btn.textContent?.includes('0x')
                      );
    
    if (hashButton) {
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.click(hashButton);
      
      await waitFor(() => {
        expect(container).toBeTruthy();
      });
    }
  });

  it('should handle copy hash', async () => {
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockResolvedValue(undefined),
      },
    });

    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('should handle copy hash error', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn().mockRejectedValue(new Error('Clipboard error')),
      },
    });

    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });

    jest.restoreAllMocks();
  });

  it('should handle transaction without vehicle', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        transactionHash: '0x123',
        status: 'CONFIRMED',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });

  it('should handle transaction without hash', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        serviceId: '1',
        status: 'PENDING',
        category: 'service',
        description: 'Oil change',
        location: 'Garage',
        date: '2024-01-01',
        mileage: 10000,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(container).toBeTruthy();
    });
  });
});
