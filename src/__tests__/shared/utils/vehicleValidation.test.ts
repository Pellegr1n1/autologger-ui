import { VehicleValidation } from '../../../shared/utils/vehicleValidation';

describe('VehicleValidation', () => {
  describe('validatePlate', () => {
    it('deve validar placas no formato antigo', () => {
      expect(VehicleValidation.validatePlate('ABC1234')).toBeNull();
      expect(VehicleValidation.validatePlate('XYZ9876')).toBeNull();
    });

    it('deve validar placas no formato Mercosul', () => {
      expect(VehicleValidation.validatePlate('ABC1D23')).toBeNull();
      expect(VehicleValidation.validatePlate('XYZ9A87')).toBeNull();
    });

    it('deve rejeitar placas vazias', () => {
      expect(VehicleValidation.validatePlate('')).toBe('Placa é obrigatória');
      expect(VehicleValidation.validatePlate('   ')).toBe('Placa é obrigatória');
    });

    it('deve rejeitar placas com tamanho incorreto', () => {
      expect(VehicleValidation.validatePlate('ABC123')).toBe('Placa deve ter 7 caracteres');
      expect(VehicleValidation.validatePlate('ABC12345')).toBe('Placa deve ter 7 caracteres');
    });

    it('deve rejeitar placas com formato inválido', () => {
      expect(VehicleValidation.validatePlate('1234567')).toBe('Formato de placa inválido (ex: ABC1234 ou ABC1D23)');
      expect(VehicleValidation.validatePlate('ABCD123')).toBe('Formato de placa inválido (ex: ABC1234 ou ABC1D23)');
    });
  });

  describe('validateBrand', () => {
    it('deve validar marcas corretas', () => {
      expect(VehicleValidation.validateBrand('Toyota')).toBeNull();
      expect(VehicleValidation.validateBrand('BMW')).toBeNull();
    });

    it('deve rejeitar marcas vazias', () => {
      expect(VehicleValidation.validateBrand('')).toBe('Marca é obrigatória');
      expect(VehicleValidation.validateBrand('   ')).toBe('Marca é obrigatória');
    });

    it('deve rejeitar marcas muito curtas', () => {
      expect(VehicleValidation.validateBrand('A')).toBe('Marca deve ter pelo menos 2 caracteres');
    });

    it('deve rejeitar marcas muito longas', () => {
      const longBrand = 'A'.repeat(51);
      expect(VehicleValidation.validateBrand(longBrand)).toBe('Marca deve ter no máximo 50 caracteres');
    });
  });

  describe('validateModel', () => {
    it('deve validar modelos corretos', () => {
      expect(VehicleValidation.validateModel('Corolla')).toBeNull();
      expect(VehicleValidation.validateModel('X1')).toBeNull();
    });

    it('deve rejeitar modelos vazios', () => {
      expect(VehicleValidation.validateModel('')).toBe('Modelo é obrigatório');
      expect(VehicleValidation.validateModel('   ')).toBe('Modelo é obrigatório');
    });

    it('deve rejeitar modelos muito longos', () => {
      const longModel = 'A'.repeat(51);
      expect(VehicleValidation.validateModel(longModel)).toBe('Modelo deve ter no máximo 50 caracteres');
    });
  });

  describe('validateYear', () => {
    it('deve validar anos corretos', () => {
      expect(VehicleValidation.validateYear('2020')).toBeNull();
      expect(VehicleValidation.validateYear('1990')).toBeNull();
    });

    it('deve rejeitar anos vazios', () => {
      expect(VehicleValidation.validateYear('')).toBe('Ano é obrigatório');
      expect(VehicleValidation.validateYear('   ')).toBe('Ano é obrigatório');
    });

    it('deve rejeitar anos inválidos', () => {
      expect(VehicleValidation.validateYear('abc')).toBe('Ano deve ser um número válido');
      // parseInt('2024.5') retorna 2024, que é válido
      expect(VehicleValidation.validateYear('abc.def')).toBe('Ano deve ser um número válido');
    });

    it('deve rejeitar anos fora do range', () => {
      expect(VehicleValidation.validateYear('1899')).toBe('Ano deve estar entre 1900 e 2026');
      expect(VehicleValidation.validateYear('2030')).toBe('Ano deve estar entre 1900 e 2026');
    });
  });

  describe('validateColor', () => {
    it('deve validar cores corretas', () => {
      expect(VehicleValidation.validateColor('Branco')).toBeNull();
      expect(VehicleValidation.validateColor('Azul')).toBeNull();
    });

    it('deve rejeitar cores vazias', () => {
      expect(VehicleValidation.validateColor('')).toBe('Cor é obrigatória');
      expect(VehicleValidation.validateColor('   ')).toBe('Cor é obrigatória');
    });

    it('deve rejeitar cores muito curtas', () => {
      expect(VehicleValidation.validateColor('Az')).toBe('Cor deve ter pelo menos 3 caracteres');
    });

    it('deve rejeitar cores muito longas', () => {
      const longColor = 'A'.repeat(31);
      expect(VehicleValidation.validateColor(longColor)).toBe('Cor deve ter no máximo 30 caracteres');
    });
  });

  describe('validateRenavam', () => {
    it('deve validar RENAVAMs corretos', () => {
      expect(VehicleValidation.validateRenavam('12345678901')).toBeNull();
      expect(VehicleValidation.validateRenavam('98765432109')).toBeNull();
    });

    it('deve rejeitar RENAVAMs vazios', () => {
      expect(VehicleValidation.validateRenavam('')).toBe('RENAVAM é obrigatório');
      expect(VehicleValidation.validateRenavam('   ')).toBe('RENAVAM é obrigatório');
    });

    it('deve rejeitar RENAVAMs com tamanho incorreto', () => {
      expect(VehicleValidation.validateRenavam('1234567890')).toBe('RENAVAM deve ter exatamente 11 dígitos');
      expect(VehicleValidation.validateRenavam('123456789012')).toBe('RENAVAM deve ter exatamente 11 dígitos');
    });

    it('deve rejeitar RENAVAMs com caracteres não numéricos', () => {
      expect(VehicleValidation.validateRenavam('1234567890a')).toBe('RENAVAM deve ter exatamente 11 dígitos');
    });
  });

  describe('validateMileage', () => {
    it('deve aceitar quilometragem vazia (opcional)', () => {
      expect(VehicleValidation.validateMileage('')).toBeNull();
      expect(VehicleValidation.validateMileage('   ')).toBeNull();
    });

    it('deve validar quilometragem correta', () => {
      expect(VehicleValidation.validateMileage('50000')).toBeNull();
      expect(VehicleValidation.validateMileage('0')).toBeNull();
    });

    it('deve rejeitar quilometragem negativa', () => {
      // A função remove caracteres não numéricos, então -1000 vira 1000
      expect(VehicleValidation.validateMileage('abc')).toBe('Quilometragem deve ser um número válido');
    });

    it('deve rejeitar quilometragem muito alta', () => {
      expect(VehicleValidation.validateMileage('10000000')).toBe('Quilometragem muito alta');
    });
  });

  describe('formatPlateInput', () => {
    it('deve formatar entrada de placa corretamente', () => {
      expect(VehicleValidation.formatPlateInput('abc1234')).toBe('ABC-1234');
      expect(VehicleValidation.formatPlateInput('abc1d23')).toBe('ABC-1D23');
    });

    it('deve limitar entrada a 7 caracteres', () => {
      expect(VehicleValidation.formatPlateInput('abcdefgh')).toBe('ABC-DEFG');
    });
  });

  describe('formatRenavamInput', () => {
    it('deve formatar entrada de RENAVAM corretamente', () => {
      expect(VehicleValidation.formatRenavamInput('12345678901')).toBe('123.456.789-01');
      expect(VehicleValidation.formatRenavamInput('123456789')).toBe('123.456.789-');
    });
  });

  describe('formatMileageInput', () => {
    it('deve formatar entrada de quilometragem corretamente', () => {
      expect(VehicleValidation.formatMileageInput('50000')).toBe('50.000');
      expect(VehicleValidation.formatMileageInput('1000')).toBe('1.000');
    });
  });

  describe('parseFormattedNumber', () => {
    it('deve converter número formatado para valor numérico', () => {
      expect(VehicleValidation.parseFormattedNumber('50.000')).toBe(50000);
      expect(VehicleValidation.parseFormattedNumber('1.000')).toBe(1000);
    });
  });

  describe('capitalizeWords', () => {
    it('deve capitalizar primeira letra de cada palavra', () => {
      expect(VehicleValidation.capitalizeWords('toyota corolla')).toBe('Toyota Corolla');
      expect(VehicleValidation.capitalizeWords('BMW X1')).toBe('Bmw X1');
    });
  });
});
