# Gestor de Recetas - Ópticas 👓

Una aplicación de escritorio moderna y eficiente para la gestión de recetas de lentes, diseñada específicamente para ópticas. Construida con **Go**, **Wails v2** y **React**.

![App Screenshot](https://via.placeholder.com/800x450?text=Gestor+de+Recetas)

## 🚀 Características

- **Gestión de Recetas**: Registro completo de recetas con graduaciones (lejos/cerca, ojo izquierdo/derecho), armazones y cristales.
- **Base de Datos Local**: Almacenamiento seguro en SQLite.
- **Gestión de Entidades**: Control total de Clientes, Doctores y Mutuales.
- **Creación Inline**: Agrega doctores o mutuales directamente desde el formulario de recetas sin perder tu progreso.
- **Búsqueda Avanzada**: Filtros dinámicos por cliente, doctor, mutual, estado y fecha.
- **Diseño Moderno**: Interfaz premium con soporte para modo oscuro y claro.

## 🛠️ Stack Tecnológico

- **Backend**: Go (Golang)
- **Frontend**: React (TypeScript + Vite)
- **Framework**: [Wails v2](https://wails.io)
- **UI Components**: Material UI (MUI v5)
- **Estado/Caché**: TanStack Query (React Query)
- **Base de Datos**: SQLite (GORM)
- **Logging**: Uber Zap

## 🏁 Inicio Rápido

### Requisitos Previos

1. [Go](https://golang.org/dl/) (v1.21+)
2. [Node.js](https://nodejs.org/) (v18+)
3. [Wails CLI](https://wails.io/docs/gettingstarted/installation)

### Instalación y Desarrollo

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/GestorRecetasWails.git
   cd GestorRecetasWails
   ```

2. **Ejecutar en modo desarrollo:**
   ```bash
   wails dev
   ```
   *Esto iniciará el backend y el servidor de desarrollo de Vite con auto-recarga.*

### Construcción para Producción

Para generar el ejecutable final para Windows:
```bash
wails build
```
El instalador/ejecutable se encontrará en la carpeta `build/bin`.

## 📁 Estructura del Proyecto

- `main.go`: Punto de entrada de la aplicación Wails.
- `app.go`: Manejo del ciclo de vida de la aplicación.
- `internal/`: Lógica de negocio, servicios y repositorios en Go.
- `frontend/`: Aplicación React + Vite.
- `wailsjs/`: Enlaces generados automáticamente entre Go y JavaScript.

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---
**Desarrollado con ❤️ para ópticas modernas**
