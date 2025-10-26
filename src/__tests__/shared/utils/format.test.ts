import { currencyBRL, kmFormat, percentFormat, formatBRDate } from '../../../shared/utils/format';

describe('format utils', () => {
  describe('currencyBRL', () => {
    it('deve formatar valores monetários corretamente', () => {
      expect(currencyBRL(1000)).toMatch(/R\$\s*1\.000,00/);
      expect(currencyBRL(1234.56)).toMatch(/R\$\s*1\.234,56/);
      expect(currencyBRL(0)).toMatch(/R\$\s*0,00/);
    });

    it('deve lidar com valores inválidos', () => {
      expect(currencyBRL(NaN)).toMatch(/R\$\s*0,00/);
      expect(currencyBRL(undefined as any)).toMatch(/R\$\s*0,00/);
      expect(currencyBRL(null as any)).toMatch(/R\$\s*0,00/);
    });
  });

  describe('kmFormat', () => {
    it('deve formatar quilometragem corretamente', () => {
      expect(kmFormat(1000)).toBe('1.000 km');
      expect(kmFormat(50000)).toBe('50.000 km');
      expect(kmFormat(0)).toBe('0 km');
    });

    it('deve lidar com valores inválidos', () => {
      expect(kmFormat(undefined as any)).toBe('0 km');
      expect(kmFormat(null as any)).toBe('0 km');
    });
  });

  describe('percentFormat', () => {
    it('deve formatar percentuais corretamente', () => {
      expect(percentFormat(0.1)).toBe('10.0%');
      expect(percentFormat(0.5)).toBe('50.0%');
      expect(percentFormat(1)).toBe('100.0%');
      expect(percentFormat(0.123)).toBe('12.3%');
    });
  });

  describe('formatBRDate', () => {
    it('deve formatar datas corretamente', () => {
      const date = new Date('2024-01-15T12:00:00Z');
      expect(formatBRDate(date)).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('deve formatar strings de data', () => {
      expect(formatBRDate('2024-01-15T12:00:00Z')).toMatch(/\d{2}\/\d{2}\/2024/);
    });

    it('deve retornar "-" para valores inválidos', () => {
      expect(formatBRDate('')).toBe('-');
      expect(formatBRDate(undefined)).toBe('-');
      expect(formatBRDate(null as any)).toBe('-');
      expect(formatBRDate('invalid-date')).toBe('-');
    });
  });
});
