import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Button,
  Space,
  Typography,
  Spin,
  message,
  Empty,
  Card,
  Row,
  Col,
  Tag
} from "antd"
import {
  ArrowLeftOutlined
} from "@ant-design/icons"
import VehicleDetailsHeader from "../../features/vehicles/components/VehicleDetailsHeader"
import { VehicleService } from "../../services/api/vehicleService"
import { Vehicle } from "../../features/vehicles/types/vehicle.types"
import { kmFormat } from "../../utils/format"

const { Text, Title } = Typography

// Função helper para formatar datas de forma segura
const formatDate = (date: Date | string): string => {
  try {
    const targetDate = typeof date === 'string' ? new Date(date) : date;

    if (!targetDate || isNaN(targetDate.getTime())) {
      return 'Data inválida';
    }

    return targetDate.toLocaleDateString('pt-BR');
  } catch (error) {
    return 'Data inválida';
  }
};

export default function VehicleDetailsPage() {
  const { vehicleId } = useParams<{ vehicleId: string }>();
  const navigate = useNavigate();

  // Estados para dados do veículo
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fallback para vehicleId se não estiver na URL
  const id = vehicleId || "veh-1";

  // Buscar dados do veículo
  useEffect(() => {
    const loadVehicleData = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        // Buscar dados do veículo
        const vehicleData = await VehicleService.getVehicleById(id);
        console.log('Dados do veículo recebidos:', vehicleData);
        setVehicle(vehicleData);

      } catch (err: any) {
        console.error('Erro ao carregar dados do veículo:', err);
        setError(err?.response?.data?.message || 'Erro ao carregar dados do veículo');
        message.error('Erro ao carregar dados do veículo');
      } finally {
        setLoading(false);
      }
    };

    loadVehicleData();
  }, [id]);

  // Estado de loading
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '48px',
        background: 'var(--background-color)',
        color: 'var(--text-primary)'
      }}>
        <Spin size="large" />
        <Text style={{ marginTop: '24px', color: 'var(--text-secondary)' }}>
          Carregando dados do veículo...
        </Text>
      </div>
    );
  }

  // Estado de erro
  if (error || !vehicle) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '48px',
        background: 'var(--background-color)',
        color: 'var(--text-primary)'
      }}>
        <Empty
          description={
            <div>
              <Text strong style={{ display: 'block', marginBottom: '8px', color: 'var(--text-primary)' }}>
                Veículo não encontrado
              </Text>
              <Text style={{ color: 'var(--text-secondary)' }}>
                {error || 'O veículo solicitado não foi encontrado ou não está disponível.'}
              </Text>
            </div>
          }
        />
        <Button
          type="primary"
          onClick={() => navigate('/vehicles')}
          style={{ marginTop: '24px' }}
        >
          Voltar para Veículos
        </Button>
      </div>
    );
  }

  return (
    <div style={{
      padding: '48px',
      background: 'var(--background-color)',
      minHeight: '100vh',
      color: 'var(--text-primary)'
    }}>
      {/* Breadcrumb simplificado */}
      <div style={{ marginBottom: '24px', padding: '16px 0' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/vehicles')}
          type="text"
          style={{
            padding: '8px',
            height: 'auto',
            color: 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--primary-color)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-secondary)';
          }}
        >
          Voltar para Veículos
        </Button>
      </div>

      {/* Header do veículo */}
      <VehicleDetailsHeader
        vehicle={vehicle}
        onEdit={() => {
          // TODO: Implementar edição inline ou modal
          message.info('Funcionalidade de edição será implementada em breve');
        }}
        onAddMaintenance={(vehicleId) => {
          // Navegar para página de manutenções
          navigate('/events');
        }}
        onViewHistory={(vehicleId) => {
          // Navegar para página de manutenções
          navigate('/events');
        }}
        onViewDocuments={(vehicleId) => {
          // Navegar para página de documentos
          navigate('/documents');
        }}
      />

      {/* Informações detalhadas do veículo */}
      <Card style={{
        background: 'var(--surface-color)',
        border: '1px solid rgba(139, 92, 246, 0.2)',
        borderRadius: '16px',
        marginBottom: '24px',
        boxShadow: '0 8px 24px rgba(0, 0, 0, 0.2)'
      }}>
        <Title level={3} style={{ color: 'var(--text-primary)', marginBottom: '24px' }}>
          Detalhes do Veículo
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} md={12}>
            <Card style={{
              background: 'var(--card-background)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              borderRadius: '12px'
            }}>
              <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                Dados Básicos
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Marca</Text>
                  <div><Text strong style={{ color: 'var(--text-primary)' }}>{vehicle.brand}</Text></div>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Modelo</Text>
                  <div><Text strong style={{ color: 'var(--text-primary)' }}>{vehicle.model}</Text></div>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Ano</Text>
                  <div><Text strong style={{ color: 'var(--text-primary)' }}>{vehicle.year}</Text></div>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Cor</Text>
                  <div><Text strong style={{ color: 'var(--text-primary)' }}>{vehicle.color}</Text></div>
                </div>
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card style={{
              background: 'var(--card-background)',
              border: '1px solid rgba(139, 92, 246, 0.1)',
              borderRadius: '12px'
            }}>
              <Title level={4} style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>
                Status Atual
              </Title>
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Quilometragem</Text>
                  <div><Text strong style={{ color: 'var(--text-primary)' }}>{kmFormat(vehicle.mileage)} km</Text></div>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Placa</Text>
                  <div><Tag color="blue" style={{ fontSize: '16px', fontWeight: 'bold' }}>{vehicle.plate}</Tag></div>
                </div>
                <div>
                  <Text style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>Status</Text>
                  <div><Tag color="green">Ativo</Tag></div>
                </div>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* Informações de metadados */}
      <Card style={{
        background: 'var(--card-background)',
        border: '1px solid rgba(139, 92, 246, 0.1)',
        borderRadius: '12px',
        textAlign: 'center',
        boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)'
      }}>
        <Space size="large" wrap>
          <div>
            <Text style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>
              Criado em
            </Text>
            <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {formatDate(vehicle.createdAt)}
            </Text>
          </div>

          <div>
            <Text style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>
              Última atualização
            </Text>
            <Text strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {formatDate(vehicle.updatedAt)}
            </Text>
          </div>

          <div>
            <Text style={{ fontSize: '12px', display: 'block', color: 'var(--text-secondary)' }}>
              ID do veículo
            </Text>
            <Text strong style={{ fontSize: '14px', fontFamily: 'monospace', color: 'var(--text-primary)' }}>
              {vehicle.id}
            </Text>
          </div>
        </Space>
      </Card>
    </div>
  )
}