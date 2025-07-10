import { Card, Tag, Button, Space, Avatar, Dropdown, Modal, message } from "antd"
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  CarOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
  ToolOutlined,
  BarChartOutlined
} from "@ant-design/icons"
import { Link } from "react-router-dom"

const { confirm } = Modal

interface VehicleCardProps {
  vehicle: {
    id: number
    name: string
    brand: string
    model: string
    year: number
    plate: string
    color: string
    km: number
    fuelType: string
    lastService: string
    nextService: string
    status: string
    eventsCount: number
    totalCost: number
  }
}

export default function VehicleCard({ vehicle }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ok":
        return "green"
      case "warning":
        return "orange"
      case "critical":
        return "red"
      default:
        return "default"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ok":
        return "Em dia"
      case "warning":
        return "Atenção"
      case "critical":
        return "Crítico"
      default:
        return "Desconhecido"
    }
  }

  const handleDelete = (id: number, name: string) => {
    confirm({
      title: "Confirmar exclusão",
      icon: <ExclamationCircleOutlined />,
      content: `Tem certeza que deseja excluir o veículo "${name}"? Esta ação não pode ser desfeita.`,
      okText: "Sim, excluir",
      okType: "danger",
      cancelText: "Cancelar",
      onOk() {
        message.success(`Veículo "${name}" excluído com sucesso!`)
      },
    })
  }

  const getMenuItems = (record: any) => [
    {
      key: "edit",
      label: (
        <Link to={`/vehicles/${record.id}/edit`}>
          <Space>
            <EditOutlined />
            Editar
          </Space>
        </Link>
      ),
    },
    {
      type: "divider",
    },
    {
      key: "delete",
      label: (
        <Space>
          <DeleteOutlined />
          Excluir
        </Space>
      ),
      danger: true,
      onClick: () => handleDelete(record.id, record.name),
    },
  ]

  return (
    <Card
      style={{ 
        width: "100%", 
        height: "100%",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        borderRadius: "8px"
      }}
      bodyStyle={{ padding: "20px" }}
      actions={[
        <Link to={`/vehicles/${vehicle.id}/info`} key="info">
          <Button type="text" icon={<EyeOutlined />} size="large">
            Informações
          </Button>
        </Link>,
        <Link to={`/vehicles/${vehicle.id}/services`} key="services">
          <Button type="text" icon={<ToolOutlined />} size="large">
            Serviços
          </Button>
        </Link>,
        <Link to={`/vehicles/${vehicle.id}/dashboard`} key="dashboard">
          <Button type="text" icon={<BarChartOutlined />} size="large">
            Dashboard
          </Button>
        </Link>,
      ]}
    >
      <div style={{ display: "flex", alignItems: "center", marginBottom: "16px" }}>
        <Avatar 
          size={48} 
          style={{ backgroundColor: "#2F54EB", marginRight: "12px" }} 
          icon={<CarOutlined />} 
        />
        <div style={{ flex: 1 }}>
          <div style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "#262626", 
            marginBottom: "4px" 
          }}>
            {vehicle.name}
          </div>
          <div style={{ color: "#8c8c8c", fontSize: "14px" }}>
            Placa: {vehicle.plate}
          </div>
        </div>
        <Dropdown menu={{ items: getMenuItems(vehicle) }} trigger={["click"]}>
          <Button type="text" icon={<MoreOutlined />} />
        </Dropdown>
      </div>

      <div style={{ marginBottom: "16px" }}>
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Status:</span>
          <Tag color={getStatusColor(vehicle.status)}>{getStatusText(vehicle.status)}</Tag>
        </div>
        
        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Marca/Modelo:</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            {vehicle.brand} {vehicle.model}
          </span>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Ano:</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>{vehicle.year}</span>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Quilometragem:</span>
          <span style={{ fontSize: "14px", fontWeight: "500" }}>
            {vehicle.km.toLocaleString()} km
          </span>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "8px"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Eventos:</span>
          <span style={{ color: "#2F54EB", fontWeight: "500", fontSize: "14px" }}>
            {vehicle.eventsCount} eventos
          </span>
        </div>

        <div style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center"
        }}>
          <span style={{ color: "#595959", fontSize: "14px" }}>Gasto Total:</span>
          <span style={{ color: "#722ED1", fontWeight: "600", fontSize: "16px" }}>
            R$ {vehicle.totalCost.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>
    </Card>
  )
}