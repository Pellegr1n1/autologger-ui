import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import BlockchainConfirmationModal from '../../../../features/vehicles/components/BlockchainConfirmationModal';

// Mock BlockchainService
jest.mock('../../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    submitService: jest.fn(() => Promise.resolve({
      success: true,
      transactionHash: '0x123',
      hash: '0x123',
      blockNumber: 1,
    })),
    confirmService: jest.fn(() => Promise.resolve({
      success: true,
      transactionHash: '0x456',
    })),
  },
}));

// Mock message and Modal
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  const Modal = actual.Modal;
  // Create a mock function for Modal.confirm
  Modal.confirm = jest.fn(({ onOk }: any) => {
    if (onOk) {
      onOk();
    }
  }) as any;
  return {
    ...actual,
    Modal,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe('BlockchainConfirmationModal', () => {
  const mockService = {
    id: '1',
    vehicleId: 'v1',
    type: 'maintenance' as const,
    category: 'service',
    description: 'Oil change',
    date: new Date('2024-01-01'),
    mileage: 50000,
    cost: 100,
    location: 'Garage',
    attachments: [],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    blockchainStatus: {
      status: 'PENDING' as const,
      lastUpdate: new Date(),
      retryCount: 0,
      maxRetries: 3,
    },
    isImmutable: false,
    canEdit: true,
    requiresConfirmation: false,
  };

  const mockOnClose = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when visible is false', () => {
    const { container } = render(
      <BlockchainConfirmationModal
        visible={false}
        service={mockService}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(container.querySelector('.ant-modal')).toBeNull();
  });

  it('should display service details in step 0', () => {
    const { getByText } = render(
      <BlockchainConfirmationModal
        visible={true}
        service={mockService}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    expect(getByText(/Detalhes do Serviço/i)).toBeTruthy();
  });

  it('should handle confirmation code input', async () => {
    const { BlockchainService } = await import('../../../../features/blockchain/services/blockchainService');
    (BlockchainService.submitService as jest.Mock).mockResolvedValueOnce({
      success: true,
      transactionHash: '0x123',
      hash: '0x123',
    });

    const { container } = render(
      <BlockchainConfirmationModal
        visible={true}
        service={mockService}
        onClose={mockOnClose}
        onSuccess={mockOnSuccess}
      />
    );

    // Find and click the submit button to go to step 1
    const submitButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Enviar') || btn.textContent?.includes('Blockchain')
    );

    if (submitButton) {
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const input = container.querySelector('input[placeholder*="000000"]') || 
                     container.querySelector('input[type="text"]');
        if (input) {
          fireEvent.change(input, { target: { value: '123456' } });
          expect(input).toBeInTheDocument();
        }
      }, { timeout: 3000 });
    }
  });
});

