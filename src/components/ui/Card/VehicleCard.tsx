import { Card, Button, Typography, Tag, Image, Dropdown } from 'antd';
import { 
  EditOutlined, 
  MoreOutlined,
  CarOutlined
} from '@ant-design/icons';
import { Vehicle } from '../../../features/vehicles/types/vehicle.types';
import styles from './VehicleCard.module.css';
import type { MenuProps } from 'antd';

const { Text, Title } = Typography;

interface VehicleCardProps {
  vehicle: Vehicle;
  onView: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onSell: (vehicle: Vehicle) => void;
  showSoldBadge?: boolean;
}

export default function VehicleCard({ 
  vehicle, 
  onView, 
  onEdit, 
  onSell, 
  showSoldBadge = false
}: VehicleCardProps) {
  const kmFormat = (km: number) => {
    return km.toLocaleString('pt-BR');
  };

  const getImageUrl = (url?: string) => {
    if (!url) return '';
    
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Support both Vite (import.meta.env) and Jest (process.env) environments
    let apiBaseUrl: string;
    if (typeof process !== 'undefined' && process.env?.VITE_API_BASE_URL) {
      apiBaseUrl = process.env.VITE_API_BASE_URL;
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      apiBaseUrl = (globalThis as any).import?.meta?.env?.VITE_API_BASE_URL as string | undefined || 'http://localhost:3001';
    }
    const fullUrl = `${apiBaseUrl}${url}`;
    return fullUrl;
  };

  const quickActionMenuItems: MenuProps['items'] = [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Editar Dados',
      onClick: () => onEdit(vehicle)
    },
    { type: 'divider' as const },
    {
      key: 'sell',
      icon: <CarOutlined />,
      label: 'Marcar como Vendido',
      onClick: () => onSell(vehicle),
      danger: true
    }
  ];

  return (
    <Card className={styles.vehicleCard}>
      {/* Header com imagem e status */}
      <div className={styles.cardHeader}>
        <div className={styles.vehicleImage}>
          {(vehicle.photoUrl || vehicle.imageUrl) ? (
            <Image
              src={getImageUrl(vehicle.photoUrl || vehicle.imageUrl)}
              alt={`${vehicle.brand} ${vehicle.model}`}
              width="100%"
              height="120px"
              style={{ 
                objectFit: 'cover', 
                borderRadius: '8px'
              }}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMIAAADDCAYAAADQvc6UAAABRWlDQ1BJQ0MgUHJvZmlsZQAAKJFjYGASSSwoyGFhYGDIzSspCnJ3UoiIjFJgf8LAwSDCIMogwMCcmFxc4BgQ4ANUwgCjUcG3awyMIPqyLsis7PPOq3QdDFcvjV3jOD1boQVTPQrgSkktTgbSf4A4LbmgqISBgTEFyFYuLykAsTuAbJEioKOA7DkgdjqEvQHEToKwj4DVhAQ5A9k3gGyB5IxEoBmML4BsnSQk8XQkNtReEOBxcfXxUQg1Mjc0dyHgXNJBSWpFCYh2zi+oLMpMzyhRcASGUqqCZ16yno6CkYGRAQMDKMwhqj/fAIcloxgHQqxAjIHBEugw5sUIsSQpBobtQPdLciLEVJYzMPBHMDBsayhILEqEO4DxG0txmrERhM29nYGBddr//5/DGRjYNRkY/l7////39v///y4Dmn+LgeHANwDrkl1AuO+pmgAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAwqADAAQAAAABAAAAwwAAAAD9b/HnAAAHlklEQVR4Ae3dP3Ik1RnG4W+FgYxN"
            />
          ) : (
            <div className={styles.vehicleImagePlaceholder}>
              <CarOutlined style={{ fontSize: '48px', color: 'var(--text-secondary)' }} />
            </div>
          )}
        </div>
        
        {showSoldBadge && (
          <Tag color="red" className={styles.soldBadge}>
            Vendido
          </Tag>
        )}
      </div>

      {/* Informações do veículo */}
      <div className={styles.vehicleInfo}>
        <Title level={4} className={styles.vehicleTitle}>
          {vehicle.brand} {vehicle.model}
        </Title>
        
        <div className={styles.vehicleDetails}>
          <Text className={styles.vehicleYear}>{vehicle.year}</Text>
          <Text className={styles.vehicleColor}>{vehicle.color}</Text>
          <Text className={styles.vehicleMileage}>{kmFormat(vehicle.mileage)} km</Text>
        </div>
        
        <div className={styles.vehiclePlate}>
          <Tag color="blue" className={styles.plateTag}>
            {vehicle.plate}
          </Tag>
        </div>
      </div>

      <div className={styles.cardActions}>
        <Button
          type="primary"
          onClick={() => onView(vehicle)}
          style={{
            flex: 1,
            height: '40px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, var(--primary-color), var(--accent-color))',
            border: 'none',
            fontWeight: 600,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-1px)';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(139, 92, 246, 0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Visualizar
        </Button>
        
        {/* Só mostrar dropdown para veículos ativos */}
        {vehicle.status !== 'sold' && !vehicle.soldAt && (
          <Dropdown
            menu={{ items: quickActionMenuItems }}
            trigger={['click']}
            placement="bottomRight"
          >
            <Button
              type="text"
              icon={<MoreOutlined />}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                borderRadius: '8px',
                color: 'var(--text-secondary)',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--primary-color)';
                e.currentTarget.style.background = 'rgba(139, 92, 246, 0.1)';
                e.currentTarget.style.color = 'var(--primary-color)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.2)';
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            />
          </Dropdown>
        )}
      </div>
    </Card>
  );
}