import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Spin, Alert, Card } from 'antd';
import { useAuth } from '../../features/auth';
import styles from './Auth.module.css';

export default function CallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        

        if (error) {
          throw new Error(`Erro do Google: ${error}`);
        }

        if (!token || !userParam) {
          throw new Error('Token ou dados do usuário não recebidos');
        }

        // Parse do usuário
        const userData = JSON.parse(decodeURIComponent(userParam));

        // Salvar token no localStorage e no apiBase
        localStorage.setItem('autologger_token', token);
        
        // Importar apiBase para definir o token
        const { apiBase } = await import('../../shared/services/api');
        apiBase.setToken(token);
        
        // Verify token is properly set
        const storedToken = apiBase.getToken();

        // Fazer login do usuário
        const tempUser = {
          ...userData,
          isActive: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await login(tempUser as any);

        // Small delay to ensure token is properly set
        await new Promise(resolve => setTimeout(resolve, 100));

        // Fechar popup e redirecionar
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: tempUser,
            token: token
          }, window.location.origin);
          window.close();
        } else {
          navigate('/vehicles');
        }

      } catch (err: any) {
        setError(err.message || 'Erro ao processar autenticação');
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: err.message || 'Erro ao processar autenticação'
          }, window.location.origin);
          window.close();
        } else {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [searchParams, navigate, login]);

  if (loading) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Card className={styles.authCard}>
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Spin size="large" />
              <p style={{ marginTop: '20px', fontSize: '16px' }}>
                Processando autenticação...
              </p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Card className={styles.authCard}>
            <Alert
              message="Erro na Autenticação"
              description={error}
              type="error"
              showIcon
              style={{ marginBottom: '20px' }}
            />
            <button
              onClick={() => navigate('/login')}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#1890ff',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Voltar ao Login
            </button>
          </Card>
        </div>
      </div>
    );
  }

  return null;
}