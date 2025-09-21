import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../features/auth';
import { Spin } from 'antd';

interface ProtectedRouteProps {
  component: React.FC;
  allowedRoles?: number[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  component: Component, 
  allowedRoles = [] 
}) => {
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

  // Se há roles específicos e o usuário não tem permissão
  if (allowedRoles.length > 0 && user) {
    // Aqui você pode implementar lógica de roles se necessário
    // Por enquanto, vamos permitir acesso para usuários autenticados
  }

  return <Component />;
};

export default ProtectedRoute;