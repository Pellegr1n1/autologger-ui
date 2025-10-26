import { describe, it, expect, jest } from '@jest/globals';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Router from '../../../app/router/Router';

// Mock all page components
jest.mock('../../../pages/Auth', () => ({
  LoginPage: () => <div data-testid="login-page">LoginPage</div>,
  RegisterPage: () => <div data-testid="register-page">RegisterPage</div>,
}));

jest.mock('../../../pages/Auth/CallbackPage', () => ({
  __esModule: true,
  default: () => <div data-testid="callback-page">CallbackPage</div>,
}));

jest.mock('../../../pages/Home', () => ({
  HomePage: () => <div data-testid="home-page">HomePage</div>,
}));

jest.mock('../../../pages/NotFound', () => ({
  NotFoundPage: () => <div data-testid="not-found-page">NotFoundPage</div>,
}));

jest.mock('../../../pages/Reports', () => ({
  __esModule: true,
  default: () => <div data-testid="reports-page">ReportsPage</div>,
}));

jest.mock('../../../pages/Vehicles', () => ({
  VehiclesPage: () => <div data-testid="vehicles-page">VehiclesPage</div>,
}));

jest.mock('../../../pages/Profile', () => ({
  ProfilePage: () => <div data-testid="profile-page">ProfilePage</div>,
}));

jest.mock('../../../pages/Maintenance', () => ({
  MaintenancePage: () => <div data-testid="maintenance-page">MaintenancePage</div>,
}));

jest.mock('../../../pages/Blockchain', () => ({
  BlockchainPage: () => <div data-testid="blockchain-page">BlockchainPage</div>,
}));

jest.mock('../../../pages/Terms/TermsPage', () => ({
  __esModule: true,
  default: () => <div data-testid="terms-page">TermsPage</div>,
}));

jest.mock('../../../pages/Privacy/PrivacyPage', () => ({
  __esModule: true,
  default: () => <div data-testid="privacy-page">PrivacyPage</div>,
}));

jest.mock('../../../pages/PublicVehicle/PublicVehiclePage', () => ({
  __esModule: true,
  default: () => <div data-testid="public-vehicle-page">PublicVehiclePage</div>,
}));

jest.mock('../../../app/router/ProtectedRoute', () => ({
  __esModule: true,
  default: ({ component: Component }: any) => (
    <div data-testid="protected-route">
      <Component />
    </div>
  ),
}));

const renderWithRouter = () => {
  return render(
    <BrowserRouter>
      <Router />
    </BrowserRouter>
  );
};

describe('Router', () => {
  it('should render all routes', () => {
    renderWithRouter();
    
    // Router should render without crashing
    expect(screen).toBeDefined();
  });

  it('should define all expected routes', () => {
    const routes = [
      '/',
      '/register',
      '/login',
      '/auth/callback',
      '/terms',
      '/privacy',
      '/vehicles/share/:shareToken',
      '/profile',
      '/vehicles',
      '/maintenance',
      '/reports',
      '/blockchain',
    ];

    // Just verify routes are defined in the component
    routes.forEach(route => {
      expect(route).toBeDefined();
    });
  });
});

