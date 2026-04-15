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
import { useCreateMutual } from '../../hooks/useMutuales';
import { models } from '../../../wailsjs/go/models';

interface MutualQuickCreateProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (mutual: models.Mutual) => void;
}

export const MutualQuickCreate: React.FC<MutualQuickCreateProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [nombre, setNombre] = useState('');
  const createMutual = useCreateMutual();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newMutual = await createMutual.mutateAsync({ ...({} as any), nombre });
      setNombre('');
      if (onCreated) {
        onCreated(newMutual);
      }
      onClose();
    } catch (error) {
      console.error('Error al crear mutual:', error);
    }
  };

  const handleClose = () => {
    setNombre('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nueva Mutual</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            label="Nombre de la Mutual"
            fullWidth
            margin="normal"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={createMutual.isPending}>
            {createMutual.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

