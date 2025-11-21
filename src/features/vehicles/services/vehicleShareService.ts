import { apiBase } from '../../../shared/services/api';

export interface VehicleShareResponse {
  shareToken: string;
  shareUrl: string;
  expiresAt: string;
  isActive: boolean;
}

export interface PublicVehicleInfo {
  id: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  mileage: number;
  status: string;
  createdAt: string;
  photoUrl?: string;
  maintenanceHistory: PublicMaintenanceInfo[];
}

export interface PublicMaintenanceInfo {
  type: string;
  category: string;
  description: string;
  serviceDate: string;
  mileage: number;
  cost: number;
  location: string;
  technician?: string;
  warranty: boolean;
  nextServiceDate?: string;
  notes?: string;
  blockchainStatus: string;
  blockchainHash?: string;
  createdAt: string;
  attachments?: PublicAttachment[];
}

export interface PublicAttachment {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
}

export class VehicleShareService {
  private static readonly BASE_PATH = '/vehicles';

  /**
   * Gerar link de compartilhamento para um veículo
   */
  static async generateShareLink(vehicleId: string, expiresInDays?: number, includeAttachments?: boolean): Promise<VehicleShareResponse> {
    const params = new URLSearchParams();
    if (expiresInDays) {
      params.append('expiresInDays', expiresInDays.toString());
    }
    if (includeAttachments !== undefined) {
      params.append('includeAttachments', includeAttachments.toString());
    }
    const queryString = params.toString();
    const queryParam = queryString ? `?${queryString}` : '';
    const shareLinkPath = '/generate-share-link';
    const url = `${this.BASE_PATH}/${vehicleId}${shareLinkPath}${queryParam}`;
    const response = await apiBase.api.post<VehicleShareResponse>(url);
    return response.data;
  }

  /**
   * Buscar informações públicas do veículo pelo token
   */
  static async getPublicVehicleInfo(shareToken: string): Promise<PublicVehicleInfo> {
    const response = await apiBase.api.get<PublicVehicleInfo>(`${this.BASE_PATH}/share/${shareToken}`);
    return response.data;
  }

  /**
   * Desativar link de compartilhamento
   */
  static async deactivateShareLink(shareToken: string): Promise<void> {
    await apiBase.api.delete(`${this.BASE_PATH}/share/${shareToken}`);
  }

  /**
   * Listar links de compartilhamento do usuário
   */
  static async getMyShareLinks(): Promise<VehicleShareResponse[]> {
    const response = await apiBase.api.get<VehicleShareResponse[]>(`${this.BASE_PATH}/my-shares`);
    return response.data;
  }
}
