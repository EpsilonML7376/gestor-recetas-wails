import { QueryClient } from '@tanstack/react-query';

/**
 * Configuración del QueryClient optimizada para producción
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 0, // Datos siempre se consideran viejos para forzar refresco en una app local
      gcTime: 1000 * 60 * 30, // 30 minutos
      retry: (failureCount) => {
        // Los errores de Wails son locales (no HTTP): reintentar 3 veces sin inspeccionar status
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
