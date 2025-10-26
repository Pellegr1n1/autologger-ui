import { googleAuthService, GoogleAuthResponse } from '../../../../features/auth/services/googleAuthService';
import { apiBase } from '../../../../shared/services/api';

// Mock do apiBase
jest.mock('../../../../shared/services/api', () => ({
  apiBase: {
    post: jest.fn()
  }
}));

const mockedApiBase = apiBase as jest.Mocked<typeof apiBase>;

describe('GoogleAuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateWithGoogle', () => {
    it('deve autenticar com sucesso usando credential', async () => {
      const mockResponse: GoogleAuthResponse = {
        access_token: 'mock-token-123',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com',
          avatar: 'https://example.com/avatar.jpg',
          authProvider: 'google'
        }
      };

      mockedApiBase.post.mockResolvedValue({
        data: mockResponse
      });

      const result = await googleAuthService.authenticateWithGoogle('mock-credential');

      expect(mockedApiBase.post).toHaveBeenCalledWith('/auth/google/authenticate', {
        credential: 'mock-credential',
        code: undefined
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve autenticar com sucesso usando credential e code', async () => {
      const mockResponse: GoogleAuthResponse = {
        access_token: 'mock-token-456',
        user: {
          id: '2',
          name: 'Maria Santos',
          email: 'maria@test.com',
          authProvider: 'google'
        }
      };

      mockedApiBase.post.mockResolvedValue({
        data: mockResponse
      });

      const result = await googleAuthService.authenticateWithGoogle('mock-credential', 'mock-code');

      expect(mockedApiBase.post).toHaveBeenCalledWith('/auth/google/authenticate', {
        credential: 'mock-credential',
        code: 'mock-code'
      });
      expect(result).toEqual(mockResponse);
    });

    it('deve lançar erro quando a API retorna erro', async () => {
      const mockError = {
        response: {
          data: {
            message: 'Credencial inválida'
          }
        }
      };

      mockedApiBase.post.mockRejectedValue(mockError);

      await expect(
        googleAuthService.authenticateWithGoogle('invalid-credential')
      ).rejects.toThrow('Credencial inválida');
    });

    it('deve lançar erro genérico quando não há mensagem específica', async () => {
      const mockError = {
        response: {
          data: {}
        }
      };

      mockedApiBase.post.mockRejectedValue(mockError);

      await expect(
        googleAuthService.authenticateWithGoogle('invalid-credential')
      ).rejects.toThrow('Erro na autenticação com Google');
    });

    it('deve lançar erro genérico quando não há response', async () => {
      const mockError = new Error('Network error');

      mockedApiBase.post.mockRejectedValue(mockError);

      await expect(
        googleAuthService.authenticateWithGoogle('invalid-credential')
      ).rejects.toThrow('Erro na autenticação com Google');
    });

    it('deve chamar a API com parâmetros corretos', async () => {
      const mockResponse: GoogleAuthResponse = {
        access_token: 'token',
        user: {
          id: '1',
          name: 'Test',
          email: 'test@test.com',
          authProvider: 'google'
        }
      };

      mockedApiBase.post.mockResolvedValue({
        data: mockResponse
      });

      await googleAuthService.authenticateWithGoogle('test-credential', 'test-code');

      expect(mockedApiBase.post).toHaveBeenCalledTimes(1);
      expect(mockedApiBase.post).toHaveBeenCalledWith('/auth/google/authenticate', {
        credential: 'test-credential',
        code: 'test-code'
      });
    });
  });

  describe('GoogleAuthResponse interface', () => {
    it('deve permitir criar resposta com todos os campos', () => {
      const response: GoogleAuthResponse = {
        access_token: 'token123',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com',
          avatar: 'https://example.com/avatar.jpg',
          authProvider: 'google'
        }
      };

      expect(response.access_token).toBe('token123');
      expect(response.user.id).toBe('1');
      expect(response.user.name).toBe('João Silva');
      expect(response.user.email).toBe('joao@test.com');
      expect(response.user.avatar).toBe('https://example.com/avatar.jpg');
      expect(response.user.authProvider).toBe('google');
    });

    it('deve permitir criar resposta sem avatar', () => {
      const response: GoogleAuthResponse = {
        access_token: 'token123',
        user: {
          id: '1',
          name: 'João Silva',
          email: 'joao@test.com',
          authProvider: 'google'
        }
      };

      expect(response.user.avatar).toBeUndefined();
    });
  });
});
