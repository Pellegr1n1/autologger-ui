/**
 * Custom hook for handling async callbacks with loading and error states
 * Reduces code duplication and improves error handling
 */

import { useState, useCallback } from 'react';
import { logger } from '../utils/logger';
import { isError, isApiError, ApiError } from '../types/common.types';

interface UseAsyncCallbackOptions {
  onSuccess?: () => void;
  onError?: (error: Error | ApiError) => void;
  errorMessage?: string;
}

interface UseAsyncCallbackReturn<T extends unknown[]> {
  loading: boolean;
  error: Error | ApiError | null;
  execute: (...args: T) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to handle async operations with automatic loading and error state management
 */
export function useAsyncCallback<T extends unknown[]>(
  callback: (...args: T) => Promise<void>,
  options: UseAsyncCallbackOptions = {}
): UseAsyncCallbackReturn<T> {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | ApiError | null>(null);

  const execute = useCallback(
    async (...args: T) => {
      try {
        setLoading(true);
        setError(null);
        await callback(...args);
        options.onSuccess?.();
      } catch (err) {
        const errorObj = isError(err) || isApiError(err) 
          ? err 
          : new Error(options.errorMessage || 'An error occurred');
        
        setError(errorObj);
        logger.error(options.errorMessage || 'Async callback error', err);
        options.onError?.(errorObj);
      } finally {
        setLoading(false);
      }
    },
    [callback, options]
  );

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
  }, []);

  return { loading, error, execute, reset };
}

