import { EVENT_CATEGORIES, EVENT_TYPES } from '../../../../features/vehicles/utils/constants';

describe('vehicle utils constants', () => {
  describe('EVENT_CATEGORIES', () => {
    it('deve ter todas as categorias de eventos definidas', () => {
      expect(EVENT_CATEGORIES).toHaveLength(7);
      
      const categories = EVENT_CATEGORIES.map(cat => cat.value);
      expect(categories).toContain('Troca de óleo');
      expect(categories).toContain('Revisão');
      expect(categories).toContain('Freios');
      expect(categories).toContain('Pneu');
      expect(categories).toContain('Gasolina');
      expect(categories).toContain('Licenciamento');
      expect(categories).toContain('Outros');
    });

    it('deve ter labels corretos para cada categoria', () => {
      const oilChange = EVENT_CATEGORIES.find(cat => cat.value === 'Troca de óleo');
      expect(oilChange?.label).toBe('Troca de óleo');

      const review = EVENT_CATEGORIES.find(cat => cat.value === 'Revisão');
      expect(review?.label).toBe('Revisão');

      const brakes = EVENT_CATEGORIES.find(cat => cat.value === 'Freios');
      expect(brakes?.label).toBe('Freios');

      const tire = EVENT_CATEGORIES.find(cat => cat.value === 'Pneu');
      expect(tire?.label).toBe('Pneu');

      const fuel = EVENT_CATEGORIES.find(cat => cat.value === 'Gasolina');
      expect(fuel?.label).toBe('Gasolina');

      const licensing = EVENT_CATEGORIES.find(cat => cat.value === 'Licenciamento');
      expect(licensing?.label).toBe('Licenciamento');

      const others = EVENT_CATEGORIES.find(cat => cat.value === 'Outros');
      expect(others?.label).toBe('Outros');
    });

    it('deve ter estrutura correta para cada categoria', () => {
      EVENT_CATEGORIES.forEach(category => {
        expect(category).toHaveProperty('value');
        expect(category).toHaveProperty('label');
        expect(typeof category.value).toBe('string');
        expect(typeof category.label).toBe('string');
        expect(category.value).toBe(category.label);
      });
    });
  });

  describe('EVENT_TYPES', () => {
    it('deve ter todos os tipos de eventos definidos', () => {
      expect(EVENT_TYPES).toHaveLength(3);
      
      const types = EVENT_TYPES.map(type => type.value);
      expect(types).toContain('maintenance');
      expect(types).toContain('expense');
      expect(types).toContain('fuel');
    });

    it('deve ter labels corretos para cada tipo', () => {
      const maintenance = EVENT_TYPES.find(type => type.value === 'maintenance');
      expect(maintenance?.label).toBe('Manutenção');

      const expense = EVENT_TYPES.find(type => type.value === 'expense');
      expect(expense?.label).toBe('Despesa');

      const fuel = EVENT_TYPES.find(type => type.value === 'fuel');
      expect(fuel?.label).toBe('Abastecimento');
    });

    it('deve ter estrutura correta para cada tipo', () => {
      EVENT_TYPES.forEach(type => {
        expect(type).toHaveProperty('value');
        expect(type).toHaveProperty('label');
        expect(typeof type.value).toBe('string');
        expect(typeof type.label).toBe('string');
      });
    });
  });

  describe('Constantes como readonly', () => {
    it('deve ser arrays readonly', () => {
      expect(Array.isArray(EVENT_CATEGORIES)).toBe(true);
      expect(Array.isArray(EVENT_TYPES)).toBe(true);
    });

    it('deve ter valores únicos', () => {
      const categoryValues = EVENT_CATEGORIES.map(cat => cat.value);
      const uniqueCategoryValues = [...new Set(categoryValues)];
      expect(categoryValues).toHaveLength(uniqueCategoryValues.length);

      const typeValues = EVENT_TYPES.map(type => type.value);
      const uniqueTypeValues = [...new Set(typeValues)];
      expect(typeValues).toHaveLength(uniqueTypeValues.length);
    });
  });
});
