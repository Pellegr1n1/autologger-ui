import { useState } from "react";
import { Form, Input, Button, Card, Typography, notification } from "antd";
import { MailOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { passwordRecoveryService } from "../../features/auth/services/passwordRecoveryService";
import { logger } from "../../shared/utils/logger";
import styles from "./Auth.module.css";

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: { email: string }) => {
    setLoading(true);

    try {
      await passwordRecoveryService.requestPasswordReset({
        email: values.email,
      });
      
      api.success({
        message: 'Email enviado!',
        description: 'Verifique sua caixa de entrada e a pasta de spam para recuperar sua senha.',
        placement: 'bottomRight',
        duration: 5,
      });
      
      setSuccess(true);
      
    } catch (err: unknown) {
      logger.error("Erro ao solicitar recuperação de senha:", err);
      
      let errorMessage = "Erro ao processar solicitação. Tente novamente.";
      
      if (err && typeof err === 'object' && 'response' in err) {
        const errorResponse = err as { response?: { status?: number } };
        if (errorResponse.response?.status === 429) {
          errorMessage = "Muitas solicitações. Aguarde alguns minutos.";
        }
      }
      
      if (err instanceof Error) {
        errorMessage = err.message;
      }

      api.error({
        message: 'Erro ao solicitar recuperação',
        description: errorMessage,
        placement: 'bottomRight',
        duration: 5,
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <>
        {contextHolder}
        <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Card className={styles.authCard}>
            <div className={styles.authHeader}>
              <MailOutlined style={{ fontSize: 64, color: "#8b5cf6", marginBottom: 24 }} />
              <Title level={2} className={styles.authTitle}>
                Verifique sua caixa de entrada
              </Title>
              <Text className={styles.authSubtitle}>
                Se o email estiver cadastrado, você receberá instruções para recuperar sua senha
              </Text>
            </div>


            <Button
              type="primary"
              onClick={() => navigate("/login")}
              block
              size="large"
              className={styles.authButton}
            >
              Voltar ao Login
            </Button>
          </Card>
        </div>
      </div>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle}>
              Recuperar senha
            </Title>
            <Text className={styles.authSubtitle}>
              Digite seu email para receber instruções de recuperação
            </Text>
          </div>

          <Form name="forgot-password" onFinish={onFinish} layout="vertical" size="large">
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Por favor, insira seu email!" },
                { type: "email", message: "Email inválido!" },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="seu@email.com" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className={styles.authButton}>
                Enviar instruções
              </Button>
            </Form.Item>
          </Form>

          <div className={styles.authFooter}>
            <Link to="/login" className={styles.authLink}>
              <ArrowLeftOutlined style={{ marginRight: 8 }} />
              Voltar ao login
            </Link>
          </div>
        </Card>
      </div>
    </div>
    </>
  );
}
