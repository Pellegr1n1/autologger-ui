import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';
import { useDebounce } from '../../../shared/hooks/useDebounce';

describe('useDebounce', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should return initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('initial', 500));
    expect(result.current).toBe('initial');
  });

  it('should debounce value changes', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 500 },
      }
    );

    expect(result.current).toBe('initial');

    // Change value
    rerender({ value: 'updated', delay: 500 });
    expect(result.current).toBe('initial'); // Still initial

    // Fast-forward time
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should use default delay of 500ms', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });
    expect(result.current).toBe('initial');

    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should use custom delay', async () => {
    const { result, rerender } = renderHook(
      ({ value, delay }) => useDebounce(value, delay),
      {
        initialProps: { value: 'initial', delay: 1000 },
      }
    );

    rerender({ value: 'updated', delay: 1000 });
    expect(result.current).toBe('initial');

    // Should not update after 500ms
    jest.advanceTimersByTime(500);
    expect(result.current).toBe('initial');

    // Should update after 1000ms
    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe('updated');
    });
  });

  it('should cancel previous timeout on rapid changes', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    // Rapid changes
    rerender({ value: 'change1' });
    jest.advanceTimersByTime(200);
    
    rerender({ value: 'change2' });
    jest.advanceTimersByTime(200);
    
    rerender({ value: 'change3' });
    jest.advanceTimersByTime(200);
    
    // Should still be initial
    expect(result.current).toBe('initial');

    // After full delay from last change
    jest.advanceTimersByTime(300);
    
    await waitFor(() => {
      expect(result.current).toBe('change3');
    });
  });

  it('should handle number values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 0 },
      }
    );

    rerender({ value: 42 });
    expect(result.current).toBe(0);

    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe(42);
    });
  });

  it('should handle object values', async () => {
    const initialObj = { name: 'initial' };
    const updatedObj = { name: 'updated' };
    
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: initialObj },
      }
    );

    rerender({ value: updatedObj });
    expect(result.current).toBe(initialObj);

    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe(updatedObj);
    });
  });

  it('should handle boolean values', async () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: false },
      }
    );

    rerender({ value: true });
    expect(result.current).toBe(false);

    jest.advanceTimersByTime(500);
    
    await waitFor(() => {
      expect(result.current).toBe(true);
    });
  });

  it('should cleanup timeout on unmount', () => {
    const clearTimeoutSpy = jest.spyOn(global, 'clearTimeout');
    const { unmount, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      {
        initialProps: { value: 'initial' },
      }
    );

    rerender({ value: 'updated' });
    unmount();

    // Should have called clearTimeout
    expect(clearTimeoutSpy).toHaveBeenCalled();
    
    clearTimeoutSpy.mockRestore();
  });
});

