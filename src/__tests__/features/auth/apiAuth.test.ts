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
    getToken: jest.fn(),
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
      // Backend agora retorna apenas user, não access_token (token está em cookie httpOnly)
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: { user: mockAuthResponse.user },
      });

      const result = await authService.login(mockLoginData);

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/login', mockLoginData);
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
      expect(apiBase.setToken).not.toHaveBeenCalled();
      // Resultado agora tem access_token vazio, pois não retornamos mais o token no body
      expect(result.user).toEqual(mockAuthResponse.user);
      expect(result.access_token).toBe('');
    });

    it('deve lidar com erro no login', async () => {
      const error = new Error('Login failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.login(mockLoginData)).rejects.toThrow('Login failed');
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
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
      // Backend agora retorna apenas user, não access_token (token está em cookie httpOnly)
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: { user: mockAuthResponse.user },
      });

      const result = await authService.register(mockRegisterData);

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/register', mockRegisterData);
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
      expect(apiBase.setToken).not.toHaveBeenCalled();
      // Resultado agora tem access_token vazio, pois não retornamos mais o token no body
      expect(result.user).toEqual(mockAuthResponse.user);
      expect(result.access_token).toBe('');
    });

    it('deve lidar com erro no registro', async () => {
      const error = new Error('Registration failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.register(mockRegisterData)).rejects.toThrow('Registration failed');
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
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

    it('deve fazer logout mesmo com erro no servidor', async () => {
      jest.spyOn(console, 'error').mockImplementation(() => {});
      (apiBase.api.post as jest.Mock).mockRejectedValue(new Error('Server error'));
      
      await authService.logout();

      expect(apiBase.logout).toHaveBeenCalled();
      jest.restoreAllMocks();
    });
  });

  describe('deleteAccount', () => {
    it('deve deletar conta com sucesso', async () => {
      (apiBase.api.delete as jest.Mock).mockResolvedValue({
        data: { message: 'Conta deletada' }
      });
      
      const result = await authService.deleteAccount();

      expect(apiBase.api.delete).toHaveBeenCalledWith('/users/account');
      expect(apiBase.removeToken).toHaveBeenCalled();
      expect(result).toEqual({ message: 'Conta deletada' });
    });

    it('deve lidar com erro ao deletar conta', async () => {
      const error = new Error('Delete failed');
      (apiBase.api.delete as jest.Mock).mockRejectedValue(error);

      await expect(authService.deleteAccount()).rejects.toThrow('Delete failed');
    });
  });

  describe('validateToken', () => {
    it('deve validar token com sucesso', async () => {
      (apiBase.api.get as jest.Mock).mockResolvedValue({});
      
      const result = await authService.validateToken();

      expect(apiBase.api.get).toHaveBeenCalledWith('/auth/validate');
      expect(result).toBe(true);
    });

    it('deve retornar false e remover token quando inválido', async () => {
      (apiBase.api.get as jest.Mock).mockRejectedValue(new Error('Invalid token'));
      
      const result = await authService.validateToken();

      expect(apiBase.removeToken).toHaveBeenCalled();
      expect(result).toBe(false);
    });
  });

  describe('forgotPassword', () => {
    it('deve enviar email de recuperação com sucesso', async () => {
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: { message: 'Email enviado' }
      });
      
      const result = await authService.forgotPassword('test@example.com');

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/forgot-password', { email: 'test@example.com' });
      expect(result).toEqual({ message: 'Email enviado' });
    });

    it('deve lidar com erro ao enviar email de recuperação', async () => {
      const error = new Error('Email failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.forgotPassword('test@example.com')).rejects.toThrow('Email failed');
    });
  });

  describe('validateResetToken', () => {
    it('deve validar token de reset com sucesso', async () => {
      (apiBase.api.get as jest.Mock).mockResolvedValue({
        data: { valid: true }
      });
      
      const result = await authService.validateResetToken('test-token');

      expect(apiBase.api.get).toHaveBeenCalledWith('/auth/validate-reset-token/test-token');
      expect(result).toBe(true);
    });

    it('deve retornar false quando token é inválido', async () => {
      (apiBase.api.get as jest.Mock).mockResolvedValue({
        data: { valid: false }
      });
      
      const result = await authService.validateResetToken('invalid-token');

      expect(apiBase.api.get).toHaveBeenCalledWith('/auth/validate-reset-token/invalid-token');
      expect(result).toBe(false);
    });

    it('deve retornar false quando ocorre erro na requisição', async () => {
      (apiBase.api.get as jest.Mock).mockRejectedValue(new Error('Token validation failed'));
      
      const result = await authService.validateResetToken('test-token');

      expect(apiBase.api.get).toHaveBeenCalledWith('/auth/validate-reset-token/test-token');
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('deve redefinir senha com sucesso', async () => {
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: { message: 'Senha redefinida' }
      });
      
      const result = await authService.resetPassword({
        token: 'token123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'token123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      expect(result).toEqual({ message: 'Senha redefinida' });
    });

    it('deve lidar com erro ao redefinir senha', async () => {
      const error = new Error('Reset failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.resetPassword({
        token: 'token123',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      })).rejects.toThrow('Reset failed');
    });
  });

  describe('changePassword', () => {
    it('deve alterar senha com sucesso', async () => {
      (apiBase.api.put as jest.Mock).mockResolvedValue({
        data: { message: 'Senha alterada' }
      });
      
      const result = await authService.changePassword({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });

      expect(apiBase.api.put).toHaveBeenCalledWith('/auth/change-password', {
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      });
      expect(result).toEqual({ message: 'Senha alterada' });
    });

    it('deve lidar com erro ao alterar senha', async () => {
      const error = new Error('Change password failed');
      (apiBase.api.put as jest.Mock).mockRejectedValue(error);

      await expect(authService.changePassword({
        currentPassword: 'oldpass',
        newPassword: 'newpass123',
        confirmPassword: 'newpass123'
      })).rejects.toThrow('Change password failed');
    });
  });

  describe('getToken', () => {
    it('deve retornar token quando existe', () => {
      (apiBase.getToken as jest.Mock).mockReturnValue('token123');

      expect(authService.getToken()).toBe('token123');
      expect(apiBase.getToken).toHaveBeenCalled();
    });

    it('deve retornar null quando não há token', () => {
      (apiBase.getToken as jest.Mock).mockReturnValue(null);

      expect(authService.getToken()).toBe(null);
    });
  });

  describe('refreshToken', () => {
    it('deve atualizar token com sucesso', async () => {
      // Backend agora retorna apenas user, não access_token (token está em cookie httpOnly)
      const newAuthResponse = { ...mockAuthResponse, access_token: 'new_token' };
      (apiBase.api.post as jest.Mock).mockResolvedValue({
        data: { user: newAuthResponse.user }
      });
      
      const result = await authService.refreshToken();

      expect(apiBase.api.post).toHaveBeenCalledWith('/auth/refresh');
      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
      expect(apiBase.setToken).not.toHaveBeenCalled();
      // Resultado agora tem access_token vazio, pois não retornamos mais o token no body
      expect(result.user).toEqual(newAuthResponse.user);
      expect(result.access_token).toBe('');
    });

    it('deve lidar com erro ao atualizar token', async () => {
      const error = new Error('Refresh failed');
      (apiBase.api.post as jest.Mock).mockRejectedValue(error);

      await expect(authService.refreshToken()).rejects.toThrow('Refresh failed');
    });
  });

  describe('isAuthenticated', () => {
    it('deve retornar true quando autenticado', () => {
      // isAuthenticated sempre retorna true, pois não podemos verificar cookies httpOnly
      // A validação real é feita pelo backend nas requisições
      expect(authService.isAuthenticated()).toBe(true);
    });

    it('deve sempre retornar true (validação feita pelo backend)', () => {
      // isAuthenticated sempre retorna true, pois não podemos verificar cookies httpOnly
      // A validação real é feita pelo backend nas requisições
      expect(authService.isAuthenticated()).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('deve fazer fluxo completo de login e obtenção de perfil', async () => {
      // Mock do login - backend agora retorna apenas user
      (apiBase.api.post as jest.Mock).mockResolvedValueOnce({
        data: { user: mockAuthResponse.user },
      });

      // Mock do getProfile
      (apiBase.api.get as jest.Mock).mockResolvedValueOnce({
        data: mockUser,
      });

      // Executar login
      const loginResult = await authService.login(mockLoginData);
      expect(loginResult.user).toEqual(mockAuthResponse.user);
      expect(loginResult.access_token).toBe(''); // Token não é mais retornado no body

      // Executar getProfile
      const profileResult = await authService.getProfile();
      expect(profileResult).toEqual(mockUser);

      // setToken não é mais chamado, pois o token é gerenciado pelo backend via cookie httpOnly
      expect(apiBase.setToken).not.toHaveBeenCalled();
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
