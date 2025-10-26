import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import TermsPage from '../../pages/Terms/TermsPage';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        {ui}
      </ConfigProvider>
    </BrowserRouter>
  );
};

describe('TermsPage', () => {
  it('deve renderizar sem erros', () => {
    renderWithProviders(<TermsPage />);
    
    expect(screen.getByText('Termos de Uso')).toBeInTheDocument();
  });

  it('deve exibir título da página', () => {
    renderWithProviders(<TermsPage />);
    
    expect(screen.getByText('Termos de Uso')).toBeInTheDocument();
  });
});
