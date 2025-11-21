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

const MAX_TOP_SERVICES = 5;
const MAX_TOP_VEHICLES = 10;
const MAX_TOP_CATEGORIES = 8;
const MONTHS_TO_DISPLAY = 12;
const WEEKS_THRESHOLD = 3;
const DAYS_IN_WEEK = 7;
const CHART_HEIGHT = 350;
const MIN_CHART_HEIGHT = 300;

const CHART_COLORS = ['#8B5CF6', '#4facfe', '#f093fb', '#ff9a9e', '#a8edea', '#fadb14', '#52c41a', '#fa8c16'];

const getServiceCost = (service: VehicleEvent): number => {
  if (typeof service.cost === 'number') {
    return service.cost;
  }
  const parsed = Number.parseFloat(String(service.cost));
  return Number.isNaN(parsed) ? 0 : parsed;
};

const calculatePercentageChange = (current: number, previous: number): number => {
  if (previous <= 0) {
    return 0;
  }
  return ((current - previous) / previous) * 100;
};

const getVehicleName = (vehicle: Vehicle | undefined): string => {
  if (!vehicle) {
    return 'N/A';
  }
  return `${vehicle.brand} ${vehicle.model}`;
};

interface ReportData {
  totalVehicles: number;
  totalExpenses: number;
  totalServices: number;
  monthlyExpenses: number;
  previousMonthExpenses: number;
  monthlyExpensesChange: number;
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

  const calculateVehicleCosts = useCallback((services: VehicleEvent[]): { [key: string]: number } => {
    const costs: { [key: string]: number } = {};
    services.forEach(service => {
      const cost = getServiceCost(service);
      costs[service.vehicleId] = (costs[service.vehicleId] || 0) + cost;
    });
    return costs;
  }, []);

  const calculateCategoryCosts = useCallback((services: VehicleEvent[]): { [key: string]: number } => {
    const costs: { [key: string]: number } = {};
    services.forEach(service => {
      const cost = getServiceCost(service);
      costs[service.category] = (costs[service.category] || 0) + cost;
    });
    return costs;
  }, []);

  const getTopVehicle = useCallback((vehicleCosts: { [key: string]: number }, vehicles: Vehicle[]) => {
    const topEntry = Object.entries(vehicleCosts).reduce((max, [vehicleId, cost]) => {
      if (cost > max.cost) {
        const vehicle = vehicles.find(v => v.id === vehicleId);
        return { cost, name: getVehicleName(vehicle) };
      }
      return max;
    }, { cost: 0, name: 'N/A' });
    return topEntry.cost > 0 ? topEntry : null;
  }, []);

  const getTopCategory = useCallback((categoryCosts: { [key: string]: number }) => {
    const topEntry = Object.entries(categoryCosts).reduce((max, [category, cost]) => {
      return cost > max.cost ? { cost, name: category } : max;
    }, { cost: 0, name: 'N/A' });
    return topEntry.cost > 0 ? topEntry : null;
  }, []);

  const getMonthlyExpenses = useCallback((services: VehicleEvent[], month: number, year: number): number => {
    const monthlyServices = services.filter(service => {
      const serviceDate = new Date(service.date);
      return serviceDate.getMonth() === month && serviceDate.getFullYear() === year;
    });
    return monthlyServices.reduce((sum, service) => sum + getServiceCost(service), 0);
  }, []);

  const getTopExpensiveServices = useCallback((services: VehicleEvent[], vehicles: Vehicle[]) => {
    return services
      .map(service => {
        const vehicle = vehicles.find(v => v.id === service.vehicleId);
        return {
          id: service.id,
          description: service.description,
          cost: getServiceCost(service),
          vehicleName: getVehicleName(vehicle),
          date: service.date
        };
      })
      .sort((a, b) => b.cost - a.cost)
      .slice(0, MAX_TOP_SERVICES);
  }, []);

  const loadReportData = useCallback(async () => {
    try {
      setLoading(true);
      
      const vehiclesData = await VehicleService.getUserVehicles();
      const activeVehicles = vehiclesData.active || [];
      setVehicles(activeVehicles);

      let servicesData: VehicleEvent[] = [];
      try {
        servicesData = await VehicleServiceService.getAllServices();
      } catch (error) {
        console.error('Error loading services:', error);
        servicesData = [];
      }       
      
      setServices(servicesData);

      const filteredServices = filterServices(servicesData, selectedVehicle, dateRange, 'all', 'all', activeVehicles);
      
      const totalExpenses = filteredServices.reduce((sum, service) => sum + getServiceCost(service), 0);
      
      const serviceCount = filteredServices.length;
      const vehicleCount = activeVehicles.length;
      const averageCost = serviceCount > 0 ? totalExpenses / serviceCount : 0;
      const averageCostPerVehicle = vehicleCount > 0 ? totalExpenses / vehicleCount : 0;

      const vehicleCosts = calculateVehicleCosts(filteredServices);
      const categoryCosts = calculateCategoryCosts(filteredServices);
      const topSpendingVehicle = getTopVehicle(vehicleCosts, activeVehicles);
      const topCategory = getTopCategory(categoryCosts);

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      
      const monthlyExpenses = getMonthlyExpenses(filteredServices, currentMonth, currentYear);

      const previousMonthDate = new Date(currentYear, currentMonth - 1, 1);
      const previousMonth = previousMonthDate.getMonth();
      const previousYear = previousMonthDate.getFullYear();
      const previousMonthExpenses = getMonthlyExpenses(filteredServices, previousMonth, previousYear);

      const monthlyExpensesChange = calculatePercentageChange(monthlyExpenses, previousMonthExpenses);
      const topExpensiveServices = getTopExpensiveServices(filteredServices, activeVehicles);

      setReportData({
        totalVehicles: vehicleCount,
        totalExpenses,
        totalServices: serviceCount,
        monthlyExpenses,
        previousMonthExpenses,
        monthlyExpensesChange,
        averageServiceCost: averageCost,
        averageCostPerVehicle,
        topSpendingVehicle,
        topCategory,
        topExpensiveServices
      });

    } catch (error) {
      console.error('Error loading report data:', error);
      message.error('Erro ao carregar dados do relatório');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedVehicle, dateRange]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const filterServices = (services: VehicleEvent[], vehicleId: string, dateRange: [string, string] | null, serviceType: string, category: string, vehiclesList?: Vehicle[]) => {
    let filtered = services;

    const vehiclesToUse = vehiclesList || vehicles;
    const userVehicleIds = new Set(vehiclesToUse.map(v => v.id));
    filtered = filtered.filter(service => userVehicleIds.has(service.vehicleId));

    if (vehicleId !== 'all') {
      filtered = filtered.filter(service => service.vehicleId === vehicleId);
    }

    if (serviceType !== 'all') {
      filtered = filtered.filter(service => service.type === serviceType);
    }

    if (category !== 'all') {
      filtered = filtered.filter(service => service.category === category);
    }

    if (dateRange) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(service => {
        const serviceDate = new Date(service.date);
        serviceDate.setHours(0, 0, 0, 0);
        
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        
        return serviceDate >= start && serviceDate <= end;
      });
    }

    return filtered;
  };

  const processDayData = useCallback((services: VehicleEvent[], start: dayjs.Dayjs, monthlyData: { [key: string]: { month: string; total: number } }) => {
    const dayKey = start.format('YYYY-MM-DD');
    const dayLabel = start.format('DD/MM');
    monthlyData[dayKey] = { month: dayLabel, total: 0 };

    services.forEach(service => {
      const serviceDate = dayjs(service.date);
      const serviceDayKey = serviceDate.format('YYYY-MM-DD');
      if (monthlyData[serviceDayKey]) {
        monthlyData[serviceDayKey].total += getServiceCost(service);
      }
    });
  }, []);

  const processWeekData = useCallback((services: VehicleEvent[], start: dayjs.Dayjs, end: dayjs.Dayjs, monthlyData: { [key: string]: { month: string; total: number } }) => {
    let current = start.startOf('week');
    while (current.isBefore(end) || current.isSame(end, 'day')) {
      const startOfYear = current.startOf('year');
      const weekNumber = Math.floor(current.diff(startOfYear, 'day') / DAYS_IN_WEEK) + 1;
      const weekKey = `${current.format('YYYY')}-W${weekNumber.toString().padStart(2, '0')}`;
      const weekLabel = `${current.format('DD/MM')}`;
      monthlyData[weekKey] = { month: weekLabel, total: 0 };
      current = current.add(1, 'week');
    }

    services.forEach(service => {
      const serviceDate = dayjs(service.date);
      const startOfYear = serviceDate.startOf('year');
      const weekNumber = Math.floor(serviceDate.diff(startOfYear, 'day') / DAYS_IN_WEEK) + 1;
      const weekKey = `${serviceDate.format('YYYY')}-W${weekNumber.toString().padStart(2, '0')}`;
      if (monthlyData[weekKey]) {
        monthlyData[weekKey].total += getServiceCost(service);
      }
    });
  }, []);

  const processMonthData = useCallback((services: VehicleEvent[], start: dayjs.Dayjs, end: dayjs.Dayjs, monthlyData: { [key: string]: { month: string; total: number } }) => {
    let current = start.startOf('month');
    while (current.isBefore(end) || current.isSame(end, 'month')) {
      const monthKey = current.format('YYYY-MM');
      const monthName = current.format('MMM/YY');
      monthlyData[monthKey] = { month: monthName, total: 0 };
      current = current.add(1, 'month');
    }

    services.forEach(service => {
      const serviceDate = dayjs(service.date);
      const monthKey = serviceDate.format('YYYY-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total += getServiceCost(service);
      }
    });
  }, []);

  const processLastMonthsData = useCallback((services: VehicleEvent[], monthlyData: { [key: string]: { month: string; total: number } }) => {
    for (let i = MONTHS_TO_DISPLAY - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      const monthKey = date.format('YYYY-MM');
      const monthName = date.format('MMM/YY');
      monthlyData[monthKey] = { month: monthName, total: 0 };
    }

    services.forEach(service => {
      const serviceDate = dayjs(service.date);
      const monthKey = serviceDate.format('YYYY-MM');
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].total += getServiceCost(service);
      }
    });
  }, []);

  const monthlyExpensesData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, 'all', 'all', vehicles);
    const monthlyData: { [key: string]: { month: string; total: number } } = {};
    
    if (dateRange) {
      const start = dayjs(dateRange[0]);
      const end = dayjs(dateRange[1]);
      const daysDiff = end.diff(start, 'day') + 1;
      const monthsDiff = end.diff(start, 'month') + 1;
      
      if (daysDiff === 1) {
        processDayData(filteredServices, start, monthlyData);
      } else if (monthsDiff <= WEEKS_THRESHOLD) {
        processWeekData(filteredServices, start, end, monthlyData);
      } else {
        processMonthData(filteredServices, start, end, monthlyData);
      }
    } else {
      processLastMonthsData(filteredServices, monthlyData);
    }

    const sortedKeys = Object.keys(monthlyData).sort((a, b) => a.localeCompare(b));
    return sortedKeys.map(key => monthlyData[key]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, selectedVehicle, dateRange, vehicles]);

  const vehicleExpensesData = useMemo(() => {
    const vehicleToShow = selectedVehicle !== 'all' ? selectedVehicle : 'all';
    const filteredServices = filterServices(services, vehicleToShow, dateRange, 'all', 'all', vehicles);
    const vehicleCosts = calculateVehicleCosts(filteredServices);

    return vehicles
      .filter(v => vehicleCosts[v.id] && vehicleCosts[v.id] > 0)
      .map(vehicle => ({
        name: `${vehicle.brand} ${vehicle.model}`.substring(0, 20),
        fullName: `${vehicle.brand} ${vehicle.model}`,
        cost: vehicleCosts[vehicle.id] || 0
      }))
      .sort((a, b) => b.cost - a.cost)
      .slice(0, MAX_TOP_VEHICLES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, selectedVehicle, dateRange, vehicles]);

  const categoryDistributionData = useMemo(() => {
    const filteredServices = filterServices(services, selectedVehicle, dateRange, 'all', 'all', vehicles);
    const categoryCosts = calculateCategoryCosts(filteredServices);
    
    return Object.entries(categoryCosts)
      .map(([name, value], index) => ({
        name,
        value,
        color: CHART_COLORS[index % CHART_COLORS.length]
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, MAX_TOP_CATEGORIES);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [services, selectedVehicle, dateRange, vehicles]);

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
        <Card className={componentStyles.professionalCard} style={{ marginBottom: '24px' }} styles={{ body: { padding: '16px 24px' } }}>
          <div className={styles.filtersContainer}>
            <Row gutter={[12, 12]} className={styles.filterRow}>
              <Col xs={24} sm={12} md={12} lg={4} xl={4}>
                <div className={styles.filterItem}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                    Veículo
                  </Text>
                  <Select
                    value={selectedVehicle}
                    onChange={setSelectedVehicle}
                    style={{ width: '100%' }}
                    className={styles.filterSelect}
                    placeholder="Selecione o veículo"
                    showSearch
                    filterOption={(input, option) =>
                      (String(option?.label ?? '')).toLowerCase().includes(input.toLowerCase())
                    }
                  >
                    <Option value="all">Todos os veículos</Option>
                    {vehicles.map(vehicle => (
                      <Option key={vehicle.id} value={vehicle.id} label={`${vehicle.brand} ${vehicle.model} - ${vehicle.plate}`}>
                        {vehicle.brand} {vehicle.model} - {vehicle.plate}
                      </Option>
                    ))}
                  </Select>
                </div>
              </Col>
              
              <Col xs={24} sm={12} md={12} lg={8} xl={8}>
                <div className={styles.filterItem}>
                  <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginBottom: '6px' }}>
                    Período
                  </Text>
                  <RangePicker
                    value={dateRange ? [
                      dayjs(dateRange[0]),
                      dayjs(dateRange[1])
                    ] as [dayjs.Dayjs, dayjs.Dayjs] : null}
                    onChange={(dates) => {
                      if (dates?.[0] && dates?.[1]) {
                        setDateRange([dates[0]?.toISOString() ?? '', dates[1]?.toISOString() ?? '']);
                      } else {
                        setDateRange(null);
                      }
                    }}
                    format="DD/MM/YYYY"
                    placeholder={['Data inicial', 'Data final']}
                    style={{ width: '100%' }}
                    className={styles.filterDatePicker}
                  />
                </div>
              </Col>
            </Row>

            {(selectedVehicle !== 'all' || dateRange) && (
              <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(139, 92, 246, 0.2)' }}>
                <Space size="middle" wrap>
                  <Text type="secondary" style={{ fontSize: '12px' }}>Filtros ativos:</Text>
                  {selectedVehicle !== 'all' && (() => {
                    const selectedVehicleData = vehicles.find(v => v.id === selectedVehicle);
                    return selectedVehicleData ? (
                      <Tag color="purple" closable onClose={() => setSelectedVehicle('all')}>
                        Veículo: {selectedVehicleData.brand} {selectedVehicleData.model}
                      </Tag>
                    ) : null;
                  })()}
                  {dateRange && (
                    <Tag 
                      color="purple" 
                      closable 
                      onClose={() => setDateRange(null)}
                    >
                      Período: {formatBRDate(new Date(dateRange[0]))} até {formatBRDate(new Date(dateRange[1]))}
                    </Tag>
                  )}
                  <Button 
                    type="text"
                    size="small"
                    onClick={() => {
                      setSelectedVehicle('all');
                      setDateRange(null);
                    }}
                    style={{ 
                      color: 'rgba(255,255,255,0.7)',
                      fontSize: '12px',
                      padding: 0
                    }}
                  >
                    Limpar filtros
                  </Button>
                </Space>
              </div>
            )}
          </div>
        </Card>

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
                    <span className={styles.expenseChangeSuffix}>
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
                    formatter={(value) => currencyBRL(typeof value === 'number' ? value : Number(value) || 0)}
                    suffix={
                      reportData.topSpendingVehicle && (
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>
                          {reportData.topSpendingVehicle.name}
                        </Text>
                      )
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
                    formatter={(value) => currencyBRL(typeof value === 'number' ? value : Number(value) || 0)}
                    suffix={
                      reportData.topCategory && (
                        <Text type="secondary" style={{ fontSize: '14px', display: 'block', marginTop: '4px', wordBreak: 'break-word' }}>
                          {reportData.topCategory.name}
                        </Text>
                      )
                    }
                  />
                </Card>
              </Col>
            )}
          </Row>
        )}

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
              <div className={styles.chartContainer}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyExpensesData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                      stroke="rgba(255, 255, 255, 0.3)"
                      className={styles.chartXAxis}
                    />
                    <YAxis 
                      tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                      tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                      stroke="rgba(255, 255, 255, 0.3)"
                      width={60}
                      className={styles.chartYAxis}
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
                <div className={styles.barChartContainer} style={{ height: `${CHART_HEIGHT}px`, minHeight: `${MIN_CHART_HEIGHT}px` }}>
                  {vehicleExpensesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={vehicleExpensesData} 
                        layout="vertical"
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(139, 92, 246, 0.1)" />
                      <XAxis 
                          type="number"
                          tick={{ fontSize: 12, fill: 'rgba(255, 255, 255, 0.65)' }}
                          tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
                          stroke="rgba(255, 255, 255, 0.3)"
                          className={styles.chartXAxis}
                      />
                      <YAxis 
                          type="category"
                          dataKey="name"
                          tick={{ fontSize: 11, fill: 'rgba(255, 255, 255, 0.65)' }}
                          width={0}
                          stroke="rgba(255, 255, 255, 0.3)"
                          className={styles.barChartYAxis}
                      />
                    <RechartsTooltip 
                          contentStyle={{
                            backgroundColor: '#1a1a2e',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                            borderRadius: '8px',
                            color: '#ffffff'
                          }}
                          formatter={(value: number, name: string, props: { payload?: { fullName?: string } }) => [
                            currencyBRL(value),
                            props?.payload?.fullName || ''
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
              <div style={{ height: `${CHART_HEIGHT}px`, overflowY: 'auto', paddingRight: '12px' }}>
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
              <div className={styles.pieChartContainer} style={{ height: `${CHART_HEIGHT}px`, minHeight: `${MIN_CHART_HEIGHT}px` }}>
                {categoryDistributionData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                      <Pie
                        data={categoryDistributionData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                        label={(props: { name?: string; percent?: number }) => {
                          const name = props.name || '';
                          const percent = props.percent || 0;
                          return `${name} ${(percent * 100).toFixed(0)}%`;
                        }}
                      outerRadius={100}
                      innerRadius={30}
                      fill="#8884d8"
                      dataKey="value"
                      className={styles.pieChartElement}
                      >
                        {categoryDistributionData.map((entry) => (
                          <Cell key={`cell-${entry.name}`} fill={entry.color} />
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
