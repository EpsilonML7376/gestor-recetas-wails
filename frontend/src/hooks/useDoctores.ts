import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { doctoresApi } from '../api/doctores';
import { models, repositories } from '../../wailsjs/go/models';
import { useSnackbar } from 'notistack';
import { getErrorMessage } from '../lib/errors';

export const useDoctores = (filters?: repositories.DoctorFilters) => {
  return useQuery({
    queryKey: ['doctores', filters],
    queryFn: () => doctoresApi.getAll(filters),
  });
};

export const useDoctor = (id: number) => {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => doctoresApi.getById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCreateDoctor = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: models.Doctor ) => doctoresApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctores'] });
      enqueueSnackbar('Doctor creado exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useUpdateDoctor = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: models.Doctor  }) =>
      doctoresApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['doctores'] });
      enqueueSnackbar('Doctor actualizado exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

