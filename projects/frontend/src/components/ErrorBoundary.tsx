import React, { ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error: error }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      const isAlgodError = this.state.error?.message.includes('Attempt to get default algod configuration')

      return (
        <div className="min-h-screen bg-surface-950 flex items-center justify-center p-6">
          <div className="card bg-base-200 shadow-xl max-w-lg w-full">
            <div className="card-body text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-surface-50 mb-2">Something went wrong</h1>
              {isAlgodError ? (
                <div className="text-left">
                  <p className="text-surface-400 mb-3">
                    Could not connect to the Algorand node. Please check your environment setup:
                  </p>
                  <div className="bg-base-300 rounded-lg p-4 text-sm font-mono text-surface-300">
                    <p>1. Create a <span className="text-brand-400">.env</span> file from <span className="text-brand-400">.env.template</span></p>
                    <p>2. Set <span className="text-brand-400">VITE_ALGOD_SERVER</span></p>
                    <p>3. Set <span className="text-brand-400">VITE_ALGOD_PORT</span></p>
                    <p>4. Set <span className="text-brand-400">VITE_ALGOD_NETWORK</span></p>
                  </div>
                </div>
              ) : (
                <p className="text-surface-400">{this.state.error?.message}</p>
              )}
              <div className="card-actions justify-center mt-6">
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  🔄 Reload Page
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
