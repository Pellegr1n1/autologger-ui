import { useState, useEffect } from 'react';
import { Space, Typography, Table, Button, Tag, Spin, message, Modal, Tooltip } from 'antd';
import { 
  LinkOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  BlockOutlined,
  EyeOutlined,
  CopyOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { BlockchainService } from '../services/blockchainService';

const { Text } = Typography;

interface Transaction {
  id: string;
  hash: string | null;
  status: 'CONFIRMED' | 'PENDING' | 'FAILED' | 'SUBMITTED';
  category: string;
  description?: string;
  location: string;
  date: string;
  mileage: number;
  blockNumber?: number;
  vehicleId?: string;
  vehicle?: {
    brand?: string;
    model?: string;
    plate?: string;
  };
}

export default function TransactionHistory() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hashModalVisible, setHashModalVisible] = useState(false);
  const [selectedHash, setSelectedHash] = useState<string | null>(null);

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
          description: s.description || '',
          location: s.location || '—',
          date: s.createdAt || s.blockchainConfirmedAt || s.serviceDate,
          mileage: s.mileage || 0,
          blockNumber: s.blockNumber,
          vehicleId: s.vehicleId,
          vehicle: s.vehicle,
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
          color: '#389e0d',
          icon: <CheckCircleOutlined />,
          label: 'Confirmada',
          timelineColor: '#389e0d'
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
          icon: <BlockOutlined />,
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

  const formatDate = (dateString: string | Date) => {
    if (!dateString) return '—';
    
    let date: Date;
    if (typeof dateString === 'string') {
      // Tratar datas no formato ISO
      const dateStr = dateString.split('T')[0];
      const [year, month, day] = dateStr.split('-').map(Number);
      
      if (year && month && day) {
        // Criar data no meio do dia para evitar problemas de fuso horário
        date = new Date(year, month - 1, day, 12, 0, 0, 0);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = dateString;
    }
    
    if (isNaN(date.getTime())) {
      return 'Data inválida';
    }
    
    // Formatar data no formato brasileiro sem hora
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  };

  const shortenHash = (hash: string) => {
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 6)}`;
  };

  const handleViewHash = (hash: string) => {
    setSelectedHash(hash);
    setHashModalVisible(true);
  };

  const handleCopyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      message.success('Hash copiado para área de transferência');
    } catch {
      message.info(hash);
    }
  };

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Veículo',
      key: 'vehicle',
      align: 'left',
      render: (_: any, record: Transaction) => {
        if (record.vehicle) {
          const vehicleName = `${record.vehicle.brand || ''} ${record.vehicle.model || ''}`.trim();
          const plate = record.vehicle.plate || '';
          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {vehicleName && (
                <Text strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                  {vehicleName}
                </Text>
              )}
              {plate && (
                <Text style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                  {plate}
                </Text>
              )}
              {!vehicleName && !plate && (
                <Text style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px' }}>
                  —
                </Text>
              )}
            </div>
          );
        }
        return (
          <Text style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '12px' }}>
            —
          </Text>
        );
      },
    },
    {
      title: 'Serviço',
      dataIndex: 'category',
      key: 'category',
      align: 'left',
      render: (text: string, record: Transaction) => {
        const config = getStatusConfig(record.status);
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <Text strong style={{ color: 'var(--text-primary)', fontSize: '14px' }}>
                {text}
              </Text>
              <Tag 
                color={config.color} 
                icon={config.icon}
                style={{ fontSize: '11px', margin: 0 }}
              >
                {config.label}
              </Tag>
            </div>
            {record.description && (
              <Text 
                style={{ 
                  color: 'var(--text-secondary)', 
                  fontSize: '12px',
                  display: 'block',
                  lineHeight: '1.4',
                  maxWidth: '400px'
                }}
                ellipsis={{ tooltip: record.description }}
              >
                {record.description}
              </Text>
            )}
            {record.mileage > 0 && (
              <Text style={{ color: 'var(--text-secondary)', fontSize: '11px' }}>
                {record.mileage.toLocaleString('pt-BR')} km
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Data',
      dataIndex: 'date',
      key: 'date',
      align: 'left',
      render: (date: string) => (
        <Text style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
          {formatDate(date)}
        </Text>
      ),
      sorter: (a: Transaction, b: Transaction) => {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      },
      defaultSortOrder: 'descend',
    },
    {
      title: 'Status Blockchain',
      key: 'blockchain',
      align: 'left',
      render: (_: any, record: Transaction) => {
        if (record.status === 'CONFIRMED' && record.hash) {
          return (
            <Space direction="vertical" size={4} style={{ width: '100%' }}>
              <Tag color="success" icon={<CheckCircleOutlined />} style={{ margin: 0 }}>
                Protegido
              </Tag>
              <Tooltip title="Clique para ver detalhes do hash">
                <Button 
                  type="link" 
                  size="small" 
                  icon={<EyeOutlined />}
                  style={{ 
                    color: 'var(--primary-color)',
                    padding: '0',
                    height: 'auto',
                    fontSize: '11px',
                    lineHeight: '1'
                  }}
                  onClick={() => handleViewHash(record.hash!)}
                >
                  {shortenHash(record.hash)}
                </Button>
              </Tooltip>
            </Space>
          );
        }
        return (
          <Text style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
            Aguardando...
          </Text>
        );
      },
    },
  ];

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

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        pagination={{
          pageSize: 5,
          showSizeChanger: false,
          showTotal: (total) => `Total: ${total} transações`,
          style: { marginTop: '16px' }
        }}
        style={{
          background: 'var(--surface-color)',
          borderRadius: '12px',
          overflow: 'hidden'
        }}
        className="professionalTable"
      />

      {/* Modal de Detalhes do Hash */}
      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: 'var(--success-color)' }} />
            <span>Hash Blockchain</span>
          </Space>
        }
        open={hashModalVisible}
        onCancel={() => setHashModalVisible(false)}
        footer={[
          <Button 
            key="copy"
            type="primary"
            icon={<CopyOutlined />}
            onClick={() => selectedHash && handleCopyHash(selectedHash)}
          >
            Copiar Hash
          </Button>,
          <Button key="close" onClick={() => setHashModalVisible(false)}>
            Fechar
          </Button>
        ]}
        width={600}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%', marginTop: '16px' }}>
          <div>
            <Text strong style={{ color: 'var(--text-secondary)', fontSize: '12px', display: 'block', marginBottom: '8px' }}>
              Hash Completo:
            </Text>
            <Text 
              code 
              style={{ 
                color: 'var(--text-primary)', 
                fontSize: '13px',
                wordBreak: 'break-all',
                display: 'block',
                padding: '12px',
                background: 'rgba(167, 139, 250, 0.05)',
                borderRadius: '8px',
                border: '1px solid rgba(167, 139, 250, 0.1)'
              }}
            >
              {selectedHash}
            </Text>
          </div>
          
          <div style={{ 
            padding: '12px', 
            background: 'rgba(82, 196, 26, 0.05)', 
            borderRadius: '8px',
            border: '1px solid rgba(82, 196, 26, 0.2)'
          }}>
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
              <Text strong style={{ color: 'var(--text-primary)', fontSize: '13px' }}>
                O que é este hash?
              </Text>
              <Text style={{ color: 'var(--text-secondary)', fontSize: '12px', lineHeight: '1.6' }}>
                Este hash é a assinatura única do seu registro na blockchain. Ele prova que:
              </Text>
              <ul style={{ margin: '8px 0 0 20px', padding: 0, color: 'var(--text-secondary)', fontSize: '12px' }}>
                <li>O registro está protegido na blockchain</li>
                <li>Não pode ser alterado ou deletado</li>
                <li>Pode ser verificado por qualquer pessoa que tenha o hash</li>
              </ul>
            </Space>
          </div>
        </Space>
      </Modal>
    </Space>
  );
}
