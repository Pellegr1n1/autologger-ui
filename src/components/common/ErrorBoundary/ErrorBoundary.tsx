import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #0D1117 0%, #161B22 50%, #1F2937 100%)',
          color: '#F9FAFB',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h2 style={{ margin: 0, fontSize: '24px' }}>Algo deu errado</h2>
          <p style={{ margin: 0, color: '#9CA3AF' }}>Erro ao carregar animação 3D</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            style={{
              padding: '10px 20px',
              background: '#8B5CF6',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
