/**
 * Utilitários para mapeamento de serviços
 * Reduz duplicação de código ao mapear serviços do backend para frontend
 */

import { VehicleEvent } from '../types/vehicle.types';
import { parseDate } from '../../../shared/utils/date';

/**
 * Mapeia status do backend para o formato do frontend
 * @param backendStatus - Status do backend
 * @returns Status do frontend
 */
export function mapBackendStatusToFrontend(
  backendStatus: string | undefined | null
): 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REVERTED' {
  const statusMap: Record<string, 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REVERTED'> = {
    'pending': 'PENDING',
    'confirmed': 'CONFIRMED',
    'rejected': 'FAILED',
    'expired': 'FAILED',
    'submitted': 'SUBMITTED',
    'reverted': 'REVERTED',
  };

  if (!backendStatus) {
    return 'PENDING';
  }

  return statusMap[backendStatus.toLowerCase()] || 'PENDING';
}

/**
 * Obtém mensagem descritiva do status
 * @param status - Status do serviço
 * @returns Mensagem descritiva
 */
export function getStatusMessage(status: string | undefined | null): string {
  const messages: Record<string, string> = {
    'pending': 'Aguardando confirmação na blockchain',
    'confirmed': 'Transação confirmada na blockchain',
    'rejected': 'Falha ao registrar na blockchain',
    'expired': 'Transação expirada',
    'submitted': 'Transação submetida',
    'reverted': 'Transação revertida',
  };

  if (!status) {
    return 'Status desconhecido';
  }

  return messages[status.toLowerCase()] || 'Status desconhecido';
}

/**
 * Mapeia um serviço do backend para o formato do frontend
 * @param service - Serviço do backend
 * @returns Serviço no formato do frontend
 */
export function mapServiceToFrontend(service: {
  id: string;
  vehicleId: string;
  type: string;
  category: string;
  description: string;
  serviceDate: string | Date;
  mileage: number;
  cost: number;
  location: string;
  attachments?: string[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: string | Date;
  notes?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  status: string;
  blockchainHash?: string;
  previousHash?: string;
  merkleRoot?: string;
  isImmutable?: boolean;
  canEdit?: boolean;
  confirmedBy?: string;
  blockchainConfirmedAt?: string | Date;
}): VehicleEvent {
  const lastUpdate = service.blockchainConfirmedAt
    ? parseDate(service.blockchainConfirmedAt)
    : parseDate(service.updatedAt || service.createdAt);

  return {
    id: service.id,
    vehicleId: service.vehicleId,
    type: service.type as any,
    category: service.category,
    description: service.description,
    date: parseDate(service.serviceDate),
    mileage: service.mileage,
    cost: service.cost,
    location: service.location,
    attachments: service.attachments || [],
    technician: service.technician,
    warranty: service.warranty,
    nextServiceDate: service.nextServiceDate ? parseDate(service.nextServiceDate) : undefined,
    notes: service.notes,
    createdAt: parseDate(service.createdAt),
    updatedAt: parseDate(service.updatedAt),
    blockchainStatus: {
      status: mapBackendStatusToFrontend(service.status),
      message: getStatusMessage(service.status),
      lastUpdate,
      retryCount: 0,
      maxRetries: 3,
    },
    hash: service.blockchainHash,
    previousHash: service.previousHash,
    merkleRoot: service.merkleRoot,
    isImmutable: service.isImmutable ?? false,
    canEdit: service.canEdit ?? true,
    requiresConfirmation: false,
    confirmedBy: service.confirmedBy,
    confirmedAt: service.blockchainConfirmedAt ? parseDate(service.blockchainConfirmedAt) : undefined,
  };
}

/**
 * Mapeia múltiplos serviços do backend para o formato do frontend
 * @param services - Array de serviços do backend
 * @returns Array de serviços no formato do frontend
 */
export function mapServicesToFrontend(
  services: Array<{
    id: string;
    vehicleId: string;
    type: string;
    category: string;
    description: string;
    serviceDate: string | Date;
    mileage: number;
    cost: number;
    location: string;
    attachments?: string[];
    technician?: string;
    warranty?: boolean;
    nextServiceDate?: string | Date;
    notes?: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    status: string;
    blockchainHash?: string;
    previousHash?: string;
    merkleRoot?: string;
    isImmutable?: boolean;
    canEdit?: boolean;
    confirmedBy?: string;
    blockchainConfirmedAt?: string | Date;
  }>
): VehicleEvent[] {
  return services.map(mapServiceToFrontend);
}

