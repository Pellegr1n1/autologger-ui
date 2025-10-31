import { apiBase } from '../../../shared/services/api';
import {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  MarkVehicleSoldData,
  VehicleStats,
  UserVehicles
} from '../types/vehicle.types';

export class VehicleService {
  private static readonly BASE_PATH = '/vehicles';

  /**
   * Criar novo veículo
   */
  static async createVehicle(data: CreateVehicleData): Promise<Vehicle> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== 'photo' && data[key as keyof CreateVehicleData] !== undefined) {
        const value = data[key as keyof CreateVehicleData];
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });
    
    // Adicionar foto se existir
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiBase.api.post<Vehicle>(this.BASE_PATH, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Buscar todos os veículos do usuário
   */
  static async getUserVehicles(): Promise<UserVehicles> {
    const response = await apiBase.api.get<UserVehicles>(this.BASE_PATH);
    return response.data;
  }

  /**
   * Buscar veículo por ID
   */
  static async getVehicleById(id: string): Promise<Vehicle> {
    const response = await apiBase.api.get<Vehicle>(`${this.BASE_PATH}/${id}`);
    return response.data;
  }

  /**
   * Atualizar dados do veículo
   */
  static async updateVehicle(id: string, data: UpdateVehicleData): Promise<Vehicle> {
    const formData = new FormData();
    
    Object.keys(data).forEach(key => {
      if (key !== 'photo' && data[key as keyof UpdateVehicleData] !== undefined) {
        const value = data[key as keyof UpdateVehicleData];
        if (value !== undefined) {
          formData.append(key, value.toString());
        }
      }
    });
    
    if (data.photo) {
      formData.append('photo', data.photo);
    }

    const response = await apiBase.api.put<Vehicle>(`${this.BASE_PATH}/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  /**
   * Marcar veículo como vendido
   */
  static async markVehicleAsSold(id: string, data?: MarkVehicleSoldData): Promise<Vehicle> {
    const response = await apiBase.api.patch<Vehicle>(`${this.BASE_PATH}/${id}/mark-sold`, data || {});
    return response.data;
  }

  /**
   * Buscar estatísticas de veículos ativos
   */
  static async getActiveVehiclesStats(): Promise<VehicleStats> {
    const response = await apiBase.api.get<VehicleStats>(`${this.BASE_PATH}/stats/active-count`);
    return response.data;
  }

  /**
   * Excluir veículo
   */
  static async deleteVehicle(id: string): Promise<void> {
    await apiBase.api.delete(`${this.BASE_PATH}/${id}`);
  }

  /**
   * Validar placa brasileira
   */
  static validatePlate(plate: string): boolean {
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    return oldFormat.test(cleanPlate) || mercosulFormat.test(cleanPlate);
  }

  /**
   * Validar RENAVAM
   */
  static validateRenavam(renavam: string): boolean {
    const cleanRenavam = renavam.replace(/\D/g, '');
    return cleanRenavam.length === 11;
  }

  /**
   * Formatar placa para exibição
   */
  static formatPlate(plate: string): string {
    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanPlate.length === 7) {
      return cleanPlate.replace(/^([A-Z]{3})([0-9A-Z]{4})$/, '$1-$2');
    }

    return cleanPlate;
  }

  /**
   * Formatar RENAVAM para exibição
   */
  static formatRenavam(renavam: string): string {
    const cleanRenavam = renavam.replace(/\D/g, '');

    if (cleanRenavam.length === 11) {
      return cleanRenavam.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');
    }

    return cleanRenavam;
  }

  /**
   * Gerar resumo do veículo
   */
  static getVehicleSummary(vehicle: Vehicle): string {
    return `${vehicle.brand} ${vehicle.model} ${vehicle.year} - ${this.formatPlate(vehicle.plate)}`;
  }

  /**
   * Verificar se pode adicionar mais veículos
   */
  static async canAddMoreVehicles(): Promise<boolean> {
    const stats = await this.getActiveVehiclesStats();
    return stats.canAddMore;
  }

  /**
   * Calcular idade do veículo
   */
  static getVehicleAge(year: number): number {
    return new Date().getFullYear() - year;
  }

  /**
   * Formatar quilometragem
   */
  static formatMileage(mileage: number): string {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
  }

  /**
   * Verificar se o veículo está ativo
   */
  static isActive(vehicle: Vehicle): boolean {
    return vehicle.status === 'active';
  }

  /**
   * Verificar se o veículo foi vendido
   */
  static isSold(vehicle: Vehicle): boolean {
    return vehicle.status === 'sold';
  }
}