import { apiBase } from './api';

export interface BlockchainTransaction {
  hash: string;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockNumber?: number;
  gasUsed?: string;
  timestamp?: number;
}

export interface ServiceSubmissionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED';
  serviceId?: string;
  message?: string;
}

export interface BlockchainService {
  id: string;
  vehicleId: string;
  type: string;
  category: string;
  description: string;
  serviceDate: string;
  mileage: number;
  cost: number;
  location: string;
  technician: string;
  warranty: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface NetworkHealth {
  status: string;
  blockNumber?: number;
  gasPrice?: string;
  network?: string;
  peers?: number;
  totalServices?: number;
}

export interface BesuNetworkInfo {
  chainId: number;
  blockNumber: number;
  gasPrice: string;
  networkName: string;
}

export interface BesuContractStats {
  totalHashes: number;
  contractBalance: string;
}

export interface BesuHashInfo {
  exists: boolean;
  info?: {
    owner: string;
    timestamp: number;
    vehicleId: string;
    eventType: string;
    verificationCount: number;
  };
}

export interface BesuConnectionStatus {
  connected: boolean;
}

export class BlockchainService {
  private static readonly BASE_PATH = '/blockchain';

  // Submeter serviço para blockchain
  static async submitService(serviceData: {
    serviceId: string;
    vehicleId: string;
    mileage: number;
    cost: number;
    description: string;
    location?: string;
    type?: string;
  }): Promise<ServiceSubmissionResult> {
    const response = await apiBase.api.post<ServiceSubmissionResult>(
      `${this.BASE_PATH}/services/submit`,
      serviceData
    );
    return response.data;
  }

  // Confirmar serviço
  static async confirmService(serviceId: string): Promise<ServiceSubmissionResult> {
    const response = await apiBase.api.post<ServiceSubmissionResult>(
      `${this.BASE_PATH}/services/${serviceId}/confirm`
    );
    return response.data;
  }

  // Obter status de um serviço
  static async getServiceStatus(serviceId: string): Promise<BlockchainTransaction> {
    const response = await apiBase.api.get<BlockchainTransaction>(
      `${this.BASE_PATH}/services/${serviceId}/status`
    );
    return response.data;
  }

  // Obter todos os serviços
  static async getAllServices(): Promise<BlockchainService[]> {
    const response = await apiBase.api.get<BlockchainService[]>(
      `${this.BASE_PATH}/services`
    );
    return response.data;
  }

  // Forçar verificação de todos os serviços
  static async forceVerifyAllServices(): Promise<BlockchainService[]> {
    const response = await apiBase.api.post<BlockchainService[]>(
      `${this.BASE_PATH}/services/verify`
    );
    return response.data;
  }

  // Registrar todos os hashes existentes no contrato
  static async registerAllExistingHashes(): Promise<{ success: boolean; message: string; successCount: number; errorCount: number }> {
    const response = await apiBase.api.post<{ success: boolean; message: string; successCount: number; errorCount: number }>(
      `${this.BASE_PATH}/services/register-hashes`
    );
    return response.data;
  }

  // Corrigir hashes inválidos (pending-hash)
  static async fixInvalidHashes(): Promise<{ success: boolean; message: string; successCount: number; errorCount: number }> {
    const response = await apiBase.api.post<{ success: boolean; message: string; successCount: number; errorCount: number }>(
      `${this.BASE_PATH}/services/fix-invalid-hashes`
    );
    return response.data;
  }

  // Limpar hashes órfãos do contrato
  static async cleanOrphanHashes(): Promise<{ success: boolean; message: string; orphanCount: number }> {
    const response = await apiBase.api.post<{ success: boolean; message: string; orphanCount: number }>(
      `${this.BASE_PATH}/services/clean-orphan-hashes`
    );
    return response.data;
  }

  // Obter saúde da rede
  static async getNetworkHealth(): Promise<NetworkHealth> {
    const response = await apiBase.api.get<NetworkHealth>(
      `${this.BASE_PATH}/network/health`
    );
    return response.data;
  }

  // Obter serviços por veículo
  static async getServicesByVehicle(vehicleId: string): Promise<BlockchainService[]> {
    const response = await apiBase.api.get<BlockchainService[]>(
      `${this.BASE_PATH}/services/vehicle/${vehicleId}`
    );
    return response.data;
  }

  // Obter serviços por tipo
  static async getServicesByType(type: string): Promise<BlockchainService[]> {
    const response = await apiBase.api.get<BlockchainService[]>(
      `${this.BASE_PATH}/services/type/${type}`
    );
    return response.data;
  }

  // Obter serviços por intervalo de data
  static async getServicesByDateRange(startDate: string, endDate: string): Promise<BlockchainService[]> {
    const response = await apiBase.api.get<BlockchainService[]>(
      `${this.BASE_PATH}/services/date-range?startDate=${startDate}&endDate=${endDate}`
    );
    return response.data;
  }

  // ========== ENDPOINTS ESPECÍFICOS BESU ==========

  // Verificar status de conexão com Besu
  static async getBesuConnectionStatus(): Promise<BesuConnectionStatus> {
    const response = await apiBase.api.get<BesuConnectionStatus>(
      `${this.BASE_PATH}/besu/connection/status`
    );
    return response.data;
  }

  // Obter informações da rede Besu
  static async getBesuNetworkInfo(): Promise<BesuNetworkInfo> {
    const response = await apiBase.api.get<BesuNetworkInfo>(
      `${this.BASE_PATH}/besu/network/info`
    );
    return response.data;
  }

  // Obter estatísticas do contrato
  static async getBesuContractStats(): Promise<BesuContractStats> {
    const response = await apiBase.api.get<BesuContractStats>(
      `${this.BASE_PATH}/besu/contract/stats`
    );
    return response.data;
  }

  // Registrar hash na blockchain Besu
  static async registerHash(hash: string, vehicleId: string, eventType: string): Promise<ServiceSubmissionResult> {
    const response = await apiBase.api.post<ServiceSubmissionResult>(
      `${this.BASE_PATH}/besu/hash/register`,
      { hash, vehicleId, eventType }
    );
    return response.data;
  }

  // Verificar hash na blockchain Besu
  static async verifyHash(hash: string): Promise<BesuHashInfo> {
    const response = await apiBase.api.get<BesuHashInfo>(
      `${this.BASE_PATH}/besu/hash/verify/${hash}`
    );
    return response.data;
  }

  // Verificar e contar hash
  static async verifyAndCount(hash: string): Promise<ServiceSubmissionResult> {
    const response = await apiBase.api.post<ServiceSubmissionResult>(
      `${this.BASE_PATH}/besu/hash/verify/${hash}`
    );
    return response.data;
  }

  // Obter hashes de um veículo
  static async getVehicleHashes(vehicleId: string): Promise<string[]> {
    const response = await apiBase.api.get<string[]>(
      `${this.BASE_PATH}/besu/vehicle/${vehicleId}/hashes`
    );
    return response.data;
  }

  // Obter hashes de um proprietário
  static async getOwnerHashes(address: string): Promise<string[]> {
    const response = await apiBase.api.get<string[]>(
      `${this.BASE_PATH}/besu/owner/${address}/hashes`
    );
    return response.data;
  }
}
