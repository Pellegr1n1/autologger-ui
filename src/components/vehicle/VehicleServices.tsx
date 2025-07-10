import { useState } from "react"
import { 
  Card, 
  Row, 
  Col, 
  Typography, 
  Button, 
  Space, 
  Avatar, 
  Table, 
  Tag, 
  Modal, 
  Form, 
  Input, 
  Select, 
  DatePicker, 
  InputNumber, 
  message,
  Empty
} from "antd"
import { 
  ArrowLeftOutlined, 
  CarOutlined, 
  PlusOutlined, 
  ToolOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined
} from "@ant-design/icons"
import { Link, useParams } from "react-router-dom"
import dayjs from "dayjs"

const { Title, Text } = Typography
const { Option } = Select
const { TextArea } = Input
const { confirm } = Modal

export default function VehicleServices() {
  const { id } = useParams()
  const [loading, setLoading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<any>(null)
  const [form] = Form.useForm()

  // Dados mockados
  const vehicle = {
    id: 1,
    name: "Honda Civic 2020",
    plate: "ABC-1234",
  }

  const services = [
    {
      id: 1,
      type: "Manutenção Preventiva",
      description: "Troca de óleo e filtros",
      date: "2024-01-15",
      km: 45000,
      cost: 350.00,
      location: "Oficina Honda",
      status: "Concluído",
      nextService: "2024-04-15",
      nextServiceKm: 50000,
    },
    {
      id: 2,
      type: "Reparo",
      description: "Troca de pastilhas de freio",
      date: "2023-12-10",
      km: 43000,
      cost: 280.00,
      location: "Auto Center Silva",
      status: "Concluído",
      nextService: null,
      nextServiceKm: null,
    },
    {
      id: 3,
      type: "Inspeção",
      description: "Revisão geral do veículo",
      date: "2023-11-05",
      km: 41000,
      cost: 150.00,
      location: "Oficina Honda",
      status: "Concluído",
      nextService: null,
      nextServiceKm: null,
    },
  ]

  const serviceTypes = [
    "Manutenção Preventiva",
    "Reparo",
    "Inspeção",
    "Troca de Óleo",
    "Alinhamento",
    "Balanceamento",
    "Revisão",
    "Outros"
  ]

  const statusOptions = [
    { value: "Agendado", color: "blue" },
    { value: "Em andamento", color: "orange" },
    { value: "Concluído", color: "green" },
    { value: "Cancelado", color: "red" },
  ]

  const showModal = (service?: any) => {
    setEditingService(service)
    if (service) {
      form.setFieldsValue({
        ...service,
        date: dayjs(service.date),
        nextService: service.nextService ? dayjs(service.nextService) : null,
      })
    } else {
      form.resetFields()
    }
    setIsModalOpen(true)
  }

  const handleOk = () => {
    form.validateFields().then(async (values) => {
      setLoading(true)
      try {
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        console.log("Service values:", values)
        
        message.success(
          editingService 
            ? "Serviço atualizado com sucesso!" 
            : "Serviço cadastrado com sucesso!"
        )
        
        setIsModalOpen(false)
        setEditingService(null)
        form.resetFields()
      } catch (error) {
        message.error("Erro ao salvar serviço. Tente novamente.")
      } finally {
        setLoading(false)
      }
    })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    setEditingService(null)
    form.resetFields()
  }

  const handleDelete = (serviceId: number, description: string) => {
    confirm({
      title: "Confirmar exclusão",
      icon: <ExclamationCircleOutlined />,
      content: `Tem certeza que deseja excluir o serviço "${description}"? Esta ação não pode ser desfeita.`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        message.success("Serviço excluído com sucesso!")
      },
    })
  }

  const columns = [
    {
      title: "Tipo",
      dataIndex: "type",
      key: "type",
      render: (text: string) => (
        <Space>
          <ToolOutlined style={{ color: "#52c41a" }} />
          <span style={{ fontWeight: 500 }}>{text}</span>
        </Space>
      ),
    },
    {
      title: "Descrição",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Data",
      dataIndex: "date",
      key: "date",
      render: (date: string) => new Date(date).toLocaleDateString("pt-BR"),
    },
    {
      title: "KM",
      dataIndex: "km",
      key: "km",
      render: (km: number) => `${km.toLocaleString()} km`,
    },
    {
      title: "Custo",
      dataIndex: "cost",
      key: "cost",
      render: (cost: number) => (
        <span style={{ color: "#722ED1", fontWeight: 500 }}>
          R$ {cost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => {
        const statusObj = statusOptions.find(s => s.value === status)
        return <Tag color={statusObj?.color}>{status}</Tag>
      },
    },
    {
      title: "Ações",
      key: "actions",
      render: (record: any) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />}
            onClick={() => showModal(record)}
          />
          <Button 
            type="text" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id, record.description)}
          />
        </Space>
      ),
    },
  ]

  const totalCost = services.reduce((sum, service) => sum + service.cost, 0)

  return (
    <div style={{ padding: "24px" }}>
      <Card style={{ marginBottom: 24 }}>
        <Row justify="space-between" align="middle">
          <Col>
            <Space>
              <Link to={`/vehicles/${id}/info`}>
                <Button icon={<ArrowLeftOutlined />} type="text">
                  Voltar
                </Button>
              </Link>
              <Avatar 
                size={48} 
                style={{ backgroundColor: "#2F54EB" }} 
                icon={<CarOutlined />} 
              />
              <div>
                <Title level={3} style={{ margin: 0 }}>
                  Serviços - {vehicle.name}
                </Title>
                <Text type="secondary">Placa: {vehicle.plate}</Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Button 
              type="primary" 
              icon={<PlusOutlined />}
              onClick={() => showModal()}
            >
              Adicionar Serviço
            </Button>
          </Col>
        </Row>
      </Card>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#2F54EB" }}>
                {services.length}
              </div>
              <div style={{ color: "#8c8c8c" }}>Total de Serviços</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#722ED1" }}>
                R$ {totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </div>
              <div style={{ color: "#8c8c8c" }}>Gasto Total</div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#52c41a" }}>
                {services.filter(s => s.status === "Concluído").length}
              </div>
              <div style={{ color: "#8c8c8c" }}>Concluídos</div>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="Histórico de Serviços">
        {services.length === 0 ? (
          <Empty
            description="Nenhum serviço cadastrado"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          >
            <Button type="primary" icon={<PlusOutlined />} onClick={() => showModal()}>
              Cadastrar Primeiro Serviço
            </Button>
          </Empty>
        ) : (
          <Table
            columns={columns}
            dataSource={services}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} serviços`,
            }}
          />
        )}
      </Card>

      <Modal
        title={editingService ? "Editar Serviço" : "Adicionar Serviço"}
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        confirmLoading={loading}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Tipo de Serviço"
                name="type"
                rules={[{ required: true, message: "Por favor, selecione o tipo" }]}
              >
                <Select placeholder="Selecione o tipo">
                  {serviceTypes.map(type => (
                    <Option key={type} value={type}>{type}</Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: "Por favor, selecione o status" }]}
              >
                <Select placeholder="Selecione o status">
                  {statusOptions.map(status => (
                    <Option key={status.value} value={status.value}>
                      {status.value}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                label="Descrição"
                name="description"
                rules={[{ required: true, message: "Por favor, insira a descrição" }]}
              >
                <TextArea rows={3} placeholder="Descreva o serviço realizado..." />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Data do Serviço"
                name="date"
                rules={[{ required: true, message: "Por favor, selecione a data" }]}
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
                label="Custo (R$)"
                name="cost"
                rules={[{ required: true, message: "Por favor, insira o custo" }]}
              >
                <InputNumber
                  placeholder="350.00"
                  min={0}
                  precision={2}
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Local"
                name="location"
              >
                <Input placeholder="Nome da oficina ou local" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="Próximo Serviço"
                name="nextService"
              >
                <DatePicker 
                  placeholder="Data do próximo serviço"
                  format="DD/MM/YYYY"
                  style={{ width: "100%" }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                label="KM do Próximo Serviço"
                name="nextServiceKm"
              >
                <InputNumber
                  placeholder="50000"
                  min={0}
                  style={{ width: "100%" }}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={(value) => value!.replace(/\./g, '')}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  )
}