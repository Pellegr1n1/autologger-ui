import { useState } from "react"
import { Form, Input, Button, Card, Typography, Alert, Checkbox, Steps, Space, Divider } from "antd"
import {
  UserOutlined,
  LockOutlined,
  MailOutlined
} from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth"
import { GoogleLoginButton } from "../../components/GoogleLoginButton"
import { googleAuthService } from "../../features/auth/services/googleAuthService"
import styles from "./Auth.module.css"

const { Title, Text } = Typography
const { Step } = Steps

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [form] = Form.useForm()
  const { register } = useAuth()
  const navigate = useNavigate()


  const nextStep = async () => {
    try {
      const fieldsToValidate = ['name', 'email']

      await form.validateFields(fieldsToValidate)

      const currentValues = form.getFieldsValue()

      setFormData({ ...formData, ...currentValues })
      setCurrentStep(currentStep + 1)
      setError("")
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo)
    }
  }

  const prevStep = () => {
    const currentValues = form.getFieldsValue()
    setFormData({ ...formData, ...currentValues })

    setCurrentStep(currentStep - 1)
    setError("")

    form.setFieldsValue(formData)
  }

  const onFinish = async (values: any) => {
    const allFormData = { ...formData, ...values }

    setLoading(true)
    setError("")

    try {
      const registerData = {
        name: allFormData.name,
        email: allFormData.email,
        password: allFormData.password,
        confirmPassword: allFormData.confirmPassword,
      }

      await register(registerData)
      navigate("/vehicles")
    } catch (err: any) {
      console.error("Erro no registro:", err)

      let errorMessage = "Erro ao criar conta. Tente novamente."

      if (err.response?.data?.error?.message && Array.isArray(err.response.data.error.message)) {
        errorMessage = err.response.data.error.message.join('\n')
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (response: any) => {
    setLoading(true)
    setError("")

    try {
      await googleAuthService.authenticateWithGoogle(response.credential, response.code)
      
      // Para login com Google, não precisamos chamar register
      // O usuário já foi autenticado pelo Google
      navigate("/vehicles")
    } catch (err: any) {
      setError("Erro ao fazer login com Google. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError("Erro ao fazer login com Google. Tente novamente.")
  }

  const steps = [
    {
      title: 'Informações Básicas',
      icon: <UserOutlined />,
    },
    {
      title: 'Segurança',
      icon: <LockOutlined />,
    },
  ]

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <Form.Item
              name="name"
              label="Nome Completo"
              rules={[
                { required: true, message: "Por favor, insira seu nome!" },
                { min: 2, message: "Nome deve ter pelo menos 2 caracteres" }
              ]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Seu nome completo"
              />
            </Form.Item>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: "Por favor, insira seu email!" },
                { type: "email", message: "Email deve ter um formato válido" }
              ]}
            >
              <Input
                prefix={<MailOutlined />}
                placeholder="seu@email.com"
              />
            </Form.Item>

          </>
        )

      case 1:
        return (
          <>
            <Form.Item
              name="password"
              label="Senha"
              rules={[
                { required: true, message: "Por favor, insira sua senha!" },
                { min: 8, message: "Senha deve ter pelo menos 8 caracteres" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                  message: "Senha deve conter pelo menos: 1 letra minúscula, 1 maiúscula e 1 número"
                }
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Sua senha (mín. 8 caracteres)"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirmar Senha"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Por favor, confirme sua senha!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve()
                    }
                    return Promise.reject(new Error("As senhas não coincidem!"))
                  },
                }),
              ]}
              hasFeedback
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Confirme sua senha"
                maxLength={50}
              />
            </Form.Item>

            <Form.Item
              name="terms"
              valuePropName="checked"
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error("Você deve aceitar os termos!")),
                },
              ]}
            >
              <Checkbox>
                Eu aceito os{" "}
                <Link to="/terms" target="_blank" rel="noopener noreferrer" className={styles.authLink}>
                  Termos de Uso
                </Link>{" "}
                e{" "}
                <Link to="/privacy" target="_blank" rel="noopener noreferrer" className={styles.authLink}>
                  Política de Privacidade
                </Link>
              </Checkbox>
            </Form.Item>
          </>
        )

      default:
        return null
    }
  }

  const renderStepButtons = () => {
    if (currentStep === 0) {
      return (
        <Button
          type="primary"
          onClick={nextStep}
          size="large"
          block
          className={styles.authButton}
        >
          Próximo
        </Button>
      )
    }

    if (currentStep === 1) {
      return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Button
            type="primary"
            htmlType="submit"
            loading={loading}
            size="large"
            block
            className={styles.authButton}
          >
            Criar Conta
          </Button>

          <Button
            onClick={prevStep}
            size="large"
            block
          >
            Voltar
          </Button>
        </Space>
      )
    }
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle}>
              Crie sua conta
            </Title>
            <Text className={styles.authSubtitle}>
              Comece a gerenciar seus veículos com segurança blockchain
            </Text>
          </div>

          <Steps
            current={currentStep}
            style={{ marginBottom: 32 }}
            size="small"
          >
            {steps.map((step, index) => (
              <Step
                key={index}
                title={step.title}
                icon={step.icon}
              />
            ))}
          </Steps>

          {error && (
            <Alert
              message="Erro no cadastro"
              description={
                <div style={{ whiteSpace: 'pre-line' }}>
                  {error}
                </div>
              }
              type="error"
              showIcon
              style={{ marginBottom: 24 }}
            />
          )}

          <Form
            form={form}
            name="register"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            initialValues={formData}
          >
            {renderStepContent()}

            <Form.Item style={{ marginBottom: 0 }}>
              {renderStepButtons()}
            </Form.Item>
          </Form>

          {currentStep === 0 && (
            <>
              <Divider className={styles.divider}>ou</Divider>
              <div className={styles.googleButtonContainer}>
                <GoogleLoginButton
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  disabled={loading}
                />
              </div>
            </>
          )}

          <div className={styles.authFooter} style={{ marginTop: 24 }}>
            <Text>
              Já tem uma conta?{" "}
              <Link to="/login" className={styles.authLink}>
                Faça login
              </Link>
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}