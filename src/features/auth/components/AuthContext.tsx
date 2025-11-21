import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, ReactNode } from 'react';
import { authService } from '../services/apiAuth';
import { AuthContextType, AuthUser, LoginData, RegisterData, User } from "../../../shared/types/user.types";
import { logger } from '../../../shared/utils/logger';

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
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const convertAuthUserToUser = (authUser: AuthUser): User => {
    return {
      ...authUser,
      isActive: true,
      isEmailVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const login = useCallback(async (data: LoginData | User): Promise<void> => {
    try {
      if ('id' in data && 'authProvider' in data && data.authProvider === 'google') {
        setUser(data);
        
        authService.getProfile()
          .then(fullUser => setUser(fullUser))
          .catch(err => {
            logger.warn('Não foi possível buscar perfil completo, usando dados do Google', err);
          });
        
        return;
      }

      const response = await authService.login(data as LoginData);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
        setUser(fullUser);
      } catch (profileError) {
        logger.warn('Perfil completo não disponível após login, usando dados básicos', profileError);
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const register = useCallback(async (data: RegisterData): Promise<User> => {
    try {
      const response = await authService.register(data);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
        setUser(fullUser);
        return fullUser;
      } catch (profileError) {
        logger.warn('Perfil completo não disponível após registro, usando dados básicos', profileError);
        return tempUser;
      }
    } catch (error) {
      throw error;
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>) => {
    try {
      const updatedUser = await authService.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      throw error;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
      throw error;
    }
  }, []);

  const deleteAccount = useCallback(async () => {
    try {
      await authService.deleteAccount();
      setUser(null);
    } catch (error) {
      throw error;
    }
  }, []);

  const value: AuthContextType = useMemo(() => ({
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    refreshUser,
    deleteAccount,
    isAuthenticated: !!user,
  }), [user, loading, login, register, logout, updateProfile, refreshUser, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};