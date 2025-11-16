import { describe, it, expect } from '@jest/globals';
import {
  isValidEmail,
  isValidPlate,
  isNonEmptyString,
  isPositiveNumber,
  isValidYear,
  isInRange,
  sanitizeString,
  isNotFutureDate,
  isValidCPFFormat
} from '../../../shared/utils/validation';

describe('validation utils', () => {
  describe('isValidEmail', () => {
    it('should validate correct email formats', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true);
      expect(isValidEmail('first_last@sub.domain.com')).toBe(true);
      expect(isValidEmail('user123@test.org')).toBe(true);
      expect(isValidEmail('name%test@example.com')).toBe(true);
    });

    it('should reject invalid email formats', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('no@domain')).toBe(false);
      expect(isValidEmail('@example.com')).toBe(false);
      expect(isValidEmail('user@')).toBe(false);
      expect(isValidEmail('user @example.com')).toBe(false);
      expect(isValidEmail('user@domain .com')).toBe(false);
      expect(isValidEmail('user@@example.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
      expect(isValidEmail('user@domain..com')).toBe(false);
    });

    it('should handle edge cases safely without ReDoS', () => {
      // These patterns could cause ReDoS with vulnerable regex
      const longString = 'a'.repeat(10000);
      expect(isValidEmail(longString)).toBe(false);
      expect(isValidEmail(longString + '@' + longString)).toBe(false);
    });

    it('should respect email length limits', () => {
      const longLocal = 'a'.repeat(65) + '@example.com';
      expect(isValidEmail(longLocal)).toBe(false);
      
      const longDomain = 'user@' + 'a'.repeat(254) + '.com';
      expect(isValidEmail(longDomain)).toBe(false);
    });
  });

  describe('isValidPlate', () => {
    it('should validate old format plates', () => {
      expect(isValidPlate('ABC1234')).toBe(true);
      expect(isValidPlate('XYZ9999')).toBe(true);
    });

    it('should validate Mercosul format plates', () => {
      expect(isValidPlate('ABC1D23')).toBe(true);
      expect(isValidPlate('XYZ9A88')).toBe(true);
    });

    it('should handle plates with dash', () => {
      expect(isValidPlate('ABC-1234')).toBe(true);
      expect(isValidPlate('ABC-1D23')).toBe(true);
    });

    it('should reject invalid plates', () => {
      expect(isValidPlate('')).toBe(false);
      expect(isValidPlate('ABC123')).toBe(false);
      expect(isValidPlate('ABCD1234')).toBe(false);
      expect(isValidPlate('1234567')).toBe(false);
    });
  });

  describe('isNonEmptyString', () => {
    it('should validate non-empty strings', () => {
      expect(isNonEmptyString('hello')).toBe(true);
      expect(isNonEmptyString('  text  ')).toBe(true);
    });

    it('should reject empty or invalid values', () => {
      expect(isNonEmptyString('')).toBe(false);
      expect(isNonEmptyString('   ')).toBe(false);
      expect(isNonEmptyString(null)).toBe(false);
      expect(isNonEmptyString(undefined)).toBe(false);
      expect(isNonEmptyString(123)).toBe(false);
    });
  });

  describe('isPositiveNumber', () => {
    it('should validate positive numbers', () => {
      expect(isPositiveNumber(1)).toBe(true);
      expect(isPositiveNumber(100.5)).toBe(true);
      expect(isPositiveNumber(0.1)).toBe(true);
    });

    it('should reject zero, negative, and invalid values', () => {
      expect(isPositiveNumber(0)).toBe(false);
      expect(isPositiveNumber(-1)).toBe(false);
      expect(isPositiveNumber(Number.NaN)).toBe(false);
      expect(isPositiveNumber('123')).toBe(false);
    });
  });

  describe('isValidYear', () => {
    it('should validate reasonable years', () => {
      expect(isValidYear(2023)).toBe(true);
      expect(isValidYear(1900)).toBe(true);
      expect(isValidYear(new Date().getFullYear())).toBe(true);
    });

    it('should reject invalid years', () => {
      expect(isValidYear(1800)).toBe(false);
      expect(isValidYear(2100)).toBe(false);
      expect(isValidYear('2023')).toBe(false);
    });
  });

  describe('isInRange', () => {
    it('should check if value is within range', () => {
      expect(isInRange(5, 0, 10)).toBe(true);
      expect(isInRange(0, 0, 10)).toBe(true);
      expect(isInRange(10, 0, 10)).toBe(true);
    });

    it('should reject values outside range', () => {
      expect(isInRange(-1, 0, 10)).toBe(false);
      expect(isInRange(11, 0, 10)).toBe(false);
    });
  });

  describe('sanitizeString', () => {
    it('should remove special characters', () => {
      expect(sanitizeString('hello!@#$world')).toBe('helloworld');
      expect(sanitizeString('test_string-123')).toBe('test_string-123');
    });

    it('should preserve alphanumeric, spaces, and hyphens', () => {
      expect(sanitizeString('Test String 123')).toBe('Test String 123');
      expect(sanitizeString('hello-world')).toBe('hello-world');
    });
  });

  describe('isNotFutureDate', () => {
    it('should validate past and present dates', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      expect(isNotFutureDate(yesterday)).toBe(true);
      
      const now = new Date();
      expect(isNotFutureDate(now)).toBe(true);
    });

    it('should reject future dates', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(isNotFutureDate(tomorrow)).toBe(false);
    });

    it('should handle string dates', () => {
      const pastDate = '2020-01-01';
      expect(isNotFutureDate(pastDate)).toBe(true);
    });
  });

  describe('isValidCPFFormat', () => {
    it('should validate CPF with 11 digits', () => {
      expect(isValidCPFFormat('12345678901')).toBe(true);
      expect(isValidCPFFormat('123.456.789-01')).toBe(true);
    });

    it('should reject invalid CPF formats', () => {
      expect(isValidCPFFormat('')).toBe(false);
      expect(isValidCPFFormat('123456789')).toBe(false);
      expect(isValidCPFFormat('123456789012')).toBe(false);
    });
  });
});

