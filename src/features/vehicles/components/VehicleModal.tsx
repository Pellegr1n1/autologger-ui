import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Space,
  Button,
  Row,
  Col
} from 'antd';
import {
  CarOutlined,
  CalendarOutlined,
  DashboardOutlined,
  HistoryOutlined,
  SettingOutlined,
  CloseOutlined,
  IdcardOutlined,
  CheckCircleOutlined,
  StopOutlined,
  ShareAltOutlined
} from '@ant-design/icons';
import { Vehicle, VehicleStatus } from '../types/vehicle.types';
import { VehicleServiceService } from '../services/vehicleServiceService';
import { BlockchainService } from '../../blockchain/services/blockchainService';
import VehicleShareModal from './VehicleShareModal';

const { Title, Text } = Typography;

interface VehicleModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

const VehicleModal: React.FC<VehicleModalProps> = ({
  visible,
  vehicle,
  onClose
}) => {
  const [maintenanceCount, setMaintenanceCount] = useState<number>(0);
  const [loadingCount, setLoadingCount] = useState<boolean>(false);
  const [shareModalVisible, setShareModalVisible] = useState<boolean>(false);

  useEffect(() => {
    if (visible && vehicle) {
      loadMaintenanceCount();
    }
  }, [visible, vehicle]);

  const loadMaintenanceCount = async () => {
    if (!vehicle) return;
    
    setLoadingCount(true);
    
    try {
      // Primeiro, tenta usar o método específico que retorna apenas a contagem
      const count = await VehicleServiceService.getServicesCountByVehicle(vehicle.id);
      setMaintenanceCount(count);
    } catch (error) {
      console.error('Erro ao carregar contagem de serviços:', error);
      try {
        // Fallback: tenta buscar serviços por veículo da blockchain
        const blockchainServices = await BlockchainService.getServicesByVehicle(vehicle.id);
        setMaintenanceCount(blockchainServices.length);
      } catch (blockchainError) {
        console.error('Erro ao buscar serviços da blockchain:', blockchainError);
        try {
          // Fallback final: busca serviços por veículo do serviço normal
          const services = await VehicleServiceService.getServicesByVehicle(vehicle.id);
          setMaintenanceCount(services.length);
        } catch (fallbackError) {
          console.error('Erro no fallback final:', fallbackError);
          setMaintenanceCount(0);
        }
      }
    } finally {
      setLoadingCount(false);
    }
  };

  if (!vehicle) return null;

  const formatMileage = (mileage: number): string => {
    return new Intl.NumberFormat('pt-BR').format(mileage);
  };

  const getVehicleAge = (year: number): number => {
    return new Date().getFullYear() - year;
  };

  const getDaysSinceCreated = (date: Date | string): number => {
    try {
      const today = new Date();
      const targetDate = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(targetDate.getTime())) {
        return 0;
      }

      const diffTime = Math.abs(today.getTime() - targetDate.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } catch (error) {
      return 0;
    }
  };

  const formatDate = (date: Date | string): string => {
    try {
      const targetDate = typeof date === 'string' ? new Date(date) : date;

      if (isNaN(targetDate.getTime())) {
        return 'Data inválida';
      }

      return targetDate.toLocaleDateString('pt-BR');
    } catch (error) {
      return 'Data inválida';
    }
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    title: string;
    value: string | number;
    suffix?: string;
    color: string;
  }> = ({ icon, title, value, suffix, color }) => (
    <div
      style={{
        background: 'var(--card-background)',
        border: '1px solid var(--gray-2)',
        borderRadius: 'var(--border-radius-md)',
        padding: 'var(--space-lg)',
        textAlign: 'center',
        transition: 'all var(--transition-fast)',
        height: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = color;
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--gray-2)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          background: `${color}15`,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto var(--space-sm) auto',
          color: color,
          fontSize: '20px'
        }}
      >
        {icon}
      </div>
      <Text
        style={{
          fontSize: '12px',
          color: 'var(--gray-5)',
          display: 'block',
          marginBottom: 'var(--space-xs)',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontWeight: 500
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontSize: '24px',
          fontWeight: 700,
          color: 'var(--text-dark)',
          display: 'block'
        }}
      >
        {value} {suffix && value !== '...' && <span style={{ fontSize: '14px', color: 'var(--gray-5)' }}>{suffix}</span>}
      </Text>
    </div>
  );

  const InfoRow: React.FC<{
    label: string;
    value: React.ReactNode;
    icon?: React.ReactNode;
  }> = ({ label, value, icon }) => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 'var(--space-md) 0',
        borderBottom: '1px solid var(--gray-2)'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
        {icon && <span style={{ color: 'var(--gray-5)' }}>{icon}</span>}
        <Text style={{ color: 'var(--gray-6)', fontWeight: 500 }}>{label}</Text>
      </div>
      <div>{value}</div>
    </div>
  );

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20, maxWidth: 900 }}
      footer={null}
      closeIcon={null}
      centered
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-lg)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          padding: 'clamp(16px, 4vw, 32px)',
          color: 'var(--text-light)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '150px',
            height: '150px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '50%',
            opacity: 0.6
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: '-30px',
            width: '100px',
            height: '100px',
            background: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '50%'
          }}
        />

        <div style={{ position: 'absolute', top: 'var(--space-lg)', right: 'var(--space-lg)', display: 'flex', gap: 'var(--space-sm)', zIndex: 10 }}>
          {vehicle.status !== VehicleStatus.SOLD && (
            <Button
              type="text"
              icon={<ShareAltOutlined />}
              onClick={() => setShareModalVisible(true)}
              style={{
                color: 'var(--text-light)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
              }}
              title="Compartilhar veículo"
            />
          )}

          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={onClose}
            style={{
              color: 'var(--text-light)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          />
        </div>

        <div style={{ textAlign: 'center' }}>
          <div
            style={{
              width: '80px',
              height: '80px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--space-lg) auto',
              backdropFilter: 'blur(10px)',
              border: '2px solid rgba(255, 255, 255, 0.3)'
            }}
          >
            <CarOutlined style={{ fontSize: '36px', color: 'var(--text-light)' }} />
          </div>

          <Title
            level={2}
            style={{
              color: 'var(--text-light)',
              margin: '0 0 var(--space-sm) 0',
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: 700,
              wordBreak: 'break-word',
              padding: '0 8px'
            }}
          >
            {vehicle.brand} {vehicle.model}
          </Title>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--space-lg)' }}>
            <div
              style={{
                background: 'rgba(255, 255, 255, 0.2)',
                padding: 'var(--space-sm) var(--space-md)',
                borderRadius: 'var(--border-radius-md)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <Text
                style={{
                  color: 'var(--text-light)',
                  fontSize: '20px',
                  fontWeight: 700,
                  letterSpacing: '2px'
                }}
              >
                {vehicle.plate}
              </Text>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--space-xs)',
                background: vehicle.status === VehicleStatus.ACTIVE ? 'var(--success-color)' : 'var(--error-color)',
                padding: 'var(--space-xs) var(--space-sm)',
                borderRadius: 'var(--border-radius-sm)'
              }}
            >
              {vehicle.status === VehicleStatus.ACTIVE ? (
                <CheckCircleOutlined style={{ fontSize: '16px' }} />
              ) : (
                <StopOutlined style={{ fontSize: '16px' }} />
              )}
              <Text style={{ color: 'var(--text-light)', fontWeight: 600, fontSize: '14px' }}>
                {vehicle.status === VehicleStatus.ACTIVE ? 'ATIVO' : 'VENDIDO'}
              </Text>
            </div>
          </div>
        </div>
      </div>

      <div style={{ padding: 'clamp(12px, 3vw, 24px)' }}>
        <Row gutter={[16, 16]} style={{ marginBottom: 'var(--space-xxl)' }}>
          <Col xs={12} sm={12} md={6} lg={6}>
            <StatCard
              icon={<CalendarOutlined />}
              title="Idade"
              value={getVehicleAge(vehicle.year)}
              suffix="anos"
              color="var(--primary-color)"
            />
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <StatCard
              icon={<DashboardOutlined />}
              title="Quilometragem"
              value={formatMileage(vehicle.mileage)}
              suffix="km"
              color="var(--success-color)"
            />
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <StatCard
              icon={<HistoryOutlined />}
              title="No Sistema"
              value={getDaysSinceCreated(vehicle.createdAt)}
              suffix="dias"
              color="var(--secondary-color)"
            />
          </Col>
          <Col xs={12} sm={12} md={6} lg={6}>
            <StatCard
              icon={<SettingOutlined />}
              title="Serviços"
              value={loadingCount ? '...' : maintenanceCount}
              suffix="registrados"
              color="var(--warning-color)"
            />
          </Col>
        </Row>

        <div
          style={{
            background: 'var(--gray-1)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xxl)'
          }}
        >
          <Title level={4} style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-dark)' }}>
            Informações do Veículo
          </Title>

          <InfoRow
            icon={<CalendarOutlined />}
            label="Ano de Fabricação"
            value={
              <Space>
                <Text strong style={{ fontSize: '16px' }}>{vehicle.year}</Text>
                <Text type="secondary">({getVehicleAge(vehicle.year)} anos)</Text>
              </Space>
            }
          />

          <InfoRow
            label="Cor"
            value={
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor:
                      vehicle.color.toLowerCase() === 'branco' ? '#f0f0f0' :
                        vehicle.color.toLowerCase() === 'preto' ? '#000000' :
                          vehicle.color.toLowerCase() === 'prata' ? '#c0c0c0' :
                            vehicle.color.toLowerCase() === 'cinza' ? '#808080' :
                              vehicle.color.toLowerCase() === 'azul' ? '#1890ff' :
                                vehicle.color.toLowerCase() === 'vermelho' ? '#f5222d' :
                                  vehicle.color.toLowerCase() === 'verde' ? '#52c41a' :
                                    vehicle.color.toLowerCase() === 'amarelo' ? '#fadb14' :
                                      vehicle.color.toLowerCase() === 'marrom' ? '#8b4513' :
                                        vehicle.color.toLowerCase() === 'bege' ? '#f5f5dc' :
                                          vehicle.color.toLowerCase() === 'roxo' ? '#722ed1' :
                                            vehicle.color.toLowerCase() === 'laranja' ? '#fa8c16' :
                                              vehicle.color.toLowerCase() === 'rosa' ? '#eb2f96' :
                                                vehicle.color.toLowerCase() === 'dourado' ? '#d4af37' :
                                                  'var(--gray-4)',
                    border: '2px solid var(--gray-2)',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                />
                <Text strong style={{ fontSize: '16px' }}>{vehicle.color}</Text>
              </div>
            }
          />
        </div>

        <div
          style={{
            background: 'var(--card-background)',
            border: '1px solid var(--gray-2)',
            borderRadius: 'var(--border-radius-md)',
            padding: 'clamp(12px, 3vw, 24px)',
            marginBottom: 'var(--space-xxl)'
          }}
        >
          <Title level={4} style={{ marginBottom: 'var(--space-lg)', color: 'var(--text-dark)' }}>
            Histórico
          </Title>

          <InfoRow
            icon={<CalendarOutlined />}
            label="Data de Cadastro"
            value={
              <Space>
                <Text strong>{formatDate(vehicle.createdAt)}</Text>
                <Text type="secondary">({getDaysSinceCreated(vehicle.createdAt)} dias atrás)</Text>
              </Space>
            }
          />

          <InfoRow
            icon={<HistoryOutlined />}
            label="Última Atualização"
            value={<Text strong>{formatDate(vehicle.updatedAt)}</Text>}
          />

          {vehicle.status === VehicleStatus.SOLD && vehicle.soldAt && (
            <InfoRow
              icon={<StopOutlined />}
              label="Data da Venda"
              value={
                <Space>
                  <div
                    style={{
                      background: 'var(--error-color)',
                      color: 'var(--text-light)',
                      padding: 'var(--space-xs) var(--space-sm)',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '12px',
                      fontWeight: 600
                    }}
                  >
                    VENDIDO
                  </div>
                  <Text strong>{formatDate(vehicle.soldAt)}</Text>
                </Space>
              }
            />
          )}
        </div>
      </div>

      <VehicleShareModal
        visible={shareModalVisible}
        vehicle={vehicle}
        onClose={() => setShareModalVisible(false)}
      />
    </Modal>
  );
};

export default VehicleModal;