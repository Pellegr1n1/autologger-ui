import React, { useState, useEffect } from 'react';
import { Layout, Button, Typography, Spin, message, Modal, Card, Statistic, Progress, Avatar, Badge, Divider, Space, Tooltip, Table, Tag, Row, Col, Select, DatePicker, Input, Form, Menu } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  SettingOutlined, 
  BellOutlined, 
  HomeOutlined, 
  CalendarOutlined, 
  BarChartOutlined, 
  LogoutOutlined, 
  TrophyOutlined, 
  StarOutlined, 
  FireOutlined, 
  MenuOutlined, 
  DeleteOutlined, 
  EditOutlined, 
  EyeOutlined, 
  DollarOutlined, 
  CarOutlined,
  PlusOutlined,
  ToolOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createEventColumns } from '../../features/vehicles/utils/tableColumns';
import { currencyBRL, formatBRDate, kmFormat } from '../../utils/format';
import { VehicleService } from '../../services/api/vehicleService';
import { Vehicle, VehicleEvent, VehicleEventType } from '../../features/vehicles/types/vehicle.types';
import ServiceModal from '../../features/vehicles/components/ServiceModal';
import styles from './EventsPage.module.css';

const { Text, Title } = Typography;
const { Sider, Content, Header } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function EventsPage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [events, setEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Carregar veículos para o filtro
      const vehiclesData = await VehicleService.getUserVehicles();
      setVehicles(vehiclesData.active || []);
      
      // TODO: Implementar busca de eventos quando o serviço estiver disponível
      // Por enquanto, vamos usar dados mockados para todos os veículos
      const mockEvents: VehicleEvent[] = [
        {
          id: "evt-1",
          vehicleId: "veh-1",
          type: VehicleEventType.MAINTENANCE,
          category: "Troca de óleo",
          mileage: 45000,
          date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          description: "Troca de óleo 5W30 sintético e filtro",
          cost: 320.0,
          location: "Oficina ABC",
          attachments: ["NF_Troca_Oleo.pdf"],
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          
          // Blockchain fields
          blockchainStatus: {
            status: 'CONFIRMED',
            message: 'Confirmado na blockchain',
            lastUpdate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            retryCount: 0,
            maxRetries: 3
          },
          hash: "0xabc...123",
          previousHash: undefined,
          merkleRoot: "0xmerkle...123",
          isImmutable: true,
          canEdit: false,
          
          // Two-factor confirmation
          requiresConfirmation: true,
          confirmedBy: "user",
          confirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          confirmationHash: "0xabc...123"
        },
        {
          id: "evt-2",
          vehicleId: "veh-1",
          type: VehicleEventType.OTHER,
          category: "Licenciamento",
          mileage: 46500,
          date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          description: "Licenciamento anual",
          cost: 180.5,
          location: "DETRAN",
          attachments: [],
          createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
          
          // Blockchain fields
          blockchainStatus: {
            status: 'PENDING',
            message: 'Aguardando confirmação blockchain',
            lastUpdate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
            retryCount: 0,
            maxRetries: 3
          },
          hash: undefined,
          previousHash: undefined,
          merkleRoot: undefined,
          isImmutable: false,
          canEdit: true,
          
          // Two-factor confirmation
          requiresConfirmation: true,
          confirmedBy: undefined,
          confirmedAt: undefined,
          confirmationHash: undefined
        },
        {
          id: "evt-3",
          vehicleId: "veh-2",
          type: VehicleEventType.MAINTENANCE,
          category: "Troca de pneus",
          mileage: 32000,
          date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          description: "Troca dos 4 pneus por novos",
          cost: 1200.0,
          location: "Oficina XYZ",
          attachments: ["NF_Pneus.pdf"],
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          
          // Blockchain fields
          blockchainStatus: {
            status: 'CONFIRMED',
            message: 'Confirmado na blockchain',
            lastUpdate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            retryCount: 0,
            maxRetries: 3
          },
          hash: "0xdef...456",
          previousHash: undefined,
          merkleRoot: "0xmerkle...456",
          isImmutable: true,
          canEdit: false,
          
          // Two-factor confirmation
          requiresConfirmation: true,
          confirmedBy: "user",
          confirmedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          confirmationHash: "0xdef...456"
        }
      ];
      
      setEvents(mockEvents);
      
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      message.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEvent = (event: VehicleEvent) => {
    // TODO: Implementar edição
    message.info('Funcionalidade de edição será implementada em breve');
  };

  const handleDeleteEvent = (eventId: string) => {
    Modal.confirm({
      title: 'Confirmar exclusão',
      content: 'Deseja excluir este serviço? Esta ação não pode ser desfeita.',
      onOk: async () => {
        try {
          // TODO: Implementar exclusão
          setEvents(prev => prev.filter(e => e.id !== eventId));
          message.success('Serviço excluído com sucesso');
        } catch (error) {
          message.error('Erro ao excluir serviço');
        }
      }
    });
  };

  const handleAddEvent = (eventData: any) => {
    // TODO: Implementar adição
    const newEvent: VehicleEvent = {
      id: `evt-${Date.now()}`,
      vehicleId: eventData.vehicleId,
      type: eventData.type,
      category: eventData.category,
      mileage: eventData.mileage,
      date: new Date(eventData.date),
      description: eventData.description,
      cost: eventData.cost,
      location: eventData.location,
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Blockchain fields
      blockchainStatus: {
        status: 'PENDING',
        message: 'Aguardando confirmação blockchain',
        lastUpdate: new Date(),
        retryCount: 0,
        maxRetries: 3
      },
      hash: undefined,
      previousHash: undefined,
      merkleRoot: undefined,
      isImmutable: false,
      canEdit: true,
      
      // Two-factor confirmation
      requiresConfirmation: true,
      confirmedBy: undefined,
      confirmedAt: undefined,
      confirmationHash: undefined
    };
    
    setEvents(prev => [newEvent, ...prev]);
    setServiceModalOpen(false);
    message.success('Serviço adicionado com sucesso');
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/home')
    },
    {
      key: 'vehicles',
      icon: <CarOutlined />,
      label: 'Meus Veículos',
      onClick: () => navigate('/vehicles')
    },
    {
      key: 'events',
      icon: <ToolOutlined />,
      label: 'Manutenções',
      onClick: () => navigate('/events')
    },
    {
      key: 'reports',
      icon: <BarChartOutlined />,
      label: 'Relatórios',
      onClick: () => navigate('/reports')
    },
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Perfil',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Configurações',
      onClick: () => navigate('/settings')
    }
  ];

  // Filtrar eventos baseado nos filtros
  const filteredEvents = events.filter(event => {
    if (selectedVehicle !== 'all' && event.vehicleId !== selectedVehicle) return false;
    if (searchTerm && !event.description.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  // Calcular estatísticas
  const totalCost = filteredEvents.reduce((sum, event) => sum + (event.cost || 0), 0);
  const maintenanceEvents = filteredEvents.filter(e => e.type === 'maintenance').length;
  const fuelEvents = filteredEvents.filter(e => e.type === 'fuel').length;
  const repairEvents = filteredEvents.filter(e => e.type === 'repair').length;

  // Calcular próximo serviço estimado
  const getNextServiceEstimate = () => {
    if (events.length === 0) return 'Não disponível';
    const lastEvent = events[0];
    const nextMileage = (lastEvent?.mileage || 0) + 5000;
    return `${kmFormat(nextMileage)} km`;
  };

  // Calcular média de gastos por mês
  const getAverageMonthlyCost = () => {
    if (events.length === 0) return 0;
    const monthsDiff = events.length > 1 ? 
      (new Date(events[0].date).getTime() - new Date(events[events.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 1;
    return totalCost / Math.max(monthsDiff, 1);
  };

  // Estado de loading
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '60vh',
        padding: '48px',
        background: 'var(--background-color)',
        color: 'var(--text-primary)'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
          Carregando manutenções...
        </Text>
      </div>
    );
  }

  return (
    <Layout className={styles.eventsLayout}>
      {/* Sidebar */}
      <Sider 
        trigger={null} 
        collapsible 
        collapsed={collapsed}
        className={styles.sidebar}
        width={280}
      >
        <div className={styles.sidebarHeader}>
          <div className={styles.logoContainer}>
            <div className={styles.logoIcon}>
              <ToolOutlined />
            </div>
            {!collapsed && (
              <Title level={4} className={styles.logoText}>
                AutoLogger
              </Title>
            )}
          </div>
        </div>
        
        <Menu
          mode="inline"
          selectedKeys={['events']}
          items={menuItems}
          className={styles.sidebarMenu}
        />
        
        <div className={styles.sidebarFooter}>
          <Button 
            type="text" 
            icon={<LogoutOutlined />}
            className={styles.logoutButton}
            onClick={() => navigate('/login')}
          >
            {!collapsed && 'Sair'}
          </Button>
        </div>
      </Sider>

      <Layout className={styles.mainLayout}>
        {/* Header */}
        <Header className={styles.header}>
          <div className={styles.headerContent}>
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              className={styles.collapseButton}
            />
            
            <div className={styles.headerRight}>
              <Tooltip title="Notificações">
                <Badge count={3} size="small">
                  <Button type="text" icon={<BellOutlined />} className={styles.headerButton} />
                </Badge>
              </Tooltip>
              
              <Avatar 
                size="small" 
                icon={<UserOutlined />} 
                className={styles.userAvatar}
              />
            </div>
          </div>
        </Header>

        {/* Content */}
        <Content className={styles.content}>
          <div className={styles.contentWrapper}>
            {/* Hero Section */}
            <div className={styles.heroSection}>
              <div className={styles.heroContent}>
                <div className={styles.heroLeft}>
                  <Title level={1} className={styles.heroTitle}>
                    <span className={styles.heroHighlight}>Manutenções</span>
                  </Title>
                  <Text className={styles.heroDescription}>
                    Gerencie todos os serviços e manutenções da sua frota em um só lugar
                  </Text>
                  
                  <Space size="middle">
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={() => setServiceModalOpen(true)}
                      className={styles.heroButton}
                    >
                      Novo Serviço
                    </Button>
                  </Space>
                </div>
                
                <div className={styles.heroRight}>
                  <div className={styles.statsCards}>
                    <Card className={styles.statCard}>
                      <Statistic
                        title="Total Gasto"
                        value={totalCost}
                        prefix={<DollarOutlined className={styles.statIcon} />}
                        suffix="R$"
                        precision={2}
                        valueStyle={{ color: 'var(--primary-color)' }}
                      />
                    </Card>
                    
                    <Card className={styles.statCard}>
                      <Statistic
                        title="Serviços Realizados"
                        value={filteredEvents.length}
                        prefix={<ToolOutlined className={styles.statIcon} />}
                        valueStyle={{ color: 'var(--success-color)' }}
                      />
                    </Card>
                  </div>
                </div>
              </div>
            </div>

            {/* Filtros */}
            <Card className={styles.filtersCard}>
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={12} md={6}>
                  <Text strong>Veículo:</Text>
                  <Select
                    value={selectedVehicle}
                    onChange={setSelectedVehicle}
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder="Selecionar veículo"
                  >
                    <Option value="all">Todos os veículos</Option>
                    {vehicles.map(vehicle => (
                      <Option key={vehicle.id} value={vehicle.id}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      </Option>
                    ))}
                  </Select>
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <Text strong>Período:</Text>
                  <DatePicker.RangePicker
                    style={{ width: '100%', marginTop: '8px' }}
                    placeholder={['Data inicial', 'Data final']}
                    onChange={(dates) => {
                      if (dates) {
                        setDateRange([dates[0]?.toISOString() || '', dates[1]?.toISOString() || '']);
                      } else {
                        setDateRange(null);
                      }
                    }}
                  />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <Text strong>Buscar:</Text>
                  <Input
                    placeholder="Descrição do serviço..."
                    prefix={<SearchOutlined />}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ marginTop: '8px' }}
                  />
                </Col>
                
                <Col xs={24} sm={12} md={6}>
                  <Button
                    icon={<FilterOutlined />}
                    onClick={() => {
                      setSelectedVehicle('all');
                      setDateRange(null);
                      setSearchTerm('');
                    }}
                    style={{ marginTop: '24px' }}
                  >
                    Limpar Filtros
                  </Button>
                </Col>
              </Row>
            </Card>

            {/* Cards de estatísticas */}
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              <Col xs={24} sm={12} md={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                  bodyStyle={{ padding: '20px', textAlign: 'center' }}
                >
                  <Statistic
                    title={<Text style={{ color: 'white', fontSize: '12px' }}>Total Gasto</Text>}
                    value={totalCost}
                    prefix={<DollarOutlined style={{ color: 'white' }} />}
                    suffix="R$"
                    precision={2}
                    valueStyle={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '24px' 
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                  bodyStyle={{ padding: '20px', textAlign: 'center' }}
                >
                  <Statistic
                    title={<Text style={{ color: 'white', fontSize: '12px' }}>Manutenções</Text>}
                    value={maintenanceEvents}
                    prefix={<ToolOutlined style={{ color: 'white' }} />}
                    valueStyle={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '24px' 
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                  bodyStyle={{ padding: '20px', textAlign: 'center' }}
                >
                  <Statistic
                    title={<Text style={{ color: 'white', fontSize: '12px' }}>Abastecimentos</Text>}
                    value={fuelEvents}
                    prefix={<DollarOutlined style={{ color: 'white' }} />}
                    valueStyle={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '24px' 
                    }}
                  />
                </Card>
              </Col>
              
              <Col xs={24} sm={12} md={6}>
                <Card 
                  style={{ 
                    background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                    border: 'none',
                    borderRadius: '16px'
                  }}
                  bodyStyle={{ padding: '20px', textAlign: 'center' }}
                >
                  <Statistic
                    title={<Text style={{ color: 'white', fontSize: '12px' }}>Reparos</Text>}
                    value={repairEvents}
                    prefix={<ToolOutlined style={{ color: 'white' }} />}
                    valueStyle={{ 
                      color: 'white', 
                      fontWeight: 700, 
                      fontSize: '24px' 
                    }}
                  />
                </Card>
              </Col>
            </Row>

            {/* Informações adicionais */}
            <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
              <Col xs={24} md={12}>
                <Card 
                  title={
                    <Space>
                      <CalendarOutlined style={{ color: 'var(--primary-color)' }} />
                      <span>Próximo Serviço</span>
                    </Space>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    background: 'var(--surface-color)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Estimativa</Text>
                      <div>
                        <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                          {getNextServiceEstimate()}
                        </Text>
                      </div>
                    </div>
                    
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Média mensal</Text>
                      <div>
                        <Text strong style={{ fontSize: '18px', color: 'var(--text-primary)' }}>
                          {currencyBRL(getAverageMonthlyCost())}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
              
              <Col xs={24} md={12}>
                <Card 
                  title={
                    <Space>
                      <ToolOutlined style={{ color: 'var(--primary-color)' }} />
                      <span>Status dos Serviços</span>
                    </Space>
                  }
                  style={{ 
                    borderRadius: '16px',
                    border: '1px solid rgba(139, 92, 246, 0.2)',
                    background: 'var(--surface-color)'
                  }}
                >
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Frequência de serviços</Text>
                      <div style={{ marginTop: '8px' }}>
                        <Progress 
                          percent={Math.min((filteredEvents.length / 20) * 100, 100)} 
                          strokeColor={{
                            '0%': 'var(--primary-color)',
                            '100%': 'var(--accent-color)'
                          }}
                          trailColor="var(--text-secondary)"
                          size="small"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Último serviço</Text>
                      <div>
                        <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
                          {filteredEvents.length > 0 ? formatBRDate(filteredEvents[0].date) : 'Nunca'}
                        </Text>
                      </div>
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>

            {/* Tabela de eventos */}
            <Card 
              title={
                <Space>
                  <ToolOutlined style={{ color: 'var(--primary-color)' }} />
                  <span>Histórico de Serviços</span>
                </Space>
              }
              extra={
                <Button 
                  type="primary" 
                  icon={<PlusOutlined />}
                  onClick={() => setServiceModalOpen(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--accent-color) 100%)',
                    border: 'none',
                    borderRadius: '8px',
                    height: '40px',
                    paddingLeft: '20px',
                    paddingRight: '20px'
                  }}
                >
                  Adicionar Serviço
                </Button>
              }
              style={{ 
                borderRadius: '16px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                background: 'var(--surface-color)'
              }}
            >
              <Table
                size="middle"
                rowKey="id"
                dataSource={filteredEvents}
                columns={createEventColumns(handleEditEvent, handleDeleteEvent)}
                pagination={{ 
                  pageSize: 10, 
                  showLessItems: true,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} serviços`
                }}
              />
            </Card>
          </div>
        </Content>
      </Layout>

      {/* Modal de serviço */}
      <ServiceModal
        open={serviceModalOpen}
        onClose={() => setServiceModalOpen(false)}
        onAdd={handleAddEvent}
        vehicleId={vehicles.length > 0 ? vehicles[0].id : ''}
        currentMileage={vehicles.length > 0 ? vehicles[0].mileage : 0}
      />
    </Layout>
  );
}