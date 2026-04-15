import React, { useState, useEffect } from 'react';
import { 
  Box, 
  AppBar, 
  Toolbar, 
  IconButton, 
  Typography,
  useTheme
} from '@mui/material';
import { Menu as MenuIcon } from '@mui/icons-material';
import { Sidebar, DRAWER_WIDTH_EXPORT, DRAWER_WIDTH_COLLAPSED_EXPORT } from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

const SIDEBAR_STORAGE_KEY = 'sidebarOpen';

export const MainLayout: React.FC<MainLayoutProps> = ({ children, title }) => {
  const theme = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    return saved !== null ? saved === 'true' : true; // Por defecto abierta
  });

  useEffect(() => {
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(sidebarOpen));
  }, [sidebarOpen]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const drawerWidth = sidebarOpen ? DRAWER_WIDTH_EXPORT : DRAWER_WIDTH_COLLAPSED_EXPORT;

  return (
    <Box sx={{ display: 'flex', width: '100%', overflowX: 'hidden' }}>
      <Sidebar 
        mobileOpen={mobileOpen} 
        onDrawerToggle={handleDrawerToggle}
        sidebarOpen={sidebarOpen}
        onSidebarToggle={handleSidebarToggle}
      />
      {/* AppBar móvil */}
      <AppBar
        position="fixed"
        sx={{
          display: { xs: 'flex', sm: 'none' },
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title || 'Gestor de Recetas'}
          </Typography>
        </Toolbar>
      </AppBar>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 1.5, sm: 3 },
          width: { 
            xs: '100%',
            sm: `calc(100% - ${drawerWidth}px)` 
          },
          ml: { 
            xs: 0,
            sm: `${drawerWidth}px` 
          },
          transition: 'margin 0.3s ease, width 0.3s ease',
          minHeight: '100vh',
          backgroundColor: 'background.default',
          mt: { xs: '64px', sm: 0 }, // Espacio para el AppBar móvil
          overflowX: 'hidden', // Prevenir scroll horizontal
          maxWidth: '100%', // Asegurar que no se desborde
        }}
      >
        {children}
      </Box>
    </Box>
  );
};

