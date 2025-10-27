import { useState } from "react";
import { Alert, Button, Space } from "antd";
import { MailOutlined, CloseOutlined } from "@ant-design/icons";
import { useAuth } from "./AuthContext";
import { ResendVerificationButton } from "./ResendVerificationButton";

/**
 * Banner: Verificação de Email Pendente
 * 
 * Características:
 * - Fixo no topo da aplicação
 * - Cor de alerta (amarelo/laranja)
 * - Mensagem: "Verifique seu email para acessar todos os recursos"
 * - Botão "Reenviar email"
 * - Botão "Dispensar" (fecha banner temporariamente)
 * - Só aparece para usuários não verificados
 * 
 * Uso:
 * - Adicionar no layout principal (após header)
 * - Verificar isEmailVerified do AuthContext
 */
export const EmailVerificationBanner: React.FC = () => {
  const { user } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  // Só mostrar se usuário não verificou email e banner não foi dispensado
  if (!user || user.isEmailVerified || dismissed) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    // Salvar no localStorage para não mostrar novamente nesta sessão
    sessionStorage.setItem('emailVerificationBannerDismissed', 'true');
  };

  return (
    <Alert
      message="Verifique seu email"
      description={
        <Space>
          <span>Verifique seu email para acessar todos os recursos</span>
          <ResendVerificationButton variant="link" />
        </Space>
      }
      type="warning"
      showIcon
      icon={<MailOutlined />}
      action={
        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={handleDismiss}
          size="small"
          style={{ color: 'rgba(0, 0, 0, 0.45)' }}
        />
      }
      style={{ marginBottom: 16 }}
      banner
    />
  );
};
