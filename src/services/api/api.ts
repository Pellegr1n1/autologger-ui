import axios, { AxiosInstance } from 'axios';

class ApiBase {
    public api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
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

    getApiInstance(): AxiosInstance {
        return this.api;
    }

    setBaseURL(url: string): void {
        this.api.defaults.baseURL = url;
    }

    setTimeout(timeout: number): void {
        this.api.defaults.timeout = timeout;
    }

    setHeaders(headers: Record<string, string>): void {
        Object.assign(this.api.defaults.headers.common, headers);
    }
}

export const apiBase = new ApiBase();