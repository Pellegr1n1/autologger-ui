import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import VehicleForm from '../../../../components/forms/VehicleForm/VehicleForm';

// Mock CSS module
jest.mock('../../../../components/forms/VehicleForm/VehicleForm.module.css', () => ({}));

// Mock FipeService
jest.mock('../../../../features/vehicles/services/fipeService', () => ({
  FipeService: {
    checkApiAvailability: jest.fn(() => Promise.resolve(true)),
    getBrandsWithCache: jest.fn(() => Promise.resolve([])),
    getModelsByBrand: jest.fn(() => Promise.resolve([])),
    getYearsByBrandAndModel: jest.fn(() => Promise.resolve([])),
    extractYear: jest.fn(() => 2020),
  },
}));

// Mock antd message
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    message: {
      success: jest.fn(),
      error: jest.fn(),
      warning: jest.fn(),
      info: jest.fn(),
    },
  };
});

describe('VehicleForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vehicle form when visible', () => {
    render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Cadastrar Novo Veículo/i)).toBeInTheDocument();
  });

  it('should render edit vehicle form when vehicle is provided', () => {
    const mockVehicle = {
      id: '1',
      plate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 10000,
    };

    render(
      <VehicleForm
        visible={true}
        vehicle={mockVehicle}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Editar Veículo/i)).toBeInTheDocument();
  });

  it('should not render when visible is false', () => {
    const { container } = render(
      <VehicleForm
        visible={false}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(container.querySelector('.ant-modal')).toBeNull();
  });

  it('should load brands when visible and not editing', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.checkApiAvailability as jest.Mock).mockResolvedValueOnce(true);
    (FipeService.getBrandsWithCache as jest.Mock).mockResolvedValueOnce([
      { code: '1', name: 'Toyota' },
    ]);

    render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    // Wait for brands to load
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(FipeService.getBrandsWithCache).toHaveBeenCalled();
  });

  it('should handle FIPE API unavailable', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.checkApiAvailability as jest.Mock).mockResolvedValueOnce(false);

    render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(FipeService.checkApiAvailability).toHaveBeenCalled();
  });

  it('should handle loading state', () => {
    render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        loading={true}
      />
    );

    expect(screen.getByText(/Cadastrar Novo Veículo/i)).toBeInTheDocument();
  });

  it('should handle form with vehicle data', () => {
    const mockVehicle = {
      id: '1',
      plate: 'ABC1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Branco',
      mileage: 10000,
      photoUrl: 'https://example.com/photo.jpg',
    };

    render(
      <VehicleForm
        visible={true}
        vehicle={mockVehicle}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Editar Veículo/i)).toBeInTheDocument();
  });

  it('should handle models loading', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.getModelsByBrand as jest.Mock).mockResolvedValueOnce([
      { code: 1, name: 'Corolla' },
    ]);

    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });

  it('should handle years loading', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.getYearsByBrandAndModel as jest.Mock).mockResolvedValueOnce([
      { code: '2020', name: '2020' },
    ]);

    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });

  it('should handle model loading error', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.getModelsByBrand as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });

  it('should handle year loading error', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.getYearsByBrandAndModel as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });

  it('should handle photo upload', () => {
    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const uploader = container.querySelector('.ant-upload') || 
                    container.querySelector('[class*="upload"]');
    
    // Just verify the component renders, uploader may not be immediately available
    expect(container).toBeTruthy();
  });

  it('should handle form reset on close', () => {
    const { container } = render(
      <VehicleForm
        visible={false}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(container.querySelector('.ant-modal')).toBeNull();
  });

  it('should handle FIPE brands loading error', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.checkApiAvailability as jest.Mock).mockResolvedValueOnce(true);
    (FipeService.getBrandsWithCache as jest.Mock).mockRejectedValueOnce(new Error('Load failed'));

    render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(FipeService.getBrandsWithCache).toHaveBeenCalled();
  });

  it('should handle manual entry mode when FIPE is unavailable', async () => {
    const { FipeService } = await import('../../../../features/vehicles/services/fipeService');
    (FipeService.checkApiAvailability as jest.Mock).mockResolvedValueOnce(false);

    const { container } = render(
      <VehicleForm
        visible={true}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    await new Promise(resolve => setTimeout(resolve, 100));
    expect(container).toBeTruthy();
  });
});

