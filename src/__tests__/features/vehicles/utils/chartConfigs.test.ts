import { describe, it, expect } from '@jest/globals';
import { getCategoryChartConfig, getMonthlyChartConfig, getMileageChartConfig } from '../../../../features/vehicles/utils/chartConfigs';
import type { VehicleStats } from '../../../../features/vehicles/utils/vehicleStats';

describe('chartConfigs', () => {
  const mockStats: VehicleStats = {
    totalEvents: 10,
    eventsByCategory: {
      'maintenance': 5,
      'fuel': 3,
      'repair': 2,
    },
    totalCost: 5000,
    averageCost: 500,
    totalMileage: 10000,
    averageMileage: 1000,
  };

  describe('getCategoryChartConfig', () => {
    it('should return pie chart configuration with correct data', () => {
      const config = getCategoryChartConfig(mockStats);

      expect(config.data).toEqual([
        { type: 'maintenance', value: 5 },
        { type: 'fuel', value: 3 },
        { type: 'repair', value: 2 },
      ]);
      expect(config.angleField).toBe('value');
      expect(config.colorField).toBe('type');
      expect(config.radius).toBe(0.8);
      expect(config.label).toBeDefined();
      expect(config.interactions).toBeDefined();
      expect(config.theme).toBeDefined();
    });

    it('should return empty data when no events', () => {
      const emptyStats: VehicleStats = {
        totalEvents: 0,
        eventsByCategory: {},
        totalCost: 0,
        averageCost: 0,
        totalMileage: 0,
        averageMileage: 0,
      };

      const config = getCategoryChartConfig(emptyStats);
      expect(config.data).toEqual([]);
    });
  });

  describe('getMonthlyChartConfig', () => {
    it('should return column chart configuration with 12 months', () => {
      const config = getMonthlyChartConfig(mockStats);

      expect(config.data).toHaveLength(12);
      expect(config.data[0]).toEqual({ month: 'Jan', value: 0 });
      expect(config.xField).toBe('month');
      expect(config.yField).toBe('value');
      expect(config.label).toBeDefined();
      expect(config.xAxis).toBeDefined();
      expect(config.yAxis).toBeDefined();
      expect(config.meta).toBeDefined();
      expect(config.theme).toBeDefined();
    });

    it('should have all 12 months defined', () => {
      const config = getMonthlyChartConfig(mockStats);
      const months = config.data.map((item: any) => item.month);

      expect(months).toEqual(['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']);
    });
  });

  describe('getMileageChartConfig', () => {
    it('should return column chart configuration with 12 months', () => {
      const config = getMileageChartConfig(mockStats);

      expect(config.data).toHaveLength(12);
      expect(config.data[0]).toEqual({ month: 'Jan', km: 0 });
      expect(config.xField).toBe('month');
      expect(config.yField).toBe('km');
      expect(config.label).toBeDefined();
      expect(config.xAxis).toBeDefined();
      expect(config.yAxis).toBeDefined();
      expect(config.meta).toBeDefined();
      expect(config.theme).toBeDefined();
    });

    it('should have km values initialized to 0', () => {
      const config = getMileageChartConfig(mockStats);
      
      config.data.forEach((item: any) => {
        expect(item.km).toBe(0);
      });
    });
  });
});

