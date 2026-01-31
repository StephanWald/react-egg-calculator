import * as React from 'react';

/**
 * ErrorBoundary - React class component for catching rendering errors
 *
 * Catches errors during rendering, in lifecycle methods, and in constructors
 * of the whole tree below them. Does NOT catch errors in event handlers,
 * async code, or server-side rendering.
 *
 * Usage:
 *   <ErrorBoundary fallback={<CustomError />}>
 *     <Component />
 *   </ErrorBoundary>
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children - Components to render
 * @param {React.ReactNode} props.fallback - Optional custom error UI
 */
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  // Called during render phase - must be pure, no side effects
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  // Called during commit phase - can have side effects (logging)
  componentDidCatch(error, errorInfo) {
    // Log to console (no external error service per requirements)
    console.error('Error boundary caught:', {
      error,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided, otherwise default error UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback with app-consistent amber/orange theme
      return (
        <div className="p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 shadow-md">
          <div className="text-center">
            <div className="text-4xl mb-3">⚠️</div>
            <h2 className="text-lg font-semibold text-amber-900 mb-2">
              Something went wrong
            </h2>
            <p className="text-sm text-amber-700">
              Please refresh the page to continue
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
