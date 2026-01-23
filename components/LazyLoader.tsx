/**
 * Componente LazyLoader con Suspense mejorado
 * Reduce el tiempo de carga inicial usando code splitting
 */
import React, { Suspense, lazy } from 'react';
import { Loader2 } from 'lucide-react';

interface LazyLoaderProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Spinner de carga minimalista
 */
const DefaultLoader: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950">
      <div className="flex flex-col items-center gap-6 animate-in fade-in duration-700">
        <div className="relative">
          {/* Spinner animado */}
          <Loader2
            size={64}
            className="text-indigo-500 animate-spin"
            strokeWidth={2.5}
          />

          {/* Glow effect */}
          <div className="absolute inset-0 blur-2xl bg-indigo-500/30 animate-pulse" />
        </div>

        {/* Texto de carga */}
        <div className="flex flex-col items-center gap-2">
          <p className="text-white font-black text-lg tracking-wider animate-pulse">
            Cargando PomoSmart
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * LazyLoader Component
 */
export const LazyLoader: React.FC<LazyLoaderProps> = ({ children, fallback }) => {
  return (
    <Suspense fallback={fallback || <DefaultLoader />}>
      {children}
    </Suspense>
  );
};

/**
 * Hook para lazy loading de componentes
 * Incluye retry automático en caso de error de red
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  componentImport: () => Promise<{ default: T }>,
  componentName: string = 'Component'
): React.LazyExoticComponent<T> {
  return lazy(() => {
    return new Promise<{ default: T }>((resolve, reject) => {
      // Intentar cargar el componente
      const attempt = (retryCount = 0) => {
        componentImport()
          .then(resolve)
          .catch((error) => {
            // Si falla por error de red, reintentar hasta 3 veces
            if (retryCount < 3) {
              console.log(`⚠️ Error cargando ${componentName}, reintentando... (${retryCount + 1}/3)`);
              setTimeout(() => {
                attempt(retryCount + 1);
              }, 1000 * (retryCount + 1)); // Backoff exponencial
            } else {
              console.error(`❌ Error cargando ${componentName} después de 3 intentos:`, error);
              reject(error);
            }
          });
      };

      attempt();
    });
  });
}

/**
 * Componente de error boundary para lazy loading
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class LazyErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: (error: Error) => React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('LazyErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback && this.state.error) {
        return this.props.fallback(this.state.error);
      }

      return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-950">
          <div className="max-w-md p-8 bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-red-500/20">
            <div className="text-center">
              <div className="inline-flex p-4 bg-red-500/20 rounded-2xl mb-4">
                <svg
                  className="w-12 h-12 text-red-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="text-2xl font-black text-white mb-2">
                Error al Cargar
              </h2>
              <p className="text-slate-400 mb-6">
                {this.state.error?.message || 'Ocurrió un error inesperado'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors"
              >
                Recargar Página
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default LazyLoader;
