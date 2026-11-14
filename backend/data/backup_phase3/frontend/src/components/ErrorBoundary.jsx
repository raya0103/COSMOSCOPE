import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#070D1E',
          color: '#ffffff',
          padding: '40px',
          fontFamily: 'monospace'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '16px',
            padding: '24px'
          }}>
            <h1 style={{ color: '#F87171', fontSize: '20px', marginBottom: '12px' }}>
              COSMOSCOPE — Runtime Error
            </h1>
            <p style={{ color: '#FCA5A5', fontSize: '14px', marginBottom: '16px' }}>
              {this.state.error?.toString()}
            </p>
            <pre style={{
              background: '#030712',
              padding: '16px',
              borderRadius: '8px',
              overflow: 'auto',
              fontSize: '12px',
              color: '#94A3B8'
            }}>
              {this.state.errorInfo?.componentStack}
            </pre>
            <button
              onClick={() => window.location.reload()}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#00F0FF',
                color: '#030712',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
