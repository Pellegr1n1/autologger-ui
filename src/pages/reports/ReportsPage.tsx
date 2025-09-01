import { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  Table, 
  Progress, 
  DatePicker, 
  Select, 
  Empty,
  Spin,
  message,
  Tooltip
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  EyeOutlined,
  DollarOutlined,
  CarOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import DefaultFrame from '../../features/common/layout/Defaultframe';
import componentStyles from '../../features/common/layout/styles/Components.module.css';
import styles from './ReportsPage.module.css';
import { VehicleService } from '../../services/api/vehicleService';
import { VehicleServiceService } from '../../services/api/vehicleServiceService';
import { Vehicle, VehicleEvent } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate } from '../../utils/format';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  totalVehicles: number;
  totalExpenses: number;
  totalServices: number;
  blockchainVerified: number;
  monthlyExpenses: number;
  upcomingServices: number;
  averageServiceCost: number;
  reliabilityScore: number;
}



export default function ReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalVehicles: 0,
    totalExpenses: 0,
    totalServices: 0,
    blockchainVerified: 0,
    monthlyExpenses: 0,
    upcomingServices: 0,
    averageServiceCost: 0,
    reliabilityScore: 0
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<VehicleEvent[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<string>('30');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    loadReportData();
  }, [selectedPeriod, selectedVehicle, dateRange]);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Carregar veículos
      const vehiclesData = await VehicleService.getUserVehicles();
      const activeVehicles = vehiclesData.active || [];
      setVehicles(activeVehicles);

      // Carregar serviços
      const servicesData = await VehicleServiceService.getAllServices();
      setServices(servicesData);

      // Calcular estatísticas
      const filteredServices = filterServices(servicesData, selectedVehicle, dateRange);
      const totalExpenses = filteredServices.reduce((sum, service) => sum + service.cost, 0);
      const verifiedServices = filteredServices.filter(service => 
        service.blockchainStatus?.status === 'CONFIRMED'
      );
      const averageCost = filteredServices.length > 0 ? totalExpenses / filteredServices.length : 0;
      const reliabilityScore = servicesData.length > 0 
        ? Math.round((verifiedServices.length / servicesData.length) * 100) 
        : 0;

      // Calcular gastos do mês atual
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const monthlyServices = filteredServices.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate.getMonth() === currentMonth && serviceDate.getFullYear() === currentYear;
      });
      const monthlyExpenses = monthlyServices.reduce((sum, service) => sum + service.cost, 0);

      // Calcular serviços próximos (próximos 30 dias)
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      const upcomingServices = filteredServices.filter(service => {
        const serviceDate = new Date(service.date);
        return serviceDate > new Date() && serviceDate <= thirtyDaysFromNow;
      });

      setReportData({
        totalVehicles: activeVehicles.length,
        totalExpenses,
        totalServices: filteredServices.length,
        blockchainVerified: verifiedServices.length,
        monthlyExpenses,
        upcomingServices: upcomingServices.length,
        averageServiceCost: averageCost,
        reliabilityScore
      });

    } catch (error) {
      console.error('Erro ao carregar dados do relatório:', error);
      message.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod, selectedVehicle, dateRange]);

  const filterServices = (services: VehicleEvent[], vehicleId: string, dateRange: [string, string] | null) => {
    let filtered = services;

    if (vehicleId !== 'all') {
      filtered = filtered.filter(service => service.vehicleId === vehicleId);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(service => {
        const serviceDate = new Date(service.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return serviceDate >= start && serviceDate <= end;
      });
    }

    return filtered;
  };



  const exportReport = () => {
    message.success('Relatório exportado com sucesso!');
  };

  const tableColumns = [
    {
      title: 'Veículo',
      dataIndex: 'vehicleName',
      key: 'vehicleName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <Tag color={type === 'MAINTENANCE' ? 'blue' : 'green'}>
          {type === 'MAINTENANCE' ? 'Manutenção' : 'Abastecimento'}
        </Tag>
      )
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => formatBRDate(date)
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => currencyBRL(cost)
    },
    {
      title: 'Status Blockchain',
      dataIndex: 'blockchainStatus',
      key: 'blockchainStatus',
      render: (status: any) => (
        <Tag 
          color={status?.status === 'CONFIRMED' ? 'success' : 'warning'}
          icon={status?.status === 'CONFIRMED' ? <CheckCircleOutlined /> : <ClockCircleOutlined />}
        >
          {status?.status === 'CONFIRMED' ? 'Verificado' : 'Pendente'}
        </Tag>
      )
    },
    {
      title: 'Ações',
      key: 'actions',
      render: (record: VehicleEvent) => (
        <Space>
          <Tooltip title="Ver detalhes">
            <Button 
              type="text" 
              icon={<EyeOutlined />} 
              onClick={() => navigate(`/vehicles/${record.vehicleId}`)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];



  return (
    <DefaultFrame title="Relatórios e Análises" loading={loading}>
      <div className={styles.reportsContainer}>
        {/* Filtros */}
        <Card className={componentStyles.professionalCard} style={{ marginBottom: '24px' }}>
          <Space size="large" wrap>
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Período</Text>
              <Select 
                value={selectedPeriod} 
                onChange={setSelectedPeriod}
                style={{ width: 120 }}
              >
                <Option value="7">7 dias</Option>
                <Option value="30">30 dias</Option>
                <Option value="90">90 dias</Option>
                <Option value="365">1 ano</Option>
              </Select>
            </div>
            
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Veículo</Text>
              <Select 
                value={selectedVehicle} 
                onChange={setSelectedVehicle}
                style={{ width: 200 }}
              >
                <Option value="all">Todos os veículos</Option>
                {vehicles.map(vehicle => (
                  <Option key={vehicle.id} value={vehicle.id}>
                    {vehicle.brand} {vehicle.model} - {vehicle.plate}
                  </Option>
                ))}
              </Select>
            </div>
            
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px' }}>Data específica</Text>
              <RangePicker 
                onChange={(dates) => {
                  if (dates) {
                    setDateRange([dates[0]!.toISOString(), dates[1]!.toISOString()]);
                  } else {
                    setDateRange(null);
                  }
                }}
              />
            </div>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadReportData}
              loading={loading}
            >
              Atualizar
            </Button>
          </Space>
        </Card>

        {/* Estatísticas Principais */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Veículos Ativos"
                value={reportData.totalVehicles}
                prefix={<CarOutlined style={{ color: '#8B5CF6' }} />}
                valueStyle={{ color: '#8B5CF6', fontWeight: 700 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Gastos Totais"
                value={reportData.totalExpenses}
                prefix={<DollarOutlined style={{ color: '#52C41A' }} />}
                valueStyle={{ color: '#52C41A', fontWeight: 700 }}
                formatter={(value) => currencyBRL(value as number)}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Serviços Realizados"
                value={reportData.totalServices}
                prefix={<ToolOutlined style={{ color: '#1890FF' }} />}
                valueStyle={{ color: '#1890FF', fontWeight: 700 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Score de Confiabilidade"
                value={reportData.reliabilityScore}
                prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                suffix="%"
                valueStyle={{ color: '#52C41A', fontWeight: 700 }}
              />
            </Card>
          </Col>
        </Row>

        {/* Estatísticas Secundárias */}
        <Row gutter={[24, 24]} style={{ marginBottom: '32px' }}>
          <Col xs={24} sm={12} lg={8}>
            <Card className={componentStyles.professionalCard}>
              <Statistic
                title="Gastos Este Mês"
                value={reportData.monthlyExpenses}
                prefix={<DollarOutlined style={{ color: '#FAAD14' }} />}
                valueStyle={{ color: '#FAAD14', fontWeight: 700 }}
                formatter={(value) => currencyBRL(value as number)}
              />
              <Progress 
                percent={Math.min((reportData.monthlyExpenses / 5000) * 100, 100)} 
                strokeColor="#FAAD14"
                showInfo={false}
                style={{ marginTop: '16px' }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className={componentStyles.professionalCard}>
              <Statistic
                title="Serviços Verificados"
                value={reportData.blockchainVerified}
                prefix={<CheckCircleOutlined style={{ color: '#52C41A' }} />}
                valueStyle={{ color: '#52C41A', fontWeight: 700 }}
              />
              <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                de {reportData.totalServices} total
              </Text>
            </Card>
          </Col>
          
          <Col xs={24} sm={12} lg={8}>
            <Card className={componentStyles.professionalCard}>
              <Statistic
                title="Próximos Serviços"
                value={reportData.upcomingServices}
                prefix={<ClockCircleOutlined style={{ color: '#1890FF' }} />}
                valueStyle={{ color: '#1890FF', fontWeight: 700 }}
              />
              <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                próximos 30 dias
              </Text>
            </Card>
          </Col>
        </Row>

        {/* Gráficos e Tabelas */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined style={{ color: '#8B5CF6' }} />
                  <span>Gastos por Mês</span>
                </Space>
              }
              className={componentStyles.professionalCard}
              extra={
                <Button 
                  type="text" 
                  icon={<DownloadOutlined />}
                  onClick={exportReport}
                >
                  Exportar
                </Button>
              }
            >
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <BarChartOutlined style={{ fontSize: '48px', color: '#6B7280', marginBottom: '16px' }} />
                  <Text style={{ color: '#6B7280' }}>Gráfico de gastos mensais</Text>
                  <br />
                  <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                    Implementar integração com biblioteca de gráficos
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
          
          <Col xs={24} lg={12}>
            <Card 
              title={
                <Space>
                  <PieChartOutlined style={{ color: '#8B5CF6' }} />
                  <span>Distribuição por Tipo</span>
                </Space>
              }
              className={componentStyles.professionalCard}
            >
              <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ textAlign: 'center' }}>
                  <PieChartOutlined style={{ fontSize: '48px', color: '#6B7280', marginBottom: '16px' }} />
                  <Text style={{ color: '#6B7280' }}>Gráfico de distribuição</Text>
                  <br />
                  <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                    Implementar integração com biblioteca de gráficos
                  </Text>
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabela de Serviços */}
        <Card 
          title={
            <Space>
              <FileTextOutlined style={{ color: '#8B5CF6' }} />
              <span>Histórico de Serviços</span>
            </Space>
          }
          className={componentStyles.professionalCard}
          style={{ marginTop: '24px' }}
        >
          <Spin spinning={loading}>
            {services.length > 0 ? (
              <Table
                columns={tableColumns}
                dataSource={services.map(service => ({
                  ...service,
                  vehicleName: vehicles.find(v => v.id === service.vehicleId)?.brand + ' ' + 
                               vehicles.find(v => v.id === service.vehicleId)?.model,
                  key: service.id
                }))}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) => 
                    `${range[0]}-${range[1]} de ${total} registros`
                }}
                className={componentStyles.professionalTable}
              />
            ) : (
              <Empty 
                description="Nenhum serviço encontrado"
                image={Empty.PRESENTED_IMAGE_SIMPLE}
              />
            )}
          </Spin>
        </Card>
      </div>
    </DefaultFrame>
  );
}
