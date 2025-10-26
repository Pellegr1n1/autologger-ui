import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, waitFor } from '@testing-library/react';
import { useVehicles } from '../../../../features/vehicles/hooks/useVehicles';
import { VehicleService } from '../../../../features/vehicles/services/vehicleService';

jest.mock('../../../../features/vehicles/services/vehicleService');

describe('useVehicles', () => {
  const mockVehicle = {
    id: '1',
    plate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
    renavam: '12345678901',
    mileage: 50000,
    status: 'active',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockVehicles = {
    active: [mockVehicle],
    sold: [],
  };

  const mockStats = {
    activeCount: 1,
    totalValue: 50000,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with empty vehicles', async () => {
    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useVehicles());

    expect(result.current.vehicles).toEqual({ active: [], sold: [] });
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should fetch vehicles on mount', async () => {
    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.vehicles).toEqual(mockVehicles);
    expect(VehicleService.getUserVehicles).toHaveBeenCalled();
  });

  it('should create a new vehicle', async () => {
    const newVehicle = { ...mockVehicle, id: '2' };
    
    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);
    (VehicleService.createVehicle as any).mockResolvedValue(newVehicle);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.createVehicle({
      plate: 'XYZ5678',
      brand: 'Honda',
      model: 'Civic',
      year: 2021,
      color: 'Blue',
      renavam: '98765432109',
      mileage: 10000,
    });

    expect(VehicleService.createVehicle).toHaveBeenCalled();
  });

  it('should update a vehicle', async () => {
    const updatedVehicle = { ...mockVehicle, color: 'Black' };

    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);
    (VehicleService.updateVehicle as any).mockResolvedValue(updatedVehicle);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.updateVehicle('1', { color: 'Black' });

    expect(VehicleService.updateVehicle).toHaveBeenCalledWith('1', { color: 'Black' });
  });

  it('should mark vehicle as sold', async () => {
    const soldVehicle = { ...mockVehicle, status: 'sold' };

    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);
    (VehicleService.markVehicleAsSold as any).mockResolvedValue(soldVehicle);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.markAsSold('1');

    expect(VehicleService.markVehicleAsSold).toHaveBeenCalledWith('1', undefined);
  });

  it('should handle errors when fetching vehicles', async () => {
    (VehicleService.getUserVehicles as any).mockRejectedValue(new Error('Network error'));
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('Erro ao carregar veículos');
  });

  it('should clear error', () => {
    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useVehicles());

    result.current.clearError();
    expect(result.current.error).toBe(null);
  });

  it('should refresh vehicles', async () => {
    (VehicleService.getUserVehicles as any).mockResolvedValue(mockVehicles);
    (VehicleService.getActiveVehiclesStats as any).mockResolvedValue(mockStats);

    const { result } = renderHook(() => useVehicles());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await result.current.refreshVehicles();

    await waitFor(() => {
      expect(VehicleService.getUserVehicles).toHaveBeenCalledTimes(2);
    });
  });
});
