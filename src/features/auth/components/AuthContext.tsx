import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/apiAuth';
import { apiBase } from '../../../shared/services/api';
import { AuthContextType, AuthUser, LoginData, RegisterData, User } from "../../../shared/types/user.types"

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
      } else {
      }
    } catch (error) {
      apiBase.removeToken();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const convertAuthUserToUser = (authUser: AuthUser): User => {
    return {
      ...authUser,
      isActive: true,
      isEmailVerified: false, // Default value, will be updated by backend
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const login = async (data: LoginData | User | any) => {
    try {
      // Se é um usuário do Google (já autenticado), apenas define o token e o usuário
      if ('id' in data && 'authProvider' in data) {
        setUser(data as User);
        return;
      }

      // Login tradicional com email/senha
      const response = await authService.login(data as LoginData);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
        setUser(fullUser);
      } catch (profileError) {
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

  const refreshUser = async () => {
    try {
      if (authService.isAuthenticated()) {
        const userData = await authService.getProfile();
        setUser(userData);
      }
    } catch (error) {
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      await authService.deleteAccount();
      setUser(null);
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
    refreshUser,
    deleteAccount,
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