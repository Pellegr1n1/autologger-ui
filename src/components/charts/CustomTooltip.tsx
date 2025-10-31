import React from 'react';
import { Space, Typography, Divider } from 'antd';
import { 
  DollarOutlined, 
  ToolOutlined, 
  CarOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { currencyBRL } from '../../shared/utils/format';
import styles from './CustomTooltip.module.css';

const { Text, Title } = Typography;

interface TooltipData {
  name: string;
  value: number;
  color?: string;
  payload?: any;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipData[];
  label?: string;
  showPercentage?: boolean;
  customIcon?: React.ReactNode;
  additionalInfo?: {
    total?: number;
    average?: number;
    count?: number;
    period?: string;
  };
}

export const CustomTooltip: React.FC<CustomTooltipProps> = ({
  active,
  payload,
  label,
  showPercentage = false,
  customIcon,
  additionalInfo
}) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const getIconForType = (name: string) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('manutenção') || lowerName.includes('maintenance')) {
      return <ToolOutlined style={{ color: '#667eea' }} />;
    }
    if (lowerName.includes('abastecimento') || lowerName.includes('fuel')) {
      return <CarOutlined style={{ color: '#4facfe' }} />;
    }
    if (lowerName.includes('reparo') || lowerName.includes('repair')) {
      return <ToolOutlined style={{ color: '#f093fb' }} />;
    }
    if (lowerName.includes('inspeção') || lowerName.includes('inspection')) {
      return <ToolOutlined style={{ color: '#4facfe' }} />;
    }
    if (lowerName.includes('despesa') || lowerName.includes('expense')) {
      return <DollarOutlined style={{ color: '#ff9a9e' }} />;
    }
    return <DollarOutlined style={{ color: '#8B5CF6' }} />;
  };

  const getCategoryName = (name: string) => {
    const categoryMap: { [key: string]: string } = {
      'maintenance': 'Manutenção',
      'fuel': 'Abastecimento',
      'repair': 'Reparo',
      'inspection': 'Inspeção',
      'expense': 'Despesa',
      'other': 'Outros',
      'total': 'Total'
    };
    return categoryMap[name] || name;
  };

  const formatValue = (value: number, name: string) => {
    if (name === 'total' || name.includes('gasto') || name.includes('custo')) {
      return currencyBRL(value);
    }
    if (name.includes('km') || name.includes('quilometragem')) {
      return `${value.toLocaleString('pt-BR')} km`;
    }
    if (name.includes('porcentagem') || name.includes('percent')) {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString('pt-BR');
  };

  const calculatePercentage = (value: number, total: number) => {
    if (total === 0) return 0;
    return (value / total) * 100;
  };

  const getTrendIndicator = (value: number, average: number) => {
    if (value > average * 1.1) {
      return { text: 'Acima da média', color: '#ff4d4f', icon: '↗️' };
    }
    if (value < average * 0.9) {
      return { text: 'Abaixo da média', color: '#52c41a', icon: '↘️' };
    }
    return { text: 'Na média', color: '#faad14', icon: '→' };
  };

  // Para gráficos de tendência, usar apenas o valor do "Total" para evitar duplicação
  const totalValue = payload.find(item => item.name === 'Total')?.value || 
                    payload.filter(item => item.value > 0).reduce((sum, item) => sum + item.value, 0);
  const trendInfo = additionalInfo?.average ? getTrendIndicator(totalValue, additionalInfo.average) : null;

  return (
    <div className={styles.tooltipContainer}>
      {/* Header */}
      <div className={styles.tooltipHeader}>
        <Space align="center" size="small">
          {customIcon || <CalendarOutlined style={{ color: '#8B5CF6', fontSize: '16px' }} />}
          <Title level={5} className={styles.tooltipTitle}>
            {label || 'Período'}
          </Title>
        </Space>
        {additionalInfo?.period && (
          <Text className={styles.tooltipPeriod}>
            {additionalInfo.period}
          </Text>
        )}
      </div>

      <Divider className={styles.tooltipDivider} />

      {/* Data Items */}
      <Space direction="vertical" size="small" style={{ width: '100%' }}>
        {payload
          .filter(item => item.value > 0) // Filtrar apenas itens com valor maior que zero
          .map((item, index) => {
            const categoryName = getCategoryName(item.name);
            const percentage = showPercentage && additionalInfo?.total 
              ? calculatePercentage(item.value, additionalInfo.total) 
              : 0;
            
            return (
              <div key={index} className={styles.tooltipDataItem}>
                <div className={styles.tooltipDataLabel}>
                  {getIconForType(categoryName)}
                  <Text className={styles.tooltipDataText}>
                    {categoryName}
                  </Text>
                  {showPercentage && percentage > 0 && (
                    <Text className={styles.tooltipPercentage}>
                      ({percentage.toFixed(1)}%)
                    </Text>
                  )}
                </div>
                <Text className={styles.tooltipDataValue}>
                  {formatValue(item.value, item.name)}
                </Text>
              </div>
            );
          })}
      </Space>

      {/* Total Section */}
      {payload.filter(item => item.value > 0).length > 1 || totalValue === 0 ? (
        <>
          <Divider className={styles.tooltipDivider} style={{ margin: '12px 0 8px 0' }} />
          <div className={styles.tooltipTotalSection}>
            <div className={styles.tooltipTotalLabel}>
              <DollarOutlined style={{ color: '#8B5CF6' }} />
              <Text>Total</Text>
            </div>
            <Text className={styles.tooltipTotalValue}>
              {formatValue(totalValue, 'total')}
            </Text>
          </div>
        </>
      ) : null}

      {/* Additional Information */}
      {additionalInfo && (
        <>
          {/* Só adiciona divider se não há seção de total */}
          {!(payload.filter(item => item.value > 0).length > 1 || totalValue === 0) && (
            <Divider className={styles.tooltipDivider} style={{ margin: '12px 0 8px 0' }} />
          )}
          <div className={styles.tooltipAdditionalInfo}>
            {additionalInfo.count !== undefined && (
              <div className={styles.tooltipInfoItem}>
                <Text className={styles.tooltipInfoLabel}>Registros:</Text>
                <Text className={styles.tooltipInfoValue}>
                  {additionalInfo.count}
                </Text>
              </div>
            )}
            {additionalInfo.average && (
              <div className={styles.tooltipInfoItem}>
                <Text className={styles.tooltipInfoLabel}>Média:</Text>
                <Text className={styles.tooltipInfoValue}>
                  {formatValue(additionalInfo.average, 'average')}
                </Text>
              </div>
            )}
            {trendInfo && (
              <div 
                className={styles.tooltipTrendIndicator}
                style={{ 
                  background: `rgba(${trendInfo.color === '#ff4d4f' ? '255, 77, 79' : trendInfo.color === '#52c41a' ? '82, 196, 26' : '250, 173, 20'}, 0.1)`,
                  border: `1px solid ${trendInfo.color}40`
                }}
              >
                <Text className={styles.tooltipTrendLabel}>Tendência:</Text>
                <div className={styles.tooltipTrendValue}>
                  <Text style={{ fontSize: '12px' }}>{trendInfo.icon}</Text>
                  <Text style={{ color: trendInfo.color, fontSize: '12px', fontWeight: 500 }}>
                    {trendInfo.text}
                  </Text>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default CustomTooltip;
