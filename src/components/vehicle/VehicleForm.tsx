import { useState } from "react"
import { 
  Card, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  Button, 
  Row, 
  Col, 
  Typography, 
  Space, 
  message,
  Steps
} from "antd"
import { ArrowLeftOutlined, SaveOutlined, CarOutlined } from "@ant-design/icons"
import { Link, useNavigate, useParams } from "react-router-dom"
import dayjs from "dayjs"

const { Title } = Typography
const { Option } = Select

export default function VehicleForm() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const isEditing = Boolean(id)

  // Dados mockados para edição
  const initialValues = isEditing ? {
    name: "Honda Civic 2020",
    brand: "Honda",
    model: "Civic",
    year: 2020,
    plate: "ABC-1234",
    color: "Prata",
    km: 45000,
    fuelType: "Flex",
    chassi: "9BWZZZ377VT004251",
    renavam: "00123456789",
    engine: "1.5 16V Turbo",
    transmission: "CVT",
    doors: 4,
    seats: 5,
    insuranceExpiry: dayjs("2024-08-15"),
    licenseExpiry: dayjs("2024-06-30"),
  } : {}

  const onFinish = async (values: any) => {
    setLoading(true)
    try {
      // Simular API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      console.log("Form values:", values)
      
      message.success(
        isEditing 
          ? "Veículo atualizado com sucesso!" 
          : "Veículo cadastrado com sucesso!"
      )
      
      navigate("/vehicles")
    } catch (error) {
      message.error("Erro ao salvar veículo. Tente novamente.")
    } finally {
      setLoading(false)
    }
  }

  const steps = [
    {
      title: "Informações Básicas",
      content: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Nome do Veículo"
              name="name"
              rules={[{ required: true, message: "Por favor, insira o nome do veículo" }]}
            >
              <Input placeholder="Ex: Honda Civic 2020" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Placa"
              name="plate"
              rules={[
                { required: true, message: "Por favor, insira a placa" },
                { pattern: /^[A-Z]{3}-\d{4}$/, message: "Formato inválido (ABC-1234)" }
              ]}
            >
              <Input placeholder="ABC-1234" style={{ textTransform: "uppercase" }} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Marca"
              name="brand"
              rules={[{ required: true, message: "Por favor, selecione a marca" }]}
            >
              <Select placeholder="Selecione a marca">
                <Option value="Honda">Honda</Option>
                <Option value="Toyota">Toyota</Option>
                <Option value="Volkswagen">Volkswagen</Option>
                <Option value="Ford">Ford</Option>
                <Option value="Chevrolet">Chevrolet</Option>
                <Option value="Hyundai">Hyundai</Option>
                <Option value="Nissan">Nissan</Option>
                <Option value="Fiat">Fiat</Option>
                <Option value="Renault">Renault</Option>
                <Option value="Peugeot">Peugeot</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Modelo"
              name="model"
              rules={[{ required: true, message: "Por favor, insira o modelo" }]}
            >
              <Input placeholder="Ex: Civic" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Ano"
              name="year"
              rules={[{ required: true, message: "Por favor, insira o ano" }]}
            >
              <InputNumber
                placeholder="2020"
                min={1900}
                max={new Date().getFullYear() + 1}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Cor"
              name="color"
              rules={[{ required: true, message: "Por favor, selecione a cor" }]}
            >
              <Select placeholder="Selecione a cor">
                <Option value="Branco">Branco</Option>
                <Option value="Preto">Preto</Option>
                <Option value="Prata">Prata</Option>
                <Option value="Cinza">Cinza</Option>
                <Option value="Azul">Azul</Option>
                <Option value="Vermelho">Vermelho</Option>
                <Option value="Verde">Verde</Option>
                <Option value="Amarelo">Amarelo</Option>
                <Option value="Marrom">Marrom</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Quilometragem"
              name="km"
              rules={[{ required: true, message: "Por favor, insira a quilometragem" }]}
            >
              <InputNumber
                placeholder="45000"
                min={0}
                style={{ width: "100%" }}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                parser={(value) => value!.replace(/\./g, '')}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Combustível"
              name="fuelType"
              rules={[{ required: true, message: "Por favor, selecione o combustível" }]}
            >
              <Select placeholder="Selecione o combustível">
                <Option value="Flex">Flex</Option>
                <Option value="Gasolina">Gasolina</Option>
                <Option value="Etanol">Etanol</Option>
                <Option value="Diesel">Diesel</Option>
                <Option value="Elétrico">Elétrico</Option>
                <Option value="Híbrido">Híbrido</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: "Especificações Técnicas",
      content: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Chassi"
              name="chassi"
              rules={[{ required: true, message: "Por favor, insira o chassi" }]}
            >
              <Input placeholder="9BWZZZ377VT004251" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Renavam"
              name="renavam"
              rules={[{ required: true, message: "Por favor, insira o renavam" }]}
            >
              <Input placeholder="00123456789" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Motor"
              name="engine"
            >
              <Input placeholder="1.5 16V Turbo" />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Transmissão"
              name="transmission"
            >
              <Select placeholder="Selecione a transmissão">
                <Option value="Manual">Manual</Option>
                <Option value="Automática">Automática</Option>
                <Option value="CVT">CVT</Option>
                <Option value="Automatizada">Automatizada</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Número de Portas"
              name="doors"
            >
              <InputNumber
                placeholder="4"
                min={2}
                max={5}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Número de Assentos"
              name="seats"
            >
              <InputNumber
                placeholder="5"
                min={2}
                max={9}
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    },
    {
      title: "Documentação",
      content: (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Vencimento do Seguro"
              name="insuranceExpiry"
            >
              <DatePicker
                placeholder="Selecione a data"
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12}>
            <Form.Item
              label="Vencimento do Licenciamento"
              name="licenseExpiry"
            >
              <DatePicker
                placeholder="Selecione a data"
                format="DD/MM/YYYY"
                style={{ width: "100%" }}
              />
            </Form.Item>
          </Col>
        </Row>
      )
    }
  ]

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1)
    }).catch(() => {
      message.error("Por favor, preencha todos os campos obrigatórios")
    })
  }

  const prevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Space>
              <Link to="/vehicles">
                <Button icon={<ArrowLeftOutlined />} type="text">
                  Voltar
                </Button>
              </Link>
              <CarOutlined style={{ fontSize: "24px", color: "#2F54EB" }} />
              <Title level={3} style={{ margin: 0 }}>
                {isEditing ? "Editar Veículo" : "Adicionar Veículo"}
              </Title>
            </Space>
          </Col>
        </Row>

        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          {steps.map((item, index) => (
            <Steps.Step key={index} title={item.title} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={initialValues}
        >
          {steps[currentStep].content}

          <Row justify="space-between" style={{ marginTop: 32 }}>
            <Col>
              {currentStep > 0 && (
                <Button onClick={prevStep}>
                  Anterior
                </Button>
              )}
            </Col>
            <Col>
              <Space>
                {currentStep < steps.length - 1 ? (
                  <Button type="primary" onClick={nextStep}>
                    Próximo
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                  >
                    {isEditing ? "Atualizar" : "Salvar"} Veículo
                  </Button>
                )}
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  )
}