import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { BlockchainService } from '../../../../features/blockchain/services/blockchainService';
import { apiBase } from '../../../../shared/services/api';

jest.mock('../../../../shared/services/api', () => ({
  apiBase: {
    api: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
    },
  },
}));

describe('BlockchainService', () => {
  const mockServiceData = {
    serviceId: '1',
    vehicleId: 'v1',
    mileage: 50000,
    cost: 1000,
    description: 'Test service',
    location: 'Test location',
    type: 'maintenance',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('submitService', () => {
    it('should submit service to blockchain', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0x123',
        status: 'SUBMITTED' as const,
        serviceId: '1',
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.submitService(mockServiceData);

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0x123');
      expect(apiBase.api.post).toHaveBeenCalledWith(
        '/blockchain/services/submit',
        mockServiceData
      );
    });
  });

  describe('confirmService', () => {
    it('should confirm service', async () => {
      const mockResponse = {
        success: true,
        status: 'CONFIRMED' as const,
        serviceId: '1',
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.confirmService('1');

      expect(result.success).toBe(true);
      expect(result.status).toBe('CONFIRMED');
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/1/confirm');
    });
  });

  describe('getNetworkHealth', () => {
    it('should return network health', async () => {
      const mockHealth = {
        status: 'connected',
        blockNumber: 12345,
        gasPrice: '20000000000',
        network: 'besu',
        peers: 3,
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockHealth });

      const result = await BlockchainService.getNetworkHealth();

      expect(result.status).toBe('connected');
      expect(result.blockNumber).toBe(12345);
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/network/health');
    });
  });

  describe('getBesuNetworkInfo', () => {
    it('should return Besu network info', async () => {
      const mockInfo = {
        chainId: 1337,
        blockNumber: 12345,
        gasPrice: '20000000000',
        networkName: 'besu-dev',
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockInfo });

      const result = await BlockchainService.getBesuNetworkInfo();

      expect(result.chainId).toBe(1337);
      expect(result.networkName).toBe('besu-dev');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/network/info');
    });
  });

  describe('verifyHash', () => {
    it('should return hash verification result', async () => {
      const mockResult = {
        exists: true,
        info: {
          owner: '0x123',
          timestamp: 1234567890,
          vehicleId: 'v1',
          eventType: 'maintenance',
          verificationCount: 1,
        },
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockResult });

      const result = await BlockchainService.verifyHash('0xhash');

      expect(result.exists).toBe(true);
      expect(result.info?.vehicleId).toBe('v1');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/hash/verify/0xhash');
    });
  });
});
