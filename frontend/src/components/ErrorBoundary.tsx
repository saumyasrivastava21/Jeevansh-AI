import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[React Runtime Crash]:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/dashboard';
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
          <div className="max-w-md w-full space-y-6 p-8 rounded-2xl border border-primary/20 bg-background/50 backdrop-blur-xl shadow-2xl">
            <div className="w-16 h-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4 animate-bounce">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">Something went wrong</h2>
              <p className="text-sm text-muted-foreground">
                Jeevansh AI encountered an unexpected runtime script exception.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-muted rounded-xl border border-border text-left">
                <p className="text-[11px] font-mono text-destructive truncate">
                  Error: {this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="rounded-xl h-11 gap-2 border-border"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </Button>
              <Button
                variant="medical"
                onClick={this.handleReset}
                className="rounded-xl h-11 gap-2"
              >
                <Home className="w-4 h-4" />
                Return to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
