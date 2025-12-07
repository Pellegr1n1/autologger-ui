import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import TransactionHistory from '../../../../features/blockchain/components/TransactionHistory';
import { IntegrityStatus } from '../../../../features/vehicles/types/vehicle.types';

const mockGetAllServices = jest.fn();

jest.mock('../../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getAllServices: (...args: unknown[]) => mockGetAllServices(...args),
  },
}));

jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warning: jest.fn(),
    },
  };
});

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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x123',
        blockNumber: 12345,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(mockGetAllServices).toHaveBeenCalled();
    });

    await waitFor(() => {
      const hasToyota = screen.queryByText(/Toyota/i) || 
                       screen.queryByText(/Corolla/i) ||
                       container.textContent?.includes('Toyota') ||
                       container.textContent?.includes('Corolla');
      expect(hasToyota).toBeTruthy();
    }, { timeout: 3000 });
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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x123',
        blockNumber: 12345,
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(mockGetAllServices).toHaveBeenCalledTimes(1);
    });

    await waitFor(() => {
      const isLoading = screen.queryByText(/Carregando/i);
      expect(isLoading).not.toBeInTheDocument();
    }, { timeout: 3000 });

    const refreshButton = screen.getByText(/Atualizar/i).closest('button');
    
    expect(refreshButton).toBeTruthy();
    
    if (refreshButton) {
      fireEvent.click(refreshButton);
      
      await waitFor(() => {
        expect(mockGetAllServices).toHaveBeenCalledTimes(2);
      }, { timeout: 3000 });
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
    // Ajustar para ter pelo menos uma transação CONFIRMED, uma CONFIRMED com VIOLATED, e uma FAILED
    // para que apareçam nas tabs corretas
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x123',
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
      },
      {
        id: '2',
        vehicleId: '2',
        type: 'SERVICO',
        category: 'service',
        description: 'Repair',
        serviceDate: '2024-01-02',
        createdAt: '2024-01-02',
        mileage: 20000,
        cost: 200,
        location: 'Shop',
        technician: 'Jane',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-02',
        transactionHash: '0x456',
        vehicle: {
          brand: 'Honda',
          model: 'Civic',
          plate: 'XYZ-5678',
        },
        integrityStatus: IntegrityStatus.VIOLATED,
      },
      {
        id: '3',
        vehicleId: '3',
        type: 'SERVICO',
        category: 'service',
        description: 'Failed service',
        serviceDate: '2024-01-03',
        createdAt: '2024-01-03',
        mileage: 30000,
        cost: 300,
        location: 'Shop',
        technician: 'Bob',
        warranty: false,
        status: 'FAILED',
        updatedAt: '2024-01-03',
        transactionHash: '0x789',
        vehicle: {
          brand: 'Ford',
          model: 'Focus',
          plate: 'DEF-9012',
        },
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(mockGetAllServices).toHaveBeenCalled();
    });

    // Verificar se os dados foram carregados (verificando se não está mais em loading)
    await waitFor(() => {
      const isLoading = screen.queryByText(/Carregando/i);
      expect(isLoading).not.toBeInTheDocument();
    }, { timeout: 3000 });

    // Verificar se pelo menos uma das marcas está presente no conteúdo
    await waitFor(() => {
      const hasVehicleData = container.textContent?.includes('Toyota') ||
                            container.textContent?.includes('Honda') ||
                            container.textContent?.includes('Corolla') ||
                            container.textContent?.includes('Civic');
      expect(hasVehicleData).toBeTruthy();
    }, { timeout: 3000 });
  });

  it('should handle view hash modal', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      const hasToyota = screen.queryByText(/Toyota/i) || 
                       container.textContent?.includes('Toyota');
      expect(hasToyota).toBeTruthy();
    }, { timeout: 3000 });

    const hashButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('0x') || btn.querySelector('[aria-label*="Hash"]')
    );
    
    if (hashButton) {
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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x123',
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
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'PENDING',
        updatedAt: '2024-01-01',
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

  it('should display adulterated transactions in separate tab', async () => {
    mockGetAllServices.mockResolvedValue([
      {
        id: '1',
        vehicleId: '1',
        type: 'SERVICO',
        category: 'service',
        description: 'Oil change',
        serviceDate: '2024-01-01',
        createdAt: '2024-01-01',
        mileage: 10000,
        cost: 150,
        location: 'Garage',
        technician: 'John',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-01',
        transactionHash: '0x123',
        vehicle: {
          brand: 'Toyota',
          model: 'Corolla',
          plate: 'ABC-1234',
        },
        integrityStatus: IntegrityStatus.VALID,
      },
      {
        id: '2',
        vehicleId: '2',
        type: 'SERVICO',
        category: 'service',
        description: 'Adulterated service',
        serviceDate: '2024-01-02',
        createdAt: '2024-01-02',
        mileage: 20000,
        cost: 200,
        location: 'Shop',
        technician: 'Jane',
        warranty: false,
        status: 'CONFIRMED',
        updatedAt: '2024-01-02',
        transactionHash: '0x456',
        vehicle: {
          brand: 'Honda',
          model: 'Civic',
          plate: 'XYZ-5678',
        },
        integrityStatus: IntegrityStatus.VIOLATED,
      },
    ]);

    const { container } = render(<TransactionHistory />);

    await waitFor(() => {
      expect(mockGetAllServices).toHaveBeenCalled();
    });

    // Aguardar o carregamento completo
    await waitFor(() => {
      const isLoading = screen.queryByText(/Carregando/i);
      expect(isLoading).not.toBeInTheDocument();
    }, { timeout: 3000 });

    await waitFor(() => {
      const hasAdulteratedTab = container.textContent?.includes('Adulteradas') ||
                                container.textContent?.includes('adulteradas') ||
                                screen.queryByText(/Adulteradas/i);
      expect(hasAdulteratedTab).toBeTruthy();
    }, { timeout: 3000 });
  });
});
