import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const { enqueueSnackbar } = vi.hoisted(() => ({ enqueueSnackbar: vi.fn() }));

vi.mock('notistack', () => ({
  useSnackbar: () => ({ enqueueSnackbar }),
  SnackbarProvider: ({ children }: any) => children,
}));

vi.mock('../api/clientes', () => ({
  clientesApi: {
    getAll: vi.fn(),
    getById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

import { clientesApi } from '../api/clientes';
import { useCreateCliente, useUpdateCliente, useDeleteCliente } from './useClientes';

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

describe('useCreateCliente — manejo de errores', () => {
  beforeEach(() => {
    enqueueSnackbar.mockReset();
    vi.mocked(clientesApi.create).mockReset();
  });

  it('muestra el mensaje de error real (error.message) cuando falla', async () => {
    vi.mocked(clientesApi.create).mockRejectedValue(new Error('cliente no encontrado'));

    const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({} as any).catch(() => {});
    });

    // Esto valida el fix: se usa error.message, no error.response?.data?.message (forma de Axios)
    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'cliente no encontrado',
      expect.objectContaining({ variant: 'error' }),
    );
  });

  it('muestra éxito al crear', async () => {
    vi.mocked(clientesApi.create).mockResolvedValue({ id: 1 } as any);

    const { result } = renderHook(() => useCreateCliente(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({} as any);
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'Cliente creado exitosamente',
      expect.objectContaining({ variant: 'success' }),
    );
  });
});

describe('useUpdateCliente y useDeleteCliente', () => {
  beforeEach(() => {
    enqueueSnackbar.mockReset();
    vi.mocked(clientesApi.update).mockReset();
    vi.mocked(clientesApi.delete).mockReset();
  });

  it('useUpdateCliente propaga el error real', async () => {
    vi.mocked(clientesApi.update).mockRejectedValue(new Error('cliente no encontrado'));

    const { result } = renderHook(() => useUpdateCliente(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync({ id: 1, data: {} as any }).catch(() => {});
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'cliente no encontrado',
      expect.objectContaining({ variant: 'error' }),
    );
  });

  it('useDeleteCliente propaga el error real', async () => {
    vi.mocked(clientesApi.delete).mockRejectedValue(new Error('no se puede eliminar: el cliente tiene recetas asociadas'));

    const { result } = renderHook(() => useDeleteCliente(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.mutateAsync(1).catch(() => {});
    });

    expect(enqueueSnackbar).toHaveBeenCalledWith(
      'no se puede eliminar: el cliente tiene recetas asociadas',
      expect.objectContaining({ variant: 'error' }),
    );
  });
});
