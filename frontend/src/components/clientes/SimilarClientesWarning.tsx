import React, { useMemo } from 'react';
import {
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { useClientes } from '../../hooks/useClientes';
import { useDebounce } from '../../hooks/useDebounce';
import { useNavigate } from 'react-router-dom';

import { models } from '../../../wailsjs/go/models';

interface SimilarClientesWarningProps {
  nombre: string;
  apellido: string;
  dni: string;
  excludeId?: number;
  onSelect?: (cliente: models.Cliente) => void;
}

export const SimilarClientesWarning: React.FC<SimilarClientesWarningProps> = ({
  nombre,
  apellido,
  dni,
  excludeId,
  onSelect,
}) => {
  const navigate = useNavigate();
  
  // Combinar campos para la búsqueda
  const searchValue = useMemo(() => {
    if (dni && dni.length > 2) return dni;
    if (nombre && apellido && (nombre.length > 2 || apellido.length > 2)) {
      return `${nombre} ${apellido}`;
    }
    return '';
  }, [nombre, apellido, dni]);

  const debouncedSearch = useDebounce(searchValue, 500);

  const { data: clientesData, isLoading } = useClientes({
    Search: debouncedSearch,
    Limit: 20,
    Offset: 0,
  });

  const similarClientes = useMemo(() => {
    if (!clientesData || !debouncedSearch) return [];
    
    return clientesData.data.filter(c => {
      // Excluir el cliente actual si estamos editando
      if (excludeId && c.id === excludeId) return false;
      
      const searchLower = debouncedSearch.toLowerCase();
      const dniMatch = dni && c.dni === dni;
      const nameMatch = (c.nombre.toLowerCase() + ' ' + c.apellido.toLowerCase()).includes(searchLower) ||
                        (c.apellido.toLowerCase() + ' ' + c.nombre.toLowerCase()).includes(searchLower);
      
      return dniMatch || nameMatch;
    });
  }, [clientesData, debouncedSearch, excludeId, dni]);

  if (similarClientes.length === 0 || isLoading) return null;

  return (
    <Box sx={{ mt: 2, mb: 2 }}>
      <Alert severity="warning">
        <AlertTitle>Clientes similares encontrados</AlertTitle>
        <Typography variant="body2" sx={{ mb: 1 }}>
          Ya existen clientes con datos similares. ¿Deseas usar uno de ellos?
        </Typography>
        <List dense sx={{ bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
          {similarClientes.map((cliente) => (
            <ListItem
              key={cliente.id}
              secondaryAction={
                onSelect ? (
                  <Button size="small" variant="outlined" onClick={() => onSelect(cliente)}>
                    Seleccionar
                  </Button>
                ) : (
                  <Button size="small" variant="outlined" onClick={() => navigate(`/clientes/editar/${cliente.id}`)}>
                    Ver Perfil
                  </Button>
                )
              }
            >
              <ListItemText
                primary={`${cliente.nombre} ${cliente.apellido}`}
                secondary={cliente.dni ? `DNI: ${cliente.dni}` : 'Sin DNI'}
              />
            </ListItem>
          ))}
        </List>
      </Alert>
    </Box>
  );
};
