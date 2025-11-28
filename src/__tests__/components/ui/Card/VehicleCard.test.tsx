import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen, fireEvent } from '@testing-library/react';
import VehicleCard from '../../../../components/ui/Card/VehicleCard';
import type { Vehicle } from '../../../features/vehicles/types/vehicle.types';

// Mock CSS module
jest.mock('../../../components/ui/Card/VehicleCard.module.css', () => ({
  card: 'card',
  image: 'image',
  content: 'content',
  actions: 'actions',
}));

// Mock do módulo env para garantir consistência
jest.mock('../../../../shared/utils/env', () => ({
  getApiBaseUrl: jest.fn(() => 'http://localhost:3001'),
  getGoogleClientId: jest.fn(() => 'test-client-id'),
  getEnvVar: jest.fn((key: string, defaultValue?: string) => {
    if (key === 'VITE_API_URL' || key === 'VITE_API_BASE_URL') {
      return 'http://localhost:3001';
    }
    if (key === 'VITE_GOOGLE_CLIENT_ID') {
      return 'test-client-id';
    }
    return defaultValue;
  }),
}));

const mockVehicle: Vehicle = {
  id: '1',
  brand: 'Toyota',
  model: 'Corolla',
  year: 2020,
  plate: 'ABC-1234',
  mileage: 50000,
  color: 'Branco',
  status: 'active' as const,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  imageUrl: 'http://example.com/image.jpg',
};

describe('VehicleCard', () => {
  const mockOnView = jest.fn();
  const mockOnEdit = jest.fn();
  const mockOnSell = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render vehicle card', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
    expect(screen.getByText(/Corolla/i)).toBeInTheDocument();
  });

  it('should call onView when view button is clicked', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    const viewButton = screen.getByText(/Visualizar/i);
    fireEvent.click(viewButton);

    expect(mockOnView).toHaveBeenCalledWith(mockVehicle);
  });

  it('should call onEdit when edit is selected from menu', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);

    // Simular clique no item de editar do menu
    const editOption = screen.getByText(/Editar Dados/i);
    fireEvent.click(editOption);

    expect(mockOnEdit).toHaveBeenCalledWith(mockVehicle);
  });

  it('should format km correctly', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/50.000/i)).toBeInTheDocument();
  });

  it('should show sold badge when showSoldBadge is true', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
        showSoldBadge={true}
      />
    );

    expect(screen.getByText(/Vendido/i)).toBeInTheDocument();
  });

  it('should handle vehicle without image', () => {
    const vehicleWithoutImage = {
      ...mockVehicle,
      imageUrl: undefined,
      photoUrl: undefined,
    };

    render(
      <VehicleCard
        vehicle={vehicleWithoutImage}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should handle vehicle with photoUrl', () => {
    const vehicleWithPhoto = {
      ...mockVehicle,
      photoUrl: 'http://example.com/photo.jpg',
      imageUrl: undefined,
    };

    render(
      <VehicleCard
        vehicle={vehicleWithPhoto}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should handle relative image URL', () => {
    const vehicleWithRelativeUrl = {
      ...mockVehicle,
      imageUrl: '/uploads/image.jpg',
    };

    render(
      <VehicleCard
        vehicle={vehicleWithRelativeUrl}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should call onSell when sell is selected from menu', () => {
    render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    const menuButton = screen.getByRole('button', { name: /more/i });
    fireEvent.click(menuButton);

    // Simular clique no item de vender do menu
    const sellOption = screen.getByText(/Marcar como Vendido/i);
    fireEvent.click(sellOption);

    expect(mockOnSell).toHaveBeenCalledWith(mockVehicle);
  });

  it('should not show dropdown menu for sold vehicles', () => {
    const soldVehicle = {
      ...mockVehicle,
      status: 'sold' as const,
      soldAt: new Date().toISOString(),
    };

    render(
      <VehicleCard
        vehicle={soldVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    const menuButtons = screen.queryAllByRole('button', { name: /more/i });
    expect(menuButtons.length).toBe(0);
  });

  it('should handle vehicle with photoUrl and imageUrl', () => {
    const vehicleWithBoth = {
      ...mockVehicle,
      photoUrl: 'http://example.com/photo.jpg',
      imageUrl: 'http://example.com/image.jpg',
    };

    render(
      <VehicleCard
        vehicle={vehicleWithBoth}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should handle absolute image URL', () => {
    const vehicleWithAbsoluteUrl = {
      ...mockVehicle,
      imageUrl: 'https://example.com/image.jpg',
    };

    render(
      <VehicleCard
        vehicle={vehicleWithAbsoluteUrl}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should handle vehicle with soldAt property', () => {
    const soldVehicle = {
      ...mockVehicle,
      status: 'sold' as const,
      soldAt: new Date().toISOString(),
    };

    render(
      <VehicleCard
        vehicle={soldVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    expect(screen.getByText(/Toyota/i)).toBeInTheDocument();
  });

  it('should handle button hover effects', () => {
    const { container } = render(
      <VehicleCard
        vehicle={mockVehicle}
        onView={mockOnView}
        onEdit={mockOnEdit}
        onSell={mockOnSell}
      />
    );

    const viewButton = screen.getByText(/Visualizar/i);
    fireEvent.mouseEnter(viewButton);
    fireEvent.mouseLeave(viewButton);

    expect(viewButton).toBeInTheDocument();
  });
});
