import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, message, Card, Statistic, Space, Tooltip, Table, Tag, Row, Col, Select, DatePicker, Input, Empty, Modal, Descriptions, notification } from 'antd';
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
  FileOutlined,
  FilterOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { VehicleService } from '../../features/vehicles/services/vehicleService';
import { VehicleServiceService } from '../../features/vehicles/services/vehicleServiceService';
import { BlockchainService } from '../../features/blockchain/services/blockchainService';
import { Vehicle, VehicleEvent } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate, kmFormat } from '../../shared/utils/format';
import { EVENT_TYPES } from '../../features/vehicles/utils/constants';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './MaintenancePage.module.css';
import ServiceModal from '../../features/vehicles/components/ServiceModal';

const { Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

// Função para formatar o nome do tipo de serviço
const getTypeLabel = (type: string): string => {
  const typeOption = EVENT_TYPES.find(option => option.value === type);
  return typeOption ? typeOption.label : type;
};

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
  const navigate = useNavigate();
  const [api, contextHolder] = notification.useNotification();
  const pollersRef = useRef<number[]>([]);
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
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  
  // Estados dos filtros (padrão da página pública)
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const handleAddMaintenance = useCallback(() => {
    if (vehicles.length === 0) {
      api.warning({
        message: 'Nenhum veículo cadastrado',
        description: 'Cadastre um veículo antes de criar serviços.',
        placement: 'bottomRight'
      });
      return;
    }
    setPageState(prev => ({ ...prev, serviceModalOpen: true }));
  }, [vehicles]);

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

  const getAbsoluteUrl = (fileUrl: string) => {
    if (fileUrl.startsWith('http://') || fileUrl.startsWith('https://')) {
      return fileUrl;
    }
    const backendUrl = 'http://localhost:3001';
    return `${backendUrl}${fileUrl}`;
  };

  const loadData = useCallback(async () => {
    if (pageState.isLoadingData) return;
    setPageState(prev => ({ ...prev, isLoadingData: true, loading: true }));

    try {
      const [vehiclesResponse, maintenanceResponse] = await Promise.allSettled([
        VehicleService.getUserVehicles(),
        VehicleServiceService.getAllServices()
      ]);

      if (vehiclesResponse.status === 'fulfilled') {
        const activeVehicles = vehiclesResponse.value.active || [];
        setVehicles(activeVehicles);
      } else {
        setVehicles([]);
      }

      if (maintenanceResponse.status === 'fulfilled') {
        const maintenanceData = maintenanceResponse.value;
        const allServices = maintenanceData;
        setMaintenanceEvents(allServices);
      } else {
        setMaintenanceEvents([]);
      }

    } catch (error) {
      api.error({
        message: 'Erro ao carregar dados',
        description: 'Não foi possível carregar veículos e serviços.',
        placement: 'bottomRight'
      });
    } finally {
      setPageState(prev => ({ ...prev, loading: false, isLoadingData: false }));
    }
  }, [pageState.isLoadingData]);

  useEffect(() => {
    loadData();
    return () => {
      pollersRef.current.forEach(id => clearInterval(id));
      pollersRef.current = [];
    };
  }, []);

  const memoizedVehicles = useMemo(() => {
    return vehicles;
  }, [vehicles]);

  const memoizedMaintenanceEvents = useMemo(() => {
    return maintenanceEvents;
  }, [maintenanceEvents]);

  const filteredMaintenance = useMemo(() => {
    return memoizedMaintenanceEvents.filter(event => {
      if (!event?.vehicleId || !event?.description || !event?.category) {
        return false;
      }
      const vehicle = memoizedVehicles.find(v => v.id === event.vehicleId);
      if (!vehicle || vehicle.status !== 'active') {
        return false;
      }
      
      // Filtro por veículo
      if (pageState.selectedVehicle !== 'all' && event.vehicleId !== pageState.selectedVehicle) {
        return false;
      }
      
      // Filtro por tipo
      if (filterType !== 'all' && event.type && event.type.toLowerCase() !== filterType.toLowerCase()) {
        return false;
      }

      // Filtro por categoria
      if (filterCategory !== 'all' && event.category.toLowerCase() !== filterCategory.toLowerCase()) {
        return false;
      }
      
      // Filtro por texto (busca em descrição, local, técnico, notas, categoria)
      if (pageState.searchTerm) {
        const searchLower = pageState.searchTerm.toLowerCase();
        const matchesDescription = event.description?.toLowerCase().includes(searchLower);
        const matchesLocation = (event as any).location?.toLowerCase().includes(searchLower);
        const matchesTechnician = (event as any).technician?.toLowerCase().includes(searchLower);
        const matchesNotes = (event as any).notes?.toLowerCase().includes(searchLower);
        const matchesCategory = event.category?.toLowerCase().includes(searchLower);
        
        if (!matchesDescription && !matchesLocation && !matchesTechnician && !matchesNotes && !matchesCategory) {
          return false;
        }
      }

      // Filtro por período de datas
      if (dateRange && dateRange[0] && dateRange[1]) {
        const eventDateSource = (event as any).serviceDate || (event as any).date || (event as any).createdAt;
        if (!eventDateSource) return false;
        const eventDate = dayjs(eventDateSource);
        // incluir bordas (>= start && <= end)
        const isInside = eventDate.isAfter(dateRange[0].subtract(1, 'day')) && eventDate.isBefore(dateRange[1].add(1, 'day'));
        if (!isInside) return false;
      }

      return true;
    });
  }, [memoizedMaintenanceEvents, memoizedVehicles, pageState.selectedVehicle, pageState.searchTerm, dateRange, filterType, filterCategory]);

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

  const statistics = useMemo(() => {
    const totalCost = filteredMaintenance.reduce((sum, event) => sum + (Number(event.cost) || 0), 0);
    const totalMaintenance = filteredMaintenance.length;
    const averageCost = totalMaintenance > 0 ? totalCost / totalMaintenance : 0;
    
    return { totalCost, totalMaintenance, averageCost };
  }, [filteredMaintenance]);

  const handleClearFilters = useCallback(() => {
    setPageState(prev => ({ ...prev, searchTerm: '', selectedVehicle: 'all' }));
    setFilterType('all');
    setFilterCategory('all');
    setDateRange(null);
  }, []);


  const handleServiceModalClose = useCallback(() => {
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
  }, []);

  const handleServiceAdd = useCallback((newService: VehicleEvent) => {
    const pendingInjected = {
      ...newService,
      blockchainStatus: {
        ...(newService as any).blockchainStatus,
        status: 'PENDING' as const
      }
    } as VehicleEvent;
    setMaintenanceEvents(prev => [pendingInjected, ...prev]);
    setPageState(prev => ({ ...prev, serviceModalOpen: false }));
    const notifKey = `blockchain-${newService.id}`;
    api.info({
      key: notifKey,
      message: 'Processando na blockchain',
      description: 'Aguardando confirmação... isso pode levar alguns segundos.',
      placement: 'bottomRight',
      duration: 0
    });
    let attempts = 0;
    const maxAttempts = 12;
    let consecutiveConfirmed = 0;
    const startTime = Date.now();
    const minConfirmMs = 15000;
    const intervalId = setInterval(async () => {
      attempts += 1;
      try {
        const updatedList = await VehicleServiceService.getAllServices();
        const updated = updatedList.find(s => s.id === newService.id);
        if (updated) {
          setMaintenanceEvents(prev => prev.map(ev => ev.id === updated.id ? updated : ev));

          const status = updated.blockchainStatus?.status;
          const hasDefinitiveProof = !!(updated as any).confirmedAt || !!(updated as any).hash;

          if (status === 'CONFIRMED' && hasDefinitiveProof) {
            consecutiveConfirmed += 1;
          } else {
            consecutiveConfirmed = 0;
          }

          const elapsedMs = Date.now() - startTime;

          if (status === 'CONFIRMED' && consecutiveConfirmed >= 2 && elapsedMs >= minConfirmMs) {
            api.success({
              key: notifKey,
              message: 'Confirmado na blockchain',
              description: 'O serviço foi registrado com sucesso.',
              placement: 'bottomRight',
              duration: 4
            });
            clearInterval(intervalId);
            pollersRef.current = pollersRef.current.filter(id => id !== (intervalId as unknown as number));
          } else if (status === 'FAILED') {
            api.error({
              key: notifKey,
              message: 'Falha na blockchain',
              description: 'Não foi possível registrar. Você pode tentar reenviar.',
              placement: 'bottomRight',
              duration: 6
            });
            clearInterval(intervalId);
            pollersRef.current = pollersRef.current.filter(id => id !== (intervalId as unknown as number));
          }
        }
      } catch (e) {
        console.warn('Erro ao verificar status da blockchain:', e);
      } finally {
        if (attempts >= maxAttempts) {
          api.warning({
            key: notifKey,
            message: 'Ainda aguardando confirmação',
            description: 'A confirmação pode demorar. Verifique mais tarde ou tente reenviar.',
            placement: 'bottomRight',
            duration: 6
          });
          clearInterval(intervalId);
          pollersRef.current = pollersRef.current.filter(id => id !== (intervalId as unknown as number));
        }
      }
    }, 3000);
    pollersRef.current.push(intervalId as unknown as number);
  }, [loadData]);

  const handleViewDetails = useCallback((record: MaintenanceEvent) => {
    setPageState(prev => ({
      ...prev,
      viewModalOpen: true,
      selectedMaintenance: record
    }));
  }, []);


  const handleResendToBlockchain = useCallback(async (serviceId: string) => {
    
    message.loading('Reenviando para blockchain... Aguarde até 20s', 0);
    
    try {
      setPageState(prev => ({ ...prev, loading: true }));
      
      const result = await BlockchainService.resendFailedService(serviceId);
      message.destroy();
      
      if (result.success) {
        api.success({
          message: 'Transação enviada',
          description: `Hash: ${result.transactionHash?.substring(0, 10)}...`,
          placement: 'bottomRight',
          duration: 6
        });
        setTimeout(() => {
          api.info({
            message: 'Aguardando mineração',
            description: 'A transação está sendo minerada na rede.',
            placement: 'bottomRight',
            duration: 4
          });
        }, 1000);
        await loadData();
      } else {
        
        // Mensagem simples e direta
        if (result.error?.includes('Timeout')) {
          api.warning({
            message: 'Rede lenta',
            description: 'A transação não confirmou em 20s. Tente novamente.',
            placement: 'bottomRight',
            duration: 10
          });
        } else if (result.error?.includes('já está')) {
          api.info({
            message: 'Já na blockchain',
            description: 'Este registro já foi confirmado anteriormente.',
            placement: 'bottomRight',
            duration: 5
          });
        } else {
          api.error({
            message: 'Falha no reenvio',
            description: result.error,
            placement: 'bottomRight',
            duration: 8
          });
        }
      }
    } catch (error) {
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

  const exportMaintenanceData = useCallback(() => {
    try {
      const exportData = filteredMaintenance.map(service => {
        const vehicle = memoizedVehicles.find(v => v.id === service.vehicleId);
        const maintenanceEvent = service as MaintenanceEvent;
        const status = maintenanceEvent.blockchainStatus?.status || maintenanceEvent.status || 'PENDING';
        let statusText = 'Pendente';
        
        switch (status) {
          case 'CONFIRMED':
            statusText = 'Confirmado';
            break;
          case 'SUBMITTED':
            statusText = 'Enviado';
            break;
          case 'FAILED':
            statusText = 'Falhou';
            break;
        }

        return {
          'Veículo': vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
          'Placa': vehicle?.plate || 'N/A',
          'Categoria': service.category,
          'Descrição': service.description,
          'Data': formatBRDate(service.date || maintenanceEvent.serviceDate || service.createdAt),
          'Quilometragem': kmFormat(service.mileage),
          'Custo': currencyBRL(service.cost),
          'Local': service.location || 'N/A',
          'Status Blockchain': statusText,
          'Hash': maintenanceEvent.blockchainHash || 'N/A',
          'Técnico': service.technician || 'N/A',
          'Garantia': service.warranty ? 'Sim' : 'Não',
          'Observações': service.notes || 'N/A'
        };
      });

      if (exportData.length === 0) {
        message.warning('Nenhum dado para exportar');
        return;
      }

      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `manutencoes_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Dados exportados com sucesso!');
    } catch (error) {
      message.error('Erro ao exportar dados');
    }
  }, [filteredMaintenance, memoizedVehicles]);

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

  const defaultFrameProps = useMemo(() => ({
    title: "Serviços",
    loading: pageState.loading
  }), [pageState.loading]);

  return (
    <DefaultFrame key="maintenance-page" {...defaultFrameProps}>
      
      {vehicles.length > 0 && statistics.totalMaintenance > 0 && (
        <div className={styles.pageHeader}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddMaintenance}
            className={componentStyles.professionalButton}
          >
            Novo Serviço
          </Button>
        </div>
      )}

        
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
                      Para criar serviços, você precisa cadastrar pelo menos um veículo primeiro.
                    </Text>
                  </div>
                }
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              >
                <Button
                  type="primary"
                  onClick={() => navigate('/vehicles')}
                  className={componentStyles.professionalButton}
                >
                  Acessar Veículos
                </Button>
              </Empty>
            </Card>
          </div>
        ) : (
          <>
            
            <div className={styles.statsSection}>
              <Row gutter={[24, 24]}>
                <Col xs={24} sm={8}>
                  <Card className={componentStyles.professionalStatistic}>
                    <Statistic
                      title="Total de Serviços"
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

            
            <div className={styles.maintenanceTableSection}>
              <Card
                title={`Serviços (${filteredMaintenance.length})`}
                className={componentStyles.professionalCard}
                extra={
                  <Button 
                    type="text" 
                    icon={<DownloadOutlined />}
                    onClick={exportMaintenanceData}
                    style={{ color: '#8B5CF6' }}
                  >
                    Exportar CSV
                  </Button>
                }
              >
                
                {/* Filtros - Padrão da página pública */}
                <div style={{ marginBottom: '24px' }}>
                  {(() => {
                    const activeFiltersCount = [
                      pageState.selectedVehicle !== 'all' ? 1 : 0,
                      pageState.searchTerm !== '' ? 1 : 0,
                      filterType !== 'all' ? 1 : 0,
                      filterCategory !== 'all' ? 1 : 0,
                      dateRange !== null ? 1 : 0
                    ].reduce((sum, val) => sum + val, 0);
                    
                    const hasActiveFilters = activeFiltersCount > 0;
                    
                    return (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <Space>
                          <FilterOutlined style={{ color: 'rgba(255,255,255,0.5)' }} />
                          <Text type="secondary" style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                            Filtros
                          </Text>
                          {hasActiveFilters && (
                            <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
                              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
                            </Tag>
                          )}
                        </Space>
                        {hasActiveFilters && (
                          <Button
                            type="text"
                            size="small"
                            icon={<ClearOutlined />}
                            onClick={handleClearFilters}
                            style={{ 
                              color: 'rgba(255,255,255,0.7)',
                              fontSize: '12px'
                            }}
                          >
                            Limpar filtros
                          </Button>
                        )}
                      </div>
                    );
                  })()}
                  
                  {(() => {
                    // Extrair tipos e categorias únicos para os filtros
                    const uniqueTypes = Array.from(new Set(memoizedMaintenanceEvents.map(e => e.type).filter(Boolean)));
                    const uniqueCategories = Array.from(new Set(memoizedMaintenanceEvents.map(e => e.category).filter(Boolean)));
                    
                    return (
                      <Row gutter={[12, 12]} className={styles.filterRow}>
                        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                          <div className={styles.filterItem}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                              Veículo
                            </Text>
                            <Select
                              value={pageState.selectedVehicle}
                              onChange={(value) => setPageState(prev => ({ ...prev, selectedVehicle: value }))}
                              style={{ width: '100%' }}
                              className={styles.filterSelect}
                              placeholder="Selecione o veículo"
                              showSearch
                              filterOption={(input, option) =>
                                (option?.label?.toString() ?? '').toLowerCase().includes(input.toLowerCase())
                              }
                            >
                              <Option value="all">Todos os veículos</Option>
                              {memoizedVehicles
                                .filter(v => v.status === 'active')
                                .map(vehicle => (
                                  <Option key={vehicle.id} value={vehicle.id} label={`${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`}>
                                    {vehicle.brand} {vehicle.model} - {vehicle.plate}
                                  </Option>
                                ))}
                            </Select>
                          </div>
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={5} xl={5}>
                          <div className={styles.filterItem}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                              Buscar
                            </Text>
                            <Input
                              placeholder="Descrição, local..."
                              prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                              value={pageState.searchTerm}
                              onChange={(e) => {
                                setPageState(prev => ({ ...prev, searchTerm: e.target.value }));
                              }}
                              allowClear
                              className={styles.filterInput}
                            />
                          </div>
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                          <div className={styles.filterItem}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                              Tipo de Serviço
                            </Text>
                            <Select
                              value={filterType}
                              onChange={(value) => setFilterType(value)}
                              style={{ width: '100%' }}
                              className={styles.filterSelect}
                            >
                              <Option value="all">Todos os tipos</Option>
                              {uniqueTypes.map(type => (
                                <Option key={type} value={type}>{getTypeLabel(type)}</Option>
                              ))}
                            </Select>
                          </div>
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                          <div className={styles.filterItem}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                              Categoria
                            </Text>
                            <Select
                              value={filterCategory}
                              onChange={(value) => setFilterCategory(value)}
                              style={{ width: '100%' }}
                              className={styles.filterSelect}
                            >
                              <Option value="all">Todas categorias</Option>
                              {uniqueCategories.map(category => (
                                <Option key={category} value={category}>{category}</Option>
                              ))}
                            </Select>
                          </div>
                        </Col>

                        <Col xs={24} sm={12} md={12} lg={7} xl={7}>
                          <div className={styles.filterItem}>
                            <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                              Período
                            </Text>
                            <RangePicker
                              value={dateRange}
                              onChange={(dates) => setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null)}
                              format="DD/MM/YYYY"
                              placeholder={['Data inicial', 'Data final']}
                              style={{ width: '100%' }}
                              className={styles.filterDatePicker}
                            />
                          </div>
                        </Col>
                      </Row>
                    );
                  })()}
                </div>

                
                <div className={styles.tableSeparator} />

                
                {filteredMaintenance.length === 0 ? (
                  <Empty
                    description={
                      <div>
                        <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                          Nenhum serviço encontrado
                        </Text>
                        <Text style={{ color: 'var(--text-secondary)' }}>
                          {pageState.searchTerm || pageState.selectedVehicle !== 'all'
                            ? 'Tente ajustar os filtros ou adicionar um novo serviço.'
                            : 'Adicione seu primeiro serviço para começar.'
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
                      Adicionar Serviço
                    </Button>
                  </Empty>
                ) : (
                  <Table
                    columns={columns}
                    dataSource={filteredMaintenance}
                    rowKey="id"
                    className={componentStyles.professionalTable}
                    pagination={{
                      pageSize: 5,
                      showSizeChanger: false,
                      showQuickJumper: false,
                      showTotal: (total, range) =>
                        `${range[0]}-${range[1]} de ${total} serviços`,
                    }}
                    scroll={{ x: 1200 }}
                  />
                )}
              </Card>
            </div>
          </>
        )}

      <ServiceModal
        open={pageState.serviceModalOpen}
        onClose={handleServiceModalClose}
        onAdd={handleServiceAdd}
        vehicles={memoizedVehicles}
        loading={false}
        notificationApi={api}
      />
      
      
      <Modal
        title="Detalhes do Serviço"
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
      {contextHolder}
    </DefaultFrame>
  );
});

export default MaintenancePage;