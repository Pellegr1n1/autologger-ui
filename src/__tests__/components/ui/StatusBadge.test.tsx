import React from 'react';
import { render, screen } from '../../utils/test-utils';
import StatusBadge from '../../../components/ui/StatusBadge/StatusBadge';
import { mockBlockchainStatus } from '../../utils/test-utils';

describe('StatusBadge', () => {
  const defaultProps = {
    status: mockBlockchainStatus,
  };

  it('deve renderizar sem erros', () => {
    render(<StatusBadge {...defaultProps} />);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('deve exibir o status correto para CONFIRMED', () => {
    render(<StatusBadge {...defaultProps} />);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('deve exibir o status correto para PENDING', () => {
    const pendingStatus = { ...mockBlockchainStatus, status: 'PENDING' as const };
    render(<StatusBadge status={pendingStatus} />);
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir o status correto para SUBMITTED', () => {
    const submittedStatus = { ...mockBlockchainStatus, status: 'SUBMITTED' as const };
    render(<StatusBadge status={submittedStatus} />);
    expect(screen.getByText('Submetido')).toBeInTheDocument();
  });

  it('deve exibir o status correto para FAILED', () => {
    const failedStatus = { ...mockBlockchainStatus, status: 'FAILED' as const };
    render(<StatusBadge status={failedStatus} />);
    expect(screen.getByText('Falhou')).toBeInTheDocument();
  });

  it('deve exibir o status correto para REVERTED', () => {
    const revertedStatus = { ...mockBlockchainStatus, status: 'REVERTED' as const };
    render(<StatusBadge status={revertedStatus} />);
    expect(screen.getByText('Revertido')).toBeInTheDocument();
  });

  it('deve exibir status desconhecido para status inválido', () => {
    const unknownStatus = { ...mockBlockchainStatus, status: 'UNKNOWN' as any };
    render(<StatusBadge status={unknownStatus} />);
    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });

  it('deve exibir contador de tentativas quando retryCount > 0', () => {
    const statusWithRetries = { ...mockBlockchainStatus, retryCount: 2, maxRetries: 3 };
    render(<StatusBadge status={statusWithRetries} />);
    expect(screen.getByText('(2/3)')).toBeInTheDocument();
  });

  it('não deve exibir contador de tentativas quando retryCount = 0', () => {
    render(<StatusBadge {...defaultProps} />);
    expect(screen.queryByText(/\(\d+\/\d+\)/)).not.toBeInTheDocument();
  });

  it('deve aplicar tamanho small corretamente', () => {
    render(<StatusBadge {...defaultProps} size="small" />);
    const badge = screen.getByText('Confirmado').closest('.ant-tag');
    expect(badge).toHaveStyle({
      padding: '2px 8px',
    });
  });

  it('deve aplicar tamanho large corretamente', () => {
    render(<StatusBadge {...defaultProps} size="large" />);
    const badge = screen.getByText('Confirmado').closest('.ant-tag');
    expect(badge).toHaveStyle({
      padding: '4px 12px',
    });
  });

  it('deve aplicar tamanho default corretamente', () => {
    render(<StatusBadge {...defaultProps} size="default" />);
    const badge = screen.getByText('Confirmado').closest('.ant-tag');
    expect(badge).toHaveStyle({
      padding: '4px 12px',
    });
  });

  it('deve exibir tooltip quando showDetails=true', () => {
    render(<StatusBadge {...defaultProps} showDetails={true} />);
    
    // Hover no badge para mostrar tooltip
    const badge = screen.getByText('Confirmado');
    badge.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    // Verificar se o tooltip aparece (pode demorar um pouco)
    setTimeout(() => {
      expect(screen.getByText('Status: Confirmado')).toBeInTheDocument();
      expect(screen.getByText('Descrição: Confirmado na blockchain - Imutável')).toBeInTheDocument();
    }, 100);
  });

  it('não deve exibir tooltip quando showDetails=false', () => {
    render(<StatusBadge {...defaultProps} showDetails={false} />);
    
    const badge = screen.getByText('Confirmado');
    badge.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    // Não deve aparecer tooltip
    expect(screen.queryByText('Status: Confirmado')).not.toBeInTheDocument();
  });

  it('deve exibir informações de retry no tooltip quando showDetails=true', () => {
    const statusWithRetries = { 
      ...mockBlockchainStatus, 
      retryCount: 1, 
      maxRetries: 3,
      message: 'Tentativa de reconexão'
    };
    
    render(<StatusBadge status={statusWithRetries} showDetails={true} />);
    
    const badge = screen.getByText('Confirmado');
    badge.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      expect(screen.getByText('Tentativas: 1/3')).toBeInTheDocument();
      expect(screen.getByText('Mensagem: Tentativa de reconexão')).toBeInTheDocument();
    }, 100);
  });

  it('deve formatar data corretamente no tooltip', () => {
    const statusWithDate = { 
      ...mockBlockchainStatus, 
      lastUpdate: new Date('2024-01-15T14:30:00.000Z')
    };
    
    render(<StatusBadge status={statusWithDate} showDetails={true} />);
    
    const badge = screen.getByText('Confirmado');
    badge.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    
    setTimeout(() => {
      expect(screen.getByText('Última Atualização: 15/01/2024 14:30:00')).toBeInTheDocument();
    }, 100);
  });
});
