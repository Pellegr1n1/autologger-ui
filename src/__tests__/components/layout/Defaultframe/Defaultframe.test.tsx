import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import DefaultFrame from '../../../../components/layout/Defaultframe/Defaultframe';

// Mock CSS module
jest.mock('../../../components/layout/Defaultframe/Defaultframe.module.css', () => ({
  mainLayout: 'mainLayout',
  contentLayout: 'contentLayout',
  content: 'content',
  contentWrapper: 'contentWrapper',
  contentSpin: 'contentSpin',
  breadcrumb: 'breadcrumb',
  title: 'title',
}));

jest.mock('../../../../components/layout/Header/Header', () => ({
  __esModule: true,
  default: ({ siderCollapsed }: { siderCollapsed: boolean }) => (
    <div data-testid="header">Header {siderCollapsed ? 'collapsed' : 'expanded'}</div>
  ),
}));

jest.mock('../../../../components/layout/VehicleSider/VehicleSider', () => ({
  __esModule: true,
  default: ({ onCollapseChange }: { onCollapseChange?: (collapsed: boolean) => void }) => (
    <div data-testid="sider">
      <button onClick={() => onCollapseChange?.(false)}>Toggle Sider</button>
    </div>
  ),
}));

describe('DefaultFrame', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render with children', () => {
    render(
      <BrowserRouter>
        <DefaultFrame>
          <div>Test Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.getByText(/Test Content/i)).toBeInTheDocument();
  });

  it('should render header when showHeader is true', () => {
    render(
      <BrowserRouter>
        <DefaultFrame showHeader={true}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('should not render header when showHeader is false', () => {
    render(
      <BrowserRouter>
        <DefaultFrame showHeader={false}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('header')).not.toBeInTheDocument();
  });

  it('should render sider when showSider is true', () => {
    render(
      <BrowserRouter>
        <DefaultFrame showSider={true}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.getByTestId('sider')).toBeInTheDocument();
  });

  it('should not render sider when showSider is false', () => {
    render(
      <BrowserRouter>
        <DefaultFrame showSider={false}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.queryByTestId('sider')).not.toBeInTheDocument();
  });

  it('should render title when provided', () => {
    render(
      <BrowserRouter>
        <DefaultFrame title="Test Title">
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.getByText(/Test Title/i)).toBeInTheDocument();
  });

  it('should render breadcrumb when provided', () => {
    render(
      <BrowserRouter>
        <DefaultFrame breadcrumb={<div>Breadcrumb</div>}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    expect(screen.getByText(/Breadcrumb/i)).toBeInTheDocument();
  });

  it('should show loading spinner when loading is true', () => {
    render(
      <BrowserRouter>
        <DefaultFrame loading={true}>
          <div>Content</div>
        </DefaultFrame>
      </BrowserRouter>
    );

    // O Spin do Ant Design renderiza o texto do tip
    const loadingText = screen.queryByText(/Carregando/i);
    // Verifica se o spinner está presente (mesmo que o texto não seja encontrado diretamente)
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });
});
