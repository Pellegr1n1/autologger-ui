/**
 * Helper para acessar variáveis de ambiente
 * Em produção, o Vite substitui import.meta.env em build time
 */

/**
 * Obtém a URL base da API
 * Em produção, o Vite substitui import.meta.env.VITE_API_URL em build time
 */
export function getApiBaseUrl(): string {
  const viteApiUrl = import.meta.env.VITE_API_URL;
  const viteApiBaseUrl = import.meta.env.VITE_API_BASE_URL;
  
  return viteApiUrl || viteApiBaseUrl || 'http://localhost:3001';
}

/**
 * Obtém o Google Client ID
 * Em produção, o Vite substitui import.meta.env.VITE_GOOGLE_CLIENT_ID em build time
 */
export function getGoogleClientId(): string | undefined {
  return import.meta.env.VITE_GOOGLE_CLIENT_ID;
}

/**
 * Obtém uma variável de ambiente
 * Em produção, o Vite substitui import.meta.env em build time
 */
export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  return import.meta.env[key] || defaultValue;
}
