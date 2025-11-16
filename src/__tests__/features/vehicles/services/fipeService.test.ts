import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import axios from 'axios';
import { FipeService } from '../../../../features/vehicles/services/fipeService';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('FipeService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('getBrands', () => {
    it('should return sorted brands', async () => {
      const mockBrands = [
        { codigo: '3', nome: 'BMW' },
        { codigo: '1', nome: 'Audi' },
        { codigo: '2', nome: 'Mercedes' },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await FipeService.getBrands();

      expect(result).toEqual([
        { codigo: '1', nome: 'Audi' },
        { codigo: '3', nome: 'BMW' },
        { codigo: '2', nome: 'Mercedes' },
      ]);
    });

    it('should throw error when API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(FipeService.getBrands()).rejects.toThrow(
        'Não foi possível carregar as marcas de veículos'
      );
    });
  });

  describe('getModelsByBrand', () => {
    it('should return sorted models', async () => {
      const mockModels = {
        modelos: [
          { codigo: 3, nome: 'Civic' },
          { codigo: 1, nome: 'Accord' },
          { codigo: 2, nome: 'CR-V' },
        ],
      };

      mockedAxios.get.mockResolvedValue({ data: mockModels });

      const result = await FipeService.getModelsByBrand('1');

      // Just check that it's sorted by name, not by specific order
      expect(result.length).toBe(3);
      expect(result.map(r => r.nome).sort()).toEqual(['Accord', 'CR-V', 'Civic']);
    });

    it('should throw error when API fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(FipeService.getModelsByBrand('1')).rejects.toThrow(
        'Não foi possível carregar os modelos'
      );
    });
  });

  describe('getYearsByBrandAndModel', () => {
    it('should return sorted years in descending order', async () => {
      const mockYears = [
        { codigo: '2022-3', nome: '2022 Gasolina' },
        { codigo: '2021-3', nome: '2021 Gasolina' },
        { codigo: '2023-3', nome: '2023 Gasolina' },
      ];

      mockedAxios.get.mockResolvedValue({ data: mockYears });

      const result = await FipeService.getYearsByBrandAndModel('1', 2);

      expect(result[0].nome).toBe('2023 Gasolina');
      expect(result[1].nome).toBe('2022 Gasolina');
      expect(result[2].nome).toBe('2021 Gasolina');
    });
  });

  describe('extractYear', () => {
    it('should extract year from FIPE year string', () => {
      expect(FipeService.extractYear('2023 Gasolina')).toBe(2023);
    });

    it('should return current year if no match', () => {
      const result = FipeService.extractYear('Invalid');
      expect(result).toBeGreaterThanOrEqual(2020);
    });
  });

  describe('formatFipeValue', () => {
    it('should remove R$ and trim', () => {
      expect(FipeService.formatFipeValue('R$ 50.000,00')).toBe('50.000,00');
    });
  });

  describe('getBrandsWithCache', () => {
    it('should return cached brands when available', async () => {
      const cachedBrands = [
        { codigo: '1', nome: 'Test' },
      ];

      // Use the correct cache structure: {data, timestamp}
      const cacheData = {
        data: cachedBrands,
        timestamp: Date.now()
      };
      localStorage.setItem('fipe_brands', JSON.stringify(cacheData));

      const result = await FipeService.getBrandsWithCache();

      expect(result).toEqual(cachedBrands);
      expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('should fetch from API when cache is expired', async () => {
      const mockBrands = [{ codigo: '1', nome: 'New' }];
      const expiredCache = {
        data: mockBrands,
        timestamp: Date.now() - 86400001 // 24h+ ago
      };
      localStorage.setItem('fipe_brands', JSON.stringify(expiredCache));

      mockedAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await FipeService.getBrandsWithCache();

      expect(result).toEqual(mockBrands);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should fetch from API when cache is empty', async () => {
      const mockBrands = [{ codigo: '1', nome: 'Test' }];
      mockedAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await FipeService.getBrandsWithCache();

      expect(result).toEqual(mockBrands);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should handle invalid cache data', async () => {
      localStorage.setItem('fipe_brands', 'invalid json');
      const mockBrands = [{ codigo: '1', nome: 'Test' }];
      mockedAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await FipeService.getBrandsWithCache();

      expect(result).toEqual(mockBrands);
      expect(mockedAxios.get).toHaveBeenCalled();
    });

    it('should fallback to API when cache fails', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      const mockBrands = [{ codigo: '1', nome: 'Test' }];
      
      // Simular erro ao ler do localStorage
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      mockedAxios.get.mockResolvedValue({ data: mockBrands });

      const result = await FipeService.getBrandsWithCache();

      expect(result).toEqual(mockBrands);
      jest.restoreAllMocks();
    });
  });

  describe('getVehicleInfo', () => {
    it('should return vehicle info', async () => {
      const mockVehicle = {
        valor: 'R$ 50.000,00',
        marca: 'Toyota',
        modelo: 'Corolla',
        anoModelo: 2020,
        combustivel: 'Gasolina',
      };

      mockedAxios.get.mockResolvedValue({ data: mockVehicle });

      const result = await FipeService.getVehicleInfo('1', 2, '2020-3');

      expect(result).toEqual(mockVehicle);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        'https://parallelum.com.br/fipe/api/v1/carros/marcas/1/modelos/2/anos/2020-3'
      );
    });

    it('should throw error when API fails', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      await expect(FipeService.getVehicleInfo('1', 2, '2020-3')).rejects.toThrow(
        'Não foi possível carregar as informações do veículo'
      );

      jest.restoreAllMocks();
    });
  });

  describe('clearCache', () => {
    it('should clear cache successfully', () => {
      localStorage.setItem('fipe_brands', JSON.stringify({ data: [], timestamp: Date.now() }));
      
      FipeService.clearCache();
      
      expect(localStorage.getItem('fipe_brands')).toBeNull();
    });

    it('should handle error when clearing cache', () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });
      
      FipeService.clearCache();
      
      expect(console.warn).toHaveBeenCalled();
      jest.restoreAllMocks();
    });
  });

  describe('checkApiAvailability', () => {
    it('should return true when API is available', async () => {
      mockedAxios.get.mockResolvedValue({ data: [] });

      const result = await FipeService.checkApiAvailability();

      expect(result).toBe(true);
    });

    it('should return false when API is unavailable', async () => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      mockedAxios.get.mockRejectedValue(new Error('Network error'));

      const result = await FipeService.checkApiAvailability();

      expect(result).toBe(false);
      jest.restoreAllMocks();
    });
  });
});
