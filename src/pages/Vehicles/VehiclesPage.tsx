import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, message, Modal, Card, Statistic, Space, Row, Col, Empty, Tabs, Tooltip, notification } from 'antd';
import { 
  FireOutlined, 
  CarOutlined,
  PlusOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import { VehicleCard, VehicleForm } from '../../components';
import { VehicleModal } from '../../features/vehicles';
import { VehicleService } from '../../features/vehicles/services/vehicleService';
import { Vehicle, UserVehicles, CreateVehicleData } from '../../features/vehicles/types/vehicle.types';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './VehiclesPage.module.css';

const { Text } = Typography;

export default function VehiclesPage() {
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const [vehicles, setVehicles] = useState<UserVehicles>({ active: [], sold: [] });
  const [loading, setLoading] = useState(true);
  const [formVisible, setFormVisible] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [sellModalVisible, setSellModalVisible] = useState(false);
  const [vehicleToSell, setVehicleToSell] = useState<Vehicle | null>(null);

  useEffect(() => {
    const checkAuthAndLoad = async () => {
      const { apiBase } = await import('../../shared/services/api');
      
      if (apiBase.isAuthenticated()) {
        loadVehicles();
      } else {
        navigate('/login');
      }
    };
    
    checkAuthAndLoad();
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getUserVehicles();
      
      const normalizedData: UserVehicles = {
        active: Array.isArray(data.active) ? data.active : [],
        sold: Array.isArray(data.sold) ? data.sold : []
      };
      
      if (normalizedData.active.length === 0 && normalizedData.sold.length === 0) {
        if (Array.isArray(data)) {
          const allVehicles = data as Vehicle[];
          normalizedData.active = allVehicles.filter(v => !v.soldAt);
          normalizedData.sold = allVehicles.filter(v => v.soldAt);
        } else if ((data as any).vehicles && Array.isArray((data as any).vehicles)) {
          const allVehicles = (data as any).vehicles as Vehicle[];
          normalizedData.active = allVehicles.filter(v => !v.soldAt);
          normalizedData.sold = allVehicles.filter(v => v.soldAt);
        }
      }
      
      setVehicles(normalizedData);
    } catch (error) {
      api.error({
        message: 'Erro ao carregar veículos',
        description: 'Não foi possível carregar sua lista de veículos. Tente novamente.',
        placement: 'bottomRight'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleView = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalVisible(true);
  };

  const handleEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setFormVisible(true);
  };

  const handleSell = (vehicle: Vehicle) => {
    setVehicleToSell(vehicle);
    setSellModalVisible(true);
  };

  const confirmSell = async () => {
    if (!vehicleToSell) return;
    
    try {
      const result = await VehicleService.markVehicleAsSold(vehicleToSell.id);
      api.success({
        message: 'Veículo vendido',
        description: 'O veículo foi marcado como vendido com sucesso.',
        placement: 'bottomRight'
      });
      setSellModalVisible(false);
      setVehicleToSell(null);
      loadVehicles();
    } catch (error) {
      api.error({
        message: 'Falha ao marcar como vendido',
        description: error.response?.data?.message || error.message,
        placement: 'bottomRight'
      });
    }
  };

  const cancelSell = () => {
    setSellModalVisible(false);
    setVehicleToSell(null);
  };


  const handleFormSubmit = async (values: CreateVehicleData) => {
    
      if (!selectedVehicle && activeVehicles.length >= 2) {
        message.warning('Limite de 2 veículos atingido. Marque um como vendido para adicionar outro.');
        return;
      }
    
    try {
      setFormLoading(true);
      
      if (selectedVehicle) {
        await VehicleService.updateVehicle(selectedVehicle.id, values);
        api.success({
          message: 'Veículo atualizado',
          description: 'As informações do veículo foram salvas com sucesso.',
          placement: 'bottomRight'
        });
      } else {
        await VehicleService.createVehicle(values);
        api.success({
          message: 'Veículo cadastrado',
          description: 'Seu veículo foi adicionado com sucesso.',
          placement: 'bottomRight'
        });
      }
      
      setFormVisible(false);
      setSelectedVehicle(null);
      loadVehicles();
    } catch (error: any) {
      const backendMessage = error?.response?.data?.message;
      const description = Array.isArray(backendMessage)
        ? backendMessage.join(', ')
        : backendMessage || (selectedVehicle ? 'Erro ao atualizar veículo' : 'Erro ao cadastrar veículo');

      api.error({
        message: selectedVehicle ? 'Falha ao atualizar veículo' : 'Falha ao cadastrar veículo',
        description,
        placement: 'bottomRight'
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    setFormVisible(false);
    setSelectedVehicle(null);
  };

  const { active: activeVehicles, sold: soldVehicles } = vehicles;
  const totalVehicles = activeVehicles.length + soldVehicles.length;
  
  const renderVehiclesList = (vehicleList: Vehicle[], showSoldBadge: boolean = false) => {
    if (vehicleList.length === 0) {
      return (
        <Empty
          description={
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                {showSoldBadge ? 'Nenhum veículo vendido' : 'Nenhum veículo cadastrado'}
              </Text>
              <Text style={{ color: 'var(--text-secondary)' }}>
                {showSoldBadge 
                  ? 'Os veículos vendidos aparecerão aqui quando você marcar algum como vendido.'
                  : 'Adicione seu primeiro veículo para começar a gerenciar sua frota com inteligência'
                }
              </Text>
            </div>
          }
          image={Empty.PRESENTED_IMAGE_SIMPLE}
        >
          {!showSoldBadge && (
            <Tooltip
              title={activeVehicles.length >= 2 ? `Limite atingido: ${activeVehicles.length}/2 veículos ativos. Marque um como vendido para adicionar outro.` : ''}
              placement="top"
            >
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setFormVisible(true)}
                disabled={activeVehicles.length >= 2}
                className={componentStyles.professionalButton}
              >
                Cadastrar Primeiro Veículo
              </Button>
            </Tooltip>
          )}
        </Empty>
      );
    }

    return (
      <div className={styles.vehicleGrid}>
        {vehicleList.map(vehicle => (
          <div key={vehicle.id} className={styles.vehicleCardWrapper}>
            <VehicleCard
              vehicle={vehicle}
              onView={() => handleView(vehicle)}
              onEdit={() => handleEdit(vehicle)}
              onSell={() => handleSell(vehicle)}
              showSoldBadge={showSoldBadge}
            />
          </div>
        ))}
      </div>
    );
  };

  return (
    <DefaultFrame title="Meus Veículos" loading={loading}>
      
      {activeVehicles.length > 0 && (
        <div className={styles.pageHeader}>
          <Tooltip
            title={activeVehicles.length >= 2 ? `Limite atingido: ${activeVehicles.length}/2 veículos ativos. Marque um como vendido para adicionar outro.` : ''}
            placement="bottom"
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setFormVisible(true);
              }}
              disabled={activeVehicles.length >= 2}
              className={componentStyles.professionalButton}
            >
              Adicionar Veículo
            </Button>
          </Tooltip>
        </div>
      )}

      <div style={{ padding: '0' }}>
        
        <div className={styles.statsSection}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Veículos Ativos"
                  value={activeVehicles.length}
                  prefix={<CarOutlined style={{ color: 'var(--primary-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Veículos Vendidos"
                  value={soldVehicles.length}
                  prefix={<CheckCircleOutlined style={{ color: 'var(--success-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Taxa de Rotatividade"
                  value={totalVehicles > 0 ? ((soldVehicles.length / totalVehicles) * 100).toFixed(1) : 0}
                  suffix="%"
                  prefix={<FireOutlined style={{ color: 'var(--warning-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
          </Row>
        </div>

        
        <div className={styles.vehiclesSection}>
          <Card className={componentStyles.professionalCard}>
            <Tabs 
              defaultActiveKey="active" 
              className={styles.vehiclesTabs}
              items={[
                {
                  key: 'active',
                  label: (
                    <Space>
                      <CarOutlined style={{ color: 'var(--primary-color)' }} />
                      Veículos Ativos
                      <span className={styles.tabBadge}>{activeVehicles.length}</span>
                    </Space>
                  ),
                  children: renderVehiclesList(activeVehicles, false)
                },
                {
                  key: 'sold',
                  label: (
                    <Space>
                      <CheckCircleOutlined style={{ color: 'var(--success-color)' }} />
                      Veículos Vendidos
                      <span className={styles.tabBadge}>{soldVehicles.length}</span>
                    </Space>
                  ),
                  children: renderVehiclesList(soldVehicles, true)
                }
              ]}
            />
          </Card>
        </div>
      </div>

      {contextHolder}

      
      <VehicleModal
        visible={modalVisible}
        vehicle={selectedVehicle}
        onClose={() => {
          setModalVisible(false);
          setSelectedVehicle(null);
        }}
      />

      
      <VehicleForm
        visible={formVisible}
        vehicle={selectedVehicle}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />

      
      <Modal
        title="Confirmar venda"
        open={sellModalVisible}
        onOk={confirmSell}
        onCancel={cancelSell}
        okText="Confirmar Venda"
        cancelText="Cancelar"
        okButtonProps={{
          danger: true,
          loading: formLoading
        }}
      >
        <p>
          Deseja marcar o veículo <strong>{vehicleToSell?.brand} {vehicleToSell?.model}</strong> como vendido?
        </p>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Esta ação não pode ser desfeita. O veículo será movido para a lista de veículos vendidos.
        </p>
      </Modal>

    </DefaultFrame>
  );
}