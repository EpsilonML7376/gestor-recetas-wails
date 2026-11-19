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
import { useDoctor, useCreateDoctor, useUpdateDoctor } from '../../hooks/useDoctores';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { models } from '../../../wailsjs/go/models';

export const DoctorForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: doctor, isLoading: loadingDoctor } = useDoctor(Number(id));
  const createDoctor = useCreateDoctor();
  const updateDoctor = useUpdateDoctor();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');

  // Cargar datos al editar
  useEffect(() => {
    if (doctor && isEdit) {
      setNombre(doctor.nombre);
      setApellido(doctor.apellido);
    }
  }, [doctor, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !apellido) {
      alert('Por favor complete todos los campos requeridos (Nombre, Apellido)');
      return;
    }

    const data = models.Doctor.createFrom({
      nombre,
      apellido,
    });

    try {
      if (isEdit) {
        await updateDoctor.mutateAsync({ id: Number(id), data });
      } else {
        await createDoctor.mutateAsync(data);
      }
      navigate('/doctores');
    } catch (error) {
      console.error('Error al guardar doctor:', error);
    }
  };

  if (isEdit && loadingDoctor) {
    return (
      <MainLayout title="Cargando...">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? 'Editar Doctor' : 'Nuevo Doctor'}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/doctores')}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {isEdit ? `Editar Doctor #${id}` : 'Nuevo Doctor'}
          </Typography>
        </Box>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Apellido"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/doctores')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createDoctor.isPending || updateDoctor.isPending}
            >
              {isEdit ? 'Actualizar' : 'Guardar'} Doctor
            </Button>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};
