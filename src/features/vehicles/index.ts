// Vehicle Components
export { default as VehicleModal } from './components/VehicleModal';
export { default as ServiceModal } from './components/ServiceModal';
export { default as BlockchainConfirmationModal } from './components/BlockchainConfirmationModal';

// Vehicle Hooks
export * from './hooks/useVehicles';
export * from './hooks/useVehicleDetails';
export * from './hooks/useMockVehicle';

// Vehicle Types
export * from './types/vehicle.types';
export * from './types/vehicleDetails.types';
export * from './types/fipe.types';

// Blockchain Types (explicitly re-export to avoid conflicts)
export type { 
  ServiceSubmissionResult, 
  BlockchainHealth, 
  BlockchainConfig,
  ChainStatus
} from './types/blockchain.types';

// Vehicle Utils
export * from './utils/tableColumns';
export * from './utils/menuUtils';
export * from './utils/chartConfigs';
export * from './utils/helpers';
export * from './utils/constants';

// Vehicle Services
export * from './services/vehicleService';
export * from './services/vehicleServiceService';
export * from './services/fipeService';
