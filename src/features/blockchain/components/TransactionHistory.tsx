import { useState, useEffect } from 'react';
import { Space, Typography, Timeline, Button, Tag, Spin, message } from 'antd';
import { 
  LinkOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  BlockOutlined
} from '@ant-design/icons';
import { BlockchainService } from '../../../services/api/blockchainService';

const { Text } = Typography;

interface Transaction {
  id: string;
  hash: string | null;
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
  const [refreshing, setRefreshing] = useState(false);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const services = await BlockchainService.getAllServices();

      const mapped: Transaction[] = (services || [])
        .map((s: any) => ({
          id: s.id || s.serviceId,
          hash: s.transactionHash || s.blockchainHash || null,
          status: (s.status || 'PENDING') as Transaction['status'],
          category: s.category || s.type || 'SERVICO',
          location: s.location || '—',
          date: s.serviceDate || s.createdAt,
          mileage: s.mileage || 0,
          gasPrice: s.gasPrice || '-',
          blockNumber: s.blockNumber,
        }))
        .filter((tx: Transaction) => tx.hash); // Apenas transações com hash real

      setTransactions(mapped);
    } catch (error) {
      console.error('Erro ao carregar transações:', error);
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  const refresh = async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
    message.success('Transações atualizadas');
  };

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
          loading={refreshing}
          onClick={refresh}
        >
          Atualizar
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
                      {tx.hash ? (
                        <>
                          <Text code style={{ fontSize: '11px', color: 'var(--primary-color)' }}>
                            {shortenHash(tx.hash)}
                          </Text>
                          {tx.blockNumber && (
                            <Text style={{ color: 'var(--text-secondary)', fontSize: '11px', marginLeft: '8px' }}>
                              Bloco #{tx.blockNumber}
                            </Text>
                          )}
                        </>
                      ) : (
                        <Text style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                          Sem hash blockchain
                        </Text>
                      )}
                    </div>
                    {tx.hash && (
                      <Button 
                        type="link" 
                        size="small" 
                        icon={<LinkOutlined />}
                        style={{ 
                          color: 'var(--primary-color)',
                          padding: '0 8px',
                          height: 'auto'
                        }}
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(tx.hash!);
                            message.success('Hash copiado');
                          } catch {
                            message.info(tx.hash!);
                          }
                        }}
                      >
                        Copiar hash
                      </Button>
                    )}
                  </div>
                  
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                    Gas Price: {tx.gasPrice}
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
