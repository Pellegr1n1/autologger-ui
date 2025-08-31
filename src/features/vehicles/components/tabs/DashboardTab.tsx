import React from "react"
import { Card, Col, Row, Space, Typography, Statistic, Progress, Tag } from "antd"
import { Pie, Column } from '@ant-design/charts'
import { 
  CarOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons"
import type { VehicleEvent } from "../../types/vehicle.types"
import { calculateVehicleStats } from "../../utils/vehicleStats"
import { getCategoryChartConfig, getMonthlyChartConfig, getMileageChartConfig } from "../../utils/chartConfigs"
import { currencyBRL } from "../../../../utils/format"

const { Text, Title } = Typography

interface DashboardTabProps {
  events: VehicleEvent[]
}

export default function DashboardTab({ events }: DashboardTabProps) {
  const stats = React.useMemo(() => calculateVehicleStats(events), [events])
  
  const totalCost = stats.totalCost || 0;
  const averageCost = stats.averageCost || 0;
  const totalEvents = stats.totalEvents || 0;
  const costTrend = 0; // Placeholder - será implementado quando disponível
  const efficiencyScore = 75; // Placeholder - será implementado quando disponível

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Cards de métricas principais */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Total Investido</Text>}
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
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Custo Médio</Text>}
              value={averageCost}
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
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Tendência</Text>}
              value={costTrend}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
              suffix="%"
              precision={1}
              valueStyle={{ 
                color: costTrend >= 0 ? '#ff4d4f' : '#52c41a', 
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
            bodyStyle={{ padding: '24px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Eficiência</Text>}
              value={efficiencyScore}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
              suffix="%"
              precision={0}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '24px' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Gráficos principais */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Pie {...(getCategoryChartConfig(stats) as any)} />
                <span>Distribuição de Gastos</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Pie {...(getCategoryChartConfig(stats) as any)} height={280} />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <Column {...(getMonthlyChartConfig(stats) as any)} />
                <span>Gastos por Mês</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <div style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Column {...(getMonthlyChartConfig(stats) as any)} height={280} />
            </div>
          </Card>
        </Col>
      </Row>

      {/* Gráfico de quilometragem */}
      <Card 
        title={
          <Space>
            <CarOutlined style={{ color: '#8B5CF6' }} />
            <span>Evolução da Quilometragem</span>
          </Space>
        }
        style={{ 
          borderRadius: '16px',
          border: '1px solid #374151',
          background: '#1F2937'
        }}
        headStyle={{ 
          borderBottom: '1px solid #374151',
          background: '#1F2937',
          color: '#F9FAFB'
        }}
        bodyStyle={{ background: '#1F2937' }}
      >
        <div style={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Column {...(getMileageChartConfig(stats) as any)} height={360} />
        </div>
      </Card>

      {/* Métricas de performance */}
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <ToolOutlined style={{ color: '#8B5CF6' }} />
                <span>Análise de Performance</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Eficiência de custos</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={efficiencyScore} 
                    strokeColor={{
                      '0%': '#8B5CF6',
                      '100%': '#A78BFA'
                    }}
                    trailColor="#374151"
                    size="small"
                  />
                </div>
              </div>
              
              <Tag color={costTrend >= 0 ? 'red' : 'green'}>
                {costTrend >= 0 ? '+' : ''}{costTrend}% este mês
              </Tag>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#8B5CF6' }} />
                <span>Resumo Mensal</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid #374151',
              background: '#1F2937'
            }}
            headStyle={{ 
              borderBottom: '1px solid #374151',
              background: '#1F2937',
              color: '#F9FAFB'
            }}
            bodyStyle={{ background: '#1F2937' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Média por evento</Text>
                <div>
                  <Text strong style={{ fontSize: '18px', color: '#F9FAFB' }}>
                    {currencyBRL(averageCost)}
                  </Text>
                </div>
              </div>
              
              <Tag>
                Total de eventos: {totalEvents}
              </Tag>
            </Space>
          </Card>
        </Col>
      </Row>
    </Space>
  )
}