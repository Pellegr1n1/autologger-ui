import { useState, useEffect } from "react";
import { Card, Typography, Button, Alert, Space, notification } from "antd";
import { MailOutlined, ReloadOutlined, LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth";
import { emailVerificationService } from "../../features/auth/services/emailVerificationService";
import styles from "./Auth.module.css";

const { Title, Text } = Typography;

const COOLDOWN_SECONDS = 60;
const POLLING_INTERVAL = 5000; // 5 segundos

export default function EmailVerificationPendingPage() {
  const [api, contextHolder] = notification.useNotification();
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedCooldown = localStorage.getItem('emailVerificationCooldown');
    if (savedCooldown) {
      const remaining = Math.max(0, parseInt(savedCooldown) - Math.floor(Date.now() / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }

    const pollInterval = setInterval(checkVerificationStatus, POLLING_INTERVAL);

    const countdownInterval = setInterval(() => {
      setCooldown((prev) => {
        if (prev > 0) {
          const newValue = prev - 1;
          if (newValue === 0) {
            localStorage.removeItem('emailVerificationCooldown');
          }
          return newValue;
        }
        return 0;
      });
    }, 1000);

    return () => {
      clearInterval(pollInterval);
      clearInterval(countdownInterval);
    };
  }, []);

  const checkVerificationStatus = async () => {
    try {
      await refreshUser();
      
      if (user?.isEmailVerified) {
        navigate('/vehicles');
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);

    try {
      await emailVerificationService.resendVerificationEmail();
      
      // Mostrar notificação de sucesso
      api.success({
        message: 'Email reenviado!',
        description: 'Verifique sua caixa de entrada.',
        placement: 'bottomRight',
        duration: 5,
      });
      
      setCooldown(COOLDOWN_SECONDS);
      const cooldownEnd = Date.now() / 1000 + COOLDOWN_SECONDS;
      localStorage.setItem('emailVerificationCooldown', cooldownEnd.toString());
      
    } catch (error: any) {
      console.error('Erro ao reenviar email:', error);
      
      // Mostrar notificação de erro
      api.error({
        message: 'Erro ao reenviar email',
        description: error.response?.data?.message || 'Tente novamente.',
        placement: 'bottomRight',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const maskEmail = (email: string) => {
    const [localPart, domain] = email.split('@');
    if (!domain) return email;
    
    const maskedLocal = localPart.length > 2 
      ? `${localPart[0]}${'*'.repeat(Math.min(3, localPart.length - 2))}${localPart[localPart.length - 1]}`
      : localPart;
    
    return `${maskedLocal}@${domain}`;
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {contextHolder}
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Card className={styles.authCard}>
            <div className={styles.authHeader}>
            <MailOutlined style={{ fontSize: 64, color: "#8b5cf6", marginBottom: 24 }} />
            <Title level={2} className={styles.authTitle}>
              Verifique seu email
            </Title>
            <Text className={styles.authSubtitle}>
              {user && (
                <>
                  Enviamos um email de verificação para{' '}
                  <strong>{maskEmail(user.email)}</strong>
                </>
              )}
            </Text>
            </div>

            <Alert
            message="Verificação pendente"
            description="Clique no link enviado por email para verificar sua conta. Verifique também a pasta de spam."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />

          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Button
              type="primary"
              icon={<ReloadOutlined />}
              onClick={handleResend}
              loading={loading}
              disabled={cooldown > 0 || loading}
              block
              size="large"
              className={styles.authButton}
            >
              {cooldown > 0 
                ? `Aguarde ${formatTime(cooldown)}` 
                : 'Reenviar email de verificação'
              }
            </Button>

            {cooldown > 0 && (
              <Text type="secondary" style={{ textAlign: 'center', display: 'block' }}>
                Você pode solicitar um novo email em {formatTime(cooldown)}
              </Text>
            )}

            <Button
              icon={<LogoutOutlined />}
              onClick={handleLogout}
              block
              size="large"
            >
              Sair e fazer login novamente
            </Button>
          </Space>

          <div className={styles.authFooter}>
            <Text type="secondary">
              Não recebeu o email? Verifique sua pasta de spam ou tente reenviar.
            </Text>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
