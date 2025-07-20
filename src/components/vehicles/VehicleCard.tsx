import React from 'react';
import {
  Card,
  Space,
  Typography,
  Button,
  Tag,
  Dropdown,
  Menu,
  Badge,
  Avatar,
  Tooltip
} from 'antd';
import {
  CarOutlined,
  EyeOutlined,
  EditOutlined,
  MoreOutlined,
  DollarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Vehicle, VehicleStatus } from '../../@types/vehicle.types';

const { Text, Title } = Typography;

interface VehicleCardProps {
  vehicle: Vehicle;
  onView?: () => void;
  onEdit?: () => void;
  onSell?: () => void;
  showSoldBadge?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onView,
  onEdit,
  onSell,
  showSoldBadge = false
}) => {
  const getColorByBrand = (brand: string): string => {
    const colors: { [key: string]: string } = {
      Toyota: '#52c41a',
      Honda: '#1890ff',
      Volkswagen: '#722ed1',
      Ford: '#13c2c2',
      Chevrolet: '#faad14',
      Nissan: '#f5222d',
      Hyundai: '#eb2f96'
    };
    return colors[brand] || '#8c8c8c';
  };

  const formatMileage = (mileage: number): string => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  const getVehicleAge = (year: number): number => {
    return new Date().getFullYear() - year;
  };

  const menu = (
    <Menu>
      {onView && (
        <Menu.Item key="view" icon={<EyeOutlined />} onClick={onView}>
          Visualizar
        </Menu.Item>
      )}
      {onEdit && (
        <Menu.Item key="edit" icon={<EditOutlined />} onClick={onEdit}>
          Editar
        </Menu.Item>
      )}
      {onSell && (
        <Menu.Item key="sell" icon={<DollarOutlined />} onClick={onSell}>
          Marcar como Vendido
        </Menu.Item>
      )}
      <Menu.Item key="events" icon={<SettingOutlined />}>
        Eventos e Manutenções
      </Menu.Item>
    </Menu>
  );

  return (
    <Badge.Ribbon
      text={showSoldBadge ? 'Vendido' : undefined}
      color={showSoldBadge ? 'volcano' : undefined}
      style={{ display: showSoldBadge ? 'block' : 'none' }}
    >
      <Card
        hoverable={!showSoldBadge}
        style={{
          height: '100%',
          opacity: showSoldBadge ? 0.8 : 1,
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}
        bodyStyle={{ padding: '20px' }}
        actions={vehicle.status === VehicleStatus.ACTIVE ? [
          <Tooltip title="Visualizar detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={onView}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>,
          <Tooltip title="Editar veículo">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={onEdit}
              style={{ color: '#52c41a' }}
            />
          </Tooltip>,
          <Dropdown overlay={menu} trigger={['click']}>
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{ color: '#8c8c8c' }}
            />
          </Dropdown>
        ] : [
          <Tooltip title="Visualizar detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              onClick={onView}
              style={{ color: '#1890ff' }}
            />
          </Tooltip>
        ]}
      >
        {/* Header */}
        <div style={{ marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Avatar
              size={48}
              style={{
                backgroundColor: getColorByBrand(vehicle.brand),
                fontSize: '18px'
              }}
              icon={<CarOutlined />}
            />
            <Tag color={getColorByBrand(vehicle.brand)} style={{ margin: 0 }}>
              {vehicle.brand}
            </Tag>
          </div>
        </div>

        {/* Vehicle Info */}
        <div style={{ marginBottom: '16px' }}>
          <Title level={4} style={{ margin: '0 0 4px 0', fontSize: '18px' }}>
            {vehicle.model}
          </Title>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            {vehicle.plate}
          </Text>
        </div>

        {/* Details */}
        <Space direction="vertical" size="small" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="small">
              <CalendarOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">Ano:</Text>
            </Space>
            <Text strong>
              {vehicle.year} 
              {getVehicleAge(vehicle.year) > 0 && (
                <Text type="secondary" style={{ marginLeft: '4px' }}>
                  ({getVehicleAge(vehicle.year)} anos)
                </Text>
              )}
            </Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Space size="small">
              <DashboardOutlined style={{ color: '#8c8c8c' }} />
              <Text type="secondary">Km:</Text>
            </Space>
            <Text strong>{formatMileage(vehicle.mileage)}</Text>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text type="secondary">Cor:</Text>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div
                style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: vehicle.color.toLowerCase() === 'branco' ? '#f0f0f0' :
                                 vehicle.color.toLowerCase() === 'preto' ? '#000000' :
                                 vehicle.color.toLowerCase() === 'prata' ? '#c0c0c0' :
                                 vehicle.color.toLowerCase() === 'cinza' ? '#808080' :
                                 vehicle.color.toLowerCase() === 'azul' ? '#1890ff' :
                                 vehicle.color.toLowerCase() === 'vermelho' ? '#f5222d' :
                                 '#52c41a',
                  border: '1px solid #d9d9d9',
                  marginRight: '8px'
                }}
              />
              <Text strong>{vehicle.color}</Text>
            </div>
          </div>

          {showSoldBadge && vehicle.soldAt && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">Vendido em:</Text>
              <Text strong>{vehicle.soldAt.toLocaleDateString('pt-BR')}</Text>
            </div>
          )}
        </Space>

        {/* Status indicator */}
        {vehicle.status === VehicleStatus.ACTIVE && (
          <div style={{ marginTop: '16px', textAlign: 'center' }}>
            <Tag color="success" style={{ borderRadius: '12px', padding: '4px 12px' }}>
              Ativo
            </Tag>
          </div>
        )}
      </Card>
    </Badge.Ribbon>
  );
};

export default VehicleCard;