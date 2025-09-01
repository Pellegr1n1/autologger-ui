import React, { useState, useEffect, useCallback } from 'react';
import { Button, Typography, Spin, message, Card, Statistic, Space, Tooltip, Table, Tag, Row, Col, Select, DatePicker, Input, Empty } from 'antd';
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
import { useNavigate } from 'react-router-dom';
import { VehicleService } from '../../services/api/vehicleService';
import { VehicleServiceService } from '../../services/api/vehicleServiceService';
import { Vehicle, VehicleEvent, VehicleEventType, VehicleStatus } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate, kmFormat } from '../../utils/format';
import DefaultFrame from '../../features/common/layout/Defaultframe';
import componentStyles from '../../features/common/layout/styles/Components.module.css';
import styles from './MaintenancePage.module.css';
import ServiceModal from '../../features/vehicles/components/ServiceModal';


const { Text, Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

export default function MaintenancePage() {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenanceEvents, setMaintenanceEvents] = useState<VehicleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  
  const [serviceModalLoading, setServiceModalLoading] = useState(false);

  useEffect(() => {
    loadData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar veículos ativos do usuário
      try {
        const vehiclesData = await VehicleService.getUserVehicles();
        const activeVehicles = vehiclesData.active || [];
        setVehicles(activeVehicles);
      } catch (vehicleError) {
        console.error('Erro ao carregar veículos:', vehicleError);
        message.warning('Erro ao carregar veículos, usando dados de exemplo...');
        
        // Dados mockados para demonstração
        const mockVehicles: Vehicle[] = [
          {
            id: "veh-1",
            plate: "ABC-1234",
            brand: "Honda",
            model: "Civic",
            year: 2020,
            color: "Preto",
            renavam: "12345678901",
            mileage: 45000,
            status: VehicleStatus.ACTIVE,
            createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          },
          {
            id: "veh-2",
            plate: "XYZ-5678",
            brand: "Toyota",
            model: "Corolla",
            year: 2019,
            color: "Branco",
            renavam: "98765432109",
            mileage: 65000,
            status: VehicleStatus.ACTIVE,
            createdAt: new Date(Date.now() - 730 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
          }
        ];
        
        setVehicles(mockVehicles);
      }

      // Carregar todas as manutenções
      try {
        const maintenanceData = await VehicleServiceService.getAllServices();
        const maintenanceOnly = maintenanceData.filter(event => event.type === VehicleEventType.MAINTENANCE);
        setMaintenanceEvents(maintenanceOnly);
      } catch (maintenanceError) {
        console.error('Erro ao carregar manutenções:', maintenanceError);
        message.warning('Erro ao carregar manutenções, usando dados de exemplo...');
        
        // Dados mockados para demonstração
        const mockMaintenance: VehicleEvent[] = [
          {
            id: "maint-1",
            vehicleId: "veh-1",
            type: VehicleEventType.MAINTENANCE,
            category: "Troca de óleo",
            description: "Troca de óleo 5W30 sintético e filtro de óleo",
            date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            mileage: 45000,
            cost: 320.0,
            location: "Oficina ABC",
            attachments: ["NF_Troca_Oleo.pdf"],
            technician: "João Silva",
            warranty: false,
            nextServiceDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            notes: "Óleo trocado conforme especificação do fabricante",
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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
            requiresConfirmation: true,
            confirmedBy: "user",
            confirmedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            confirmationHash: "0xconf...123"
          },
          {
            id: "maint-2",
            vehicleId: "veh-2",
            type: VehicleEventType.MAINTENANCE,
            category: "Troca de pneus",
            description: "Troca dos 4 pneus por novos Michelin Primacy 4",
            date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            mileage: 65000,
            cost: 1200.0,
            location: "Pneus Express",
            attachments: ["NF_Pneus.pdf"],
            technician: "Carlos Santos",
            warranty: true,
            nextServiceDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
            notes: "Pneus com garantia de 50.000 km",
            createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            updatedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            blockchainStatus: {
              status: 'CONFIRMED',
              message: 'Confirmado na blockchain',
              lastUpdate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
              retryCount: 0,
              maxRetries: 3
            },
            hash: "0xdef...456",
            previousHash: undefined,
            merkleRoot: "0xmerkle...456",
            isImmutable: true,
            canEdit: false,
            requiresConfirmation: true,
            confirmedBy: "user",
            confirmedAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000),
            confirmationHash: "0xconf...456"
          }
        ];
        
        setMaintenanceEvents(mockMaintenance);
      }

    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      message.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtrar manutenções baseado nos filtros selecionados
  const filteredMaintenance = maintenanceEvents.filter(event => {
    // Verificar se o evento tem todas as propriedades necessárias
    if (!event || !event.vehicleId || !event.description || !event.category) {
      return false;
    }

    // Filtro por veículo
    if (selectedVehicle !== 'all' && event.vehicleId !== selectedVehicle) {
      return false;
    }

    // Filtro por termo de busca
    if (searchTerm && !event.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !event.category.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }

    // Filtro por data (se implementado)
    // TODO: Implementar filtro por data

    return true;
  });

  // Obter nome do veículo pelo ID
  const getVehicleName = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Veículo não encontrado';
  };

  // Obter placa do veículo pelo ID
  const getVehiclePlate = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? vehicle.plate : 'N/A';
  };

  // Calcular estatísticas
  const totalCost = filteredMaintenance.reduce((sum, event) => sum + event.cost, 0);
  const totalMaintenance = filteredMaintenance.length;
  const averageCost = totalMaintenance > 0 ? totalCost / totalMaintenance : 0;

  // Colunas da tabela
  const columns = [
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
      render: (record: VehicleEvent) => {
        // Verificar se blockchainStatus existe e tem a propriedade status
        if (!record.blockchainStatus) {
          console.warn('Evento sem blockchainStatus:', record);
          return (
            <Tag color="orange" icon={<ClockCircleOutlined />}>
              Status Desconhecido
            </Tag>
          );
        }
        
        const status = record.blockchainStatus.status || 'PENDING';
        const isConfirmed = status === 'CONFIRMED';
        
        return (
          <Tag 
            color={isConfirmed ? 'green' : 'orange'}
            icon={isConfirmed ? <EyeOutlined /> : <ClockCircleOutlined />}
          >
            {isConfirmed ? 'Confirmado' : 'Pendente'}
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
  ];

  const handleViewDetails = () => {
    // TODO: Implementar visualização detalhada
    message.info('Funcionalidade de visualização será implementada em breve');
  };

  const handleEdit = () => {
    // TODO: Implementar edição
    message.info('Funcionalidade de edição será implementada em breve');
  };

  const handleAddMaintenance = () => {
    setServiceModalOpen(true);
  };

  const handleServiceModalClose = () => {
    setServiceModalOpen(false);
  };

  const handleServiceAdd = (newService: VehicleEvent) => {
    // Adicionar o novo serviço à lista
    setMaintenanceEvents(prev => [newService, ...prev]);
    message.success('Manutenção adicionada com sucesso!');
    setServiceModalOpen(false);
  };

  const handleBackToVehicles = () => {
    navigate('/vehicles');
  };

  return (
    <DefaultFrame title="Manutenções" loading={loading}>
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
                value={totalMaintenance}
                prefix={<ToolOutlined style={{ color: 'var(--primary-color)' }} />}
                valueStyle={{ color: 'var(--text-primary)' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Custo Total"
                value={totalCost}
                precision={2}
                prefix={<DollarOutlined style={{ color: 'var(--accent-color)' }} />}
                valueStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => currencyBRL(value as number)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Custo Médio"
                value={averageCost}
                precision={2}
                prefix={<BarChartOutlined style={{ color: 'var(--success-color)' }} />}
                valueStyle={{ color: 'var(--text-primary)' }}
                formatter={(value) => currencyBRL(value as number)}
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
                      value={selectedVehicle}
                      onChange={setSelectedVehicle}
                      placeholder="Selecione um veículo"
                      className={componentStyles.professionalInput}
                    >
                      <Option value="all">Todos os veículos</Option>
                      {vehicles.map(vehicle => (
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
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
                        // TODO: Implementar filtro por data
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
                    {searchTerm || selectedVehicle !== 'all' 
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

      {/* Modal de Nova Manutenção */}
      <ServiceModal
        open={serviceModalOpen}
        onClose={handleServiceModalClose}
        onAdd={handleServiceAdd}
        vehicles={vehicles}
        loading={serviceModalLoading}
      />
    </DefaultFrame>
  );
}
