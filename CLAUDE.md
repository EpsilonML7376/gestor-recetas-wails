# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Project Overview

**Gestor de Recetas Wails** is a Wails v2 desktop application for managing optical lens prescriptions (ópticas). Built with:
- **Backend**: Go (Golang) with GORM ORM and SQLite
- **Frontend**: React + TypeScript + Vite
- **UI**: Material UI (MUI v5)
- **State Management**: TanStack Query
- **Build Tool**: Wails v2

# Architecture

## Project Structure

```
gestor-recetas-wails/
├── main.go                 # Wails entry point (wires services via Bind)
├── app.go                  # App lifecycle handler
├── internal/               # Backend code (private)
│   ├── models/            # GORM models
│   ├── repositories/      # Data access layer
│   ├── services/          # Business logic
│   ├── dto/               # Pagination wrapper structs
│   └── database/          # DB initialization (SQLite)
├── frontend/              # React frontend
│   ├── src/
│   │   ├── api/          # Wails API bindings
│   │   ├── components/   # React components
│   │   ├── contexts/     # React contexts (Theme)
│   │   ├── hooks/        # Custom hooks
│   │   ├── lib/          # Utility libraries
│   │   ├── pages/        # Route pages
│   │   ├── theme/        # MUI theme
│   │   ├── types/        # TypeScript types
│   │   └── App.tsx       # Root component
│   └── vite.config.ts
└── wails.json            # Wails config
```

## Backend Layers

The backend follows a layered architecture. Services are exposed to the frontend directly through Wails `Bind` (no HTTP layer):

1. **Models** (`internal/models/`): GORM structs with relationships
2. **Repositories** (`internal/repositories/`): Data access with GORM
3. **Services** (`internal/services/`): Business logic layer
4. **DTOs** (`internal/dto/`): Pagination wrapper structs

### Entity Relationships

- **Receta** (Prescription) is the main entity
- **Cliente** (Client) - 1:N with recetas
- **Doctor** - 1:N with recetas
- **Mutual** (Insurance) - 1:N with recetas
- **Graduacion** (Prescription specs) - N:M with recetas (lejos/cerca, ojo izq/der)
- **Lente** (Lens) - N:M with recetas (cristal + armazón)

# Commands

## Development

```bash
# Run in development mode (hot reload for both backend and frontend)
wails dev

# Install frontend dependencies
npm install

# Run frontend dev server only
npm run dev

# Build for production
wails build
```

## Frontend Commands

```bash
# Development with Vite
npm run dev        # Starts dev server at http://localhost:3000

# Production build
npm run build      # Outputs to frontend/dist

# Linting
npm run lint       # ESLint check
```

## Testing

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run a specific test file
go test -v ./internal/services/...
```

## Building

```bash
# Build installer for Windows
wails build

# Output location: build/bin/
```

# Frontend Architecture

## Routing

Single-page app with React Router:
- `/recetas` - Main list with filters
- `/recetas/nueva` - Create new prescription
- `/recetas/:id` - View recipe details
- `/recetas/:id/editar` - Edit recipe
- Similar routes for: clientes, doctores, mutuals

## State Management

- **TanStack Query** for server state (API calls, caching, sync)
- **localStorage** for theme preference and sidebar state
- **notistack** for toast notifications
- **MUI Theme** for light/dark mode

## API Layer

Frontend API files wrap Wails-generated bindings:

```typescript
// Example: frontend/src/api/recetas.ts
import { GetAll, GetByID, Create, Update, Delete, GetTotal } from '../../wailsjs/go/services/RecetaService';

export const recetasApi = {
  getAll: async (filters?: repositories.RecetaFilters) => {
    return await GetAll(filters || new repositories.RecetaFilters());
  },
  // ... other methods
};
```

# Backend Architecture

## Service Pattern

Each entity follows: `Repository` → `Service` → Wails `Bind` → frontend API wrapper

### Example Flow for Recetas

1. **Repository** (`internal/repositories/receta.go`): GORM CRUD operations
   - Uses transactions for cascade deletes
   - Supports filtering and pagination

2. **Service** (`internal/services/receta.go`): Business logic
   - Calculates lens totals
   - Error handling with logging
   - Bound directly to the frontend via `main.go` `Bind`

# Key Patterns

## Go Backend

### Repository Pattern
```go
type RecetaRepository struct {
    db *gorm.DB
}

func NewRecetaRepository(db *gorm.DB) *RecetaRepository {
    return &RecetaRepository{db: db}
}
```

### Service with Logging
```go
type RecetaService struct {
    repo   *repositories.RecetaRepository
    logger *zap.Logger
}

func (s *RecetaService) Create(receta *models.Receta) (*models.Receta, error) {
    if err := s.repo.Create(receta); err != nil {
        s.logger.Error("Error al crear receta", zap.Error(err))
        return nil, err
    }
    // ... business logic
}
```

### Transactional Updates
Repository updates use transactions to handle cascade deletes:
```go
func (r *RecetaRepository) Update(receta *models.Receta) error {
    return r.db.Transaction(func(tx *gorm.DB) error {
        // Update receta
        // Delete old graduaciones
        // Insert new graduaciones
        // Delete old lentes
        // Insert new lentes
    })
}
```

## React Frontend

### Custom Hooks Pattern
```typescript
// frontend/src/hooks/useRecetas.ts
export const useRecetas = (filters?: repositories.RecetaFilters) => {
  return useQuery({
    queryKey: ['recetas', filters],
    queryFn: () => recetasApi.getAll(filters),
  });
};

export const useCreateReceta = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  return useMutation({
    mutationFn: (data: models.Receta) => recetasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recetas'] });
      enqueueSnackbar('Receta creada exitosamente', { variant: 'success' });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error?.message || 'Error al crear la receta', { variant: 'error' });
    },
  });
};
```

### Component Structure
- **Pages**: `/pages/Recetas/RecetasList.tsx` - Main page with router
- **Forms**: `/pages/Recetas/RecetaForm.tsx` - Create/Edit
- **Details**: `/pages/Recetas/RecetaDetail.tsx` - View only
- **Components**: Shared UI components (`/components/`)

# Common Tasks

## Adding a New Entity

1. **Create Model** (`internal/models/Entity.go`)
2. **Create Repository** (`internal/repositories/Entity.go`)
3. **Create Service** (`internal/services/Entity.go`)
4. **Bind the service** in `main.go` (`Bind: []interface{}{ ... }`)
5. **Regenerate Wails bindings** (`wails build` or `wails dev`)
6. **Create API Wrapper** (`frontend/src/api/Entity.ts`, wrapping the generated binding)
7. **Create Pages/Components**

## Running Tests

```bash
# Run tests in current directory
go test -v .

# Run tests with verbose output
go test -v ./internal/services/

# Run with coverage
go test -cover ./...
```

## Debugging

### Backend
Add `logger.Sugar().Debugf()` for verbose logging:
```go
logger.Sugar().Debugf("Processing receta %d", receta.ID)
```

### Frontend
Use React DevTools and console.log (only in DEV mode in vite.config.ts)

# Database

- **Type**: SQLite
- **Location**: `datos.db` (same directory as app)
- **ORM**: GORM
- **Migration**: Auto-migration on startup via `AutoMigrate()`

## DB Initialization

```go
// internal/database/db.go
func InitDB(logger *zap.Logger) error {
    dsn := "datos.db"
    DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
    if err != nil {
        return fmt.Errorf("error al conectar a la base de datos: %w", err)
    }
    
    // Auto-migrate all models
    DB.AutoMigrate(
        &models.Cliente{},
        &models.Doctor{},
        &models.Mutual{},
        &models.Receta{},
        &models.Graduacion{},
        &models.Lente{},
    )
    return nil
}
```

# Frontend Theme

- **Context**: `frontend/src/contexts/ThemeContext.tsx`
- **Storage**: localStorage key `themeMode`
- **Modes**: 'light' | 'dark'
- **Implementation**: MUI ThemeProvider

# Type Safety

- API types are auto-generated from Go models in `frontend/wailsjs/go/models.ts` — always derive types from there (via `models.X.createFrom(...)`), never hand-write or duplicate them.
- React Query cache keys use the entity name plus the full filter object (e.g. `['recetas', filters]`).

# Notes

- The app maximizes on startup by default
- Frontend proxy configured in `vite.config.ts` to forward `/api/*` to backend port 8080
- Frontend builds go to `frontend/dist/` and are embedded via Go `embed`
- Windows-specific WebView2 integration via `wailsapp/go-webview2`
