import { AxiosResponse } from 'axios';
import { apiBase } from '../../../shared/services/api';
import { AuthResponse, LoginData, RegisterData, UpdateProfileData, User } from "../../../shared/types/user.types";
import { logger } from '../../../shared/utils/logger';

class AuthService {
    // Métodos de autenticação
    async register(data: RegisterData): Promise<AuthResponse> {
        const response: AxiosResponse<{ user: any }> = await apiBase.api.post('/auth/register', data);
        // Token é gerenciado automaticamente via cookie httpOnly
        // Retornamos apenas os dados do usuário
        return {
            user: response.data.user,
            access_token: '', // Não retornamos mais o token no body
        };
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response: AxiosResponse<{ user: any }> = await apiBase.api.post('/auth/login', data);
        // Token é gerenciado automaticamente via cookie httpOnly
        // Retornamos apenas os dados do usuário
        return {
            user: response.data.user,
            access_token: '', // Não retornamos mais o token no body
        };
    }

    async logout(): Promise<void> {
        try {
            await apiBase.api.post('/auth/logout');
        } catch (error) {
            logger.error('Erro ao fazer logout no servidor', error);
        } finally {
            apiBase.logout();
        }
    }

    // Métodos de usuário
    async getProfile(): Promise<User> {
        const response: AxiosResponse<User> = await apiBase.api.get('/users/profile');
        return response.data;
    }

    async updateProfile(data: UpdateProfileData): Promise<User> {
        const response: AxiosResponse<User> = await apiBase.api.put('/users/profile', data);
        return response.data;
    }

    async deleteAccount(): Promise<{ message: string }> {
        const response = await apiBase.api.delete('/users/account');
        apiBase.removeToken();
        return response.data;
    }

    async validateToken(): Promise<boolean> {
        try {
            await apiBase.api.get('/auth/validate');
            return true;
        } catch (error) {
            apiBase.removeToken();
            return false;
        }
    }

    async forgotPassword(email: string): Promise<{ message: string }> {
        const response = await apiBase.api.post('/auth/forgot-password', { email });
        return response.data;
    }

    async resetPassword(data: { token: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
        const response = await apiBase.api.post('/auth/reset-password', data);
        return response.data;
    }

    async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<{ message: string }> {
        const response = await apiBase.api.put('/auth/change-password', data);
        return response.data;
    }

    isAuthenticated(): boolean {
        // Não podemos verificar diretamente se o cookie httpOnly existe
        // A verificação real é feita nas requisições ao backend
        // Retornamos true por padrão e deixamos o backend validar
        return true;
    }

    getToken(): string | null {
        return apiBase.getToken();
    }

    async refreshToken(): Promise<AuthResponse> {
        const response: AxiosResponse<{ user: any }> = await apiBase.api.post('/auth/refresh');
        // Token é gerenciado automaticamente via cookie httpOnly
        return {
            user: response.data.user,
            access_token: '', // Não retornamos mais o token no body
        };
    }
}

export const authService = new AuthService();