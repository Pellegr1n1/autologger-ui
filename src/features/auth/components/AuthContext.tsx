import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
      // Tentar buscar o perfil do usuário
      // Se o cookie httpOnly existir e for válido, o backend retornará o perfil
      // Se não existir ou for inválido, o backend retornará 401
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      // Se houver erro (401, etc), o usuário não está autenticado
      // O cookie será removido pelo backend se necessário
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

  const login = async (data: LoginData | User): Promise<void> => {
    try {
      if ('id' in data && 'authProvider' in data && data.authProvider === 'google') {
        const user = data as User;
        setUser(user);
        
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
      } catch (_profileError) {
        // Mantém tempUser já setado
      }
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: RegisterData): Promise<User> => {
    try {
      const response = await authService.register(data);
      const tempUser = convertAuthUserToUser(response.user);
      setUser(tempUser);

      try {
        const fullUser = await authService.getProfile();
        setUser(fullUser);
        return fullUser;
      } catch (_profileError) {
        return tempUser;
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
      const userData = await authService.getProfile();
      setUser(userData);
    } catch (error) {
      setUser(null);
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