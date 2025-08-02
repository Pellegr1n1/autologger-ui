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
  Modal,
  Progress,
  Tag,
  Avatar,
  List,
  Dropdown,
  MenuProps,
  Select,
  DatePicker,
  InputNumber,
  Input,
  Form
} from 'antd';
import {
  PlusOutlined,
  ToolOutlined,
  ExclamationCircleOutlined,
  DashboardOutlined,
  CalendarOutlined,
  CarOutlined,
  WarningOutlined,
  DollarOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import styles from './MaintenancePage.module.css';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface Vehicle {
  id: string;
  brand: string;
  model: string;
  year: number;
  plate: string;
}

interface Maintenance {
  id: string;
  vehicleId: string;
  vehicleName: string;
  type: 'preventive' | 'corrective' | 'emergency';
  service: string;
  description: string;
  cost: number;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  mileage: number;
  nextServiceKm?: number;
  nextServiceDate?: string;
  provider: string;
  invoiceNumber?: string;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
}

interface MaintenanceStats {
  total: number;
  scheduled: number;
  completed: number;
  totalCost: number;
  avgCost: number;
  overdueCount: number;
}

const MaintenancePage: React.FC = () => {
  const { vehicleId } = useParams<{ vehicleId?: string }>();
  const navigate = useNavigate();
  
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [stats, setStats] = useState<MaintenanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedMaintenance, setSelectedMaintenance] = useState<Maintenance | null>(null);
  const [editingMaintenance, setEditingMaintenance] = useState<Maintenance | null>(null);
  const [selectedVehicleFilter, setSelectedVehicleFilter] = useState<string>(vehicleId || 'all');
  
  const [form] = Form.useForm();

  // Mock data - substitua por calls reais da API
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Simular loading de dados
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock vehicles
      const mockVehicles: Vehicle[] = [
        { id: '1', brand: 'Honda', model: 'Civic', year: 2020, plate: 'ABC-1234' },
        { id: '2', brand: 'Toyota', model: 'Corolla', year: 2019, plate: 'XYZ-5678' }
      ];
      
      // Mock maintenances
      const mockMaintenances: Maintenance[] = [
        {
          id: '1',
          vehicleId: '1',
          vehicleName: 'Honda Civic 2020',
          type: 'preventive',
          service: 'Troca de óleo',
          description: 'Troca de óleo do motor e filtro de óleo',
          cost: 150.00,
          date: '2024-01-15',
          status: 'completed',
          mileage: 45000,
          nextServiceKm: 50000,
          nextServiceDate: '2024-04-15',
          provider: 'AutoCenter Silva',
          invoiceNumber: 'NF-001234',
          priority: 'medium',
          createdAt: '2024-01-10'
        },
        {
          id: '2',
          vehicleId: '1',
          vehicleName: 'Honda Civic 2020',
          type: 'preventive',
          service: 'Revisão dos 50.000 km',
          description: 'Revisão completa conforme manual do fabricante',
          cost: 450.00,
          date: '2024-02-15',
          status: 'scheduled',
          mileage: 49500,
          provider: 'Concessionária Honda',
          priority: 'high',
          createdAt: '2024-01-20'
        },
        {
          id: '3',
          vehicleId: '2',
          vehicleName: 'Toyota Corolla 2019',
          type: 'corrective',
          service: 'Reparo no freio',
          description: 'Troca de pastilhas e discos de freio dianteiros',
          cost: 280.00,
          date: '2024-01-08',
          status: 'completed',
          mileage: 62000,
          provider: 'Freios & Cia',
          invoiceNumber: 'NF-005678',
          priority: 'high',
          createdAt: '2024-01-05'
        }
      ];

      setVehicles(mockVehicles);
      setMaintenances(mockMaintenances);
      
      // Calculate stats
      const totalCost = mockMaintenances.reduce((sum, m) => sum + m.cost, 0);
      const completedMaintenances = mockMaintenances.filter(m => m.status === 'completed');
      
      setStats({
        total: mockMaintenances.length,
        scheduled: mockMaintenances.filter(m => m.status === 'scheduled').length,
        completed: completedMaintenances.length,
        totalCost,
        avgCost: completedMaintenances.length > 0 ? totalCost / completedMaintenances.length : 0,
        overdueCount: 1 // Mock overdue count
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      message.error('Erro ao carregar dados das manutenções');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMaintenance = () => {
    setEditingMaintenance(null);
    form.resetFields();
    setIsFormVisible(true);
  };

  const handleEditMaintenance = (maintenance: Maintenance) => {
    setEditingMaintenance(maintenance);
    form.setFieldsValue({
      ...maintenance,
      date: maintenance.date,
      nextServiceDate: maintenance.nextServiceDate
    });
    setIsFormVisible(true);
  };

  const handleViewMaintenance = (maintenance: Maintenance) => {
    setSelectedMaintenance(maintenance);
    setIsModalVisible(true);
  };

  const handleFormSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      // Simular save
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (editingMaintenance) {
        // Update maintenance
        setMaintenances(prev => 
          prev.map(m => m.id === editingMaintenance.id ? { ...m, ...values } : m)
        );
        message.success('Manutenção atualizada com sucesso!');
      } else {
        // Create new maintenance
        const newMaintenance: Maintenance = {
          id: Date.now().toString(),
          ...values,
          vehicleName: vehicles.find(v => v.id === values.vehicleId)?.brand + ' ' + 
                       vehicles.find(v => v.id === values.vehicleId)?.model + ' ' +
                       vehicles.find(v => v.id === values.vehicleId)?.year,
          createdAt: new Date().toISOString()
        };
        setMaintenances(prev => [newMaintenance, ...prev]);
        message.success('Manutenção cadastrada com sucesso!');
      }

      setIsFormVisible(false);
      setEditingMaintenance(null);
      form.resetFields();
    } catch (error) {
      console.error('Erro ao salvar manutenção:', error);
      message.error('Erro ao salvar manutenção');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'scheduled': return 'blue';
      case 'in_progress': return 'processing';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Concluída';
      case 'scheduled': return 'Agendada';
      case 'in_progress': return 'Em Andamento';
      case 'cancelled': return 'Cancelada';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'red';
      case 'medium': return 'orange';
      case 'low': return 'green';
      default: return 'default';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return priority;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'preventive': return <CalendarOutlined />;
      case 'corrective': return <ToolOutlined />;
      case 'emergency': return <WarningOutlined />;
      default: return <ToolOutlined />;
    }
  };

  const filteredMaintenances = selectedVehicleFilter === 'all' 
    ? maintenances 
    : maintenances.filter(m => m.vehicleId === selectedVehicleFilter);

  const getDropdownItems = (maintenance: Maintenance): MenuProps['items'] => [
    {
      key: 'view',
      label: 'Visualizar',
      icon: <EyeOutlined />,
      onClick: () => handleViewMaintenance(maintenance)
    },
    {
      key: 'edit',
      label: 'Editar',
      icon: <EditOutlined />,
      onClick: () => handleEditMaintenance(maintenance)
    },
    {
      type: 'divider'
    },
    {
      key: 'delete',
      label: 'Excluir',
      icon: <DeleteOutlined />,
      danger: true,
      onClick: () => handleDeleteMaintenance(maintenance.id)
    }
  ];

  const handleDeleteMaintenance = (maintenanceId: string) => {
    const maintenance = maintenances.find(m => m.id === maintenanceId);
    if (!maintenance) return;

    Modal.confirm({
      title: 'Excluir manutenção',
      icon: <ExclamationCircleOutlined />,
      content: `Tem certeza que deseja excluir a manutenção "${maintenance.service}"?`,
      okText: 'Sim, excluir',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: () => {
        setMaintenances(prev => prev.filter(m => m.id !== maintenanceId));
        message.success('Manutenção excluída com sucesso!');
      }
    });
  };

  const StatsCard: React.FC<{
    title: string;
    value: number | string;
    icon: React.ReactNode;
    color: string;
    suffix?: string;
    prefix?: string;
  }> = ({ title, value, icon, color, suffix, prefix }) => (
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
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
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
          <ToolOutlined style={{ fontSize: '48px', color: 'var(--text-light)' }} />
        </div>
        <Spin size="large" />
        <Text className={styles.loadingText}>
          Carregando manutenções...
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.maintenancePage}>
      {/* Header com gradiente */}
      <div className={styles.heroHeader}>
        <Row justify="space-between" align="middle">
          <Col>
            <div className={styles.heroContent}>
              <Space align="center" size="large">
                <div className={styles.heroIcon}>
                  <ToolOutlined style={{ fontSize: '36px', color: 'var(--text-light)' }} />
                </div>
                <div>
                  <Title level={1} className={styles.heroTitle}>
                    Manutenções
                  </Title>
                  <Text className={styles.heroSubtitle}>
                    Gerencie e acompanhe todas as manutenções dos seus veículos
                  </Text>
                </div>
              </Space>

              {stats && (
                <div className={styles.progressContainer}>
                  <Progress
                    percent={Math.round((stats.completed / stats.total) * 100)}
                    strokeColor={{
                      '0%': 'var(--accent-color)',
                      '100%': 'var(--success-color)'
                    }}
                    trailColor="rgba(255, 255, 255, 0.2)"
                    showInfo={false}
                    size="small"
                  />
                  <Text className={styles.progressText}>
                    {stats.completed} de {stats.total} manutenções concluídas
                  </Text>
                </div>
              )}
            </div>
          </Col>
          <Col>
            <Space>
              <Select
                value={selectedVehicleFilter}
                onChange={setSelectedVehicleFilter}
                style={{ width: 200 }}
                size="large"
              >
                <Select.Option value="all">Todos os veículos</Select.Option>
                {vehicles.map(vehicle => (
                  <Select.Option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model}
                  </Select.Option>
                ))}
              </Select>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={handleCreateMaintenance}
                className={styles.heroButton}
              >
                Nova Manutenção
              </Button>
            </Space>
          </Col>
        </Row>
      </div>

      {/* Cards de estatísticas */}
      <Row gutter={[24, 24]} className={styles.statsGrid}>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Total de Manutenções"
            value={stats?.total || 0}
            icon={<ToolOutlined />}
            color="var(--primary-color)"
            suffix="registros"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Gasto Total"
            value={stats?.totalCost.toFixed(2) || '0.00'}
            icon={<DollarOutlined />}
            color="var(--secondary-color)"
            prefix="R$ "
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Agendadas"
            value={stats?.scheduled || 0}
            icon={<CalendarOutlined />}
            color="var(--accent-color)"
            suffix="pendentes"
          />
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <StatsCard
            title="Média por Serviço"
            value={stats?.avgCost.toFixed(2) || '0.00'}
            icon={<DashboardOutlined />}
            color="var(--success-color)"
            prefix="R$ "
          />
        </Col>
      </Row>

      {/* Alert de manutenções em atraso */}
      {stats && stats.overdueCount > 0 && (
        <Card className={styles.warningCard}>
          <Space>
            <WarningOutlined style={{ color: 'var(--warning-color)', fontSize: '20px' }} />
            <div>
              <Text strong style={{ color: 'var(--warning-color)' }}>
                {stats.overdueCount} manutenção(ões) em atraso
              </Text>
              <br />
              <Text style={{ color: 'var(--gray-6)' }}>
                Algumas manutenções agendadas passaram da data prevista.
              </Text>
            </div>
          </Space>
        </Card>
      )}

      {/* Lista de manutenções */}
      <div className={styles.maintenanceList}>
        <Card className={styles.listCard}>
          <div className={styles.listHeader}>
            <Title level={3}>Histórico de Manutenções</Title>
          </div>
          
          {filteredMaintenances.length === 0 ? (
            <div className={styles.emptyState}>
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Space direction="vertical" size="large">
                    <div>
                      <Text className={styles.emptyTitle}>
                        Nenhuma manutenção encontrada
                      </Text>
                      <br />
                      <Text className={styles.emptyDescription}>
                        Comece cadastrando a primeira manutenção dos seus veículos
                      </Text>
                    </div>
                    <Button
                      type="primary"
                      size="large"
                      icon={<PlusOutlined />}
                      onClick={handleCreateMaintenance}
                      className={styles.emptyButton}
                    >
                      Cadastrar Primeira Manutenção
                    </Button>
                  </Space>
                }
              />
            </div>
          ) : (
            <List
              dataSource={filteredMaintenances}
              renderItem={(maintenance) => (
                <List.Item
                  className={styles.maintenanceItem}
                  actions={[
                    <Dropdown
                      menu={{ items: getDropdownItems(maintenance) }}
                      trigger={['click']}
                      key="actions"
                    >
                      <Button type="text" icon={<MoreOutlined />} />
                    </Dropdown>
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={48}
                        style={{
                          backgroundColor: maintenance.type === 'preventive' ? 'var(--success-color)' :
                                         maintenance.type === 'corrective' ? 'var(--warning-color)' :
                                         'var(--error-color)'
                        }}
                      >
                        {getTypeIcon(maintenance.type)}
                      </Avatar>
                    }
                    title={
                      <Space>
                        <Text strong className={styles.maintenanceTitle}>
                          {maintenance.service}
                        </Text>
                        <Tag color={getStatusColor(maintenance.status)}>
                          {getStatusText(maintenance.status)}
                        </Tag>
                        <Tag color={getPriorityColor(maintenance.priority)}>
                          {getPriorityText(maintenance.priority)}
                        </Tag>
                      </Space>
                    }
                    description={
                      <Space direction="vertical" size="small" className={styles.maintenanceDetails}>
                        <Space>
                          <CarOutlined />
                          <Text>{maintenance.vehicleName}</Text>
                        </Space>
                        <Space>
                          <CalendarOutlined />
                          <Text>Data: {new Date(maintenance.date).toLocaleDateString('pt-BR')}</Text>
                        </Space>
                        <Space>
                          <DollarOutlined />
                          <Text strong style={{ color: 'var(--primary-color)' }}>
                            R$ {maintenance.cost.toFixed(2)}
                          </Text>
                        </Space>
                        <Text className={styles.maintenanceDescription}>
                          {maintenance.description}
                        </Text>
                      </Space>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>

      {/* Modal de cadastro/edição */}
      <Modal
        title={editingMaintenance ? 'Editar Manutenção' : 'Nova Manutenção'}
        open={isFormVisible}
        onCancel={() => {
          setIsFormVisible(false);
          setEditingMaintenance(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        className={styles.formModal}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFormSubmit}
          initialValues={{
            status: 'scheduled',
            priority: 'medium',
            type: 'preventive'
          }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Veículo"
                name="vehicleId"
                rules={[{ required: true, message: 'Selecione um veículo' }]}
              >
                <Select placeholder="Selecione o veículo">
                  {vehicles.map(vehicle => (
                    <Select.Option key={vehicle.id} value={vehicle.id}>
                      {vehicle.brand} {vehicle.model} {vehicle.year}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Tipo"
                name="type"
                rules={[{ required: true, message: 'Selecione o tipo' }]}
              >
                <Select>
                  <Select.Option value="preventive">Preventiva</Select.Option>
                  <Select.Option value="corrective">Corretiva</Select.Option>
                  <Select.Option value="emergency">Emergencial</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Serviço"
            name="service"
            rules={[{ required: true, message: 'Digite o nome do serviço' }]}
          >
            <Input placeholder="Ex: Troca de óleo, Revisão dos 10.000 km" />
          </Form.Item>

          <Form.Item
            label="Descrição"
            name="description"
            rules={[{ required: true, message: 'Digite a descrição' }]}
          >
            <TextArea rows={3} placeholder="Descreva os detalhes da manutenção" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                label="Custo (R$)"
                name="cost"
                rules={[{ required: true, message: 'Digite o custo' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  precision={2}
                  placeholder="0,00"
                />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Data"
                name="date"
                rules={[{ required: true, message: 'Selecione a data' }]}
              >
                <DatePicker style={{ width: '100%' }} format="DD/MM/YYYY" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                label="Quilometragem"
                name="mileage"
                rules={[{ required: true, message: 'Digite a quilometragem' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  placeholder="45000"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Status"
                name="status"
                rules={[{ required: true, message: 'Selecione o status' }]}
              >
                <Select>
                  <Select.Option value="scheduled">Agendada</Select.Option>
                  <Select.Option value="in_progress">Em Andamento</Select.Option>
                  <Select.Option value="completed">Concluída</Select.Option>
                  <Select.Option value="cancelled">Cancelada</Select.Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Prioridade"
                name="priority"
                rules={[{ required: true, message: 'Selecione a prioridade' }]}
              >
                <Select>
                  <Select.Option value="low">Baixa</Select.Option>
                  <Select.Option value="medium">Média</Select.Option>
                  <Select.Option value="high">Alta</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Prestador de Serviço"
            name="provider"
            rules={[{ required: true, message: 'Digite o prestador' }]}
          >
            <Input placeholder="Nome da oficina, concessionária, etc." />
          </Form.Item>

          <Form.Item
            label="Número da Nota Fiscal"
            name="invoiceNumber"
          >
            <Input placeholder="NF-001234 (opcional)" />
          </Form.Item>

          <div className={styles.formActions}>
            <Button
              size="large"
              onClick={() => {
                setIsFormVisible(false);
                setEditingMaintenance(null);
                form.resetFields();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={submitting}
            >
              {editingMaintenance ? 'Salvar Alterações' : 'Cadastrar Manutenção'}
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Modal de visualização */}
      <Modal
        title="Detalhes da Manutenção"
        open={isModalVisible}
        onCancel={() => {
          setIsModalVisible(false);
          setSelectedMaintenance(null);
        }}
        footer={[
          <Button
            key="edit"
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              if (selectedMaintenance) {
                setIsModalVisible(false);
                handleEditMaintenance(selectedMaintenance);
              }
            }}
          >
            Editar
          </Button>
        ]}
        width={600}
      >
        {selectedMaintenance && (
          <div className={styles.maintenanceDetails}>
            <Row gutter={[24, 16]}>
              <Col span={24}>
                <Space>
                  <Tag color={getStatusColor(selectedMaintenance.status)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                    {getStatusText(selectedMaintenance.status)}
                  </Tag>
                  <Tag color={getPriorityColor(selectedMaintenance.priority)} style={{ fontSize: '14px', padding: '4px 12px' }}>
                    Prioridade {getPriorityText(selectedMaintenance.priority)}
                  </Tag>
                </Space>
              </Col>
              
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Veículo</Text>
                  <Text strong>{selectedMaintenance.vehicleName}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Tipo de Manutenção</Text>
                  <Text strong>
                    {selectedMaintenance.type === 'preventive' ? 'Preventiva' :
                     selectedMaintenance.type === 'corrective' ? 'Corretiva' : 'Emergencial'}
                  </Text>
                </Space>
              </Col>
              
              <Col span={24}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Descrição</Text>
                  <Text>{selectedMaintenance.description}</Text>
                </Space>
              </Col>
              
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Data</Text>
                  <Text strong>{new Date(selectedMaintenance.date).toLocaleDateString('pt-BR')}</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Custo</Text>
                  <Text strong style={{ color: 'var(--primary-color)', fontSize: '16px' }}>
                    R$ {selectedMaintenance.cost.toFixed(2)}
                  </Text>
                </Space>
              </Col>
              
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Quilometragem</Text>
                  <Text strong>{selectedMaintenance.mileage.toLocaleString()} km</Text>
                </Space>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="small">
                  <Text type="secondary">Prestador</Text>
                  <Text strong>{selectedMaintenance.provider}</Text>
                </Space>
              </Col>
              
              {selectedMaintenance.invoiceNumber && (
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Nota Fiscal</Text>
                    <Text strong>{selectedMaintenance.invoiceNumber}</Text>
                  </Space>
                </Col>
              )}
              
              {selectedMaintenance.nextServiceDate && (
                <Col span={12}>
                  <Space direction="vertical" size="small">
                    <Text type="secondary">Próxima Manutenção</Text>
                    <Text strong>{new Date(selectedMaintenance.nextServiceDate).toLocaleDateString('pt-BR')}</Text>
                  </Space>
                </Col>
              )}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MaintenancePage;