export interface UseApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

export interface UseApiReturn<T> extends UseApiState<T> {
    execute: (...args: any[]) => Promise<T>;
    reset: () => void;
}