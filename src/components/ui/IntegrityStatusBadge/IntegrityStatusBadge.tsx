import React from 'react';
import { Tag, Tooltip } from 'antd';
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  StopOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { IntegrityStatus } from '../../../features/vehicles/types/vehicle.types';

interface IntegrityStatusBadgeProps {
  status?: IntegrityStatus;
  showDetails?: boolean;
  size?: 'small' | 'default' | 'large';
  message?: string;
  checkedAt?: Date;
}

const IntegrityStatusBadge: React.FC<IntegrityStatusBadgeProps> = ({
  status = IntegrityStatus.NOT_VERIFIED,
  showDetails = false,
  size = 'default',
  message,
  checkedAt,
}) => {
  const getStatusConfig = (status: IntegrityStatus) => {
    switch (status) {
      case IntegrityStatus.VALID:
        return {
          color: 'success',
          icon: <CheckCircleOutlined />,
          text: 'Íntegro',
          description: 'Serviço íntegro - hash corresponde ao registrado na blockchain',
        };
      case IntegrityStatus.VIOLATED:
        return {
          color: 'error',
          icon: <WarningOutlined />,
          text: 'Violado',
          description: '⚠️ ATENÇÃO: Serviço foi alterado após registro na blockchain',
        };
      case IntegrityStatus.UNKNOWN:
        return {
          color: 'warning',
          icon: <QuestionCircleOutlined />,
          text: 'Desconhecido',
          description: 'Hash não encontrado na blockchain - não é possível confirmar integridade',
        };
      case IntegrityStatus.NOT_VERIFIED:
      default:
        return {
          color: 'default',
          icon: <StopOutlined />,
          text: 'Não Verificado',
          description: 'Integridade ainda não foi verificada',
        };
    }
  };

  const statusConfig = getStatusConfig(status);
  const checkedAtFormatted = checkedAt
    ? new Date(checkedAt).toLocaleString('pt-BR')
    : null;

  const badge = (
    <Tag
      color={statusConfig.color}
      icon={statusConfig.icon}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontWeight: status === IntegrityStatus.VIOLATED ? 600 : 500,
        borderRadius: '6px',
        padding: size === 'small' ? '2px 8px' : '4px 12px',
        border:
          status === IntegrityStatus.VIOLATED ? '2px solid #ff4d4f' : undefined,
      }}
    >
      {statusConfig.text}
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
            <strong>Status de Integridade:</strong> {statusConfig.text}
          </div>
          <div style={{ marginBottom: '4px' }}>
            <strong>Descrição:</strong> {statusConfig.description}
          </div>
          {message && (
            <div style={{ marginBottom: '4px' }}>
              <strong>Mensagem:</strong> {message}
            </div>
          )}
          {checkedAtFormatted && (
            <div>
              <strong>Verificado em:</strong> {checkedAtFormatted}
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

export default IntegrityStatusBadge;


