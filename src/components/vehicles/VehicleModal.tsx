import React from 'react';
import {
  Modal,
  Descriptions,
  Typography,
  Space,
  Tag,
  Avatar,
  Divider,
  Button,
  Row,
  Col,
  Card,
  Statistic
} from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  HistoryOutlined,
  FileTextOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { Vehicle, VehicleStatus } from '../../@types/vehicle.types';

const { Title, Text } = Typography;

interface VehicleModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  visible,
  vehicle,
  onClose
}) => {
  if (!vehicle) return null;

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

  const getDaysSinceCreated = (date: Date): number => {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - date.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getColorIndicator = (color: string) => (
    <div
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '50%',
        backgroundColor: color.toLowerCase() === 'branco' ? '#f0f0f0' :
                       color.toLowerCase() === 'preto' ? '#000000' :
                       color.toLowerCase() === 'prata' ? '#c0c0c0' :
                       color.toLowerCase() === 'cinza' ? '#808080' :
                       color.toLowerCase() === 'azul' ? '#1890ff' :
                       color.toLowerCase() === 'vermelho' ? '#f5222d' :
                       '#52c41a',
        border: '1px solid #d9d9d9',
        display: 'inline-block',
        marginRight: '8px'
      }}
    />
  );

  return (
    <Modal
      title={null}
      open={visible}
      onCancel={onClose}
      footer={[
        <Button key="events" type="primary" icon={<SettingOutlined />}>
          Ver Eventos
        </Button>,
        <Button key="report" icon={<FileTextOutlined />}>
          Gerar Relatório
        </Button>,
        <Button key="close" onClick={onClose}>
          Fechar
        </Button>
      ]}
      width={800}
      style={{ top: 20 }}
    >
      {/* Header */}
      <div style={{ marginBottom: '24px', textAlign: 'center' }}>
        <Avatar
          size={80}
          style={{
            backgroundColor: getColorByBrand(vehicle.brand),
            fontSize: '32px',
            marginBottom: '16px'
          }}
          icon={<CarOutlined />}
        />
        <Title level={2} style={{ margin: '0 0 8px 0' }}>
          {vehicle.brand} {vehicle.model}
        </Title>
        <Space size="middle">
          <Tag color={getColorByBrand(vehicle.brand)} style={{ fontSize: '14px', padding: '4px 12px' }}>
            {vehicle.brand}
          </Tag>
          <Tag color={vehicle.status === VehicleStatus.SOLD ? 'volcano' : 'success'} style={{ fontSize: '14px', padding: '4px 12px' }}>
            {vehicle.status === VehicleStatus.SOLD ? 'Vendido' : 'Ativo'}
          </Tag>
        </Space>
      </div>

      <Divider />

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="Idade do Veículo"
              value={getVehicleAge(vehicle.year)}
              suffix="anos"
              valueStyle={{ color: '#1890ff' }}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Quilometragem"
              value={vehicle.mileage}
              formatter={value => formatMileage(Number(value))}
              valueStyle={{ color: '#52c41a' }}
              prefix={<DashboardOutlined />}
              suffix="km"
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Dias no Sistema"
              value={getDaysSinceCreated(vehicle.createdAt)}
              suffix="dias"
              valueStyle={{ color: '#722ed1' }}
              prefix={<HistoryOutlined />}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="Eventos"
              value={0} // Será implementado com dados reais
              suffix="registrados"
              valueStyle={{ color: '#faad14' }}
              prefix={<SettingOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Vehicle Details */}
      <Descriptions
        title="Informações do Veículo"
        bordered
        column={2}
        size="middle"
        labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
      >
        <Descriptions.Item label="Placa" span={1}>
          <Text strong style={{ fontSize: '16px', color: '#1890ff' }}>
            {vehicle.plate}
          </Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="RENAVAM" span={1}>
          <Text code>{vehicle.renavam}</Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="Marca" span={1}>
          <Space>
            <Tag color={getColorByBrand(vehicle.brand)}>{vehicle.brand}</Tag>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Modelo" span={1}>
          <Text strong>{vehicle.model}</Text>
        </Descriptions.Item>
        
        <Descriptions.Item label="Ano de Fabricação" span={1}>
          <Space>
            <CalendarOutlined style={{ color: '#8c8c8c' }} />
            <Text strong>{vehicle.year}</Text>
            <Text type="secondary">({getVehicleAge(vehicle.year)} anos)</Text>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Cor" span={1}>
          <Space>
            {getColorIndicator(vehicle.color)}
            <Text strong>{vehicle.color}</Text>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Quilometragem Atual" span={2}>
          <Space>
            <DashboardOutlined style={{ color: '#52c41a' }} />
            <Text strong style={{ fontSize: '16px' }}>
              {formatMileage(vehicle.mileage)} km
            </Text>
          </Space>
        </Descriptions.Item>
      </Descriptions>

      <Divider />

      {/* Timeline Information */}
      <Descriptions
        title="Histórico"
        column={1}
        size="middle"
        labelStyle={{ fontWeight: 'bold', backgroundColor: '#fafafa' }}
        bordered
      >
        <Descriptions.Item label="Data de Cadastro">
          <Space>
            <CalendarOutlined style={{ color: '#1890ff' }} />
            <Text>{vehicle.createdAt.toLocaleDateString('pt-BR')}</Text>
            <Text type="secondary">
              ({getDaysSinceCreated(vehicle.createdAt)} dias atrás)
            </Text>
          </Space>
        </Descriptions.Item>
        
        <Descriptions.Item label="Última Atualização">
          <Space>
            <HistoryOutlined style={{ color: '#8c8c8c' }} />
            <Text>{vehicle.updatedAt.toLocaleDateString('pt-BR')}</Text>
          </Space>
        </Descriptions.Item>
        
        {vehicle.status === VehicleStatus.SOLD && vehicle.soldAt && (
          <Descriptions.Item label="Data da Venda">
            <Space>
              <Tag color="volcano">Vendido</Tag>
              <Text>{vehicle.soldAt.toLocaleDateString('pt-BR')}</Text>
            </Space>
          </Descriptions.Item>
        )}
      </Descriptions>

      {/* Action Buttons Section */}
      <div style={{ 
        marginTop: '24px', 
        padding: '16px', 
        backgroundColor: '#fafafa', 
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <Title level={5} style={{ marginBottom: '16px' }}>
          Próximos Passos
        </Title>
        <Space size="middle">
          <Button type="primary" icon={<SettingOutlined />} size="large">
            Registrar Evento
          </Button>
          <Button icon={<FileTextOutlined />} size="large">
            Gerar QR Code
          </Button>
          <Button icon={<HistoryOutlined />} size="large">
            Ver Histórico Completo
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default VehicleModal;