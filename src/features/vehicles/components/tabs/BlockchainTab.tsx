import React from "react"
import { Badge, Button, Card, Col, Divider, Flex, Row, Space, Tag, Typography, Statistic, Progress, Timeline } from "antd"
import { 
  LinkOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  GlobalOutlined,
  BlockOutlined,
  SafetyCertificateOutlined
} from "@ant-design/icons"
import type { VehicleEvent } from "../../types/vehicle.types"
import { getChainStatusConfig } from "../../utils/helpers"
import { formatBRDate } from "../../../../utils/format"

const { Text, Title } = Typography

interface BlockchainTabProps {
  events: VehicleEvent[]
}

export default function BlockchainTab({ events }: BlockchainTabProps) {
  const sortedEvents = React.useMemo(() => 
    [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [events]
  )

  // Calcular estatísticas blockchain
  const confirmedEvents = events.filter((e) => e.blockchainStatus.status === "CONFIRMED");
  const pendingEvents = events.filter((e) => e.blockchainStatus.status === "PENDING");
  const submittedEvents = events.filter((e) => e.blockchainStatus.status === "SUBMITTED");
  const failedEvents = events.filter((e) => e.blockchainStatus.status === "FAILED");
  
  const totalEvents = events.length;
  const confirmedPercentage = totalEvents > 0 ? (confirmedEvents.length / totalEvents) * 100 : 0;
  const pendingPercentage = totalEvents > 0 ? (pendingEvents.length / totalEvents) * 100 : 0;
  const submittedPercentage = totalEvents > 0 ? (submittedEvents.length / totalEvents) * 100 : 0;

  // Calcular confiabilidade geral
  const reliabilityScore = Math.round((confirmedEvents.length / totalEvents) * 100);

  return (
    <Space direction="vertical" size="large" style={{ width: "100%" }}>
      {/* Cards de estatísticas blockchain */}
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={6}>
          <Card 
            style={{ 
              background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Confirmados</Text>}
              value={confirmedEvents.length}
              prefix={<CheckCircleOutlined style={{ color: 'white' }} />}
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
              background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Pendentes</Text>}
              value={pendingEvents.length}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
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
              background: 'linear-gradient(135deg, #1890ff 0%, #69c0ff 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Submetidos</Text>}
              value={submittedEvents.length}
              prefix={<ClockCircleOutlined style={{ color: 'white' }} />}
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
              background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
              border: 'none',
              borderRadius: '16px'
            }}
            bodyStyle={{ padding: '20px', textAlign: 'center' }}
          >
            <Statistic
              title={<Text style={{ color: 'white', fontSize: '12px' }}>Confiabilidade</Text>}
              value={reliabilityScore}
              prefix={<SafetyCertificateOutlined style={{ color: 'white' }} />}
              suffix="%"
              valueStyle={{ 
                color: 'white', 
                fontWeight: 700, 
                fontSize: '24px' 
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Análise detalhada */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <BlockOutlined style={{ color: '#8B5CF6' }} />
                <span>Status da Blockchain</span>
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
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Eventos confirmados</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={confirmedPercentage} 
                    strokeColor="#52c41a"
                    trailColor="#374151"
                    size="small"
                  />
                </div>
                <Text style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {confirmedEvents.length} de {totalEvents} eventos
                </Text>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Eventos pendentes</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={pendingPercentage} 
                    strokeColor="#faad14"
                    trailColor="#374151"
                    size="small"
                  />
                </div>
                <Text style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {pendingEvents.length} de {totalEvents} eventos
                </Text>
              </div>
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Eventos submetidos</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={submittedPercentage} 
                    strokeColor="#1890ff"
                    trailColor="#374151"
                    size="small"
                  />
                </div>
                <Text style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {submittedEvents.length} de {totalEvents} eventos
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#8B5CF6' }} />
                <span>Análise de Segurança</span>
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
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Score de confiabilidade</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={reliabilityScore} 
                    strokeColor={{
                      '0%': '#8B5CF6',
                      '100%': '#A78BFA'
                    }}
                    trailColor="#374151"
                    size="small"
                  />
                </div>
                <Text style={{ color: '#6B7280', fontSize: '11px', marginTop: '4px' }}>
                  {reliabilityScore >= 80 ? 'Excelente' : reliabilityScore >= 60 ? 'Bom' : 'Necessita atenção'}
                </Text>
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: '#374151' }} />
              
              <div>
                <Text style={{ color: '#6B7280', fontSize: '12px' }}>Recomendações</Text>
                <div style={{ marginTop: '8px' }}>
                  {reliabilityScore >= 80 ? (
                    <Tag color="success" icon={<CheckCircleOutlined />}>
                      Sistema seguro e confiável
                    </Tag>
                  ) : reliabilityScore >= 60 ? (
                    <Tag color="warning" icon={<ClockCircleOutlined />}>
                      Alguns eventos pendentes
                    </Tag>
                  ) : (
                    <Tag color="error" icon={<ClockCircleOutlined />}>
                      Necessita sincronização
                    </Tag>
                  )}
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Timeline de transações */}
      <Card 
        title={
          <Space>
            <LinkOutlined style={{ color: '#8B5CF6' }} />
            <span>Histórico de Transações</span>
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
        {events.filter((e) => e.hash).length > 0 ? (
          <Timeline
            style={{ marginTop: '16px' }}
            items={sortedEvents
              .filter((e) => e.hash)
              .slice(0, 10)
              .map((e) => {
                const config = getChainStatusConfig(e.blockchainStatus)
                return {
                  color: config.timelineColor,
                  children: (
                    <div style={{ padding: '12px 0' }}>
                      <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <div>
                          <Text strong style={{ color: '#F9FAFB', fontSize: '14px' }}>
                            {e.category} • {e.location}
                          </Text>
                          <Tag 
                            color={config.color} 
                            style={{ marginLeft: '8px', fontSize: '11px' }}
                          >
                            {config.label}
                          </Tag>
                        </div>
                        <Text style={{ color: '#6B7280', fontSize: '12px' }}>
                          {formatBRDate(e.date)} • {e.mileage} km
                        </Text>
                        <div>
                          <Text code style={{ fontSize: '11px', color: '#8B5CF6' }}>
                            {e.hash}
                          </Text>
                          <Button 
                            type="link" 
                            size="small" 
                            icon={<LinkOutlined />}
                            style={{ 
                              marginLeft: '8px', 
                              color: '#8B5CF6',
                              padding: '0 8px',
                              height: 'auto'
                            }}
                            onClick={() => window.open(`https://sepolia.etherscan.io/tx/${e.hash}`, '_blank')}
                          >
                            Ver no explorer
                          </Button>
                        </div>
                      </Space>
                    </div>
                  ),
                }
              })}
          />
        ) : (
          <div style={{ padding: '32px', textAlign: 'center' }}>
            <BlockOutlined style={{ fontSize: '48px', color: '#6B7280', marginBottom: '16px' }} />
            <Text style={{ display: 'block', color: '#6B7280', fontSize: '16px', marginBottom: '8px' }}>
              Nenhuma transação registrada
            </Text>
            <Text style={{ color: '#6B7280', fontSize: '14px' }}>
              Os eventos serão sincronizados com a blockchain quando disponíveis
            </Text>
          </div>
        )}
      </Card>

      {/* Informações técnicas */}
      <Card 
        title={
          <Space>
            <GlobalOutlined style={{ color: '#8B5CF6' }} />
            <span>Informações da Rede</span>
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
          <Text style={{ color: '#6B7280', fontSize: '14px' }}>
            Esta funcionalidade integra com sua API/contrato inteligente para mostrar status em tempo real das transações.
            Configure a rede (Sepolia, por exemplo) e as chaves de API necessárias.
          </Text>
          
          <div>
            <Text style={{ color: '#6B7280', fontSize: '12px' }}>Rede configurada</Text>
            <div>
              <Tag color="blue" style={{ margin: 0, fontSize: '12px' }}>
                Sepolia Testnet
              </Tag>
            </div>
          </div>
          
          <div>
            <Text style={{ color: '#6B7280', fontSize: '12px' }}>Status da conexão</Text>
            <div>
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0, fontSize: '12px' }}>
                Conectado
              </Tag>
            </div>
          </div>
        </Space>
      </Card>
    </Space>
  )
}