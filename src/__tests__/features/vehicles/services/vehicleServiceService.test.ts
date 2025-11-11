import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { VehicleServiceService } from '../../../../features/vehicles/services/vehicleServiceService';
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

  describe('getServicesByVehicle', () => {
    it('should return services by vehicle', async () => {
      const mockBackendResponse = [
        {
          id: '1',
          vehicleId: 'vehicle1',
          type: 'maintenance',
          category: 'oil',
          description: 'Oil change',
          serviceDate: '2024-01-01',
          mileage: 50000,
          cost: 200,
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z',
          status: 'pending',
        },
      ];

      (apiBase.api.get as any).mockResolvedValue({ data: mockBackendResponse });

      const result = await VehicleServiceService.getServicesByVehicle('vehicle1');

      expect(result).toHaveLength(1);
      expect(result[0].vehicleId).toBe('vehicle1');
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/vehicle/vehicle1');
    });
  });

  describe('getServiceById', () => {
    it('should return service by id', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: mockVehicleEvent });

      const result = await VehicleServiceService.getServiceById('1');

      expect(result).toEqual(mockVehicleEvent);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/1');
    });
  });

  describe('updateService', () => {
    it('should update service', async () => {
      const updateData = {
        description: 'Updated description',
      };

      (apiBase.api.patch as any).mockResolvedValue({ data: { ...mockVehicleEvent, ...updateData } });

      const result = await VehicleServiceService.updateService('1', updateData);

      expect(result.description).toBe('Updated description');
      expect(apiBase.api.patch).toHaveBeenCalledWith('/vehicle-services/1', updateData);
    });
  });

  describe('deleteService', () => {
    it('should delete service', async () => {
      (apiBase.api.delete as any).mockResolvedValue({});

      await VehicleServiceService.deleteService('1');

      expect(apiBase.api.delete).toHaveBeenCalledWith('/vehicle-services/1');
    });
  });

  describe('updateBlockchainStatus', () => {
    it('should update blockchain status', async () => {
      (apiBase.api.patch as any).mockResolvedValue({ data: mockVehicleEvent });

      const result = await VehicleServiceService.updateBlockchainStatus('1', 'hash123', 'user1');

      expect(result).toEqual(mockVehicleEvent);
      expect(apiBase.api.patch).toHaveBeenCalledWith('/vehicle-services/1/blockchain-status', {
        hash: 'hash123',
        confirmedBy: 'user1',
      });
    });
  });

  describe('getServicesByType', () => {
    it('should return services by type', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: [mockVehicleEvent] });

      const result = await VehicleServiceService.getServicesByType('maintenance');

      expect(result).toHaveLength(1);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/type/maintenance');
    });
  });

  describe('getServicesByStatus', () => {
    it('should return services by status', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: [mockVehicleEvent] });

      const result = await VehicleServiceService.getServicesByStatus('pending');

      expect(result).toHaveLength(1);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/status/pending');
    });
  });

  describe('getServicesByDateRange', () => {
    it('should return services by date range', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: [mockVehicleEvent] });

      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const result = await VehicleServiceService.getServicesByDateRange(startDate, endDate);

      expect(result).toHaveLength(1);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/date-range', {
        params: {
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
        },
      });
    });
  });

  describe('getTotalCostByVehicle', () => {
    it('should return total cost by vehicle', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: { total: 1000 } });

      const result = await VehicleServiceService.getTotalCostByVehicle('vehicle1');

      expect(result).toBe(1000);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/vehicle/vehicle1/total-cost');
    });
  });

  describe('getServicesCountByVehicle', () => {
    it('should return services count by vehicle', async () => {
      (apiBase.api.get as any).mockResolvedValue({ data: { count: 5 } });

      const result = await VehicleServiceService.getServicesCountByVehicle('vehicle1');

      expect(result).toBe(5);
      expect(apiBase.api.get).toHaveBeenCalledWith('/vehicle-services/vehicle/vehicle1/count');
    });
  });

  describe('uploadAttachments', () => {
    it('should upload attachments', async () => {
      const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' });
      const file2 = new File(['content2'], 'file2.jpg', { type: 'image/jpeg' });

      (apiBase.api.post as any).mockResolvedValue({
        data: {
          success: true,
          urls: ['http://example.com/file1.pdf', 'http://example.com/file2.jpg'],
          count: 2,
        },
      });

      jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await VehicleServiceService.uploadAttachments([file1, file2]);

      expect(result).toHaveLength(2);
      expect(result[0]).toBe('http://example.com/file1.pdf');
      expect(apiBase.api.post).toHaveBeenCalled();

      jest.restoreAllMocks();
    });

    it('should return empty array when no files', async () => {
      const result = await VehicleServiceService.uploadAttachments([]);

      expect(result).toEqual([]);
      expect(apiBase.api.post).not.toHaveBeenCalled();
    });

    it('should handle upload error', async () => {
      const file1 = new File(['content1'], 'file1.pdf', { type: 'application/pdf' });

      const error = new Error('Upload failed');
      (apiBase.api.post as any).mockRejectedValue(error);

      jest.spyOn(console, 'error').mockImplementation(() => {});

      await expect(VehicleServiceService.uploadAttachments([file1])).rejects.toThrow('Upload failed');

      jest.restoreAllMocks();
    });
  });

});

