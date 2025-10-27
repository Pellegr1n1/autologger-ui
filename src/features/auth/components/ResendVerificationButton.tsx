import { useState, useEffect } from "react";
import { Button, Space, Typography } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { emailVerificationService } from "../services/emailVerificationService";

const { Text } = Typography;

const COOLDOWN_SECONDS = 60;

interface ResendVerificationButtonProps {
  variant?: 'link' | 'button';
  onSuccess?: () => void;
}

/**
 * Botão: Reenviar Email de Verificação
 * 
 * Funcionalidades:
 * - Cooldown de 60 segundos entre envios
 * - Mostrar contador durante cooldown
 * - Loading state durante envio
 * - Toast de sucesso/erro
 * - Persistir cooldown no localStorage
 * 
 * Props:
 * - variant?: 'link' | 'button'
 * - onSuccess?: () => void
 */
export const ResendVerificationButton: React.FC<ResendVerificationButtonProps> = ({ 
  variant = 'button',
  onSuccess 
}) => {
  const [cooldown, setCooldown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Restaurar cooldown do localStorage
    const savedCooldown = localStorage.getItem('emailVerificationCooldown');
    if (savedCooldown) {
      const remaining = Math.max(0, parseInt(savedCooldown) - Math.floor(Date.now() / 1000));
      if (remaining > 0) {
        setCooldown(remaining);
      }
    }

    // Iniciar countdown
    const interval = setInterval(() => {
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

    return () => clearInterval(interval);
  }, []);

  const handleClick = async () => {
    if (cooldown > 0 || loading) return;

    setLoading(true);

    try {
      await emailVerificationService.resendVerificationEmail();
      
      // Iniciar cooldown
      setCooldown(COOLDOWN_SECONDS);
      const cooldownEnd = Date.now() / 1000 + COOLDOWN_SECONDS;
      localStorage.setItem('emailVerificationCooldown', cooldownEnd.toString());
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (variant === 'link') {
    return (
      <Space>
        <Button 
          type="link" 
          onClick={handleClick}
          loading={loading}
          disabled={cooldown > 0 || loading}
          icon={<ReloadOutlined />}
        >
          Reenviar email
        </Button>
        {cooldown > 0 && (
          <Text type="secondary" style={{ fontSize: 12 }}>
            (Aguarde {formatTime(cooldown)})
          </Text>
        )}
      </Space>
    );
  }

  return (
    <Space direction="vertical" style={{ width: '100%' }}>
      <Button
        type="default"
        icon={<ReloadOutlined />}
        onClick={handleClick}
        loading={loading}
        disabled={cooldown > 0 || loading}
        block
      >
        {cooldown > 0 
          ? `Aguarde ${formatTime(cooldown)}` 
          : 'Reenviar email de verificação'
        }
      </Button>
      {cooldown === 0 && !loading && (
        <Text type="secondary" style={{ textAlign: 'center', display: 'block', fontSize: 12 }}>
          Você pode solicitar um novo email a cada {COOLDOWN_SECONDS} segundos
        </Text>
      )}
    </Space>
  );
};
