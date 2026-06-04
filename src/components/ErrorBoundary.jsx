import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught:', error, info);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{ backgroundColor: '#141720' }}
          className="rounded-xl border border-red-500/30 p-6 flex flex-col items-center justify-center gap-4 min-h-[180px] text-center"
        >
          <div className="w-10 h-10 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <p className="text-sm font-mono text-red-400 max-w-xs">
            Analysis failed to render. Try re-analyzing or refreshing.
          </p>
          <button
            onClick={this.handleRetry}
            className="text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-lg border transition-colors"
            style={{ borderColor: '#EF4444', color: '#EF4444', background: 'rgba(239,68,68,0.08)' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
          >
            Retry
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
