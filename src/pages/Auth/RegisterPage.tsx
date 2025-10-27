import { useState } from "react"
import { Form, Input, Button, Card, Typography, Checkbox, Steps, Space, Progress, notification } from "antd"
import {
  UserOutlined,
  LockOutlined,
  MailOutlined
} from "@ant-design/icons"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../features/auth"
import { emailVerificationService } from "../../features/auth/services/emailVerificationService"
import styles from "./Auth.module.css"

const { Title, Text } = Typography
const { Step } = Steps
const { Password } = Input

export default function RegisterPage() {
  const [api, contextHolder] = notification.useNotification()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<any>({})
  const [form] = Form.useForm()
  const { register, user } = useAuth()
  const navigate = useNavigate()
  const [passwordStrength, setPasswordStrength] = useState({
    score: 0,
    checks: {
      length: false,
      lowercase: false,
      uppercase: false,
      number: false,
      special: false,
    },
  })


  const checkPasswordStrength = (password: string) => {
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    }

    const score = Object.values(checks).filter(Boolean).length

    setPasswordStrength({
      score,
      checks,
    })
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength.score === 5) return "#52c41a"
    if (passwordStrength.score >= 3) return "#faad14"
    return "#ff4d4f"
  }

  const getPasswordStrengthLabel = () => {
    if (passwordStrength.score === 5) return "Muito forte"
    if (passwordStrength.score >= 3) return "Médio"
    return "Fraco"
  }

  const nextStep = async () => {
    try {
      const fieldsToValidate = ['name', 'email']

      await form.validateFields(fieldsToValidate)

      const currentValues = form.getFieldsValue()

      setFormData({ ...formData, ...currentValues })
      setCurrentStep(currentStep + 1)
    } catch (errorInfo) {
      console.log('Validation failed:', errorInfo)
    }
  }

  const prevStep = () => {
    const currentValues = form.getFieldsValue()
    setFormData({ ...formData, ...currentValues })

    setCurrentStep(currentStep - 1)

    form.setFieldsValue(formData)
  }

  const onFinish = async (values: any) => {
    const allFormData = { ...formData, ...values }

    setLoading(true)

    try {
      const registerData = {
        name: allFormData.name,
        email: allFormData.email,
        password: allFormData.password,
        confirmPassword: allFormData.confirmPassword,
      }

      await register(registerData)
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const currentUser = user
      
      if (currentUser?.id) {
        try {
          await emailVerificationService.sendVerificationEmail(currentUser.id)
          navigate("/email-verification-pending")
          return
        } catch (verificationError) {
          console.error("Erro ao enviar email de verificação:", verificationError)
          navigate("/email-verification-pending")
          return
        }
      }
      
      navigate("/email-verification-pending")
      
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

      // Exibir notificação no canto inferior direito
      api.error({
        message: 'Erro no cadastro',
        description: errorMessage,
        placement: 'bottomRight',
        duration: 5,
      })
    } finally {
      setLoading(false)
    }
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
                { min: 8, message: "" },
                {
                  pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/,
                  message: "",
                },
              ]}
              hasFeedback
            >
              <Password
                prefix={<LockOutlined />}
                placeholder="Sua senha"
                onChange={(e) => checkPasswordStrength(e.target.value)}
              />
            </Form.Item>

            <div style={{ marginBottom: 20, height: '140px', minWidth: '350px' }}>
              <Space direction="vertical" size="small" style={{ width: "100%" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <Text type="secondary" style={{ fontSize: 12 }}>Força da senha:</Text>
                  <Text strong style={{ color: getPasswordStrengthColor(), fontSize: 12 }}>
                    {getPasswordStrengthLabel()}
                  </Text>
                </div>
                <Progress
                  percent={(passwordStrength.score / 5) * 100}
                  strokeColor={passwordStrength.score > 0 ? getPasswordStrengthColor() : '#888'}
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

            <Form.Item
              name="confirmPassword"
              label="Confirmar Senha"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Por favor, confirme sua senha!" },
                { min: 8, message: "" },
                { pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/, message: "" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("As senhas não coincidem!"));
                  },
                }),
              ]}
              hasFeedback
            >
              <Password
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
    <>
      {contextHolder}
      <div className={styles.authContainer}>
        <div className={styles.authContent}>
          <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle} style={{ marginBottom: 8, fontSize: '1.8rem' }}>
              Crie sua conta
            </Title>
            <Text className={styles.authSubtitle} style={{ fontSize: '0.9rem' }}>
              Comece a gerenciar seus veículos com segurança blockchain
            </Text>
          </div>

          <Steps
            current={currentStep}
            style={{ marginBottom: 20 }}
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
    </>
  )
}