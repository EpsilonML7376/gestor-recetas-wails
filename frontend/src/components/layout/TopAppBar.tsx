import React from 'react';
import {
  AppBar as MuiAppBar,
  Toolbar,
  IconButton,
  Typography,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChevronLeft,
  ChevronRight,
} from '@mui/icons-material';
import { DRAWER_WIDTH_EXPORT, DRAWER_WIDTH_COLLAPSED_EXPORT } from './Sidebar';

interface TopAppBarProps {
  onDrawerToggle: () => void;
  onSidebarToggle: () => void;
  sidebarOpen: boolean;
  title?: string;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ 
  onDrawerToggle, 
  onSidebarToggle, 
  sidebarOpen,
  title 
}) => {
  const drawerWidth = sidebarOpen ? DRAWER_WIDTH_EXPORT : DRAWER_WIDTH_COLLAPSED_EXPORT;

  return (
    <MuiAppBar
      position="fixed"
      sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
        transition: 'margin 0.3s ease, width 0.3s ease',
      }}
    >
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={onDrawerToggle}
          sx={{ mr: 2, display: { sm: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <IconButton
          color="inherit"
          edge="start"
          onClick={onSidebarToggle}
          sx={{ 
            mr: 2, 
            display: { xs: 'none', sm: 'flex' },
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {sidebarOpen ? <ChevronLeft /> : <ChevronRight />}
        </IconButton>

        <Typography 
          variant="h6" 
          noWrap 
          component="div" 
          sx={{ 
            flexGrow: 1,
            fontWeight: 600,
            letterSpacing: '-0.01em',
          }}
        >
          {title || 'Gestor de Recetas'}
        </Typography>
      </Toolbar>
    </MuiAppBar>
  );
};
