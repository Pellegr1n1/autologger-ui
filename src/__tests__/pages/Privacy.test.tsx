import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import PrivacyPage from '../../pages/Privacy/PrivacyPage';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        {ui}
      </ConfigProvider>
    </BrowserRouter>
  );
};

describe('PrivacyPage', () => {
  it('deve renderizar sem erros', () => {
    renderWithProviders(<PrivacyPage />);
    
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
  });

  it('deve exibir título da página', () => {
    renderWithProviders(<PrivacyPage />);
    
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
  });
});
