import React, { Component, ErrorInfo, ReactNode } from 'react';
import { SystemLogger } from '../services/Logger';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

/**
 * ErrorBoundary
 * 
 * Catches JavaScript errors anywhere in their child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        // Update state so the next render will show the fallback UI.
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log the error to our logging service
        SystemLogger.error('Uncaught error in component tree:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            // Fallback UI
            return (
                <div style={{
                    height: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'var(--color-bg)',
                    color: 'var(--color-text)',
                    textAlign: 'center',
                    padding: '2rem'
                }}>
                    <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Oops, something went wrong.</h2>
                    <p style={{ color: 'var(--color-text-dim)', marginBottom: '2rem' }}>
                        We encountered an unexpected error. Please try refreshing the page.
                    </p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <details style={{ marginTop: '2rem', textAlign: 'left', background: '#000', padding: '1rem', borderRadius: '8px', maxWidth: '800px', overflow: 'auto' }}>
                            <summary style={{ cursor: 'pointer', color: '#f87171' }}>Error Details (Dev Only)</summary>
                            <pre style={{ marginTop: '1rem', whiteSpace: 'pre-wrap', color: '#ef4444' }}>
                                {this.state.error.toString()}
                            </pre>
                        </details>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}
