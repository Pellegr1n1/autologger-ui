import { VehicleEventType } from './vehicle.types';

// Tipos para Blockchain e Serviços
export interface BlockchainTransaction {
  id: string;
  txId: string;
  blockNumber: number;
  timestamp: Date;
  status: TransactionStatus;
  confirmations: number;
  gasUsed?: number;
  gasPrice?: string;
  network: BlockchainNetwork;
}

export interface BlockchainService {
  id: string;
  serviceId: string;
  vehicleId: string;
  hash: string;
  previousHash?: string;
  merkleRoot: string;
  timestamp: Date;
  status: ChainStatus;
  transaction?: BlockchainTransaction;
  metadata: ServiceMetadata;
}

export interface ServiceMetadata {
  type: VehicleEventType;
  category: string;
  description: string;
  cost: number;
  location: string;
  mileage: number;
  date: Date;
  attachments: string[];
  technician?: string;
  warranty?: boolean;
  nextServiceDate?: Date;
  notes?: string;
}

export interface ChainStatus {
  status: 'PENDING' | 'SUBMITTED' | 'CONFIRMED' | 'FAILED' | 'REVERTED';
  message?: string;
  lastUpdate: Date;
  retryCount: number;
  maxRetries: number;
}

export interface BlockchainNetwork {
  name: 'hyperledger-fabric' | 'ethereum' | 'polygon';
  chainId: string;
  endpoint: string;
  explorer?: string;
}

export type TransactionStatus = 
  | 'PENDING' 
  | 'SUBMITTED' 
  | 'CONFIRMED' 
  | 'FAILED' 
  | 'REVERTED';

export interface BlockchainConfig {
  network: BlockchainNetwork;
  channel: string;
  chaincode: string;
  organization: string;
  mspId: string;
  adminCert: string;
  adminKey: string;
  peerEndpoints: string[];
  ordererEndpoint: string;
}

export interface ServiceSubmissionResult {
  success: boolean;
  serviceId: string;
  hash: string;
  transactionId?: string;
  error?: string;
  estimatedConfirmationTime?: number;
}

export interface BlockchainHealth {
  network: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN';
  lastBlock: number;
  peers: number;
  latency: number;
  lastUpdate: Date;
}
