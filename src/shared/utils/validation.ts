/**
 * Validation utilities to improve type safety and reduce code duplication
 */

/**
 * Validates Brazilian vehicle plate (old and Mercosul format)
 */
export function isValidPlate(plate: string): boolean {
  if (!plate) return false;
  
  const cleanValue = plate.toUpperCase().replace('-', '');
  const oldFormat = /^[A-Z]{3}\d{4}$/;
  const mercosulFormat = /^[A-Z]{3}\d[A-Z]\d{2}$/;

  return oldFormat.test(cleanValue) || mercosulFormat.test(cleanValue);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  
  const trimmed = email.trim();
  
  if (trimmed.length < 3 || trimmed.length > 254) return false;
  
  if (/\s/.test(trimmed)) return false;
  
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;
  
  const [localPart, domainPart] = parts;
  
  if (!localPart || localPart.length === 0 || localPart.length > 64) return false;
  
  if (!domainPart || domainPart.length === 0 || domainPart.length > 253) return false;
  
  if (!domainPart.includes('.')) return false;
  
  if (domainPart.includes('..') || domainPart.startsWith('.') || domainPart.endsWith('.')) return false;
  
  const safeEmailPattern = /^[a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return safeEmailPattern.test(trimmed);
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
  return typeof value === 'number' && value > 0 && !Number.isNaN(value);
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
  return value.replaceAll(/[^\w\s-]/gi, '');
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
  
  const cleanCPF = cpf.replaceAll(/\D/g, '');
  return cleanCPF.length === 11;
}

