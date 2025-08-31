import { Button, Dropdown, Flex, Space, Tag, Typography, Image, Tooltip } from "antd"
import { 
  MoreOutlined, 
  EditOutlined, 
  ToolOutlined, 
  HistoryOutlined, 
  FileTextOutlined,
  PlusOutlined,
  EyeOutlined
} from "@ant-design/icons"
import type { Vehicle } from "../types/vehicle.types"
import { kmFormat } from "../../../utils/format"
import { API_CONFIG } from "../../../config/api"
import type { MenuProps } from 'antd'

const { Title, Text } = Typography

type Props = {
  vehicle?: Vehicle
  onEdit?: (vehicle: Vehicle) => void
  onAddMaintenance?: (vehicleId: string) => void
  onViewHistory?: (vehicleId: string) => void
  onViewDocuments?: (vehicleId: string) => void
}

export default function VehicleDetailsHeader({ 
  vehicle, 
  onEdit, 
  onAddMaintenance, 
  onViewHistory, 
  onViewDocuments 
}: Props) {
  const sold = Boolean(vehicle?.soldAt)
  
  if (!vehicle) return null;
  
  // Construir URL completa da foto usando configuração centralizada
  const photoUrl = vehicle.photoUrl ? API_CONFIG.buildStaticUrl(vehicle.photoUrl) : undefined;
  
  // Menu de ações rápidas
  const quickActionsMenu: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Editar Dados',
      onClick: () => onEdit?.(vehicle)
    },
    {
      key: 'maintenance',
      icon: <ToolOutlined />,
      label: 'Nova Manutenção',
      onClick: () => onAddMaintenance?.(vehicle.id)
    },
    {
      key: 'history',
      icon: <HistoryOutlined />,
      label: 'Ver Histórico',
      onClick: () => onViewHistory?.(vehicle.id)
    },
    {
      key: 'documents',
      icon: <FileTextOutlined />,
      label: 'Documentos',
      onClick: () => onViewDocuments?.(vehicle.id)
    }
  ];
  
  return (
    <div style={{ 
      background: 'var(--surface-color)', 
      borderRadius: '16px',
      padding: '32px',
      border: '1px solid rgba(139, 92, 246, 0.2)',
      marginBottom: '24px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
    }}>
      {/* Cabeçalho principal */}
      <Flex align="center" justify="space-between" style={{ marginBottom: '24px' }}>
        <div>
          <Title level={2} style={{ margin: 0, marginBottom: '8px', color: 'var(--text-primary)' }}>
            {vehicle.brand} {vehicle.model}
          </Title>
          <Text style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
            {vehicle.year} • {vehicle.color} • {kmFormat(vehicle.mileage)} km
          </Text>
        </div>
        
        <Flex gap="small" align="center">
          <Tag 
            color={sold ? "red" : "green"} 
            style={{ 
              fontSize: '12px', 
              padding: '4px 8px',
              borderRadius: '8px',
              fontWeight: 600
            }}
          >
            {sold ? "Vendido" : "Ativo"}
          </Tag>
          
          {/* Menu de ações rápidas */}
          <Dropdown
            menu={{ items: quickActionsMenu }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            />
          </Dropdown>
        </Flex>
      </Flex>
      
      {/* Conteúdo principal com foto e informações */}
      <Flex gap="large" align="flex-start">
        {/* Foto do veículo */}
        <div style={{ position: "relative" }}>
          <Image
            src={photoUrl || "/placeholder.svg?height=200&width=300&query=foto%20de%20carro"}
            alt="Foto do veículo"
            width={300}
            height={200}
            style={{ 
              borderRadius: '12px', 
              objectFit: "cover", 
              border: '1px solid rgba(139, 92, 246, 0.2)',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.2)'
            }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjM0Y0NTciLz4KPHN2ZyB4PSIxMDAiIHk9IjUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSIjNkI3MjgwIj4KPHBhdGggZD0iTTEyIDJDNi40OCAyIDIgNi40OCAyIDEyczQuNDggMTAgMTAgMTAgMTAtNC40OCAxMC0xMFMxNy41MiAyIDEyIDJ6bTAgMThjLTQuNDEgMC04LTMuNTktOC04czMuNTktOCA4LTggOCAzLjU5IDggOC0zLjU5IDgtOCA4em0tNS01YzAgMi43NiAyLjI0IDUgNSA1czUtMi4yNCA1LTUtMi4yNC01LTUtNS01IDUgMi4yNCA1IDV6Ii8+Cjwvc3ZnPgo8L3N2Zz4K"
          />
          {sold && (
            <Tag 
              color="red" 
              style={{ 
                position: "absolute", 
                top: '8px', 
                right: '8px',
                fontSize: '11px',
                fontWeight: 600,
                padding: '4px 8px',
                borderRadius: '8px'
              }}
            >
              VENDIDO
            </Tag>
          )}
        </div>
        
        {/* Informações principais */}
        <div style={{ flex: 1 }}>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Placa */}
            <div>
              <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                Placa
              </Text>
              <Text strong style={{ fontSize: '32px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {vehicle.plate}
              </Text>
            </div>
            
            {/* RENAVAM */}
            <div>
              <Text style={{ fontSize: '14px', color: 'var(--text-secondary)', display: 'block', marginBottom: '8px' }}>
                RENAVAM
              </Text>
              <Text style={{ fontSize: '18px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
                {vehicle.renavam}
              </Text>
            </div>
            
            {/* Botões de ação rápida */}
            {!sold && (
              <div style={{ marginTop: '16px' }}>
                <Space size="middle">
                  <Tooltip title="Adicionar nova manutenção">
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      onClick={() => onAddMaintenance?.(vehicle.id)}
                      style={{
                        background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 600
                      }}
                    >
                      Nova Manutenção
                    </Button>
                  </Tooltip>
                  
                  <Tooltip title="Ver histórico completo">
                    <Button
                      icon={<HistoryOutlined />}
                      onClick={() => onViewHistory?.(vehicle.id)}
                      style={{
                        border: '1px solid rgba(139, 92, 246, 0.2)',
                        borderRadius: '8px',
                        color: 'var(--primary-color)'
                      }}
                    >
                      Histórico
                    </Button>
                  </Tooltip>
                </Space>
              </div>
            )}
          </Space>
        </div>
      </Flex>
    </div>
  )
}
