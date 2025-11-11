import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { renderHook, act } from '@testing-library/react';
import { useVehicleDetails } from '../../../../features/vehicles/hooks/useVehicleDetails';
import type { VehicleEvent, VehicleDocument, VehicleEventType } from '../../../features/vehicles/types/vehicle.types';

const mockMessageInfo = jest.fn();
const mockMessageSuccess = jest.fn();
const mockModalConfirm = jest.fn();

jest.mock('antd', () => {
  const actualAntd = jest.requireActual('antd');
  return {
    ...actualAntd,
    message: {
      info: (...args: unknown[]) => mockMessageInfo(...args),
      success: (...args: unknown[]) => mockMessageSuccess(...args),
    },
    Modal: {
      confirm: (...args: unknown[]) => mockModalConfirm(...args),
    },
  };
});

describe('useVehicleDetails', () => {
  const mockEvents: VehicleEvent[] = [
    {
      id: '1',
      vehicleId: 'v1',
      type: 'other' as VehicleEventType,
      category: 'service',
      description: 'Oil change',
      date: new Date('2024-01-01'),
      mileage: 50000,
      cost: 100,
      location: 'Garage',
      attachments: [],
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      blockchainStatus: {
        status: 'CONFIRMED',
        lastUpdate: new Date(),
        retryCount: 0,
        maxRetries: 3,
      },
      isImmutable: false,
      canEdit: true,
      requiresConfirmation: false,
    },
  ];
  
  const mockDocuments: VehicleDocument[] = [
    { id: '1', vehicleId: 'v1', name: 'doc.pdf', type: 'application/pdf', uploadedAt: '2024-01-01', size: 1024, url: '#' },
  ];

  const mockSetEvents = jest.fn();
  const mockSetDocuments = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return all handlers', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    expect(result.current.handleEditVehicle).toBeDefined();
    expect(result.current.handleSellVehicle).toBeDefined();
    expect(result.current.handleDeleteVehicle).toBeDefined();
    expect(result.current.handleEditEvent).toBeDefined();
    expect(result.current.handleDeleteEvent).toBeDefined();
    expect(result.current.handleAddEvent).toBeDefined();
    expect(result.current.handleDeleteDocument).toBeDefined();
    expect(result.current.handleUploadDocument).toBeDefined();
    expect(result.current.handleOpenServiceModal).toBeDefined();
    expect(result.current.handleCloseServiceModal).toBeDefined();
  });

  it('should handle edit vehicle', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleEditVehicle();
    });

    expect(mockMessageInfo).toHaveBeenCalledWith('Ação de editar');
  });

  it('should handle delete event', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleDeleteEvent('1');
    });

    expect(mockSetEvents).toHaveBeenCalled();
    expect(mockMessageSuccess).toHaveBeenCalledWith('Evento removido.');
  });

  it('should handle add event', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    const newEvent: VehicleEvent = {
      id: '',
      vehicleId: 'v1',
      type: 'other' as VehicleEventType,
      category: 'service',
      description: 'New service',
      date: new Date('2024-01-02'),
      mileage: 51000,
      cost: 200,
      location: 'Garage',
      attachments: [],
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      blockchainStatus: {
        status: 'CONFIRMED',
        lastUpdate: new Date(),
        retryCount: 0,
        maxRetries: 3,
      },
      isImmutable: false,
      canEdit: true,
      requiresConfirmation: false,
    };

    act(() => {
      result.current.handleAddEvent(newEvent);
    });

    expect(mockSetEvents).toHaveBeenCalled();
    expect(mockMessageSuccess).toHaveBeenCalledWith('Evento adicionado.');
  });

  it('should handle delete document', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleDeleteDocument('1');
    });

    expect(mockSetDocuments).toHaveBeenCalled();
    expect(mockMessageSuccess).toHaveBeenCalledWith('Documento removido.');
  });

  it('should handle upload document', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });

    act(() => {
      const returnValue = result.current.handleUploadDocument(file);
      expect(returnValue).toBe(false);
    });

    expect(mockSetDocuments).toHaveBeenCalled();
    expect(mockMessageSuccess).toHaveBeenCalledWith("Arquivo 'test.pdf' anexado (mock).");
  });

  it('should handle service modal open/close', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    expect(result.current.serviceModalOpen).toBe(false);

    act(() => {
      result.current.handleOpenServiceModal();
    });

    expect(result.current.serviceModalOpen).toBe(true);

    act(() => {
      result.current.handleCloseServiceModal();
    });

    expect(result.current.serviceModalOpen).toBe(false);
  });

  it('should handle sell vehicle modal', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleSellVehicle();
    });

    expect(mockModalConfirm).toHaveBeenCalled();
  });

  it('should handle delete vehicle modal', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleDeleteVehicle();
    });

    expect(mockModalConfirm).toHaveBeenCalled();
  });

  it('should handle edit event', () => {
    const { result } = renderHook(() =>
      useVehicleDetails({
        events: mockEvents,
        documents: mockDocuments,
        setEvents: mockSetEvents,
        setDocuments: mockSetDocuments,
        vehicleId: 'v1',
      })
    );

    act(() => {
      result.current.handleEditEvent(mockEvents[0]);
    });

    expect(mockMessageInfo).toHaveBeenCalledWith('Editar evento 1');
  });
});
