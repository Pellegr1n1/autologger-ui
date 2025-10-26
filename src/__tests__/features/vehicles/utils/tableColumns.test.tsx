import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createEventColumns, createDocumentColumns } from '../../../../features/vehicles/utils/tableColumns';
import type { VehicleEvent, VehicleDocument } from '../../../../features/vehicles/types/vehicle.types';

// Mock Modal
jest.mock('antd', () => {
  const actual = jest.requireActual('antd');
  return {
    ...actual,
    Modal: {
      ...actual.Modal,
      confirm: jest.fn(),
    },
  };
});

// Mock helpers
jest.mock('../../../../features/vehicles/utils/helpers', () => ({
  getChainStatusConfig: (status: any) => ({
    color: status.status === 'confirmed' ? 'green' : 'default',
    label: status.status === 'confirmed' ? 'Confirmado' : 'Pendente',
  }),
  getVehicleEventTypeLabel: (type: string) => type,
}));

// Mock format functions
jest.mock('../../../../shared/utils/format', () => ({
  currencyBRL: (value: number) => `R$ ${value.toLocaleString('pt-BR')}`,
  formatBRDate: (date: string) => new Date(date).toLocaleDateString('pt-BR'),
  kmFormat: (km: number) => `${km.toLocaleString('pt-BR')} km`,
}));

describe('tableColumns', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createEventColumns', () => {
    it('should create columns with correct structure', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();

      const columns = createEventColumns(onEdit, onDelete);

      expect(columns).toHaveLength(7);
      expect(columns[0].title).toBe('Data');
      expect(columns[1].title).toBe('Tipo');
      expect(columns[2].title).toBe('Categoria');
      expect(columns[3].title).toBe('Km');
      expect(columns[4].title).toBe('Custo');
      expect(columns[5].title).toBe('Blockchain');
      expect(columns[6].title).toBe('Ações');
    });

    it('should render date in BR format', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const dateColumn = columns[0];
      const mockEvent = { date: '2024-01-15' } as any;

      const rendered = dateColumn.render?.('2024-01-15', mockEvent, 0);
      expect(rendered).toBeDefined();
    });

    it('should render cost in currency format', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const costColumn = columns[4];
      const mockEvent = { cost: 1500 } as any;

      const rendered = costColumn.render?.(1500, mockEvent, 0);
      expect(rendered).toBeDefined();
    });

    it('should call onEdit when edit button is clicked', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();
      const mockEvent: VehicleEvent = {
        id: '1',
        type: 'maintenance',
        category: 'oil',
        date: '2024-01-15',
        mileage: 50000,
        cost: 150,
      } as VehicleEvent;

      const columns = createEventColumns(onEdit, onDelete);
      const actionsColumn = columns[6];

      // Simulate button click
      const actions = actionsColumn.render?.(null, mockEvent, 0);
      expect(actions).toBeDefined();
    });
  });

  describe('createDocumentColumns', () => {
    it('should create columns with correct structure', () => {
      const onDelete = jest.fn();
      const columns = createDocumentColumns(onDelete);

      expect(columns).toHaveLength(4);
      expect(columns[0].title).toBe('Arquivo');
      expect(columns[1].title).toBe('Enviado em');
      expect(columns[2].title).toBe('Tamanho');
      expect(columns[3].title).toBe('Ações');
    });

    it('should render file size in KB', () => {
      const columns = createDocumentColumns(jest.fn());
      const sizeColumn = columns[2];
      const mockDoc = { size: 2048 } as VehicleDocument;

      const rendered = sizeColumn.render?.(2048, mockDoc, 0);
      expect(rendered).toBe('2.0 KB');
    });

    it('should render uploaded date in BR format', () => {
      const columns = createDocumentColumns(jest.fn());
      const dateColumn = columns[1];
      const mockDoc = { uploadedAt: '2024-01-15' } as VehicleDocument;

      const rendered = dateColumn.render?.('2024-01-15', mockDoc, 0);
      expect(rendered).toBeDefined();
    });
  });
});

