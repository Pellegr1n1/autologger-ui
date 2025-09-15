import React, { useState, useEffect } from 'react';
import { Card, Statistic, Row, Col, Typography, Badge, Space, Button, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  SyncOutlined,
  ReloadOutlined,
  GlobalOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import { BlockchainService, NetworkHealth } from '../../../services/api/blockchainService';
import componentStyles from '../../common/layout/styles/Components.module.css';

const { Text, Title } = Typography;

interface BlockchainStatusProps {
  refreshInterval?: number; // em milissegundos
}

export default function BlockchainStatus({ refreshInterval = 30000 }: BlockchainStatusProps) {
  const [networkHealth, setNetworkHealth] = useState<NetworkHealth | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const loadNetworkHealth = async () => {
    try {
      setLoading(true);
      const health = await BlockchainService.getNetworkHealth();
      setNetworkHealth(health);
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Erro ao carregar status da rede:', error);
      setNetworkHealth({
        status: 'UNHEALTHY',
        network: 'Unknown',
        error: 'Falha na conexão'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNetworkHealth();

    // Configurar atualização automática
    const interval = setInterval(loadNetworkHealth, refreshInterval);

    return () => clearInterval(interval);
  }, [refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'HEALTHY':
        return 'success';
      case 'UNHEALTHY':
        return 'error';
      case 'MOCK':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'HEALTHY':
        return <CheckCircleOutlined />;
      case 'UNHEALTHY':
        return <CloseCircleOutlined />;
      case 'MOCK':
        return <SyncOutlined />;
      default:
        return <CloseCircleOutlined />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'HEALTHY':
        return 'Conectado';
      case 'UNHEALTHY':
        return 'Desconectado';
      case 'MOCK':
        return 'Modo Simulação';
      default:
        return 'Desconhecido';
    }
  };

  const formatLastUpdate = (date: Date | null) => {
    if (!date) return 'Nunca';
    return date.toLocaleTimeString('pt-BR');
  };

  return (
    <Card 
      className={componentStyles.professionalCard}
      title={
        <Space>
          <GlobalOutlined style={{ color: 'var(--primary-color)' }} />
          <span>Status da Rede Blockchain</span>
        </Space>
      }
      extra={
        <Tooltip title="Atualizar status">
          <Button 
            type="text" 
            icon={<ReloadOutlined />} 
            onClick={loadNetworkHealth}
            loading={loading}
          />
        </Tooltip>
      }
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className={componentStyles.professionalStatistic}>
            <Statistic
              title="Status da Rede"
              value={getStatusText(networkHealth?.status || 'UNKNOWN')}
              prefix={
                <Badge 
                  status={getStatusColor(networkHealth?.status || 'UNKNOWN') as any}
                  icon={getStatusIcon(networkHealth?.status || 'UNKNOWN')}
                />
              }
              valueStyle={{ 
                color: networkHealth?.status === 'HEALTHY' ? 'var(--success-color)' : 'var(--error-color)' 
              }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className={componentStyles.professionalStatistic}>
            <Statistic
              title="Tipo de Rede"
              value={networkHealth?.network || 'Desconhecida'}
              prefix={<GlobalOutlined style={{ color: 'var(--primary-color)' }} />}
              valueStyle={{ color: 'var(--text-primary)' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className={componentStyles.professionalStatistic}>
            <Statistic
              title="Número do Bloco"
              value={networkHealth?.blockNumber || 0}
              prefix={<SafetyCertificateOutlined style={{ color: 'var(--primary-color)' }} />}
              valueStyle={{ color: 'var(--text-primary)' }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className={componentStyles.professionalStatistic}>
            <Statistic
              title="Peers Ativos"
              value={networkHealth?.peers || 0}
              prefix={<GlobalOutlined style={{ color: 'var(--primary-color)' }} />}
              valueStyle={{ color: 'var(--text-primary)' }}
            />
          </Card>
        </Col>
      </Row>

      {networkHealth?.totalServices !== undefined && (
        <Row style={{ marginTop: 16 }}>
          <Col span={24}>
            <Card className={componentStyles.professionalStatistic}>
              <Statistic
                title="Total de Serviços na Blockchain"
                value={networkHealth.totalServices}
                prefix={<SafetyCertificateOutlined style={{ color: 'var(--success-color)' }} />}
                valueStyle={{ color: 'var(--text-primary)' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div style={{ marginTop: 16, textAlign: 'center' }}>
        <Text type="secondary">
          Última atualização: {formatLastUpdate(lastUpdate)}
        </Text>
      </div>

      {networkHealth?.error && (
        <div style={{ marginTop: 16 }}>
          <Text type="danger">
            Erro: {networkHealth.error}
          </Text>
        </div>
      )}
    </Card>
  );
}
