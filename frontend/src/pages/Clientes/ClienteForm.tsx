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
import { useCliente, useCreateCliente, useUpdateCliente } from '../../hooks/useClientes';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { SimilarClientesWarning } from '../../components/clientes/SimilarClientesWarning';
import { models } from '../../../wailsjs/go/models';

export const ClienteForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: cliente, isLoading: loadingCliente } = useCliente(Number(id));
  const createCliente = useCreateCliente();
  const updateCliente = useUpdateCliente();

  // Estados del formulario
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');

  // Cargar datos al editar
  useEffect(() => {
    if (cliente && isEdit) {
      setNombre(cliente.nombre);
      setApellido(cliente.apellido);
      setDni(cliente.dni);
      setTelefono(cliente.telefono || '');
    }
  }, [cliente, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nombre || !apellido) {
      alert('Por favor complete todos los campos requeridos (Nombre y Apellido)');
      return;
    }

    const data = models.Cliente.createFrom({
      nombre,
      apellido,
      dni,
      telefono: telefono || '',
    });

    try {
      if (isEdit) {
        await updateCliente.mutateAsync({ id: Number(id), data });
      } else {
        await createCliente.mutateAsync(data);
      }
      navigate('/clientes');
    } catch (error) {
      console.error('Error al guardar cliente:', error);
    }
  };

  if (isEdit && loadingCliente) {
    return (
      <MainLayout title="Cargando...">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? 'Editar Cliente' : 'Nuevo Cliente'}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/clientes')}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {isEdit ? `Editar Cliente #${id}` : 'Nuevo Cliente'}
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
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="DNI"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Teléfono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
              />
            </Grid>
          </Grid>

          <SimilarClientesWarning 
            nombre={nombre} 
            apellido={apellido} 
            dni={dni} 
            excludeId={isEdit ? Number(id) : undefined}
          />

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 4 }}>
            <Button variant="outlined" onClick={() => navigate('/clientes')}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createCliente.isPending || updateCliente.isPending}
            >
              {isEdit ? 'Actualizar' : 'Guardar'} Cliente
            </Button>
          </Box>
        </Paper>
      </Box>
    </MainLayout>
  );
};



