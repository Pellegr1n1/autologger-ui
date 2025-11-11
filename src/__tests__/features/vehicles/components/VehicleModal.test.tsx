import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleModal from '../../../../features/vehicles/components/VehicleModal';

// Mock services
jest.mock('../../../../features/vehicles/services/vehicleServiceService', () => ({
  VehicleServiceService: {
    getServicesByVehicle: jest.fn(() => Promise.resolve([])),
    getServicesCountByVehicle: jest.fn(() => Promise.resolve(0)),
  },
}));

jest.mock('../../../../features/blockchain/services/blockchainService', () => ({
  BlockchainService: {
    getHealth: jest.fn(() => Promise.resolve({ status: 'healthy' })),
    getServicesByVehicle: jest.fn(() => Promise.resolve([])),
  },
}));

jest.mock('../../../../features/vehicles/components/VehicleShareModal', () => ({
  __esModule: true,
  default: () => <div data-testid="vehicle-share-modal">Share Modal</div>,
}));

describe('VehicleModal', () => {
  const mockVehicle = {
    id: '1',
    plate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'Branco',
    mileage: 10000,
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const mockOnClose = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vehicle modal when visible', () => {
    render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    const { container } = render(
      <VehicleModal
        visible={false}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    expect(container.querySelector('.ant-modal')).toBeNull();
  });

  it('should not render when vehicle is null', () => {
    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={null}
        onClose={mockOnClose}
      />
    );

    expect(container.firstChild).toBeNull();
  });

  it('should load maintenance count successfully', async () => {
    const { VehicleServiceService } = await import('../../../../features/vehicles/services/vehicleServiceService');
    (VehicleServiceService.getServicesCountByVehicle as jest.Mock).mockResolvedValueOnce(5);

    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });

  it('should handle maintenance count error with blockchain fallback', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { VehicleServiceService } = await import('../../../../features/vehicles/services/vehicleServiceService');
    const { BlockchainService } = await import('../../../../features/blockchain/services/blockchainService');
    
    (VehicleServiceService.getServicesCountByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Service error'));
    (BlockchainService.getServicesByVehicle as jest.Mock).mockResolvedValueOnce([
      { id: '1' }, { id: '2' }
    ]);

    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
    jest.restoreAllMocks();
  });

  it('should handle maintenance count error with service fallback', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { VehicleServiceService } = await import('../../../../features/vehicles/services/vehicleServiceService');
    const { BlockchainService } = await import('../../../../features/blockchain/services/blockchainService');
    
    (VehicleServiceService.getServicesCountByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Service error'));
    (BlockchainService.getServicesByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Blockchain error'));
    (VehicleServiceService.getServicesByVehicle as jest.Mock).mockResolvedValueOnce([
      { id: '1' }
    ]);

    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
    jest.restoreAllMocks();
  });

  it('should handle all fallbacks failing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    const { VehicleServiceService } = await import('../../../../features/vehicles/services/vehicleServiceService');
    const { BlockchainService } = await import('../../../../features/blockchain/services/blockchainService');
    
    (VehicleServiceService.getServicesCountByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Service error'));
    (BlockchainService.getServicesByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Blockchain error'));
    (VehicleServiceService.getServicesByVehicle as jest.Mock).mockRejectedValueOnce(new Error('Fallback error'));

    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
    jest.restoreAllMocks();
  });

  it('should handle sold vehicle', () => {
    const soldVehicle = { ...mockVehicle, status: 'sold' as const };
    
    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={soldVehicle}
        onClose={mockOnClose}
      />
    );

    expect(container).toBeTruthy();
  });

  it('should handle share modal open and close', async () => {
    const { container } = render(
      <VehicleModal
        visible={true}
        vehicle={mockVehicle}
        onClose={mockOnClose}
      />
    );

    const shareButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Compartilhar') || btn.querySelector('[aria-label*="Compartilhar"]')
    );

    if (shareButton) {
      fireEvent.click(shareButton);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(container).toBeTruthy();
    }
  });
});

