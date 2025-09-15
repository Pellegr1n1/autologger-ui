import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, Space, Typography, Button, message, Spin } from 'antd';
import { 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  ReloadOutlined,
  LinkOutlined
} from '@ant-design/icons';
import { BlockchainService } from '../../../services/api/blockchainService';

const { Text } = Typography;

interface ServiceRecord {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  serviceDate: string;
  cost: number;
  status: 'PENDING' | 'CONFIRMED' | 'FAILED';
  blockchainHash?: string;
  transactionHash?: string;
}

interface UserServicesStatusProps {
  userId?: string;
}

export default function UserServicesStatus({ userId }: UserServicesStatusProps) {
  const [services, setServices] = useState<ServiceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      // Carregar todos os serviços (em um cenário real, filtraria por userId)
      const allServices = await BlockchainService.getAllServices();
      
      // Converter para formato local
      const formattedServices: ServiceRecord[] = allServices.map((service: any) => ({
        id: service.id || service.serviceId,
        vehicleId: service.vehicleId,
        type: service.type || 'MANUTENCAO',
        description: service.description,
        serviceDate: service.serviceDate || service.createdAt,
        cost: service.cost || 0,
        status: service.status || 'PENDING',
        blockchainHash: service.blockchainHash,
        transactionHash: service.transactionHash
      }));

      setServices(formattedServices);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      message.error('Erro ao carregar serviços do usuário');
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshServices = async () => {
    setRefreshing(true);
    await loadServices();
    setRefreshing(false);
    message.success('Serviços atualizados com sucesso!');
  };

  const verifyServiceInBlockchain = async (serviceId: string) => {
    try {
      const status = await BlockchainService.getServiceStatus(serviceId);
      
      if (status.status === 'CONFIRMED') {
        message.success('Serviço confirmado na blockchain!');
      } else if (status.status === 'FAILED') {
        message.error('Serviço não encontrado na blockchain');
      } else {
        message.warning('Serviço ainda pendente na blockchain');
      }
      
      // Recarregar serviços para atualizar status
      await loadServices();
    } catch (error) {
      console.error('Erro ao verificar serviço:', error);
      message.error('Erro ao verificar serviço na blockchain');
    }
  };

  useEffect(() => {
    loadServices();
  }, [userId]);

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            Confirmado
          </Tag>
        );
      case 'PENDING':
        return (
          <Tag color="warning" icon={<ClockCircleOutlined />}>
            Pendente
          </Tag>
        );
      case 'FAILED':
        return (
          <Tag color="error" icon={<ExclamationCircleOutlined />}>
            Falhou
          </Tag>
        );
      default:
        return (
          <Tag color="default">
            Desconhecido
          </Tag>
        );
    }
  };

  const columns = [
    {
      title: 'ID do Serviço',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => (
        <Text code style={{ fontSize: '12px' }}>
          {id.substring(0, 8)}...
        </Text>
      ),
    },
    {
      title: 'Veículo',
      dataIndex: 'vehicleId',
      key: 'vehicleId',
      width: 100,
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: string) => (
        <Tag color="blue">
          {type}
        </Tag>
      ),
    },
    {
      title: 'Descrição',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Custo',
      dataIndex: 'cost',
      key: 'cost',
      width: 100,
      render: (cost: number) => (
        <Text strong>
          R$ {cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Text>
      ),
    },
    {
      title: 'Status Blockchain',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ações',
      key: 'actions',
      width: 120,
      render: (record: ServiceRecord) => (
        <Space size="small">
          <Button
            size="small"
            icon={<LinkOutlined />}
            onClick={() => verifyServiceInBlockchain(record.id)}
            title="Verificar na blockchain"
          />
        </Space>
      ),
    },
  ];

  return (
    <Card
      title={
        <Space>
          <LinkOutlined style={{ color: 'var(--primary-color)' }} />
          Serviços do Usuário na Blockchain
        </Space>
      }
      extra={
        <Button
          icon={<ReloadOutlined />}
          onClick={refreshServices}
          loading={refreshing}
          size="small"
        >
          Atualizar
        </Button>
      }
    >
      <Spin spinning={loading}>
        {services.length > 0 ? (
          <Table
            columns={columns}
            dataSource={services}
            rowKey="id"
            size="small"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} de ${total} serviços`,
            }}
            scroll={{ x: 800 }}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text style={{ color: 'var(--text-secondary)' }}>
              Nenhum serviço encontrado
            </Text>
          </div>
        )}
      </Spin>

      {/* Estatísticas resumidas */}
      {services.length > 0 && (
        <div style={{ marginTop: '16px', padding: '16px', backgroundColor: 'var(--background-secondary)', borderRadius: '8px' }}>
          <Space size="large">
            <Text strong>
              Total: {services.length} serviços
            </Text>
            <Text style={{ color: 'var(--success-color)' }}>
              Confirmados: {services.filter(s => s.status === 'CONFIRMED').length}
            </Text>
            <Text style={{ color: 'var(--warning-color)' }}>
              Pendentes: {services.filter(s => s.status === 'PENDING').length}
            </Text>
            <Text style={{ color: 'var(--error-color)' }}>
              Falharam: {services.filter(s => s.status === 'FAILED').length}
            </Text>
          </Space>
        </div>
      )}
    </Card>
  );
}
