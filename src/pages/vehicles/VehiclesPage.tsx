import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Button,
  Typography,
  Space,
  Empty,
  Spin,
  message,
  Tabs,
  Badge
} from 'antd';
import {
  PlusOutlined,
  CarOutlined,
  HistoryOutlined
} from '@ant-design/icons';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleForm from '../../components/vehicles/VehicleForm';
import VehicleModal from '../../components/vehicles/VehicleModal';
import { Vehicle, VehicleStatus } from '../../@types/vehicle.types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [soldVehicles, setSoldVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    loadVehicles();
  }, []);

  const loadVehicles = async () => {
    setLoading(true);
    try {
      // Simulando dados - substituir pela chamada real da API
      const mockVehicles: Vehicle[] = [
        {
          id: '1',
          plate: 'ABC-1234',
          brand: 'Toyota',
          model: 'Corolla',
          year: 2020,
          color: 'Prata',
          renavam: '12345678901',
          mileage: 45000,
          status: VehicleStatus.ACTIVE,
          createdAt: new Date('2023-01-15'),
          updatedAt: new Date('2024-01-15')
        },
        {
          id: '2',
          plate: 'XYZ-5678',
          brand: 'Honda',
          model: 'Civic',
          year: 2019,
          color: 'Preto',
          renavam: '98765432109',
          mileage: 32000,
          status: VehicleStatus.ACTIVE,
          createdAt: new Date('2023-06-10'),
          updatedAt: new Date('2024-01-10')
        }
      ];

      const mockSoldVehicles: Vehicle[] = [
        {
          id: '3',
          plate: 'DEF-9999',
          brand: 'Volkswagen',
          model: 'Golf',
          year: 2018,
          color: 'Branco',
          renavam: '11111111111',
          mileage: 65000,
          status: VehicleStatus.SOLD,
          soldAt: new Date('2023-12-01'),
          createdAt: new Date('2022-03-20'),
          updatedAt: new Date('2023-12-01')
        }
      ];

      setVehicles(mockVehicles);
      setSoldVehicles(mockSoldVehicles);
    } catch (error) {
      message.error('Erro ao carregar veículos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVehicle = () => {
    setEditingVehicle(null);
    setIsFormVisible(true);
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormVisible(true);
  };

  const handleViewVehicle = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    try {
      if (editingVehicle) {
        // Atualizar veículo existente
        const updatedVehicles = vehicles.map(v => 
          v.id === editingVehicle.id ? { ...v, ...values } : v
        );
        setVehicles(updatedVehicles);
        message.success('Veículo atualizado com sucesso!');
      } else {
        // Criar novo veículo
        const newVehicle: Vehicle = {
          id: Date.now().toString(),
          ...values,
          status: VehicleStatus.ACTIVE,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        setVehicles([...vehicles, newVehicle]);
        message.success('Veículo cadastrado com sucesso!');
      }
      setIsFormVisible(false);
    } catch (error) {
      message.error('Erro ao salvar veículo');
    }
  };

  const handleSellVehicle = async (vehicleId: string) => {
    try {
      const vehicleToSell = vehicles.find(v => v.id === vehicleId);
      if (vehicleToSell) {
        const soldVehicle = {
          ...vehicleToSell,
          status: VehicleStatus.SOLD,
          soldAt: new Date(),
          updatedAt: new Date()
        };
        
        setVehicles(vehicles.filter(v => v.id !== vehicleId));
        setSoldVehicles([...soldVehicles, soldVehicle]);
        message.success('Veículo marcado como vendido!');
      }
    } catch (error) {
      message.error('Erro ao marcar veículo como vendido');
    }
  };

  const canAddNewVehicle = vehicles.length < 2;

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <Row justify="space-between" align="middle" style={{ marginBottom: '24px' }}>
        <Col>
          <Title level={2} style={{ margin: 0, display: 'flex', alignItems: 'center' }}>
            <CarOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
            Meus Veículos
          </Title>
          <Text type="secondary">
            Gerencie seus veículos e acompanhe o histórico de manutenções
          </Text>
        </Col>
        <Col>
          <Button
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={handleCreateVehicle}
            disabled={!canAddNewVehicle}
          >
            Adicionar Veículo
          </Button>
        </Col>
      </Row>

      {!canAddNewVehicle && (
        <Card style={{ marginBottom: '16px', borderColor: '#faad14' }}>
          <Text type="warning">
            <strong>Limite atingido:</strong> Você pode ter no máximo 2 veículos ativos. 
            Marque um veículo como vendido para adicionar um novo.
          </Text>
        </Card>
      )}

      <Tabs defaultActiveKey="active" size="large">
        <TabPane
          tab={
            <Space>
              <CarOutlined />
              Veículos Ativos
              <Badge count={vehicles.length} showZero color="#52c41a" />
            </Space>
          }
          key="active"
        >
          {vehicles.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical">
                    <Text>Nenhum veículo cadastrado</Text>
                    <Text type="secondary">Adicione seu primeiro veículo para começar</Text>
                  </Space>
                }
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleCreateVehicle}
                >
                  Cadastrar Veículo
                </Button>
              </Empty>
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {vehicles.map(vehicle => (
                <Col xs={24} sm={12} lg={8} xl={6} key={vehicle.id}>
                  <VehicleCard
                    vehicle={vehicle}
                    onView={() => handleViewVehicle(vehicle)}
                    onEdit={() => handleEditVehicle(vehicle)}
                    onSell={() => handleSellVehicle(vehicle.id)}
                  />
                </Col>
              ))}
            </Row>
          )}
        </TabPane>

        <TabPane
          tab={
            <Space>
              <HistoryOutlined />
              Veículos Anteriores
              <Badge count={soldVehicles.length} showZero color="#8c8c8c" />
            </Space>
          }
          key="sold"
        >
          {soldVehicles.length === 0 ? (
            <Card>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Nenhum veículo vendido"
              />
            </Card>
          ) : (
            <Row gutter={[16, 16]}>
              {soldVehicles.map(vehicle => (
                <Col xs={24} sm={12} lg={8} xl={6} key={vehicle.id}>
                  <VehicleCard
                    vehicle={vehicle}
                    onView={() => handleViewVehicle(vehicle)}
                    showSoldBadge
                  />
                </Col>
              ))}
            </Row>
          )}
        </TabPane>
      </Tabs>

      {/* Form Modal */}
      <VehicleForm
        visible={isFormVisible}
        vehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        onCancel={() => setIsFormVisible(false)}
      />

      {/* View Modal */}
      <VehicleModal
        visible={isModalVisible}
        vehicle={selectedVehicle}
        onClose={() => setIsModalVisible(false)}
      />
    </div>
  );
};

export default VehiclesPage;