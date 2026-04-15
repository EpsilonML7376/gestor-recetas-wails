import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Divider,
  Chip,
  Button,
  Card,
  CardContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Edit as EditIcon, ArrowBack as ArrowBackIcon } from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../../components/layout/MainLayout';
import { useReceta } from '../../hooks/useRecetas';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const formatGradValue = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  if (val === 0) return '0';
  return val > 0 ? `+${val}` : `${val}`;
};

const formatGrados = (val: number | null | undefined): string => {
  if (val === null || val === undefined) return '—';
  return `${val}°`;
};

export const RecetaDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: receta, isLoading } = useReceta(Number(id));

  if (isLoading) {
    return (
      <MainLayout title="Detalle de Receta">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  if (!receta) {
    return (
      <MainLayout title="Detalle de Receta">
        <Paper sx={{ p: 3 }}>
          <Typography>Receta no encontrada</Typography>
        </Paper>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Detalle de Receta">
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/recetas')}
            >
              Volver
            </Button>
            <Typography variant="h4">Receta #{receta.id}</Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<EditIcon />}
            onClick={() => navigate(`/recetas/${id}/editar`)}
          >
            Editar
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Información General */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Información General
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fecha
                    </Typography>
                    <Typography variant="body1">
                      {format(new Date(receta.fecha), "dd 'de' MMMM 'de' yyyy", { locale: es })}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="text.secondary">
                      Total
                    </Typography>
                    <Typography variant="h6" color="primary">
                      ${receta.total.toLocaleString()}
                    </Typography>
                  </Grid>
                  {receta.notas && (
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Notas
                      </Typography>
                      <Typography variant="body1">{receta.notas}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Cliente */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Cliente
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Nombre Completo
                    </Typography>
                    <Typography variant="body1">
                      {receta.cliente?.nombre} {receta.cliente?.apellido}
                    </Typography>
                  </Grid>
                  {receta.cliente?.dni && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        DNI
                      </Typography>
                      <Typography variant="body1">{receta.cliente.dni}</Typography>
                    </Grid>
                  )}
                  {receta.cliente?.telefono && (
                    <Grid item xs={6}>
                      <Typography variant="body2" color="text.secondary">
                        Teléfono
                      </Typography>
                      <Typography variant="body1">{receta.cliente.telefono}</Typography>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Doctor y Mutual */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Doctor y Mutual
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Doctor
                    </Typography>
                    <Typography variant="body1">
                      Dr. {receta.doctor?.nombre} {receta.doctor?.apellido}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="body2" color="text.secondary">
                      Mutual
                    </Typography>
                    <Typography variant="body1">
                      {receta.tieneMutual ? receta.mutual?.nombre || 'N/A' : 'Sin mutual'}
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Lentes */}
          {receta.lentes && receta.lentes.length > 0 && (
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Información de Lentes
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  {receta.lentes.map((lente, idx) => (
                    <Box key={idx} sx={{ mb: idx < receta.lentes!.length - 1 ? 2 : 0 }}>
                      {receta.lentes!.length > 1 && (
                        <Typography variant="body2" fontWeight="bold" sx={{ mb: 1 }}>
                          Lente {idx + 1}
                        </Typography>
                      )}
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Cristal
                          </Typography>
                          <Typography variant="body1">{lente.cristalTipo || 'N/A'}</Typography>
                          <Typography variant="body2" color="primary">
                            ${lente.cristalPrecio.toLocaleString()}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="body2" color="text.secondary">
                            Armazón
                          </Typography>
                          <Typography variant="body1">{lente.armazonTipo || 'N/A'}</Typography>
                          <Typography variant="body2" color="primary">
                            ${lente.armazonPrecio.toLocaleString()}
                          </Typography>
                        </Grid>
                      </Grid>
                      {idx < receta.lentes!.length - 1 && <Divider sx={{ mt: 2 }} />}
                    </Box>
                  ))}
                </CardContent>
              </Card>
            </Grid>
          )}

          {/* Graduaciones */}
          {receta.graduaciones && receta.graduaciones.length > 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Graduaciones
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Distancia
                          </TableCell>
                          <TableCell sx={{ fontWeight: 'bold', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                            Ojo
                          </TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Esf</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Cil</TableCell>
                          <TableCell align="center" sx={{ fontWeight: 'bold', fontSize: '0.9rem' }}>Grados</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receta.graduaciones.map((grad, index) => (
                          <TableRow key={index} sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}>
                            <TableCell>
                              <Chip
                                label={grad.tipoDistancia.toUpperCase()}
                                size="small"
                                sx={{ 
                                  fontWeight: '800', 
                                  letterSpacing: '0.05em',
                                  backgroundColor: grad.tipoDistancia === 'lejos' ? '#1a237e' : '#455a64', // Deep Blue for far, Blue Grey for near
                                  color: '#ffffff',
                                  px: 0.5,
                                  '& .MuiChip-label': { px: 1.5 }
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={grad.ojo.toUpperCase()}
                                size="small"
                                variant="outlined"
                                sx={{ fontWeight: 'bold', letterSpacing: '0.05em' }}
                              />
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight="medium">
                                {formatGradValue(grad.esf)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight="medium">
                                {formatGradValue(grad.cil)}
                              </Typography>
                            </TableCell>
                            <TableCell align="center">
                              <Typography variant="body1" fontWeight="medium">
                                {formatGrados(grad.grados)}
                              </Typography>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </MainLayout>
  );
};
