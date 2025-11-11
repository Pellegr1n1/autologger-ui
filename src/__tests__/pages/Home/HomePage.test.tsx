import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '../../../features/auth/components/AuthContext';
import HomePage from '../../../pages/Home/HomePage';

jest.mock('../../../components/layout/Header/Header', () => {
  return function MockHeader() {
    return <div data-testid="header">Header Component</div>;
  };
});

jest.mock('../../../components/layout/Footer/Footer', () => {
  return function MockFooter() {
    return <div data-testid="footer">Footer Component</div>;
  };
});

jest.mock('../../../components/layout/Sider/Sider', () => {
  return function MockSider() {
    return <div data-testid="sider">Sider Component</div>;
  };
});

jest.mock('../../../components/layout/Defaultframe/Defaultframe', () => {
  return function MockDefaultframe() {
    return <div data-testid="defaultframe">Defaultframe Component</div>;
  };
});

jest.mock('../../../components/layout/VehicleSider/VehicleSider', () => {
  return function MockVehicleSider() {
    return <div data-testid="vehicle-sider">VehicleSider Component</div>;
  };
});

jest.mock('../../../features/auth/components/AuthContext', () => ({
  useAuth: () => ({
    user: {
      id: '1',
      name: 'João Silva',
      email: 'joao@test.com',
    },
    isAuthenticated: true,
    loading: false,
  }),
  AuthProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const mockTheme = {
  token: {
    colorPrimary: '#8B5CF6',
    colorInfo: '#A78BFA',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgContainer: '#161B22',
    colorBgBase: '#0D1117',
    colorBgLayout: '#0D1117',
    colorText: '#F9FAFB',
    colorTextSecondary: '#6B7280',
    colorBorder: '#6B7280',
    borderRadius: 8,
  },
  components: {
    Layout: {
      siderBg: '#161B22',
      headerBg: '#161B22',
      bodyBg: '#0D1117',
    },
  },
};

const render = (ui: React.ReactElement) => {
  return rtlRender(
    <BrowserRouter>
      <ConfigProvider theme={mockTheme}>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};

describe('HomePage', () => {
  it('deve renderizar sem erros', () => {
    render(<HomePage />);
    expect(screen.getAllByText('AutoLogger')).toHaveLength(2);
  });

  it('deve exibir título principal', () => {
    render(<HomePage />);
    expect(screen.getByText('Revolucione')).toBeInTheDocument();
    expect(screen.getByText('a Gestão Veicular com Blockchain')).toBeInTheDocument();
  });

  it('deve exibir descrição da aplicação', () => {
    render(<HomePage />);
    expect(screen.getByText(/A AutoLogger oferece uma solução inovadora/)).toBeInTheDocument();
  });

  it('deve exibir links de navegação', () => {
    render(<HomePage />);
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Registrar')).toBeInTheDocument();
  });
});
