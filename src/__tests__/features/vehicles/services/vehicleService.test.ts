import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { VehicleService } from '../../../../features/vehicles/services/vehicleService';
import { apiBase } from '../../../../shared/services/api';

jest.mock('../../../../shared/services/api', () => ({
  apiBase: {
    api: {
      get: jest.fn() as any,
      post: jest.fn() as any,
      put: jest.fn() as any,
      patch: jest.fn() as any,
      delete: jest.fn() as any,
    },
  },
}));

describe('VehicleService', () => {
  const mockVehicle = {
    id: '1',
    plate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
    mileage: 50000,
    status: 'active',
    userId: 'user1',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserVehicles', () => {
    it('should return user vehicles', async () => {
      const mockResponse = { active: [mockVehicle], sold: [] };
      (apiBase.api.get as any).mockResolvedValue({ data: mockResponse });

      const result = await VehicleService.getUserVehicles();

      expect(result).toEqual(mockResponse);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicles');
    });
  });

  describe('createVehicle', () => {
    it('should create a vehicle without photo', async () => {
      const vehicleData = {
        plate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        renavam: '12345678901',
        mileage: 50000,
      };

      (apiBase.api.post as any).mockResolvedValue({ data: mockVehicle });

      const result = await VehicleService.createVehicle(vehicleData);

      expect(result).toEqual(mockVehicle);
      expect(apiBase.api.post).toHaveBeenCalled();
    });

    it('should create a vehicle with photo', async () => {
      const photo = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const vehicleData = {
        plate: 'ABC1234',
        brand: 'Toyota',
        model: 'Corolla',
        year: 2020,
        color: 'White',
        renavam: '12345678901',
        mileage: 50000,
        photo,
      };

      (apiBase.api.post as any).mockResolvedValue({ data: mockVehicle });

      const result = await VehicleService.createVehicle(vehicleData);

      expect(result).toEqual(mockVehicle);
      expect(apiBase.api.post).toHaveBeenCalled();
    });
  });

  describe('getVehicleById', () => {
    it('should return vehicle by id', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: mockVehicle });

      const result = await VehicleService.getVehicleById('1');

      expect(result).toEqual(mockVehicle);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicles/1');
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle data', async () => {
      const updateData = {
        color: 'Black',
        mileage: 60000,
      };

      (apiBase.api.put as any).mockResolvedValue({ data: { ...mockVehicle, ...updateData } });

      const result = await VehicleService.updateVehicle('1', updateData);

      expect(result.color).toBe('Black');
      expect(result.mileage).toBe(60000);
      expect(apiBase.api.put).toHaveBeenCalled();
    });
  });

  describe('markVehicleAsSold', () => {
    it('should mark vehicle as sold', async () => {
      const soldVehicle = { ...mockVehicle, status: 'sold' };
      (apiBase.api.patch as any).mockResolvedValue({ data: soldVehicle });

      const result = await VehicleService.markVehicleAsSold('1');

      expect(result.status).toBe('sold');
      expect(apiBase.api.patch).toHaveBeenCalledWith('/vehicles/1/mark-sold', {});
    });

    it('should mark vehicle as sold with additional data', async () => {
      const soldVehicle = { ...mockVehicle, status: 'sold' };
      (apiBase.api.patch as any).mockResolvedValue({ data: soldVehicle });

      const result = await VehicleService.markVehicleAsSold('1', { soldAt: new Date().toISOString() });

      expect(result.status).toBe('sold');
      expect(apiBase.api.patch).toHaveBeenCalled();
    });
  });

  describe('getActiveVehiclesStats', () => {
    it('should return active vehicles stats', async () => {
      const mockStats = { activeCount: 5, totalValue: 100000 };
      (apiBase.api.get as any).mockResolvedValue({ data: mockStats });

      const result = await VehicleService.getActiveVehiclesStats();

      expect(result).toEqual(mockStats);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicles/stats/active-count');
    });
  });
});
