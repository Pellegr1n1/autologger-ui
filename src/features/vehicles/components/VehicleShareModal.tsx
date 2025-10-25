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
} from 'antd';
import {
  ShareAltOutlined,
  CopyOutlined,
  QrcodeOutlined,
  DownloadOutlined,
  CloseOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import QRCode from 'qrcode';
import { VehicleShareService, VehicleShareResponse } from '../services/vehicleShareService';
import { Vehicle } from '../types/vehicle.types';

const { Title, Text } = Typography;
const { TextArea } = Input;

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

  useEffect(() => {
    if (visible && vehicle && !shareData) {
      generateShareLink();
    }
  }, [visible, vehicle]);

  const generateShareLink = async () => {
    if (!vehicle) return;

    setLoading(true);
    try {
      const response = await VehicleShareService.generateShareLink(vehicle.id, 30);
      setShareData(response);
      
      // Gerar QR Code
      const qrCodeUrl = await QRCode.toDataURL(response.shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
      });
      setQrCodeDataUrl(qrCodeUrl);
    } catch (error) {
      console.error('Erro ao gerar link de compartilhamento:', error);
      message.error('Erro ao gerar link de compartilhamento');
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
    document.body.removeChild(link);
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
      width={800}
      style={{ top: 20 }}
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
      {/* Header */}
      <div
        style={{
          background: `linear-gradient(135deg, var(--primary-color), var(--secondary-color))`,
          padding: 'var(--space-xxl)',
          color: 'var(--text-light)',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Decorações de fundo */}
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

        {/* Botão fechar */}
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
              fontSize: '28px',
              fontWeight: 700
            }}
          >
            Compartilhar Veículo
          </Title>

          <Text
            style={{
              color: 'rgba(255, 255, 255, 0.8)',
              fontSize: '16px'
            }}
          >
            {vehicle.brand} {vehicle.model} - {vehicle.plate}
          </Text>
        </div>
      </div>

      {/* Conteúdo */}
      <div style={{ padding: 'var(--space-xxl)' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 'var(--space-xxl)' }}>
            <Spin size="large" />
            <div style={{ marginTop: 'var(--space-lg)' }}>
              <Text>Gerando link de compartilhamento...</Text>
            </div>
          </div>
        ) : shareData ? (
          <div>
            {/* Informações do Link */}
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
                  <div style={{ display: 'flex', gap: 'var(--space-sm)', alignItems: 'center' }}>
                    <TextArea
                      value={shareData.shareUrl}
                      readOnly
                      style={{ flex: 1, fontFamily: 'monospace', fontSize: '12px' }}
                      rows={2}
                    />
                    <Button
                      type="primary"
                      icon={copied ? <CheckCircleOutlined /> : <CopyOutlined />}
                      onClick={() => copyToClipboard(shareData.shareUrl)}
                      style={{
                        background: copied ? 'var(--success-color)' : 'var(--primary-color)',
                        borderColor: copied ? 'var(--success-color)' : 'var(--primary-color)'
                      }}
                    >
                      {copied ? 'Copiado!' : 'Copiar'}
                    </Button>
                  </div>
                </div>
              </Space>
            </Card>

            {/* QR Code */}
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
                      width: '256px',
                      height: '256px',
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
                    >
                      Baixar QR Code
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};

export default VehicleShareModal;
