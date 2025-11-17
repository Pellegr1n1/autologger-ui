import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { useAsyncCallback } from '../../../shared/hooks/useAsyncCallback';
import { logger } from '../../../shared/utils/logger';
import { ApiError } from '../../../shared/types/common.types';

// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
  logger: {
    error: jest.fn(),
  },
}));

describe('useAsyncCallback', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should initialize with loading false and error null', () => {
    const callback = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncCallback(callback));

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should set loading to true when executing', async () => {
    const callback = jest.fn().mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 100))
    );
    const { result } = renderHook(() => useAsyncCallback(callback));

    const executePromise = result.current.execute();
    
    await waitFor(() => {
      expect(result.current.loading).toBe(true);
    });
    
    await executePromise;
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it('should execute callback successfully', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncCallback(callback));

    await result.current.execute();

    expect(callback).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe(null);
    expect(result.current.loading).toBe(false);
  });

  it('should pass arguments to callback', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncCallback(callback));

    await result.current.execute('arg1', 'arg2', 123);

    expect(callback).toHaveBeenCalledWith('arg1', 'arg2', 123);
  });

  it('should handle errors and set error state', async () => {
    const error = new Error('Test error');
    const callback = jest.fn().mockRejectedValue(error);
    const { result } = renderHook(() => useAsyncCallback(callback));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });
    expect(result.current.loading).toBe(false);
    expect(logger.error).toHaveBeenCalledWith('Async callback error', error);
  });

  it('should call onSuccess when callback succeeds', async () => {
    const callback = jest.fn().mockResolvedValue(undefined);
    const onSuccess = jest.fn();
    const { result } = renderHook(() => 
      useAsyncCallback(callback, { onSuccess })
    );

    await result.current.execute();

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  it('should call onError when callback fails', async () => {
    const error = new Error('Test error');
    const callback = jest.fn().mockRejectedValue(error);
    const onError = jest.fn();
    const { result } = renderHook(() => 
      useAsyncCallback(callback, { onError })
    );

    await result.current.execute();

    expect(onError).toHaveBeenCalledWith(error);
  });

  it('should use custom error message when provided', async () => {
    const error = new Error('Test error');
    const callback = jest.fn().mockRejectedValue(error);
    const customMessage = 'Custom error message';
    const { result } = renderHook(() => 
      useAsyncCallback(callback, { errorMessage: customMessage })
    );

    await result.current.execute();

    expect(logger.error).toHaveBeenCalledWith(customMessage, error);
  });

  it('should handle ApiError type', async () => {
    const apiError: ApiError = {
      message: 'API Error',
      statusCode: 400,
    };
    const callback = jest.fn().mockRejectedValue(apiError);
    const { result } = renderHook(() => useAsyncCallback(callback));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toBe(apiError);
    });
  });

  it('should create Error from non-Error rejection', async () => {
    const callback = jest.fn().mockRejectedValue('string error');
    const { result } = renderHook(() => useAsyncCallback(callback));

    await result.current.execute();

    await waitFor(() => {
      expect(result.current.error).toBeInstanceOf(Error);
      if (result.current.error instanceof Error) {
        expect(result.current.error.message).toBe('An error occurred');
      }
    });
  });

  it('should use custom error message for non-Error rejection', async () => {
    const callback = jest.fn().mockRejectedValue('string error');
    const customMessage = 'Custom error';
    const { result } = renderHook(() => 
      useAsyncCallback(callback, { errorMessage: customMessage })
    );

    await result.current.execute();

    await waitFor(() => {
      if (result.current.error instanceof Error) {
        expect(result.current.error.message).toBe(customMessage);
      }
    });
  });

  it('should reset loading and error state', () => {
    const callback = jest.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useAsyncCallback(callback));

    // Set some state first
    result.current.execute().catch(() => {});

    result.current.reset();

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
  });

  it('should clear error before executing', async () => {
    const error = new Error('First error');
    let callCount = 0;
    const callback = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) {
        return Promise.reject(error);
      }
      return Promise.resolve();
    });
    const { result } = renderHook(() => useAsyncCallback(callback));

    // First call fails
    await result.current.execute();
    await waitFor(() => {
      expect(result.current.error).toBe(error);
    });

    // Second call succeeds
    await result.current.execute();
    await waitFor(() => {
      expect(result.current.error).toBe(null);
    });
  });
});

