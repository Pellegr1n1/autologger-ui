export enum VehicleStatus {
  ACTIVE = 'active',
  SOLD = 'sold'
}

export interface Vehicle {
  id: string;
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  renavam: string;
  mileage: number;
  status: VehicleStatus;
  soldAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateVehicleData {
  plate: string;
  brand: string;
  model: string;
  year: number;
  color: string;
  renavam: string;
  mileage?: number;
}

export interface UpdateVehicleData {
  brand?: string;
  model?: string;
  year?: number;
  color?: string;
  mileage?: number;
}

export interface MarkVehicleSoldData {
  soldAt?: string;
}

export interface VehicleStats {
  count: number;
  limit: number;
  canAddMore: boolean;
}

export interface UserVehicles {
  active: Vehicle[];
  sold: Vehicle[];
}

export interface VehicleFormData {
  plate: string;
  brand: string;
  model: string;
  year: string;
  color: string;
  renavam: string;
  mileage: string;
}

export interface VehicleFormErrors {
  plate?: string;
  brand?: string;
  model?: string;
  year?: string;
  color?: string;
  renavam?: string;
  mileage?: string;
}

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  type: 'maintenance' | 'repair' | 'inspection' | 'fuel' | 'other';
  description: string;
  cost: number;
  date: Date;
  mileage: number;
  location?: string;
  attachments?: string[];
  blockchainHash?: string;
  isConfirmed: boolean;
  createdAt: Date;
  updatedAt: Date;
}