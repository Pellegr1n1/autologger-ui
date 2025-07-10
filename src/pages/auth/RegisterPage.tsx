import { useState } from "react"
import { Form, Input, Button, Card, Typography, Divider, Space, Checkbox, Alert, Steps } from "antd"
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  GoogleOutlined,
  GithubOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"
import styles from "./Auth.module.css"

const { Title, Text } = Typography
const { Step } = Steps

export default function RegisterPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [currentStep, setCurrentStep] = useState(0)
  const [form] = Form.useForm()

  const onFinish = async (values: any) => {
    setLoading(true)
    setError("")

    try {
      console.log("Register:", values)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      window.location.href = "/vehicles"
    } catch (err) {
      setError("Erro ao criar conta. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const nextStep = async () => {
    try {
      const values = await form.validateFields(["name", "email"])
      setCurrentStep(1)
    } catch (error) {
      console.log("Validation failed:", error)
    }
  }

  const prevStep = () => {
    setCurrentStep(0)
  }

  return (
    <div className={styles.authContainer}>
      <div className={styles.authContent}>
        <Card className={styles.authCard}>
          <div className={styles.authHeader}>
            <Title level={2} className={styles.authTitle}>
              Crie sua conta
            </Title>
            <Text className={styles.authSubtitle}>Comece a gerenciar seus veículos com segurança blockchain</Text>
          </div>

          <Steps current={currentStep} style={{ marginBottom: 32 }}>
            <Step title="Informações Básicas" />
            <Step title="Segurança" />
          </Steps>

          {error && <Alert message={error} type="error" showIcon style={{ marginBottom: 24 }} />}

          <Form form={form} name="register" onFinish={onFinish} layout="vertical" size="large">
            {currentStep === 0 && (
              <>
                <Form.Item
                  name="name"
                  label="Nome Completo"
                  rules={[{ required: true, message: "Por favor, insira seu nome!" }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Seu nome completo" />
                </Form.Item>

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

                <Form.Item name="phone" label="Telefone (Opcional)">
                  <Input prefix={<PhoneOutlined />} placeholder="(11) 99999-9999" />
                </Form.Item>

                <Form.Item>
                  <Button type="primary" onClick={nextStep} block className={styles.authButton}>
                    Próximo
                  </Button>
                </Form.Item>
              </>
            )}

            {currentStep === 1 && (
              <>
                <Form.Item
                  name="password"
                  label="Senha"
                  rules={[
                    { required: true, message: "Por favor, insira sua senha!" },
                    { min: 8, message: "A senha deve ter pelo menos 8 caracteres!" },
                  ]}
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Sua senha" />
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
                >
                  <Input.Password prefix={<LockOutlined />} placeholder="Confirme sua senha" />
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
                    <Link to="/terms" className={styles.authLink}>
                      Termos de Uso
                    </Link>{" "}
                    e{" "}
                    <Link to="/privacy" className={styles.authLink}>
                      Política de Privacidade
                    </Link>
                  </Checkbox>
                </Form.Item>

                <Space style={{ width: "100%" }}>
                  <Button onClick={prevStep} style={{ width: "48%" }}>
                    Voltar
                  </Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ width: "48%" }}
                    className={styles.authButton}
                  >
                    Criar Conta
                  </Button>
                </Space>
              </>
            )}
          </Form>

          {currentStep === 0 && (
            <>
              <Divider>ou</Divider>

              <Space direction="vertical" style={{ width: "100%" }}>
                <Button icon={<GoogleOutlined />} block size="large" className={styles.socialButton}>
                  Continuar com Google
                </Button>
                <Button icon={<GithubOutlined />} block size="large" className={styles.socialButton}>
                  Continuar com GitHub
                </Button>
              </Space>
            </>
          )}

          <div className={styles.authFooter}>
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
