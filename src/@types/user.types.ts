export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

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

export interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (data: LoginData) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    updateProfile: (data: Partial<User>) => Promise<void>;
    isAuthenticated: boolean;
}
