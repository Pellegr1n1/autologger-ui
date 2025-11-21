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
        const userParam = searchParams.get('user');
        const error = searchParams.get('error');

        

        if (error) {
          throw new Error(`Erro do Google: ${error}`);
        }

        if (!userParam) {
          throw new Error('Dados do usuário não recebidos');
        }

        const userData = JSON.parse(decodeURIComponent(userParam));

        await new Promise(resolve => setTimeout(resolve, 100));
        
        const loggedInUser = {
          ...userData,
          authProvider: 'google',
          isActive: true,
        };

        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_SUCCESS',
            user: loggedInUser,
          }, window.location.origin);
          window.close();
        } else {
          await login(loggedInUser);
          navigate('/vehicles');
        }

      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'Erro ao processar autenticação';
        setError(errorMessage);
        
        if (window.opener) {
          window.opener.postMessage({
            type: 'GOOGLE_AUTH_ERROR',
            error: errorMessage
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