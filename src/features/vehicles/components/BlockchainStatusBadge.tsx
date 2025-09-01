import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { ChainStatus } from '../types/blockchain.types';

interface BlockchainStatusBadgeProps {
  status: ChainStatus;
  showDetails?: boolean;
  size?: 'small' | 'default' | 'large';
}

const BlockchainStatusBadge: React.FC<BlockchainStatusBadgeProps> = ({
  status,
  showDetails = false,
  size = 'default'
}) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'processing',
          icon: <ClockCircleOutlined />,
          text: 'Pendente',
          description: 'Aguardando submissão para blockchain'
        };
      case 'SUBMITTED':
        return {
          color: 'processing',
          icon: <SyncOutlined spin />,
          text: 'Submetido',
          description: 'Enviado para blockchain, aguardando confirmação'
        };
      case 'CONFIRMED':
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Confirmado',
          description: 'Confirmado na blockchain - Imutável'
        };
      case 'FAILED':
        return {
          color: 'error',
          icon: <CloseCircleOutlined />,
          text: 'Falhou',
          description: 'Falha na transação blockchain'
        };
      case 'REVERTED':
        return {
          color: 'default',
          icon: <ExclamationCircleOutlined />,
          text: 'Revertido',
          description: 'Transação revertida na blockchain'
        };
      default:
        return {
          color: 'default',
          icon: <ExclamationCircleOutlined />,
          text: 'Desconhecido',
          description: 'Status desconhecido'
        };
    }
  };

  const statusConfig = getStatusConfig(status.status);
  const lastUpdate = new Date(status.lastUpdate).toLocaleString('pt-BR');

  const badge = (
    <Tag
      color={statusConfig.color}
      icon={statusConfig.icon}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: 500,
        borderRadius: '6px',
        padding: size === 'small' ? '2px 8px' : '4px 12px'
      }}
    >
      {statusConfig.text}
      {status.retryCount > 0 && (
        <span style={{ fontSize: '10px', opacity: 0.7 }}>
          ({status.retryCount}/{status.maxRetries})
        </span>
      )}
    </Tag>
  );

  if (!showDetails) {
    return badge;
  }

  return (
    <Tooltip
      title={
        <div style={{ textAlign: 'left' }}>
          <div style={{ marginBottom: '8px' }}>
            <strong>Status:</strong> {statusConfig.text}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Descrição:</strong> {statusConfig.description}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Última Atualização:</strong> {lastUpdate}
          </div>
          {status.message && (
            <div style={{ marginBottom: '4px' }}>
              <strong>Mensagem:</strong> {status.message}
            </div>
          )}
          {status.retryCount > 0 && (
            <div>
              <strong>Tentativas:</strong> {status.retryCount}/{status.maxRetries}
            </div>
          )}
        </div>
      }
      placement="top"
    >
      {badge}
    </Tooltip>
  );
};

export default BlockchainStatusBadge;
