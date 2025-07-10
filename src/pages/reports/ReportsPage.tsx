import { useState } from "react"
import { Layout, Card, Row, Col, Statistic, Typography, Button, Tag, Space, Avatar, List } from "antd"
import {
  CarOutlined,
  DollarOutlined,
  ToolOutlined,
  BellOutlined,
  PlusOutlined,
  EyeOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { Header, Content, Sider } = Layout
const { Title, Text } = Typography

export default function ReportsPage() {
  const [collapsed, setCollapsed] = useState(false)

  const vehicles = [
    {
      id: 1,
      name: "Honda Civic 2020",
      plate: "ABC-1234",
      km: 45000,
      lastService: "2024-01-15",
      status: "ok",
    },
    {
      id: 2,
      name: "Toyota Corolla 2019",
      plate: "XYZ-5678",
      km: 62000,
      lastService: "2023-12-10",
      status: "warning",
    },
  ]

  const recentEvents = [
    {
      id: 1,
      type: "maintenance",
      description: "Troca de óleo",
      vehicle: "Honda Civic 2020",
      date: "2024-01-15",
      cost: 150.0,
      verified: true,
    },
    {
      id: 2,
      type: "fuel",
      description: "Abastecimento",
      vehicle: "Honda Civic 2020",
      date: "2024-01-10",
      cost: 85.5,
      verified: true,
    },
    {
      id: 3,
      type: "expense",
      description: "IPVA 2024",
      vehicle: "Toyota Corolla 2019",
      date: "2024-01-05",
      cost: 1200.0,
      verified: false,
    },
  ]

  const upcomingMaintenance = [
    {
      vehicle: "Honda Civic 2020",
      service: "Revisão dos 50.000 km",
      dueDate: "2024-02-15",
      priority: "high",
    },
    {
      vehicle: "Toyota Corolla 2019",
      service: "Troca de pneus",
      dueDate: "2024-03-01",
      priority: "medium",
    },
  ]

  const getEventIcon = (type: string) => {
    switch (type) {
      case "maintenance":
        return <ToolOutlined />
      case "fuel":
        return <BellOutlined />
      case "expense":
        return <DollarOutlined />
      default:
        return <CarOutlined />
    }
  }

  const getEventColor = (type: string) => {
    switch (type) {
      case "maintenance":
        return "#722ED1"
      case "fuel":
        return "#13C2C2"
      case "expense":
        return "#FAAD14"
      default:
        return "#2F54EB"
    }
  }

  return (
    <Layout>
      <Header>
        <div>
          <Title level={3} style={{ color: "white", margin: 0 }}>
            AutoLogger Dashboard
          </Title>
          <Space>
            <Avatar size="large" style={{ backgroundColor: "#722ED1" }}>
              U
            </Avatar>
          </Space>
        </div>
      </Header>

      <Content>
        <div>
          <Row gutter={[24, 24]} style={{ marginBottom: 32 }}>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Veículos Cadastrados"
                  value={2}
                  prefix={<CarOutlined />}
                  valueStyle={{ color: "#2F54EB" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Gastos Este Mês"
                  value={1435.5}
                  prefix={<DollarOutlined />}
                  valueStyle={{ color: "#722ED1" }}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Eventos Registrados"
                  value={24}
                  prefix={<ToolOutlined />}
                  valueStyle={{ color: "#13C2C2" }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card>
                <Statistic
                  title="Verificados na Blockchain"
                  value={22}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: "#52C41A" }}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]}>
            {/* Meus Veículos */}
            <Col xs={24} lg={12}>
              <Card
                title="Meus Veículos"
                extra={
                  <Link to="/vehicles/add">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Adicionar
                    </Button>
                  </Link>
                }
              >
                <List
                  dataSource={vehicles}
                  renderItem={(vehicle) => (
                    <List.Item
                      actions={[
                        <Link to={`/vehicles/${vehicle.id}`} key="view">
                          <Button type="text" icon={<EyeOutlined />}>
                            Ver
                          </Button>
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: vehicle.status === "ok" ? "#52C41A" : "#FAAD14",
                            }}
                          >
                            <CarOutlined />
                          </Avatar>
                        }
                        title={vehicle.name}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>Placa: {vehicle.plate}</Text>
                            <Text>Quilometragem: {vehicle.km.toLocaleString()} km</Text>
                            <Text>Último serviço: {vehicle.lastService}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>

            <Col xs={24} lg={12}>
              <Card title="Manutenções Programadas">
                <List
                  dataSource={upcomingMaintenance}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: item.priority === "high" ? "#F5222D" : "#FAAD14",
                            }}
                          >
                            {item.priority === "high" ? <WarningOutlined /> : <ClockCircleOutlined />}
                          </Avatar>
                        }
                        title={item.service}
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{item.vehicle}</Text>
                            <Text>Vencimento: {item.dueDate}</Text>
                            <Tag color={item.priority === "high" ? "red" : "orange"}>
                              {item.priority === "high" ? "Alta Prioridade" : "Média Prioridade"}
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>

          <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
            <Col span={24}>
              <Card
                title="Eventos Recentes"
                extra={
                  <Link to="/events/add">
                    <Button type="primary" icon={<PlusOutlined />}>
                      Novo Evento
                    </Button>
                  </Link>
                }
              >
                <List
                  dataSource={recentEvents}
                  renderItem={(event) => (
                    <List.Item
                      actions={[
                        <Link to={`/events/${event.id}`} key="view">
                          <Button type="text">Ver Detalhes</Button>
                        </Link>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar style={{ backgroundColor: getEventColor(event.type) }}>
                            {getEventIcon(event.type)}
                          </Avatar>
                        }
                        title={
                          <Space>
                            {event.description}
                            {event.verified ? <Tag color="green">Verificado</Tag> : <Tag color="orange">Pendente</Tag>}
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size="small">
                            <Text>{event.vehicle}</Text>
                            <Text>Data: {event.date}</Text>
                            <Text strong>R$ {event.cost.toFixed(2)}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
          </Row>
        </div>
      </Content>
    </Layout>
  )
}
