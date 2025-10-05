import { apiBase } from '../../../shared/services/api';

export interface GoogleAuthResponse {
  access_token: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    authProvider: 'local' | 'google';
  };
}

class GoogleAuthService {
  async authenticateWithGoogle(credential: string, code?: string): Promise<GoogleAuthResponse> {
    try {
      const response = await apiBase.post('/auth/google/authenticate', {
        credential,
        code,
      });
      
      return response.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Erro na autenticação com Google');
    }
  }
}

export const googleAuthService = new GoogleAuthService();
