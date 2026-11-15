import React from 'react';
import { AlertCircle, RefreshCw, Home, ChevronDown } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, showDetails: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      const errorMessage = this.state.error?.message || String(this.state.error) || 'Unknown render error';
      const errorStack = this.state.error?.stack || this.state.errorInfo?.componentStack || '';

      return (
        <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-6 sm:p-8 max-w-lg w-full text-center shadow-2xl space-y-4">
            
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>

            <h2 className="text-xl font-black text-white">Something went wrong</h2>
            
            <p className="text-xs text-gray-400 leading-relaxed">
              An unexpected display error occurred while rendering the page. Click reset cache below to restore your session.
            </p>

            {/* Error Message Box */}
            <div className="p-3.5 bg-rose-950/40 border border-rose-900/60 rounded-2xl text-left">
              <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                <span>Error Details:</span>
                <button
                  type="button"
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="text-[10px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>{this.state.showDetails ? 'Hide Stack' : 'Show Stack'}</span>
                  <ChevronDown className={`w-3 h-3 transition-transform ${this.state.showDetails ? 'rotate-180' : ''}`} />
                </button>
              </div>
              <p className="text-xs font-mono text-rose-200 break-words font-semibold">
                {errorMessage}
              </p>
              {this.state.showDetails && errorStack && (
                <pre className="mt-2 text-[10px] font-mono text-gray-400 bg-black/60 p-2 rounded-lg max-h-48 overflow-y-auto whitespace-pre-wrap break-words">
                  {errorStack}
                </pre>
              )}
            </div>

            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reset Cache & Restore Session</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false, error: null });
                  window.location.reload();
                }}
                className="w-full py-2.5 bg-[#1a2133] hover:bg-[#242e44] text-gray-300 font-semibold text-xs rounded-xl border border-[#2c3750] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reload Page</span>
              </button>
            </div>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
