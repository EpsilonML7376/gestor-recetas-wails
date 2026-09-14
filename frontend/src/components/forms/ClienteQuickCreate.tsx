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
import { useCreateCliente } from '../../hooks/useClientes';
import { models } from '../../../wailsjs/go/models';
import { SimilarClientesWarning } from '../clientes/SimilarClientesWarning';

interface ClienteQuickCreateProps {
  open: boolean;
  onClose: () => void;
  onCreated?: (cliente: models.Cliente) => void;
}

export const ClienteQuickCreate: React.FC<ClienteQuickCreateProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [dni, setDni] = useState('');
  const [telefono, setTelefono] = useState('');
  const createCliente = useCreateCliente();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCliente = await createCliente.mutateAsync(new models.Cliente({
        nombre,
        apellido,
        dni,
        telefono: telefono || undefined,
      }));
      setNombre('');
      setApellido('');
      setDni('');
      setTelefono('');
      if (onCreated) {
        onCreated(newCliente);
      }
      onClose();
    } catch (error) {
      console.error('Error al crear cliente:', error);
    }
  };

  const handleSelectExisting = (cliente: models.Cliente) => {
    if (onCreated) {
      onCreated(cliente);
    }
    handleClose();
  };

  const handleClose = () => {
    setNombre('');
    setApellido('');
    setDni('');
    setTelefono('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Crear Nuevo Cliente</DialogTitle>
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
          <TextField
            label="DNI"
            fullWidth
            margin="normal"
            value={dni}
            onChange={(e) => setDni(e.target.value)}
          />
          <TextField
            label="Teléfono"
            fullWidth
            margin="normal"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
          />

          <SimilarClientesWarning 
            nombre={nombre} 
            apellido={apellido} 
            dni={dni} 
            onSelect={handleSelectExisting}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={createCliente.isPending}>
            {createCliente.isPending ? 'Creando...' : 'Crear'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

