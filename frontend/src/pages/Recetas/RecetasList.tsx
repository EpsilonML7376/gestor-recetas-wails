import React, { useState } from 'react';
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Typography,
  TextField,
  Grid,
  Autocomplete,
  Card,
  CardContent,
  CardActions,
  Divider,
  useTheme,
  useMediaQuery,
  Stack,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { Dayjs } from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useRecetas, useDeleteReceta } from '../../hooks/useRecetas';
import { useClientes } from '../../hooks/useClientes';
import { useDoctores } from '../../hooks/useDoctores';
import { useMutuales } from '../../hooks/useMutuales';
import { useDebounce } from '../../hooks/useDebounce';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { models, repositories } from '../../../wailsjs/go/models';
type Cliente = models.Cliente;
type Doctor = models.Doctor;
type Mutual = models.Mutual;




export const RecetasList: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Filtros aplicados (los que se usan en la consulta)
  const [filters, setFilters] = useState<{
    cliente: Cliente | null;
    doctor: Doctor | null;
    mutual: Mutual | null;
    fechaDesde: string;
    fechaHasta: string;
  }>({
    cliente: null,
    doctor: null,
    mutual: null,
    fechaDesde: '',
    fechaHasta: '',
  });

  // Filtros temporales (lo que el usuario está ingresando, no aplicados aún)
  const [tempFilters, setTempFilters] = useState<{
    cliente: Cliente | null;
    doctor: Doctor | null;
    mutual: Mutual | null;
  }>({
    cliente: null,
    doctor: null,
    mutual: null,
  });

  // Estados para los DatePickers aplicados (Dayjs)
  
  

  // Estados temporales para los DatePickers (Dayjs)
  const [tempFechaDesde, setTempFechaDesde] = useState<Dayjs | null>(null);
  const [tempFechaHasta, setTempFechaHasta] = useState<Dayjs | null>(null);

  // Estados para trackear el texto de búsqueda en los Autocomplete
  const [clienteSearchText, setClienteSearchText] = useState('');
  const [doctorSearchText, setDoctorSearchText] = useState('');
  const [mutualSearchText, setMutualSearchText] = useState('');

  const { data: recetasData, isLoading } = useRecetas(new repositories.RecetaFilters({
    Limit: rowsPerPage,
    Offset: page * rowsPerPage,
    ClienteID: filters.cliente?.id,
    DoctorID: filters.doctor?.id,
    MutualID: filters.mutual?.id,
    FechaDesde: filters.fechaDesde || undefined,
    FechaHasta: filters.fechaHasta || undefined,
  }));

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
  const deleteReceta = useDeleteReceta();

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleDelete = async () => {
    if (deleteId) {
      await deleteReceta.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const handleApplyFilters = () => {
    setFilters({
      cliente: tempFilters.cliente,
      doctor: tempFilters.doctor,
      mutual: tempFilters.mutual,
      fechaDesde: tempFechaDesde ? tempFechaDesde.format('YYYY-MM-DD') : '',
      fechaHasta: tempFechaHasta ? tempFechaHasta.format('YYYY-MM-DD') : '',
    });
    
    
    setPage(0);
  };

  const clearFilters = () => {
    // Limpiar estados aplicados
    setFilters({
      cliente: null,
      doctor: null,
      mutual: null,
      fechaDesde: '',
      fechaHasta: '',
    });
    
    
    // Limpiar estados temporales
    setTempFilters({
      cliente: null,
      doctor: null,
      mutual: null,
    });
    setTempFechaDesde(null);
    setTempFechaHasta(null);
    setClienteSearchText('');
    setDoctorSearchText('');
    setMutualSearchText('');
    setPage(0);
  };

  if (isLoading && !recetasData) {
    return (
      <MainLayout title="Recetas">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  const recetas = recetasData?.data || [];
  const total = recetasData?.total || 0;

  return (
    <MainLayout title="Recetas">
      <Box sx={{ width: '100%', overflowX: 'hidden' }}>
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between', 
            alignItems: { xs: 'stretch', sm: 'center' }, 
            gap: { xs: 2, sm: 0 },
            mb: { xs: 2, sm: 3 } 
          }}
        >
          <Typography variant="h4" sx={{ fontSize: { xs: '1.5rem', sm: '2.125rem' } }}>
            Gestión de Recetas
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/recetas/nueva')}
            fullWidth={isMobile}
            sx={{ minWidth: { xs: '100%', sm: 'auto' } }}
          >
            Nueva Receta
          </Button>
        </Box>

        {/* Filtros */}
        <Paper sx={{ p: { xs: 1.5, sm: 2 }, mb: { xs: 2, sm: 3 } }}>
          <Typography variant="h6" gutterBottom sx={{ fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
            Filtros
          </Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                fullWidth
                size="small"
                loading={loadingClientes}
                options={clientes || []}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `${option.nombre} ${option.apellido} - DNI: ${option.dni}`;
                }}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                filterOptions={(x) => x}
                value={tempFilters.cliente}
                onChange={(_, newValue) => {
                  setTempFilters((prev) => ({ ...prev, cliente: newValue }));
                  setClienteSearchText(newValue ? `${newValue.nombre} ${newValue.apellido} - DNI: ${newValue.dni}` : '');
                }}
                onInputChange={(_, newInputValue) => setClienteSearchText(newInputValue)}
                inputValue={clienteSearchText}
                renderInput={(params) => <TextField {...params} label="Cliente" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                fullWidth
                size="small"
                loading={loadingDoctores}
                options={doctores || []}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return `Dr. ${option.nombre} ${option.apellido}`;
                }}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                filterOptions={(x) => x}
                value={tempFilters.doctor}
                onChange={(_, newValue) => {
                  setTempFilters((prev) => ({ ...prev, doctor: newValue }));
                  setDoctorSearchText(newValue ? `Dr. ${newValue.nombre} ${newValue.apellido}` : '');
                }}
                onInputChange={(_, newInputValue) => setDoctorSearchText(newInputValue)}
                inputValue={doctorSearchText}
                renderInput={(params) => <TextField {...params} label="Doctor" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <Autocomplete
                fullWidth
                size="small"
                loading={loadingMutuales}
                options={mutuales || []}
                getOptionLabel={(option) => {
                  if (typeof option === 'string') return option;
                  return option.nombre;
                }}
                isOptionEqualToValue={(option, value) => option?.id === value?.id}
                filterOptions={(x) => x}
                value={tempFilters.mutual}
                onChange={(_, newValue) => {
                  setTempFilters((prev) => ({ ...prev, mutual: newValue }));
                  setMutualSearchText(newValue ? newValue.nombre : '');
                }}
                onInputChange={(_, newInputValue) => setMutualSearchText(newInputValue)}
                inputValue={mutualSearchText}
                renderInput={(params) => <TextField {...params} label="Mutual" />}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Fecha Desde"
                value={tempFechaDesde}
                onChange={(newValue) => {
                  setTempFechaDesde(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <DatePicker
                label="Fecha Hasta"
                value={tempFechaHasta}
                onChange={(newValue) => {
                  setTempFechaHasta(newValue);
                }}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                  },
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: { xs: 'wrap', sm: 'nowrap' } }}>
                <Button
                  variant="contained"
                  startIcon={<SearchIcon />}
                  onClick={handleApplyFilters}
                  sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
                >
                  Aplicar Filtros
                </Button>
                <Button
                  variant="outlined"
                  onClick={clearFilters}
                  sx={{ flex: { xs: '1 1 100%', sm: '0 0 auto' } }}
                >
                  Limpiar Filtros
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        {/* Vista de Cards para móvil */}
        {isMobile ? (
          <Box>
            {recetas.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No se encontraron recetas
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {recetas.map((receta) => (
                  <Card 
                    key={receta.id}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        boxShadow: 4,
                      }
                    }}
                    onClick={() => navigate(`/recetas/${receta.id}`)}
                  >
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div">
                          Receta #{receta.id}
                        </Typography>
                        <Typography variant="h6" color="primary" fontWeight="bold">
                          ${receta.total.toLocaleString()}
                        </Typography>
                      </Box>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={1}>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Fecha
                          </Typography>
                          <Typography variant="body2">
                            {format(new Date(receta.fecha), 'dd/MM/yyyy', { locale: es })}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Cliente
                          </Typography>
                          <Typography variant="body2">
                            {receta.cliente?.nombre} {receta.cliente?.apellido}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Doctor
                          </Typography>
                          <Typography variant="body2">
                            Dr. {receta.doctor?.nombre} {receta.doctor?.apellido}
                          </Typography>
                        </Box>
                      </Stack>
                    </CardContent>
                    <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
                      <IconButton
                        size="small"
                        color="info"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recetas/${receta.id}`);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/recetas/${receta.id}/editar`);
                        }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(receta.id);
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </CardActions>
                  </Card>
                ))}
              </Stack>
            )}
            {/* Paginación para móvil */}
            <Paper sx={{ mt: 2, display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Filas:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
                sx={{
                  '& .MuiTablePagination-toolbar': {
                    flexWrap: 'wrap',
                    px: 0,
                  },
                  '& .MuiTablePagination-selectLabel': {
                    mb: 0,
                  },
                  '& .MuiTablePagination-displayedRows': {
                    mb: 0,
                  },
                }}
              />
            </Paper>
          </Box>
        ) : (
          /* Tabla para desktop */
          <Box sx={{ width: '100%', overflowX: 'auto' }}>
            <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Fecha</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Doctor</TableCell>
                  <TableCell>Total</TableCell>
                  <TableCell align="right">Acciones</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {recetas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      <Typography variant="body2" color="text.secondary" sx={{ py: 3 }}>
                        No se encontraron recetas
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  recetas.map((receta) => (
                    <TableRow
                      key={receta.id}
                      hover
                      onDoubleClick={() => navigate(`/recetas/${receta.id}`)}
                      sx={{ cursor: 'pointer' }}
                    >
                      <TableCell>{receta.id}</TableCell>
                      <TableCell>
                        {format(new Date(receta.fecha), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        {receta.cliente?.nombre} {receta.cliente?.apellido}
                      </TableCell>
                      <TableCell>
                        Dr. {receta.doctor?.nombre} {receta.doctor?.apellido}
                      </TableCell>
                      <TableCell>${receta.total.toLocaleString()}</TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          color="info"
                          onClick={() => navigate(`/recetas/${receta.id}`)}
                        >
                          <ViewIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="primary"
                          onClick={() => navigate(`/recetas/${receta.id}/editar`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => setDeleteId(receta.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={total}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              labelRowsPerPage="Filas por página:"
              labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count}`}
            />
          </TableContainer>
          </Box>
        )}

        <ConfirmDialog
          open={deleteId !== null}
          title="Eliminar Receta"
          message="¿Está seguro que desea eliminar esta receta? Esta acción no se puede deshacer."
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          confirmText="Eliminar"
          confirmColor="error"
        />
      </Box>
    </MainLayout>
  );
};


