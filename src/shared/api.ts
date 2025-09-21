import axios, { AxiosInstance } from 'axios';

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

class ApiBase {
    public api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors() {
        // Request interceptor
        this.api.interceptors.request.use(
            (config) => {
                const token = localStorage.getItem('token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Response interceptor
        this.api.interceptors.response.use(
            (response) => {
                return response;
            },
            (error) => {
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Métodos de conveniência
    async get<T>(url: string, config?: any): Promise<T> {
        const response = await this.api.get(url, config);
        return response.data;
    }

    async post<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.api.post(url, data, config);
        return response.data;
    }

    async put<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.api.put(url, data, config);
        return response.data;
    }

    async delete<T>(url: string, config?: any): Promise<T> {
        const response = await this.api.delete(url, config);
        return response.data;
    }

    async patch<T>(url: string, data?: any, config?: any): Promise<T> {
        const response = await this.api.patch(url, data, config);
        return response.data;
    }
}

export const apiBase = new ApiBase();
export default apiBase;
