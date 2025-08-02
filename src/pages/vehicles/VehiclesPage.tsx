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
  Badge,
  Modal,
  Progress
} from 'antd';
import {
  PlusOutlined,
  CarOutlined,
  HistoryOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined,
  TrophyOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import VehicleCard from '../../components/vehicles/VehicleCard';
import VehicleForm from '../../components/vehicles/VehicleForm';
import VehicleModal from '../../components/vehicles/VehicleModal';
import { VehicleService } from '../../services/api/vehicleService';
import {
  Vehicle,
  CreateVehicleData,
  UpdateVehicleData,
  UserVehicles,
  VehicleStats
} from '../../@types/vehicle.types';
import styles from './VehiclesPage.module.css';

const { Title, Text } = Typography;

const VehiclesPage: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [soldVehicles, setSoldVehicles] = useState<Vehicle[]>([]);
  const [vehicleStats, setVehicleStats] = useState<VehicleStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  
  const [sellConfirmVisible, setSellConfirmVisible] = useState(false);
  const [vehicleToSell, setVehicleToSell] = useState<Vehicle | null>(null);
  const [sellLoading, setSellLoading] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadVehicles(),
        loadVehicleStats()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      message.error('Erro ao carregar dados dos veículos');
    } finally {
      setLoading(false);
    }
  };

  const loadVehicles = async () => {
    try {
      const userVehicles: UserVehicles = await VehicleService.getUserVehicles();
      setVehicles(userVehicles.active || []);
      setSoldVehicles(userVehicles.sold || []);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      message.error('Erro ao carregar veículos');
      setVehicles([]);
      setSoldVehicles([]);
    }
  };

  const loadVehicleStats = async () => {
    try {
      const stats = await VehicleService.getActiveVehiclesStats();
      setVehicleStats(stats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      setVehicleStats({
        count: vehicles.length,
        limit: 2,
        canAddMore: vehicles.length < 2
      });
    }
  };

  const handleCreateVehicle = async () => {
    try {
      const currentCount = vehicles.length;
      const maxLimit = vehicleStats?.limit || 2;
      
      if (currentCount >= maxLimit) {
        message.warning('Você atingiu o limite máximo de veículos ativos');
        return;
      }

      const canAdd = await VehicleService.canAddMoreVehicles();
      if (!canAdd) {
        message.warning('Você atingiu o limite máximo de veículos ativos');
        return;
      }
      
      setEditingVehicle(null);
      setIsFormVisible(true);
    } catch (error) {
      console.error('Erro ao verificar limite:', error);
      message.error('Erro ao verificar limite de veículos');
    }
  };

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    setIsFormVisible(true);
  };

  const handleViewVehicle = async (vehicle: Vehicle) => {
    try {
      const updatedVehicle = await VehicleService.getVehicleById(vehicle.id);
      setSelectedVehicle(updatedVehicle);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Erro ao carregar dados do veículo:', error);
      setSelectedVehicle(vehicle);
      setIsModalVisible(true);
    }
  };

  const handleFormSubmit = async (values: CreateVehicleData | UpdateVehicleData) => {
    setSubmitting(true);
    try {
      if (editingVehicle) {
        const updatedVehicle = await VehicleService.updateVehicle(
          editingVehicle.id,
          values as UpdateVehicleData
        );

        setVehicles(prevVehicles =>
          prevVehicles.map(v =>
            v.id === editingVehicle.id ? updatedVehicle : v
          )
        );

        message.success('Veículo atualizado com sucesso!');
      } else {
        const newVehicle = await VehicleService.createVehicle(values as CreateVehicleData);
        setVehicles(prevVehicles => [...prevVehicles, newVehicle]);
        message.success('Veículo cadastrado com sucesso!');
        await loadVehicleStats();
      }

      setIsFormVisible(false);
      setEditingVehicle(null);
    } catch (error: any) {
      console.error('Erro ao salvar veículo:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao salvar veículo';
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSellVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (!vehicle) {
      message.error('Veículo não encontrado');
      return;
    }

    setVehicleToSell(vehicle);
    setSellConfirmVisible(true);
  };

  const confirmSellVehicle = async () => {
    if (!vehicleToSell) return;
    
    setSellLoading(true);
    
    try {
      if (typeof VehicleService.markVehicleAsSold !== 'function') {
        message.error('Funcionalidade de venda não disponível');
        return;
      }
      
      const soldVehicle = await VehicleService.markVehicleAsSold(vehicleToSell.id);

      setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleToSell.id));
      setSoldVehicles(prevSoldVehicles => [...prevSoldVehicles, soldVehicle]);

      message.success('Veículo marcado como vendido!');

      setSellConfirmVisible(false);
      setVehicleToSell(null);

      await loadVehicleStats();
    } catch (error: any) {
      console.error('Erro ao marcar veículo como vendido:', error);
      const errorMessage = error?.response?.data?.message || 'Erro ao marcar veículo como vendido';
      message.error(errorMessage);
    } finally {
      setSellLoading(false);
    }
  };

  const cancelSellVehicle = () => {
    setSellConfirmVisible(false);
    setVehicleToSell(null);
  };

  const handleDeleteVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId) ||
      soldVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return;

    Modal.confirm({
      title: 'Excluir veículo',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>Tem certeza que deseja excluir este veículo?</p>
          <p><strong>{VehicleService.getVehicleSummary(vehicle)}</strong></p>
          <p style={{ color: 'var(--error-color)', fontSize: '12px' }}>
            <strong>Atenção:</strong> Esta ação não pode ser desfeita e todos os dados do veículo serão perdidos.
          </p>
        </div>
      ),
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await VehicleService.deleteVehicle(vehicleId);

          if (VehicleService.isActive(vehicle)) {
            setVehicles(prevVehicles => prevVehicles.filter(v => v.id !== vehicleId));
            await loadVehicleStats();
          } else {
            setSoldVehicles(prevSoldVehicles => prevSoldVehicles.filter(v => v.id !== vehicleId));
          }

          message.success('Veículo excluído com sucesso!');
        } catch (error: any) {
          console.error('Erro ao excluir veículo:', error);
          const errorMessage = error?.response?.data?.message || 'Erro ao excluir veículo';
          message.error(errorMessage);
        }
      }
    });
  };

  const canAddNewVehicle = React.useMemo(() => {
    if (!vehicleStats) {
      return vehicles.length < 2;
    }
    
    const canAddByStats = vehicleStats.canAddMore;
    const canAddByCount = vehicles.length < (vehicleStats.limit || 2);
    
    return canAddByStats && canAddByCount;
  }, [vehicleStats, vehicles.length]);

  const StatsCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
  }> = ({ title, value, icon, color, suffix }) => (
    <div 
      className={styles.statsCard}
      style={{ '--stats-color': color } as React.CSSProperties}
    >
      <div className={styles.statsContent}>
        <div className={styles.statsHeader}>
          <Text className={styles.statsTitle}>{title}</Text>
          <div className={styles.statsIcon} style={{ background: `${color}15`, color: color }}>
            {icon}
          </div>
        </div>
        <div>
          <Text className={styles.statsValue}>
            {value}
          </Text>
          {suffix && (
            <Text className={styles.statsSuffix}>
              {suffix}
            </Text>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingIcon}>
          <CarOutlined style={{ fontSize: '48px', color: 'var(--text-light)' }} />
        </div>
        <Spin size="large" />
        <Text className={styles.loadingText}>
          Carregando seus veículos...
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.vehiclesPage}>
      {/* Header com gradiente */}
      <div className={styles.heroHeader}>
        <Row justify="space-between" align="middle">
          <Col>
            <div className={styles.heroContent}>
              <Space align="center" size="large">
                <div className={styles.heroIcon}>
                  <CarOutlined style={{ fontSize: '36px', color: 'var(--text-light)' }} />
                </div>
                <div>
                  <Title level={1} className={styles.heroTitle}>
                    Meus Veículos
                  </Title>
                  <Text className={styles.heroSubtitle}>
                    Gerencie sua frota e acompanhe manutenções
                  </Text>
                </div>
              </Space>

              {vehicleStats && (
                <div className={styles.progressContainer}>
                  <Progress
                    percent={Math.round((vehicleStats.count || vehicles.length) / (vehicleStats.limit || 2) * 100)}
                    strokeColor={{
                      '0%': 'var(--accent-color)',
                      '100%': 'var(--success-color)'
                    }}
                    trailColor="rgba(255, 255, 255, 0.2)"
                    showInfo={false}
                    size="small"
                  />
                  <Text className={styles.progressText}>
                    {vehicleStats.count || vehicles.length} de {vehicleStats.limit || 2} veículos utilizados
                  </Text>
                </div>
              )}
            </div>
          </Col>
          <Col>
            <Button
              type="primary"
              size="large"
              onClick={handleCreateVehicle}
              disabled={!canAddNewVehicle}
              loading={submitting}
              className={styles.heroButton}
            >
              Adicionar Veículo
            </Button>
          </Col>
        </Row>
      </div>

      {/* Cards de estatísticas */}
      <Row gutter={[24, 24]} className={styles.statsGrid}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Veículos Ativos"
            value={vehicles.length}
            icon={<CarOutlined />}
            color="var(--primary-color)"
            suffix="veículos"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Veículos Vendidos"
            value={soldVehicles.length}
            icon={<TrophyOutlined />}
            color="var(--success-color)"
            suffix="vendidos"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total Gerenciado"
            value={vehicles.length + soldVehicles.length}
            icon={<DashboardOutlined />}
            color="var(--accent-color)"
            suffix="total"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Tempo no Sistema"
            value={vehicles.length > 0 ? Math.ceil((Date.now() - new Date(vehicles[0]?.createdAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24)) : 0}
            icon={<CalendarOutlined />}
            color="var(--secondary-color)"
            suffix="dias"
          />
        </Col>
      </Row>

      {/* Warning de limite */}
      {!canAddNewVehicle && vehicleStats && (
        <Card className={styles.warningCard}>
          <Space>
            <ExclamationCircleOutlined style={{ color: 'var(--warning-color)', fontSize: '20px' }} />
            <div>
              <Text strong style={{ color: 'var(--warning-color)' }}>
                Limite atingido
              </Text>
              <br />
              <Text style={{ color: 'var(--gray-6)' }}>
                Você pode ter no máximo {vehicleStats.limit || 2} veículos ativos.
                Marque um veículo como vendido para adicionar um novo.
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Tabs modernos */}
      <div className={styles.tabsContainer}>
        <Tabs
          defaultActiveKey="active"
          size="large"
          items={[
            {
              key: 'active',
              label: (
                <Space>
                  <CarOutlined />
                  <Text strong>Veículos Ativos</Text>
                  <Badge
                    count={vehicles.length}
                    showZero
                    style={{
                      backgroundColor: 'var(--success-color)',
                      color: 'var(--text-light)'
                    }}
                  />
                </Space>
              ),
              children: (
                <div className={styles.tabsContent}>
                  {vehicles.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Space direction="vertical" size="large">
                            <div>
                              <Text className={styles.emptyTitle}>
                                Nenhum veículo cadastrado
                              </Text>
                              <br />
                              <Text className={styles.emptyDescription}>
                                Adicione seu primeiro veículo para começar a gerenciar sua frota
                              </Text>
                            </div>
                            <Button
                              type="primary"
                              size="large"
                              icon={<PlusOutlined />}
                              onClick={handleCreateVehicle}
                              disabled={!canAddNewVehicle}
                              className={styles.emptyButton}
                            >
                              Cadastrar Primeiro Veículo
                            </Button>
                          </Space>
                        }
                      />
                    </div>
                  ) : (
                    <Row gutter={[24, 24]} className={styles.vehicleGrid}>
                      {vehicles.map(vehicle => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={vehicle.id}>
                          <VehicleCard
                            vehicle={vehicle}
                            onView={() => handleViewVehicle(vehicle)}
                            onEdit={() => handleEditVehicle(vehicle)}
                            onSell={() => handleSellVehicle(vehicle.id)}
                            onDelete={() => handleDeleteVehicle(vehicle.id)}
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )
            },
            {
              key: 'sold',
              label: (
                <Space>
                  <HistoryOutlined />
                  <Text strong>Veículos Anteriores</Text>
                  <Badge
                    count={soldVehicles.length}
                    showZero
                    style={{
                      backgroundColor: 'var(--gray-5)',
                      color: 'var(--text-light)'
                    }}
                  />
                </Space>
              ),
              children: (
                <div className={styles.tabsContent}>
                  {soldVehicles.length === 0 ? (
                    <div className={styles.emptyState}>
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <Text style={{ color: 'var(--gray-5)' }}>
                            Nenhum veículo vendido ainda
                          </Text>
                        }
                      />
                    </div>
                  ) : (
                    <Row gutter={[24, 24]} className={styles.vehicleGrid}>
                      {soldVehicles.map(vehicle => (
                        <Col xs={24} sm={12} lg={8} xl={6} key={vehicle.id}>
                          <VehicleCard
                            vehicle={vehicle}
                            onView={() => handleViewVehicle(vehicle)}
                            onDelete={() => handleDeleteVehicle(vehicle.id)}
                            showSoldBadge
                          />
                        </Col>
                      ))}
                    </Row>
                  )}
                </div>
              )
            }
          ]}
        />
      </div>

      {/* Modal de Confirmação de Venda Personalizado */}
      <Modal
        open={sellConfirmVisible}
        onCancel={cancelSellVehicle}
        footer={null}
        width={500}
        className={styles.sellModal}
      >
        <div className={styles.sellModalHeader}>
          <div className={styles.sellModalIcon}>
            <ExclamationCircleOutlined style={{ fontSize: '36px' }} />
          </div>
          <Title level={3} className={styles.sellModalTitle}>
            Marcar como Vendido
          </Title>
        </div>

        <div className={styles.sellModalContent}>
          {vehicleToSell && (
            <>
              <Text className={styles.sellModalText}>
                Tem certeza que deseja marcar este veículo como vendido?
              </Text>

              <div className={styles.sellModalVehicleInfo}>
                <Text className={styles.sellModalVehicleName}>
                  {vehicleToSell.brand} {vehicleToSell.model} {vehicleToSell.year}
                </Text>
                <br />
                <Text className={styles.sellModalVehicleDetails}>
                  Placa: {vehicleToSell.plate}
                </Text>
              </div>

              <Text className={styles.sellModalWarning}>
                Esta ação moverá o veículo para a aba "Veículos Anteriores".
              </Text>

              <div className={styles.sellModalActions}>
                <Button
                  size="large"
                  onClick={cancelSellVehicle}
                  className={styles.sellModalButton}
                >
                  Cancelar
                </Button>
                <Button
                  size="large"
                  onClick={confirmSellVehicle}
                  loading={sellLoading}
                  className={`${styles.sellModalButton} ${styles.sellModalConfirmButton}`}
                >
                  Confirmar Venda
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <VehicleForm
        visible={isFormVisible}
        vehicle={editingVehicle}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setIsFormVisible(false);
          setEditingVehicle(null);
        }}
        loading={submitting}
      />

      <VehicleModal
        visible={isModalVisible}
        vehicle={selectedVehicle}
        onClose={() => {
          setIsModalVisible(false);
          setSelectedVehicle(null);
        }}
      />
    </div>
  );
};

export default VehiclesPage;