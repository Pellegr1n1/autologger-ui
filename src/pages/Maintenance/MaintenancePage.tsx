import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button, Typography, message, Card, Statistic, Space, Tooltip, Table, Tag, Row, Col, Select, DatePicker, Input, Empty, Modal, Descriptions } from 'antd';
import {
  BarChartOutlined,
  EyeOutlined,
  DollarOutlined,
  PlusOutlined,
  ToolOutlined,
  SearchOutlined,
  ReloadOutlined,
  DownloadOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileOutlined
} from '@ant-design/icons';
import { VehicleService } from '../../features/vehicles/services/vehicleService';
import { VehicleServiceService } from '../../features/vehicles/services/vehicleServiceService';
import { BlockchainService } from '../../features/blockchain/services/blockchainService';
import { Vehicle, VehicleEvent } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate, kmFormat } from '../../shared/utils/format';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './MaintenancePage.module.css';
import ServiceModal from '../../features/vehicles/components/ServiceModal';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

type MaintenanceEvent = VehicleEvent & {
  status?: string;
  serviceDate?: string;
  blockchainHash?: string;
  blockchainStatus?: {
    status: string;
  };
  notes?: string;
};

const MaintenancePage = React.memo(function MaintenancePage() {
  // Estados consolidados para evitar re-renders
  const [pageState, setPageState] = useState({
    loading: true,
    selectedVehicle: 'all',
    searchTerm: '',
    serviceModalOpen: false,
    isLoadingData: false,
    viewModalOpen: false,
    selectedMaintenance: null as MaintenanceEvent | null
  });
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<VehicleEvent[]>([]);

  // Funções auxiliares para anexos
  const getFileIcon = (fileUrl: string) => {
    const extension = fileUrl.split('.').pop()?.toLowerCase() || '';
    if (extension === 'pdf') {
      return <FilePdfOutlined style={{ color: '#f5222d', fontSize: '18px' }} />;
    } else if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension)) {
      return <FileImageOutlined style={{ color: '#52c41a', fontSize: '18px' }} />;
    } else {
      return <FileOutlined style={{ color: '#1890ff', fontSize: '18px' }} />;
    }
  };

  const getFileName = (fileUrl: string) => {
    return fileUrl.split('/').pop() || 'Arquivo';
  };

  // Converter URL relativa para absoluta
  const getAbsoluteUrl = (fileUrl: string) => {
    // Se já é uma URL completa (começa com http:// ou https://), retorna como está
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    // Se é relativa, adiciona o prefixo do backend (mesma URL da API)
    const backendUrl = 'http://localhost:3001';
    return `${backendUrl}${fileUrl}`;
  };

  // Carregar dados apenas uma vez na montagem do componente
  const loadData = useCallback(async () => {
    // Prevenir múltiplas chamadas simultâneas
    if (pageState.isLoadingData) return;
    
    setPageState(prev => ({ ...prev, isLoadingData: true, loading: true }));

    try {
      // Carregar veículos e manutenções em paralelo para melhor performance
      const [vehiclesResponse, maintenanceResponse] = await Promise.allSettled([
        VehicleService.getUserVehicles(),
        // Usar VehicleServiceService diretamente para pegar TODOS os serviços, incluindo os rejeitados
        VehicleServiceService.getAllServices()
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
        
        // VehicleServiceService já retorna no formato correto do frontend
        const allServices = maintenanceData;
        
        setMaintenanceEvents(allServices);
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
    // Verificar se o usuário tem veículos cadastrados
    if (vehicles.length === 0) {
      message.warning('Você precisa cadastrar pelo menos um veículo antes de criar manutenções');
      return;
    }
    setPageState(prev => ({ ...prev, serviceModalOpen: true }));
  }, [vehicles]);

  const handleServiceModalClose = useCallback(() => {
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
  }, []);

  const handleServiceAdd = useCallback((newService: VehicleEvent) => {
    setMaintenanceEvents(prev => [newService, ...prev]);
    message.success('Manutenção adicionada com sucesso!');
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
    
    // Recarregar lista após 3 segundos para pegar status atualizado da blockchain
    setTimeout(() => {
      console.log('🔄 Recarregando lista para verificar status da blockchain...');
      message.info({
        content: 'Verificando confirmação da blockchain...',
        duration: 2,
      });
      loadData();
    }, 3000);
  }, [loadData]);

  const handleViewDetails = useCallback((record: MaintenanceEvent) => {
    setPageState(prev => ({
      ...prev,
      viewModalOpen: true,
      selectedMaintenance: record
    }));
  }, []);


  const handleResendToBlockchain = useCallback(async (serviceId: string) => {
    console.log('🔄 Iniciando reenvio para blockchain, serviceId:', serviceId);
    
    message.loading('Reenviando para blockchain... Aguarde até 20s', 0);
    
    try {
      setPageState(prev => ({ ...prev, loading: true }));
      
      const result = await BlockchainService.resendFailedService(serviceId);
      
      console.log('📊 Resultado do reenvio:', result);
      message.destroy();
      
      if (result.success) {
        message.success(`✅ Transação enviada! Hash: ${result.transactionHash?.substring(0, 10)}...`, 6);
        setTimeout(() => {
          message.info('ℹ️ Aguarde enquanto a transação é minerada...', 4);
        }, 1000);
        await loadData();
      } else {
        console.error('❌ Falha no reenvio:', result.error);
        console.log('🔍 Tipo de erro:', result.error);
        
        // Mensagem simples e direta
        if (result.error?.includes('Timeout')) {
          message.warning('⚠️ Rede lenta! A transação não confirmou em 20s. Tente novamente.', 10);
        } else if (result.error?.includes('já está')) {
          message.info('✅ Este registro já está na blockchain!', 5);
        } else {
          message.error(`❌ Falha: ${result.error}`, 8);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao reenviar para blockchain:', error);
      message.destroy();
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('timeout')) {
        message.warning('⏱️ Tempo esgotado (30s). Verifique sua conexão.', 6);
      } else {
        message.error(`❌ Erro: ${errorMessage}`, 6);
      }
    } finally {
      setPageState(prev => ({ ...prev, loading: false }));
    }
  }, [loadData]);


  // Colunas da tabela (memoizadas)
  const columns = useMemo(() => [
    {
      title: 'Veículo',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      align: 'center' as const,
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
      align: 'center' as const,
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
      align: 'center' as const,
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
      align: 'center' as const,
      render: (date: Date) => formatBRDate(date),
      sorter: (a: VehicleEvent, b: VehicleEvent) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    },
    {
      title: 'Quilometragem',
      dataIndex: 'mileage',
      key: 'mileage',
      align: 'center' as const,
      render: (mileage: number) => kmFormat(mileage),
      sorter: (a: VehicleEvent, b: VehicleEvent) => a.mileage - b.mileage,
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      align: 'center' as const,
      render: (cost: number) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          {currencyBRL(cost)}
        </Text>
      ),
      sorter: (a: VehicleEvent, b: VehicleEvent) => a.cost - b.cost,
    },
    {
      title: 'Local',
      dataIndex: 'location',
      key: 'location',
      align: 'center' as const,
      render: (location: string) => (
        <Text style={{ fontSize: '12px' }}>
          {location}
        </Text>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      align: 'center' as const,
      render: (record: MaintenanceEvent) => {
        const status = record.blockchainStatus?.status || record.status || 'PENDING';
        
        let color = 'orange';
        let icon = <ReloadOutlined />;
        let text = 'Pendente';

        switch (status) {
          case 'CONFIRMED':
            color = 'green';
            icon = <EyeOutlined />;
            text = 'Confirmado';
            break;
          case 'SUBMITTED':
            color = 'blue';
            icon = <ReloadOutlined />;
            text = 'Enviado';
            break;
          case 'FAILED':
            color = 'red';
            icon = <ReloadOutlined />;
            text = 'Falhou';
            break;
          default:
            color = 'orange';
            icon = <ReloadOutlined />;
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
      title: 'Visualizar',
      key: 'actions',
      align: 'center' as const,
      render: (record: MaintenanceEvent) => {
        const status = record.blockchainStatus?.status || 'PENDING';
        const isFailed = status === 'FAILED';
        
        return (
          <Space size="small">
            <Tooltip title="Ver detalhes">
              <Button
                type="text"
                icon={<EyeOutlined />}
                size="small"
                onClick={() => handleViewDetails(record)}
              />
            </Tooltip>
            {isFailed && (
              <Tooltip title="Reenviar para blockchain">
                <Button
                  type="primary"
                  danger
                  icon={<ReloadOutlined />}
                  size="small"
                  onClick={() => {
                    console.log('🔄 Botão de reenvio clicado para ID:', record.id);
                    handleResendToBlockchain(record.id);
                  }}
                />
              </Tooltip>
            )}
          </Space>
        );
      },
    },
  ], [getVehicleName, getVehiclePlate, handleViewDetails, handleResendToBlockchain]);

  // Props do DefaultFrame memoizadas
  const defaultFrameProps = useMemo(() => ({
    title: "Manutenções",
    loading: pageState.loading,
    key: "maintenance-page"
  }), [pageState.loading]);

  return (
    <DefaultFrame {...defaultFrameProps}>
      {/* Header da página */}
      {vehicles.length > 0 && statistics.totalMaintenance > 0 && (
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
      )}

      <div style={{ padding: '0' }}>
        {/* Mensagem quando não há veículos */}
        {vehicles.length === 0 ? (
          <div className={styles.statsSection}>
            <Card className={componentStyles.professionalCard}>
              <Empty
                description={
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                      Nenhum veículo cadastrado
                    </Text>
                    <Text style={{ color: 'var(--text-secondary)' }}>
                      Para criar manutenções, você precisa cadastrar pelo menos um veículo primeiro.
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  onClick={() => window.location.href = '/vehicles'}
                  className={componentStyles.professionalButton}
                >
                  Acessar Veículos
                </Button>
              </Empty>
            </Card>
          </div>
        ) : (
          <>
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
                      showSizeChanger: false,
                      showQuickJumper: true,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} manutenções`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                )}
              </Card>
            </div>
          </>
        )}
      </div>

      <ServiceModal
        open={pageState.serviceModalOpen}
        onClose={handleServiceModalClose}
        onAdd={handleServiceAdd}
        vehicles={memoizedVehicles}
        loading={false}
      />
      
      {/* Modal de visualização de detalhes */}
      <Modal
        title="Detalhes da Manutenção"
        open={pageState.viewModalOpen}
        onCancel={() => setPageState(prev => ({ ...prev, viewModalOpen: false, selectedMaintenance: null }))}
        footer={[
          <Button key="close" onClick={() => setPageState(prev => ({ ...prev, viewModalOpen: false, selectedMaintenance: null }))}>
            Fechar
          </Button>
        ]}
        width={600}
      >
        {pageState.selectedMaintenance && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Veículo">
              {getVehicleName(pageState.selectedMaintenance.vehicleId)} - {getVehiclePlate(pageState.selectedMaintenance.vehicleId)}
            </Descriptions.Item>
            <Descriptions.Item label="Categoria">
              <Tag color="blue">{pageState.selectedMaintenance.category}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Descrição">
              {pageState.selectedMaintenance.description}
            </Descriptions.Item>
            <Descriptions.Item label="Data">
              {formatBRDate(pageState.selectedMaintenance.serviceDate || pageState.selectedMaintenance.createdAt)}
            </Descriptions.Item>
            <Descriptions.Item label="Quilometragem">
              {kmFormat(pageState.selectedMaintenance.mileage)}
            </Descriptions.Item>
            <Descriptions.Item label="Custo">
              <Typography.Text strong style={{ color: '#ff4d4f' }}>
                {currencyBRL(pageState.selectedMaintenance.cost)}
              </Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Local">
              {pageState.selectedMaintenance.location || 'Não informado'}
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {(() => {
                const status = pageState.selectedMaintenance.blockchainStatus?.status || pageState.selectedMaintenance.status || 'PENDING';
                let color = 'orange';
                let icon = <ReloadOutlined />;
                let text = 'Pendente';

                switch (status) {
                  case 'CONFIRMED':
                    color = 'green';
                    icon = <EyeOutlined />;
                    text = 'Confirmado';
                    break;
                  case 'SUBMITTED':
                    color = 'blue';
                    icon = <ReloadOutlined />;
                    text = 'Enviado';
                    break;
                  case 'FAILED':
                    color = 'red';
                    icon = <ReloadOutlined />;
                    text = 'Falhou';
                    break;
                  default:
                    color = 'orange';
                    icon = <ReloadOutlined />;
                    text = 'Pendente';
                    break;
                }

                return (
                  <Tag color={color} icon={icon}>
                    {text}
                  </Tag>
                );
              })()}
            </Descriptions.Item>
            {pageState.selectedMaintenance.blockchainHash && (
              <Descriptions.Item label="Hash Blockchain">
                <Typography.Text code style={{ fontSize: '12px' }}>
                  {pageState.selectedMaintenance.blockchainHash}
                </Typography.Text>
              </Descriptions.Item>
            )}
            {pageState.selectedMaintenance.attachments && pageState.selectedMaintenance.attachments.length > 0 && (
              <Descriptions.Item label="Anexos">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  {pageState.selectedMaintenance.attachments.map((fileUrl, index) => (
                    <a
                      key={index}
                      href={getAbsoluteUrl(fileUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 12px',
                        background: '#f0f2f5',
                        borderRadius: '6px',
                        textDecoration: 'none',
                        border: '1px solid #d9d9d9',
                        transition: 'all 0.3s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e6f7ff';
                        e.currentTarget.style.borderColor = '#1890ff';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f0f2f5';
                        e.currentTarget.style.borderColor = '#d9d9d9';
                      }}
                    >
                      {getFileIcon(fileUrl)}
                      <Text style={{ flex: 1, color: '#1890ff' }}>
                        {getFileName(fileUrl)}
                      </Text>
                      <DownloadOutlined style={{ color: '#1890ff' }} />
                    </a>
                  ))}
                </Space>
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </DefaultFrame>
  );
});

export default MaintenancePage;