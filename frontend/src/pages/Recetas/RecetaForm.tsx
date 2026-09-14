import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Grid,
  Button,
  FormControlLabel,
  Checkbox,
  Divider,
  Autocomplete,
  InputAdornment,
  IconButton,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material';
import {
  Save as SaveIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  BusinessCenter as BusinessCenterIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import dayjs, { Dayjs } from 'dayjs';
import { useNavigate, useParams, useBlocker } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useReceta, useCreateReceta, useUpdateReceta } from '../../hooks/useRecetas';
import { useClientes } from '../../hooks/useClientes';
import { useDoctores } from '../../hooks/useDoctores';
import { useMutuales } from '../../hooks/useMutuales';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { DoctorQuickCreate } from '../../components/forms/DoctorQuickCreate';
import { MutualQuickCreate } from '../../components/forms/MutualQuickCreate';
import { ClienteQuickCreate } from '../../components/forms/ClienteQuickCreate';
import { GraduacionInputs } from '../../components/forms/GraduacionInputs';
import { models } from '../../../wailsjs/go/models';

// Lente local para el state del form (sin ID de BD)
interface LenteForm {
  cristalTipo: string;
  cristalPrecio: string;
  armazonTipo: string;
  armazonPrecio: string;
}

// Graduación con key para React
type GraduacionUI = models.Graduacion & { _uiKey: string };

const defaultLente = (): LenteForm => ({
  cristalTipo: '',
  cristalPrecio: '',
  armazonTipo: '',
  armazonPrecio: '',
});

const generateUIKey = () => Math.random().toString(36).substr(2, 9);

const defaultGraduaciones = (): GraduacionUI[] => [
  { ...new models.Graduacion({ tipoDistancia: 'lejos', ojo: 'derecho' }), _uiKey: generateUIKey() } as GraduacionUI,
  { ...new models.Graduacion({ tipoDistancia: 'lejos', ojo: 'izquierdo' }), _uiKey: generateUIKey() } as GraduacionUI,
  { ...new models.Graduacion({ tipoDistancia: 'cerca', ojo: 'derecho' }), _uiKey: generateUIKey() } as GraduacionUI,
  { ...new models.Graduacion({ tipoDistancia: 'cerca', ojo: 'izquierdo' }), _uiKey: generateUIKey() } as GraduacionUI,
];

export const RecetaForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const { data: receta, isLoading: loadingReceta } = useReceta(Number(id));
  
  // Estados para trackear el texto de búsqueda en los Autocomplete
  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [mutualSearchText, setMutualSearchText] = useState('');
  const [clienteSearchText, setClienteSearchText] = useState('');

  // Debounce de las búsquedas
  const debouncedClienteSearch = useDebounce(clienteSearchText, 500);
  const debouncedDoctorSearch = useDebounce(doctorSearchText, 500);
  const debouncedMutualSearch = useDebounce(mutualSearchText, 500);

  const { data: clientesData, isLoading: loadingClientes } = useClientes({ 
    Search: debouncedClienteSearch, 
    Limit: 20, 
    Offset: 0 
  });
  const { data: doctoresData, isLoading: loadingDoctores } = useDoctores({ 
    Search: debouncedDoctorSearch, 
    Limit: 20, 
    Offset: 0 
  });
  const { data: mutualesData, isLoading: loadingMutuales } = useMutuales({ 
    Search: debouncedMutualSearch, 
    Limit: 20, 
    Offset: 0 
  });

  const clientes = clientesData?.data || [];
  const doctores = doctoresData?.data || [];
  const mutuales = mutualesData?.data || [];

  const createReceta = useCreateReceta();
  const updateReceta = useUpdateReceta();

  // Estados del formulario
  const [fecha, setFecha] = useState<Dayjs | null>(dayjs());
  const [notas, setNotas] = useState('');
  const [tieneMutual, setTieneMutual] = useState(false);
  const [lentes, setLentes] = useState<LenteForm[]>([defaultLente()]);
  const [selectedCliente, setSelectedCliente] = useState<models.Cliente | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<models.Doctor | null>(null);
  const [selectedMutual, setSelectedMutual] = useState<models.Mutual | null>(null);

  const [graduaciones, setGraduaciones] = useState<GraduacionUI[]>(defaultGraduaciones());

  // Estados de validación y control de cambios
  const [showErrors, setShowErrors] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  
  // Estados para el diálogo de errores de validación
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorList, setErrorList] = useState<string[]>([]);

  // Modales de creación rápida
  const [showClienteModal, setShowClienteModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showMutualModal, setShowMutualModal] = useState(false);
  
  // Ref para omitir el bloqueo de navegación durante el guardado
  const bypassBlockerRef = useRef(false);

  // Cargar datos al editar - Solo corre una vez cuando la receta está disponible
  useEffect(() => {
    if (receta && isEdit) {
      setFecha(dayjs(receta.fecha));
      setNotas(receta.notas || '');
      setTieneMutual(receta.tieneMutual);
      
      setSelectedCliente(receta.cliente || null);
      setSelectedDoctor(receta.doctor || null);
      setSelectedMutual(receta.mutual || null);
      
      // Reiniciamos isDirty porque acabamos de cargar los datos originales
      setIsDirty(false);

      // Cargar lentes del servidor
      if (receta.lentes && receta.lentes.length > 0) {
        setLentes(receta.lentes.map((l) => ({
          cristalTipo: l.cristalTipo || '',
          cristalPrecio: l.cristalPrecio > 0 ? l.cristalPrecio.toString().replace('.', ',') : '',
          armazonTipo: l.armazonTipo || '',
          armazonPrecio: l.armazonPrecio > 0 ? l.armazonPrecio.toString().replace('.', ',') : '',
        })));
      }

      // Establecer los textos de búsqueda con los valores de las relaciones
      if (receta.doctor) {
        setDoctorSearchText(`Dr. ${receta.doctor.nombre} ${receta.doctor.apellido}`);
      }
      if (receta.mutual) {
        setMutualSearchText(receta.mutual.nombre);
      }
      if (receta.cliente) {
        setClienteSearchText(`${receta.cliente.nombre} ${receta.cliente.apellido}${receta.cliente.dni ? ` - DNI: ${receta.cliente.dni}` : ''}`);
      }

      if (receta.graduaciones && receta.graduaciones.length > 0) {
        setGraduaciones(receta.graduaciones.map(g => ({ ...g, _uiKey: generateUIKey() } as GraduacionUI)));
      }
    }
  }, [receta, isEdit]);

  // Manejo del evento beforeunload del navegador
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Requerido por Chrome para mostrar el diálogo estándar
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const handleGraduacionChange = (index: number, field: keyof models.Graduacion, value: string | number | null) => {
    setIsDirty(true);
    setGraduaciones((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        let finalValue = value;

        // Manejar shortcut "add" para graduaciones de cerca
        if (typeof value === 'string' && value.toLowerCase().startsWith('add') && (field === 'esf' || field === 'cil')) {
          const currentGrad = next[index];
          // Buscar la graduación de lejos del mismo ojo para sumar la adición
          const lejosGrad = prev.find(g => g.tipoDistancia === 'lejos' && g.ojo === currentGrad.ojo);
          const baseValue = lejosGrad ? (lejosGrad[field] as number || 0) : 0;

          // Extraer número después de "add"
          const numPart = value.substring(3).trim().replace(',', '.');
          const addAmount = numPart === '' ? 1 : parseFloat(numPart) || 0;

          finalValue = baseValue + addAmount;
        }

        next[index] = {
          ...next[index],
          [field]: finalValue,
        } as GraduacionUI;
      }
      return next;
    });
  };

  const handleAddGraduacion = () => {
    setIsDirty(true);
    setGraduaciones((prev) => [
      ...prev,
      { ...new models.Graduacion({ tipoDistancia: 'lejos', ojo: 'derecho' }), _uiKey: generateUIKey() } as GraduacionUI,
    ]);
  };

  const handleRemoveGraduacion = (index: number) => {
    setIsDirty(true);
    setGraduaciones((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  };

  // Manejo de lentes
  const handleAddLente = () => {
    setIsDirty(true);
    setLentes((prev) => [...prev, defaultLente()]);
  };

  const handleRemoveLente = (index: number) => {
    setIsDirty(true);
    setLentes((prev) => {
      if (prev.length > 1) {
        return prev.filter((_, i) => i !== index);
      }
      return prev;
    });
  };

  const handleLenteChange = (index: number, field: keyof LenteForm, value: string) => {
    setIsDirty(true);
    setLentes((prev) => {
      const next = [...prev];
      if (index >= 0 && index < next.length) {
        next[index] = { ...next[index], [field]: value };
      }
      return next;
    });
  };

  const parsePrecio = (value: string): number => {
    if (!value) return 0;
    const normalizedValue = value.replace(',', '.');
    return parseFloat(normalizedValue) || 0;
  };

  const calculateTotal = () => {
    return lentes.reduce((sum, l) => sum + parsePrecio(l.cristalPrecio) + parsePrecio(l.armazonPrecio), 0);
  };

  const handlePrecioChange = (value: string, cb: (val: string) => void) => {
    const regex = /^[0-9]*[,.]?[0-9]*$/;
    if (value === '' || regex.test(value)) {
      cb(value);
    }
  };

  const handleCancel = () => {
    navigate('/recetas');
  };

  // Bloqueador de navegación global (Sidebar, etc)
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      !bypassBlockerRef.current && isDirty && currentLocation.pathname !== nextLocation.pathname
  );

  // Sincronizar el estado del blocker con nuestro diálogo de confirmación
  useEffect(() => {
    if (blocker.state === 'blocked') {
      setShowCancelDialog(true);
    }
  }, [blocker.state]);

  const handleConfirmCancel = () => {
    setShowCancelDialog(false);
    if (blocker.state === 'blocked') {
      blocker.proceed();
    } else {
      navigate('/recetas');
    }
  };

  const handleCloseCancelDialog = () => {
    setShowCancelDialog(false);
    if (blocker.state === 'blocked') {
      blocker.reset();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setShowErrors(true);

    const hasGraduaciones = graduaciones.some((g) => g.esf != null || g.cil != null);
    const hasMutualSelection = !tieneMutual || (tieneMutual && selectedMutual);

    if (!selectedCliente || !selectedDoctor || !hasMutualSelection || !hasGraduaciones) {
      const errors: string[] = [];
      if (!selectedCliente) errors.push("Debe seleccionar un cliente");
      if (!selectedDoctor) errors.push("Debe seleccionar un doctor");
      if (tieneMutual && !selectedMutual) errors.push("Debe seleccionar una mutual");
      if (!hasGraduaciones) errors.push("Debe completar al menos una graduación");
      
      setErrorList(errors);
      setShowErrorDialog(true);
      return;
    }

    // Filtrar graduaciones donde esférico y cilíndrico están ambos vacíos
    const graduacionesFiltradas = graduaciones.filter(
      (g) => g.esf != null || g.cil != null
    );

    const data = new models.Receta({
      fecha: fecha ? fecha.toISOString() : new Date().toISOString(),
      notas,
      tieneMutual,
      clienteId: selectedCliente.id,
      doctorId: selectedDoctor.id,
      mutualId: tieneMutual ? selectedMutual?.id : undefined,
      graduaciones: graduacionesFiltradas as models.Graduacion[],
      lentes: lentes.map((l) => ({
        cristalTipo: l.cristalTipo,
        cristalPrecio: parsePrecio(l.cristalPrecio),
        armazonTipo: l.armazonTipo,
        armazonPrecio: parsePrecio(l.armazonPrecio),
      })),
    });

    try {
      if (isEdit) {
        await updateReceta.mutateAsync({ id: Number(id), data });
      } else {
        await createReceta.mutateAsync(data);
      }
      
      // Bypass el blocker y navegar
      bypassBlockerRef.current = true;
      setIsDirty(false);
      navigate('/recetas');
    } catch (error) {
      bypassBlockerRef.current = false;
      console.error('Error al guardar receta:', error);
    }
  };

  if (isEdit && loadingReceta) {
    return (
      <MainLayout title="Cargando...">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  return (
    <MainLayout title={isEdit ? 'Editar Receta' : 'Nueva Receta'}>
      <Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={handleCancel}
          >
            Volver
          </Button>
          <Typography variant="h4">
            {isEdit ? `Editar Receta #${id}` : 'Nueva Receta'}
          </Typography>
        </Box>

        <Paper component="form" onSubmit={handleSubmit} sx={{ p: 2 }}>
          {/* Información General */}
          <Typography variant="subtitle1" gutterBottom>
            Información General
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Fecha"
                value={fecha}
                onChange={(newValue) => {
                  setFecha(newValue);
                  setIsDirty(true);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Cliente y Doctor */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1">Cliente</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowClienteModal(true)}
                >
                  Nuevo Cliente
                </Button>
              </Box>
              <Autocomplete
                loading={loadingClientes}
                options={clientes || []}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.nombre} ${option.apellido}${option.dni ? ` - DNI: ${option.dni}` : ''}`;
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedCliente}
                filterOptions={(x) => x} // Desactivar filtrado local
                onChange={(_, newValue) => {
                  setSelectedCliente(newValue);
                  setClienteSearchText(newValue ? `${newValue.nombre} ${newValue.apellido}${newValue.dni ? ` - DNI: ${newValue.dni}` : ''}` : '');
                }}
                onInputChange={(_, newInputValue) => {
                  setClienteSearchText(newInputValue);
                  // Solo marcamos dirty si el cambio viene del usuario escribiendo
                  if (newInputValue !== '') setIsDirty(true);
                }}
                inputValue={clienteSearchText}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small" 
                    label="Seleccionar Cliente" 
                    error={showErrors && !selectedCliente}
                    helperText={showErrors && !selectedCliente ? "Debe seleccionar un cliente" : ""}
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="subtitle1">Doctor</Typography>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => setShowDoctorModal(true)}
                >
                  Nuevo Doctor
                </Button>
              </Box>
              <Autocomplete
                loading={loadingDoctores}
                options={doctores || []}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `Dr. ${option.nombre} ${option.apellido}`;
                }}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={selectedDoctor}
                filterOptions={(x) => x} // Desactivar filtrado local
                onChange={(_, newValue) => {
                  setSelectedDoctor(newValue);
                  setDoctorSearchText(newValue ? `Dr. ${newValue.nombre} ${newValue.apellido}` : '');
                }}
                onInputChange={(_, newInputValue) => {
                  setDoctorSearchText(newInputValue);
                  if (newInputValue !== '') setIsDirty(true);
                }}
                inputValue={doctorSearchText}
                renderInput={(params) => (
                  <TextField 
                    {...params} 
                    size="small" 
                    label="Seleccionar Doctor" 
                    error={showErrors && !selectedDoctor}
                    helperText={showErrors && !selectedDoctor ? "Debe seleccionar un doctor" : ""}
                  />
                )}
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Graduaciones */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1">Graduaciones</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddGraduacion}
            >
              Agregar Graduación
            </Button>
          </Box>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            {graduaciones.map((graduacion, index) => (
              <Grid item xs={12} sm={6} md={3} key={graduacion._uiKey}>
                <GraduacionInputs
                  graduacion={graduacion}
                  index={index}
                  onChange={handleGraduacionChange}
                  onRemove={handleRemoveGraduacion}
                  canRemove={graduaciones.length > 1}
                />
              </Grid>
            ))}
          </Grid>

          <Divider sx={{ my: 2 }} />

          {/* Mutual */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1">Mutual</Typography>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={tieneMutual}
                    onChange={(e) => {
                      setTieneMutual(e.target.checked);
                      setIsDirty(true);
                    }}
                  />
                }
                label="Tiene mutual"
              />
            </Box>
            {showErrors && !graduaciones.some(g => g.esf != null || g.cil != null) && (
              <Alert severity="error" sx={{ mb: 2 }}>
                Debe completar al menos una graduación (Esférico o Cilíndrico)
              </Alert>
            )}
            {tieneMutual && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<BusinessCenterIcon />}
                onClick={() => setShowMutualModal(true)}
              >
                Nueva Mutual
              </Button>
            )}
          </Box>
          {tieneMutual && (
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12}>
                <Autocomplete
                  loading={loadingMutuales}
                  options={mutuales || []}
                  getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option.nombre;
                  }}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  value={selectedMutual}
                  filterOptions={(x) => x} // Desactivar filtrado local
                  onChange={(_, newValue) => {
                    setSelectedMutual(newValue);
                    setMutualSearchText(newValue ? newValue.nombre : '');
                  }}
                  onInputChange={(_, newInputValue) => {
                    setMutualSearchText(newInputValue);
                    if (newInputValue !== '') setIsDirty(true);
                  }}
                  inputValue={mutualSearchText}
                  renderInput={(params) => (
                    <TextField 
                      {...params} 
                      size="small" 
                      label="Seleccionar Mutual" 
                      error={showErrors && tieneMutual && !selectedMutual}
                      helperText={showErrors && tieneMutual && !selectedMutual ? "Debe seleccionar una mutual si marcó 'Tiene mutual'" : ""}
                    />
                  )}
                />
              </Grid>
            </Grid>
          )}

          <Divider sx={{ my: 2 }} />

          {/* Lentes */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
            <Typography variant="subtitle1">Información de Lentes</Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<AddIcon />}
              onClick={handleAddLente}
            >
              Agregar Lente
            </Button>
          </Box>

          {lentes.map((lente, lIndex) => (
            <Paper
              key={lIndex}
              variant="outlined"
              sx={{ p: 2, mb: 2, position: 'relative' }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <Typography variant="body2" fontWeight="medium">
                  Lente {lIndex + 1}
                </Typography>
                {lentes.length > 1 && (
                  <IconButton size="small" color="error" onClick={() => handleRemoveLente(lIndex)}>
                    <DeleteIcon />
                  </IconButton>
                )}
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tipo de Cristal"
                    value={lente.cristalTipo}
                    onChange={(e) => handleLenteChange(lIndex, 'cristalTipo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio Cristal"
                    type="text"
                    value={lente.cristalPrecio}
                    onChange={(e) => handlePrecioChange(e.target.value, (v) => handleLenteChange(lIndex, 'cristalPrecio', v))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Tipo de Armazón"
                    value={lente.armazonTipo}
                    onChange={(e) => handleLenteChange(lIndex, 'armazonTipo', e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    size="small"
                    label="Precio Armazón"
                    type="text"
                    value={lente.armazonPrecio}
                    onChange={(e) => handlePrecioChange(e.target.value, (v) => handleLenteChange(lIndex, 'armazonPrecio', v))}
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                  />
                </Grid>
              </Grid>
            </Paper>
          ))}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: 1, mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total:
            </Typography>
            <Typography variant="h6" fontWeight="bold">
              ${calculateTotal().toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </Typography>
          </Box>

          <Divider sx={{ my: 2 }} />

          {/* Notas */}
          <Typography variant="subtitle1" gutterBottom>
            Notas
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                size="small"
                label="Notas"
                multiline
                rows={2}
                value={notas}
                onChange={(e) => {
                  setNotas(e.target.value);
                  setIsDirty(true);
                }}
              />
            </Grid>
          </Grid>

          {/* Botones de acción */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end', mt: 2 }}>
            <Button variant="outlined" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={<SaveIcon />}
              disabled={createReceta.isPending || updateReceta.isPending}
            >
              {isEdit ? 'Actualizar' : 'Guardar'} Receta
            </Button>
          </Box>
        </Paper>

        {/* Diálogo de Confirmación de Cancelación */}
        <Dialog
          open={showCancelDialog}
          onClose={() => setShowCancelDialog(false)}
        >
          <DialogTitle>Cambios sin guardar</DialogTitle>
          <DialogContent>
            <DialogContentText>
              ¿Desea salir de la edición? Los cambios no guardados se perderán.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseCancelDialog}>
              Continuar editando
            </Button>
            <Button onClick={handleConfirmCancel} color="error" autoFocus>
              Sí, salir
            </Button>
          </DialogActions>
        </Dialog>

        {/* Diálogo de Errores de Validación (Simple) */}
        <Dialog
          open={showErrorDialog}
          onClose={() => setShowErrorDialog(false)}
        >
          <DialogTitle sx={{ color: 'error.main', fontWeight: 'bold' }}>
            Datos Incompletos
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 2 }}>
              Para guardar la receta, es necesario completar los siguientes puntos:
            </DialogContentText>
            <Box component="ul" sx={{ mt: 0, pl: 2 }}>
              {errorList.map((err, i) => (
                <Typography key={i} component="li" variant="body2" sx={{ mb: 0.5 }}>
                  {err}
                </Typography>
              ))}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowErrorDialog(false)} variant="contained" autoFocus>
              Entendido
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modales de creación rápida */}
        <ClienteQuickCreate
          open={showClienteModal}
          onClose={() => setShowClienteModal(false)}
          onCreated={(cliente) => {
            setSelectedCliente(cliente);
            setIsDirty(true);
            setClienteSearchText(`${cliente.nombre} ${cliente.apellido}${cliente.dni ? ` - DNI: ${cliente.dni}` : ''}`);
          }}
        />
        <DoctorQuickCreate
          open={showDoctorModal}
          onClose={() => setShowDoctorModal(false)}
          onCreated={(doctor) => {
            setSelectedDoctor(doctor);
            setIsDirty(true);
            setDoctorSearchText(`Dr. ${doctor.nombre} ${doctor.apellido}`);
          }}
        />
        <MutualQuickCreate
          open={showMutualModal}
          onClose={() => setShowMutualModal(false)}
          onCreated={(mutual) => {
            setSelectedMutual(mutual);
            setIsDirty(true);
            setMutualSearchText(mutual.nombre);
          }}
        />
      </Box>
    </MainLayout>
  );
};
