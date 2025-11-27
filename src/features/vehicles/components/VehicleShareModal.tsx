import React, { useState, useEffect } from 'react';
import {
  Modal,
  Typography,
  Button,
  Space,
  Input,
  message,
  Spin,
  Card,
  Checkbox,
  Select,
} from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  CloseOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import QRCode from 'qrcode';
import { VehicleShareService, VehicleShareResponse } from '../services/vehicleShareService';
import { Vehicle, VehicleStatus } from '../types/vehicle.types';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

interface VehicleShareModalProps {
  visible: boolean;
  vehicle: Vehicle | null;
  onClose: () => void;
}

const VehicleShareModal: React.FC<VehicleShareModalProps> = ({
  visible,
  vehicle,
  onClose
}) => {
  const [loading, setLoading] = useState(false);
  const [shareData, setShareData] = useState<VehicleShareResponse | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [includeAttachments, setIncludeAttachments] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  useEffect(() => {
    if (visible && vehicle) {
      // Verificar se o veículo foi vendido e fechar o modal
      if (vehicle.status === VehicleStatus.SOLD) {
        message.warning('Não é possível gerar link de compartilhamento para veículos vendidos');
        onClose();
        return;
      }
      
      // Reset quando o modal abre
      setIncludeAttachments(false);
      setExpiresInDays(30);
      setShareData(null);
      setQrCodeDataUrl('');
      setCopied(false);
    }
  }, [visible, vehicle, onClose]);

  const generateQRCode = async (shareUrl: string) => {
    return await QRCode.toDataURL(shareUrl, {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
    });
  };

  const handleShareLinkError = (error: unknown) => {
    console.error('Erro ao gerar link de compartilhamento:', error);
    const apiError = error as { response?: { data?: { message?: string } }; message?: string };
    const errorMessage = apiError.response?.data?.message || apiError.message || 'Erro ao gerar link de compartilhamento';
    
    if (errorMessage.includes('vendido') || errorMessage.includes('vendidos')) {
      message.error('Não é possível gerar link de compartilhamento para veículos vendidos');
    } else {
      message.error(errorMessage);
    }
  };

  const generateShareLink = async () => {
    if (!vehicle) return;

    setLoading(true);
    try {
      const response = await VehicleShareService.generateShareLink(vehicle.id, expiresInDays, includeAttachments);
      setShareData(response);
      
      const qrCodeUrl = await generateQRCode(response.shareUrl);
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error: unknown) {
      handleShareLinkError(error);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      message.success('Link copiado para a área de transferência!');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
      message.error('Erro ao copiar link');
    }
  };

  const downloadQRCode = () => {
    if (!qrCodeDataUrl) return;

    const link = document.createElement('a');
    link.download = `qr-code-${vehicle?.plate || 'veiculo'}.png`;
    link.href = qrCodeDataUrl;
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const formatExpirationDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!vehicle) return null;

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      width="90%"
      style={{ top: 20, maxWidth: 800 }}
      footer={null}
      closeIcon={null}
      styles={{
        content: {
          padding: 0,
          overflow: 'hidden',
          borderRadius: 'var(--border-radius-lg)'
        }
      }}
    >
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          padding: 'var(--space-lg) var(--space-md)',
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

        <Button
          type="text"
          icon={<CloseOutlined />}
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 'var(--space-lg)',
            right: 'var(--space-lg)',
            color: 'var(--text-light)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10
          }}
        />

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
            <ShareAltOutlined style={{ fontSize: '36px', color: 'var(--text-light)' }} />
          </div>

          <Title
            level={2}
            style={{
              color: 'var(--text-light)',
              margin: '0 0 var(--space-sm) 0',
              fontSize: 'clamp(20px, 4vw, 28px)',
              fontWeight: 700
            }}
          >
            Compartilhar Veículo
          </Title>

          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: 'clamp(14px, 3vw, 16px)',
              wordBreak: 'break-word'
            }}
          >
            {vehicle.brand} {vehicle.model} - {vehicle.plate}
          </Text>
        </div>
      </div>

      <div style={{ padding: 'var(--space-lg) var(--space-md)' }}>
        {(() => {
          if (loading) {
            return (
              <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
                <Spin size="large" />
                <div style={{ marginTop: 'var(--space-lg)' }}>
                  <Text>Gerando link de compartilhamento...</Text>
                </div>
              </div>
            );
          }
          
          if (!shareData) {
            return (
          <div>
            <Card
              style={{
                marginBottom: 'var(--space-lg)',
                border: '1px solid var(--gray-2)',
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div>
                  <Text strong style={{ fontSize: '16px', display: 'block', marginBottom: 'var(--space-md)' }}>
                    Configurações de Compartilhamento
                  </Text>
                  
                  <Space direction="vertical" style={{ width: '100%' }} size="middle">
                    <div>
                      <Text style={{ fontSize: '14px', display: 'block', marginBottom: 'var(--space-xs)' }}>
                        Tempo de expiração do link:
                      </Text>
                      <Select
                        value={expiresInDays}
                        onChange={setExpiresInDays}
                        style={{ width: '100%' }}
                        size="large"
                      >
                        <Option value={7}>7 dias</Option>
                        <Option value={15}>15 dias</Option>
                        <Option value={30}>30 dias</Option>
                        <Option value={60}>60 dias</Option>
                        <Option value={90}>90 dias</Option>
                        <Option value={180}>180 dias</Option>
                        <Option value={365}>1 ano</Option>
                      </Select>
                      <Text type="secondary" style={{ fontSize: '12px', display: 'block', marginTop: 'var(--space-xs)' }}>
                        O link expirará automaticamente após o período selecionado.
                      </Text>
                    </div>
                    
                    <div>
                      <Checkbox
                        checked={includeAttachments}
                        onChange={(e) => setIncludeAttachments(e.target.checked)}
                        style={{ fontSize: '14px' }}
                      >
                        <Space>
                          <span>Incluir anexos nos dados compartilhados</span>
                        </Space>
                      </Checkbox>
                      <div style={{ marginTop: 'var(--space-xs)' }}>
                        <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                          Se marcado, os anexos dos serviços serão visíveis na página pública.
                        </Text>
                      </div>
                    </div>
                  </Space>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  icon={<ShareAltOutlined />}
                  onClick={generateShareLink}
                  block
                  style={{
                    background: 'var(--primary-color)',
                    borderColor: 'var(--primary-color)',
                    minHeight: '48px',
                    fontSize: 'clamp(14px, 3vw, 16px)',
                    fontWeight: 600,
                    padding: '12px 16px',
                    lineHeight: '1.4'
                  }}
                >
                  <span style={{ 
                    display: 'block',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word'
                  }}>
                    Gerar Link de Compartilhamento
                  </span>
                </Button>
              </Space>
            </Card>
          </div>
            );
          }
          
          if (shareData) {
            return (
              <div>
            <Card
              style={{
                marginBottom: 'var(--space-lg)',
                border: '1px solid var(--success-color)',
                background: 'var(--success-color)05'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
                <CheckCircleOutlined style={{ color: 'var(--success-color)', fontSize: '20px' }} />
                <Text strong style={{ color: 'var(--success-color)' }}>Link de Compartilhamento Gerado</Text>
              </div>
              
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>EXPIRA EM:</Text>
                  <div>
                    <Text strong>{formatExpirationDate(shareData.expiresAt)}</Text>
                  </div>
                </div>
                
                <div>
                  <Text type="secondary" style={{ fontSize: '12px' }}>LINK PÚBLICO:</Text>
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
                    <TextArea
                      value={shareData.shareUrl}
                      readOnly
                      style={{ flex: 1, minWidth: '200px', fontFamily: 'monospace', fontSize: '12px' }}
                      rows={2}
                    />
                    <Button
                      type="primary"
                      icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                      onClick={() => copyToClipboard(shareData.shareUrl)}
                      style={{
                        background: copied ? 'var(--success-color)' : 'var(--primary-color)',
                        borderColor: copied ? 'var(--success-color)' : 'var(--primary-color)',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>
              </Space>
            </Card>

            <Card
              title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                  <QrcodeOutlined />
                  <span>QR Code</span>
                </div>
              }
              style={{ textAlign: 'center' }}
            >
              {qrCodeDataUrl && (
                <div>
                  <img
                    src={qrCodeDataUrl}
                    alt="QR Code"
                    style={{
                      width: '100%',
                      maxWidth: '256px',
                      height: 'auto',
                      border: '1px solid var(--gray-2)',
                      borderRadius: 'var(--border-radius-sm)',
                      marginBottom: 'var(--space-md)'
                    }}
                  />
                  <div>
                    <Button
                      type="default"
                      icon={<DownloadOutlined />}
                      onClick={downloadQRCode}
                      size="large"
                      style={{ marginTop: 'var(--space-sm)' }}
                      block
                    >
                      Baixar QR Code
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
            );
          }
          
          return null;
        })()}
      </div>
    </Modal>
  );
};

export default VehicleShareModal;
