import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import Footer from '../../../components/layout/Footer/Footer';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <ConfigProvider>
        {ui}
      </ConfigProvider>
    </BrowserRouter>
  );
};

describe('Footer', () => {
  it('deve renderizar sem erros', () => {
    renderWithProviders(<Footer />);
    
    expect(screen.getByText('Links Rápidos')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByText('Redes Sociais')).toBeInTheDocument();
  });

  it('deve exibir links rápidos', () => {
    renderWithProviders(<Footer />);
    
    expect(screen.getByText('Sobre Nós')).toBeInTheDocument();
  });

  it('deve exibir links legais', () => {
    renderWithProviders(<Footer />);
    
    expect(screen.getByText('Termos de Uso')).toBeInTheDocument();
    expect(screen.getByText('Política de Privacidade')).toBeInTheDocument();
  });

  it('deve exibir links para termos e política', () => {
    renderWithProviders(<Footer />);
    
    const termsLink = screen.getByText('Termos de Uso');
    const privacyLink = screen.getByText('Política de Privacidade');
    
    expect(termsLink.closest('a')).toHaveAttribute('href', '/terms');
    expect(privacyLink.closest('a')).toHaveAttribute('href', '/privacy');
  });

  it('deve abrir links em nova aba', () => {
    renderWithProviders(<Footer />);
    
    const termsLink = screen.getByText('Termos de Uso');
    const privacyLink = screen.getByText('Política de Privacidade');
    
    expect(termsLink.closest('a')).toHaveAttribute('target', '_blank');
    expect(privacyLink.closest('a')).toHaveAttribute('target', '_blank');
  });

  it('deve ter rel="noopener noreferrer" nos links', () => {
    renderWithProviders(<Footer />);
    
    const termsLink = screen.getByText('Termos de Uso');
    const privacyLink = screen.getByText('Política de Privacidade');
    
    expect(termsLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
    expect(privacyLink.closest('a')).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('deve exibir links de redes sociais', () => {
    renderWithProviders(<Footer />);
    
    expect(screen.getByText('Redes Sociais')).toBeInTheDocument();
  });

  it('deve exibir copyright', () => {
    renderWithProviders(<Footer />);
    
    const currentYear = new Date().getFullYear();
    expect(screen.getByText(`© ${currentYear} AutoLogger. Todos os direitos reservados.`)).toBeInTheDocument();
  });

  it('deve ter links funcionais para GitHub e LinkedIn', () => {
    renderWithProviders(<Footer />);
    
    const githubLink = screen.getByLabelText('github');
    const linkedinLink = screen.getByLabelText('linkedin');
    
    expect(githubLink.closest('a')).toHaveAttribute('href', 'https://github.com/Pellegr1n1');
    expect(linkedinLink.closest('a')).toHaveAttribute('href', 'https://www.linkedin.com/in/leandro-pellegrini-fodi-1a15ba210/');
  });
});
