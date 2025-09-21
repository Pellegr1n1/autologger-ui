import { AxiosResponse } from 'axios';
import { apiBase } from '../../../shared/services/api';
import { AuthResponse, LoginData, RegisterData, UpdateProfileData, User } from "../../../shared/types/user.types";

class AuthService {
    // Métodos de autenticação
    async register(data: RegisterData): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await apiBase.api.post('/auth/register', data);
        apiBase.setToken(response.data.access_token);
        return response.data;
    }

    async login(data: LoginData): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await apiBase.api.post('/auth/login', data);
        apiBase.setToken(response.data.access_token);
        return response.data;
    }

    async logout(): Promise<void> {
        try {
            await apiBase.api.post('/auth/logout');
        } catch (error) {
            console.error('Erro ao fazer logout no servidor:', error);
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
        return apiBase.isAuthenticated();
    }

    getToken(): string | null {
        return apiBase.getToken();
    }

    async refreshToken(): Promise<AuthResponse> {
        const response: AxiosResponse<AuthResponse> = await apiBase.api.post('/auth/refresh');
        apiBase.setToken(response.data.access_token);
        return response.data;
    }
}

export const authService = new AuthService();