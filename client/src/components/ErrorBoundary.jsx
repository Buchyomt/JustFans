import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error Caught by ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    localStorage.removeItem('justfans_auth_token');
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0e14] text-white flex items-center justify-center p-4">
          <div className="bg-[#131722] border border-[#273148] rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <AlertCircle className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-black">Something went wrong</h2>
            <p className="text-xs text-gray-400 leading-relaxed">
              An unexpected display error occurred while rendering the page. Click reload to refresh the view and restore your session.
            </p>
            <div className="space-y-2 pt-2">
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3 bg-[#00aff0] hover:bg-[#0094cc] text-black font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-2.5 bg-[#1a2133] hover:bg-[#242e44] text-gray-300 font-semibold text-xs rounded-xl border border-[#2c3750] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reset Cache & Go to Home Feed</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
