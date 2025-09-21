// Blockchain Types
export interface ServiceSubmissionResult {
  success: boolean;
  hash?: string;
  message?: string;
  transactionId?: string;
  blockNumber?: number;
}

export interface NetworkHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  latency: number;
  blockHeight: number;
  connectedPeers: number;
  lastUpdate: string;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'confirmed' | 'failed';
  blockNumber?: number;
  gasUsed?: string;
  timestamp: string;
}

export interface BlockchainConfig {
  networkId: string;
  rpcUrl: string;
  contractAddress: string;
  gasLimit: number;
  gasPrice: string;
}
