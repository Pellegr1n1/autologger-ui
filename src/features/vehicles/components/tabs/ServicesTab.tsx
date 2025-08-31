import React from "react"
import { Button, Card, Space, Table, Tag, Typography, Row, Col, Statistic, Progress } from "antd"
import { PlusOutlined, SettingOutlined, DollarOutlined, CalendarOutlined } from "@ant-design/icons"
import type { VehicleEvent } from "../../types/vehicle.types"
import { createEventColumns } from "../../utils/tableColumns"
import { currencyBRL, formatBRDate, kmFormat } from "../../../../utils/format"

const { Text, Title } = Typography

interface ServicesTabProps {
  events: VehicleEvent[]
  onEdit: (event: VehicleEvent) => void
  onDelete: (eventId: string) => void
  onAddService: () => void
}

export default function ServicesTab({ 
  events, 
  onEdit, 
  onDelete, 
  onAddService 
}: ServicesTabProps) {
  const sortedEvents = React.useMemo(() => 
    [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events]
  )

  const eventColumns = createEventColumns(onEdit, onDelete)

  // Calcular estatísticas
  const totalCost = events.reduce((sum, event) => sum + (event.cost || 0), 0);
  const maintenanceEvents = events.filter(e => e.type === 'maintenance').length;
  const fuelEvents = events.filter(e => e.type === 'fuel').length;
  const repairEvents = events.filter(e => e.type === 'repair').length;

  // Calcular próximo serviço estimado
  const getNextServiceEstimate = () => {
    if (events.length === 0) return 'Não disponível';
    const lastEvent = sortedEvents[0];
    const nextMileage = (lastEvent?.mileage || 0) + 5000;
    return `${kmFormat(nextMileage)} km`;
  };

  // Calcular média de gastos por mês
  const getAverageMonthlyCost = () => {
    if (events.length === 0) return 0;
    const monthsDiff = events.length > 1 ? 
      (new Date(sortedEvents[0].date).getTime() - new Date(sortedEvents[sortedEvents.length - 1].date).getTime()) / (1000 * 60 * 60 * 24 * 30) : 1;
    return totalCost / Math.max(monthsDiff, 1);
  };

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Cards de estatísticas */}
      <Row gutter={[24, 24]}>
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
              prefix={<SettingOutlined style={{ color: 'white' }} />}
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
              prefix={<SettingOutlined style={{ color: 'white' }} />}
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
      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card 
            title={
              <Space>
                <CalendarOutlined style={{ color: '#8B5CF6' }} />
                <span>Próximo Serviço</span>
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
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Estimativa</Text>
                <div>
                  <Text strong style={{ fontSize: '18px', color: '#F9FAFB' }}>
                    {getNextServiceEstimate()}
                  </Text>
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Média mensal</Text>
                <div>
                  <Text strong style={{ fontSize: '18px', color: '#F9FAFB' }}>
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
                <SettingOutlined style={{ color: '#8B5CF6' }} />
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
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Frequência de serviços</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={Math.min((events.length / 20) * 100, 100)} 
                    strokeColor={{
                      '0%': '#8B5CF6',
                      '100%': '#A78BFA'
                    }}
                    trailColor="#374151"
                    size="small"
                  />
                </div>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Último serviço</Text>
                <div>
                  <Text strong style={{ fontSize: '14px', color: '#F9FAFB' }}>
                    {events.length > 0 ? formatBRDate(sortedEvents[0].date) : 'Nunca'}
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
            <SettingOutlined style={{ color: '#8B5CF6' }} />
            <span>Histórico de Serviços</span>
          </Space>
        }
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={onAddService}
            style={{
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
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
        <Table
          size="middle"
          rowKey="id"
          dataSource={sortedEvents}
          columns={eventColumns}
          pagination={{ 
            pageSize: 10, 
            showLessItems: true,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} de ${total} serviços`
          }}
          style={{ background: '#1F2937' }}
        />
      </Card>
    </Space>
  )
}