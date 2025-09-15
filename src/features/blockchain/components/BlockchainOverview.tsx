import { Card, Space, Row, Col, Typography, Progress, Tag, Divider } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  SafetyCertificateOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface BlockchainData {
  totalTransactions: number;
  confirmedTransactions: number;
  pendingTransactions: number;
  failedTransactions: number;
  reliabilityScore: number;
  networkStatus: string;
}

interface BesuData {
  connectionStatus: boolean;
  networkInfo: any;
  contractStats: any;
  error: string | null;
}

interface BlockchainOverviewProps {
  data: BlockchainData;
  besuData?: BesuData;
}

export default function BlockchainOverview({ data, besuData }: BlockchainOverviewProps) {
  const { 
    totalTransactions, 
    confirmedTransactions, 
    pendingTransactions, 
    failedTransactions, 
    reliabilityScore 
  } = data;

  const confirmedPercentage = totalTransactions > 0 ? (confirmedTransactions / totalTransactions) * 100 : 0;
  const pendingPercentage = totalTransactions > 0 ? (pendingTransactions / totalTransactions) * 100 : 0;
  const failedPercentage = totalTransactions > 0 ? (failedTransactions / totalTransactions) * 100 : 0;

  const getReliabilityStatus = (score: number) => {
    if (score >= 90) return { color: 'success', text: 'Excelente', icon: <CheckCircleOutlined /> };
    if (score >= 70) return { color: 'warning', text: 'Bom', icon: <ClockCircleOutlined /> };
    return { color: 'error', text: 'Necessita atenção', icon: <ExclamationCircleOutlined /> };
  };

  const reliabilityStatus = getReliabilityStatus(reliabilityScore);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Cards de estatísticas detalhadas */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CheckCircleOutlined style={{ color: '#52c41a' }} />
                <span>Status das Transações</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)'
            }}
            headStyle={{ 
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)'
            }}
            bodyStyle={{ background: 'var(--surface-color)' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Transações confirmadas</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={confirmedPercentage} 
                    strokeColor="#52c41a"
                    trailColor="var(--border-color)"
                    size="small"
                  />
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  {confirmedTransactions} de {totalTransactions} transações
                </Text>
              </div>
              
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Transações pendentes</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={pendingPercentage} 
                    strokeColor="#faad14"
                    trailColor="var(--border-color)"
                    size="small"
                  />
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  {pendingTransactions} de {totalTransactions} transações
                </Text>
              </div>
              
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Transações falharam</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={failedPercentage} 
                    strokeColor="#ff4d4f"
                    trailColor="var(--border-color)"
                    size="small"
                  />
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  {failedTransactions} de {totalTransactions} transações
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: 'var(--primary-color)' }} />
                <span>Análise de Segurança</span>
              </Space>
            }
            style={{ 
              borderRadius: '16px',
              border: '1px solid var(--border-color)',
              background: 'var(--surface-color)'
            }}
            headStyle={{ 
              borderBottom: '1px solid var(--border-color)',
              background: 'var(--surface-color)',
              color: 'var(--text-primary)'
            }}
            bodyStyle={{ background: 'var(--surface-color)' }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Score de confiabilidade</Text>
                <div style={{ marginTop: '8px' }}>
                  <Progress 
                    percent={reliabilityScore} 
                    strokeColor={{
                      '0%': 'var(--primary-color)',
                      '100%': 'var(--primary-color)'
                    }}
                    trailColor="var(--border-color)"
                    size="small"
                  />
                </div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginTop: '4px' }}>
                  {reliabilityStatus.text}
                </Text>
              </div>
              
              <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
              
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Status do sistema</Text>
                <div style={{ marginTop: '8px' }}>
                  <Tag color={reliabilityStatus.color} icon={reliabilityStatus.icon}>
                    {reliabilityStatus.text}
                  </Tag>
                </div>
              </div>
              
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Taxa de sucesso</Text>
                <div style={{ marginTop: '8px' }}>
                  <Text strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
                    {((confirmedTransactions / totalTransactions) * 100).toFixed(1)}%
                  </Text>
                </div>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Informações adicionais */}
      <Card 
        title="Resumo da Rede"
        style={{ 
          borderRadius: '16px',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-color)'
        }}
        headStyle={{ 
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--surface-color)',
          color: 'var(--text-primary)'
        }}
        bodyStyle={{ background: 'var(--surface-color)' }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Tempo médio de confirmação</Text>
              <div style={{ marginTop: '8px' }}>
                <Text strong style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
                  2.3s
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Última sincronização</Text>
              <div style={{ marginTop: '8px' }}>
                <Text strong style={{ color: 'var(--text-primary)', fontSize: '18px' }}>
                  Agora
                </Text>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={8}>
            <div style={{ textAlign: 'center' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Status da conexão</Text>
              <div style={{ marginTop: '8px' }}>
                <Tag color="success" icon={<CheckCircleOutlined />}>
                  Ativo
                </Tag>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Informações da Rede Besu */}
      {besuData && (
        <>
          <Divider orientation="left" style={{ color: 'var(--text-primary)' }}>
            Informações da Rede Besu
          </Divider>
          
          <Card>
            <Row gutter={[24, 24]}>
              <Col xs={24} lg={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ color: 'var(--text-primary)' }}>
                      Status da Conexão
                    </Text>
                    <div style={{ marginTop: '8px' }}>
                      <Tag 
                        color={besuData.connectionStatus ? 'success' : 'error'}
                        icon={besuData.connectionStatus ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                      >
                        {besuData.connectionStatus ? 'Conectado' : 'Desconectado'}
                      </Tag>
                    </div>
                  </div>
                  
                  {besuData.networkInfo && (
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)' }}>
                        Informações da Rede
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space direction="vertical" size="small">
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Chain ID:</strong> {besuData.networkInfo.chainId}
                          </Text>
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Bloco Atual:</strong> {besuData.networkInfo.blockNumber.toLocaleString()}
                          </Text>
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Gas Price:</strong> {besuData.networkInfo.gasPrice} gwei
                          </Text>
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Rede:</strong> {besuData.networkInfo.networkName}
                          </Text>
                        </Space>
                      </div>
                    </div>
                  )}
                </Space>
              </Col>
              
              <Col xs={24} lg={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  {besuData.contractStats && (
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)' }}>
                        Estatísticas do Contrato
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Space direction="vertical" size="small">
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Total de Hashes:</strong> {besuData.contractStats.totalHashes.toLocaleString()}
                          </Text>
                          <Text style={{ color: 'var(--text-secondary)' }}>
                            <strong>Saldo do Contrato:</strong> {besuData.contractStats.contractBalance} ETH
                          </Text>
                        </Space>
                      </div>
                    </div>
                  )}
                  
                  {besuData.error && (
                    <div>
                      <Text strong style={{ color: 'var(--error-color)' }}>
                        Erro de Conexão
                      </Text>
                      <div style={{ marginTop: '8px' }}>
                        <Tag color="error" icon={<ExclamationCircleOutlined />}>
                          {besuData.error}
                        </Tag>
                      </div>
                    </div>
                  )}
                </Space>
              </Col>
            </Row>
          </Card>
        </>
      )}
    </Space>
  );
}
