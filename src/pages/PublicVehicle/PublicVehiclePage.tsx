import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Typography,
  Card,
  Row,
  Col,
  Spin,
  Alert,
  Tag,
  Image,
  Button,
  Pagination,
  Select,
  Input,
  DatePicker,
  Tooltip,
  Modal,
} from 'antd';
import dayjs from 'dayjs';
import {
  CarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SettingOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  ArrowLeftOutlined,
  DollarOutlined,
  ToolOutlined,
  SafetyOutlined,
  FileOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  DownloadOutlined,
  PaperClipOutlined,
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import { VehicleShareService, PublicVehicleInfo } from '../../features/vehicles/services/vehicleShareService';
import { formatBRDate } from '../../shared/utils/format';
import styles from './PublicVehiclePage.module.css';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

const ITEMS_PER_PAGE = 6;

const PublicVehiclePage: React.FC = () => {
  const { shareToken } = useParams<{ shareToken: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [vehicleInfo, setVehicleInfo] = useState<PublicVehicleInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attachmentsModalOpen, setAttachmentsModalOpen] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [selectedServiceTitle, setSelectedServiceTitle] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Estados dos filtros
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState<string>('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  useEffect(() => {
    if (shareToken) {
      loadVehicleInfo();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shareToken]);

  const loadVehicleInfo = async () => {
    if (!shareToken) return;

    setLoading(true);
    try {
      const data = await VehicleShareService.getPublicVehicleInfo(shareToken);
      setVehicleInfo(data);
    } catch (error: any) {
      console.error('Erro ao carregar informações do veículo:', error);
      setError(error.response?.data?.message || 'Erro ao carregar informações do veículo');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return formatBRDate(dateString);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('pt-BR').format(mileage) + ' km';
  };

  const getVehicleAge = (year: number) => {
    return new Date().getFullYear() - year;
  };

  const getServiceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'manutenção':
        return <SettingOutlined />;
      case 'reparo':
        return <ToolOutlined />;
      case 'inspeção':
        return <SafetyOutlined />;
      case 'combustível':
        return <CarOutlined />;
      case 'despesa':
        return <DollarOutlined />;
      default:
        return <SettingOutlined />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'manutenção':
        return 'blue';
      case 'reparo':
        return 'red';
      case 'inspeção':
        return 'green';
      case 'combustível':
        return 'orange';
      case 'despesa':
        return 'purple';
      default:
        return 'default';
    }
  };

  const getBlockchainStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'confirmado':
        return 'success';
      case 'pendente':
        return 'warning';
      case 'rejeitado':
        return 'error';
      case 'expirado':
        return 'default';
      default:
        return 'default';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('pdf')) {
      return <FilePdfOutlined style={{ color: '#f5222d' }} />;
    } else if (fileType.includes('image')) {
      return <FileImageOutlined style={{ color: '#52c41a' }} />;
    } else {
      return <FileOutlined style={{ color: '#1890ff' }} />;
    }
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

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingContent}>
          <Spin size="large" className={styles.loadingSpinner} />
          <div className={styles.loadingText}>
            <Text>Carregando informações do veículo...</Text>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <Card className={styles.errorCard}>
          <Alert
            message="Erro ao carregar informações"
            description={error}
            type="error"
            showIcon
            style={{ marginBottom: 'var(--space-lg)' }}
          />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            block
            size="large"
          >
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  if (!vehicleInfo) {
    return null;
  }

  // Verificar se o veículo foi vendido e bloquear acesso à página pública
  if (vehicleInfo.status !== 'active') {
    return (
      <div className={styles.errorContainer}>
        <Card className={styles.errorCard}>
          <Alert
            message="Acesso Bloqueado"
            description="Este veículo foi vendido e não está mais disponível para visualização pública."
            type="warning"
            showIcon
            icon={<CarOutlined />}
            style={{ marginBottom: 'var(--space-lg)' }}
          />
          <Button 
            type="primary" 
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/')}
            block
            size="large"
          >
            Voltar ao início
          </Button>
        </Card>
      </div>
    );
  }

  const totalCost = vehicleInfo.maintenanceHistory.reduce((sum, service) => {
    const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
    return sum + cost;
  }, 0);
  
  // Ordenar histórico completo por data de serviço (criar cópia para não mutar original)
  const sortedHistory = [...vehicleInfo.maintenanceHistory]
    .sort((a, b) => new Date(b.serviceDate).getTime() - new Date(a.serviceDate).getTime());
  
  // Ordenar últimos serviços registrados por createdAt (mais recentes primeiro)
  const sortedByCreatedAt = [...vehicleInfo.maintenanceHistory]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Aplicar filtros
  const filteredHistory = sortedHistory.filter((service) => {
    // Filtro por tipo
    if (filterType !== 'all' && service.type.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }

    // Filtro por categoria
    if (filterCategory !== 'all' && service.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }

    // Filtro por texto (busca em descrição, local, técnico, notas)
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      const matchesDescription = service.description?.toLowerCase().includes(searchLower);
      const matchesLocation = service.location?.toLowerCase().includes(searchLower);
      const matchesTechnician = service.technician?.toLowerCase().includes(searchLower);
      const matchesNotes = service.notes?.toLowerCase().includes(searchLower);
      
      if (!matchesDescription && !matchesLocation && !matchesTechnician && !matchesNotes) {
        return false;
      }
    }

    // Filtro por período de data
    if (dateRange && dateRange[0] && dateRange[1]) {
      const serviceDate = dayjs(service.serviceDate);
      if (!serviceDate.isAfter(dateRange[0].subtract(1, 'day')) || !serviceDate.isBefore(dateRange[1].add(1, 'day'))) {
        return false;
      }
    }

    return true;
  });

  // Extrair tipos e categorias únicos para os filtros
  const uniqueTypes: string[] = Array.from(new Set(sortedHistory.map(s => s.type)));
  const uniqueCategories: string[] = Array.from(new Set(sortedHistory.map(s => s.category)));

  // Calcular itens da página atual
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentItems = filteredHistory.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll suave para o início do grid de serviços (não esconde os cards acima)
    const maintenanceGrid = document.querySelector('#maintenance-grid-start');
    if (maintenanceGrid) {
      // Offset de 100px para mostrar um pouco do contexto acima
      const yOffset = -120;
      const element = maintenanceGrid as HTMLElement;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const handleViewAttachments = (attachments: any[], serviceTitle: string) => {
    setSelectedAttachments(attachments);
    setSelectedServiceTitle(serviceTitle);
    setAttachmentsModalOpen(true);
  };

  const handleClearFilters = () => {
    setFilterType('all');
    setFilterCategory('all');
    setSearchText('');
    setDateRange(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = filterType !== 'all' || filterCategory !== 'all' || searchText !== '' || dateRange !== null;

  return (
    <div className={styles.publicContainer}>
      <div className={styles.contentWrapper}>
        {/* Header */}
        <Card className={styles.headerCard}>
          <div className={styles.headerContent}>
            <div className={styles.vehicleIcon}>
              {vehicleInfo.photoUrl ? (
                <Image
                  src={vehicleInfo.photoUrl}
                  alt="Foto do veículo"
                  className={styles.vehicleIconImage}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%',
                    cursor: 'pointer'
                  }}
                  preview={{
                    mask: 'Visualizar em tamanho real'
                  }}
                />
              ) : (
                <CarOutlined />
              )}
            </div>

            <Title level={1} className={styles.vehicleTitle}>
              {vehicleInfo.brand} {vehicleInfo.model}
            </Title>

            <div className={styles.vehicleInfo}>
              <div className={styles.statusTag}>
                <CheckCircleOutlined />
                <Text>
                  {vehicleInfo.status === 'active' ? 'ATIVO' : 'VENDIDO'}
                </Text>
              </div>
            </div>
          </div>
        </Card>

        <Row gutter={[24, 24]}>
          {/* Informações do Veículo */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div className={styles.cardTitle}>
                  <IdcardOutlined className="icon" />
                  <span>Informações do Veículo</span>
                </div>
              }
              className={styles.infoCard}
            >
              <div className={styles.infoCardContent}>
                <div className={styles.infoRow}>
                  <Text type="secondary" className={styles.infoLabel}>Ano:</Text>
                  <Text strong className={styles.infoValue}>{vehicleInfo.year} ({getVehicleAge(vehicleInfo.year)} anos)</Text>
                </div>

                <div className={styles.infoRow}>
                  <Text type="secondary" className={styles.infoLabel}>Cor:</Text>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        width: '18px',
                        height: '18px',
                        borderRadius: '50%',
                        backgroundColor: vehicleInfo.color.toLowerCase() === 'branco' ? '#f0f0f0' :
                          vehicleInfo.color.toLowerCase() === 'preto' ? '#000000' :
                            vehicleInfo.color.toLowerCase() === 'prata' ? '#c0c0c0' :
                              vehicleInfo.color.toLowerCase() === 'cinza' ? '#808080' :
                                vehicleInfo.color.toLowerCase() === 'azul' ? '#1890ff' :
                                  vehicleInfo.color.toLowerCase() === 'vermelho' ? '#f5222d' :
                                    vehicleInfo.color.toLowerCase() === 'verde' ? '#52c41a' :
                                      vehicleInfo.color.toLowerCase() === 'amarelo' ? '#fadb14' :
                                        vehicleInfo.color.toLowerCase() === 'marrom' ? '#8b4513' :
                                          vehicleInfo.color.toLowerCase() === 'bege' ? '#f5f5dc' :
                                            vehicleInfo.color.toLowerCase() === 'roxo' ? '#722ed1' :
                                              vehicleInfo.color.toLowerCase() === 'laranja' ? '#fa8c16' :
                                                vehicleInfo.color.toLowerCase() === 'rosa' ? '#eb2f96' :
                                                  vehicleInfo.color.toLowerCase() === 'dourado' ? '#d4af37' :
                                                    '#808080',
                        border: '2px solid rgba(139, 92, 246, 0.3)',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                      }}
                    />
                    <Text strong className={styles.infoValue}>{vehicleInfo.color}</Text>
                  </div>
                </div>

                <div className={styles.infoRow}>
                  <Text type="secondary" className={styles.infoLabel}>Quilometragem:</Text>
                  <Text strong className={styles.infoValue}>{formatMileage(vehicleInfo.mileage)}</Text>
                </div>

                <div className={styles.infoRow}>
                  <Text type="secondary" className={styles.infoLabel}>Cadastrado em:</Text>
                  <Text strong className={styles.infoValue}>{formatDate(vehicleInfo.createdAt)}</Text>
                </div>
              </div>
            </Card>
          </Col>

          {/* Estatísticas */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div className={styles.cardTitle}>
                  <DashboardOutlined className="icon" />
                  <span>Estatísticas</span>
                </div>
              }
              className={styles.infoCard}
            >
              <div className={styles.statisticsGrid}>
                <Tooltip title={`Total de Serviços: ${vehicleInfo.maintenanceHistory.length}`} placement="top">
                  <div className={styles.statisticItem}>
                    <div className={styles.statisticIcon}>
                      <SettingOutlined />
                    </div>
                    <div className={styles.statisticContent}>
                      <Text type="secondary" className={styles.statisticLabel}>Total de Serviços</Text>
                      <Text strong className={styles.statisticValue}>{vehicleInfo.maintenanceHistory.length}</Text>
                    </div>
                  </div>
                </Tooltip>
                
                <Tooltip title={`Investimento Total: ${formatCurrency(totalCost)}`} placement="top">
                  <div className={styles.statisticItem}>
                    <div className={styles.statisticIcon}>
                      <DollarOutlined />
                    </div>
                    <div className={styles.statisticContent}>
                      <Text type="secondary" className={styles.statisticLabel}>Investimento Total</Text>
                      <Text strong className={styles.statisticValue}>{formatCurrency(totalCost)}</Text>
                    </div>
                  </div>
                </Tooltip>
                
                <Tooltip title={`Idade do Veículo: ${getVehicleAge(vehicleInfo.year)} anos`} placement="top">
                  <div className={styles.statisticItem}>
                    <div className={styles.statisticIcon}>
                      <CalendarOutlined />
                    </div>
                    <div className={styles.statisticContent}>
                      <Text type="secondary" className={styles.statisticLabel}>Idade do Veículo</Text>
                      <Text strong className={styles.statisticValue}>{getVehicleAge(vehicleInfo.year)} anos</Text>
                    </div>
                  </div>
                </Tooltip>
                
                <Tooltip title={`Quilometragem: ${formatMileage(vehicleInfo.mileage)}`} placement="top">
                  <div className={styles.statisticItem}>
                    <div className={styles.statisticIcon}>
                      <DashboardOutlined />
                    </div>
                    <div className={styles.statisticContent}>
                      <Text type="secondary" className={styles.statisticLabel}>Quilometragem</Text>
                      <Text strong className={styles.statisticValue}>{formatMileage(vehicleInfo.mileage)}</Text>
                    </div>
                  </div>
                </Tooltip>
              </div>
            </Card>
          </Col>

          {/* Últimos Serviços Registrados */}
          <Col xs={24} lg={8}>
            <Card
              title={
                <div className={styles.cardTitle}>
                  <HistoryOutlined className="icon" />
                  <span>Últimos Serviços Registrados</span>
                </div>
              }
              className={`${styles.infoCard} ${styles.lastMaintenanceCard}`}
            >
              {vehicleInfo.maintenanceHistory.length === 0 ? (
                <div className={styles.emptyState}>
                  <HistoryOutlined style={{ fontSize: '32px', color: 'rgba(139, 92, 246, 0.3)', marginBottom: '12px' }} />
                  <Text type="secondary">Nenhum serviço registrado</Text>
                </div>
              ) : (
                <div className={styles.maintenanceList}>
                  {sortedByCreatedAt.slice(0, 2).map((service: typeof sortedByCreatedAt[0], index: number) => (
                    <div key={index} className={styles.maintenanceListItem}>
                      <div className={styles.maintenanceItemHeader}>
                        <div className={styles.maintenanceItemIcon}>
                          {getServiceIcon(service.type)}
                        </div>
                        <div className={styles.maintenanceItemInfo}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <Text strong style={{ fontSize: '15px', lineHeight: '1.4' }}>{service.type}</Text>
                            <Tag color={getServiceColor(service.type)} style={{ fontSize: '11px', margin: 0, padding: '3px 10px', borderRadius: '12px' }}>
                              {service.category}
                            </Tag>
                          </div>
                          <div style={{ 
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            paddingTop: '8px',
                            borderTop: '1px solid rgba(139, 92, 246, 0.15)'
                          }}>
                            <div>
                              <Text style={{ fontSize: '14px', color: 'var(--success-color)', fontWeight: 600, display: 'block' }}>
                                {formatCurrency(service.cost)}
                              </Text>
                              <Text type="secondary" style={{ fontSize: '11px', display: 'block', marginTop: '2px' }}>
                                {formatMileage(service.mileage)}
                              </Text>
                            </div>
                            {service.warranty && (
                              <Tag color="green" icon={<SafetyOutlined />} style={{ fontSize: '10px', margin: 0 }}>
                                Garantia
                              </Tag>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>

        {/* Histórico Completo */}
        {vehicleInfo.maintenanceHistory.length > 0 && (
          <Card
            id="complete-history"
            title={
              <div className={styles.cardTitle}>
                <HistoryOutlined className="icon" />
                <span>Histórico Completo de Serviços ({sortedHistory.length})</span>
              </div>
            }
            className={styles.statisticCard}
            bodyStyle={{ padding: '24px' }}
          >
            {/* Filtros */}
            <div className={styles.filterSection}>
              <div className={styles.filterHeader}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FilterOutlined style={{ color: 'var(--primary-color)', fontSize: '18px' }} />
                  <Text strong style={{ fontSize: '16px' }}>Filtros</Text>
                  {hasActiveFilters && (
                    <Tag color="purple" style={{ fontSize: '10px', margin: 0 }}>
                      {filteredHistory.length} resultado{filteredHistory.length !== 1 ? 's' : ''}
                    </Tag>
                  )}
                </div>
                {hasActiveFilters && (
                  <Button 
                      size="small" 
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                    style={{ fontSize: '12px' }}
                  >
                    Limpar filtros
                  </Button>
                )}
              </div>

              <Row gutter={[12, 12]} className={styles.filterRow}>
                <Col xs={24} sm={12} md={6}>
                  <div className={styles.filterItem}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Buscar
                    </Text>
                    <Input
                      placeholder="Descrição, local, técnico..."
                      prefix={<SearchOutlined style={{ color: 'rgba(255,255,255,0.4)' }} />}
                      value={searchText}
                      onChange={(e) => {
                        setSearchText(e.target.value);
                        setCurrentPage(1);
                      }}
                      allowClear
                      className={styles.filterInput}
                    />
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className={styles.filterItem}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Tipo de Serviço
                    </Text>
                    <Select
                      value={filterType}
                      onChange={(value) => {
                        setFilterType(value);
                        setCurrentPage(1);
                      }}
                      style={{ width: '100%' }}
                      className={styles.filterSelect}
                    >
                      <Option value="all">Todos os tipos</Option>
                      {uniqueTypes.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                      ))}
                    </Select>
                  </div>
                </Col>

                <Col xs={24} sm={12} md={6}>
                  <div className={styles.filterItem}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Categoria
                    </Text>
                    <Select
                      value={filterCategory}
                      onChange={(value) => {
                        setFilterCategory(value);
                        setCurrentPage(1);
                      }}
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

                <Col xs={24} sm={12} md={6}>
                  <div className={styles.filterItem}>
                    <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                      Período
                          </Text>
                    <RangePicker
                      value={dateRange}
                      onChange={(dates) => {
                        setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null] | null);
                        setCurrentPage(1);
                      }}
                      format="DD/MM/YYYY"
                      placeholder={['Data inicial', 'Data final']}
                      style={{ width: '100%' }}
                      className={styles.filterDatePicker}
                    />
                  </div>
                </Col>
              </Row>
            </div>

            {/* Grid de Serviços */}
            <div id="maintenance-grid-start"></div>
            {filteredHistory.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                background: 'rgba(139, 92, 246, 0.05)',
                borderRadius: '12px',
                marginTop: '20px'
              }}>
                <FilterOutlined style={{ fontSize: '48px', color: 'rgba(139, 92, 246, 0.3)', marginBottom: '16px' }} />
                <Title level={4} style={{ color: 'rgba(255,255,255,0.6)', marginBottom: '8px' }}>
                  Nenhum serviço encontrado
                </Title>
                <Text type="secondary">
                  Tente ajustar os filtros para encontrar o que procura
                          </Text>
                        </div>
            ) : (
              <div className={styles.maintenanceGrid}>
              {currentItems.map((service: typeof currentItems[0], index: number) => (
                <div key={startIndex + index} className={styles.maintenanceCard}>
                  {/* Header */}
                  <div className={styles.maintenanceCardHeader}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', flex: 1 }}>
                      <div className={styles.maintenanceCardIcon}>
                        {getServiceIcon(service.type)}
                            </div>
                      <div className={styles.maintenanceCardTitle}>
                        <span className={styles.maintenanceCardType}>{service.type}</span>
                        <div className={styles.maintenanceCardDate}>
                          <CalendarOutlined />
                          <span>{formatDate(service.serviceDate)}</span>
                        </div>
                      </div>
                    </div>
                    <div className={styles.maintenanceCardCost}>
                      {formatCurrency(service.cost)}
                        </div>
                      </div>

                  {/* Body */}
                  <div className={styles.maintenanceCardBody}>
                    <div className={styles.maintenanceCardDescription}>
                      {service.description}
                      </div>

                    <div className={styles.maintenanceCardDetails}>
                      <div className={styles.maintenanceCardDetail}>
                        <span className={styles.maintenanceCardDetailLabel}>Quilometragem</span>
                        <span className={styles.maintenanceCardDetailValue}>
                          {formatMileage(service.mileage)}
                        </span>
                      </div>
                      <div className={styles.maintenanceCardDetail}>
                        <span className={styles.maintenanceCardDetailLabel}>Local</span>
                        <span className={styles.maintenanceCardDetailValue}>{service.location}</span>
                      </div>
                      {service.attachments && service.attachments.length > 0 ? (
                        <div className={styles.maintenanceCardDetail}>
                          <span className={styles.maintenanceCardDetailLabel}>Anexos</span>
                          <span className={styles.maintenanceCardDetailValue}>
                            <Button
                              type="primary"
                              size="small"
                              onClick={() => handleViewAttachments(service.attachments || [], `${service.type} - ${service.category}`)}
                              style={{ 
                                fontSize: '10px', 
                                height: '20px', 
                                padding: '0 8px',
                                borderRadius: '4px'
                              }}
                            >
                              {service.attachments.length}
                            </Button>
                          </span>
                        </div>
                      ) : (
                        <div className={styles.maintenanceCardDetail}>
                          <span className={styles.maintenanceCardDetailLabel}></span>
                          <span className={styles.maintenanceCardDetailValue}></span>
                        </div>
                      )}
                          {service.technician && (
                        <div className={styles.maintenanceCardDetail}>
                          <span className={styles.maintenanceCardDetailLabel}>Técnico</span>
                          <span className={styles.maintenanceCardDetailValue}>{service.technician}</span>
                        </div>
                      )}
                      {service.nextServiceDate && (
                        <div className={styles.maintenanceCardDetail}>
                          <span className={styles.maintenanceCardDetailLabel}>Próxima Revisão</span>
                          <span className={styles.maintenanceCardDetailValue}>
                            {formatDate(service.nextServiceDate)}
                          </span>
                        </div>
                        )}
                      </div>

                  </div>

                  {/* Footer */}
                  <div className={styles.maintenanceCardFooter}>
                    <div className={styles.maintenanceCardTags}>
                      <Tag color={getServiceColor(service.type)} style={{ fontSize: '10px', margin: 0 }}>
                        {service.category}
                      </Tag>
                      {service.warranty && (
                        <Tag color="green" icon={<SafetyOutlined />} style={{ fontSize: '10px', margin: 0 }}>
                          Garantia
                        </Tag>
                      )}
                    </div>
                    <Tag 
                      color={service.blockchainHash ? getBlockchainStatusColor(service.blockchainStatus) : 'default'}
                      icon={service.blockchainHash ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                      style={{ fontSize: '10px', margin: 0 }}
                    >
                      {service.blockchainHash ? service.blockchainStatus : 'Não confirmado'}
                    </Tag>
                  </div>
                </div>
              ))}
                        </div>
                      )}

            {filteredHistory.length > ITEMS_PER_PAGE && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                marginTop: '32px',
                paddingTop: '24px',
                borderTop: '1px solid rgba(139, 92, 246, 0.15)'
              }}>
                <Pagination
                  current={currentPage}
                  total={filteredHistory.length}
                  pageSize={ITEMS_PER_PAGE}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  showTotal={(total, range) => `${range[0]}-${range[1]} de ${total} serviços`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                />
              </div>
            )}
          </Card>
        )}

      </div>

      {/* Modal de Anexos */}
      <Modal
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <PaperClipOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Anexos - {selectedServiceTitle}</span>
                          </div>
        }
        open={attachmentsModalOpen}
        onCancel={() => setAttachmentsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setAttachmentsModalOpen(false)}>
            Fechar
          </Button>
        ]}
        width={600}
        styles={{
          body: { maxHeight: '400px', overflowY: 'auto' }
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {selectedAttachments.map((attachment) => (
                              <a
                                key={attachment.id}
              href={getAbsoluteUrl(attachment.fileUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                gap: '12px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef',
                                  textDecoration: 'none',
                transition: 'all 0.3s ease'
                                }}
                                onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e3f2fd';
                e.currentTarget.style.borderColor = '#2196f3';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(33, 150, 243, 0.2)';
                                }}
                                onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.borderColor = '#e9ecef';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: '20px', color: 'var(--primary-color)' }}>
                                  {getFileIcon(attachment.fileType)}
              </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                <Text strong style={{ display: 'block', color: '#1890ff', fontSize: '14px' }}>
                                    {attachment.fileName}
                                  </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                                    {formatFileSize(attachment.fileSize)}
                                  </Text>
                                </div>
              <DownloadOutlined style={{ color: '#1890ff', fontSize: '16px' }} />
                              </a>
                            ))}
                        </div>
      </Modal>
    </div>
  );
};

export default PublicVehiclePage;
