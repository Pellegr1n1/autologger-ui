import { useState, useCallback } from 'react';
import { UseApiReturn, UseApiState } from "../types/api.types"

export function useApi<T>(
    apiFunction: (...args: any[]) => Promise<T>
): UseApiReturn<T> {
    const [state, setState] = useState<UseApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const execute = useCallback(
        async (...args: any[]): Promise<T> => {
            setState(prev => ({ ...prev, loading: true, error: null }));

            try {
                const data = await apiFunction(...args);
                setState({ data, loading: false, error: null });
                return data;
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
                setState({ data: null, loading: false, error: errorMessage });
                throw error;
            }
        },
        [apiFunction]
    );

    const reset = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    return {
        ...state,
        execute,
        reset,
    };
}