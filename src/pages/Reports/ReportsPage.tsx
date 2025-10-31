import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Typography, 
  Button, 
  Tag, 
  Space, 
  DatePicker, 
  Select, 
  Empty,
  message
} from 'antd';
import {
  LineChartOutlined,
  DollarOutlined,
  CarOutlined,
  ToolOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  PieChartOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import dayjs from 'dayjs';
import { DefaultFrame } from '../../components/layout';
import componentStyles from '../../components/layout/Components.module.css';
import styles from './ReportsPage.module.css';
import { VehicleService } from '../../features/vehicles/services/vehicleService';
import { VehicleServiceService } from '../../features/vehicles/services/vehicleServiceService';
import { Vehicle, VehicleEvent } from '../../features/vehicles/types/vehicle.types';
import { currencyBRL, formatBRDate } from '../../shared/utils/format';

const { Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

interface ReportData {
  totalVehicles: number;
  totalExpenses: number;
  totalServices: number;
  monthlyExpenses: number;
  previousMonthExpenses: number;
  monthlyExpensesChange: number; // % de variação
  averageServiceCost: number;
  averageCostPerVehicle: number;
  topSpendingVehicle: { name: string; cost: number } | null;
  topCategory: { name: string; cost: number } | null;
  topExpensiveServices: Array<{ id: string; description: string; cost: number; vehicleName: string; date: Date }>;
}

export default function ReportsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<ReportData>({
    totalVehicles: 0,
    totalExpenses: 0,
    totalServices: 0,
    monthlyExpenses: 0,
    previousMonthExpenses: 0,
    monthlyExpensesChange: 0,
    averageServiceCost: 0,
    averageCostPerVehicle: 0,
    topSpendingVehicle: null,
    topCategory: null,
    topExpensiveServices: []
  });
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [services, setServices] = useState<VehicleEvent[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);

  useEffect(() => {
    loadReportData();
  }, [selectedVehicle, dateRange]);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      const vehiclesData = await VehicleService.getUserVehicles();
      const activeVehicles = vehiclesData.active || [];
      setVehicles(activeVehicles);

      // Buscar sempre do banco (serviço local)
      let servicesData: VehicleEvent[] = [];
        try {
          servicesData = await VehicleServiceService.getAllServices();
      } catch (error) {
          servicesData = [];
      }       
      
      setServices(servicesData);

      const filteredServices = filterServices(servicesData, selectedVehicle, dateRange, activeVehicles);
      
      const totalExpenses = filteredServices.reduce((sum, service) => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        return sum + cost;
      }, 0);
      
      const averageCost = filteredServices.length > 0 ? totalExpenses / filteredServices.length : 0;
      const averageCostPerVehicle = activeVehicles.length > 0 ? totalExpenses / activeVehicles.length : 0;

      // Calcular gastos por veículo
      const vehicleCosts: { [key: string]: number } = {};
      filteredServices.forEach(service => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        vehicleCosts[service.vehicleId] = (vehicleCosts[service.vehicleId] || 0) + cost;
      });

      const topVehicleEntry = Object.entries(vehicleCosts).reduce((max, [vehicleId, cost]) => {
        if (cost > max.cost) {
          const vehicle = activeVehicles.find(v => v.id === vehicleId);
          return { cost, name: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A' };
        }
        return max;
      }, { cost: 0, name: 'N/A' });

      // Calcular categoria que mais gasta
      const categoryCosts: { [key: string]: number } = {};
      filteredServices.forEach(service => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        categoryCosts[service.category] = (categoryCosts[service.category] || 0) + cost;
      });

      const topCategoryEntry = Object.entries(categoryCosts).reduce((max, [category, cost]) => {
        return cost > max.cost ? { cost, name: category } : max;
      }, { cost: 0, name: 'N/A' });

      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      
      // Gastos do mês atual
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

      // Gastos do mês anterior
      const previousMonthDate = new Date();
      previousMonthDate.setMonth(currentMonth - 1);
      const previousMonth = previousMonthDate.getMonth();
      const previousYear = previousMonthDate.getFullYear();

      const previousMonthlyServices = filteredServices.filter(service => {
        const serviceDate = new Date(service.date);
        const serviceMonth = serviceDate.getMonth();
        const serviceYear = serviceDate.getFullYear();
        return serviceMonth === previousMonth && serviceYear === previousYear;
      });
      
      const previousMonthExpenses = previousMonthlyServices.reduce((sum, service) => {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        return sum + cost;
      }, 0);

      // Calcular variação percentual
      const monthlyExpensesChange = previousMonthExpenses > 0 
        ? ((monthlyExpenses - previousMonthExpenses) / previousMonthExpenses) * 100 
        : 0;

      // Top 5 serviços mais caros
      const topExpensiveServices = filteredServices
        .map(service => {
          const vehicle = activeVehicles.find(v => v.id === service.vehicleId);
          return {
            id: service.id,
            description: service.description,
            cost: typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0,
            vehicleName: vehicle ? `${vehicle.brand} ${vehicle.model}` : 'N/A',
            date: service.date
          };
        })
        .sort((a, b) => b.cost - a.cost)
        .slice(0, 5);

      setReportData({
        totalVehicles: activeVehicles.length,
        totalExpenses,
        totalServices: filteredServices.length,
        monthlyExpenses,
        previousMonthExpenses,
        monthlyExpensesChange,
        averageServiceCost: averageCost,
        averageCostPerVehicle,
        topSpendingVehicle: topVehicleEntry.cost > 0 ? topVehicleEntry : null,
        topCategory: topCategoryEntry.cost > 0 ? topCategoryEntry : null,
        topExpensiveServices
      });

    } catch (error) {
      message.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
  }, [selectedVehicle, dateRange]);

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
        // Normalizar para início do dia (00:00:00) para comparação correta
        serviceDate.setHours(0, 0, 0, 0);
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        // Normalizar para fim do dia (23:59:59) para incluir todo o dia
        end.setHours(23, 59, 59, 999);
        
        return serviceDate >= start && serviceDate <= end;
      });
    }

    return filtered;
  };

  // Gráfico: Tendência mensal de gastos (adaptável ao filtro de período)
  const monthlyExpensesData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, vehicles);
    const monthlyData: { [key: string]: { month: string; total: number } } = {};
    
    // Se há filtro de período, usar o período selecionado; senão, últimos 12 meses
    if (dateRange) {
      const start = dayjs(dateRange[0]);
      const end = dayjs(dateRange[1]);
      const daysDiff = end.diff(start, 'day') + 1;
      const monthsDiff = end.diff(start, 'month') + 1;
      
      // Se for um único dia, mostrar por dia
      if (daysDiff === 1) {
        const dayKey = start.format('YYYY-MM-DD');
        const dayLabel = start.format('DD/MM');
        monthlyData[dayKey] = { month: dayLabel, total: 0 };

    filteredServices.forEach(service => {
          const serviceDate = dayjs(service.date);
          const serviceDayKey = serviceDate.format('YYYY-MM-DD');
      
          if (monthlyData[serviceDayKey]) {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
            monthlyData[serviceDayKey].total += cost;
          }
        });
      }
      // Se o período for menor que 3 meses e maior que 1 dia, agrupar por semana
      else if (monthsDiff <= 3) {
        let current = start.startOf('week');
        while (current.isBefore(end) || current.isSame(end, 'day')) {
          // Calcular número da semana: dias desde o início do ano / 7
          const startOfYear = current.startOf('year');
          const weekNumber = Math.floor(current.diff(startOfYear, 'day') / 7) + 1;
          const weekKey = `${current.format('YYYY')}-W${weekNumber.toString().padStart(2, '0')}`;
          const weekLabel = `${current.format('DD/MM')}`;
          monthlyData[weekKey] = { month: weekLabel, total: 0 };
          current = current.add(1, 'week');
        }

    filteredServices.forEach(service => {
          const serviceDate = dayjs(service.date);
          const startOfYear = serviceDate.startOf('year');
          const weekNumber = Math.floor(serviceDate.diff(startOfYear, 'day') / 7) + 1;
          const weekKey = `${serviceDate.format('YYYY')}-W${weekNumber.toString().padStart(2, '0')}`;
          
          if (monthlyData[weekKey]) {
            const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
            monthlyData[weekKey].total += cost;
          }
        });
      } else {
        // Agrupar por mês
        let current = start.startOf('month');
        while (current.isBefore(end) || current.isSame(end, 'month')) {
          const monthKey = current.format('YYYY-MM');
          const monthName = current.format('MMM/YY');
          monthlyData[monthKey] = { month: monthName, total: 0 };
          current = current.add(1, 'month');
    }

    filteredServices.forEach(service => {
          const serviceDate = dayjs(service.date);
          const monthKey = serviceDate.format('YYYY-MM');
      
      if (monthlyData[monthKey]) {
        const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        monthlyData[monthKey].total += cost;
          }
        });
      }
    } else {
      // Sem filtro: mostrar últimos 12 meses
      for (let i = 11; i >= 0; i--) {
        const date = dayjs().subtract(i, 'month');
        const monthKey = date.format('YYYY-MM');
        const monthName = date.format('MMM/YY');
        monthlyData[monthKey] = { month: monthName, total: 0 };
    }

    filteredServices.forEach(service => {
        const serviceDate = dayjs(service.date);
        const monthKey = serviceDate.format('YYYY-MM');
        
        if (monthlyData[monthKey]) {
          const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
        monthlyData[monthKey].total += cost;
      }
    });
    }

    // Retornar dados ordenados cronologicamente
    const sortedKeys = Object.keys(monthlyData).sort();
    return sortedKeys.map(key => monthlyData[key]);
  }, [services, selectedVehicle, dateRange, vehicles]);

  // Gráfico: Comparação de gastos por veículo (respeita filtro de veículo)
  const vehicleExpensesData = useMemo(() => {
    // Se há filtro de veículo específico, mostrar apenas ele; senão, todos
    const vehicleToShow = selectedVehicle !== 'all' ? selectedVehicle : 'all';
    const filteredServices = filterServices(services, vehicleToShow, dateRange, vehicles);
    const vehicleCosts: { [key: string]: number } = {};

    filteredServices.forEach(service => {
          const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
      vehicleCosts[service.vehicleId] = (vehicleCosts[service.vehicleId] || 0) + cost;
    });

    return vehicles
      .filter(v => vehicleCosts[v.id] && vehicleCosts[v.id] > 0)
      .map(vehicle => ({
        name: `${vehicle.brand} ${vehicle.model}`.substring(0, 20),
        fullName: `${vehicle.brand} ${vehicle.model}`,
        cost: vehicleCosts[vehicle.id] || 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, 10); // Top 10 veículos
  }, [services, selectedVehicle, dateRange, vehicles]);

  // Gráfico: Distribuição por categoria
  const categoryDistributionData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, vehicles);
    const categoryCosts: { [key: string]: number } = {};

    filteredServices.forEach(service => {
          const cost = typeof service.cost === 'number' ? service.cost : parseFloat(service.cost) || 0;
      categoryCosts[service.category] = (categoryCosts[service.category] || 0) + cost;
    });

    const colors = ['#8B5CF6', '#4facfe', '#f093fb', '#ff9a9e', '#a8edea', '#fadb14', '#52c41a', '#fa8c16'];
    
    return Object.entries(categoryCosts)
      .map(([name, value], index) => ({
        name,
        value,
        color: colors[index % colors.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 categorias
  }, [services, selectedVehicle, dateRange, vehicles]);

  // Verificar se há serviços para exibir
  const hasServices = services.length > 0;

  if (!hasServices) {
    return (
      <DefaultFrame title="Relatórios e Análises" loading={loading}>
        <div className={styles.reportsContainer}>
          <Card className={componentStyles.professionalCard}>
            <Empty 
              description={
                <div style={{ textAlign: 'center' }}>
                  <Text style={{ fontSize: '16px', color: '#6B7280', marginBottom: '16px', display: 'block' }}>
                    Nenhum serviço registrado ainda
                  </Text>
                  <Text style={{ fontSize: '14px', color: '#9CA3AF' }}>
                    Registre serviços, abastecimentos e outras despesas para visualizar os relatórios
                  </Text>
                </div>
              }
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <Button
                type="primary"
                onClick={() => navigate('/maintenance')}
                className={componentStyles.professionalButton}
              >
                Registrar Serviço
              </Button>
            </Empty>
          </Card>
        </div>
      </DefaultFrame>
    );
  }

  return (
    <DefaultFrame title="Relatórios e Análises" loading={loading}>
      <div className={styles.reportsContainer}>
        {/* Filtros */}
        <Card className={componentStyles.professionalCard} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
            <Space size="large" wrap>
              <div>
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Veículo</Text>
                <Select 
                  value={selectedVehicle} 
                  onChange={setSelectedVehicle}
                  style={{ width: 200 }}
                  allowClear={false}
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
                <Text strong style={{ display: 'block', marginBottom: '8px' }}>Período</Text>
                <RangePicker 
                  value={dateRange ? [
                    dayjs(dateRange[0]),
                    dayjs(dateRange[1])
                  ] as [dayjs.Dayjs, dayjs.Dayjs] : null}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0].toISOString(), dates[1].toISOString()]);
                    } else {
                      setDateRange(null);
                    }
                  }}
                  format="DD/MM/YYYY"
                />
              </div>
            
              {(selectedVehicle !== 'all' || dateRange) && (
            <Button 
                  type="link"
                  onClick={() => {
                    setSelectedVehicle('all');
                    setDateRange(null);
                  }}
                  style={{ color: '#8B5CF6', padding: '0' }}
                >
                  Limpar filtros
            </Button>
              )}
            </Space>
          </div>
          
          {(selectedVehicle !== 'all' || dateRange) && (
            <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
              <Space size="middle">
                <Text type="secondary" style={{ fontSize: '12px' }}>Filtros ativos:</Text>
                {selectedVehicle !== 'all' && (
                  <Tag color="purple" closable onClose={() => setSelectedVehicle('all')}>
                    Veículo: {vehicles.find(v => v.id === selectedVehicle)?.brand} {vehicles.find(v => v.id === selectedVehicle)?.model}
                  </Tag>
                )}
                {dateRange && (
                  <Tag 
                    color="purple" 
                    closable 
                    onClose={() => setDateRange(null)}
                  >
                    Período: {formatBRDate(new Date(dateRange[0]))} até {formatBRDate(new Date(dateRange[1]))}
                  </Tag>
                )}
              </Space>
            </div>
          )}
        </Card>

        {/* Estatísticas Principais */}
        <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
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
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Gastos Este Mês"
                value={reportData.monthlyExpenses}
                prefix={<DollarOutlined style={{ color: '#FAAD14' }} />}
                valueStyle={{ color: '#FAAD14', fontWeight: 700 }}
                formatter={(value) => currencyBRL(value as number)}
                suffix={
                  reportData.monthlyExpensesChange !== 0 && (
                    <span style={{ 
                      fontSize: '14px', 
                      marginLeft: '8px',
                      color: reportData.monthlyExpensesChange > 0 ? '#ff4d4f' : '#52c41a'
                    }}>
                      {reportData.monthlyExpensesChange > 0 ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
                      {' '}
                      {Math.abs(reportData.monthlyExpensesChange).toFixed(1)}%
                    </span>
                  )
                }
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Total de Serviços"
                value={reportData.totalServices}
                prefix={<ToolOutlined style={{ color: '#1890FF' }} />}
                valueStyle={{ color: '#1890FF', fontWeight: 700 }}
              />
            </Card>
          </Col>
          
          <Col xs={24} sm={12} md={12} lg={6} xl={6}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Custo Médio por Serviço"
                value={reportData.averageServiceCost}
                prefix={<DollarOutlined style={{ color: '#8B5CF6' }} />}
                valueStyle={{ color: '#8B5CF6', fontWeight: 700 }}
                formatter={(value) => currencyBRL(value as number)}
              />
            </Card>
          </Col>
        </Row>

        {/* Insights Adicionais */}
        {(reportData.topSpendingVehicle || reportData.topCategory) && (
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            {reportData.topSpendingVehicle && (
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Card className={componentStyles.professionalCard}>
                  <Statistic
                    title="Veículo que Mais Gastou"
                    value={reportData.topSpendingVehicle.cost}
                    prefix={<CarOutlined style={{ color: '#722ed1' }} />}
                    valueStyle={{ color: '#722ed1', fontWeight: 600 }}
                    formatter={(value) => currencyBRL(value as number)}
                    suffix={
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>
                        {reportData.topSpendingVehicle!.name}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            )}
            
            {reportData.topCategory && (
              <Col xs={24} sm={24} md={12} lg={12} xl={12}>
                <Card className={componentStyles.professionalCard}>
                  <Statistic
                    title="Categoria que Mais Gasta"
                    value={reportData.topCategory.cost}
                    prefix={<ToolOutlined style={{ color: '#eb2f96' }} />}
                    valueStyle={{ color: '#eb2f96', fontWeight: 600 }}
                    formatter={(value) => currencyBRL(value as number)}
                    suffix={
                      <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>
                        {reportData.topCategory!.name}
                      </Text>
                    }
                  />
                </Card>
              </Col>
            )}
          </Row>
        )}

        {/* Gráficos */}
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={24} md={24} lg={24} xl={selectedVehicle === 'all' ? 14 : 24}>
            <Card 
              title={
                <Space wrap>
                  <LineChartOutlined style={{ color: '#8B5CF6' }} />
                  <span style={{ fontSize: '14px', wordBreak: 'break-word' }}>
                    {dateRange 
                      ? `Tendência de Gastos (${formatBRDate(new Date(dateRange[0]))} até ${formatBRDate(new Date(dateRange[1]))})`
                      : 'Tendência de Gastos (Últimos 12 Meses)'
                    }
                  </span>
                </Space>
              }
              className={componentStyles.professionalCard}
            >
              <div style={{ height: '350px', minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyExpensesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                      stroke="rgba(255, 255, 255, 0.3)"
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      stroke="rgba(255, 255, 255, 0.3)"
                    />
                    <RechartsTooltip 
                      contentStyle={{
                        backgroundColor: '#1a1a2e',
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                        borderRadius: '8px',
                        color: '#ffffff'
                      }}
                      formatter={(value: number) => currencyBRL(value)}
                      labelStyle={{ color: '#8B5CF6', fontWeight: 600 }}
                      itemStyle={{ color: '#ffffff' }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#8B5CF6" 
                      strokeWidth={3}
                      dot={{ fill: '#8B5CF6', r: 4 }}
                      activeDot={{ r: 6 }}
                      name="Gastos"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </Col>
          
          {selectedVehicle === 'all' && (
            <Col xs={24} sm={24} md={24} lg={24} xl={10}>
            <Card 
              title={
                <Space>
                    <CarOutlined style={{ color: '#8B5CF6' }} />
                    <span>Gastos por Veículo</span>
                </Space>
              }
              className={componentStyles.professionalCard}
            >
                <div style={{ height: '350px', minHeight: '300px' }}>
                  {vehicleExpensesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={vehicleExpensesData} 
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 100, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis 
                          type="number"
                          tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                          stroke="rgba(255, 255, 255, 0.3)"
                      />
                      <YAxis 
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }}
                          width={95}
                          stroke="rgba(255, 255, 255, 0.3)"
                      />
                    <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                          formatter={(value: number, payload: any) => [
                            currencyBRL(value),
                            payload[0]?.payload?.fullName || ''
                          ]}
                          labelStyle={{ color: '#ffffff', fontWeight: 600 }}
                          itemStyle={{ color: '#ffffff' }}
                      />
                      <Bar 
                          dataKey="cost" 
                          fill="#8B5CF6"
                          radius={[0, 4, 4, 0]}
                          name="Gastos"
                      />
                    </BarChart>
                </ResponsiveContainer>
                  ) : (
                    <div style={{ 
                      height: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      color: 'var(--text-secondary)'
                    }}>
                      <Text type="secondary">Sem dados suficientes</Text>
                    </div>
                  )}
              </div>
            </Card>
          </Col>
          )}
        </Row>

        {/* Seção de Top 5 e Distribuição por Categoria */}
        <Row gutter={[24, 24]} style={{ marginTop: '24px' }}>
          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
            <Card 
              title={
                <Space>
                  <TrophyOutlined style={{ color: '#8B5CF6' }} />
                  <span>Top 5 Serviços Mais Caros</span>
                </Space>
              }
              className={componentStyles.professionalCard}
            >
              <div style={{ height: '350px', overflowY: 'auto', paddingRight: '12px' }}>
                {reportData.topExpensiveServices.length > 0 ? (
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    {reportData.topExpensiveServices.map((service, index) => (
                      <div 
                        key={service.id}
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          padding: '12px',
                          background: index === 0 ? 'rgba(139, 92, 246, 0.1)' : 'transparent',
                          borderRadius: '8px',
                          border: index === 0 ? '2px solid #8B5CF6' : '1px solid rgba(139, 92, 246, 0.2)',
                          flexWrap: 'wrap'
                        }}
                      >
                        <div style={{ flex: 1, minWidth: '200px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                            <span style={{ 
                              fontSize: '18px', 
                              fontWeight: 700, 
                              color: '#8B5CF6',
                              minWidth: '24px'
                            }}>
                              #{index + 1}
                            </span>
                            <Text strong style={{ fontSize: '14px', wordBreak: 'break-word' }}>{service.description}</Text>
                          </div>
                          <Text type="secondary" style={{ fontSize: '12px', marginLeft: '32px', wordBreak: 'break-word' }}>
                            {service.vehicleName} • {formatBRDate(service.date)}
                          </Text>
                        </div>
                        <Text strong style={{ color: '#ff4d4f', fontSize: '16px', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                          {currencyBRL(service.cost)}
                        </Text>
                      </div>
                    ))}
                  </Space>
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center'
                  }}>
                    <Empty 
                      description="Nenhum serviço encontrado"
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                    />
                  </div>
                )}
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={24} md={24} lg={12} xl={12}>
        <Card 
          title={
            <Space>
                  <PieChartOutlined style={{ color: '#8B5CF6' }} />
                  <span>Distribuição por Categoria</span>
            </Space>
          }
          className={componentStyles.professionalCard}
            >
              <div style={{ height: '350px', minHeight: '300px' }}>
                {categoryDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                        label={({ name, percent }: any) => `${name} ${((percent as number) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      >
                        {categoryDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                        contentStyle={{
                          backgroundColor: '#1a1a2e',
                          border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px',
                          color: '#ffffff'
                        }}
                        formatter={(value: number) => currencyBRL(value)}
                        labelStyle={{ color: '#8B5CF6', fontWeight: 600 }}
                        itemStyle={{ color: '#ffffff' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                ) : (
                  <div style={{ 
                    height: '100%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    color: 'var(--text-secondary)'
                  }}>
                    <Text type="secondary">Sem dados suficientes</Text>
              </div>
                )}
              </div>
        </Card>
          </Col>
        </Row>

      </div>
    </DefaultFrame>
  );
}
