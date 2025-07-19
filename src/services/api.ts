import axios, { AxiosInstance, AxiosResponse } from 'axios';

// Tipos para as respostas da API
export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Tipo simplificado para resposta de autenticação
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AuthResponse {
  access_token: string;
  user: AuthUser;
}

export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  confirmPassword: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  name?: string;
  email?: string;
  phone?: string;
}

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Interceptor para adicionar o token automaticamente
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para tratar respostas e erros
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.removeToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Métodos de autenticação
  async register(data: RegisterData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/register', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response: AxiosResponse<AuthResponse> = await this.api.post('/auth/login', data);
    this.setToken(response.data.access_token);
    return response.data;
  }

  // Métodos de usuário
  async getProfile(): Promise<User> {
    const response: AxiosResponse<User> = await this.api.get('/users/profile');
    return response.data;
  }

  async updateProfile(data: UpdateProfileData): Promise<User> {
    const response: AxiosResponse<User> = await this.api.put('/users/profile', data);
    return response.data;
  }

  async deleteAccount(): Promise<{ message: string }> {
    const response = await this.api.delete('/users/account');
    this.removeToken();
    return response.data;
  }

  // Métodos de token
  setToken(token: string): void {
    localStorage.setItem('autologger_token', token);
  }

  getToken(): string | null {
    return localStorage.getItem('autologger_token');
  }

  removeToken(): void {
    localStorage.removeItem('autologger_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    this.removeToken();
    window.location.href = '/login';
  }
}

export const apiService = new ApiService();