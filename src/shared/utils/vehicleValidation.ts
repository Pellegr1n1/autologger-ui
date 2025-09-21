import { VehicleFormData, VehicleFormErrors } from '../../features/vehicles/types/vehicle.types';

export class VehicleValidation {
  /**
   * Validar formulário completo de veículo
   */
  static validateVehicleForm(data: VehicleFormData): VehicleFormErrors {
    const errors: VehicleFormErrors = {};

    // Validar placa
    const plateError = this.validatePlate(data.plate);
    if (plateError) errors.plate = plateError;

    // Validar marca
    const brandError = this.validateBrand(data.brand);
    if (brandError) errors.brand = brandError;

    // Validar modelo
    const modelError = this.validateModel(data.model);
    if (modelError) errors.model = modelError;

    // Validar ano
    const yearError = this.validateYear(data.year);
    if (yearError) errors.year = yearError;

    // Validar cor
    const colorError = this.validateColor(data.color);
    if (colorError) errors.color = colorError;

    // Validar RENAVAM
    const renavamError = this.validateRenavam(data.renavam);
    if (renavamError) errors.renavam = renavamError;

    // Validar quilometragem
    const mileageError = this.validateMileage(data.mileage);
    if (mileageError) errors.mileage = mileageError;

    return errors;
  }

  /**
   * Validar placa
   */
  static validatePlate(plate: string): string | null {
    if (!plate || plate.trim().length === 0) {
      return 'Placa é obrigatória';
    }

    const cleanPlate = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

    if (cleanPlate.length < 7 || cleanPlate.length > 7) {
      return 'Placa deve ter 7 caracteres';
    }

    const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
    const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

    if (!oldFormat.test(cleanPlate) && !mercosulFormat.test(cleanPlate)) {
      return 'Formato de placa inválido (ex: ABC1234 ou ABC1D23)';
    }

    return null;
  }

  /**
   * Validar marca
   */
  static validateBrand(brand: string): string | null {
    if (!brand || brand.trim().length === 0) {
      return 'Marca é obrigatória';
    }

    if (brand.trim().length < 2) {
      return 'Marca deve ter pelo menos 2 caracteres';
    }

    if (brand.trim().length > 50) {
      return 'Marca deve ter no máximo 50 caracteres';
    }

    return null;
  }

  /**
   * Validar modelo
   */
  static validateModel(model: string): string | null {
    if (!model || model.trim().length === 0) {
      return 'Modelo é obrigatório';
    }

    if (model.trim().length < 1) {
      return 'Modelo deve ter pelo menos 1 caractere';
    }

    if (model.trim().length > 50) {
      return 'Modelo deve ter no máximo 50 caracteres';
    }

    return null;
  }

  /**
   * Validar ano
   */
  static validateYear(year: string): string | null {
    if (!year || year.trim().length === 0) {
      return 'Ano é obrigatório';
    }

    const yearNumber = parseInt(year, 10);

    if (isNaN(yearNumber)) {
      return 'Ano deve ser um número válido';
    }

    const currentYear = new Date().getFullYear();
    const minYear = 1900;
    const maxYear = currentYear + 1;

    if (yearNumber < minYear || yearNumber > maxYear) {
      return `Ano deve estar entre ${minYear} e ${maxYear}`;
    }

    return null;
  }

  /**
   * Validar cor
   */
  static validateColor(color: string): string | null {
    if (!color || color.trim().length === 0) {
      return 'Cor é obrigatória';
    }

    if (color.trim().length < 3) {
      return 'Cor deve ter pelo menos 3 caracteres';
    }

    if (color.trim().length > 30) {
      return 'Cor deve ter no máximo 30 caracteres';
    }

    return null;
  }

  /**
   * Validar RENAVAM
   */
  static validateRenavam(renavam: string): string | null {
    if (!renavam || renavam.trim().length === 0) {
      return 'RENAVAM é obrigatório';
    }

    const cleanRenavam = renavam.replace(/\D/g, '');

    if (cleanRenavam.length !== 11) {
      return 'RENAVAM deve ter exatamente 11 dígitos';
    }

    if (!/^[0-9]{11}$/.test(cleanRenavam)) {
      return 'RENAVAM deve conter apenas números';
    }

    return null;
  }

  /**
   * Validar quilometragem
   */
  static validateMileage(mileage: string): string | null {
    // Quilometragem é opcional
    if (!mileage || mileage.trim().length === 0) {
      return null;
    }

    const mileageNumber = parseInt(mileage.replace(/\D/g, ''), 10);

    if (isNaN(mileageNumber)) {
      return 'Quilometragem deve ser um número válido';
    }

    if (mileageNumber < 0) {
      return 'Quilometragem não pode ser negativa';
    }

    if (mileageNumber > 9999999) {
      return 'Quilometragem muito alta';
    }

    return null;
  }

  /**
   * Verificar se há erros no formulário
   */
  static hasErrors(errors: VehicleFormErrors): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Limpar e formatar entrada de placa
   */
  static formatPlateInput(value: string): string {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const limited = clean.substring(0, 7);

    if (limited.length >= 4) {
      return limited.substring(0, 3) + '-' + limited.substring(3);
    }
    
    return limited;
  }

  /**
   * Limpar e formatar entrada de RENAVAM
   */
  static formatRenavamInput(value: string): string {
    const clean = value.replace(/\D/g, '');
    const limited = clean.substring(0, 11);
    
    if (limited.length >= 9) {
      return limited.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})$/, '$1.$2.$3-$4');
    } else if (limited.length >= 6) {
      return limited.replace(/^(\d{3})(\d{3})(\d{0,3})$/, '$1.$2.$3');
    } else if (limited.length >= 3) {
      return limited.replace(/^(\d{3})(\d{0,3})$/, '$1.$2');
    }
    
    return limited;
  }

  /**
   * Limpar e formatar entrada de quilometragem
   */
  static formatMileageInput(value: string): string {
    const clean = value.replace(/\D/g, '');
    const number = parseInt(clean, 10);
    
    if (isNaN(number)) return '';
    
    return new Intl.NumberFormat('pt-BR').format(number);
  }

  /**
   * Converter entrada formatada para valor numérico
   */
  static parseFormattedNumber(value: string): number {
    const clean = value.replace(/\D/g, '');
    return parseInt(clean, 10) || 0;
  }

  /**
   * Validar se ano é futuro demais
   */
  static isYearTooFuture(year: number): boolean {
    const currentYear = new Date().getFullYear();
    return year > currentYear + 1;
  }

  /**
   * Validar se ano é muito antigo
   */
  static isYearTooOld(year: number): boolean {
    return year < 1900;
  }

  /**
   * Capitalizar primeira letra de cada palavra
   */
  static capitalizeWords(text: string): string {
    return text
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}