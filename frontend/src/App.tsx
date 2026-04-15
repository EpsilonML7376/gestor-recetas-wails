import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import 'dayjs/locale/es';
import { ThemeProvider } from './contexts/ThemeContext';
import { queryClient } from './lib/queryClient';

// Páginas
import { RecetasList } from './pages/Recetas/RecetasList';
import { RecetaForm } from './pages/Recetas/RecetaForm';
import { RecetaDetail } from './pages/Recetas/RecetaDetail';
import { DoctoresList } from './pages/Doctores/DoctoresList';
import { DoctorForm } from './pages/Doctores/DoctorForm';
import { MutualesList } from './pages/Mutuales/MutualesList';
import { MutualForm } from './pages/Mutuales/MutualForm';
import { ClientesList } from './pages/Clientes/ClientesList';
import { ClienteForm } from './pages/Clientes/ClienteForm';

const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/recetas" replace />,
  },
  {
    path: "/recetas",
    element: <RecetasList />,
  },
  {
    path: "/recetas/nueva",
    element: <RecetaForm />,
  },
  {
    path: "/recetas/:id",
    element: <RecetaDetail />,
  },
  {
    path: "/recetas/:id/editar",
    element: <RecetaForm />,
  },
  {
    path: "/doctores",
    element: <DoctoresList />,
  },
  {
    path: "/doctores/nuevo",
    element: <DoctorForm />,
  },
  {
    path: "/doctores/:id/editar",
    element: <DoctorForm />,
  },
  {
    path: "/mutuales",
    element: <MutualesList />,
  },
  {
    path: "/mutuales/nueva",
    element: <MutualForm />,
  },
  {
    path: "/mutuales/:id/editar",
    element: <MutualForm />,
  },
  {
    path: "/clientes",
    element: <ClientesList />,
  },
  {
    path: "/clientes/nuevo",
    element: <ClienteForm />,
  },
  {
    path: "/clientes/:id/editar",
    element: <ClienteForm />,
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  }
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
            autoHideDuration={3000}
          >
            <RouterProvider router={router} />
          </SnackbarProvider>
        </LocalizationProvider>
      </ThemeProvider>
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export default App;
