import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
} from '@mui/material';
import { useCreateDoctor } from '../../hooks/useDoctores';
import { models } from '../../../wailsjs/go/models';

interface DoctorQuickCreateProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (doctor: models.Doctor) => void;
}

export const DoctorQuickCreate: React.FC<DoctorQuickCreateProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const createDoctor = useCreateDoctor();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newDoctor = await createDoctor.mutateAsync(models.Doctor.createFrom({ nombre, apellido }));
      setNombre('');
      setApellido('');
      if (onCreated) {
        onCreated(newDoctor);
      }
      onClose();
    } catch (error) {
      console.error('Error al crear doctor:', error);
    }
  };

  const handleClose = () => {
    setNombre('');
    setApellido('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Doctor</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nombre"
            fullWidth
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
          />
          <TextField
            label="Apellido"
            fullWidth
            margin="normal"
            value={apellido}
            onChange={(e) => setApellido(e.target.value)}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={createDoctor.isPending}>
            {createDoctor.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

