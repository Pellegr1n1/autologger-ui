import { useState, useEffect } from 'react';
import { Button, Typography, message, Modal, Card, Statistic, Space, Row, Col, Empty, Tabs, Tooltip } from 'antd';
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
  }, []);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      const data = await VehicleService.getUserVehicles();
      console.log('Veículos carregados:', data); // Debug
      console.log('Estrutura da resposta:', {
        hasActive: !!data.active,
        hasSold: !!data.sold,
        activeCount: data.active?.length || 0,
        soldCount: data.sold?.length || 0,
        activeType: Array.isArray(data.active) ? 'array' : typeof data.active,
        soldType: Array.isArray(data.sold) ? 'array' : typeof data.sold
      });
      
      // Debug: verificar dados dos veículos ativos
      if (data.active && Array.isArray(data.active)) {
        console.log('Dados dos veículos ativos:', data.active.map(v => ({
          id: v.id,
          brand: v.brand,
          model: v.model,
          photoUrl: v.photoUrl,
          imageUrl: v.imageUrl
        })));
      }
      
      // Garantir que os dados estejam no formato correto
      const normalizedData: UserVehicles = {
        active: Array.isArray(data.active) ? data.active : [],
        sold: Array.isArray(data.sold) ? data.sold : []
      };
      
      console.log('Dados normalizados:', normalizedData);
      
      // Se não houver arrays separados, tentar inferir do array único
      if (normalizedData.active.length === 0 && normalizedData.sold.length === 0) {
        if (Array.isArray(data)) {
          // Se a API retornar um array único, separar por status
          const allVehicles = data as Vehicle[];
          normalizedData.active = allVehicles.filter(v => !v.soldAt);
          normalizedData.sold = allVehicles.filter(v => v.soldAt);
          console.log('Separando veículos por status:', {
            total: allVehicles.length,
            active: normalizedData.active.length,
            sold: normalizedData.sold.length
          });
        } else if ((data as any).vehicles && Array.isArray((data as any).vehicles)) {
          // Se a API retornar { vehicles: [...] }
          const allVehicles = (data as any).vehicles as Vehicle[];
          normalizedData.active = allVehicles.filter(v => !v.soldAt);
          normalizedData.sold = allVehicles.filter(v => v.soldAt);
          console.log('Separando veículos do campo vehicles:', {
            total: allVehicles.length,
            active: normalizedData.active.length,
            sold: normalizedData.sold.length
          });
        }
      }
      
      // Atualizar o estado com os dados normalizados
      setVehicles(normalizedData);
    } catch (error) {
      console.error('Erro ao carregar veículos:', error);
      message.error('Erro ao carregar veículos');
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
    console.log('handleSell chamado para veículo:', vehicle);
    setVehicleToSell(vehicle);
    setSellModalVisible(true);
  };

  const confirmSell = async () => {
    if (!vehicleToSell) return;
    
    console.log('Usuário confirmou a venda do veículo:', vehicleToSell.id);
    try {
      console.log('Chamando VehicleService.markVehicleAsSold...');
      const result = await VehicleService.markVehicleAsSold(vehicleToSell.id);
      console.log('Veículo marcado como vendido com sucesso:', result);
      message.success('Veículo marcado como vendido');
      setSellModalVisible(false);
      setVehicleToSell(null);
      loadVehicles(); // Recarregar para atualizar as listas
    } catch (error) {
      console.error('Erro ao marcar veículo como vendido:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      message.error(`Erro ao marcar veículo como vendido: ${error.response?.data?.message || error.message}`);
    }
  };

  const cancelSell = () => {
    console.log('Usuário cancelou a venda do veículo');
    setSellModalVisible(false);
    setVehicleToSell(null);
  };


  const handleFormSubmit = async (values: CreateVehicleData) => {
    console.log('Formulário submetido:', values);
    
      if (!selectedVehicle && activeVehicles.length >= 2) {
        message.warning('Limite de 2 veículos atingido. Marque um como vendido para adicionar outro.');
        return;
      }
    
    try {
      setFormLoading(true);
      
      if (selectedVehicle) {
        // Modo edição
        await VehicleService.updateVehicle(selectedVehicle.id, values);
        message.success('Veículo atualizado com sucesso!');
      } else {
        // Modo criação
        await VehicleService.createVehicle(values);
        message.success('Veículo cadastrado com sucesso!');
      }
      
      setFormVisible(false);
      setSelectedVehicle(null);
      loadVehicles(); // Recarregar a lista de veículos
    } catch (error) {
      console.error('Erro ao salvar veículo:', error);
      message.error(selectedVehicle ? 'Erro ao atualizar veículo' : 'Erro ao cadastrar veículo');
    } finally {
      setFormLoading(false);
    }
  };

  const handleFormCancel = () => {
    console.log('Fechando modal de formulário'); // Debug
    setFormVisible(false);
    setSelectedVehicle(null);
  };





  // Usar os veículos separados diretamente do estado
  const { active: activeVehicles, sold: soldVehicles } = vehicles;
  const totalVehicles = activeVehicles.length + soldVehicles.length;

  // Debug: verificar estado do formVisible
  console.log('Estado formVisible:', formVisible);

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
      {/* Header da página */}
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
                console.log('Botão Adicionar Veículo clicado'); // Debug
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
        {/* Estatísticas */}
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

        {/* Abas de Veículos */}
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

      {/* Modal de detalhes do veículo */}
      <VehicleModal
        visible={modalVisible}
        vehicle={selectedVehicle}
        onClose={() => {
          setModalVisible(false);
          setSelectedVehicle(null);
        }}
      />

      {/* Modal de cadastro/edição de veículo */}
      <VehicleForm
        visible={formVisible}
        vehicle={selectedVehicle}
        onSubmit={handleFormSubmit}
        onCancel={handleFormCancel}
        loading={formLoading}
      />

      {/* Modal de confirmação de venda */}
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