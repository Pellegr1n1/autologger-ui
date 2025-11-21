import { useState, useEffect } from 'react';
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
    loadVehicles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        } else if (data && typeof data === 'object' && 'vehicles' in data && Array.isArray((data as { vehicles: unknown }).vehicles)) {
          const vehiclesData = data as { vehicles: Vehicle[] };
          const allVehicles = vehiclesData.vehicles;
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
      await VehicleService.markVehicleAsSold(vehicleToSell.id);
      api.success({
        message: 'Veículo vendido com sucesso!',
        description: `${vehicleToSell.brand} ${vehicleToSell.model} foi marcado como vendido e movido para a seção de veículos vendidos.`,
        placement: 'bottomRight',
        duration: 4.5,
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />
      });
      setSellModalVisible(false);
      setVehicleToSell(null);
      loadVehicles();
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string } }; message?: string };
      api.error({
        message: 'Falha ao marcar veículo como vendido',
        description: apiError.response?.data?.message || apiError.message || 'Ocorreu um erro ao tentar marcar o veículo como vendido.',
        placement: 'bottomRight',
        duration: 4.5
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
    } catch (error: unknown) {
      const apiError = error as { response?: { data?: { message?: string | string[] } } };
      const backendMessage = apiError.response?.data?.message;
      let description: string;
      if (Array.isArray(backendMessage)) {
        description = backendMessage.join(', ');
      } else if (backendMessage) {
        description = backendMessage;
      } else {
        description = selectedVehicle ? 'Erro ao atualizar veículo' : 'Erro ao cadastrar veículo';
      }

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
                Cadastrar Veículo
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
        width="90%"
        style={{ maxWidth: 500 }}
        centered
      >
        <p style={{ marginBottom: '16px' }}>
          Deseja marcar o veículo <strong>{vehicleToSell?.brand} {vehicleToSell?.model}</strong> como vendido?
        </p>
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '12px'
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            backgroundColor: '#f59e0b',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '12px',
            fontWeight: 'bold',
            flexShrink: 0,
            marginTop: '2px'
          }}>
            !
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#92400e',
              marginBottom: '4px'
            }}>
              Ação Irreversível
            </div>
            <div style={{
              fontSize: '13px',
              color: '#92400e',
              lineHeight: '1.4'
            }}>
              Esta ação não pode ser desfeita. O veículo será movido para a lista de veículos vendidos.
            </div>
          </div>
        </div>
      </Modal>

    </DefaultFrame>
  );
}