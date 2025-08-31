import { apiBase } from './api';
import type { 
  BlockchainService as BlockchainServiceType,
  ServiceMetadata,
  ChainStatus,
  BlockchainNetwork,
  TransactionStatus,
  BlockchainConfig,
  ServiceSubmissionResult,
  BlockchainHealth
} from '../../features/vehicles/types/blockchain.types';

export class BlockchainService {
  static async getNetworkHealth(): Promise<BlockchainHealth> {
    try {
      const response = await apiBase.api.get('/blockchain/network/health');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter saúde da rede:', error);
      return {
        network: 'Unknown',
        status: 'DOWN',
        lastBlock: 0,
        peers: 0,
        latency: 0,
        lastUpdate: new Date()
      };
    }
  }

  static async getNetworkConfig(): Promise<BlockchainConfig> {
    try {
      const response = await apiBase.api.get('/blockchain/network/config');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter configuração da rede:', error);
      return {
        network: {
          name: 'ethereum',
          chainId: '11155111',
          endpoint: 'https://sepolia.infura.io'
        },
        channel: 'main',
        chaincode: 'vehicleservice',
        organization: 'org1',
        mspId: 'Org1MSP',
        adminCert: '',
        adminKey: '',
        peerEndpoints: ['localhost:7051'],
        ordererEndpoint: 'localhost:7050'
      };
    }
  }

  static async submitServiceToBlockchain(serviceData: {
    type: string;
    category: string;
    description: string;
    cost: number;
    location: string;
    mileage: number;
    date: Date;
    attachments?: string[];
  }): Promise<ServiceSubmissionResult> {
    try {
      const serviceId = `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const response = await apiBase.api.post('/blockchain/services/submit', {
        serviceId,
        vehicleId: 'unknown',
        mileage: serviceData.mileage,
        cost: serviceData.cost,
        description: serviceData.description,
        location: serviceData.location,
        type: serviceData.type
      });

      return response.data;
    } catch (error: any) {
      console.error('Erro ao submeter serviço para blockchain:', error);
      return {
        success: false,
        serviceId: `service-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        hash: '0x0',
        error: error.response?.data?.message || 'Erro ao submeter para blockchain'
      };
    }
  }

  static async confirmService(serviceId: string): Promise<ServiceSubmissionResult> {
    try {
      const response = await apiBase.api.post(`/blockchain/services/${serviceId}/confirm`);
      return response.data;
    } catch (error: any) {
      console.error('Erro ao confirmar serviço:', error);
      return {
        success: false,
        serviceId,
        hash: '0x0',
        error: error.response?.data?.message || 'Erro ao confirmar serviço'
      };
    }
  }

  static async getServiceStatus(serviceId: string): Promise<TransactionStatus> {
    try {
      const response = await apiBase.api.get(`/blockchain/services/${serviceId}/status`);
      return response.data.status;
    } catch (error) {
      console.error('Erro ao obter status do serviço:', error);
      return 'FAILED';
    }
  }

  static async getVehicleTransactionHistory(vehicleId: string): Promise<TransactionStatus[]> {
    try {
      // Esta funcionalidade precisaria ser implementada no backend
      const response = await apiBase.api.get(`/blockchain/vehicles/${vehicleId}/transactions`);
      return response.data;
    } catch (error) {
      console.error('Erro ao obter histórico de transações:', error);
      return [];
    }
  }

  static async canEditService(serviceId: string): Promise<boolean> {
    try {
      const status = await this.getServiceStatus(serviceId);
      return status === 'PENDING';
    } catch (error) {
      console.error('Erro ao verificar se pode editar:', error);
      return false;
    }
  }

  static async getImmutabilityProof(serviceId: string): Promise<string> {
    try {
      const status = await this.getServiceStatus(serviceId);
      if (status === 'CONFIRMED') {
        return `Service ${serviceId} confirmed on blockchain`;
      }
      return 'Service not yet confirmed';
    } catch (error) {
      console.error('Erro ao obter prova de imutabilidade:', error);
      return 'Unable to verify immutability';
    }
  }

  static async revertTransaction(serviceId: string): Promise<boolean> {
    try {
      // Esta funcionalidade precisaria ser implementada no backend
      const response = await apiBase.api.post(`/blockchain/services/${serviceId}/revert`);
      return response.data.success;
    } catch (error) {
      console.error('Erro ao reverter transação:', error);
      return false;
    }
  }

  static async getNetworkStats(): Promise<{
    totalTransactions: number;
    averageBlockTime: number;
    activeNodes: number;
  }> {
    try {
      const response = await apiBase.api.get('/blockchain/network/stats');
      return response.data;
    } catch (error) {
      console.error('Erro ao obter estatísticas da rede:', error);
      return {
        totalTransactions: 0,
        averageBlockTime: 0,
        activeNodes: 0
      };
    }
  }

  static async simulateTransaction(serviceData: ServiceMetadata): Promise<{
    estimatedGas: string;
    estimatedCost: string;
    success: boolean;
  }> {
    try {
      const response = await apiBase.api.post('/blockchain/transactions/simulate', serviceData);
      return response.data;
    } catch (error) {
      console.error('Erro ao simular transação:', error);
      return {
        estimatedGas: '0',
        estimatedCost: '0',
        success: false
      };
    }
  }
}
