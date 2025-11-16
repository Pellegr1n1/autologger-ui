import { useState, useEffect } from "react";
import { Result, Button, Typography, Spin } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router-dom";
import { emailVerificationService } from "../../features/auth/services/emailVerificationService";
import { useAuth } from "../../features/auth";
import styles from "./Auth.module.css";

const { Text } = Typography;
const antIcon = <LoadingOutlined style={{ fontSize: 48 }} spin />;

/**
 * Página: Verificando Email
 * Rota: /verify-email/:token
 * 
 * Funcionalidades:
 * - Extrair token da URL
 * - Fazer verificação automaticamente ao carregar
 * - Mostrar loading durante verificação
 * - Sucesso: Mensagem + redirecionamento (3s)
 * - Erro: Mensagem de erro específica
 * - Link para reenviar se token expirado
 * - Link para login
 * 
 * Estados:
 * - verifying: Mostra spinner
 * - success: Mostra sucesso + redirecionamento
 * - error: Mostra erro + opções
 */
export default function VerifyEmailPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    verifyEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verifyEmail = async () => {
    if (!token) {
      setStatus('error');
      setErrorMessage('Token inválido ou não fornecido');
      return;
    }

    try {
      await emailVerificationService.verifyEmail(token);
      
      // Atualizar dados do usuário no contexto
      await refreshUser();
      
      setStatus('success');
      
      // Redirecionar para dashboard após 3 segundos
      setTimeout(() => {
        navigate('/vehicles');
      }, 3000);
      
    } catch (error: any) {
      console.error('Erro ao verificar email:', error);
      
      let message = 'Erro ao verificar email. Tente novamente.';
      
      if (error.response?.status === 404) {
        message = 'Link de verificação inválido ou expirado. Solicite um novo link.';
      } else if (error.response?.status === 400) {
        message = 'Este link já foi utilizado ou é inválido.';
      } else if (error.response?.data?.message) {
        message = error.response.data.message;
      } else if (error.message) {
        message = error.message;
      }
      
      setErrorMessage(message);
      setStatus('error');
    }
  };

  if (status === 'verifying') {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '400px'
          }}>
            <Spin indicator={antIcon} />
            <Text style={{ marginTop: 24, fontSize: 16 }}>
              Verificando seu email...
            </Text>
          </div>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Result
            icon={<CheckCircleOutlined style={{ fontSize: 72, color: "#52c41a" }} />}
            title="Email verificado com sucesso!"
            subTitle="Você será redirecionado para a área de trabalho em instantes."
            extra={[
              <Button type="primary" key="redirect" onClick={() => navigate('/vehicles')}>
                Ir para Dashboard
              </Button>,
            ]}
          />
        </div>
      </div>
    );
  }

  // Status: error
  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Result
          icon={<CloseCircleOutlined style={{ fontSize: 72, color: "#ff4d4f" }} />}
          title="Falha na verificação"
          subTitle={errorMessage}
          extra={[
            <Button type="primary" key="resend" onClick={() => navigate('/email-verification-pending')}>
              Reenviar email
            </Button>,
            <Button key="login" onClick={() => navigate('/login')}>
              Voltar ao login
            </Button>,
          ]}
        />
      </div>
    </div>
  );
}
