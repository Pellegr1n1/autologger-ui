import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User, LoginData, RegisterData, AuthUser } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (data: LoginData) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      if (apiService.isAuthenticated()) {
        const userData = await apiService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      apiService.removeToken();
    } finally {
      setLoading(false);
    }
  };

  // Função helper para converter AuthUser em User
  const convertAuthUserToUser = (authUser: AuthUser): User => {
    return {
      ...authUser,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const login = async (data: LoginData) => {
    try {
      const response = await apiService.login(data);
      // Converte AuthUser para User temporariamente
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);
      
      // Busca o perfil completo em background
      try {
        const fullUser = await apiService.getProfile();
        setUser(fullUser);
      } catch (profileError) {
        console.warn('Erro ao buscar perfil completo, usando dados básicos:', profileError);
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      const response = await apiService.register(data);
      // Converte AuthUser para User temporariamente
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);
      
      // Busca o perfil completo em background
      try {
        const fullUser = await apiService.getProfile();
        setUser(fullUser);
      } catch (profileError) {
        console.warn('Erro ao buscar perfil completo, usando dados básicos:', profileError);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await apiService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};