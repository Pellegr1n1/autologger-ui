export enum VehicleStatus {
  ACTIVE = "active",
  SOLD = "sold",
}

export enum VehicleEventType {
  MAINTENANCE = "maintenance",
  EXPENSE = "expense",
  FUEL = "fuel",
  REPAIR = "repair",
  INSPECTION = "inspection",
  OTHER = "other",
}

export interface ChainStatus {
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REVERTED';
  message?: string;
  lastUpdate: Date;
  retryCount: number;
  maxRetries: number;
}

export interface Vehicle {
  id: string
  plate: string
  brand: string
  model: string
  year: number
  color: string
  mileage: number
  status: VehicleStatus
  soldAt?: Date
  createdAt: Date
  updatedAt: Date
  imageUrl?: string
  photoUrl?: string
}

export interface VehicleEvent {
  id: string;
  vehicleId: string;
  type: VehicleEventType;
  category: string;
  description: string;
  date: Date;
  mileage: number;
  cost: number;
  location: string;
  attachments: string[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  blockchainStatus: ChainStatus;
  hash?: string;
  previousHash?: string;
  merkleRoot?: string;
  isImmutable: boolean;
  canEdit: boolean;
  requiresConfirmation: boolean;
  confirmedBy?: string;
  confirmedAt?: Date;
  confirmationHash?: string;
}

export interface VehicleDocument {
  id: string
  vehicleId: string
  name: string
  type: string
  uploadedAt: string
  size: number
  url?: string
}

export interface CreateVehicleData extends Record<string, unknown> {
  plate: string
  brand: string
  model: string
  year: number
  color: string
  mileage?: number
  photo?: File
}

export interface UpdateVehicleData extends Record<string, unknown> {
  brand?: string
  model?: string
  year?: number
  color?: string
  mileage?: number
  photo?: File
}

export interface MarkVehicleSoldData {
  soldAt?: string
}

export interface VehicleFormData {
  plate: string
  brand: string
  model: string
  year: string
  color: string
  mileage: string
  photo?: File
}

export interface VehicleFormErrors {
  plate?: string
  brand?: string
  model?: string
  year?: string
  color?: string
  mileage?: string
}

export interface CreateVehicleEventData {
  type: VehicleEventType;
  category: string;
  description: string;
  date: Date;
  mileage: number;
  cost: number;
  location: string;
  attachments: File[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export interface UpdateVehicleEventData {
  type?: VehicleEventType;
  category?: string;
  description?: string;
  date?: Date;
  mileage?: number;
  cost?: number;
  location?: string;
  attachments?: File[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export interface VehicleEventFormData {
  type: VehicleEventType;
  category: string;
  description: string;
  date: Date;
  mileage: number;
  cost: number;
  location: string;
  attachments: File[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export interface VehicleStats {
  count: number
  limit: number
  canAddMore: boolean
}

export interface UserVehicles {
  active: Vehicle[]
  sold: Vehicle[]
}

export interface ServiceFormProps {
  vehicleId?: string
  onAdd?: (event: VehicleEvent) => void
}
