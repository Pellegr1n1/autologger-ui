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
      const mockStats = { activeCount: 5, totalValue: 100000, canAddMore: true };
      (apiBase.api.get as any).mockResolvedValue({ data: mockStats });

      const result = await VehicleService.getActiveVehiclesStats();

      expect(result).toEqual(mockStats);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicles/stats/active-count');
    });
  });

  describe('deleteVehicle', () => {
    it('should delete vehicle', async () => {
      (apiBase.api.delete as any).mockResolvedValue({});

      await VehicleService.deleteVehicle('1');

      expect(apiBase.api.delete).toHaveBeenCalledWith('/vehicles/1');
    });
  });

  describe('validatePlate', () => {
    it('should validate old format plate', () => {
      expect(VehicleService.validatePlate('ABC1234')).toBe(true);
      expect(VehicleService.validatePlate('ABC-1234')).toBe(true);
    });

    it('should validate mercosul format plate', () => {
      expect(VehicleService.validatePlate('ABC1D23')).toBe(true);
      expect(VehicleService.validatePlate('ABC-1D23')).toBe(true);
    });

    it('should reject invalid plates', () => {
      expect(VehicleService.validatePlate('ABC123')).toBe(false);
      expect(VehicleService.validatePlate('ABC12345')).toBe(false);
      expect(VehicleService.validatePlate('AB1234')).toBe(false);
    });
  });

  describe('formatPlate', () => {
    it('should format old format plate', () => {
      expect(VehicleService.formatPlate('ABC1234')).toBe('ABC-1234');
      expect(VehicleService.formatPlate('abc1234')).toBe('ABC-1234');
    });

    it('should format mercosul format plate', () => {
      expect(VehicleService.formatPlate('ABC1D23')).toBe('ABC-1D23');
    });

    it('should handle invalid length', () => {
      expect(VehicleService.formatPlate('ABC123')).toBe('ABC123');
    });
  });

  describe('getVehicleSummary', () => {
    it('should return vehicle summary', () => {
      const summary = VehicleService.getVehicleSummary(mockVehicle);
      expect(summary).toContain('Toyota');
      expect(summary).toContain('Corolla');
      expect(summary).toContain('2020');
      expect(summary).toContain('ABC-1234');
    });
  });

  describe('canAddMoreVehicles', () => {
    it('should return true when can add more', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: { canAddMore: true } });

      const result = await VehicleService.canAddMoreVehicles();

      expect(result).toBe(true);
    });

    it('should return false when cannot add more', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: { canAddMore: false } });

      const result = await VehicleService.canAddMoreVehicles();

      expect(result).toBe(false);
    });
  });

  describe('getVehicleAge', () => {
    it('should calculate vehicle age', () => {
      const currentYear = new Date().getFullYear();
      const age = VehicleService.getVehicleAge(2020);
      expect(age).toBe(currentYear - 2020);
    });
  });

  describe('formatMileage', () => {
    it('should format mileage correctly', () => {
      expect(VehicleService.formatMileage(50000)).toContain('50.000');
      expect(VehicleService.formatMileage(50000)).toContain('km');
    });
  });

  describe('isActive', () => {
    it('should return true for active vehicle', () => {
      expect(VehicleService.isActive(mockVehicle as any)).toBe(true);
    });

    it('should return false for sold vehicle', () => {
      const soldVehicle = { ...mockVehicle, status: 'sold' };
      expect(VehicleService.isActive(soldVehicle as any)).toBe(false);
    });
  });

  describe('isSold', () => {
    it('should return true for sold vehicle', () => {
      const soldVehicle = { ...mockVehicle, status: 'sold' };
      expect(VehicleService.isSold(soldVehicle as any)).toBe(true);
    });

    it('should return false for active vehicle', () => {
      expect(VehicleService.isSold(mockVehicle as any)).toBe(false);
    });
  });

  describe('updateVehicle', () => {
    it('should update vehicle with photo', async () => {
      const photo = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const updateData = {
        color: 'Black',
        mileage: 60000,
        photo,
      };

      (apiBase.api.put as any).mockResolvedValue({ data: { ...mockVehicle, ...updateData } });

      const result = await VehicleService.updateVehicle('1', updateData);

      expect(result).toBeDefined();
      expect(apiBase.api.put).toHaveBeenCalled();
    });
  });
});
