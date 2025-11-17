import { describe, it, expect } from '@jest/globals';
import { AxiosError } from 'axios';
import {
  extractErrorMessage,
  createApiError,
  isAuthenticationError,
  isAuthorizationError,
  isValidationError,
  isServerError,
} from '../../../shared/utils/errorHandler';

describe('errorHandler', () => {
  describe('extractErrorMessage', () => {
    it('should extract message from AxiosError with response.data.message', () => {
      const axiosError = new Error('Axios error') as AxiosError<{ message: string }>;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        data: { message: 'Custom error message' },
        status: 400,
      };

      const result = extractErrorMessage(axiosError);
      expect(result).toBe('Custom error message');
    });

    it('should extract error from AxiosError with response.data.error', () => {
      const axiosError = new Error('Axios error') as AxiosError<{ error: string }>;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        data: { error: 'Error field message' },
        status: 400,
      };

      const result = extractErrorMessage(axiosError);
      expect(result).toBe('Error field message');
    });

    it('should extract statusText from AxiosError response', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        statusText: 'Bad Request',
        status: 400,
      };

      const result = extractErrorMessage(axiosError);
      expect(result).toBe('Bad Request');
    });

    it('should extract message from generic Error', () => {
      const error = new Error('Generic error message');
      const result = extractErrorMessage(error);
      expect(result).toBe('Generic error message');
    });

    it('should return string error as is', () => {
      const error = 'String error message';
      const result = extractErrorMessage(error);
      expect(result).toBe('String error message');
    });

    it('should return default message for unknown error type', () => {
      const error = { someProperty: 'value' };
      const result = extractErrorMessage(error);
      expect(result).toBe('Ocorreu um erro inesperado. Por favor, tente novamente.');
    });

    it('should handle null error', () => {
      const result = extractErrorMessage(null);
      expect(result).toBe('Ocorreu um erro inesperado. Por favor, tente novamente.');
    });

    it('should handle undefined error', () => {
      const result = extractErrorMessage(undefined);
      expect(result).toBe('Ocorreu um erro inesperado. Por favor, tente novamente.');
    });
  });

  describe('createApiError', () => {
    it('should create ApiError from AxiosError with full details', () => {
      const axiosError = new Error('Axios error') as AxiosError<{ message: string }>;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).code = 'ERR_BAD_REQUEST';
      (axiosError as any).response = {
        status: 400,
        data: { message: 'Validation failed' },
      };

      const result = createApiError(axiosError);
      
      expect(result).toEqual({
        message: 'Validation failed',
        status: 400,
        code: 'ERR_BAD_REQUEST',
        details: { message: 'Validation failed' },
      });
    });

    it('should create ApiError from generic Error', () => {
      const error = new Error('Generic error');
      const result = createApiError(error);
      
      expect(result).toEqual({
        message: 'Generic error',
      });
    });

    it('should create ApiError from string', () => {
      const error = 'String error';
      const result = createApiError(error);
      
      expect(result).toEqual({
        message: 'String error',
      });
    });

    it('should create ApiError from unknown error type', () => {
      const error = { someProperty: 'value' };
      const result = createApiError(error);
      
      expect(result).toEqual({
        message: 'Ocorreu um erro inesperado. Por favor, tente novamente.',
      });
    });
  });

  describe('isAuthenticationError', () => {
    it('should return true for 401 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 401,
      };

      expect(isAuthenticationError(axiosError)).toBe(true);
    });

    it('should return false for non-401 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 403,
      };

      expect(isAuthenticationError(axiosError)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Not an Axios error');
      expect(isAuthenticationError(error)).toBe(false);
    });

    it('should return false for AxiosError without response', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;

      expect(isAuthenticationError(axiosError)).toBe(false);
    });
  });

  describe('isAuthorizationError', () => {
    it('should return true for 403 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 403,
      };

      expect(isAuthorizationError(axiosError)).toBe(true);
    });

    it('should return false for non-403 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 401,
      };

      expect(isAuthorizationError(axiosError)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Not an Axios error');
      expect(isAuthorizationError(error)).toBe(false);
    });
  });

  describe('isValidationError', () => {
    it('should return true for 400 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 400,
      };

      expect(isValidationError(axiosError)).toBe(true);
    });

    it('should return false for non-400 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 500,
      };

      expect(isValidationError(axiosError)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Not an Axios error');
      expect(isValidationError(error)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('should return true for 500 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 500,
      };

      expect(isServerError(axiosError)).toBe(true);
    });

    it('should return true for 502 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 502,
      };

      expect(isServerError(axiosError)).toBe(true);
    });

    it('should return true for 503 status', () => {
      const axiosError = new Error('Axios error') as AxiosError;
      (axiosError as any).isAxiosError = true;
      (axiosError as any).response = {
        status: 503,
      };

      expect(isServerError(axiosError)).toBe(true);
    });

    it('should return false for 499 status', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 499,
        },
      } as unknown as AxiosError;

      expect(isServerError(axiosError)).toBe(false);
    });

    it('should return false for 600 status', () => {
      const axiosError = {
        isAxiosError: true,
        response: {
          status: 600,
        },
      } as unknown as AxiosError;

      expect(isServerError(axiosError)).toBe(false);
    });

    it('should return false for non-AxiosError', () => {
      const error = new Error('Not an Axios error');
      expect(isServerError(error)).toBe(false);
    });

    it('should return false for AxiosError without status', () => {
      const axiosError = {
        isAxiosError: true,
        response: {},
      } as unknown as AxiosError;

      expect(isServerError(axiosError)).toBe(false);
    });
  });
});

