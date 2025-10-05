export interface User {
    id: string;
    name: string;
    email: string;
    isActive: boolean;
    authProvider: 'local' | 'google';
    createdAt: string;
    updatedAt: string;
}

export interface AuthUser {
    id: string;
    name: string;
    email: string;
    authProvider: 'local' | 'google';
}

export interface AuthResponse {
    access_token: string;
    user: AuthUser;
}

export interface RegisterData {
    name: string;
    email: string;
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
}

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}
