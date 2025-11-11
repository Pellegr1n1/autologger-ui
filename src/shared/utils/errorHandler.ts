/**
 * Utilitários para tratamento de erros
 * Fornece tratamento consistente de erros em toda a aplicação
 */

import { AxiosError } from 'axios';

export interface ApiError {
  message: string;
  status?: number;
  code?: string;
  details?: unknown;
}

/**
 * Extrai mensagem de erro de uma resposta da API
 * @param error - Erro do Axios ou genérico
 * @returns Mensagem de erro formatada
 */
export function extractErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    // Erro do Axios
    if ('isAxiosError' in error && (error as AxiosError).response) {
      const axiosError = error as AxiosError<{ message?: string; error?: string }>;
      const responseData = axiosError.response?.data;
      
      if (responseData?.message) {
        return responseData.message;
      }
      
      if (responseData?.error) {
        return responseData.error;
      }
      
      if (axiosError.response?.statusText) {
        return axiosError.response.statusText;
      }
    }
    
    // Erro genérico
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Ocorreu um erro inesperado. Por favor, tente novamente.';
}

/**
 * Cria um objeto de erro padronizado
 * @param error - Erro original
 * @returns Objeto de erro padronizado
 */
export function createApiError(error: unknown): ApiError {
  const message = extractErrorMessage(error);
  
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return {
      message,
      status: axiosError.response?.status,
      code: axiosError.code,
      details: axiosError.response?.data,
    };
  }
  
  return {
    message,
  };
}

/**
 * Verifica se o erro é um erro de autenticação (401)
 * @param error - Erro a ser verificado
 * @returns true se for erro de autenticação
 */
export function isAuthenticationError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 401;
  }
  return false;
}

/**
 * Verifica se o erro é um erro de autorização (403)
 * @param error - Erro a ser verificado
 * @returns true se for erro de autorização
 */
export function isAuthorizationError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 403;
  }
  return false;
}

/**
 * Verifica se o erro é um erro de validação (400)
 * @param error - Erro a ser verificado
 * @returns true se for erro de validação
 */
export function isValidationError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    return axiosError.response?.status === 400;
  }
  return false;
}

/**
 * Verifica se o erro é um erro de servidor (5xx)
 * @param error - Erro a ser verificado
 * @returns true se for erro de servidor
 */
export function isServerError(error: unknown): boolean {
  if (error instanceof Error && 'isAxiosError' in error) {
    const axiosError = error as AxiosError;
    const status = axiosError.response?.status;
    return status !== undefined && status >= 500 && status < 600;
  }
  return false;
}

