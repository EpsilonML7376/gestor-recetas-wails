import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesApi } from '../api/clientes';
import { models, repositories } from '../../wailsjs/go/models';
import { useSnackbar } from 'notistack';

export const useClientes = (filters?: repositories.ClienteFilters) => {
  return useQuery({
    queryKey: ['clientes', filters],
    queryFn: () => clientesApi.getAll(filters),
  });
};

export const useCliente = (id: number) => {
  return useQuery({
    queryKey: ['cliente', id],
    queryFn: () => clientesApi.getById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: models.Cliente) => clientesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      enqueueSnackbar('Cliente creado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error?.message || 'Error al crear el cliente', {
        variant: 'error',
      });
    },
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: models.Cliente}) =>
      clientesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      enqueueSnackbar('Cliente actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error?.message || 'Error al actualizar el cliente', {
        variant: 'error',
      });
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: number) => clientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      enqueueSnackbar('Cliente eliminado exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error?.message || 'Error al eliminar el cliente', {
        variant: 'error',
      });
    },
  });
};


