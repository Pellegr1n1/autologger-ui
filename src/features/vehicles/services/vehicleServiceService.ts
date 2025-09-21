import { apiBase } from '../../../shared/services/api';
import { VehicleEvent } from '../types/vehicle.types';

export interface CreateVehicleServiceData {
  vehicleId: string;
  type: string;
  category: string;
  description: string;
  serviceDate: Date;
  mileage: number;
  cost: number;
  location: string;
  attachments?: string[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export interface UpdateVehicleServiceData {
  type?: string;
  category?: string;
  description?: string;
  serviceDate?: Date;
  mileage?: number;
  cost?: number;
  location?: string;
  attachments?: string[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export class VehicleServiceService {
  private static readonly BASE_PATH = '/vehicle-services';

  /**
   * Criar novo serviço de veículo
   */
  static async createService(data: CreateVehicleServiceData): Promise<VehicleEvent> {
    const response = await apiBase.api.post<VehicleEvent>(this.BASE_PATH, data);
    return response.data;
  }

  /**
   * Buscar todos os serviços
   */
  static async getAllServices(): Promise<VehicleEvent[]> {
    const response = await apiBase.api.get<any[]>(this.BASE_PATH);
    
    // Mapear os dados da API para o formato esperado pelo frontend
    return response.data.map(service => ({
      id: service.id,
      vehicleId: service.vehicleId,
      type: service.type,
      category: service.category,
      description: service.description,
      date: new Date(service.serviceDate), // Mapear serviceDate para date
      mileage: service.mileage,
      cost: service.cost,
      location: service.location,
      attachments: service.attachments || [],
      technician: service.technician,
      warranty: service.warranty,
      nextServiceDate: service.nextServiceDate ? new Date(service.nextServiceDate) : undefined,
      notes: service.notes,
      createdAt: new Date(service.createdAt),
      updatedAt: new Date(service.updatedAt),
      blockchainStatus: {
        status: service.blockchainConfirmedAt ? 'CONFIRMED' : 'PENDING',
        message: service.blockchainConfirmedAt ? 'Transação confirmada na blockchain' : 'Aguardando confirmação',
        lastUpdate: service.blockchainConfirmedAt ? new Date(service.blockchainConfirmedAt) : new Date(service.createdAt),
        retryCount: 0,
        maxRetries: 3
      },
      hash: service.blockchainHash,
      previousHash: service.previousHash,
      merkleRoot: service.merkleRoot,
      isImmutable: service.isImmutable,
      canEdit: service.canEdit,
      requiresConfirmation: false,
      confirmedBy: service.confirmedBy,
      confirmedAt: service.blockchainConfirmedAt ? new Date(service.blockchainConfirmedAt) : undefined
    }));
  }

  /**
   * Buscar serviços por veículo
   */
  static async getServicesByVehicle(vehicleId: string): Promise<VehicleEvent[]> {
    const response = await apiBase.api.get<any[]>(`${this.BASE_PATH}/vehicle/${vehicleId}`);
    
    // Mapear os dados da API para o formato esperado pelo frontend
    return response.data.map(service => ({
      id: service.id,
      vehicleId: service.vehicleId,
      type: service.type,
      category: service.category,
      description: service.description,
      date: new Date(service.serviceDate), // Mapear serviceDate para date
      mileage: service.mileage,
      cost: service.cost,
      location: service.location,
      attachments: service.attachments || [],
      technician: service.technician,
      warranty: service.warranty,
      nextServiceDate: service.nextServiceDate ? new Date(service.nextServiceDate) : undefined,
      notes: service.notes,
      createdAt: new Date(service.createdAt),
      updatedAt: new Date(service.updatedAt),
      blockchainStatus: {
        status: service.blockchainConfirmedAt ? 'CONFIRMED' : 'PENDING',
        message: service.blockchainConfirmedAt ? 'Transação confirmada na blockchain' : 'Aguardando confirmação',
        lastUpdate: service.blockchainConfirmedAt ? new Date(service.blockchainConfirmedAt) : new Date(service.createdAt),
        retryCount: 0,
        maxRetries: 3
      },
      hash: service.blockchainHash,
      previousHash: service.previousHash,
      merkleRoot: service.merkleRoot,
      isImmutable: service.isImmutable,
      canEdit: service.canEdit,
      requiresConfirmation: false,
      confirmedBy: service.confirmedBy,
      confirmedAt: service.blockchainConfirmedAt ? new Date(service.blockchainConfirmedAt) : undefined
    }));
  }

  /**
   * Buscar serviço por ID
   */
  static async getServiceById(id: string): Promise<VehicleEvent> {
    const response = await apiBase.api.get<VehicleEvent>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Atualizar serviço
   */
  static async updateService(id: string, data: UpdateVehicleServiceData): Promise<VehicleEvent> {
    const response = await apiBase.api.patch<VehicleEvent>(`${this.BASE_PATH}/${id}`, data);
    return response.data;
  }

  /**
   * Excluir serviço
   */
  static async deleteService(id: string): Promise<void> {
    await apiBase.api.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Atualizar status blockchain
   */
  static async updateBlockchainStatus(
    id: string,
    hash: string | undefined,
    confirmedBy: string
  ): Promise<VehicleEvent> {
    const response = await apiBase.api.patch<VehicleEvent>(`${this.BASE_PATH}/${id}/blockchain-status`, {
      hash,
      confirmedBy
    });
    return response.data;
  }

  /**
   * Buscar serviços por tipo
   */
  static async getServicesByType(type: string): Promise<VehicleEvent[]> {
    const response = await apiBase.api.get<VehicleEvent[]>(`${this.BASE_PATH}/type/${type}`);
    return response.data;
  }

  /**
   * Buscar serviços por status
   */
  static async getServicesByStatus(status: string): Promise<VehicleEvent[]> {
    const response = await apiBase.api.get<VehicleEvent[]>(`${this.BASE_PATH}/status/${status}`);
    return response.data;
  }

  /**
   * Buscar serviços por intervalo de data
   */
  static async getServicesByDateRange(startDate: Date, endDate: Date): Promise<VehicleEvent[]> {
    const response = await apiBase.api.get<VehicleEvent[]>(`${this.BASE_PATH}/date-range`, {
      params: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      }
    });
    return response.data;
  }

  /**
   * Obter custo total por veículo
   */
  static async getTotalCostByVehicle(vehicleId: string): Promise<number> {
    const response = await apiBase.api.get<{ total: number }>(`${this.BASE_PATH}/vehicle/${vehicleId}/total-cost`);
    return response.data.total;
  }

  /**
   * Obter quantidade de serviços por veículo
   */
  static async getServicesCountByVehicle(vehicleId: string): Promise<number> {
    const response = await apiBase.api.get<{ count: number }>(`${this.BASE_PATH}/vehicle/${vehicleId}/count`);
    return response.data.count;
  }
}
