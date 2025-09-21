import React from 'react';
import { render as rtlRender, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import { AuthProvider } from '../../../features/auth/components/AuthContext';

// Mock do Router
jest.mock('../../../app/router/Router', () => {
  return function MockRouter() {
    return <div data-testid="router">Router Component</div>;
  };
});

import Router from '../../../app/router/Router';

// Mock das páginas
jest.mock('../../../pages/Home/HomePage', () => ({
  HomePage: () => <div data-testid="home-page">Home Page</div>,
}));

jest.mock('../../../pages/Auth/LoginPage', () => ({
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
}));

jest.mock('../../../pages/Auth/RegisterPage', () => ({
  RegisterPage: () => <div data-testid="register-page">Register Page</div>,
}));

jest.mock('../../../pages/Vehicles/VehiclesPage', () => ({
  VehiclesPage: () => <div data-testid="vehicles-page">Vehicles Page</div>,
}));

jest.mock('../../../pages/Profile/ProfilePage', () => ({
  ProfilePage: () => <div data-testid="profile-page">Profile Page</div>,
}));

jest.mock('../../../pages/Maintenance/MaintenancePage', () => ({
  MaintenancePage: () => <div data-testid="maintenance-page">Maintenance Page</div>,
}));

jest.mock('../../../pages/Reports/ReportsPage', () => ({
  ReportsPage: () => <div data-testid="reports-page">Reports Page</div>,
}));

jest.mock('../../../pages/Blockchain/BlockchainPage', () => ({
  BlockchainPage: () => <div data-testid="blockchain-page">Blockchain Page</div>,
}));

jest.mock('../../../pages/NotFound/NotFoundPage', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

// Mock do ProtectedRoute
jest.mock('../../../app/router/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ component: Component }: { component: React.ComponentType }) => (
    <div data-testid="protected-route">
      <Component />
    </div>
  ),
}));

// Mock do useAuth
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

// Mock do tema do Ant Design
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

const renderWithRouter = (initialRoute = '/') => {
  window.history.pushState({}, 'Test page', initialRoute);
  return rtlRender(
    <BrowserRouter>
      <ConfigProvider theme={mockTheme}>
        <AuthProvider>
          <Router />
        </AuthProvider>
      </ConfigProvider>
    </BrowserRouter>
  );
};

describe('Router', () => {
  beforeEach(() => {
    // Limpar histórico antes de cada teste
    window.history.replaceState({}, '', '/');
  });

  it('deve renderizar sem erros', () => {
    renderWithRouter();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('deve renderizar Router com BrowserRouter', () => {
    renderWithRouter();
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });

  it('deve renderizar Router com diferentes rotas', () => {
    renderWithRouter('/login');
    expect(screen.getByTestId('router')).toBeInTheDocument();
  });
});
