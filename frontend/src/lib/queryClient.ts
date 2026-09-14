import { QueryClient } from '@tanstack/react-query';
import { getErrorMessage } from './errors';

/**
 * Matches domain errors that should not be retried (not found / duplicate).
 * Wails IPC rejects with plain string messages, so classification relies on
 * the message rather than an HTTP status code.
 */
const isDomainError = (message: string): boolean => {
  const normalized = message.toLowerCase();
  return (
    normalized.includes('no encontrad') ||
    normalized.includes('not found') ||
    normalized.includes('duplicad') ||
    normalized.includes('duplicate') ||
    normalized.includes('ya existe')
  );
};

/**
 * Configuración del QueryClient optimizada para producción
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Datos siempre se consideran viejos para forzar refresco en una app local
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: (failureCount, error: unknown) => {
        // Wails IPC errors are strings with no `response`; classify by message.
        if (isDomainError(getErrorMessage(error))) {
          return false;
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true, // Forzar refetch al montar el componente
      throwOnError: false,
    },
    mutations: {
      retry: false,
      gcTime: 1000 * 60 * 5,
      throwOnError: false,
    },
  },
});
