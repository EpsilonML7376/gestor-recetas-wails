# Repository Audit — gestor-recetas-wails

> Audit date: 2026-11-10  
> Scope: Full stack (Go backend, React/TypeScript frontend, build configuration, dependencies, tests, accessibility).  
> Method: Static analysis with CodeGraph exploration and targeted file reads.

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 4 |
| High | 9 |
| Medium | 13 |
| Low | 7 |

The application is a functional Wails v2 desktop app, but it carries significant architectural dead weight (an unused HTTP layer), zero tests, fragile frontend/backend type contracts, and several data-integrity risks. The most urgent issues are data-loss scenarios (SQLite relative path, unguarded deletions) and the unnecessary attack surface from unused dependencies.

---

## Critical Findings

### CRIT-001 — Complete unused HTTP/gin layer
- **Files**: `internal/handlers/*.go`, `internal/utils/responses.go`, `internal/dto/receta_input.go`, `internal/dto/graduacion_input.go`, `go.mod:6`
- **Issue**: A full gin-based REST layer is implemented but never registered in `main.go`. The Wails runtime exposes services directly via `Bind`. Gin and its transitive dependencies are still compiled into the binary, increasing size and attack surface.
- **Evidence**: `main.go:63-69` only binds `app` and the four services; no handlers are instantiated. `go.mod:6` declares `github.com/gin-gonic/gin v1.12.0`.
- **Recommendation**: Remove `internal/handlers`, `internal/utils/responses.go`, the unused input DTOs, and the `gin` dependency. If a dual HTTP API is required, document it and register the router explicitly.

### CRIT-002 — Entity deletion does not verify dependent prescriptions
- **Files**: `internal/services/cliente.go:92-110`, `internal/services/doctor.go:93-101`, `internal/services/mutual.go:93-101`, matching repositories
- **Issue**: Clients, doctors, and insurers can be deleted without checking whether prescriptions reference them. SQLite may raise a FK error (if foreign keys are enabled), but the user sees a raw technical message; if FKs are disabled, orphan records are created.
- **Evidence**: `internal/services/cliente.go:103` calls `s.repo.Delete(id)` with no prior dependency check.
- **Recommendation**: Validate in the service layer that no prescriptions reference the entity before deleting, or use `ON DELETE RESTRICT` and return a clear business error.

### CRIT-003 — SQLite database path is relative and unversioned
- **Files**: `internal/database/db.go:17`
- **Issue**: The DSN is hardcoded as `"datos.db"`, relative to the working directory. Launching the executable from a different directory creates or opens a different database, appearing as data loss. No migrations or backups exist.
- **Evidence**: `dsn := "datos.db"` in `internal/database/db.go:17`.
- **Recommendation**: Use a deterministic application data directory (e.g., `os.UserConfigDir()` + app name). Implement versioned migrations (e.g., `gormigrate`) and backup the existing file before migrating.

### CRIT-004 — Frontend casts and `any` bypass the Wails type contract
- **Files**: `frontend/src/pages/Recetas/RecetaForm.tsx:217,361,363`, `frontend/src/pages/Clientes/ClienteForm.tsx:62,64`, `frontend/src/pages/Doctores/DoctorForm.tsx:55,57`, `frontend/src/pages/Mutuales/MutualForm.tsx:52,54`, `frontend/src/components/forms/*.tsx`
- **Issue**: Form data is repeatedly cast with `as any` before calling Wails services. This defeats TypeScript and hides breaking changes in the generated models.
- **Evidence**: 12 matches of `as any` and 11 of `: any` in `frontend/src/`.
- **Recommendation**: Build properly typed objects from form state, derive types from `frontend/wailsjs/go/models.ts`, and remove all `any` casts.

---

## High Findings

### HIGH-001 — `database.DB` is a global variable
- **Files**: `internal/database/db.go:12`, `main.go:30`
- **Issue**: A package-level `var DB *gorm.DB` makes unit testing impossible, hides dependencies, and risks races if `InitDB` is called more than once.
- **Recommendation**: Return `*gorm.DB` from `InitDB` and inject it into repositories. Remove `GetDB()` and the global.

### HIGH-002 — Dead input DTOs and gin tags in GORM models
- **Files**: `internal/dto/receta_input.go`, `internal/dto/graduacion_input.go`, `internal/models/*.go`
- **Issue**: Input DTOs are only consumed by unused handlers. Models contain `binding:"required"` tags, which are gin-specific and have no effect under GORM/Wails.
- **Recommendation**: Define input structs for Wails or add programmatic validation in services. Remove gin tags from models.

### HIGH-003 — No repository/service interfaces
- **Files**: `internal/repositories/*.go`, `internal/services/*.go`
- **Issue**: Concrete implementations are passed directly, preventing mocks in unit tests and coupling layers tightly.
- **Recommendation**: Declare small interfaces (e.g., `RecetaRepository`) and inject them into services.

### HIGH-004 — Frontend `src/types/` is completely unused
- **Files**: `frontend/src/types/*.ts`
- **Issue**: Manual TypeScript types are duplicated but never imported. The app relies solely on Wails-generated models, so the manual types drift out of sync.
- **Recommendation**: Delete `frontend/src/types/` or re-export/specialize the generated Wails models.

### HIGH-005 — Error handling assumes Axios responses on Wails errors
- **Files**: `frontend/src/hooks/useRecetas.ts:31-35`, `frontend/src/hooks/useClientes.ts:31-35`, `frontend/src/hooks/useDoctores.ts:31-35`, `frontend/src/hooks/useMutuales.ts:31-35`
- **Issue**: Mutations read `error.response?.data?.message`, an Axios shape. Wails errors do not expose this structure, so real error messages are lost.
- **Recommendation**: Type errors as `Error`, use `error.message`, and normalize errors in the API layer.

### HIGH-006 — Unused network/crypto dependencies in frontend
- **Files**: `frontend/package.json:21,23,25`
- **Issue**: `axios`, `jsonwebtoken`, and `bcryptjs` are declared but never imported in `src/`. They increase install time, bundle size, and attack surface.
- **Recommendation**: Run `depcheck` / `npm prune` and remove unused dependencies.

### HIGH-007 — Missing `.gitignore`
- **Files**: repository root
- **Issue**: No `.gitignore` exists. Generated artifacts (`frontend/dist/`, `build/bin/`, `node_modules/`, `datos.db`) can be accidentally committed.
- **Recommendation**: Add a `.gitignore` covering `node_modules/`, `frontend/dist/`, `build/bin/`, `datos.db`, `*.exe`, `.env`, and IDE files.

### HIGH-008 — Zero tests in backend and frontend
- **Files**: entire repository
- **Issue**: No `*_test.go` or `*.test.tsx` files exist. `CLAUDE.md` documents test commands that cannot be run meaningfully.
- **Recommendation**: Start with table-driven unit tests for services, then add hook/component tests for critical UI flows.

### HIGH-009 — No CI/CD, linting gates, or pre-commit hooks
- **Files**: `.github/`, `.husky/`, `.pre-commit-config.yaml` (all absent)
- **Issue**: Nothing enforces `go test`, `go vet`, `go fmt`, or `npm run lint` before merge.
- **Recommendation**: Add a GitHub Actions workflow (or equivalent) that runs tests, lint, and `wails build` on every PR.

---

## Medium Findings

### MED-001 — `DoctorService.Delete` and `MutualService.Delete` do not check existence
- **Files**: `internal/services/doctor.go:93-101`, `internal/services/mutual.go:93-101`
- **Issue**: Unlike `RecetaService`/`ClienteService`, these services delete without checking existence, returning generic GORM errors instead of a consistent "not found" business error.
- **Recommendation**: Unify the pattern: call `FindByID` before `Delete`.

### MED-002 — Filter logic duplicated between `FindAll` and `Count`
- **Files**: `internal/repositories/receta.go:50-102`, `internal/repositories/receta.go:184-218`
- **Issue**: The same `Where` clauses are repeated, so any filter change must be made in two places.
- **Recommendation**: Extract a private `applyFilters(query, filters)` helper.

### MED-003 — Logger initialization error ignored
- **Files**: `main.go:23`
- **Issue**: `zap.NewProduction()` may return an error, but it is discarded.
- **Recommendation**: Handle the error and exit if the logger cannot be created.

### MED-004 — No business validation or input sanitization
- **Files**: `internal/services/*.go`, `internal/models/*.go`
- **Issue**: No length limits, format checks for DNI/phone, negative-price guards, or uniqueness constraints. `Cliente.DNI` is only indexed, not unique.
- **Recommendation**: Add service-level validation and unique constraints where business rules require them.

### MED-005 — PII logged without masking
- **Files**: `internal/repositories/cliente.go:55-61`
- **Issue**: Search terms (names, DNI, phone) are logged in plain text.
- **Recommendation**: Define a PII policy and avoid logging sensitive fields.

### MED-006 — `Dashboard.tsx` and `TopAppBar.tsx` are dead code
- **Files**: `frontend/src/pages/Dashboard.tsx`, `frontend/src/components/layout/TopAppBar.tsx`
- **Issue**: `Dashboard` is not in the router and `TopAppBar` is not imported anywhere.
- **Recommendation**: Remove them or integrate them into the layout/router.

### MED-007 — Vite proxy `/api` is irrelevant for Wails
- **Files**: `frontend/vite.config.ts:13-20`
- **Issue**: A proxy to `localhost:8080` remains from a web scaffold but the app uses Wails bindings.
- **Recommendation**: Remove the `server.proxy` block.

### MED-008 — `netlify.toml` is irrelevant for a desktop app
- **Files**: `frontend/netlify.toml`
- **Issue**: Web deployment config in a Wails desktop project.
- **Recommendation**: Remove it unless a specific web build exists.

### MED-009 — `react-hook-form`, `zod`, and `@hookform/resolvers` installed but unused
- **Files**: `frontend/package.json:15,25,29`
- **Issue**: Forms use manual `useState`; these validation libraries add dead weight.
- **Recommendation**: Either adopt them for form validation or remove them.

### MED-010 — `refetchOnWindowFocus: true` in a desktop app
- **Files**: `frontend/src/lib/queryClient.ts:19`
- **Issue**: Constant window-focus changes in a desktop app trigger unnecessary refetches.
- **Recommendation**: Set `refetchOnWindowFocus: false`.

### MED-011 — Two date libraries
- **Files**: `frontend/package.json:23,24`
- **Issue**: Both `dayjs` (required by MUI X) and `date-fns` are used.
- **Recommendation**: Standardize on `dayjs` and remove `date-fns`.

### MED-012 — Autocomplete in forms loads only when search is non-empty
- **Files**: `frontend/src/pages/Recetas/RecetaForm.tsx:90-104`
- **Issue**: Users see no options until they type, which can be confusing.
- **Recommendation**: Load a sensible default set or show a clear helper message.

### MED-013 — Indirect dependencies `echo` and `mongo-driver` are pulled in
- **Files**: `go.mod:38`, `go.mod:64`
- **Issue**: These appear as indirect dependencies and likely originate from the unused gin/web layers.
- **Recommendation**: Clean up with `go mod tidy` after removing gin.

---

## Low Findings

### LOW-001 — `App.Greet` example method remains
- **Files**: `app.go:24-27`
- **Issue**: Scaffold sample still exposed as a binding.
- **Recommendation**: Remove it.

### LOW-002 — `TotalLente` uses `int` for money
- **Files**: `internal/models/receta.go:12`, `internal/services/receta.go:26-32`
- **Issue**: Monetary totals are accumulated in `int`.
- **Recommendation**: Use `int64` or a dedicated decimal/money type.

### LOW-003 — Inconsistent Go formatting
- **Files**: `internal/repositories/doctor.go:87-89`, `internal/repositories/mutual.go:87-89`, `internal/services/doctor.go:93-101`, `internal/services/mutual.go:93-101`
- **Issue**: Indentation is irregular in delete methods.
- **Recommendation**: Run `gofmt`/`goimports` and enforce formatting in CI.

### LOW-004 — `console.error` and native `alert` used for errors
- **Files**: `frontend/src/pages/Recetas/RecetaForm.tsx:372`, `frontend/src/pages/Clientes/ClienteForm.tsx:49,68`
- **Issue**: Errors leak to console or use browser `alert` instead of the existing `notistack` notifications.
- **Recommendation**: Use `enqueueSnackbar` consistently.

### LOW-005 — `throwOnError: false` and retry logic inspect HTTP status
- **Files**: `frontend/src/lib/queryClient.ts:11-27`
- **Issue**: `throwOnError: false` hides query errors, and `retry` checks `error.response?.status`, which does not exist for Wails errors.
- **Recommendation**: Adapt the QueryClient config to Wails error semantics.

### LOW-006 — No i18n mechanism
- **Files**: all frontend source files
- **Issue**: All labels, titles, and messages are hardcoded in Spanish.
- **Recommendation**: Evaluate `i18next` if multi-language support is possible.

### LOW-007 — Inconsistent Go version documentation
- **Files**: `go.mod:3`, `README.md:30`
- **Issue**: `go.mod` requires Go 1.25 while the README says 1.21+. Go 1.25 is not stable at the time of writing.
- **Recommendation**: Align both files with a current stable Go release.

---

## Accessibility Findings (WCAG 2.2)

### A11Y-001 — Icon-only buttons lack `aria-label`
- **Files**: `frontend/src/pages/Recetas/RecetasList.tsx:411-440`, `frontend/src/pages/Recetas/RecetaDetail.tsx:75-80`, `frontend/src/pages/Clientes/ClientesList.tsx:142-155`, `frontend/src/components/forms/GraduacionInputs.tsx:160`
- **Issue**: Screen readers cannot announce the purpose of icon buttons.
- **Recommendation**: Add a descriptive `aria-label` to every `IconButton`.

### A11Y-002 — Dialogs lack `aria-labelledby`/`aria-describedby`
- **Files**: `frontend/src/components/common/ConfirmDialog.tsx:33`, `frontend/src/pages/Recetas/RecetaForm.tsx:743-788`, `frontend/src/components/forms/ClienteQuickCreate.tsx:70`
- **Issue**: Dialog context is not explicitly announced.
- **Recommendation**: Link `DialogTitle` and `DialogContentText` to the `Dialog` via ARIA attributes.

### A11Y-003 — Sidebar collapse and theme toggle lack accessible labels
- **Files**: `frontend/src/components/layout/Sidebar.tsx:110-140`, `frontend/src/components/layout/Sidebar.tsx:304-321`
- **Issue**: `Tooltip` does not replace `aria-label` for screen readers.
- **Recommendation**: Add `aria-label` to all icon-only controls.

### A11Y-004 — Dynamic validation alert is not a live region
- **Files**: `frontend/src/pages/Recetas/RecetaForm.tsx:562-566`
- **Issue**: The `Alert` appears dynamically but is not announced.
- **Recommendation**: Wrap it in a container with `aria-live="polite"` or use `role="alert"`.

### A11Y-005 — Missing skip links and semantic landmarks
- **Files**: `frontend/src/components/layout/MainLayout.tsx`, `frontend/src/App.tsx`
- **Issue**: No skip link and no explicit `<header>`, `<nav>`, or `<main>` landmarks.
- **Recommendation**: Use MUI `component` prop for semantic elements and add a skip link.

### A11Y-006 — Tables lack captions
- **Files**: `frontend/src/pages/Recetas/RecetaDetail.tsx:244-303`, `frontend/src/pages/Recetas/RecetasList.tsx:476-543`
- **Issue**: Tables have no `caption` or `aria-label`.
- **Recommendation**: Add a title or `aria-label` to each table container.

---

## Quick Wins

1. Remove unused dependencies: `axios`, `jsonwebtoken`, `bcryptjs`, `date-fns`, `zod`, `react-hook-form`, `@hookform/resolvers`, `gin`.
2. Delete dead code: handlers, `utils/responses.go`, input DTOs, `Dashboard.tsx`, `TopAppBar.tsx`, `src/types/`, `App.Greet`.
3. Add a `.gitignore` and ensure `frontend/dist/`, `build/bin/`, `node_modules/`, and `datos.db` are excluded.
4. Run `gofmt`/`goimports` across the Go codebase.
5. Add `aria-label` to every icon-only button.
6. Disable `refetchOnWindowFocus` in the QueryClient.
7. Normalize error handling in hooks to use `error.message`.

---

## Top Technical Risks

1. **Data integrity**: unguarded deletions plus a relative SQLite path create real data-loss or orphan-record scenarios.
2. **Unnecessary attack surface**: unused network/crypto dependencies are compiled/installed without purpose.
3. **Untestable backend**: global state and missing interfaces make unit testing difficult, contributing to the current zero-test state.
4. **Fragile frontend/backend contract**: `any` casts and manual types that drift from generated models hide breaking changes.
5. **User experience and accessibility**: unlabeled controls, silent errors, and missing live regions affect keyboard and screen-reader users.
6. **Build/versioning hygiene**: missing `.gitignore`, no CI/CD, and inconsistent documentation reduce reproducibility.
