import axios, { AxiosInstance } from 'axios';

// Configuração da API
const API_BASE_URL = 'http://localhost:3001';

class ApiBase {
    public api: AxiosInstance;

    constructor() {
        this.api = axios.create({
            baseURL: API_BASE_URL,
            timeout: 30000,
            headers: {
                'Content-Type': 'application/json',
            },
            // Configurar para enviar cookies automaticamente (httpOnly cookies)
            withCredentials: true,
        });

        this.setupInterceptors();
    }

    private setupInterceptors(): void {
        // Não é mais necessário adicionar token manualmente no header
        // O cookie httpOnly é enviado automaticamente pelo navegador
        this.api.interceptors.request.use(
            (config) => {
                // Cookies são enviados automaticamente pelo navegador
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        this.api.interceptors.response.use(
            (response) => response,
            (error) => {
                // Não redireciona automaticamente em caso de erro 401
                // Deixa o erro ser tratado pela página que fez a requisição
                if (error.response?.status === 401) {
                    // O cookie será removido pelo backend no logout
                    // Não precisamos fazer nada aqui, pois não temos acesso ao cookie httpOnly
                }
                return Promise.reject(error);
            }
        );
    }

    // Métodos mantidos para compatibilidade, mas não fazem nada
    // O token agora está em um cookie httpOnly gerenciado pelo backend
    setToken(_token: string): void {
        // Token é gerenciado pelo backend via cookie httpOnly
        // Não precisamos armazenar no frontend
    }

    getToken(): string | null {
        // Não podemos acessar cookies httpOnly do JavaScript
        // O token é gerenciado automaticamente pelo navegador
        return null;
    }

    removeToken(): void {
        // O cookie será removido pelo backend no endpoint de logout
        // Não podemos remover cookies httpOnly do JavaScript
    }

    isAuthenticated(): boolean {
        // Não podemos verificar diretamente se o cookie existe
        // A verificação será feita nas requisições ao backend
        // Retornamos true por padrão e deixamos o backend validar
        return true;
    }

    logout(navigate?: (path: string) => void): void {
        this.removeToken();
        if (navigate) {
            navigate('/login');
        } else if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
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