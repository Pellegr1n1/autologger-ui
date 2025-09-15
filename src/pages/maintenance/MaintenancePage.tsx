import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Typography, message, Card, Statistic, Space, Tooltip, Table, Tag, Row, Col, Select, DatePicker, Input, Empty } from 'antd';
import {
  BarChartOutlined,
  EditOutlined,
  EyeOutlined,
  DollarOutlined,
  PlusOutlined,
  ToolOutlined,
  SearchOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { VehicleService } from '../../services/api/vehicleService';
import { VehicleServiceService } from '../../services/api/vehicleServiceService';
import { BlockchainService } from '../../services/api/blockchainService';
import { Vehicle, VehicleEvent, VehicleEventType } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate, kmFormat } from '../../utils/format';
import DefaultFrame from '../../features/common/layout/Defaultframe';
import componentStyles from '../../features/common/layout/styles/Components.module.css';
import styles from './MaintenancePage.module.css';
import ServiceModal from '../../features/vehicles/components/ServiceModal';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type MaintenanceEvent = VehicleEvent & {
  status?: string;
  serviceDate?: string;
};

const MaintenancePage = React.memo(function MaintenancePage() {
  // Estados consolidados para evitar re-renders
  const [pageState, setPageState] = useState({
    loading: true,
    selectedVehicle: 'all',
    searchTerm: '',
    serviceModalOpen: false,
    isLoadingData: false
  });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<VehicleEvent[]>([]);

  // Carregar dados apenas uma vez na montagem do componente
  const loadData = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (pageState.isLoadingData) return;
    
    setPageState(prev => ({ ...prev, isLoadingData: true, loading: true }));

    try {
      // Carregar veículos e manutenções em paralelo para melhor performance
      const [vehiclesResponse, maintenanceResponse] = await Promise.allSettled([
        VehicleService.getUserVehicles(),
        BlockchainService.getAllServices().catch(() => 
          // Fallback para método antigo se blockchain falhar
          VehicleServiceService.getAllServices()
        )
      ]);

      // Processar veículos
      if (vehiclesResponse.status === 'fulfilled') {
        const activeVehicles = vehiclesResponse.value.active || [];
        setVehicles(activeVehicles);
      } else {
        console.error('Erro ao carregar veículos:', vehiclesResponse.reason);
        setVehicles([]);
      }

      // Processar manutenções
      if (maintenanceResponse.status === 'fulfilled') {
        const maintenanceData = maintenanceResponse.value;
        const maintenanceOnly = maintenanceData
          .filter(event => event.type === VehicleEventType.MAINTENANCE)
          .map((event: any): MaintenanceEvent => {
            // Se é do blockchain, fazer conversão
            if (event.serviceDate) {
              return {
                ...event,
                type: event.type as VehicleEventType,
                date: new Date(event.serviceDate || event.createdAt),
                createdAt: new Date(event.createdAt),
                updatedAt: new Date(event.updatedAt),
                attachments: [],
                blockchainStatus: {
                  status: event.status as any,
                  lastUpdate: new Date(),
                  retryCount: 0,
                  maxRetries: 3
                },
                isImmutable: event.status === 'CONFIRMED',
                canEdit: event.status !== 'CONFIRMED',
                requiresConfirmation: false
              };
            }
            // Se é do método antigo, já vem no formato correto
            return event;
          });
        setMaintenanceEvents(maintenanceOnly);
      } else {
        console.error('Erro ao carregar manutenções:', maintenanceResponse.reason);
        setMaintenanceEvents([]);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      message.error('Erro ao carregar dados');
    } finally {
      setPageState(prev => ({ ...prev, loading: false, isLoadingData: false }));
    }
  }, [pageState.isLoadingData]);

  // Effect para carregar dados apenas na montagem
  useEffect(() => {
    loadData();
  }, []); // Array vazio para executar apenas uma vez

  // Memoizar veículos para evitar re-renders desnecessários
  const memoizedVehicles = useMemo(() => {
    return vehicles;
  }, [vehicles]);

  // Memoizar eventos para evitar re-renders desnecessários
  const memoizedMaintenanceEvents = useMemo(() => {
    return maintenanceEvents;
  }, [maintenanceEvents]);

  // Filtrar manutenções com memoização otimizada
  const filteredMaintenance = useMemo(() => {
    return memoizedMaintenanceEvents.filter(event => {
      // Verificar se o evento tem todas as propriedades necessárias
      if (!event?.vehicleId || !event?.description || !event?.category) {
        return false;
      }

      // Filtro por veículo ativo
      const vehicle = memoizedVehicles.find(v => v.id === event.vehicleId);
      if (!vehicle || vehicle.status !== 'active') {
        return false;
      }

      // Filtro por veículo selecionado
      if (pageState.selectedVehicle !== 'all' && event.vehicleId !== pageState.selectedVehicle) {
        return false;
      }

      // Filtro por termo de busca
      if (pageState.searchTerm) {
        const searchLower = pageState.searchTerm.toLowerCase();
        if (!event.description.toLowerCase().includes(searchLower) &&
            !event.category.toLowerCase().includes(searchLower)) {
          return false;
        }
      }

      return true;
    });
  }, [memoizedMaintenanceEvents, memoizedVehicles, pageState.selectedVehicle, pageState.searchTerm]);

  // Funções para obter dados do veículo (memoizadas)
  const getVehicleName = useCallback((vehicleId: string) => {
    const vehicle = memoizedVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'Veículo não encontrado';
    if (vehicle.status !== 'active') return `${vehicle.brand} ${vehicle.model} (Vendido)`;
    return `${vehicle.brand} ${vehicle.model}`;
  }, [memoizedVehicles]);

  const getVehiclePlate = useCallback((vehicleId: string) => {
    const vehicle = memoizedVehicles.find(v => v.id === vehicleId);
    if (!vehicle) return 'N/A';
    if (vehicle.status !== 'active') return `${vehicle.plate} (Vendido)`;
    return vehicle.plate;
  }, [memoizedVehicles]);

  // Calcular estatísticas (memoizado)
  const statistics = useMemo(() => {
    const totalCost = filteredMaintenance.reduce((sum, event) => sum + (Number(event.cost) || 0), 0);
    const totalMaintenance = filteredMaintenance.length;
    const averageCost = totalMaintenance > 0 ? totalCost / totalMaintenance : 0;
    
    return { totalCost, totalMaintenance, averageCost };
  }, [filteredMaintenance]);

  // Handlers otimizados
  const handleVehicleChange = useCallback((value: string) => {
    setPageState(prev => ({ ...prev, selectedVehicle: value }));
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPageState(prev => ({ ...prev, searchTerm: e.target.value }));
  }, []);

  const handleAddMaintenance = useCallback(() => {
    setPageState(prev => ({ ...prev, serviceModalOpen: true }));
  }, []);

  const handleServiceModalClose = useCallback(() => {
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
  }, []);

  const handleServiceAdd = useCallback((newService: VehicleEvent) => {
    setMaintenanceEvents(prev => [newService, ...prev]);
    message.success('Manutenção adicionada com sucesso!');
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
  }, []);

  const handleViewDetails = useCallback(() => {
    message.info('Funcionalidade de visualização será implementada em breve');
  }, []);

  const handleEdit = useCallback(() => {
    message.info('Funcionalidade de edição será implementada em breve');
  }, []);

  // Colunas da tabela (memoizadas)
  const columns = useMemo(() => [
    {
      title: 'Veículo',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      render: (vehicleId: string) => (
        <div>
          <div style={{ fontWeight: 600 }}>{getVehicleName(vehicleId)}</div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            {getVehiclePlate(vehicleId)}
          </div>
        </div>
      ),
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {category}
        </Tag>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <div style={{ maxWidth: '200px' }}>
          <Text ellipsis={{ tooltip: description }}>
            {description}
          </Text>
        </div>
      ),
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => formatBRDate(date),
      sorter: (a: VehicleEvent, b: VehicleEvent) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Quilometragem',
      dataIndex: 'mileage',
      key: 'mileage',
      render: (mileage: number) => kmFormat(mileage),
      sorter: (a: VehicleEvent, b: VehicleEvent) => a.mileage - b.mileage,
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => (
        <Text strong style={{ color: cost > 1000 ? '#ff4d4f' : 'inherit' }}>
          {currencyBRL(cost)}
        </Text>
      ),
      sorter: (a: VehicleEvent, b: VehicleEvent) => a.cost - b.cost,
    },
    {
      title: 'Local',
      dataIndex: 'location',
      key: 'location',
      render: (location: string) => (
        <Text style={{ fontSize: '12px' }}>
          {location}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      render: (record: MaintenanceEvent) => {
        const status = record.blockchainStatus?.status || record.status || 'PENDING';
        
        let color = 'orange';
        let icon = <ClockCircleOutlined />;
        let text = 'Pendente';

        switch (status) {
          case 'CONFIRMED':
            color = 'green';
            icon = <EyeOutlined />;
            text = 'Confirmado';
            break;
          case 'SUBMITTED':
            color = 'blue';
            icon = <ClockCircleOutlined />;
            text = 'Enviado';
            break;
          case 'FAILED':
            color = 'red';
            icon = <ClockCircleOutlined />;
            text = 'Falhou';
            break;
          default:
            color = 'orange';
            icon = <ClockCircleOutlined />;
            text = 'Pendente';
            break;
        }

        return (
          <Tag color={color} icon={icon}>
            {text}
          </Tag>
        );
      },
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: VehicleEvent) => (
        <Space size="small">
          <Tooltip title="Ver detalhes">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={handleViewDetails}
            />
          </Tooltip>
          <Tooltip title="Editar">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              disabled={record.canEdit === false}
              onClick={handleEdit}
            />
          </Tooltip>
        </Space>
      ),
    },
  ], [getVehicleName, getVehiclePlate, handleViewDetails, handleEdit]);

  // Props do DefaultFrame memoizadas
  const defaultFrameProps = useMemo(() => ({
    title: "Manutenções",
    loading: pageState.loading,
    key: "maintenance-page"
  }), [pageState.loading]);

  return (
    <DefaultFrame {...defaultFrameProps}>
      {/* Header da página */}
      <div className={styles.pageHeader}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddMaintenance}
          className={componentStyles.professionalButton}
        >
          Nova Manutenção
        </Button>
      </div>

      <div style={{ padding: '0' }}>
        {/* Estatísticas */}
        <div className={styles.statsSection}>
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Total de Manutenções"
                  value={statistics.totalMaintenance}
                  prefix={<ToolOutlined style={{ color: 'var(--primary-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Custo Total"
                  value={statistics.totalCost}
                  precision={2}
                  prefix={<DollarOutlined style={{ color: 'var(--accent-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                  suffix="R$"
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card className={componentStyles.professionalStatistic}>
                <Statistic
                  title="Custo Médio"
                  value={statistics.averageCost}
                  precision={2}
                  prefix={<BarChartOutlined style={{ color: 'var(--success-color)' }} />}
                  valueStyle={{ color: 'var(--text-primary)' }}
                  suffix="R$"
                />
              </Card>
            </Col>
          </Row>
        </div>

        {/* Tabela de manutenções com filtros integrados */}
        <div className={styles.maintenanceTableSection}>
          <Card
            title={`Manutenções (${filteredMaintenance.length})`}
            className={componentStyles.professionalCard}
          >
            {/* Filtros integrados */}
            <div className={styles.filtersContainer}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={8}>
                  <div className={styles.filterField}>
                    <Text strong>Veículo:</Text>
                    <Select
                      value={pageState.selectedVehicle}
                      onChange={handleVehicleChange}
                      placeholder="Selecione um veículo"
                      className={componentStyles.professionalInput}
                    >
                      <Option value="all">Todos os veículos ativos</Option>
                      {memoizedVehicles.filter(vehicle => vehicle.status === 'active').map(vehicle => (
                        <Option key={vehicle.id} value={vehicle.id}>
                          {vehicle.brand} {vehicle.model} - {vehicle.plate}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className={styles.filterField}>
                    <Text strong>Buscar:</Text>
                    <Input
                      placeholder="Buscar por categoria ou descrição"
                      value={pageState.searchTerm}
                      onChange={handleSearchChange}
                      prefix={<SearchOutlined />}
                      className={componentStyles.professionalInput}
                    />
                  </div>
                </Col>
                <Col xs={24} sm={8}>
                  <div className={styles.filterField}>
                    <Text strong>Período:</Text>
                    <RangePicker
                      placeholder={['Data inicial', 'Data final']}
                      onChange={() => {
                        message.info('Filtro por data será implementado em breve');
                      }}
                      className={componentStyles.professionalInput}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Separador visual */}
            <div className={styles.tableSeparator} />

            {/* Conteúdo da tabela */}
            {filteredMaintenance.length === 0 ? (
              <Empty
                description={
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      Nenhuma manutenção encontrada
                    </Text>
                    <Text style={{ color: 'var(--text-secondary)' }}>
                      {pageState.searchTerm || pageState.selectedVehicle !== 'all'
                        ? 'Tente ajustar os filtros ou adicionar uma nova manutenção.'
                        : 'Adicione sua primeira manutenção para começar.'
                      }
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddMaintenance}
                  className={componentStyles.professionalButton}
                >
                  Adicionar Manutenção
                </Button>
              </Empty>
            ) : (
              <Table
                columns={columns}
                dataSource={filteredMaintenance}
                rowKey="id"
                className={componentStyles.professionalTable}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} de ${total} manutenções`,
                }}
                scroll={{ x: 1200 }}
              />
            )}
          </Card>
        </div>
      </div>

      <ServiceModal
        open={pageState.serviceModalOpen}
        onClose={handleServiceModalClose}
        onAdd={handleServiceAdd}
        vehicles={memoizedVehicles}
        loading={false}
      />
    </DefaultFrame>
  );
});

export default MaintenancePage;