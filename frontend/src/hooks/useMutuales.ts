import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { mutualesApi } from '../api/mutuales';
import { models, repositories } from '../../wailsjs/go/models';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../lib/errors';

export const useMutuales = (filters?: repositories.MutualFilters) => {
  return useQuery({
    queryKey: ['mutuales', filters],
    queryFn: () => mutualesApi.getAll(filters),
  });
};

export const useMutual = (id: number) => {
  return useQuery({
    queryKey: ['mutual', id],
    queryFn: () => mutualesApi.getById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCreateMutual = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: models.Mutual ) => mutualesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutuales'] });
      enqueueSnackbar('Mutual creada exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useUpdateMutual = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: models.Mutual  }) =>
      mutualesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mutuales'] });
      enqueueSnackbar('Mutual actualizada exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

