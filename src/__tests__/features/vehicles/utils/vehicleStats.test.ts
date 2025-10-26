import { describe, it, expect } from '@jest/globals';
import { calculateVehicleStats } from '../../../../features/vehicles/utils/vehicleStats';
import type { VehicleEvent } from '../../../../features/vehicles/types/vehicle.types';

describe('calculateVehicleStats', () => {
  const mockEvents: VehicleEvent[] = [
    {
      id: '1',
      vehicleId: 'v1',
      type: 'maintenance',
      category: 'preventive',
      description: 'Oil change',
      date: new Date('2024-01-01'),
      mileage: 50000,
      cost: 100,
      location: 'Workshop',
      attachments: [],
      technician: 'John Doe',
      warranty: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      vehicleId: 'v1',
      type: 'maintenance',
      category: 'repair',
      description: 'Brake replacement',
      date: new Date('2024-02-01'),
      mileage: 52000,
      cost: 300,
      location: 'Workshop',
      attachments: [],
      technician: 'John Doe',
      warranty: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      vehicleId: 'v1',
      type: 'fuel',
      category: 'refuel',
      description: 'Full tank',
      date: new Date('2024-03-01'),
      mileage: 54000,
      cost: 200,
      location: 'Gas Station',
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  it('should calculate stats for empty events', () => {
    const stats = calculateVehicleStats([]);

    expect(stats.totalEvents).toBe(0);
    expect(stats.totalCost).toBe(0);
    expect(stats.averageCost).toBe(0);
    expect(stats.eventsByType).toEqual({});
    expect(stats.eventsByCategory).toEqual({});
  });

  it('should calculate total events and cost', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.totalEvents).toBe(3);
    expect(stats.totalCost).toBe(600);
  });

  it('should calculate average cost', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.averageCost).toBe(200);
  });

  it('should count events by type', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.eventsByType.maintenance).toBe(2);
    expect(stats.eventsByType.fuel).toBe(1);
  });

  it('should calculate cost by type', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.costByType.maintenance).toBe(400);
    expect(stats.costByType.fuel).toBe(200);
  });

  it('should count events by category', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.eventsByCategory.preventive).toBe(1);
    expect(stats.eventsByCategory.repair).toBe(1);
    expect(stats.eventsByCategory.refuel).toBe(1);
  });

  it('should find last event date', () => {
    const stats = calculateVehicleStats(mockEvents);

    expect(stats.lastEventDate).toEqual(new Date('2024-03-01'));
  });

  it('should handle events with no cost', () => {
    const eventWithoutCost = {
      ...mockEvents[0],
      cost: 0,
    };

    const stats = calculateVehicleStats([eventWithoutCost]);

    expect(stats.totalCost).toBe(0);
    expect(stats.averageCost).toBe(0);
  });
});
