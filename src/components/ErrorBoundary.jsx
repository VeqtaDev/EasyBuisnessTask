import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#000',
          color: '#fff',
          padding: '20px',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold' }}>Une erreur s'est produite</h1>
          <pre style={{
            backgroundColor: '#1a1a1a',
            padding: '20px',
            borderRadius: '8px',
            overflow: 'auto',
            maxWidth: '800px',
            fontSize: '12px'
          }}>
            {this.state.error?.toString()}
            {this.state.error?.stack}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '10px 20px',
              backgroundColor: '#fff',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Recharger la page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

