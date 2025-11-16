/**
 * Common types used across the application
 * Improves type safety and reduces 'any' usage
 */

/**
 * Generic error type for API responses
 */
export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T = unknown> {
  data: T;
  message?: string;
  success?: boolean;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/**
 * Form field error
 */
export interface FormFieldError {
  field: string;
  message: string;
}

/**
 * Generic callback types
 */
export type VoidCallback = () => void;
export type AsyncVoidCallback = () => Promise<void>;
export type ErrorCallback = (error: Error | ApiError) => void;

/**
 * Event handler types
 */
export type ChangeEventHandler = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
export type SelectChangeHandler = (value: string | number) => void;
export type ClickEventHandler = (event: React.MouseEvent<HTMLElement>) => void;

/**
 * Upload file types
 */
export interface UploadFile {
  uid: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  status?: 'uploading' | 'done' | 'error' | 'removed';
}

/**
 * Option type for select/dropdown components
 */
export interface SelectOption<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

/**
 * Date range type
 */
export interface DateRange {
  startDate: Date | string;
  endDate: Date | string;
}

/**
 * Type guard utilities
 */
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

export function isApiError(error: unknown): error is ApiError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as ApiError).message === 'string'
  );
}

export function hasProperty<T extends object, K extends string>(
  obj: T,
  prop: K
): obj is T & Record<K, unknown> {
  return prop in obj;
}

