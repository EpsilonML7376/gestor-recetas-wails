import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recetasApi } from '../api/recetas';
import { useSnackbar } from 'notistack';
import { models, repositories } from '../../wailsjs/go/models';
import { getErrorMessage } from '../lib/errors';

export const useRecetas = (filters?: repositories.RecetaFilters) => {
  return useQuery({
    queryKey: ['recetas', filters],
    queryFn: () => recetasApi.getAll(filters),
  });
};

export const useReceta = (id: number) => {
  return useQuery({
    queryKey: ['receta', id],
    queryFn: () => recetasApi.getById(id),
    enabled: !!id && !isNaN(id),
  });
};

export const useCreateReceta = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (data: models.Receta) => recetasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recetas'] });
      enqueueSnackbar('Receta creada exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useUpdateReceta = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: models.Receta }) =>
      recetasApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['recetas'] });
      queryClient.invalidateQueries({ queryKey: ['receta', variables.id] });
      enqueueSnackbar('Receta actualizada exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

export const useDeleteReceta = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (id: number) => recetasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recetas'] });
      enqueueSnackbar('Receta eliminada exitosamente', { variant: 'success' });
    },
    onError: (error: unknown) => {
      enqueueSnackbar(getErrorMessage(error), { variant: 'error' });
    },
  });
};

