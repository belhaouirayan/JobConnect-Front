// src/Components/3D/Scene3DErrorBoundary.jsx
import React from 'react';

/**
 * React Error Boundary for 3D components that may crash
 * from unexpected data shapes or WebGL issues.
 */
export class Scene3DErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('[3D Scene Crash]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', background: 'linear-gradient(135deg, #1a1a2e, #16213e)',
            color: '#e2e8f0', fontFamily: 'Inter, sans-serif', padding: '2rem',
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔧</div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Scene temporarily unavailable</h3>
              <p style={{ opacity: 0.7, marginTop: '0.5rem' }}>
                We encountered an issue rendering the 3D view.
              </p>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  marginTop: '1rem', padding: '0.5rem 1.5rem',
                  background: 'rgba(99, 102, 241, 0.3)', border: '1px solid rgba(99, 102, 241, 0.5)',
                  borderRadius: '0.5rem', color: '#e2e8f0', cursor: 'pointer',
                }}
              >
                Retry
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
