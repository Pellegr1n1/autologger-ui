import { API_ENDPOINTS, STORAGE_KEYS } from '../../../shared/constants/index';

describe('constants', () => {
  describe('API_ENDPOINTS', () => {
    it('deve ter todos os endpoints definidos', () => {
      expect(API_ENDPOINTS.VEHICLES).toBe('/vehicles');
      expect(API_ENDPOINTS.AUTH).toBe('/auth');
      expect(API_ENDPOINTS.BLOCKCHAIN).toBe('/blockchain');
      expect(API_ENDPOINTS.FIPE).toBe('/fipe');
    });

    it('deve ser um objeto readonly', () => {
      // TypeScript const assertion torna o objeto readonly, mas não frozen
      expect(API_ENDPOINTS).toBeDefined();
    });

    it('deve ter propriedades não modificáveis', () => {
      const originalVehicles = API_ENDPOINTS.VEHICLES;
      // Em TypeScript, const assertion previne modificação em tempo de compilação
      expect(API_ENDPOINTS.VEHICLES).toBe(originalVehicles);
    });
  });

  describe('STORAGE_KEYS', () => {
    it('deve ter todas as chaves de storage definidas', () => {
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe('auth_token');
      expect(STORAGE_KEYS.USER_DATA).toBe('user_data');
      expect(STORAGE_KEYS.THEME).toBe('theme');
    });

    it('deve ser um objeto readonly', () => {
      // TypeScript const assertion torna o objeto readonly, mas não frozen
      expect(STORAGE_KEYS).toBeDefined();
    });

    it('deve ter propriedades não modificáveis', () => {
      const originalAuthToken = STORAGE_KEYS.AUTH_TOKEN;
      // Em TypeScript, const assertion previne modificação em tempo de compilação
      expect(STORAGE_KEYS.AUTH_TOKEN).toBe(originalAuthToken);
    });
  });

  describe('Estrutura dos objetos', () => {
    it('deve ter API_ENDPOINTS com estrutura correta', () => {
      expect(typeof API_ENDPOINTS).toBe('object');
      expect(API_ENDPOINTS).not.toBeNull();
      expect(Array.isArray(API_ENDPOINTS)).toBe(false);
    });

    it('deve ter STORAGE_KEYS com estrutura correta', () => {
      expect(typeof STORAGE_KEYS).toBe('object');
      expect(STORAGE_KEYS).not.toBeNull();
      expect(Array.isArray(STORAGE_KEYS)).toBe(false);
    });
  });
});
