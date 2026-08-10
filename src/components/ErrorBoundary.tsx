import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Renders a visible diagnostic panel instead of a blank/black screen when the
 * app throws at runtime. Helps distinguish "runtime crash" from "asset failed
 * to load" during local preview.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: unknown) {
    // eslint-disable-next-line no-console
    console.error('[DigitalGrave] runtime error:', error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: '32px',
            background: '#1a0000',
            color: '#ff6b6b',
            fontFamily: 'monospace',
            minHeight: '100vh',
            boxSizing: 'border-box',
          }}
        >
          <h1 style={{ fontSize: 20, margin: '0 0 12px' }}>⚠ 运行时错误（黑屏诊断）</h1>
          <p style={{ opacity: 0.8, marginTop: 0 }}>
            如果你看到这行而不是黑屏，说明资源已加载，是代码运行时报错：
          </p>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12 }}>{this.state.error.message}</pre>
          <pre style={{ whiteSpace: 'pre-wrap', marginTop: 12, opacity: 0.6, fontSize: 12 }}>
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}
