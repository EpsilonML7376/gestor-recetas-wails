import React from 'react';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Button,
  Paper,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  LocalHospital as DoctorIcon,
  Business as BusinessIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../components/layout/MainLayout';
import { useRecetas } from '../hooks/useRecetas';
import { repositories } from '../../wailsjs/go/models';
import { useClientes } from '../hooks/useClientes';
import { useDoctores } from '../hooks/useDoctores';
import { useMutuales } from '../hooks/useMutuales';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  onClick?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, onClick }) => {
  return (
    <Card 
      sx={{ 
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': onClick ? {
          transform: 'translateY(-4px)',
          boxShadow: 3,
        } : {},
      }}
      onClick={onClick}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              backgroundColor: color,
              borderRadius: 2,
              p: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { data: recetasData, isLoading: recetasLoading } = useRecetas(new repositories.RecetaFilters({ Limit: 1000 }));
  const { data: clientesData, isLoading: clientesLoading } = useClientes(new repositories.ClienteFilters({ Limit: 20 }));
  const { data: doctoresData, isLoading: doctoresLoading } = useDoctores(new repositories.DoctorFilters({ Limit: 20 }));
  const { data: mutualesData, isLoading: mutualesLoading } = useMutuales(new repositories.MutualFilters({ Limit: 20 }));

  const isLoading = recetasLoading || clientesLoading || doctoresLoading || mutualesLoading;

  if (isLoading) {
    return (
      <MainLayout title="Dashboard">
        <LoadingSpinner />
      </MainLayout>
    );
  }

  const totalRecetas = recetasData?.total || 0;
  const totalClientes = clientesData?.total || 0;
  const totalDoctores = doctoresData?.total || 0;
  const totalMutuales = mutualesData?.total || 0;

  return (
    <MainLayout title="Dashboard">
      <Box>
        <Typography variant="h4" gutterBottom>
          Bienvenido al Gestor de Recetas
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Sistema de gestión de recetas de lentes para ópticas
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4, mt: 2 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Recetas"
              value={totalRecetas}
              icon={<ReceiptIcon sx={{ color: 'white', fontSize: 32 }} />}
              color="primary.main"
              onClick={() => navigate('/recetas')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Clientes"
              value={totalClientes}
              icon={<PeopleIcon sx={{ color: 'white', fontSize: 32 }} />}
              color="secondary.main"
              onClick={() => navigate('/clientes')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Doctores"
              value={totalDoctores}
              icon={<DoctorIcon sx={{ color: 'white', fontSize: 32 }} />}
              color="info.main"
              onClick={() => navigate('/doctores')}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Mutuales"
              value={totalMutuales}
              icon={<BusinessIcon sx={{ color: 'white', fontSize: 32 }} />}
              color="warning.main"
              onClick={() => navigate('/mutuales')}
            />
          </Grid>
        </Grid>

        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Accesos Rápidos
          </Typography>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/recetas/nueva')}
                size="large"
              >
                Nueva Receta
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<ReceiptIcon />}
                onClick={() => navigate('/recetas')}
                size="large"
              >
                Ver Recetas
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<PeopleIcon />}
                onClick={() => navigate('/clientes')}
                size="large"
              >
                Gestionar Clientes
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>
    </MainLayout>
  );
};

