/**
 * Validation utilities to improve type safety and reduce code duplication
 */

/**
 * Validates Brazilian vehicle plate (old and Mercosul format)
 */
export function isValidPlate(plate: string): boolean {
  if (!plate) return false;
  
  const cleanValue = plate.toUpperCase().replace('-', '');
  const oldFormat = /^[A-Z]{3}[0-9]{4}$/;
  const mercosulFormat = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

  return oldFormat.test(cleanValue) || mercosulFormat.test(cleanValue);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email) return false;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates if string is not empty after trim
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Validates if value is a positive number
 */
export function isPositiveNumber(value: unknown): value is number {
  return typeof value === 'number' && value > 0 && !isNaN(value);
}

/**
 * Validates if value is a valid year
 */
export function isValidYear(value: unknown): value is number {
  if (typeof value !== 'number') return false;
  
  const currentYear = new Date().getFullYear();
  return value >= 1900 && value <= currentYear + 1;
}

/**
 * Validates if value is within range
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Sanitizes string by removing special characters
 */
export function sanitizeString(value: string): string {
  return value.replace(/[^\w\s-]/gi, '');
}

/**
 * Validates if date is not in the future
 */
export function isNotFutureDate(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj <= new Date();
}

/**
 * Validates Brazilian CPF format (basic check)
 */
export function isValidCPFFormat(cpf: string): boolean {
  if (!cpf) return false;
  
  const cleanCPF = cpf.replace(/\D/g, '');
  return cleanCPF.length === 11;
}

