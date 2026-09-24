import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    console.error("Caught by ErrorBoundary:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-screen bg-graphite flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-panel border border-line rounded-panel p-6 text-center">
            <div className="text-3xl mb-4">⚠️</div>
            <h1 className="font-display text-lg font-semibold text-paper mb-2">Something went wrong</h1>
            <p className="text-sm text-muted mb-6">
              An unexpected error occurred. You can try reloading, or head back to the chat.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full py-2.5 rounded-lg bg-signal hover:bg-signalBright text-paper text-sm font-medium transition-colors"
            >
              Reload app
            </button>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}