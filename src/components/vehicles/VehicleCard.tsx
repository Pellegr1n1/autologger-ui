import React from 'react';
import {
  Card,
  Space,
  Typography,
  Button,
  Tag,
  Dropdown,
  Badge,
  Tooltip,
  type MenuProps
} from 'antd';
import {
  CarOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  DollarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  SettingOutlined,
  DeleteOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { Vehicle, VehicleStatus } from '../../@types/vehicle.types';

const { Text } = Typography;

interface VehicleCardProps {
  vehicle: Vehicle;
  onView?: () => void;
  onEdit?: () => void;
  onSell?: () => void;
  onDelete?: () => void;
  showSoldBadge?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onView,
  onEdit,
  onSell,
  onDelete,
  showSoldBadge = false
}) => {
  const formatMileage = (mileage: number): string => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  const getVehicleAge = (year: number): number => {
    return new Date().getFullYear() - year;
  };

  const formatDate = (date: Date | string): string => {
    try {
      const targetDate = typeof date === 'string' ? new Date(date) : date;
      
      if (!targetDate || isNaN(targetDate.getTime())) {
        return 'Data inválida';
      }
      
      return targetDate.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  // Menu items
  const activeVehicleMenuItems: MenuProps['items'] = [
    onView && {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Visualizar Detalhes',
      onClick: onView
    },
    onEdit && {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Editar Dados',
      onClick: onEdit
    },
    onSell && {
      key: 'sell',
      icon: <DollarOutlined />,
      label: 'Marcar como Vendido',
      onClick: onSell
    },
    {
      key: 'events',
      icon: <SettingOutlined />,
      label: 'Manutenções'
    },
    onDelete && { type: 'divider' },
    onDelete && {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Excluir',
      onClick: onDelete,
      danger: true
    }
  ].filter(Boolean) as MenuProps['items'];

  const soldVehicleMenuItems: MenuProps['items'] = [
    onView && {
      key: 'view',
      icon: <EyeOutlined />,
      label: 'Visualizar Detalhes',
      onClick: onView
    },
    {
      key: 'events',
      icon: <SettingOutlined />,
      label: 'Histórico'
    },
    onDelete && { type: 'divider' },
    onDelete && {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Excluir',
      onClick: onDelete,
      danger: true
    }
  ].filter(Boolean) as MenuProps['items'];

  return (
    <div style={{ position: 'relative' }}>
      {/* Badge de vendido */}
      {showSoldBadge && (
        <div
          style={{
            position: 'absolute',
            top: 'var(--space-md)',
            right: 'var(--space-md)',
            zIndex: 10,
            background: 'var(--error-color)',
            color: 'var(--text-light)',
            padding: 'var(--space-xs) var(--space-sm)',
            borderRadius: 'var(--border-radius-sm)',
            fontSize: '12px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-sm)'
          }}
        >
          VENDIDO
        </div>
      )}

      <Card
        hoverable={!showSoldBadge}
        style={{
          height: '100%',
          background: 'var(--card-background)',
          borderRadius: 'var(--border-radius-lg)',
          border: '1px solid var(--gray-2)',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all var(--transition-normal)',
          opacity: showSoldBadge ? 0.85 : 1,
          overflow: 'hidden'
        }}
        styles={{ body: { padding: 0 } }}
        onMouseEnter={(e) => {
          if (!showSoldBadge) {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.borderColor = 'var(--primary-color)';
          }
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.borderColor = 'var(--gray-2)';
        }}
      >
        {/* Header com gradiente sutil */}
        <div
          style={{
            background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
            padding: 'var(--space-lg)',
            color: 'var(--text-light)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Decoração de fundo */}
          <div
            style={{
              position: 'absolute',
              top: '-20px',
              right: '-20px',
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.1)',
              borderRadius: '50%',
              opacity: 0.6
            }}
          />
          
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    background: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: 'var(--border-radius-md)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)'
                  }}
                >
                  <CarOutlined style={{ fontSize: '20px', color: 'var(--text-light)' }} />
                </div>
                <div>
                  <Text style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '16px' }}>
                    {vehicle.brand}
                  </Text>
                  <br />
                  <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '12px' }}>
                    {vehicle.year}
                  </Text>
                </div>
              </div>
              
              {vehicle.status === VehicleStatus.ACTIVE && (
                <div
                  style={{
                    background: 'var(--success-color)',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <CheckCircleOutlined style={{ fontSize: '14px', color: 'white' }} />
                </div>
              )}
            </div>
            
            <Text
              style={{
                color: 'var(--text-light)',
                fontSize: '18px',
                fontWeight: 700,
                letterSpacing: '0.5px'
              }}
            >
              {vehicle.plate}
            </Text>
          </Space>
        </div>

        {/* Conteúdo principal */}
        <div style={{ padding: 'var(--space-lg)' }}>
          {/* Nome do modelo */}
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <Text
              style={{
                fontSize: '18px',
                fontWeight: 600,
                color: 'var(--text-dark)',
                display: 'block',
                lineHeight: 1.3
              }}
            >
              {vehicle.model}
            </Text>
          </div>

          {/* Grid de informações */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 'var(--space-md)',
              marginBottom: 'var(--space-lg)'
            }}
          >
            <div
              style={{
                background: 'var(--gray-1)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--border-radius-sm)',
                textAlign: 'center'
              }}
            >
              <CalendarOutlined style={{ color: 'var(--gray-5)', marginBottom: 'var(--space-xs)' }} />
              <div>
                <Text style={{ fontSize: '12px', color: 'var(--gray-5)', display: 'block' }}>
                  Idade
                </Text>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {getVehicleAge(vehicle.year)} anos
                </Text>
              </div>
            </div>

            <div
              style={{
                background: 'var(--gray-1)',
                padding: 'var(--space-sm)',
                borderRadius: 'var(--border-radius-sm)',
                textAlign: 'center'
              }}
            >
              <DashboardOutlined style={{ color: 'var(--gray-5)', marginBottom: 'var(--space-xs)' }} />
              <div>
                <Text style={{ fontSize: '12px', color: 'var(--gray-5)', display: 'block' }}>
                  Quilometragem
                </Text>
                <Text style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-dark)' }}>
                  {formatMileage(vehicle.mileage)} km
                </Text>
              </div>
            </div>
          </div>

          {/* Cor e data de venda */}
          <div style={{ marginBottom: 'var(--space-lg)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
              <div
                style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  backgroundColor: 
                    vehicle.color.toLowerCase() === 'branco' ? '#f0f0f0' :
                    vehicle.color.toLowerCase() === 'preto' ? '#000000' :
                    vehicle.color.toLowerCase() === 'prata' ? '#c0c0c0' :
                    vehicle.color.toLowerCase() === 'cinza' ? '#808080' :
                    vehicle.color.toLowerCase() === 'azul' ? '#1890ff' :
                    vehicle.color.toLowerCase() === 'vermelho' ? '#f5222d' :
                    vehicle.color.toLowerCase() === 'verde' ? '#52c41a' :
                    vehicle.color.toLowerCase() === 'amarelo' ? '#fadb14' :
                    vehicle.color.toLowerCase() === 'marrom' ? '#8b4513' :
                    vehicle.color.toLowerCase() === 'bege' ? '#f5f5dc' :
                    vehicle.color.toLowerCase() === 'roxo' ? '#722ed1' :
                    vehicle.color.toLowerCase() === 'laranja' ? '#fa8c16' :
                    vehicle.color.toLowerCase() === 'rosa' ? '#eb2f96' :
                    vehicle.color.toLowerCase() === 'dourado' ? '#d4af37' :
                    'var(--gray-4)',
                  border: '2px solid var(--gray-2)',
                  boxShadow: 'var(--shadow-sm)'
                }}
              />
              <Text style={{ fontSize: '14px', color: 'var(--gray-6)' }}>
                {vehicle.color}
              </Text>
            </div>

            {showSoldBadge && vehicle.soldAt && (
              <div style={{ marginTop: 'var(--space-sm)' }}>
                <Text style={{ fontSize: '12px', color: 'var(--gray-5)' }}>
                  Vendido em: {formatDate(vehicle.soldAt)}
                </Text>
              </div>
            )}
          </div>

          {/* Ações */}
          <div
            style={{
              display: 'flex',
              gap: 'var(--space-sm)',
              borderTop: '1px solid var(--gray-2)',
              paddingTop: 'var(--space-md)'
            }}
          >
            <Tooltip title="Visualizar">
              <Button
                type="text"
                icon={<EyeOutlined />}
                onClick={onView}
                style={{
                  flex: 1,
                  height: '40px',
                  border: '1px solid var(--gray-3)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--primary-color)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--primary-color)';
                  e.currentTarget.style.background = 'var(--primary-color)';
                  e.currentTarget.style.color = 'var(--text-light)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-3)';
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'var(--primary-color)';
                }}
              />
            </Tooltip>

            {vehicle.status === VehicleStatus.ACTIVE && onEdit && (
              <Tooltip title="Editar">
                <Button
                  type="text"
                  icon={<EditOutlined />}
                  onClick={onEdit}
                  style={{
                    flex: 1,
                    height: '40px',
                    border: '1px solid var(--gray-3)',
                    borderRadius: 'var(--border-radius-sm)',
                    color: 'var(--accent-color)',
                    transition: 'all var(--transition-fast)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-color)';
                    e.currentTarget.style.background = 'var(--accent-color)';
                    e.currentTarget.style.color = 'var(--text-light)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--gray-3)';
                    e.currentTarget.style.background = 'transparent';
                    e.currentTarget.style.color = 'var(--accent-color)';
                  }}
                />
              </Tooltip>
            )}

            <Dropdown
              menu={{
                items: vehicle.status === VehicleStatus.ACTIVE 
                  ? activeVehicleMenuItems 
                  : soldVehicleMenuItems
              }}
              trigger={['click']}
              placement="bottomRight"
            >
              <Button
                type="text"
                icon={<MoreOutlined />}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid var(--gray-3)',
                  borderRadius: 'var(--border-radius-sm)',
                  color: 'var(--gray-5)',
                  transition: 'all var(--transition-fast)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-5)';
                  e.currentTarget.style.background = 'var(--gray-1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'var(--gray-3)';
                  e.currentTarget.style.background = 'transparent';
                }}
              />
            </Dropdown>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default VehicleCard;