import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Row, Col, Tag, Divider, Button, Alert } from 'antd';
import { 
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';

const { Text, Title } = Typography;

interface NetworkInfo {
  name: string;
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastBlock: number;
  gasPrice: string;
  networkType: 'testnet' | 'mainnet';
}

export default function NetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    name: 'Sepolia Testnet',
    chainId: 11155111,
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR-PROJECT-ID',
    explorerUrl: 'https://sepolia.etherscan.io',
    status: 'connected',
    lastBlock: 12345678,
    gasPrice: '0.000000000000000001',
    networkType: 'testnet'
  });

  const [loading, setLoading] = useState(false);

  const handleRefreshConnection = async () => {
    setLoading(true);
    try {
      // Simular verificação de conexão
      await new Promise(resolve => setTimeout(resolve, 2000));
      setNetworkInfo(prev => ({
        ...prev,
        lastBlock: prev.lastBlock + 1,
        gasPrice: '0.000000000000000002'
      }));
    } catch (error) {
      console.error('Erro ao atualizar conexão:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Conectado',
          description: 'Conexão ativa e funcionando normalmente'
        };
      case 'connecting':
        return {
          color: 'warning',
          icon: <ExclamationCircleOutlined />,
          text: 'Conectando...',
          description: 'Estabelecendo conexão com a rede'
        };
      case 'disconnected':
        return {
          color: 'error',
          icon: <ExclamationCircleOutlined />,
          text: 'Desconectado',
          description: 'Sem conexão com a rede blockchain'
        };
      default:
        return {
          color: 'default',
          icon: <InfoCircleOutlined />,
          text: 'Desconhecido',
          description: 'Status da conexão não disponível'
        };
    }
  };

  const statusConfig = getStatusConfig(networkInfo.status);

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      {/* Status da Rede */}
      <Card 
        title={
          <Space>
            <GlobalOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Status da Rede</span>
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
        extra={
          <Button 
            type="primary" 
            size="small"
            icon={<LinkOutlined />}
            loading={loading}
            onClick={handleRefreshConnection}
          >
            Atualizar
          </Button>
        }
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <Text strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
                {networkInfo.name}
              </Text>
              <Tag 
                color={networkInfo.networkType === 'testnet' ? 'blue' : 'green'}
                style={{ marginLeft: '8px' }}
              >
                {networkInfo.networkType === 'testnet' ? 'Testnet' : 'Mainnet'}
              </Tag>
            </div>
            <Tag 
              color={statusConfig.color} 
              icon={statusConfig.icon}
              style={{ fontSize: '12px' }}
            >
              {statusConfig.text}
            </Tag>
          </div>
          
          <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
            {statusConfig.description}
          </Text>
          
          <Divider style={{ margin: '16px 0', borderColor: 'var(--border-color)' }} />
          
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Chain ID</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text code style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    {networkInfo.chainId}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Último Bloco</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    #{networkInfo.lastBlock.toLocaleString('pt-BR')}
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Gas Price</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                    {networkInfo.gasPrice} ETH
                  </Text>
                </div>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div>
                <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>RPC URL</Text>
                <div style={{ marginTop: '4px' }}>
                  <Text code style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                    {networkInfo.rpcUrl}
                  </Text>
                </div>
              </div>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Configurações da Rede */}
      <Card 
        title={
          <Space>
            <SettingOutlined style={{ color: 'var(--primary-color)' }} />
            <span>Configurações da Rede</span>
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
            <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Explorer da Rede</Text>
            <div style={{ marginTop: '8px' }}>
              <Button 
                type="link" 
                icon={<LinkOutlined />}
                style={{ padding: '0', color: 'var(--primary-color)' }}
                onClick={() => window.open(networkInfo.explorerUrl, '_blank')}
              >
                {networkInfo.explorerUrl}
              </Button>
            </div>
          </div>
          
          <div>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>Contrato Inteligente</Text>
            <div style={{ marginTop: '8px' }}>
              <Text code style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                0x1234567890abcdef1234567890abcdef12345678
              </Text>
              <Button 
                type="link" 
                size="small"
                icon={<LinkOutlined />}
                style={{ marginLeft: '8px', padding: '0', color: 'var(--primary-color)' }}
                onClick={() => window.open(`${networkInfo.explorerUrl}/address/0x1234567890abcdef1234567890abcdef12345678`, '_blank')}
              >
                Ver contrato
              </Button>
            </div>
          </div>
        </Space>
      </Card>

      {/* Alertas e Informações */}
      <Alert
        message="Informações Importantes"
        description={
          <div>
            <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              Esta funcionalidade integra com sua API/contrato inteligente para mostrar status em tempo real das transações.
              Configure a rede (Sepolia, por exemplo) e as chaves de API necessárias.
            </Text>
            <div style={{ marginTop: '12px' }}>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                • Certifique-se de que sua chave de API está configurada corretamente
              </Text>
              <br />
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                • A rede Sepolia é recomendada para testes
              </Text>
              <br />
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                • Monitore o gas price para otimizar custos de transação
              </Text>
            </div>
          </div>
        }
        type="info"
        showIcon
        style={{ 
          borderRadius: '12px',
          border: '1px solid var(--border-color)',
          background: 'var(--surface-color)'
        }}
      />
    </Space>
  );
}
