import { renderHook } from '@testing-library/react';
import { useMockVehicle } from '../../../../features/vehicles/hooks/useMockVehicle';
import { VehicleEventType } from '../../../../features/vehicles/types/vehicle.types';

describe('useMockVehicle', () => {
  it('deve retornar dados mockados do veículo', () => {
    const { result } = renderHook(() => useMockVehicle('test-vehicle-id'));

    expect(result.current.vehicle).toBeDefined();
    expect(result.current.vehicle.id).toBe('test-vehicle-id');
    expect(result.current.vehicle.plate).toBe('ABC-1D23');
    expect(result.current.vehicle.brand).toBe('Toyota');
    expect(result.current.vehicle.model).toBe('Corolla XEi');
  });

  it('deve retornar eventos mockados', () => {
    const { result } = renderHook(() => useMockVehicle('test-vehicle-id'));

    expect(result.current.events).toBeDefined();
    expect(Array.isArray(result.current.events)).toBe(true);
    expect(result.current.events.length).toBeGreaterThan(0);
  });

  it('deve retornar documentos mockados', () => {
    const { result } = renderHook(() => useMockVehicle('test-vehicle-id'));

    expect(result.current.documents).toBeDefined();
    expect(Array.isArray(result.current.documents)).toBe(true);
    expect(result.current.documents.length).toBeGreaterThan(0);
  });

  it('deve retornar funções de manipulação', () => {
    const { result } = renderHook(() => useMockVehicle('test-vehicle-id'));

    expect(typeof result.current.setEvents).toBe('function');
    expect(typeof result.current.setDocuments).toBe('function');
  });

  it('deve retornar dados consistentes entre renderizações', () => {
    const { result, rerender } = renderHook(() => useMockVehicle('test-vehicle-id'));

    const firstRender = {
      vehicle: result.current.vehicle,
      events: result.current.events,
      documents: result.current.documents
    };

    rerender();

    expect(result.current.vehicle).toEqual(firstRender.vehicle);
    expect(result.current.events).toEqual(firstRender.events);
    expect(result.current.documents).toEqual(firstRender.documents);
  });

  it('deve ter eventos com tipos corretos', () => {
    const { result } = renderHook(() => useMockVehicle('test-vehicle-id'));

    result.current.events.forEach(event => {
      expect(Object.values(VehicleEventType)).toContain(event.type);
      expect(typeof event.id).toBe('string');
      expect(typeof event.vehicleId).toBe('string');
      expect(typeof event.category).toBe('string');
      expect(typeof event.mileage).toBe('number');
      expect(event.date).toBeInstanceOf(Date);
      expect(typeof event.description).toBe('string');
      expect(typeof event.cost).toBe('number');
      expect(typeof event.location).toBe('string');
    });
  });
});
