// Configuração da API
export const API_CONFIG = {
  // URL base da API - pode ser configurada via variável de ambiente
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001',
  
  // Endpoints específicos
  ENDPOINTS: {
    VEHICLES: '/vehicles',
    AUTH: '/auth',
    USERS: '/users',
  },
  
  // Função para construir URLs completas
  buildUrl: (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
  },
  
  // Função para construir URLs de arquivos estáticos
  buildStaticUrl: (filePath: string): string => {
    if (!filePath) return '';
    // Remove barra inicial se existir para evitar dupla barra
    const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
    return `${API_CONFIG.BASE_URL}/${cleanPath}`;
  }
};

// Configurações específicas para diferentes ambientes
export const ENV_CONFIG = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  isTest: import.meta.env.MODE === 'test',
};
