import { describe, it, expect } from '@jest/globals';
import {
  isError,
  isApiError,
  hasProperty,
  ApiError,
} from '../../../shared/types/common.types';

describe('common.types type guards', () => {
  describe('isError', () => {
    it('should return true for Error instance', () => {
      const error = new Error('Test error');
      expect(isError(error)).toBe(true);
    });

    it('should return false for string', () => {
      expect(isError('string error')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isError(123)).toBe(false);
    });

    it('should return false for null', () => {
      expect(isError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isError(undefined)).toBe(false);
    });

    it('should return false for object without Error prototype', () => {
      expect(isError({ message: 'error' })).toBe(false);
    });
  });

  describe('isApiError', () => {
    it('should return true for valid ApiError object', () => {
      const apiError: ApiError = {
        message: 'API Error',
        statusCode: 400,
      };
      expect(isApiError(apiError)).toBe(true);
    });

    it('should return true for ApiError with only message', () => {
      const apiError: ApiError = {
        message: 'API Error',
      };
      expect(isApiError(apiError)).toBe(true);
    });

    it('should return true for ApiError with errors field', () => {
      const apiError: ApiError = {
        message: 'Validation Error',
        errors: {
          email: ['Invalid email'],
        },
      };
      expect(isApiError(apiError)).toBe(true);
    });

    it('should return false for null', () => {
      expect(isApiError(null)).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(isApiError(undefined)).toBe(false);
    });

    it('should return false for string', () => {
      expect(isApiError('error')).toBe(false);
    });

    it('should return false for number', () => {
      expect(isApiError(123)).toBe(false);
    });

    it('should return false for object without message', () => {
      expect(isApiError({ statusCode: 400 })).toBe(false);
    });

    it('should return false for object with non-string message', () => {
      expect(isApiError({ message: 123 })).toBe(false);
    });

    it('should return true for Error instance (limitation of current implementation)', () => {
      const error = new Error('Test error');
      const result = isApiError(error);
      expect(result).toBe(true); // Current implementation returns true
    });
  });

  describe('hasProperty', () => {
    it('should return true when object has property', () => {
      const obj = { name: 'test', age: 25 };
      expect(hasProperty(obj, 'name')).toBe(true);
      expect(hasProperty(obj, 'age')).toBe(true);
    });

    it('should return false when object does not have property', () => {
      const obj = { name: 'test' };
      expect(hasProperty(obj, 'age')).toBe(false);
    });

    it('should narrow type correctly', () => {
      const obj: { name?: string; age?: number } = { name: 'test' };
      
      if (hasProperty(obj, 'age')) {
        // TypeScript should know obj has age property here
        expect(typeof obj.age).toBe('number');
      }
    });

    it('should work with empty object', () => {
      const obj = {};
      expect(hasProperty(obj, 'anyProperty')).toBe(false);
    });

    it('should work with object with undefined property', () => {
      const obj: { prop?: string } = { prop: undefined };
      expect(hasProperty(obj, 'prop')).toBe(true);
    });
  });
});

