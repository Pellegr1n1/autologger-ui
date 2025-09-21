import { authService } from '../../../features/auth/services/apiAuth';
import { apiBase } from '../../../shared/services/api';
import { mockLoginData, mockRegisterData, mockAuthResponse, mockUser } from '../../utils/test-utils';

// Mock do apiBase
jest.mock('../../../shared/services/api', () => ({
  apiBase: {
    api: {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
    setToken: jest.fn(),
    removeToken: jest.fn(),
    isAuthenticated: jest.fn(),
    logout: jest.fn(),
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('deve fazer login com sucesso', async () => {
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await authService.login(mockLoginData);

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/login', mockLoginData);
      expect(apiBase.setToken).toHaveBeenCalledWith(mockAuthResponse.access_token);
      expect(result).toEqual(mockAuthResponse);
    });

    it('deve lidar com erro no login', async () => {
      const error = new Error('Login failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.login(mockLoginData)).rejects.toThrow('Login failed');
      expect(apiBase.setToken).not.toHaveBeenCalled();
    });

    it('deve lidar com erro de validação', async () => {
      const validationError = {
        response: {
          status: 400,
          data: {
            message: 'Email ou senha inválidos',
          },
        },
      };
      (apiBase.api.post as jest.Mock).mockRejectedValue(validationError);

      await expect(authService.login(mockLoginData)).rejects.toEqual(validationError);
    });
  });

  describe('register', () => {
    it('deve fazer registro com sucesso', async () => {
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: mockAuthResponse,
      });

      const result = await authService.register(mockRegisterData);

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/register', mockRegisterData);
      expect(apiBase.setToken).toHaveBeenCalledWith(mockAuthResponse.access_token);
      expect(result).toEqual(mockAuthResponse);
    });

    it('deve lidar com erro no registro', async () => {
      const error = new Error('Registration failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.register(mockRegisterData)).rejects.toThrow('Registration failed');
      expect(apiBase.setToken).not.toHaveBeenCalled();
    });

    it('deve lidar com erro de email já existente', async () => {
      const emailExistsError = {
        response: {
          status: 409,
          data: {
            message: 'Email já está em uso',
          },
        },
      };
      (apiBase.api.post as jest.Mock).mockRejectedValue(emailExistsError);

      await expect(authService.register(mockRegisterData)).rejects.toEqual(emailExistsError);
    });
  });

  describe('getProfile', () => {
    it('deve obter perfil do usuário com sucesso', async () => {
      (apiBase.api.get as jest.Mock).mockResolvedValue({
        data: mockUser,
      });

      const result = await authService.getProfile();

      expect(apiBase.api.get).toHaveBeenCalledWith('/users/profile');
      expect(result).toEqual(mockUser);
    });

    it('deve lidar com erro ao obter perfil', async () => {
      const error = new Error('Profile fetch failed');
      (apiBase.api.get as jest.Mock).mockRejectedValue(error);

      await expect(authService.getProfile()).rejects.toThrow('Profile fetch failed');
    });

    it('deve lidar com erro 401 ao obter perfil', async () => {
      const unauthorizedError = {
        response: {
          status: 401,
          data: {
            message: 'Token inválido',
          },
        },
      };
      (apiBase.api.get as jest.Mock).mockRejectedValue(unauthorizedError);

      await expect(authService.getProfile()).rejects.toEqual(unauthorizedError);
    });
  });

  describe('updateProfile', () => {
    it('deve atualizar perfil com sucesso', async () => {
      const updateData = { name: 'Novo Nome' };
      const updatedUser = { ...mockUser, ...updateData };
      
      (apiBase.api.put as jest.Mock).mockResolvedValue({
        data: updatedUser,
      });

      const result = await authService.updateProfile(updateData);

      expect(apiBase.api.put).toHaveBeenCalledWith('/users/profile', updateData);
      expect(result).toEqual(updatedUser);
    });

    it('deve lidar com erro ao atualizar perfil', async () => {
      const updateData = { name: 'Novo Nome' };
      const error = new Error('Update failed');
      
      (apiBase.api.put as jest.Mock).mockRejectedValue(error);

      await expect(authService.updateProfile(updateData)).rejects.toThrow('Update failed');
    });

    it('deve validar dados de atualização', async () => {
      const invalidData = { email: 'invalid-email' };
      
      (apiBase.api.put as jest.Mock).mockRejectedValue({
        response: {
          status: 400,
          data: {
            message: 'Email inválido',
          },
        },
      });

      await expect(authService.updateProfile(invalidData)).rejects.toBeDefined();
    });
  });

  describe('logout', () => {
    it('deve fazer logout com sucesso', async () => {
      (apiBase.api.post as jest.Mock).mockResolvedValue({});
      
      await authService.logout();

      expect(apiBase.logout).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando autenticado', () => {
      (apiBase.isAuthenticated as jest.Mock).mockReturnValue(true);

      expect(authService.isAuthenticated()).toBe(true);
    });

    it('deve retornar false quando não autenticado', () => {
      (apiBase.isAuthenticated as jest.Mock).mockReturnValue(false);

      expect(authService.isAuthenticated()).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('deve fazer fluxo completo de login e obtenção de perfil', async () => {
      // Mock do login
      (apiBase.api.post as jest.Mock).mockResolvedValueOnce({
        data: mockAuthResponse,
      });

      // Mock do getProfile
      (apiBase.api.get as jest.Mock).mockResolvedValueOnce({
        data: mockUser,
      });

      // Executar login
      const loginResult = await authService.login(mockLoginData);
      expect(loginResult).toEqual(mockAuthResponse);

      // Executar getProfile
      const profileResult = await authService.getProfile();
      expect(profileResult).toEqual(mockUser);

      // Verificar se token foi definido
      expect(apiBase.setToken).toHaveBeenCalledWith(mockAuthResponse.access_token);
    });

    it('deve lidar com erro de rede', async () => {
      const networkError = new Error('Network Error');
      (apiBase.api.post as jest.Mock).mockRejectedValue(networkError);

      await expect(authService.login(mockLoginData)).rejects.toThrow('Network Error');
    });

    it('deve lidar com timeout', async () => {
      const timeoutError = new Error('timeout of 10000ms exceeded');
      (apiBase.api.post as jest.Mock).mockRejectedValue(timeoutError);

      await expect(authService.login(mockLoginData)).rejects.toThrow('timeout of 10000ms exceeded');
    });
  });
});
