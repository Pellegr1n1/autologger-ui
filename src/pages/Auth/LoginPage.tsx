import { useState, useEffect } from "react"
import { Form, Input, Button, Card, Typography, Checkbox, Divider, notification } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth"
import { GoogleLoginButton } from "../../components/GoogleLoginButton"
import styles from "./Auth.module.css"

const { Title, Text } = Typography

export default function LoginPage() {
  const [api, contextHolder] = notification.useNotification()
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const [isProcessingAuth, setIsProcessingAuth] = useState(false)

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
  }, [isProcessingAuth]);

  const onFinish = async (values: any) => {
    setLoading(true)

    try {
      await login({
        email: values.email,
        password: values.password,
      })

      navigate("/vehicles")
    } catch (err: any) {
      
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

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true)

    try {
      
      if (response.user && response.token) {
        // Store token in localStorage first
        localStorage.setItem('autologger_token', response.token)
        
        // Import and set token in apiBase
        const { apiBase } = await import('../../shared/services/api')
        apiBase.setToken(response.token)
        
        // Verify token is properly set
        const storedToken = apiBase.getToken()
        
        // Login user
        await login(response.user)
        
        // Small delay to ensure token is properly set before navigation
        await new Promise(resolve => setTimeout(resolve, 100))
        
        navigate("/vehicles")
      } else {
        throw new Error('Dados do usuário não recebidos')
      }
    } catch (err: any) {
      const errorMessage = err.message || err.response?.data?.message || "Erro ao fazer login com Google. Tente novamente."
      
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
  }

  const handleGoogleError = (error: any) => {
    const errorMessage = error.message || "Erro ao fazer login com Google. Tente novamente."
    
    api.error({
      message: 'Erro no login',
      description: errorMessage,
      placement: 'bottomRight',
      duration: 5,
    })
    
    setIsProcessingAuth(false)
  }

  return (
    <>
      {contextHolder}
      <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard} style={{ width: '480px' }}>
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