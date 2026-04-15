import React from 'react';
import {
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Divider,
  Box,
  Typography,
  Tooltip,
  IconButton,
  Button,
} from '@mui/material';
import {
  Receipt as ReceiptIcon,
  People as PeopleIcon,
  LocalHospital as LocalHospitalIcon,
  Business as BusinessIcon,
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  LightMode,
  DarkMode,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useThemeMode } from '../../contexts/ThemeContext';

const DRAWER_WIDTH = 240;
const DRAWER_WIDTH_COLLAPSED = 64;

interface MenuItem {
  text: string;
  icon: React.ReactNode;
  path: string;
}

const menuItems: MenuItem[] = [
  { text: 'Recetas', icon: <ReceiptIcon />, path: '/recetas' },
  { text: 'Clientes', icon: <PeopleIcon />, path: '/clientes' },
  { text: 'Doctores', icon: <LocalHospitalIcon />, path: '/doctores' },
  { text: 'Mutuales', icon: <BusinessIcon />, path: '/mutuales' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onDrawerToggle: () => void;
  sidebarOpen: boolean;
  onSidebarToggle: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  mobileOpen, 
  onDrawerToggle, 
  sidebarOpen,
  onSidebarToggle 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode } = useThemeMode();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar
        sx={{
          minHeight: '64px !important',
          display: 'flex',
          alignItems: 'center',
          justifyContent: sidebarOpen ? 'space-between' : 'center',
          px: sidebarOpen ? 2 : 0,
        }}
      >
        {sidebarOpen ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, overflow: 'hidden' }}>
              <ReceiptIcon 
                sx={{ 
                  fontSize: 32,
                  transition: 'transform 0.2s ease',
                  color: 'text.primary',
                }} 
              />
              <Typography 
                variant="h6" 
                noWrap 
                component="div" 
                sx={{
                  fontWeight: 600,
                  transition: 'opacity 0.2s ease',
                  color: 'text.primary',
                }}
              >
                Gestor Recetas
              </Typography>
            </Box>
            {/* Botón de cerrar para mobile */}
            <IconButton
              onClick={onDrawerToggle}
              sx={{ 
                display: { sm: 'none' },
                color: 'text.secondary',
              }}
              aria-label="cerrar menú"
            >
              <ChevronLeft />
            </IconButton>
            {/* Botón de toggle para desktop */}
            <IconButton
              onClick={onSidebarToggle}
              sx={{ 
                display: { xs: 'none', sm: 'flex' },
                color: 'text.secondary',
                transition: 'transform 0.2s ease',
                '&:hover': {
                  transform: 'scale(1.1)',
                  color: 'primary.main',
                },
              }}
            >
              <ChevronLeft />
            </IconButton>
          </>
        ) : (
          <IconButton
            onClick={onSidebarToggle}
            sx={{ 
              display: { xs: 'none', sm: 'flex' },
              color: 'text.secondary',
              mx: 'auto',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.1)',
                color: 'primary.main',
              },
            }}
          >
            <ChevronRight />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      {/* Botón de acción rápida para crear receta */}
      <Box sx={{ p: sidebarOpen ? 1.5 : 1 }}>
        {sidebarOpen ? (
          <Button
            variant="contained"
            fullWidth
            startIcon={<AddIcon />}
            onClick={() => {
              navigate('/recetas/nueva');
              if (mobileOpen) {
                onDrawerToggle();
              }
            }}
            sx={{
              borderRadius: 2,
              py: 1.25,
              fontWeight: 600,
              textTransform: 'none',
              backgroundColor: 'text.primary',
              color: 'background.default',
              '&:hover': {
                backgroundColor: 'text.primary',
                opacity: 0.9,
                transform: 'translateY(-1px)',
              },
            }}
          >
            Nueva Receta
          </Button>
        ) : (
          <Tooltip title="Nueva Receta" placement="right" arrow>
            <IconButton
              onClick={() => {
                navigate('/recetas/nueva');
                if (mobileOpen) {
                  onDrawerToggle();
                }
              }}
              sx={{
                width: '100%',
                height: 48,
                borderRadius: 2,
                bgcolor: 'text.primary',
                color: 'background.default',
                '&:hover': {
                  opacity: 0.9,
                  transform: 'scale(1.05)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <AddIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      <Divider />
      <List sx={{ flexGrow: 1, px: sidebarOpen ? 1 : 0.5 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          const listItemButton = (
            <ListItemButton
              selected={isActive}
              onClick={() => {
                navigate(item.path);
                if (mobileOpen) {
                  onDrawerToggle();
                }
              }}
              sx={{
                minHeight: 48,
                borderRadius: 2,
                mx: sidebarOpen ? 1 : 0.5,
                px: sidebarOpen ? 2 : 1.5,
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
                position: 'relative',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateX(2px)',
                },
                '&.Mui-selected': {
                  color: 'text.primary',
                  '&:hover': {},
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 4,
                    height: '60%',
                    backgroundColor: 'text.primary',
                    borderRadius: '0 2px 2px 0',
                  },
                },
              }}
            >
              <ListItemIcon
                sx={{
                  minWidth: sidebarOpen ? 40 : 'auto',
                  color: isActive ? 'text.primary' : 'text.secondary',
                  justifyContent: 'center',
                  transition: 'color 0.2s ease',
                }}
              >
                {item.icon}
              </ListItemIcon>
              {sidebarOpen && (
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 500,
                    fontSize: '0.875rem',
                  }}
                />
              )}
            </ListItemButton>
          );

          const listItem = (
            <ListItem key={item.text} disablePadding sx={{ mb: 0.5 }}>
              {sidebarOpen ? (
                listItemButton
              ) : (
                <Tooltip title={item.text} placement="right" arrow>
                  {listItemButton}
                </Tooltip>
              )}
            </ListItem>
          );

          return listItem;
        })}
      </List>
      {/* Botón de toggle de tema */}
      <Divider />
      <Box sx={{ p: sidebarOpen ? 1.5 : 1 }}>
        {sidebarOpen ? (
          <Button
            fullWidth
            onClick={toggleMode}
            startIcon={mode === 'dark' ? <LightMode /> : <DarkMode />}
            sx={{
              borderRadius: 2,
              py: 1.25,
              textTransform: 'none',
              justifyContent: 'flex-start',
              color: 'text.primary',
              backgroundColor: 'transparent',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                backgroundColor: 'action.hover',
                borderColor: 'text.secondary',
              },
            }}
          >
            {mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'}
          </Button>
        ) : (
          <Tooltip title={mode === 'dark' ? 'Modo Claro' : 'Modo Oscuro'} placement="right" arrow>
            <IconButton
              onClick={toggleMode}
              sx={{
                width: '100%',
                color: 'text.secondary',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  backgroundColor: 'action.hover',
                  color: 'text.primary',
                  borderColor: 'text.secondary',
                },
              }}
            >
              {mode === 'dark' ? <LightMode /> : <DarkMode />}
            </IconButton>
          </Tooltip>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Mobile drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: DRAWER_WIDTH,
          },
        }}
      >
        {drawer}
      </Drawer>

      {/* Desktop drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: sidebarOpen ? DRAWER_WIDTH : DRAWER_WIDTH_COLLAPSED,
            transition: 'width 0.3s ease',
            overflowX: 'hidden',
            borderRight: 'none',
          },
        }}
        open={sidebarOpen}
      >
        {drawer}
      </Drawer>
    </>
  );
};

export const DRAWER_WIDTH_EXPORT = DRAWER_WIDTH;
export const DRAWER_WIDTH_COLLAPSED_EXPORT = DRAWER_WIDTH_COLLAPSED;
