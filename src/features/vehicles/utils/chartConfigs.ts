import { PieConfig, ColumnConfig } from '@ant-design/charts'
import type { VehicleStats } from './vehicleStats'

export const getCategoryChartConfig = (stats: VehicleStats): PieConfig => {
  return {
    data: Object.entries(stats.eventsByCategory).map(([category, count]) => ({
      type: category,
      value: count
    })),
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    label: {
      type: 'outer',
      content: '{name} {percentage}',
      style: {
        fill: '#FFFFFF',
        fontSize: 12,
        fontWeight: 500,
      },
    },
    interactions: [
      {
        type: 'element-active',
      },
    ],
    theme: {
      colors10: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE', '#F3E8FF', '#F5F3FF', '#FAF5FF', '#FEF3C7', '#FDE68A'],
    },
  }
}

export const getMonthlyChartConfig = (_stats: VehicleStats): ColumnConfig => {
  const monthlyData = [
    { month: 'Jan', value: 0 },
    { month: 'Fev', value: 0 },
    { month: 'Mar', value: 0 },
    { month: 'Abr', value: 0 },
    { month: 'Mai', value: 0 },
    { month: 'Jun', value: 0 },
    { month: 'Jul', value: 0 },
    { month: 'Ago', value: 0 },
    { month: 'Set', value: 0 },
    { month: 'Out', value: 0 },
    { month: 'Nov', value: 0 },
    { month: 'Dez', value: 0 },
  ]

  return {
    data: monthlyData,
    xField: 'month',
    yField: 'value',
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontSize: 11,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: '#9CA3AF',
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#9CA3AF',
        },
      },
    },
    meta: {
      value: {
        alias: 'Custo (R$)',
      },
    },
    theme: {
      colors10: ['#8B5CF6'],
    },
  }
}

export const getMileageChartConfig = (_stats: VehicleStats): ColumnConfig => {
  const mileageData = [
    { month: 'Jan', km: 0 },
    { month: 'Fev', km: 0 },
    { month: 'Mar', km: 0 },
    { month: 'Abr', km: 0 },
    { month: 'Mai', km: 0 },
    { month: 'Jun', km: 0 },
    { month: 'Jul', km: 0 },
    { month: 'Ago', km: 0 },
    { month: 'Set', km: 0 },
    { month: 'Out', km: 0 },
    { month: 'Nov', km: 0 },
    { month: 'Dez', km: 0 },
  ]

  return {
    data: mileageData,
    xField: 'month',
    yField: 'km',
    label: {
      position: 'top',
      style: {
        fill: '#FFFFFF',
        opacity: 0.8,
        fontSize: 11,
      },
    },
    xAxis: {
      label: {
        autoHide: true,
        autoRotate: false,
        style: {
          fill: '#9CA3AF',
        },
      },
    },
    yAxis: {
      label: {
        style: {
          fill: '#9CA3AF',
        },
      },
    },
    meta: {
      km: {
        alias: 'Quilometragem (km)',
      },
    },
    theme: {
      colors10: ['#10B981'],
    },
  }
}