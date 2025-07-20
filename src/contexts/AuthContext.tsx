import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/api/apiAuth';
import { apiBase } from '../services/api/api';
import { AuthContextType, AuthUser, LoginData, RegisterData, User } from "../@types/user.types"

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
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      apiBase.removeToken();
    } finally {
      setLoading(false);
    }
  };

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
      const response = await authService.login(data);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
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
      const response = await authService.register(data);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
        setUser(fullUser);
      } catch (profileError) {
        console.warn('Erro ao buscar perfil completo, usando dados básicos:', profileError);
      }
    } catch (error) {
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
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