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

  describe('resendFailedService', () => {
    it('should resend failed service', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0x456',
        status: 'SUBMITTED' as const,
        serviceId: '1',
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.resendFailedService('1');

      expect(result.success).toBe(true);
      expect(result.transactionHash).toBe('0x456');
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/1/resend');
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', async () => {
      const mockStatus = {
        hash: '0x789',
        status: 'CONFIRMED' as const,
        blockNumber: 12345,
        gasUsed: '21000',
        timestamp: 1234567890,
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockStatus });

      const result = await BlockchainService.getServiceStatus('1');

      expect(result.hash).toBe('0x789');
      expect(result.status).toBe('CONFIRMED');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/services/1/status');
    });
  });

  describe('getAllServices', () => {
    it('should return all services', async () => {
      const mockServices = [
        {
          id: '1',
          vehicleId: 'v1',
          type: 'maintenance',
          category: 'oil',
          description: 'Oil change',
          serviceDate: '2024-01-01',
          mileage: 50000,
          cost: 1000,
          location: 'Garage',
          technician: 'John Doe',
          warranty: false,
          status: 'confirmed',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
        },
      ];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await BlockchainService.getAllServices();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('1');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/services');
    });
  });

  describe('getBesuContractStats', () => {
    it('should return Besu contract stats', async () => {
      const mockStats = {
        totalHashes: 100,
        contractBalance: '1000000000000000000',
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockStats });

      const result = await BlockchainService.getBesuContractStats();

      expect(result.totalHashes).toBe(100);
      expect(result.contractBalance).toBe('1000000000000000000');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/contract/stats');
    });
  });

  describe('checkConnection', () => {
    it('should return connection status', async () => {
      const mockConnection = {
        connected: true,
      };

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockConnection });

      const result = await BlockchainService.getBesuConnectionStatus();

      expect(result.connected).toBe(true);
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/connection/status');
    });
  });

  describe('getServicesByVehicle', () => {
    it('should return services by vehicle', async () => {
      const mockServices = [
        {
          id: '1',
          vehicleId: 'v1',
          type: 'maintenance',
          category: 'oil',
          description: 'Oil change',
          serviceDate: '2024-01-01',
          mileage: 50000,
          cost: 1000,
        },
      ];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await BlockchainService.getServicesByVehicle('v1');

      expect(result).toHaveLength(1);
      expect(result[0].vehicleId).toBe('v1');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/services/vehicle/v1');
    });
  });

  describe('getServicesByType', () => {
    it('should return services by type', async () => {
      const mockServices = [
        {
          id: '1',
          type: 'maintenance',
          category: 'oil',
        },
      ];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await BlockchainService.getServicesByType('maintenance');

      expect(result).toHaveLength(1);
      expect(result[0].type).toBe('maintenance');
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/services/type/maintenance');
    });
  });

  describe('getServicesByDateRange', () => {
    it('should return services by date range', async () => {
      const mockServices = [
        {
          id: '1',
          serviceDate: '2024-01-15',
        },
      ];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await BlockchainService.getServicesByDateRange('2024-01-01', '2024-01-31');

      expect(result).toHaveLength(1);
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/services/date-range?startDate=2024-01-01&endDate=2024-01-31');
    });
  });

  describe('forceVerifyAllServices', () => {
    it('should force verify all services', async () => {
      const mockServices = [
        {
          id: '1',
          vehicleId: 'v1',
          type: 'maintenance',
        },
      ];

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockServices });

      const result = await BlockchainService.forceVerifyAllServices();

      expect(result).toHaveLength(1);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/verify');
    });
  });

  describe('registerAllExistingHashes', () => {
    it('should register all existing hashes', async () => {
      const mockResponse = {
        success: true,
        message: 'Hashes registrados',
        successCount: 10,
        errorCount: 0,
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.registerAllExistingHashes();

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(10);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/register-hashes');
    });
  });

  describe('fixInvalidHashes', () => {
    it('should fix invalid hashes', async () => {
      const mockResponse = {
        success: true,
        message: 'Hashes corrigidos',
        successCount: 5,
        errorCount: 0,
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.fixInvalidHashes();

      expect(result.success).toBe(true);
      expect(result.successCount).toBe(5);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/fix-invalid-hashes');
    });
  });

  describe('cleanOrphanHashes', () => {
    it('should clean orphan hashes', async () => {
      const mockResponse = {
        success: true,
        message: 'Hashes limpos',
        orphanCount: 3,
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.cleanOrphanHashes();

      expect(result.success).toBe(true);
      expect(result.orphanCount).toBe(3);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/clean-orphan-hashes');
    });
  });

  describe('fixIncorrectDates', () => {
    it('should fix incorrect dates', async () => {
      const mockResponse = {
        success: true,
        message: 'Datas corrigidas',
        correctedCount: 8,
        totalProcessed: 10,
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.fixIncorrectDates();

      expect(result.success).toBe(true);
      expect(result.correctedCount).toBe(8);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/services/fix-dates');
    });
  });

  describe('registerHash', () => {
    it('should register hash', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0xabc',
        status: 'CONFIRMED' as const,
        serviceId: '1',
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.registerHash('0xhash123', 'v1', 'maintenance');

      expect(result.success).toBe(true);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/besu/hash/register', {
        hash: '0xhash123',
        vehicleId: 'v1',
        eventType: 'maintenance',
      });
    });
  });

  describe('verifyAndCount', () => {
    it('should verify and count hash', async () => {
      const mockResponse = {
        success: true,
        transactionHash: '0xdef',
        status: 'CONFIRMED' as const,
        serviceId: '1',
      };

      (apiBase.api.post as jest.Mock).mockResolvedValue({ data: mockResponse });

      const result = await BlockchainService.verifyAndCount('0xhash456');

      expect(result.success).toBe(true);
      expect(apiBase.api.post).toHaveBeenCalledWith('/blockchain/besu/hash/verify/0xhash456');
    });
  });

  describe('getVehicleHashes', () => {
    it('should return vehicle hashes', async () => {
      const mockHashes = ['0xhash1', '0xhash2', '0xhash3'];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockHashes });

      const result = await BlockchainService.getVehicleHashes('v1');

      expect(result).toHaveLength(3);
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/vehicle/v1/hashes');
    });
  });

  describe('getOwnerHashes', () => {
    it('should return owner hashes', async () => {
      const mockHashes = ['0xhash1', '0xhash2'];

      (apiBase.api.get as jest.Mock).mockResolvedValue({ data: mockHashes });

      const result = await BlockchainService.getOwnerHashes('0xowner123');

      expect(result).toHaveLength(2);
      expect(apiBase.api.get).toHaveBeenCalledWith('/blockchain/besu/owner/0xowner123/hashes');
    });
  });
});
