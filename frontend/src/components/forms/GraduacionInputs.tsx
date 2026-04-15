import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  MenuItem,
  IconButton,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { models } from '../../../wailsjs/go/models';
type Graduacion = models.Graduacion;

interface GraduacionInputsProps {
  graduacion: Partial<Graduacion>;
  index: number;
  onChange: (index: number, field: keyof Graduacion, value: string | number | null) => void;
  onRemove: (index: number) => void;
  canRemove: boolean;
}

export const GraduacionInputs: React.FC<GraduacionInputsProps> = ({
  graduacion,
  index,
  onChange,
  onRemove,
  canRemove,
}) => {
  const [esfValue, setEsfValue] = useState('');
  const [cilValue, setCilValue] = useState('');
  const [gradosValue, setGradosValue] = useState('');

  // Sincronizar valores cuando cambia la graduación desde fuera
  useEffect(() => {
    const formatValue = (value: number | undefined | null): string => {
      if (value === undefined || value === null) return '';
      if (value === 0) return '0';
      const str = value.toString().replace('.', ',');
      // Agregar signo + para valores positivos (solo si no tiene signo ya)
      if (value > 0 && !str.startsWith('+') && !str.startsWith('-')) {
        return '+' + str;
      }
      return str;
    };
    const formatGradosValue = (value: number | undefined | null): string => {
      if (value === undefined || value === null) return '';
      // Los grados no deben tener símbolo +
      return value.toString();
    };
    setEsfValue(formatValue(graduacion.esf));
    setCilValue(formatValue(graduacion.cil));
    setGradosValue(formatGradosValue(graduacion.grados));
  }, [graduacion.esf, graduacion.cil, graduacion.grados, graduacion.tipoDistancia, graduacion.ojo]);

  // Limpiar grados cuando cilindrico se vacía (pero no si tiene un valor, incluyendo "0")
  useEffect(() => {
    // Solo limpiar grados si cilindrico está realmente vacío y grados todavía tiene un valor
    if (cilValue.trim() === '' && gradosValue !== '') {
      setGradosValue('');
      // No llamamos a onChange aquí para evitar loops, 
      // handleDecimalBlur se encargará de esto si es una acción del usuario
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cilValue]);

  const parseDecimal = (value: string): number | null => {
    if (!value || value.trim() === '') return null;
    // Remover signo + si existe, normalizar coma y punto a punto para parsear
    const cleanValue = value.replace(/^\+/, '').replace(',', '.');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? null : parsed;
  };

  const handleDecimalChange = (value: string, setter: (value: string) => void) => {
    const valLow = value.toLowerCase();
    const isCerca = graduacion.tipoDistancia === 'cerca';
    
    // Lógica para shortcut "add"
    if (isCerca && (valLow.startsWith('add') || 'add'.startsWith(valLow))) {
      // Si ya escribió "add", validar que el resto sea un número válido
      if (valLow.startsWith('add')) {
        const suffix = value.substring(3).trim();
        const suffixRegex = /^[0-9]*[,.]?[0-9]*$/;
        if (!suffixRegex.test(suffix)) return;
      }
      setter(value);
      return;
    }

    // Lógica decimal estándar
    const regex = /^\+?-?[0-9]*[,.]?[0-9]*$/;
    if (value === '' || regex.test(value)) {
      setter(value);
    }
  };

  const handleDecimalBlur = (field: 'esf' | 'cil', value: string) => {
    // Detectar shortcut "add" para graduaciones de cerca
    const lowerValue = value.trim().toLowerCase();
    if (graduacion.tipoDistancia === 'cerca' && lowerValue.startsWith('add')) {
      onChange(index, field, value.trim());
      return;
    }

    // Convertir a número cuando se pierde el foco
    const numValue = parseDecimal(value);
    onChange(index, field, numValue);
    
    // Actualizar el estado local con el formato correcto (incluyendo signo +)
    if (numValue !== null) {
      const formatted = numValue > 0 
        ? '+' + numValue.toString().replace('.', ',')
        : numValue.toString().replace('.', ',');
      if (field === 'esf') {
        setEsfValue(formatted);
      } else {
        setCilValue(formatted);
      }
    } else {
      if (field === 'esf') {
        setEsfValue('');
      } else {
        setCilValue('');
      }
    }
    
    // Si es cilindrico y se vacía, limpiar grados
    if (field === 'cil' && numValue === null) {
      setGradosValue('');
      onChange(index, 'grados', null);
    }
  };

  const handleGradosChange = (value: string) => {
    // Permitir solo números enteros
    const regex = /^[0-9]*$/;
    if (value === '' || regex.test(value)) {
      setGradosValue(value);
    }
  };

  const handleGradosBlur = () => {
    // Convertir a número cuando se pierde el foco
    // Si cilindrico está vacío, grados debe ser null
    if (!cilValue || cilValue.trim() === '') {
      onChange(index, 'grados', null);
      return;
    }
    const parsed = gradosValue === '' ? NaN : parseInt(gradosValue, 10);
    const numValue = isNaN(parsed) ? null : parsed;
    onChange(index, 'grados', numValue);
  };

  return (
    <Paper sx={{ p: 1.5, position: 'relative', maxWidth: 350 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2">Graduación {index + 1}</Typography>
        {canRemove && (
          <IconButton size="small" color="error" onClick={() => onRemove(index)}>
            <DeleteIcon />
          </IconButton>
        )}
      </Box>
      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Tipo de Distancia"
            value={graduacion.tipoDistancia || ''}
            onChange={(e) => onChange(index, 'tipoDistancia', e.target.value)}
            required
            SelectProps={{ MenuProps: { disableScrollLock: true } }}
          >
            <MenuItem value="lejos">Lejos</MenuItem>
            <MenuItem value="cerca">Cerca</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            select
            fullWidth
            size="small"
            label="Ojo"
            value={graduacion.ojo || ''}
            onChange={(e) => onChange(index, 'ojo', e.target.value)}
            required
            SelectProps={{ MenuProps: { disableScrollLock: true } }}
          >
            <MenuItem value="derecho">Derecho</MenuItem>
            <MenuItem value="izquierdo">Izquierdo</MenuItem>
          </TextField>
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Esférico"
            type="text"
            value={esfValue}
            onChange={(e) => handleDecimalChange(e.target.value, setEsfValue)}
            onBlur={() => handleDecimalBlur('esf', esfValue)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Cilíndrico"
            type="text"
            value={cilValue}
            onChange={(e) => handleDecimalChange(e.target.value, setCilValue)}
            onBlur={() => handleDecimalBlur('cil', cilValue)}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            size="small"
            label="Grados"
            type="text"
            value={gradosValue}
            onChange={(e) => handleGradosChange(e.target.value)}
            onBlur={handleGradosBlur}
            disabled={!cilValue || cilValue.trim() === ''}
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

