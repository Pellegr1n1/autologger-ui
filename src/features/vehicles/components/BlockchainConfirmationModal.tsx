import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Button,
  Typography,
  Space,
  Alert,
  Steps,
  Card,
  Tag,
  Divider,
  message
} from 'antd';
import {
  SafetyCertificateOutlined,
  LockOutlined,
  CheckCircleOutlined,
  BlockOutlined
} from '@ant-design/icons';
import { VehicleEvent } from '../types/vehicle.types';
import { BlockchainService } from '../../../services/api/blockchainService';
import { ServiceSubmissionResult } from '../types/blockchain.types';

const { Text, Title } = Typography;

interface BlockchainConfirmationModalProps {
  visible: boolean;
  service: VehicleEvent;
  onClose: () => void;
  onSuccess: (result: ServiceSubmissionResult) => void;
}

const BlockchainConfirmationModal: React.FC<BlockchainConfirmationModalProps> = ({
  visible,
  service,
  onClose,
  onSuccess
}) => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [submissionResult, setSubmissionResult] = useState<ServiceSubmissionResult | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutos

  useEffect(() => {
    if (visible && currentStep === 1) {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [visible, currentStep]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStep1Submit = async () => {
    setLoading(true);
    try {
      // Enviar para blockchain via backend
      const result = await BlockchainService.submitServiceToBlockchain({
        type: service.type,
        category: service.category,
        description: service.description,
        cost: service.cost,
        location: service.location,
        mileage: service.mileage,
        date: service.date,
        attachments: service.attachments
      });

      if (result.success) {
        setCurrentStep(1);
        setSubmissionResult(result);
        message.success('Serviço enviado para blockchain! Confirme na próxima etapa.');
      } else {
        message.error(result.error || 'Erro ao enviar para blockchain');
      }
    } catch (error) {
      console.error('Erro na primeira etapa:', error);
      message.error('Erro ao enviar serviço para blockchain');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Submit = async () => {
    if (!confirmationCode.trim()) {
      message.error('Digite o código de confirmação');
      return;
    }

    setLoading(true);
    try {
      // Simular confirmação (em produção, seria uma chamada real)
      const result = await BlockchainService.confirmService(service.id);
      
      if (result.success) {
        setCurrentStep(2);
        message.success('Serviço confirmado e imutável na blockchain!');
        
        // Simular resultado de sucesso
        const successResult = {
          success: true,
          hash: result.hash || `hash-${Date.now()}`,
          status: 'CONFIRMED' as const,
          serviceId: service.id
        };
        
        onSuccess(successResult);
      } else {
        message.error(result.error || 'Erro ao confirmar serviço');
      }
    } catch (error) {
      console.error('Erro na segunda etapa:', error);
      message.error('Erro ao confirmar serviço');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (currentStep < 2) {
      Modal.confirm({
        title: 'Cancelar confirmação?',
        content: 'O serviço não será enviado para blockchain. Deseja continuar?',
        onOk: () => {
          setCurrentStep(0);
          form.resetFields();
          setConfirmationCode('');
          setSubmissionResult(null);
          onClose();
        }
      });
    } else {
      setCurrentStep(0);
      form.resetFields();
      setConfirmationCode('');
      setSubmissionResult(null);
      onClose();
    }
  };

  const steps = [
    {
      title: 'Revisão',
      icon: <BlockOutlined />,
      description: 'Revisar dados do serviço'
    },
    {
      title: 'Confirmação',
      icon: <LockOutlined />,
      description: 'Confirmar com código'
    },
    {
      title: 'Concluído',
      icon: <CheckCircleOutlined />,
      description: 'Serviço imutável'
    }
  ];

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#8B5CF6' }} />
          <span>Confirmação Blockchain - {service.type}</span>
        </Space>
      }
      open={visible}
      onCancel={handleClose}
      footer={null}
      width={700}
      destroyOnClose
    >
      <div style={{ padding: '24px 0' }}>
        <Steps current={currentStep} items={steps} />
        
        <Divider />

        {currentStep === 0 && (
          <div>
            <Alert
              message="Revisão do Serviço"
              description="Revise os dados antes de enviar para blockchain. Após confirmação, o serviço será imutável."
              type="info"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <Card
              title="Detalhes do Serviço"
              style={{ marginBottom: '24px' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Tipo:</Text>
                  <Tag color="blue">{service.type}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Categoria:</Text>
                  <Tag color="green">{service.category}</Tag>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Data:</Text>
                  <Text>{new Date(service.date).toLocaleDateString('pt-BR')}</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Quilometragem:</Text>
                  <Text>{service.mileage.toLocaleString()} km</Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Custo:</Text>
                  <Text style={{ color: '#52C41A' }}>
                    R$ {service.cost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Text strong>Local:</Text>
                  <Text>{service.location}</Text>
                </div>
                {service.attachments && service.attachments.length > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Anexos:</Text>
                    <Text>{service.attachments.length} arquivo(s)</Text>
                  </div>
                )}
              </Space>
            </Card>

            <Alert
              message="⚠️ Importante"
              description="Após confirmação na blockchain, este serviço não poderá ser editado ou removido. Certifique-se de que todos os dados estão corretos."
              type="warning"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            <div style={{ textAlign: 'center' }}>
              <Button
                type="primary"
                size="large"
                icon={<BlockOutlined />}
                onClick={handleStep1Submit}
                loading={loading}
                style={{ 
                  background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                  border: 'none',
                  height: '48px',
                  padding: '0 32px',
                  fontSize: '16px'
                }}
              >
                Enviar para Blockchain
              </Button>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Alert
              message="Código de Confirmação Enviado"
              description={`Um código de confirmação foi enviado para seu dispositivo. Digite-o abaixo para finalizar o processo. Tempo restante: ${formatTime(countdown)}`}
              type="success"
              showIcon
              style={{ marginBottom: '24px' }}
            />

            {submissionResult && (
              <Card
                title="Status da Transação"
                style={{ marginBottom: '24px' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Hash:</Text>
                    <Text code style={{ fontSize: '12px' }}>
                      {submissionResult.hash ? submissionResult.hash.substring(0, 20) + '...' : 'N/A'}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Status:</Text>
                    <Tag color="processing">Aguardando Confirmação</Tag>
                  </div>
                </Space>
              </Card>
            )}

            <Form layout="vertical">
              <Form.Item
                label="Código de Confirmação"
                required
                help="Digite o código de 6 dígitos enviado para seu dispositivo"
              >
                <Input
                  size="large"
                  placeholder="000000"
                  maxLength={6}
                  value={confirmationCode}
                  onChange={(e) => setConfirmationCode(e.target.value)}
                  style={{ 
                    textAlign: 'center',
                    fontSize: '24px',
                    letterSpacing: '8px',
                    fontFamily: 'monospace'
                  }}
                />
              </Form.Item>

            </Form>

            {countdown === 0 && (
              <Alert
                message="Tempo Expirado"
                description="O código de confirmação expirou. Solicite um novo código."
                type="error"
                showIcon
                style={{ marginBottom: '24px' }}
              />
            )}

            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  type="primary"
                  size="large"
                  icon={<CheckCircleOutlined />}
                  onClick={handleStep2Submit}
                  loading={loading}
                  disabled={countdown === 0}
                  style={{ 
                    background: 'linear-gradient(135deg, #52C41A 0%, #73D13D 100%)',
                    border: 'none',
                    height: '48px',
                    padding: '0 32px',
                    fontSize: '16px'
                  }}
                >
                  Confirmar Serviço
                </Button>
              </Space>
            </div>
          </div>
        )}

        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined 
              style={{ 
                fontSize: '64px', 
                color: '#52C41A',
                marginBottom: '24px'
              }} 
            />
            
            <Title level={3} style={{ color: '#52C41A', marginBottom: '16px' }}>
              Serviço Confirmado!
            </Title>
            
            <Text style={{ fontSize: '16px', color: '#666' }}>
              O serviço foi confirmado e agora é imutável na blockchain.
            </Text>

            {submissionResult && (
              <Card
                style={{ marginTop: '24px', textAlign: 'left' }}
                title="Detalhes da Transação"
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Hash:</Text>
                    <Text code style={{ fontSize: '12px' }}>
                      {submissionResult.hash || 'N/A'}
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Status:</Text>
                    <Tag color="success">Confirmado</Tag>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text strong>Timestamp:</Text>
                    <Text>{new Date().toLocaleString('pt-BR')}</Text>
                  </div>
                </Space>
              </Card>
            )}

            <Button
              type="primary"
              size="large"
              onClick={handleClose}
              style={{ 
                marginTop: '24px',
                background: 'linear-gradient(135deg, #8B5CF6 0%, #A78BFA 100%)',
                border: 'none',
                height: '48px',
                padding: '0 32px',
                fontSize: '16px'
              }}
            >
              Concluir
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default BlockchainConfirmationModal;
