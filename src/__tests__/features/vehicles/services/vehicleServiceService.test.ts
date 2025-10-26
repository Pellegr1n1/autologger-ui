import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { VehicleServiceService } from '../../../../features/vehicles/services/vehicleServiceService';
import { apiBase } from '../../../../shared/services/api';

jest.mock('../../../../shared/services/api', () => ({
  apiBase: {
    api: {
      get: jest.fn() as any,
      post: jest.fn() as any,
      put: jest.fn() as any,
      delete: jest.fn() as any,
    },
  },
}));

describe('VehicleServiceService', () => {
  const mockVehicleEvent = {
    id: '1',
    vehicleId: 'vehicle1',
    type: 'maintenance',
    category: 'oil_change',
    description: 'Oil change',
    date: new Date('2024-01-01'),
    mileage: 50000,
    cost: 200,
    location: 'Garage',
    attachments: [],
    technician: 'John Doe',
    warranty: false,
    nextServiceDate: new Date('2024-04-01'),
    notes: 'Regular maintenance',
    createdAt: new Date(),
    updatedAt: new Date(),
    blockchainStatus: {
      status: 'PENDING' as const,
      message: 'Aguardando confirmação na blockchain',
      lastUpdate: new Date(),
      retryCount: 0,
      transactionHash: undefined,
      error: undefined,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('should create a vehicle service', async () => {
      const serviceData = {
        vehicleId: 'vehicle1',
        type: 'maintenance',
        category: 'oil_change',
        description: 'Oil change',
        serviceDate: new Date('2024-01-01'),
        mileage: 50000,
        cost: 200,
        location: 'Garage',
      };

      (apiBase.api.post as any).mockResolvedValue({ data: mockVehicleEvent });

      const result = await VehicleServiceService.createService(serviceData);

      expect(result).toEqual(mockVehicleEvent);
      expect(apiBase.api.post).toHaveBeenCalledWith('/vehicle-services', serviceData);
    });
  });

  describe('getAllServices', () => {
    it('should return all services with confirmed status', async () => {
      const mockBackendResponse = [
        {
          id: '1',
          vehicleId: 'vehicle1',
          type: 'maintenance',
          category: 'oil_change',
          description: 'Oil change',
          serviceDate: '2024-01-01T00:00:00Z',
          mileage: 50000,
          cost: 200,
          location: 'Garage',
          attachments: [],
          technician: 'John Doe',
          warranty: false,
          nextServiceDate: '2024-04-01T00:00:00Z',
          notes: 'Regular maintenance',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          status: 'confirmed',
          blockchainHash: 'hash123',
        },
      ];

      (apiBase.api.get as any).mockResolvedValue({ data: mockBackendResponse });

      const result = await VehicleServiceService.getAllServices();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(result[0].vehicleId).toBe('vehicle1');
      expect(result[0].type).toBe('maintenance');
    });

    it('should handle different status mappings', async () => {
      const mockBackendResponse = [
        {
          id: '1',
          status: 'rejected',
          createdAt: '2024-01-01T00:00:00Z',
        },
        {
          id: '2',
          status: 'expired',
          createdAt: '2024-01-02T00:00:00Z',
        },
        {
          id: '3',
          status: 'unknown',
          createdAt: '2024-01-03T00:00:00Z',
        },
      ];

      (apiBase.api.get as any).mockResolvedValue({ data: mockBackendResponse });

      const result = await VehicleServiceService.getAllServices();

      expect(result).toHaveLength(3);
    });

    it('should handle services without nextServiceDate', async () => {
      const mockBackendResponse = [
        {
          id: '1',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          status: 'pending',
        },
      ];

      (apiBase.api.get as any).mockResolvedValue({ data: mockBackendResponse });

      const result = await VehicleServiceService.getAllServices();

      expect(result[0].nextServiceDate).toBeUndefined();
    });
  });

});

