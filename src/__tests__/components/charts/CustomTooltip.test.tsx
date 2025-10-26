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
});

