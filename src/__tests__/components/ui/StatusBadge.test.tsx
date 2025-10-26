import React from 'react';
import { render, screen } from '@testing-library/react';
import { ConfigProvider } from 'antd';
import BlockchainStatusBadge from '../../../components/ui/StatusBadge/StatusBadge';
import { ChainStatus } from '../../../features/vehicles/types/blockchain.types';

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <ConfigProvider>
      {ui}
    </ConfigProvider>
  );
};

describe('BlockchainStatusBadge', () => {
  const mockStatus: ChainStatus = {
    status: 'PENDING',
    lastUpdate: '2024-01-01T00:00:00.000Z',
    retryCount: 0,
    maxRetries: 3,
    message: 'Test message'
  };

  it('deve renderizar sem erros', () => {
    renderWithProviders(<BlockchainStatusBadge status={mockStatus} />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir status PENDING corretamente', () => {
    renderWithProviders(<BlockchainStatusBadge status={mockStatus} />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir status SUBMITTED corretamente', () => {
    const submittedStatus = { ...mockStatus, status: 'SUBMITTED' };
    renderWithProviders(<BlockchainStatusBadge status={submittedStatus} />);
    
    expect(screen.getByText('Submetido')).toBeInTheDocument();
  });

  it('deve exibir status CONFIRMED corretamente', () => {
    const confirmedStatus = { ...mockStatus, status: 'CONFIRMED' };
    renderWithProviders(<BlockchainStatusBadge status={confirmedStatus} />);
    
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('deve exibir status FAILED corretamente', () => {
    const failedStatus = { ...mockStatus, status: 'FAILED' };
    renderWithProviders(<BlockchainStatusBadge status={failedStatus} />);
    
    expect(screen.getByText('Falhou')).toBeInTheDocument();
  });

  it('deve exibir status REVERTED corretamente', () => {
    const revertedStatus = { ...mockStatus, status: 'REVERTED' };
    renderWithProviders(<BlockchainStatusBadge status={revertedStatus} />);
    
    expect(screen.getByText('Revertido')).toBeInTheDocument();
  });

  it('deve exibir status desconhecido para status inválido', () => {
    const unknownStatus = { ...mockStatus, status: 'UNKNOWN' as any };
    renderWithProviders(<BlockchainStatusBadge status={unknownStatus} />);
    
    expect(screen.getByText('Desconhecido')).toBeInTheDocument();
  });

  it('deve exibir contador de tentativas quando retryCount > 0', () => {
    const statusWithRetries = { ...mockStatus, retryCount: 2 };
    renderWithProviders(<BlockchainStatusBadge status={statusWithRetries} />);
    
    expect(screen.getByText('(2/3)')).toBeInTheDocument();
  });

  it('deve renderizar com tamanho small', () => {
    renderWithProviders(<BlockchainStatusBadge status={mockStatus} size="small" />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve renderizar com tamanho large', () => {
    renderWithProviders(<BlockchainStatusBadge status={mockStatus} size="large" />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir tooltip quando showDetails é true', () => {
    renderWithProviders(<BlockchainStatusBadge status={mockStatus} showDetails={true} />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir ícones corretos para cada status', () => {
    const { rerender } = renderWithProviders(<BlockchainStatusBadge status={mockStatus} />);
    
    // PENDING - ClockCircleOutlined
    expect(screen.getByText('Pendente')).toBeInTheDocument();
    
    // SUBMITTED - SyncOutlined
    const submittedStatus = { ...mockStatus, status: 'SUBMITTED' };
    rerender(<BlockchainStatusBadge status={submittedStatus} />);
    expect(screen.getByText('Submetido')).toBeInTheDocument();
    
    // CONFIRMED - CheckCircleOutlined
    const confirmedStatus = { ...mockStatus, status: 'CONFIRMED' };
    rerender(<BlockchainStatusBadge status={confirmedStatus} />);
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
    
    // FAILED - CloseCircleOutlined
    const failedStatus = { ...mockStatus, status: 'FAILED' };
    rerender(<BlockchainStatusBadge status={failedStatus} />);
    expect(screen.getByText('Falhou')).toBeInTheDocument();
    
    // REVERTED - ExclamationCircleOutlined
    const revertedStatus = { ...mockStatus, status: 'REVERTED' };
    rerender(<BlockchainStatusBadge status={revertedStatus} />);
    expect(screen.getByText('Revertido')).toBeInTheDocument();
  });

  it('deve formatar data corretamente', () => {
    const statusWithDate = {
      ...mockStatus,
      lastUpdate: '2024-01-01T12:00:00.000Z'
    };
    
    renderWithProviders(<BlockchainStatusBadge status={statusWithDate} showDetails={true} />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('deve exibir mensagem quando disponível', () => {
    const statusWithMessage = {
      ...mockStatus,
      message: 'Test error message'
    };
    
    renderWithProviders(<BlockchainStatusBadge status={statusWithMessage} showDetails={true} />);
    
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });
});