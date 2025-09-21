import { useState, useEffect, useCallback, useMemo } from 'react';
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
  DatePicker, 
  Select, 
  Empty,
  Spin,
  message
} from 'antd';
import {
  BarChartOutlined,
  PieChartOutlined,
  DownloadOutlined,
  DollarOutlined,
  CarOutlined,
  ToolOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  ComposedChart
} from 'recharts';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './ReportsPage.module.css';
import { VehicleService } from '../../features/vehicles/services/vehicleService';
import { VehicleServiceService } from '../../features/vehicles/services/vehicleServiceService';
import { BlockchainService } from '../../features/blockchain/services/blockchainService';
import { Vehicle, VehicleEvent, VehicleEventType } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate } from '../../shared/utils/format';
import CustomTooltip from '../../components/charts/CustomTooltip';

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

      // Carregar serviços - usar mesma fonte da tela de manutenções
      let servicesData: VehicleEvent[] = [];
      try {
        // Tentar primeiro o BlockchainService (mesma fonte da tela de manutenções)
        const blockchainServices = await BlockchainService.getAllServices();
        console.log('Blockchain services loaded:', blockchainServices);
        
        // Converter para formato VehicleEvent - mostrar todos os tipos de serviços
        servicesData = blockchainServices.map((service: any) => {
          // Mapear tipo do backend para frontend
          const mapServiceType = (backendType: string): VehicleEventType => {
            switch (backendType) {
              case 'maintenance': return VehicleEventType.MAINTENANCE;
              case 'fuel': return VehicleEventType.FUEL;
              case 'repair': return VehicleEventType.REPAIR;
              case 'inspection': return VehicleEventType.INSPECTION;
              case 'expense': return VehicleEventType.EXPENSE;
              case 'other': return VehicleEventType.OTHER;
              default: return VehicleEventType.MAINTENANCE;
            }
          };

          return {
            id: service.id || service.serviceId,
            vehicleId: service.vehicleId,
            type: mapServiceType(service.type), // Mapear tipo corretamente
            category: service.category || 'Serviço',
            description: service.description,
            date: new Date(service.serviceDate || service.createdAt),
            mileage: service.mileage || 0,
            cost: service.cost || 0,
            location: service.location || '',
            attachments: service.attachments || [],
            technician: service.technician,
            warranty: service.warranty || false,
            nextServiceDate: service.nextServiceDate ? new Date(service.nextServiceDate) : undefined,
            notes: service.notes,
            createdAt: new Date(service.createdAt),
            updatedAt: new Date(service.updatedAt),
            blockchainStatus: {
              status: service.status || 'PENDING',
              message: service.status === 'CONFIRMED' ? 'Transação confirmada na blockchain' : 'Aguardando confirmação',
              lastUpdate: new Date(service.updatedAt || service.createdAt),
              retryCount: 0,
              maxRetries: 3
            },
            hash: service.blockchainHash,
            previousHash: service.previousHash,
            merkleRoot: service.merkleRoot,
            isImmutable: service.status === 'CONFIRMED',
            canEdit: service.status !== 'CONFIRMED',
            requiresConfirmation: false,
            confirmedBy: service.confirmedBy,
            confirmedAt: service.confirmedAt ? new Date(service.confirmedAt) : undefined
          };
        });
      } catch (error) {
        console.log('Blockchain service error, trying fallback:', error);
        try {
          // Fallback para VehicleServiceService se blockchain falhar
          servicesData = await VehicleServiceService.getAllServices();
          console.log('Fallback services loaded:', servicesData);
        } catch (fallbackError) {
          console.log('All services failed, using empty array:', fallbackError);
          servicesData = [];
        }
      }       
      
      setServices(servicesData);

      // Calcular estatísticas
      const filteredServices = filterServices(servicesData, selectedVehicle, dateRange, activeVehicles);
      
      const totalExpenses = filteredServices.reduce((sum, service) => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        return sum + cost;
      }, 0);
      
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
        const serviceMonth = serviceDate.getMonth();
        const serviceYear = serviceDate.getFullYear();
        return serviceMonth === currentMonth && serviceYear === currentYear;
      });
      
      const monthlyExpenses = monthlyServices.reduce((sum, service) => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        return sum + cost;
      }, 0);

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

  const filterServices = (services: VehicleEvent[], vehicleId: string, dateRange: [string, string] | null, vehiclesList?: Vehicle[]) => {
    let filtered = services;

    // Sempre filtrar apenas pelos veículos do usuário logado
    const vehiclesToUse = vehiclesList || vehicles;
    const userVehicleIds = vehiclesToUse.map(v => v.id);
    filtered = filtered.filter(service => userVehicleIds.includes(service.vehicleId));

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

  // Dados para gráfico de gastos mensais
  const monthlyExpensesData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, vehicles);
    const monthlyData: { [key: string]: { 
      month: string; 
      maintenance: number; 
      fuel: number; 
      repair: number; 
      inspection: number; 
      expense: number; 
      other: number; 
      total: number 
    } } = {};
    
    // Inicializar últimos 12 meses
    const months = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' });
      months.push({ 
        month: monthName, 
        maintenance: 0, 
        fuel: 0, 
        repair: 0, 
        inspection: 0, 
        expense: 0, 
        other: 0, 
        total: 0 
      });
      monthlyData[monthKey] = { 
        month: monthName, 
        maintenance: 0, 
        fuel: 0, 
        repair: 0, 
        inspection: 0, 
        expense: 0, 
        other: 0, 
        total: 0 
      };
    }

    // Processar serviços - categorizar todos os tipos
    filteredServices.forEach(service => {
      const serviceDate = new Date(service.date);
      const monthKey = `${serviceDate.getFullYear()}-${String(serviceDate.getMonth() + 1).padStart(2, '0')}`;
      
      if (monthlyData[monthKey]) {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        
        // Categorizar todos os tipos de serviços
        switch (service.type) {
          case VehicleEventType.MAINTENANCE:
            monthlyData[monthKey].maintenance += cost;
            break;
          case VehicleEventType.FUEL:
            monthlyData[monthKey].fuel += cost;
            break;
          case VehicleEventType.REPAIR:
            monthlyData[monthKey].repair += cost;
            break;
          case VehicleEventType.INSPECTION:
            monthlyData[monthKey].inspection += cost;
            break;
          case VehicleEventType.EXPENSE:
            monthlyData[monthKey].expense += cost;
            break;
          case VehicleEventType.OTHER:
            monthlyData[monthKey].other += cost;
            break;
          default:
            monthlyData[monthKey].other += cost;
        }
        monthlyData[monthKey].total += cost;
      }
    });

    return Object.values(monthlyData);
  }, [services, selectedVehicle, dateRange, vehicles]);

  // Dados para gráfico de distribuição por tipo
  const serviceDistributionData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, vehicles);
    const distribution = {
      maintenance: 0,
      fuel: 0,
      repair: 0,
      inspection: 0,
      expense: 0,
      other: 0
    };

    filteredServices.forEach(service => {
      const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
      
      switch (service.type) {
        case VehicleEventType.MAINTENANCE:
          distribution.maintenance += cost;
          break;
        case VehicleEventType.FUEL:
          distribution.fuel += cost;
          break;
        case VehicleEventType.REPAIR:
          distribution.repair += cost;
          break;
        case VehicleEventType.INSPECTION:
          distribution.inspection += cost;
          break;
        case VehicleEventType.EXPENSE:
          distribution.expense += cost;
          break;
        case VehicleEventType.OTHER:
          distribution.other += cost;
          break;
        default:
          distribution.other += cost;
      }
    });

    const data = [
      { name: 'Manutenção', value: distribution.maintenance, color: '#667eea' },
      { name: 'Abastecimento', value: distribution.fuel, color: '#4facfe' },
      { name: 'Reparo', value: distribution.repair, color: '#f093fb' },
      { name: 'Inspeção', value: distribution.inspection, color: '#4facfe' },
      { name: 'Despesa', value: distribution.expense, color: '#ff9a9e' },
      { name: 'Outros', value: distribution.other, color: '#a8edea' }
    ].filter(item => item.value > 0);

    return data;
  }, [services, selectedVehicle, dateRange, vehicles]);

  // Dados para gráfico de tendência de gastos
  const expenseTrendData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, vehicles);
    const weeklyData: { [key: string]: { 
      week: string; 
      total: number; 
      maintenance: number; 
      fuel: number; 
      repair: number; 
      inspection: number; 
      expense: number; 
      other: number; 
    } } = {};
    
    // Inicializar últimas 8 semanas
    const weeks = [];
    for (let i = 7; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekKey = `Sem ${8 - i}`;
      weeks.push({ 
        week: weekKey, 
        total: 0, 
        maintenance: 0, 
        fuel: 0, 
        repair: 0, 
        inspection: 0, 
        expense: 0, 
        other: 0 
      });
      weeklyData[weekKey] = { 
        week: weekKey, 
        total: 0, 
        maintenance: 0, 
        fuel: 0, 
        repair: 0, 
        inspection: 0, 
        expense: 0, 
        other: 0 
      };
    }

    // Processar serviços por semana
    filteredServices.forEach(service => {
      const serviceDate = new Date(service.date);
      const now = new Date();
      const daysDiff = Math.floor((now.getTime() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
      const weekNumber = Math.floor(daysDiff / 7);
      
      if (weekNumber >= 0 && weekNumber <= 7) {
        const weekKey = `Sem ${8 - weekNumber}`;
        if (weeklyData[weekKey]) {
          const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
          weeklyData[weekKey].total += cost;
          
          // Categorizar todos os tipos de serviços
          switch (service.type) {
            case VehicleEventType.MAINTENANCE:
              weeklyData[weekKey].maintenance += cost;
              break;
            case VehicleEventType.FUEL:
              weeklyData[weekKey].fuel += cost;
              break;
            case VehicleEventType.REPAIR:
              weeklyData[weekKey].repair += cost;
              break;
            case VehicleEventType.INSPECTION:
              weeklyData[weekKey].inspection += cost;
              break;
            case VehicleEventType.EXPENSE:
              weeklyData[weekKey].expense += cost;
              break;
            case VehicleEventType.OTHER:
              weeklyData[weekKey].other += cost;
              break;
            default:
              weeklyData[weekKey].other += cost;
          }
        }
      }
    });

    return Object.values(weeklyData);
  }, [services, selectedVehicle, dateRange, vehicles]);



  const exportReport = () => {
    message.success('Relatório exportado com sucesso!');
  };

  const exportTableData = () => {
    try {
      // Filtrar dados da tabela com base nos filtros atuais
      const filteredTableData = filterServices(services, selectedVehicle, dateRange, vehicles);
      
      // Preparar dados para exportação
      const exportData = filteredTableData.map(service => {
        const vehicle = vehicles.find(v => v.id === service.vehicleId);
        return {
          'Veículo': vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
          'Categoria': service.category,
          'Descrição': service.description,
          'Data': formatBRDate(service.date),
          'Quilometragem': service.mileage,
          'Custo': currencyBRL(service.cost),
          'Local': service.location,
          'Status Blockchain': service.blockchainStatus?.status || 'N/A',
          'Técnico': service.technician || 'N/A',
          'Garantia': service.warranty ? 'Sim' : 'Não',
          'Observações': service.notes || 'N/A'
        };
      });

      // Converter para CSV
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => `"${(row as any)[header] || ''}"`).join(',')
        )
      ].join('\n');

      // Criar e baixar arquivo
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `historico_servicos_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      message.success('Tabela exportada com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar tabela:', error);
      message.error('Erro ao exportar tabela');
    }
  };

  const tableColumns = [
    {
      title: 'Veículo',
      dataIndex: 'vehicleName',
      key: 'vehicleName',
      render: (text: string) => <Text strong>{text}</Text>
    },
    {
      title: 'Categoria',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color="blue" style={{ fontWeight: 500 }}>
          {category}
        </Tag>
      )
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => (
        <Text ellipsis={{ tooltip: description }} style={{ maxWidth: 200 }}>
          {description}
        </Text>
      )
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      render: (date: Date) => formatBRDate(date),
      sorter: (a: VehicleEvent, b: VehicleEvent) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      render: (cost: number) => (
        <Text strong style={{ color: '#ff4d4f' }}>
          {currencyBRL(cost)}
        </Text>
      ),
      sorter: (a: VehicleEvent, b: VehicleEvent) => a.cost - b.cost
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
    }
  ];



  return (
    <DefaultFrame title="Relatórios e Análises" loading={loading}>
      <div className={styles.reportsContainer}>
        {/* Filtros */}
        <Card className={componentStyles.professionalCard} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
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
            </Space>
            
            <Button 
              icon={<ReloadOutlined />} 
              onClick={loadReportData}
              loading={loading}
              type="primary"
              style={{ 
                backgroundColor: '#8B5CF6', 
                borderColor: '#8B5CF6',
                height: '40px',
                minWidth: '120px'
              }}
            >
              Atualizar
            </Button>
          </div>
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
                title="Gastos Este Mês"
                value={reportData.monthlyExpenses}
                prefix={<DollarOutlined style={{ color: '#FAAD14' }} />}
                valueStyle={{ color: '#FAAD14', fontWeight: 700 }}
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
              <div className={styles.chartContainer} style={{ height: '700px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyExpensesData} margin={{ top: 30, right: 40, left: 30, bottom: 20 }}>
                    <defs>
                      <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4facfe" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#00f2fe" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#4facfe" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(139, 92, 246, 0.08)" strokeWidth={1} />
                    <XAxis 
                      dataKey="month" 
                      tick={{ 
                        fontSize: 12, 
                        fill: 'var(--text-secondary)', 
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif'
                      }}
                      axisLine={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }}
                      tickLine={{ stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 1 }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 12, 
                        fill: 'var(--text-secondary)', 
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif'
                      }}
                      axisLine={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }}
                      tickLine={{ stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 1 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload) return null;
                        
                        const totalValue = payload.reduce((sum, item) => sum + (item.value as number), 0);
                        const averageValue = monthlyExpensesData.reduce((sum, item) => sum + item.total, 0) / monthlyExpensesData.length;
                        const serviceCount = payload.length;
                        
                        return (
                          <CustomTooltip
                            active={active}
                            payload={payload}
                            label={String(label)}
                            showPercentage={true}
                            additionalInfo={{
                              total: totalValue,
                              average: averageValue,
                              count: serviceCount,
                              period: 'Gastos Mensais'
                            }}
                          />
                        );
                      }}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                    <Bar 
                      dataKey="maintenance" 
                      stackId="a" 
                      fill="url(#maintenanceGradient)" 
                      name="Manutenção" 
                      radius={[0, 0, 0, 0]}
                      className={styles.chartBar}
                    />
                    <Bar 
                      dataKey="fuel" 
                      stackId="a" 
                      fill="url(#fuelGradient)" 
                      name="Abastecimento" 
                      radius={[0, 0, 0, 0]}
                      className={styles.chartBar}
                    />
                    <Bar 
                      dataKey="repair" 
                      stackId="a" 
                      fill="#f093fb" 
                      name="Reparo" 
                      radius={[0, 0, 0, 0]}
                      className={styles.chartBar}
                    />
                    <Bar 
                      dataKey="inspection" 
                      stackId="a" 
                      fill="#4facfe" 
                      name="Inspeção" 
                      radius={[0, 0, 0, 0]}
                      className={styles.chartBar}
                    />
                    <Bar 
                      dataKey="expense" 
                      stackId="a" 
                      fill="#ff9a9e" 
                      name="Despesa" 
                      radius={[0, 0, 0, 0]}
                      className={styles.chartBar}
                    />
                    <Bar 
                      dataKey="other" 
                      stackId="a" 
                      fill="#a8edea" 
                      name="Outros" 
                      radius={[6, 6, 0, 0]}
                      className={styles.chartBar}
                    />
                  </BarChart>
                </ResponsiveContainer>
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
              <div className={styles.chartContainer} style={{ height: '700px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <defs>
                      <linearGradient id="maintenancePieGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="fuelPieGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#4facfe" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#00f2fe" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#4facfe" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <Pie
                      data={serviceDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      stroke="rgba(255, 255, 255, 0.8)"
                      strokeWidth={3}
                      className={styles.chartPie}
                    >
                      {serviceDistributionData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.color}
                        />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      content={({ active, payload }) => {
                        if (!active || !payload) return null;
                        
                        const totalValue = serviceDistributionData.reduce((sum, item) => sum + item.value, 0);
                        const itemName = payload[0]?.name || 'Item';
                        
                        return (
                          <CustomTooltip
                            active={active}
                            payload={payload}
                            label={itemName}
                            showPercentage={true}
                            customIcon={<PieChartOutlined style={{ color: '#8B5CF6', fontSize: '16px' }} />}
                            additionalInfo={{
                              total: totalValue,
                              count: serviceDistributionData.length,
                              period: 'Distribuição por Tipo'
                            }}
                          />
                        );
                      }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Gráfico de Tendência */}
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24}>
            <Card 
              title={
                <Space>
                  <BarChartOutlined style={{ color: '#8B5CF6' }} />
                  <span>Tendência de Gastos (Últimas 8 Semanas)</span>
                </Space>
              }
              className={componentStyles.professionalCard}
            >
              <div className={styles.chartContainer} style={{ height: '700px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={expenseTrendData} margin={{ top: 30, right: 40, left: 30, bottom: 20 }}>
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                        <stop offset="50%" stopColor="#A855F7" stopOpacity={0.6} />
                        <stop offset="100%" stopColor="#C084FC" stopOpacity={0.4} />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.3} />
                        <stop offset="50%" stopColor="#A855F7" stopOpacity={0.2} />
                        <stop offset="100%" stopColor="#C084FC" stopOpacity={0.1} />
                      </linearGradient>
                      <linearGradient id="maintenanceGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#667eea" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#764ba2" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#667eea" stopOpacity={0.7} />
                      </linearGradient>
                      <linearGradient id="fuelGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4facfe" stopOpacity={0.9} />
                        <stop offset="50%" stopColor="#00f2fe" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#4facfe" stopOpacity={0.7} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 4" stroke="rgba(139, 92, 246, 0.08)" strokeWidth={1} />
                    <XAxis 
                      dataKey="week" 
                      tick={{ 
                        fontSize: 12, 
                        fill: 'var(--text-secondary)', 
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif'
                      }}
                      axisLine={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }}
                      tickLine={{ stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 1 }}
                    />
                    <YAxis 
                      tick={{ 
                        fontSize: 12, 
                        fill: 'var(--text-secondary)', 
                        fontWeight: 500,
                        fontFamily: 'Inter, sans-serif'
                      }}
                      axisLine={{ stroke: 'rgba(139, 92, 246, 0.3)', strokeWidth: 2 }}
                      tickLine={{ stroke: 'rgba(139, 92, 246, 0.4)', strokeWidth: 1 }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                    />
                    <RechartsTooltip 
                      content={({ active, payload, label }) => {
                        if (!active || !payload) return null;
                        
                        const totalValue = payload.reduce((sum, item) => sum + (item.value as number), 0);
                        const averageValue = expenseTrendData.reduce((sum, item) => sum + item.total, 0) / expenseTrendData.length;
                        const weekNumber = expenseTrendData.findIndex(item => item.week === label) + 1;
                        
                        return (
                          <CustomTooltip
                            active={active}
                            payload={payload}
                            label={String(label)}
                            showPercentage={true}
                            additionalInfo={{
                              total: totalValue,
                              average: averageValue,
                              count: payload.length,
                              period: `Semana ${weekNumber} - Tendência de Gastos`
                            }}
                          />
                        );
                      }}
                      cursor={{ fill: 'rgba(139, 92, 246, 0.1)' }}
                    />
                    <Legend 
                      wrapperStyle={{ 
                        paddingTop: '20px', 
                        fontSize: '13px', 
                        fontWeight: '500',
                        fontFamily: 'Inter, sans-serif'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      fill="url(#areaGradient)" 
                      stroke="url(#lineGradient)"
                      strokeWidth={3}
                      name="Total"
                    />
                    <Bar 
                      dataKey="maintenance" 
                      fill="url(#maintenanceGradient)" 
                      name="Manutenção"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="fuel" 
                      fill="url(#fuelGradient)" 
                      name="Abastecimento"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="repair" 
                      fill="#f093fb" 
                      name="Reparo"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="inspection" 
                      fill="#4facfe" 
                      name="Inspeção"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="expense" 
                      fill="#ff9a9e" 
                      name="Despesa"
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar 
                      dataKey="other" 
                      fill="#a8edea" 
                      name="Outros"
                      radius={[2, 2, 0, 0]}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
        </Row>

        {/* Tabela de Serviços */}
        <Card 
          title={
            <Space>
              <FileTextOutlined style={{ color: '#8B5CF6' }} />
              <span>Detalhamento dos Serviços</span>
            </Space>
          }
          className={componentStyles.professionalCard}
          style={{ marginTop: '24px' }}
          extra={
            <Button 
              type="text" 
              icon={<DownloadOutlined />}
              onClick={exportTableData}
              style={{ color: '#8B5CF6' }}
            >
              Exportar CSV
            </Button>
          }
        >
          <Spin spinning={loading}>
            {(() => {
              // Aplicar filtros na tabela (mesmos filtros dos gráficos)
              const filteredTableData = filterServices(services, selectedVehicle, dateRange, vehicles);
              
              return filteredTableData.length > 0 ? (
                <Table
                  columns={tableColumns}
                  dataSource={filteredTableData.map(service => ({
                    ...service,
                    vehicleName: vehicles.find(v => v.id === service.vehicleId)?.brand + ' ' + 
                                 vehicles.find(v => v.id === service.vehicleId)?.model,
                    key: service.id
                  }))}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: false,
                    showQuickJumper: true,
                    showTotal: (total, range) => 
                      `${range[0]}-${range[1]} de ${total} registros`
                  }}
                  className={componentStyles.professionalTable}
                />
              ) : (
                <Empty 
                  description="Nenhum serviço encontrado com os filtros aplicados"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              );
            })()}
          </Spin>
        </Card>
      </div>
    </DefaultFrame>
  );
}
