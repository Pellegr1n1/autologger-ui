import { useState, useEffect } from "react";
import { Form, Input, Button, Card, Typography, Progress, Space, notification } from "antd";
import { LockOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate, useParams } from "react-router-dom";
import { passwordRecoveryService } from "../../features/auth/services/passwordRecoveryService";
import styles from "./Auth.module.css";
import type { ReactNode } from "react";

const { Title, Text } = Typography;
const { Password } = Input;

const ICON_STYLES = {
  error: { fontSize: 64, color: "#ff4d4f", marginBottom: 24 },
  success: { fontSize: 64, color: "#52c41a", marginBottom: 24 }
};

const CONTAINER_STYLES = {
  centerPadding: { textAlign: "center" as const, padding: "40px 0" },
  centerPaddingSmall: { textAlign: "center" as const, padding: "20px 0" },
  centerPaddingSmallWithMargin: { textAlign: "center" as const, padding: "20px 0", marginBottom: 24 }
};

const PASSWORD_STRENGTH_COLORS = {
  strong: "#52c41a",
  medium: "#faad14",
  weak: "#ff4d4f",
  default: "#888"
};

const PASSWORD_STRENGTH_LABELS = {
  strong: "Muito forte",
  medium: "Médio",
  weak: "Fraco"
};

const NOTIFICATION_CONFIG = {
  placement: 'bottomRight' as const,
  duration: 5
};

const PASSWORD_VALIDATION_RULES = [
  { required: true, message: "Por favor, insira sua senha!" },
  { min: 8, message: "" },
  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, message: "" }
];

const CONFIRM_PASSWORD_VALIDATION_RULES = [
  { required: true, message: "Por favor, confirme sua senha!" },
  { min: 8, message: "" },
  { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, message: "" },
  ({ getFieldValue }: any) => ({
    validator(_: any, value: string) {
      if (!value || getFieldValue("password") === value) {
        return Promise.resolve();
      }
      return Promise.reject(new Error("As senhas não coincidem!"));
    },
  })
];

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          {children}
        </Card>
      </div>
    </div>
  );
}

interface PasswordStrengthIndicatorProps {
  passwordStrength: {
    score: number;
    checks: {
      length: boolean;
      lowercase: boolean;
      uppercase: boolean;
      number: boolean;
      special: boolean;
    };
  };
  getPasswordStrengthColor: () => string;
  getPasswordStrengthLabel: () => string;
}

function PasswordStrengthIndicator({ 
  passwordStrength, 
  getPasswordStrengthColor, 
  getPasswordStrengthLabel 
}: PasswordStrengthIndicatorProps) {
  const strengthColor = getPasswordStrengthColor();
  
  return (
    <div style={{ marginBottom: 20, height: '140px', minWidth: '350px' }}>
      <Space direction="vertical" size="small" style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <Text type="secondary" style={{ fontSize: 12 }}>Força da senha:</Text>
          <Text strong style={{ color: strengthColor, fontSize: 12 }}>
            {getPasswordStrengthLabel()}
          </Text>
        </div>
        <Progress
          percent={(passwordStrength.score / 5) * 100}
          strokeColor={passwordStrength.score > 0 ? strengthColor : PASSWORD_STRENGTH_COLORS.default}
          trailColor="#444"
          showInfo={false}
          size="small"
        />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px", fontSize: 11 }}>
          <Text type={passwordStrength.checks.length ? "success" : "secondary"}>
            ✓ Mínimo 8 caracteres
          </Text>
          <Text type={passwordStrength.checks.lowercase ? "success" : "secondary"}>
            ✓ Letra minúscula
          </Text>
          <Text type={passwordStrength.checks.uppercase ? "success" : "secondary"}>
            ✓ Letra maiúscula
          </Text>
          <Text type={passwordStrength.checks.number ? "success" : "secondary"}>
            ✓ Número
          </Text>
          <Text type={passwordStrength.checks.special ? "success" : "secondary"} style={{ gridColumn: "1 / -1" }}>
            ✓ Caractere especial
          </Text>
        </div>
      </Space>
    </div>
  );
}

export default function ResetPasswordPage() {
  const [api, contextHolder] = notification.useNotification();
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    },
  });
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    validateToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const validateToken = async () => {
    if (!token) {
      setVerifying(false);
      return;
    }

    setVerifying(true);
    try {
      const isValid = await passwordRecoveryService.validateResetToken(token);
      setTokenValid(isValid);
    } catch (error) {
      api.error({
        message: 'Token inválido',
        description: 'Token inválido ou expirado. Solicite um novo link de recuperação.',
        ...NOTIFICATION_CONFIG,
      });
      setTokenValid(false);
    } finally {
      setVerifying(false);
    }
  };

  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(checks).filter(Boolean).length;

    setPasswordStrength({
      score,
      checks,
    });
  };

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 5) return PASSWORD_STRENGTH_COLORS.strong;
    if (passwordStrength.score >= 3) return PASSWORD_STRENGTH_COLORS.medium;
    return PASSWORD_STRENGTH_COLORS.weak;
  };

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score === 5) return PASSWORD_STRENGTH_LABELS.strong;
    if (passwordStrength.score >= 3) return PASSWORD_STRENGTH_LABELS.medium;
    return PASSWORD_STRENGTH_LABELS.weak;
  };

  const onFinish = async (values: any) => {
    if (!token) {
      return;
    }

    setLoading(true);

    try {
      await passwordRecoveryService.resetPassword({
        token,
        newPassword: values.password,
        confirmPassword: values.confirmPassword,
      });

      setSuccess(true);
      
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Erro ao resetar senha:", err);
      
      let errorMessage = "Erro ao processar solicitação. Tente novamente.";
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }

      api.error({
        message: 'Erro ao resetar senha',
        description: errorMessage,
        ...NOTIFICATION_CONFIG,
      });
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <>
        {contextHolder}
        <AuthLayout>
          <div style={CONTAINER_STYLES.centerPadding}>
            <Text>Verificando token...</Text>
          </div>
        </AuthLayout>
      </>
    );
  }

  if (!tokenValid) {
    return (
      <>
        {contextHolder}
        <AuthLayout>
          <div className={styles.authHeader}>
            <ExclamationCircleOutlined style={ICON_STYLES.error} />
            <Title level={2} className={styles.authTitle}>
              Token inválido ou expirado
            </Title>
            <Text className={styles.authSubtitle}>
              Este link de recuperação de senha não é válido ou expirou
            </Text>
          </div>

          <div style={CONTAINER_STYLES.centerPaddingSmallWithMargin}>
            <Text type="danger">Link inválido - Solicite um novo link de recuperação de senha</Text>
          </div>

          <Button type="primary" onClick={() => navigate("/forgot-password")} block size="large" className={styles.authButton}>
            Solicitar novo link
          </Button>

          <div className={styles.authFooter}>
            <Link to="/login" className={styles.authLink}>
              Voltar ao login
            </Link>
          </div>
        </AuthLayout>
      </>
    );
  }

  if (success) {
    return (
      <>
        {contextHolder}
        <AuthLayout>
          <div className={styles.authHeader}>
            <CheckCircleOutlined style={ICON_STYLES.success} />
            <Title level={2} className={styles.authTitle}>
              Senha alterada com sucesso!
            </Title>
            <Text className={styles.authSubtitle}>
              Redirecionando para o login...
            </Text>
          </div>

          <div style={CONTAINER_STYLES.centerPaddingSmall}>
            <Text type="success">Redirecionando para o login...</Text>
          </div>
        </AuthLayout>
      </>
    );
  }

  return (
    <>
      {contextHolder}
      <AuthLayout>
        <div className={styles.authHeader}>
          <Title level={2} className={styles.authTitle}>
            Criar nova senha
          </Title>
          <Text className={styles.authSubtitle}>
            Defina uma senha forte e segura
          </Text>
        </div>

        <Form name="reset-password" onFinish={onFinish} layout="vertical" size="large">
          <Form.Item
            name="password"
            label="Nova Senha"
            rules={PASSWORD_VALIDATION_RULES}
            hasFeedback
          >
            <Password
              prefix={<LockOutlined />}
              placeholder="Sua nova senha"
              onChange={(e) => checkPasswordStrength(e.target.value)}
            />
          </Form.Item>

          <PasswordStrengthIndicator
            passwordStrength={passwordStrength}
            getPasswordStrengthColor={getPasswordStrengthColor}
            getPasswordStrengthLabel={getPasswordStrengthLabel}
          />

          <Form.Item
            name="confirmPassword"
            label="Confirmar Nova Senha"
            dependencies={["password"]}
            rules={CONFIRM_PASSWORD_VALIDATION_RULES}
            hasFeedback
          >
            <Password prefix={<LockOutlined />} placeholder="Confirme sua nova senha" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block className={styles.authButton}>
              Alterar senha
            </Button>
          </Form.Item>
        </Form>

        <div className={styles.authFooter}>
          <Link to="/login" className={styles.authLink}>
            Voltar ao login
          </Link>
        </div>
      </AuthLayout>
    </>
  );
}
