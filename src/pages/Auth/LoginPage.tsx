import { useState, useEffect } from "react"
import { Form, Input, Button, Card, Typography, Checkbox, Alert, Divider } from "antd"
import { UserOutlined, LockOutlined } from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth"
import { GoogleLoginButton } from "../../components/GoogleLoginButton"
import styles from "./Auth.module.css"

const { Title, Text } = Typography

export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Listener para mensagens do popup OAuth2
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      
      if (event.data.type === 'GOOGLE_AUTH_SUCCESS') {
        console.log('OAuth2 success message received:', event.data);
        handleGoogleSuccess(event.data);
      } else if (event.data.type === 'GOOGLE_AUTH_ERROR') {
        console.log('OAuth2 error message received:', event.data);
        handleGoogleError(new Error(event.data.error));
      }
    };

    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const onFinish = async (values: any) => {
    setLoading(true)
    setError("")

    try {
      await login({
        email: values.email,
        password: values.password,
      })

      navigate("/vehicles")
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Email ou senha incorretos. Verifique seus dados.")
      } else if (err.response?.status === 404) {
        setError("Usuário não encontrado. Verifique o email.")
      } else {
        setError("Erro ao fazer login. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true)
    setError("")

    try {
      console.log('Google OAuth2 success, response:', response)
      
      // O fluxo OAuth2 já foi processado na página de callback
      // Aqui apenas fazemos o login com os dados recebidos
      if (response.user && response.token) {
        localStorage.setItem('autologger_token', response.token)
        
        // Importar apiBase para definir o token
        const { apiBase } = await import('../../shared/services/api')
        apiBase.setToken(response.token)
        
        await login(response.user)
        navigate("/vehicles")
      } else {
        throw new Error('Dados do usuário não recebidos')
      }
    } catch (err: any) {
      console.error('Google login error:', err)
      const errorMessage = err.message || err.response?.data?.message || "Erro ao fazer login com Google. Tente novamente."
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = (error: any) => {
    console.error('Google login error:', error)
    const errorMessage = error.message || "Erro ao fazer login com Google. Tente novamente."
    setError(errorMessage)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle}>
              Bem-vindo de volta
            </Title>
            <Text className={styles.authSubtitle}>Acesse sua conta AutoLogger</Text>
          </div>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

          <Form name="login" onFinish={onFinish} layout="vertical" size="large">
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
  )
}