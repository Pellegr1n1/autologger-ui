import { useState, useEffect, useCallback } from "react"
import { Form, Input, Button, Card, Typography, Checkbox, Divider, notification } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth"
import { GoogleLoginButton } from "../../components/GoogleLoginButton"
import { logger } from "../../shared/utils/logger"
import styles from "./Auth.module.css"

const { Title, Text } = Typography

export default function LoginPage() {
  const [api, contextHolder] = notification.useNotification()
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)

  const handleGoogleError = useCallback((error: Error) => {
    const errorMessage = error.message || "Erro ao fazer login com Google. Tente novamente."
    
    api.error({
      message: 'Erro no login',
      description: errorMessage,
      placement: 'bottomRight',
      duration: 5,
    })
    
    setIsProcessingAuth(false)
  }, [api])

  const handleGoogleSuccess = useCallback(async (response: unknown) => {
    setLoading(true)

    try {
      // Token é gerenciado automaticamente via cookie httpOnly pelo backend
      // Não precisamos mais armazenar no localStorage
      const responseData = response && typeof response === 'object' && 'user' in response ? response as { user: unknown } : null;
      if (responseData?.user) {
        // Login user - o user pode ser LoginData ou User
        const userData = responseData.user;
        if (userData && typeof userData === 'object' && ('id' in userData || 'email' in userData)) {
          await login(userData as Parameters<typeof login>[0])
        } else {
          throw new Error('Formato de dados do usuário inválido')
        }
        navigate("/vehicles")
      } else {
        throw new Error('Dados do usuário não recebidos')
      }
    } catch (err: unknown) {
      let errorMessage = "Erro ao fazer login com Google. Tente novamente.";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: unknown }).response;
        if (response && typeof response === 'object' && 'data' in response) {
          const data = (response as { data?: unknown }).data;
          if (data && typeof data === 'object' && 'message' in data && typeof data.message === 'string') {
            errorMessage = data.message;
          }
        }
      }
      
      api.error({
        message: 'Erro no login',
        description: errorMessage,
        placement: 'bottomRight',
        duration: 5,
      })
    } finally {
      setLoading(false)
      setIsProcessingAuth(false)
    }
  }, [login, navigate, api])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        if (!isProcessingAuth) {
          setIsProcessingAuth(true);
          handleGoogleSuccess(event.data);
        }
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        if (!isProcessingAuth) {
          setIsProcessingAuth(true);
          handleGoogleError(new Error(event.data.error));
        }
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [isProcessingAuth, handleGoogleSuccess, handleGoogleError]);

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true)

    try {
      await login({
        email: values.email,
        password: values.password,
      })

      navigate("/vehicles")
    } catch (err: unknown) {
      logger.error('Erro ao fazer login', err);
      setTimeout(() => {
        api.error({
          message: 'Erro ao fazer login',
          description: 'Credenciais inválidas ou conta não encontrada. Verifique seus dados e tente novamente.',
          placement: 'bottomRight',
          duration: 5,
        })
      }, 100)
    } finally {
      setLoading(false)
    }
  }


  return (
    <>
      {contextHolder}
      <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle}>
              Bem-vindo de volta
            </Title>
            <Text className={styles.authSubtitle}>Acesse sua conta AutoLogger</Text>
          </div>

          <Form 
            name="login" 
            onFinish={onFinish} 
            onFinishFailed={() => {}}
            layout="vertical" 
            size="large"
          >
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Por favor, insira seu email!" },
                { type: "email", message: "Email inválido!" },
              ]}
            >
              <Input prefix={<UserOutlined />} placeholder="seu@email.com" />
            </Form.Item>

            <Form.Item
              name="password"
              label="Senha"
              rules={[{ required: true, message: "Por favor, insira sua senha!" }]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="Sua senha" />
            </Form.Item>

            <Form.Item>
              <div className={styles.formOptions}>
                <Checkbox>Lembrar-me</Checkbox>
                <Link to="/forgot-password" className={styles.forgotLink}>
                  Esqueceu a senha?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block className={styles.authButton}>
                Entrar
              </Button>
            </Form.Item>
          </Form>

          <Divider className={styles.divider}>ou</Divider>

          <div className={styles.googleButtonContainer}>
            <GoogleLoginButton
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              disabled={loading}
            />
          </div>

          <div className={styles.authFooter}>
            <Text>
              Não tem uma conta?{" "}
              <Link to="/register" className={styles.authLink}>
                Registre-se
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
    </>
  )
}