# Gestor de Recetas - Frontend UI ⚛️

Este es el frontend de la aplicación de gestión de recetas, construido con **React** y **Material UI**, integrado profundamente con el backend de Go mediante **Wails**.

## 🚀 Tecnologías

- **React 18**
- **TypeScript**
- **Vite** (Build Tool)
- **Material UI (MUI v5)**: Diseño premium y responsivo.
- **TanStack Query (React Query)**: Gestión de estado y caché de datos.
- **React Router v6**: Navegación SPA.
- **React Hook Form + Zod**: Validación de formularios.

## 🔌 Integración con Go (Wails)

A diferencia de las aplicaciones web tradicionales, esta UI no utiliza Axios ni llamadas REST manuales. En su lugar, utiliza los enlaces generados por Wails:

```typescript
import { GetAll, Create } from '../wailsjs/go/services/RecetaService';

// Ejemplo de uso:
const recetas = await GetAll(filters);
```

Los tipos de TypeScript para los modelos de Go se encuentran en `src/wailsjs/go/models.ts` y se actualizan automáticamente cada vez que se ejecuta `wails dev`.

## 📁 Estructura del Proyecto

```
src/
├── api/          # Enmascaradores de llamadas a Wails (abstracción)
├── components/   # Componentes UI reutilizables
│   ├── common/   # Modales, spinners, diálogos
│   ├── layout/   # Sidebar, TopAppBar, MainLayout
│   └── forms/    # Inputs específicos y formularios rápidos
├── contexts/     # Contextos globales (Tema, etc.)
├── hooks/        # Custom hooks para datos (React Query)
├── pages/        # Vistas principales de la aplicación
├── theme/        # Configuración del tema Material UI
└── types/        # Definiciones de tipos adicionales
```

## 🛠️ Desarrollo

Para trabajar en el frontend de forma aislada (aunque se recomienda usar `wails dev` desde la raíz):

1. Entra a la carpeta: `cd frontend`
2. Instala dependencias: `npm install`
3. Inicia Vite: `npm run dev`

Nota: Algunas funcionalidades que dependen de Go fallarán si no se ejecutan dentro del contenedor de Wails.

---
**Desarrollado para la eficiencia en ópticas**
