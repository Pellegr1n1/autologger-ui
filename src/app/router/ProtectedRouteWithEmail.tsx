import React from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from '../../features/auth';

interface ProtectedRouteWithEmailProps {
  children: React.ReactNode;
}

/**
 * HOC: Rota Protegida com Verificação de Email
 * 
 * Funcionalidade:
 * - Verificar se usuário está autenticado
 * - Verificar se email está verificado
 * - Redirecionar para pending page se não verificado
 * - Permitir acesso se verificado
 * 
 * Uso:
 * <Route element={<ProtectedRouteWithEmail />}>
 *   <Route path="/dashboard" element={<Dashboard />} />
 * </Route>
 */
export const ProtectedRouteWithEmail: React.FC<ProtectedRouteWithEmailProps> = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Se usuário não verificou email, redirecionar para página de pending
  if (user && !user.isEmailVerified) {
    return <Navigate to="/email-verification-pending" replace />;
  }

  return <>{children}</>;
};
