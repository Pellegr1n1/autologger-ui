import React from "react"
import { Card, Col, Row, Space, Typography, Progress, Tag, Timeline, Statistic, Button } from "antd"
import { 
  CarOutlined, 
  CalendarOutlined, 
  DollarOutlined, 
  ToolOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined
} from "@ant-design/icons"
import type { VehicleEvent } from "../../types/vehicle.types"
import { getChainStatusConfig, getVehicleEventTypeLabel } from "../../utils/helpers"
import { formatBRDate, kmFormat } from "../../../../utils/format"
import { calculateVehicleStats } from "../../utils/vehicleStats"

const { Text, Title } = Typography

interface OverviewTabProps {
  events: VehicleEvent[]
  vehicle: any
}

export default function OverviewTab({ events, vehicle }: OverviewTabProps) {
  const stats = React.useMemo(() => calculateVehicleStats(events), [events])
  
  const totalCost = stats.totalCost || 0;
  const averageCost = stats.averageCost || 0;
  const totalEvents = stats.totalEvents || 0;

  const sortedEvents = React.useMemo(() => 
    [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events]
  )

  const getVehicleAge = (year: number) => {
    return new Date().getFullYear() - year;
  };

  const getLastServiceDate = () => {
    if (events.length === 0) return 'Nunca';
    const lastEvent = sortedEvents[0];
    return formatBRDate(lastEvent.date);
  };

  const getNextServiceEstimate = () => {
    if (events.length === 0) return 'Não disponível';
    // Lógica simples: próximo serviço em 5000km ou 6 meses
    const lastMileage = sortedEvents[0]?.mileage || vehicle.mileage;
    const nextMileage = lastMileage + 5000;
    return `${kmFormat(nextMileage)} km`;
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Cards de estatísticas principais */}
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
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Total em Serviços</Text>}
              value={totalCost}
              prefix={<DollarOutlined style={{ color: 'white' }} />}
              suffix="R$"
              precision={2}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '28px' 
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
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Eventos Realizados</Text>}
              value={events.length}
              prefix={<ToolOutlined style={{ color: 'white' }} />}
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '28px' 
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
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Quilometragem</Text>}
              value={vehicle.mileage}
              prefix={<CarOutlined style={{ color: 'white' }} />}
              suffix="km"
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '28px' 
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
              title={<Text style={{ color: 'white', fontSize: '14px' }}>Idade do Veículo</Text>}
              value={getVehicleAge(vehicle.year)}
              prefix={<CalendarOutlined style={{ color: 'white' }} />}
              suffix="anos"
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '28px' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Informações detalhadas */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CarOutlined style={{ color: '#8B5CF6' }} />
                <span>Informações do Veículo</span>
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
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>Placa</Text>
                    <div>
                      <Text strong style={{ fontSize: '18px', color: '#F9FAFB', fontFamily: 'monospace' }}>
                        {vehicle.plate}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>Status</Text>
                    <div>
                      {vehicle.status === "active" ? (
                        <Tag 
                          color="green" 
                          icon={<CheckCircleOutlined />}
                          style={{ margin: 0, fontSize: '12px' }}
                        >
                          Ativo
                        </Tag>
                      ) : (
                        <Tag color="default" style={{ margin: 0, fontSize: '12px' }}>
                          Vendido
                        </Tag>
                      )}
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>Marca/Modelo</Text>
                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                        {vehicle.brand} {vehicle.model}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>Ano</Text>
                    <div>
                      <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                        {vehicle.year}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
              
              <Row gutter={[16, 16]}>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>Cor</Text>
                    <div>
                      <Space>
                        <div 
                          style={{ 
                            width: '16px',
                            height: '16px',
                            backgroundColor: '#8B5CF6',
                            borderRadius: '50%',
                            border: '2px solid #374151'
                          }} 
                        />
                        <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                          {vehicle.color}
                        </Text>
                      </Space>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>RENAVAM</Text>
                    <div>
                      <Text style={{ fontSize: '16px', color: '#F9FAFB', fontFamily: 'monospace' }}>
                        {vehicle.renavam}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <ToolOutlined style={{ color: '#8B5CF6' }} />
                <span>Status dos Serviços</span>
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
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Último serviço</Text>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                    {getLastServiceDate()}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Próximo serviço estimado</Text>
                <div>
                  <Text strong style={{ fontSize: '16px', color: '#F9FAFB' }}>
                    {getNextServiceEstimate()}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Progresso de manutenção</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={Math.min((events.length / 10) * 100, 100)} 
                    strokeColor={{
                      '0%': '#8B5CF6',
                      '100%': '#A78BFA'
                    }}
                    trailColor="#374151"
                    size="small"
                  />
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Timeline de eventos recentes */}
      <Card 
        title={
          <Space>
            <CalendarOutlined style={{ color: '#8B5CF6' }} />
            <span>Histórico Recente</span>
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
        <Timeline
          style={{ marginTop: '16px' }}
          items={sortedEvents.slice(0, 5).map((e) => {
            const config = getChainStatusConfig(e.blockchainStatus)
            return {
              color: config.timelineColor,
              children: (
                <div style={{ padding: '8px 0' }}>
                  <Space direction="vertical" size="small" style={{ width: '100%' }}>
                    <div>
                      <Text strong style={{ color: '#F9FAFB', fontSize: '14px' }}>
                        {getVehicleEventTypeLabel(e.type)} • {e.category}
                      </Text>
                      <Tag 
                        color={config.color} 
                        style={{ marginLeft: '8px', fontSize: '11px' }}
                      >
                        {config.label}
                      </Tag>
                    </div>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                      {formatBRDate(e.date)} • {kmFormat(e.mileage)} • R$ {(e.cost || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </Text>
                    <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                      {e.location}
                    </Text>
                  </Space>
                </div>
              ),
            }
          })}
        />
      </Card>
    </Space>
  )
}