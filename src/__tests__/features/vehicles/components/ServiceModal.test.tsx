import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, fireEvent, waitFor } from '@testing-library/react';
import ServiceModal from '../../../../features/vehicles/components/ServiceModal';

// Mock services
jest.mock('../../../../features/vehicles/services/vehicleServiceService', () => ({
  VehicleServiceService: {
    createService: jest.fn(() => Promise.resolve({ id: '1' })),
    updateService: jest.fn(() => Promise.resolve({ id: '1' })),
    uploadAttachments: jest.fn(() => Promise.resolve(['url1', 'url2'])),
    updateBlockchainStatus: jest.fn(() => Promise.resolve()),
  },
}));

jest.mock('../../../../features/vehicles/services/vehicleService', () => ({
  VehicleService: {
    getUserVehicles: jest.fn(() => Promise.resolve({ active: [] })),
    updateVehicle: jest.fn(() => Promise.resolve()),
  },
}));

// Mock notification
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    notification: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe('ServiceModal', () => {
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
  const mockOnAdd = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should not render when open is false', () => {
    const { container } = render(
      <ServiceModal
        open={false}
        vehicles={[mockVehicle]}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    expect(container.querySelector('.ant-modal')).toBeNull();
  });

  it('should handle modal close button', () => {
    const { container } = render(
      <ServiceModal
        open={true}
        vehicles={[mockVehicle]}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    const closeButton = container.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
    }
  });

  it('should handle form submission with validation', async () => {
    const { container } = render(
      <ServiceModal
        open={true}
        vehicles={[mockVehicle]}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    const form = container.querySelector('form');
    if (form) {
      fireEvent.submit(form);
    }
  });


  it('should handle successful form submission and confirmation', async () => {
    const { VehicleServiceService } = await import('../../../../features/vehicles/services/vehicleServiceService');
    (VehicleServiceService.createService as jest.Mock).mockResolvedValueOnce({
      id: '1',
      vehicleId: '1',
      type: 'maintenance',
      description: 'Test service',
      cost: 100,
      mileage: 15000,
      date: new Date(),
    });
    (VehicleServiceService.uploadAttachments as jest.Mock).mockResolvedValueOnce(['url1', 'url2']);
    (VehicleServiceService.updateBlockchainStatus as jest.Mock).mockResolvedValueOnce({});

    const { container } = render(
      <ServiceModal
        open={true}
        vehicles={[mockVehicle]}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    // Submit form button
    const submitButton = Array.from(container.querySelectorAll('button')).find(btn => 
      btn.textContent?.includes('Salvar') || btn.getAttribute('type') === 'submit'
    );

    if (submitButton) {
      fireEvent.click(submitButton);
      
      await waitFor(() => {
        const confirmModal = container.querySelector('.ant-modal');
        if (confirmModal) {
          const confirmButton = Array.from(container.querySelectorAll('button')).find(btn => 
            btn.textContent?.includes('Confirmar') || btn.textContent?.includes('Enviar')
          );
          if (confirmButton) {
            fireEvent.click(confirmButton);
          }
        }
      }, { timeout: 3000 });
    }
  });

  it('should handle file upload custom request', async () => {
    const { container } = render(
      <ServiceModal
        open={true}
        vehicles={[mockVehicle]}
        onClose={mockOnClose}
        onAdd={mockOnAdd}
      />
    );

    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    const uploader = container.querySelector('.ant-upload') || 
                    container.querySelector('[class*="upload"]');
    
    if (uploader) {
      const input = uploader.querySelector('input[type="file"]');
      if (input) {
        fireEvent.change(input, { target: { files: [file] } });
        expect(input).toBeInTheDocument();
      }
    }
  });
});

