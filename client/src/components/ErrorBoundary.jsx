import { Component } from 'react';
import { RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return <main className="grid min-h-screen place-items-center p-6"><section className="panel max-w-md p-8 text-center"><h1 className="text-xl font-bold">Something went wrong</h1><p className="mt-2 text-sm text-slate-500">Please refresh the application and try again.</p><button className="btn-primary mt-6" onClick={() => window.location.reload()}><RefreshCw size={16} /> Refresh</button></section></main>;
    return this.props.children;
  }
}
