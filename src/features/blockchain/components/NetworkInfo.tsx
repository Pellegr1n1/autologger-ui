import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Row, Col, Tag, Divider, Button } from 'antd';
import { 
  GlobalOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  LinkOutlined,
  SettingOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { BlockchainService } from '../../../services/api/blockchainService';

const { Text } = Typography;

interface NetworkInfoData {
  name: string;
  chainId: number;
  rpcUrl?: string;
  explorerUrl?: string;
  status: 'connected' | 'disconnected' | 'connecting';
  lastBlock: number;
  gasPrice: string;
  networkType: 'private' | 'testnet' | 'mainnet';
}

export default function NetworkInfo() {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfoData>({
    name: 'Besu Private Network',
    chainId: 0,
    status: 'connecting',
    lastBlock: 0,
    gasPrice: '-',
    networkType: 'private'
  });

  const [loading, setLoading] = useState(false);

  const handleRefreshConnection = async () => {
    setLoading(true);
    try {
      const [status, info] = await Promise.all([
        BlockchainService.getBesuConnectionStatus(),
        BlockchainService.getBesuNetworkInfo().catch(() => null),
      ]);

      setNetworkInfo(prev => ({
        ...prev,
        name: 'Besu Private Network',
        chainId: info?.chainId ?? 0,
        lastBlock: info?.blockNumber ?? 0,
        gasPrice: info?.gasPrice ?? '-',
        status: status.connected ? 'connected' : 'disconnected',
        networkType: 'private'
      }));
    } catch (error) {
      setNetworkInfo(prev => ({
        ...prev,
        status: 'disconnected'
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleRefreshConnection();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'connected':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Conectado',
          description: 'Conexão ativa com a rede Besu'
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
          description: 'Sem conexão com a rede Besu'
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
                color={networkInfo.networkType === 'private' ? 'purple' : networkInfo.networkType === 'testnet' ? 'blue' : 'green'}
                style={{ marginLeft: '8px' }}
              >
                {networkInfo.networkType === 'private' ? 'Private' : networkInfo.networkType === 'testnet' ? 'Testnet' : 'Mainnet'}
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
                    {networkInfo.gasPrice}
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
            <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>RPC HTTP</Text>
            <div style={{ marginTop: '8px' }}>
              <Text code style={{ color: 'var(--text-primary)', fontSize: '12px' }}>
                http://localhost:8545
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    </Space>
  );
}
