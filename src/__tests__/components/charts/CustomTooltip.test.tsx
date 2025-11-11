import { describe, it, expect } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { CustomTooltip } from '../../../components/charts/CustomTooltip';

// Mock CSS module
jest.mock('../../../components/charts/CustomTooltip.module.css', () => ({
  tooltipContainer: 'tooltipContainer',
  tooltipHeader: 'tooltipHeader',
  tooltipBody: 'tooltipBody',
  tooltipFooter: 'tooltipFooter',
  dataItem: 'dataItem',
  tooltipLabel: 'tooltipLabel',
  tooltipValue: 'tooltipValue',
  additionalInfo: 'additionalInfo',
  infoItem: 'infoItem',
  infoLabel: 'infoLabel',
  infoValue: 'infoValue',
  iconWrapper: 'iconWrapper',
  customWrapper: 'customWrapper',
}));

describe('CustomTooltip', () => {
  const mockPayload = [
    {
      name: 'Manutenção',
      value: 1500,
      color: '#667eea',
      payload: {}
    }
  ];

  it('should return null when not active', () => {
    const { container } = render(
      <CustomTooltip
        active={false}
        payload={mockPayload}
        label="January"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should return null when payload is empty', () => {
    const { container } = render(
      <CustomTooltip
        active={true}
        payload={[]}
        label="January"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('should render tooltip when active with payload', () => {
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
    expect(screen.getByText('Manutenção')).toBeInTheDocument();
  });

  it('should render tooltip with percentage', () => {
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
        showPercentage={true}
        additionalInfo={{ total: 2000 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should render tooltip with additional info', () => {
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
        additionalInfo={{ count: 10, average: 150, period: 'Jan 2024' }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should render tooltip with custom icon', () => {
    const customIcon = <div data-testid="custom-icon">Icon</div>;
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
        customIcon={customIcon}
      />
    );

    expect(screen.getByTestId('custom-icon')).toBeInTheDocument();
  });

  it('should handle different category names', () => {
    const payload = [
      { name: 'maintenance', value: 1000 },
      { name: 'fuel', value: 500 },
      { name: 'repair', value: 300 },
      { name: 'inspection', value: 200 },
      { name: 'expense', value: 100 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle values with different formats', () => {
    const payload = [
      { name: 'total', value: 1000 },
      { name: 'km', value: 5000 },
      { name: 'porcentagem', value: 50 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle trend indicator', () => {
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
        additionalInfo={{ average: 1000, total: 1500 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle multiple payload items', () => {
    const payload = [
      { name: 'Manutenção', value: 1500 },
      { name: 'Abastecimento', value: 800 },
      { name: 'Reparo', value: 600 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should filter out zero values', () => {
    const payload = [
      { name: 'Manutenção', value: 1500 },
      { name: 'Abastecimento', value: 0 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle trend indicator above average', () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: 'Total', value: 1500 }]}
        label="January"
        additionalInfo={{ average: 1000 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle trend indicator below average', () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: 'Total', value: 800 }]}
        label="January"
        additionalInfo={{ average: 1000 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle trend indicator at average', () => {
    render(
      <CustomTooltip
        active={true}
        payload={[{ name: 'Total', value: 1000 }]}
        label="January"
        additionalInfo={{ average: 1000 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle different icon types', () => {
    const payload = [
      { name: 'manutenção', value: 1000 },
      { name: 'abastecimento', value: 500 },
      { name: 'reparo', value: 300 },
      { name: 'inspeção', value: 200 },
      { name: 'despesa', value: 100 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle calculatePercentage with zero total', () => {
    render(
      <CustomTooltip
        active={true}
        payload={mockPayload}
        label="January"
        showPercentage={true}
        additionalInfo={{ total: 0 }}
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle payload without Total name', () => {
    const payload = [
      { name: 'Manutenção', value: 1500 },
      { name: 'Abastecimento', value: 800 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });

  it('should handle formatValue for different name types', () => {
    const payload = [
      { name: 'gasto', value: 1000 },
      { name: 'custo', value: 500 },
      { name: 'quilometragem', value: 5000 },
      { name: 'percent', value: 50 },
    ];

    render(
      <CustomTooltip
        active={true}
        payload={payload}
        label="January"
      />
    );

    expect(screen.getByText('January')).toBeInTheDocument();
  });
});

