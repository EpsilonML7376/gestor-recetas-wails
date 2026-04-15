import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useMutual, useCreateMutual, useUpdateMutual } from '../../hooks/useMutuales';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const MutualForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: mutual, isLoading: loadingMutual } = useMutual(Number(id));
  const createMutual = useCreateMutual();
  const updateMutual = useUpdateMutual();

  // Estados del formulario
  const [nombre, setNombre] = useState('');

  // Cargar datos al editar
  useEffect(() => {
    if (mutual && isEdit) {
      setNombre(mutual.nombre);
    }
  }, [mutual, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre) {
      alert('Por favor complete el campo requerido (Nombre)');
      return;
    }

    const data = {
      nombre,
    };

    try {
      if (isEdit) {
        await updateMutual.mutateAsync({ id: Number(id), data: data as any });
      } else {
        await createMutual.mutateAsync(data as any);
      }
      navigate('/mutuales');
    } catch (error) {
      console.error('Error al guardar mutual:', error);
    }
  };

  if (isEdit && loadingMutual) {
    return (
      <MainLayout title="Cargando...">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? 'Editar Mutual' : 'Nueva Mutual'}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/mutuales')}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {isEdit ? `Editar Mutual #${id}` : 'Nueva Mutual'}
          </Typography>
        </Box>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/mutuales')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createMutual.isPending || updateMutual.isPending}
            >
              {isEdit ? 'Actualizar' : 'Guardar'} Mutual
            </Button>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};
