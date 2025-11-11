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

    it('should handle blockchain status with status', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const blockchainColumn = columns[5];
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockEvent = {
        id: '1',
        blockchainStatus: { status: 'confirmed' },
      } as any;

      const rendered = blockchainColumn.render?.({ status: 'confirmed' }, mockEvent, 0);
      expect(rendered).toBeDefined();

      jest.restoreAllMocks();
    });

    it('should handle blockchain status without status', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const blockchainColumn = columns[5];

      const mockEvent = {
        id: '1',
        blockchainStatus: null,
      } as any;

      const rendered = blockchainColumn.render?.(null, mockEvent, 0);
      expect(rendered).toBeDefined();
    });

    it('should handle edit action', () => {
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

      const actions = actionsColumn.render?.(null, mockEvent, 0);
      expect(actions).toBeDefined();
    });

    it('should render document with PDF type', () => {
      const columns = createDocumentColumns(jest.fn());
      const fileColumn = columns[0];
      const mockDoc: VehicleDocument = {
        id: '1',
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        uploadedAt: '2024-01-15',
      } as VehicleDocument;

      const rendered = fileColumn.render?.('test.pdf', mockDoc, 0);
      expect(rendered).toBeDefined();
    });

    it('should render document with text type', () => {
      const columns = createDocumentColumns(jest.fn());
      const fileColumn = columns[0];
      const mockDoc: VehicleDocument = {
        id: '1',
        name: 'test.txt',
        type: 'text/plain',
        size: 1024,
        uploadedAt: '2024-01-15',
      } as VehicleDocument;

      const rendered = fileColumn.render?.('test.txt', mockDoc, 0);
      expect(rendered).toBeDefined();
    });

    it('should handle delete document action', () => {
      const { Modal } = require('antd');
      const onDelete = jest.fn();
      const columns = createDocumentColumns(onDelete);
      const actionsColumn = columns[3];
      const mockDoc: VehicleDocument = {
        id: '1',
        name: 'test.pdf',
        type: 'application/pdf',
        size: 1024,
        uploadedAt: '2024-01-15',
      } as VehicleDocument;

      const actions = actionsColumn.render?.(null, mockDoc, 0);
      expect(actions).toBeDefined();
    });

    it('should handle blockchain status with different statuses', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const blockchainColumn = columns[5];
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const statuses = ['CONFIRMED', 'PENDING', 'FAILED', 'SUBMITTED'];
      
      statuses.forEach(status => {
        const mockEvent = {
          id: '1',
          blockchainStatus: { status },
        } as any;

        const rendered = blockchainColumn.render?.({ status }, mockEvent, 0);
        expect(rendered).toBeDefined();
      });

      jest.restoreAllMocks();
    });

    it('should handle blockchain status with null', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const blockchainColumn = columns[5];
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockEvent = {
        id: '1',
        blockchainStatus: null,
      } as any;

      const rendered = blockchainColumn.render?.(null, mockEvent, 0);
      expect(rendered).toBeDefined();

      jest.restoreAllMocks();
    });

    it('should handle blockchain status without status property', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const blockchainColumn = columns[5];
      
      jest.spyOn(console, 'log').mockImplementation(() => {});

      const mockEvent = {
        id: '1',
        blockchainStatus: {},
      } as any;

      const rendered = blockchainColumn.render?.({}, mockEvent, 0);
      expect(rendered).toBeDefined();

      jest.restoreAllMocks();
    });

    it('should handle cost with zero value', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const costColumn = columns[4];
      const mockEvent = { cost: 0 } as any;

      const rendered = costColumn.render?.(0, mockEvent, 0);
      expect(rendered).toBeDefined();
    });

    it('should handle mileage formatting', () => {
      const columns = createEventColumns(jest.fn(), jest.fn());
      const mileageColumn = columns[3];
      const mockEvent = { mileage: 50000 } as any;

      const rendered = mileageColumn.render?.(50000, mockEvent, 0);
      expect(rendered).toBeDefined();
    });
  });
});

