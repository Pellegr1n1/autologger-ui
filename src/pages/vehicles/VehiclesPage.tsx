import { useState } from "react"
import { Card, Button, Row, Col, Typography, Empty, Alert } from "antd"
import { PlusOutlined, CarOutlined } from "@ant-design/icons"
import { Link } from "react-router-dom"
import VehicleCard from "../../components/vehicle/VehicleCard"

const { Title } = Typography

export default function VehiclesPage() {
  const [loading, setLoading] = useState(false)

  const vehicles = [
    {
      id: 1,
      name: "Honda Civic 2020",
      brand: "Honda",
      model: "Civic",
      year: 2020,
      plate: "ABC-1234",
      color: "Prata",
      km: 45000,
      fuelType: "Flex",
      lastService: "2024-01-15",
      nextService: "2024-04-15",
      status: "ok",
      eventsCount: 15,
      totalCost: 8500.0,
    },
    {
      id: 2,
      name: "Toyota Corolla 2019",
      brand: "Toyota",
      model: "Corolla",
      year: 2019,
      plate: "XYZ-5678",
      color: "Branco",
      km: 62000,
      fuelType: "Flex",
      lastService: "2023-12-10",
      nextService: "2024-02-10",
      status: "warning",
      eventsCount: 22,
      totalCost: 12300.0,
    },
  ]

  const maxVehicles = 2
  const canAddVehicle = vehicles.length < maxVehicles

  return (
    <div style={{ padding: "24px" }}>
      <Card>
        <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
          <Col>
            <Title level={2} style={{ margin: 0 }}>
              Meus Veículos
            </Title>
            <p style={{ color: "#8c8c8c", margin: 0 }}>
              Gerencie seus veículos ({vehicles.length}/{maxVehicles})
            </p>
          </Col>
          <Col>
            {canAddVehicle ? (
              <Link to="/vehicles/add">
                <Button type="primary" icon={<PlusOutlined />} size="large">
                  Adicionar Veículo
                </Button>
              </Link>
            ) : (
              <Button disabled size="large">
                Limite máximo atingido
              </Button>
            )}
          </Col>
        </Row>

        {!canAddVehicle && (
          <Alert
            message="Limite de veículos atingido"
            description="Você já cadastrou o número máximo de 2 veículos. Para adicionar um novo veículo, você precisa remover um dos existentes."
            type="info"
            showIcon
            style={{ marginBottom: 24 }}
          />
        )}

        {vehicles.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <div>
                <p>Nenhum veículo cadastrado</p>
                <p style={{ color: "#8c8c8c", fontSize: "14px" }}>
                  Adicione seu primeiro veículo para começar
                </p>
              </div>
            }
          >
            <Link to="/vehicles/add">
              <Button type="primary" icon={<PlusOutlined />}>
                Adicionar Primeiro Veículo
              </Button>
            </Link>
          </Empty>
        ) : (
          <Row gutter={[24, 24]}>
            {vehicles.map((vehicle) => (
              <Col xs={24} lg={12} key={vehicle.id}>
                <VehicleCard vehicle={vehicle} />
              </Col>
            ))}
          </Row>
        )}
      </Card>
    </div>
  )
}