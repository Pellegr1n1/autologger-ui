import { 
  getVehicleEventTypeLabel, 
  getChainStatusConfig,
  isValidFileType,
  formatFileSize,
  isValidVehicleEventType,
  isValidChainStatus,
  VEHICLE_CATEGORIES,
  VEHICLE_EVENT_TYPES,
  CHART_COLORS,
  CHART_GRADIENTS
} from '../../../../features/vehicles/utils/helpers';
import { VehicleEventType, ChainStatus } from '../../../../features/vehicles/types/vehicle.types';

describe('vehicle utils helpers', () => {
  describe('getVehicleEventTypeLabel', () => {
    it('deve retornar label correto para MAINTENANCE', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.MAINTENANCE)).toBe('Manutenção');
    });

    it('deve retornar label correto para EXPENSE', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.EXPENSE)).toBe('Despesa');
    });

    it('deve retornar label correto para FUEL', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.FUEL)).toBe('Abastecimento');
    });

    it('deve retornar label correto para REPAIR', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.REPAIR)).toBe('Reparo');
    });

    it('deve retornar label correto para INSPECTION', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.INSPECTION)).toBe('Inspeção');
    });

    it('deve retornar label correto para OTHER', () => {
      expect(getVehicleEventTypeLabel(VehicleEventType.OTHER)).toBe('Outros');
    });

    it('deve retornar "Desconhecido" para tipo inválido', () => {
      expect(getVehicleEventTypeLabel('INVALID' as VehicleEventType)).toBe('Desconhecido');
    });
  });

  describe('getChainStatusConfig', () => {
    it('deve retornar configuração padrão para status undefined', () => {
      const config = getChainStatusConfig(undefined);
      
      expect(config.label).toBe('Desconhecido');
      expect(config.color).toBe('default');
      expect(config.timelineColor).toBe('gray');
    });

    it('deve retornar configuração padrão para status inválido', () => {
      const config = getChainStatusConfig('INVALID' as ChainStatus);
      
      expect(config.label).toBe('Desconhecido');
      expect(config.color).toBe('default');
      expect(config.timelineColor).toBe('gray');
    });

    it('deve retornar objeto com estrutura correta', () => {
      const config = getChainStatusConfig(undefined);
      
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('timelineColor');
      expect(typeof config.label).toBe('string');
      expect(typeof config.color).toBe('string');
      expect(typeof config.timelineColor).toBe('string');
    });
  });

  describe('isValidFileType', () => {
    it('deve retornar true para arquivo PDF', () => {
      const file = new File([''], 'test.pdf', { type: 'application/pdf' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('deve retornar true para arquivo JPEG', () => {
      const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('deve retornar true para arquivo PNG', () => {
      const file = new File([''], 'test.png', { type: 'image/png' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('deve retornar true para arquivo WebP', () => {
      const file = new File([''], 'test.webp', { type: 'image/webp' });
      expect(isValidFileType(file)).toBe(true);
    });

    it('deve retornar false para tipo inválido', () => {
      const file = new File([''], 'test.txt', { type: 'text/plain' });
      expect(isValidFileType(file)).toBe(false);
    });
  });

  describe('formatFileSize', () => {
    it('deve formatar 0 bytes corretamente', () => {
      expect(formatFileSize(0)).toBe('0 Bytes');
    });

    it('deve formatar bytes corretamente', () => {
      expect(formatFileSize(500)).toBe('500 Bytes');
    });

    it('deve formatar KB corretamente', () => {
      expect(formatFileSize(1024)).toBe('1 KB');
      expect(formatFileSize(2048)).toBe('2 KB');
    });

    it('deve formatar MB corretamente', () => {
      expect(formatFileSize(1048576)).toBe('1 MB');
    });

    it('deve formatar GB corretamente', () => {
      expect(formatFileSize(1073741824)).toBe('1 GB');
    });
  });

  describe('isValidVehicleEventType', () => {
    it('deve retornar true para tipo válido', () => {
      expect(isValidVehicleEventType('maintenance')).toBe(true);
      expect(isValidVehicleEventType('expense')).toBe(true);
      expect(isValidVehicleEventType('fuel')).toBe(true);
    });

    it('deve retornar false para tipo inválido', () => {
      expect(isValidVehicleEventType('invalid')).toBe(false);
      expect(isValidVehicleEventType('')).toBe(false);
    });
  });

  describe('isValidChainStatus', () => {
    it('deve retornar true para status válido', () => {
      expect(isValidChainStatus('PENDING')).toBe(true);
      expect(isValidChainStatus('SUBMITTED')).toBe(true);
      expect(isValidChainStatus('CONFIRMED')).toBe(true);
      expect(isValidChainStatus('FAILED')).toBe(true);
      expect(isValidChainStatus('REVERTED')).toBe(true);
    });

    it('deve retornar false para status inválido', () => {
      expect(isValidChainStatus('INVALID')).toBe(false);
      expect(isValidChainStatus('')).toBe(false);
    });
  });

  describe('Constants', () => {
    it('deve exportar VEHICLE_CATEGORIES', () => {
      expect(VEHICLE_CATEGORIES).toBeDefined();
      expect(VEHICLE_CATEGORIES.length).toBeGreaterThan(0);
    });

    it('deve exportar VEHICLE_EVENT_TYPES', () => {
      expect(VEHICLE_EVENT_TYPES).toBeDefined();
      expect(VEHICLE_EVENT_TYPES.length).toBeGreaterThan(0);
    });

    it('deve exportar CHART_COLORS', () => {
      expect(CHART_COLORS).toBeDefined();
      expect(CHART_COLORS.primary).toBe('#1677ff');
    });

    it('deve exportar CHART_GRADIENTS', () => {
      expect(CHART_GRADIENTS).toBeDefined();
      expect(CHART_GRADIENTS.blue).toBeDefined();
      expect(Array.isArray(CHART_GRADIENTS.blue)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('deve lidar com valores null/undefined corretamente', () => {
      expect(getVehicleEventTypeLabel(null as any)).toBe('Desconhecido');
      expect(getVehicleEventTypeLabel(undefined as any)).toBe('Desconhecido');
    });

    it('deve retornar configuração consistente para status undefined', () => {
      const config = getChainStatusConfig(undefined);
      expect(config).toHaveProperty('label');
      expect(config).toHaveProperty('color');
      expect(config).toHaveProperty('timelineColor');
      expect(config.label).toBeTruthy();
      expect(config.color).toBeTruthy();
      expect(config.timelineColor).toBeTruthy();
    });
  });
});
