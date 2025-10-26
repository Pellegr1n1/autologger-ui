import { describe, it, expect, jest, beforeEach } from '@jest/globals';

// Mock api before importing the service
const mockApi = {
  api: {
    get: jest.fn(),
    post: jest.fn(),
    delete: jest.fn(),
  },
};

jest.mock('../../../../shared/services/api', () => ({
  apiBase: mockApi,
}));

import { VehicleShareService } from '../../../../features/vehicles/services/vehicleShareService';

describe('VehicleShareService', () => {
  const mockShareResponse = {
    shareToken: 'test-token-123',
    shareUrl: 'https://example.com/vehicles/share/test-token-123',
    expiresAt: new Date().toISOString(),
    isActive: true,
  };

  const mockPublicVehicle = {
    id: '1',
    plate: 'ABC1234',
    brand: 'Toyota',
    model: 'Corolla',
    year: 2020,
    color: 'White',
    mileage: 50000,
    status: 'active',
    createdAt: new Date().toISOString(),
    photoUrl: 'https://example.com/photo.jpg',
    maintenanceHistory: [
      {
        type: 'Oil Change',
        category: 'Maintenance',
        description: 'Regular oil change',
        serviceDate: new Date().toISOString(),
        mileage: 45000,
        cost: 150,
        location: 'Auto Shop',
        technician: 'John Doe',
        warranty: true,
        nextServiceDate: new Date().toISOString(),
        notes: 'All good',
        blockchainStatus: 'confirmed',
        blockchainHash: 'hash123',
        attachments: [],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateShareLink', () => {
    it('should generate share link without expiration', async () => {
      (mockApi.api.post as any).mockResolvedValue({ data: mockShareResponse });

      const result = await VehicleShareService.generateShareLink('1');

      expect(result).toEqual(mockShareResponse);
      expect(mockApi.api.post).toHaveBeenCalledWith('/vehicles/1/generate-share-link');
    });

    it('should generate share link with expiration', async () => {
      (mockApi.api.post as any).mockResolvedValue({ data: mockShareResponse });

      const result = await VehicleShareService.generateShareLink('1', 7);

      expect(result).toEqual(mockShareResponse);
      expect(mockApi.api.post).toHaveBeenCalledWith('/vehicles/1/generate-share-link?expiresInDays=7');
    });
  });

  describe('getPublicVehicleInfo', () => {
    it('should get public vehicle info by token', async () => {
      (mockApi.api.get as any).mockResolvedValue({ data: mockPublicVehicle });

      const result = await VehicleShareService.getPublicVehicleInfo('test-token-123');

      expect(result).toEqual(mockPublicVehicle);
      expect(mockApi.api.get).toHaveBeenCalledWith('/vehicles/share/test-token-123');
    });
  });

  describe('deactivateShareLink', () => {
    it('should deactivate share link', async () => {
      (mockApi.api.delete as any).mockResolvedValue({});

      await VehicleShareService.deactivateShareLink('test-token-123');

      expect(mockApi.api.delete).toHaveBeenCalledWith('/vehicles/share/test-token-123');
    });
  });

  describe('getMyShareLinks', () => {
    it('should get user share links', async () => {
      const mockLinks = [mockShareResponse, { ...mockShareResponse, shareToken: 'test-token-456' }];
      (mockApi.api.get as any).mockResolvedValue({ data: mockLinks });

      const result = await VehicleShareService.getMyShareLinks();

      expect(result).toEqual(mockLinks);
      expect(mockApi.api.get).toHaveBeenCalledWith('/vehicles/my-shares');
    });
  });
});

