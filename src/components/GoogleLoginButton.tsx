import { useState } from 'react';
import { Button } from 'antd';
import { GoogleOutlined } from '@ant-design/icons';

interface GoogleLoginButtonProps {
  onSuccess?: (response: any) => void;
  onError: (error: any) => void;
  disabled?: boolean;
}

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({
  onSuccess: _onSuccess,
  onError,
  disabled = false,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = () => {
    // Support both Vite (import.meta.env) and Jest (process.env) environments
    let googleClientId: string | undefined;
    if (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_CLIENT_ID) {
      googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
    } else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
      // Vite environment
      googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    }
    
    if (!googleClientId) {
      onError(new Error('Google Client ID não configurado'));
      return;
    }

    try {
      setIsLoading(true);
      
      // Configurar parâmetros OAuth2
      const redirectUri = `http://localhost:3001/auth/google/callback`;
      const scope = 'openid email profile';
      const responseType = 'code';
      const accessType = 'offline';
      const prompt = 'select_account';
      
      // Construir URL de autorização OAuth2
      const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
      authUrl.searchParams.set('client_id', googleClientId);
      authUrl.searchParams.set('redirect_uri', redirectUri);
      authUrl.searchParams.set('response_type', responseType);
      authUrl.searchParams.set('scope', scope);
      authUrl.searchParams.set('access_type', accessType);
      authUrl.searchParams.set('prompt', prompt);
      authUrl.searchParams.set('state', 'google_oauth2');
      
      console.log('Opening OAuth2 popup with URL:', authUrl.toString());
      
      // Abrir popup para OAuth2
      const popup = window.open(
        authUrl.toString(),
        'google-oauth2',
        'width=500,height=600,scrollbars=yes,resizable=yes,status=yes,location=yes,toolbar=no,menubar=no'
      );
      
      if (!popup) {
        onError(new Error('Popup bloqueado pelo navegador. Permita popups para este site.'));
        setIsLoading(false);
        return;
      }
      
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsLoading(false);
        }
      }, 1000);
      
      setTimeout(() => {
        if (!popup.closed) {
          popup.close();
        }
        clearInterval(checkClosed);
        setIsLoading(false);
      }, 300000);
      
    } catch (error) {
      console.error('Error opening OAuth2 popup:', error);
      onError(error);
      setIsLoading(false);
    }
  };

  let googleClientId: string | undefined;
  if (typeof process !== 'undefined' && process.env?.VITE_GOOGLE_CLIENT_ID) {
    googleClientId = process.env.VITE_GOOGLE_CLIENT_ID;
  } else if (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GOOGLE_CLIENT_ID) {
    googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  }
  
  if (!googleClientId) {
    return (
      <Button
        disabled
        size="large"
        block
        style={{
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          border: '1px solid #d9d9d9',
          borderRadius: '8px',
          backgroundColor: '#f5f5f5',
          color: '#999999',
          fontSize: '16px',
          fontWeight: '500',
        }}
      >
        <GoogleOutlined style={{ fontSize: '20px' }} />
        Google não configurado
      </Button>
    );
  }

  return (
    <Button
      onClick={handleGoogleLogin}
      disabled={disabled || isLoading}
      loading={isLoading}
      size="large"
      block
      style={{
        height: '48px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        border: '1px solid #d9d9d9',
        borderRadius: '8px',
        backgroundColor: '#ffffff',
        color: '#262626',
        fontSize: '16px',
        fontWeight: '500',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        transition: 'all 0.3s ease',
      }}
      onMouseEnter={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.borderColor = '#1890ff';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(24, 144, 255, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled && !isLoading) {
          e.currentTarget.style.borderColor = '#d9d9d9';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
        }
      }}
    >
      <GoogleOutlined style={{ fontSize: '20px' }} />
      {isLoading ? 'Abrindo Google...' : 'Entrar com Google'}
    </Button>
  );
};
