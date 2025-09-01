import React, { useState, useEffect } from 'react';
import { Card, Space, Typography, Timeline, Button, Tag, Empty, Spin } from 'antd';
import { 
  LinkOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  BlockOutlined
} from '@ant-design/icons';

const { Text } = Typography;

interface Transaction {
  id: string;
  hash: string;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED' | 'SUBMITTED';
  category: string;
  location: string;
  date: string;
  mileage: number;
  gasPrice: string;
  blockNumber?: number;
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento de transações
    const loadTransactions = async () => {
      try {
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Dados simulados
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            hash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
            status: 'CONFIRMED',
            category: 'Abastecimento',
            location: 'Posto Ipiranga - SP',
            date: '2024-01-15T10:30:00Z',
            mileage: 45000,
            gasPrice: '0.000000000000000001',
            blockNumber: 12345678
          },
          {
            id: '2',
            hash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
            status: 'PENDING',
            category: 'Manutenção',
            location: 'Oficina Mecânica - RJ',
            date: '2024-01-14T15:45:00Z',
            mileage: 44800,
            gasPrice: '0.000000000000000002'
          },
          {
            id: '3',
            hash: '0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456',
            status: 'CONFIRMED',
            category: 'Troca de Óleo',
            location: 'Auto Center - MG',
            date: '2024-01-13T09:15:00Z',
            mileage: 44500,
            gasPrice: '0.000000000000000001',
            blockNumber: 12345675
          },
          {
            id: '4',
            hash: '0x4567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123',
            status: 'FAILED',
            category: 'Abastecimento',
            location: 'Posto Shell - SP',
            date: '2024-01-12T14:20:00Z',
            mileage: 44200,
            gasPrice: '0.000000000000000003'
          },
          {
            id: '5',
            hash: '0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc',
            status: 'SUBMITTED',
            category: 'Inspeção',
            location: 'DETRAN - SP',
            date: '2024-01-11T11:00:00Z',
            mileage: 44000,
            gasPrice: '0.000000000000000001'
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Erro ao carregar transações:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, []);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return {
          color: '#52c41a',
          icon: <CheckCircleOutlined />,
          label: 'Confirmada',
          timelineColor: '#52c41a'
        };
      case 'PENDING':
        return {
          color: '#faad14',
          icon: <ClockCircleOutlined />,
          label: 'Pendente',
          timelineColor: '#faad14'
        };
      case 'SUBMITTED':
        return {
          color: '#1890ff',
          icon: <ClockCircleOutlined />,
          label: 'Submetida',
          timelineColor: '#1890ff'
        };
      case 'FAILED':
        return {
          color: '#ff4d4f',
          icon: <ExclamationCircleOutlined />,
          label: 'Falhou',
          timelineColor: '#ff4d4f'
        };
      default:
        return {
          color: '#6b7280',
          icon: <BlockOutlined />,
          label: 'Desconhecido',
          timelineColor: '#6b7280'
        };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const shortenHash = (hash: string) => {
    return `${hash.substring(0, 6)}...${hash.substring(hash.length - 4)}`;
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text style={{ color: 'var(--text-secondary)' }}>Carregando transações...</Text>
        </div>
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <div style={{ padding: '32px', textAlign: 'center' }}>
        <BlockOutlined style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '16px' }} />
        <Text style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '16px', marginBottom: '8px' }}>
          Nenhuma transação registrada
        </Text>
        <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          As transações aparecerão aqui quando forem processadas na blockchain
        </Text>
      </div>
    );
  }

  return (
    <Space direction="vertical" size="large" style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text strong style={{ color: 'var(--text-primary)', fontSize: '16px' }}>
          Últimas Transações ({transactions.length})
        </Text>
        <Button 
          type="link" 
          icon={<LinkOutlined />}
          style={{ color: 'var(--primary-color)' }}
        >
          Ver todas
        </Button>
      </div>

      <Timeline
        style={{ marginTop: '16px' }}
        items={transactions.map((tx) => {
          const config = getStatusConfig(tx.status);
          return {
            color: config.timelineColor,
            children: (
              <div style={{ padding: '12px 0' }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <Text strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                        {tx.category} • {tx.location}
                      </Text>
                      <Tag 
                        color={config.color} 
                        icon={config.icon}
                        style={{ marginLeft: '8px', fontSize: '11px' }}
                      >
                        {config.label}
                      </Tag>
                    </div>
                    <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                      {formatDate(tx.date)}
                    </Text>
                  </div>
                  
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                    Quilometragem: {tx.mileage.toLocaleString('pt-BR')} km
                  </Text>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <Text code style={{ fontSize: '11px', color: 'var(--primary-color)' }}>
                        {shortenHash(tx.hash)}
                      </Text>
                      {tx.blockNumber && (
                        <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginLeft: '8px' }}>
                          Bloco #{tx.blockNumber}
                        </Text>
                      )}
                    </div>
                    <Button 
                      type="link" 
                      size="small" 
                      icon={<LinkOutlined />}
                      style={{ 
                        color: 'var(--primary-color)',
                        padding: '0 8px',
                        height: 'auto'
                      }}
                      onClick={() => window.open(`https://sepolia.etherscan.io/tx/${tx.hash}`, '_blank')}
                    >
                      Ver no explorer
                    </Button>
                  </div>
                  
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    Gas Price: {tx.gasPrice} ETH
                  </Text>
                </Space>
              </div>
            ),
          };
        })}
      />
    </Space>
  );
}
