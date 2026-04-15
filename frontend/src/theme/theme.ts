import { createTheme, ThemeOptions } from '@mui/material/styles';

// Función para crear el tema basado en el modo
export const createAppTheme = (mode: 'light' | 'dark') => {
  const isDark = mode === 'dark';

  const baseTheme: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isDark ? '#ffffff' : '#000000',
        light: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.6)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.8)',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      secondary: {
        main: isDark ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
        light: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
        contrastText: isDark ? '#000000' : '#ffffff',
      },
      background: {
        default: isDark ? '#0a0a0a' : '#ffffff',
        paper: isDark ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.9)',
      },
      text: {
        primary: isDark ? 'rgba(255, 255, 255, 0.95)' : 'rgba(0, 0, 0, 0.95)',
        secondary: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
      },
      divider: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      success: {
        main: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        light: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      },
      error: {
        main: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        light: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      },
      warning: {
        main: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        light: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      },
      info: {
        main: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
        light: isDark ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.6)',
        dark: isDark ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 0, 0, 0.9)',
      },
      grey: {
        50: isDark ? '#1a1a1a' : '#fafafa',
        100: isDark ? '#2a2a2a' : '#f5f5f5',
        200: isDark ? '#3a3a3a' : '#eeeeee',
        300: isDark ? '#4a4a4a' : '#e0e0e0',
        400: isDark ? '#5a5a5a' : '#bdbdbd',
        500: isDark ? '#6a6a6a' : '#9e9e9e',
        600: isDark ? '#7a7a7a' : '#757575',
        700: isDark ? '#8a8a8a' : '#616161',
        800: isDark ? '#9a9a9a' : '#424242',
        900: isDark ? '#aaaaaa' : '#212121',
      },
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
        lineHeight: 1.2,
        letterSpacing: '-0.02em',
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
        lineHeight: 1.3,
        letterSpacing: '-0.01em',
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 600,
        lineHeight: 1.4,
        letterSpacing: '-0.01em',
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 600,
        lineHeight: 1.4,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 600,
        lineHeight: 1.5,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 600,
        lineHeight: 1.6,
      },
      body1: {
        fontSize: '1rem',
        lineHeight: 1.6,
        fontWeight: 400,
      },
      body2: {
        fontSize: '0.875rem',
        lineHeight: 1.5,
        fontWeight: 400,
      },
      button: {
        fontWeight: 500,
        letterSpacing: '0.01em',
      },
    },
    shape: {
      borderRadius: 12,
    },
    shadows: [
      'none',
      isDark 
        ? '0px 1px 2px 0px rgba(0, 0, 0, 0.3)' 
        : '0px 1px 3px 0px rgba(0, 0, 0, 0.12), 0px 1px 2px 0px rgba(0, 0, 0, 0.08)',
      isDark
        ? '0px 1px 3px 0px rgba(0, 0, 0, 0.4), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
        : '0px 2px 4px 0px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
      isDark
        ? '0px 4px 6px -1px rgba(0, 0, 0, 0.5), 0px 2px 4px -1px rgba(0, 0, 0, 0.4)'
        : '0px 4px 8px -2px rgba(0, 0, 0, 0.18), 0px 2px 4px -1px rgba(0, 0, 0, 0.12)',
      isDark
        ? '0px 10px 15px -3px rgba(0, 0, 0, 0.6), 0px 4px 6px -2px rgba(0, 0, 0, 0.4)'
        : '0px 10px 20px -4px rgba(0, 0, 0, 0.2), 0px 4px 8px -2px rgba(0, 0, 0, 0.15)',
      isDark
        ? '0px 20px 25px -5px rgba(0, 0, 0, 0.7), 0px 10px 10px -5px rgba(0, 0, 0, 0.5)'
        : '0px 20px 30px -6px rgba(0, 0, 0, 0.22), 0px 10px 15px -5px rgba(0, 0, 0, 0.18)',
      isDark
        ? '0px 25px 50px -12px rgba(0, 0, 0, 0.8)'
        : '0px 25px 50px -12px rgba(0, 0, 0, 0.3)',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
      'none',
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontWeight: 500,
            transition: 'all 0.2s ease-in-out',
          },
          contained: {
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            color: isDark ? '#ffffff' : '#000000',
            boxShadow: isDark
              ? '0px 4px 6px -1px rgba(0, 0, 0, 0.5), 0px 2px 4px -1px rgba(0, 0, 0, 0.4)'
              : '0px 4px 8px -2px rgba(0, 0, 0, 0.18), 0px 2px 4px -1px rgba(0, 0, 0, 0.12)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              boxShadow: isDark
                ? '0px 10px 15px -3px rgba(0, 0, 0, 0.6), 0px 4px 6px -2px rgba(0, 0, 0, 0.4)'
                : '0px 10px 20px -4px rgba(0, 0, 0, 0.2), 0px 4px 8px -2px rgba(0, 0, 0, 0.15)',
              transform: 'translateY(-1px)',
            },
          },
          outlined: {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
            borderWidth: '1.5px',
            color: isDark ? '#ffffff' : '#000000',
            '&:hover': {
              borderWidth: '1.5px',
              borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.6)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            boxShadow: isDark
              ? '0px 1px 3px 0px rgba(0, 0, 0, 0.4), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
              : '0px 2px 8px 0px rgba(0, 0, 0, 0.15), 0px 1px 4px 0px rgba(0, 0, 0, 0.1)',
            transition: 'all 0.2s ease-in-out',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.08)',
            '&:hover': {
              boxShadow: isDark
                ? '0px 10px 15px -3px rgba(0, 0, 0, 0.6), 0px 4px 6px -2px rgba(0, 0, 0, 0.4)'
                : '0px 12px 24px -4px rgba(0, 0, 0, 0.22), 0px 6px 12px -3px rgba(0, 0, 0, 0.18)',
              transform: 'translateY(-2px)',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            backgroundImage: 'none',
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.8)' : 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
          },
          elevation1: {
            boxShadow: isDark
              ? '0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
              : '0px 1px 3px 0px rgba(0, 0, 0, 0.12), 0px 1px 2px 0px rgba(0, 0, 0, 0.08)',
          },
          elevation2: {
            boxShadow: isDark
              ? '0px 1px 3px 0px rgba(0, 0, 0, 0.4), 0px 1px 2px 0px rgba(0, 0, 0, 0.3)'
              : '0px 2px 6px 0px rgba(0, 0, 0, 0.15), 0px 1px 3px 0px rgba(0, 0, 0, 0.1)',
          },
          elevation3: {
            boxShadow: isDark
              ? '0px 4px 6px -1px rgba(0, 0, 0, 0.5), 0px 2px 4px -1px rgba(0, 0, 0, 0.4)'
              : '0px 4px 10px -2px rgba(0, 0, 0, 0.18), 0px 2px 5px -1px rgba(0, 0, 0, 0.12)',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: 'all 0.2s ease-in-out',
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.02)',
              boxShadow: isDark 
                ? 'none' 
                : '0px 1px 2px 0px rgba(0, 0, 0, 0.05)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)',
                boxShadow: isDark 
                  ? 'none' 
                  : '0px 2px 4px 0px rgba(0, 0, 0, 0.08)',
              },
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(0, 0, 0, 0.3)',
              },
              '&.Mui-focused': {
                boxShadow: isDark 
                  ? 'none' 
                  : '0px 2px 6px 0px rgba(0, 0, 0, 0.12)',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
                borderColor: isDark ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
              },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            fontWeight: 500,
            backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
            boxShadow: isDark 
              ? 'none' 
              : '0px 1px 3px 0px rgba(0, 0, 0, 0.1), 0px 1px 2px 0px rgba(0, 0, 0, 0.06)',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: 'none',
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            boxShadow: isDark
              ? '2px 0px 8px rgba(0, 0, 0, 0.5)'
              : '2px 0px 12px rgba(0, 0, 0, 0.15), 1px 0px 4px rgba(0, 0, 0, 0.1)',
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            },
            '&.Mui-selected': {
              backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
              '&:hover': {
                backgroundColor: isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(0, 0, 0, 0.15)',
              },
            },
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: isDark
              ? '0px 2px 4px -1px rgba(0, 0, 0, 0.5), 0px 4px 5px 0px rgba(0, 0, 0, 0.3)'
              : '0px 2px 8px -1px rgba(0, 0, 0, 0.15), 0px 4px 10px 0px rgba(0, 0, 0, 0.1)',
            backgroundColor: isDark ? 'rgba(10, 10, 10, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiMenu: {
        styleOverrides: {
          paper: {
            boxShadow: isDark
              ? '0px 10px 15px -3px rgba(0, 0, 0, 0.6), 0px 4px 6px -2px rgba(0, 0, 0, 0.4)'
              : '0px 8px 16px -4px rgba(0, 0, 0, 0.2), 0px 4px 8px -2px rgba(0, 0, 0, 0.15)',
            borderRadius: 12,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiDialog: {
        styleOverrides: {
          paper: {
            boxShadow: isDark
              ? '0px 20px 25px -5px rgba(0, 0, 0, 0.7), 0px 10px 10px -5px rgba(0, 0, 0, 0.5)'
              : '0px 20px 30px -6px rgba(0, 0, 0, 0.22), 0px 10px 15px -5px rgba(0, 0, 0, 0.18)',
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.95)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        },
      },
      MuiPopover: {
        styleOverrides: {
          paper: {
            boxShadow: isDark
              ? '0px 10px 20px -4px rgba(0, 0, 0, 0.6), 0px 4px 8px -2px rgba(0, 0, 0, 0.4)'
              : '0px 8px 20px -4px rgba(0, 0, 0, 0.25), 0px 4px 10px -2px rgba(0, 0, 0, 0.2)',
            borderRadius: 16,
            backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
            border: isDark 
              ? '1px solid rgba(255, 255, 255, 0.1)' 
              : '1px solid rgba(0, 0, 0, 0.18)',
            // Estilos específicos para el calendario del DatePicker
            '& .MuiPickersCalendar-root': {
              backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            },
            '& .MuiPickersDay-root': {
              borderRadius: 8,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                boxShadow: isDark
                  ? '0px 2px 4px rgba(0, 0, 0, 0.3)'
                  : '0px 2px 4px rgba(0, 0, 0, 0.1)',
              },
              '&.Mui-selected': {
                boxShadow: isDark
                  ? '0px 2px 6px rgba(0, 0, 0, 0.4)'
                  : '0px 2px 6px rgba(0, 0, 0, 0.15)',
              },
            },
            // Estilos para el layout del DatePicker
            '& .MuiDateCalendar-root': {
              backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            },
            '& .MuiPickersLayout-root': {
              backgroundColor: isDark ? 'rgba(20, 20, 20, 0.98)' : 'rgba(255, 255, 255, 0.98)',
            },
          },
        },
      },
    },
  };

  return createTheme(baseTheme);
};

// Tema por defecto (light)
const theme = createAppTheme('light');

export default theme;
