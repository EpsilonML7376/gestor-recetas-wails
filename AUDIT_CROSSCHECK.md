# Cross-Check Audit — Kimi Code 2.7 vs DeepSeek

> Date: 2026-11-10
> Method: Independent verification of every Kimi finding against the actual source (not a re-read of Kimi's report).
> Reference: `AUDIT.md` (Kimi's audit).

---

## Verdict summary

| Verdict | Count |
|---------|-------|
| Confirmed (verified correct) | 32 |
| Partially wrong / mis-attributed | 1 |
| False positive | 1 |
| Understated (bigger than Kimi reported) | 4 |
| Time-sensitive claim | 1 |

Kimi's audit is **broad and mostly accurate**, but it has one clear false positive, one mis-attribution, and several findings that understate the real scope. It also missed a handful of concrete issues documented below.

---

## False positives (Kimi was wrong)

### HIGH-007 — "Missing .gitignore" — ❌ FALSE
- **Kimi claimed**: no `.gitignore` exists, and recommended adding one covering `node_modules/`, `frontend/dist/`, `build/bin/`, `datos.db`, `*.exe`, `.env`, and IDE files.
- **Reality**: `.gitignore` exists, is committed (commit `9c8c18f`), and is comprehensive. It already covers **exactly** what Kimi recommended: `build/bin/`, `frontend/dist/`, `node_modules/`, `datos.db`, `*.exe`, `.env`/`.env.*`, and IDE files.
- **Impact**: One of Kimi's "High" findings is noise. Does not need action.

---

## Mis-attributed

### MED-013 — "echo and mongo-driver pulled in from the unused gin layer" — ⚠️ PARTIALLY WRONG
- `go mod why` proves the two claims have different origins:
  - `echo` → required by **Wails** (`wails/v2/internal/frontend/devserver`), **not** gin. It stays even after removing gin.
  - `mongo-driver` → `main module does not need package go.mongodb.org/mongo-driver/v2`. It is a true **orphan** (nothing imports it). It is NOT from gin; it's leftover cruft removable with `go mod tidy`.
- **Correct action**: `go mod tidy` removes gin (after handlers are deleted) *and* mongo-driver, but keeps echo (Wails needs it).

---

## Understated (bigger than Kimi reported)

### LOW-003 — "Inconsistent Go formatting" — scope is ~5x larger
- Kimi cited 4 files. `gofmt -l` reported **21 of 25** Go files unformatted. The whole backend was not `gofmt`-clean (mixed indentation, import ordering, stray blank lines).
- **Status**: ✅ already fixed (`gofmt -w` applied, `go vet` and `go build` clean).

### LOW-004 — `alert()` / `console.error` — more instances than cited
- Kimi cited 2 spots. Reality: `alert()` in **3** forms (ClienteForm:49, DoctorForm:44, MutualForm:42) and `console.error` in **7** places (all 3 QuickCreate components + all 4 form pages).

### A11Y-001 — Icon buttons without `aria-label` — near-total, not partial
- Kimi cited specific buttons. Reality: **49 `IconButton` usages, only 2 have `aria-label`**. Also zero `aria-labelledby`, `aria-describedby`, `role=`, or `aria-live` anywhere in the codebase (confirms A11Y-002 and A11Y-004 too).

### HIGH-004 — `src/types/` is not just "unused", it is STALE
- Kimi said "duplicated but never imported". Reality: `frontend/src/types/receta.ts` describes an **old schema** that no longer matches the Go model — it has singular `lenteCristalTipo`/`lenteArmazonPrecio` fields, but the actual model has `Lentes []Lente` (plural) with `CristalTipo`/`ArmazonPrecio`. If anyone ever imported it, it would compile but describe the wrong shape.

---

## Time-sensitive claim

### LOW-007 — "Go 1.25 is not stable"
- The **core** finding is real: `go.mod` requires `go 1.25.0`, but `README.md:30` says "v1.21+". That mismatch stands.
- The "not stable" part is stale: the installed toolchain is `go1.25.4` (Nov 2026). Action: align the README to `1.25+`.

---

## New findings Kimi missed

1. **`go.mod` leaked a machine-specific absolute path** — `// replace ... => C:\Users\mateo\go\pkg\mod` committed in a commented line. Privacy/hygiene issue. ✅ **Fixed**.
2. **`src/types/receta.ts` drift** (detailed above) — the unused types are actively wrong, not just redundant.
3. **`README.md` has scaffold placeholders** — `git clone https://github.com/tu-usuario/GestorRecetasWails.git` (line 38), a `via.placeholder.com` image (line 5), and a wrong binding path `wailsjs/` (line 62; actual is `frontend/wailsjs/`).
4. **`CLAUDE.md` is inaccurate and misleads future agents** — claims "Frontend uses Zod for schema validation" (zod is unused), documents the dead HTTP/handler layer as if active, and says "React Query cache keys use entity ID" (they use full filter objects).
5. **Error matching by string literal** — handlers do `err.Error() == "cliente no encontrado"` (cliente.go:92,118,138 and peers) instead of `errors.Is(err, gorm.ErrRecordNotFound)`. Fragile (though currently inside dead handler code).
6. **Inconsistent repository constructors** — `ClienteRepository` takes `(db, logger)`, the other three take only `(db)`. The logger is only used to log search PII (MED-005), which is itself questionable.
7. **`RecetaRepository.Update` deletes-and-reinserts Graduaciones/Lentes** on every edit, resetting their IDs to 0. This churns primary keys, bloats SQLite, and breaks any future reference to those row IDs.
8. **No explicit `PRAGMA foreign_keys = ON`** — the root ambiguity behind CRIT-002. GORM creates FK constraints from the `foreignKey` tags, but SQLite only *enforces* them when the pragma is on; the driver default is not asserted here, so the "orphan vs raw error" behavior is unspecified.

---

## Confirmed findings (verified correct — no change to Kimi's assessment)

- CRIT-001 (unused gin/handlers/dto layer) ✅ — `go mod why gin` → only `internal/handlers`; nothing wires handlers into `main.go`.
- CRIT-002 (deletion without dependency check) ✅ — Cliente/Doctor/Mutual delete without checking referencing recetas; no `OnDelete` constraint.
- CRIT-003 (relative `datos.db` path) ✅ — `dsn := "datos.db"` at `db.go:17`.
- CRIT-004 (12 `as any` + 11 `: any`) ✅ — exact counts verified by grep.
- HIGH-001 (global `DB` var + `GetDB()`) ✅.
- HIGH-002 (dead input DTOs + inert `binding:"required"` gin tags in models) ✅.
- HIGH-003 (no interfaces) ✅.
- HIGH-005 (hooks read `error.response?.data?.message`, an Axios shape) ✅.
- HIGH-006 (axios / jsonwebtoken / bcryptjs unused — no imports) ✅.
- HIGH-008 (0 tests) ✅ — no `*_test.go`, no `*.test.tsx`.
- HIGH-009 (no CI) ✅ — no `.github/`.
- MED-001 (Doctor/Mutual delete skip existence check) ✅.
- MED-002 (filter logic duplicated between FindAll and Count) ✅ — in all four repos.
- MED-003 (zap error ignored) ✅ — ✅ Fixed.
- MED-004 (no validation/uniqueness; DNI indexed not unique) ✅.
- MED-005 (search terms logged in plain text) ✅ — `cliente.go:55-61`.
- MED-006 (Dashboard.tsx + TopAppBar.tsx dead) ✅ — neither imported anywhere.
- MED-007 (vite proxy `/api` → :8080) ✅.
- MED-008 (`netlify.toml`) ✅.
- MED-009 (react-hook-form / zod / @hookform/resolvers unused) ✅.
- MED-010 (`refetchOnWindowFocus: true`) ✅.
- MED-011 (two date libs) ✅ — correctly noted both are used (dayjs for MUI X, date-fns in 2 files); low priority.
- MED-012 (autocomplete loads only on non-empty search) ✅.
- LOW-001 (`App.Greet`) ✅.
- LOW-002 (`int` for money) ✅ — `TotalLente int`, `CristalPrecio int`, `ArmazonPrecio int`.
- LOW-005 (`throwOnError: false`, retry checks `error.response?.status`) ✅.
- LOW-006 (no i18n) ✅.
- A11Y-002/003/004/005/006 ✅ — verified via grep (zero aria-labelledby/describedby/live/role, tables lack captions, no landmarks/skip link).

---

## Applied — "limpieza completa" (user-approved scope)

1. `gofmt -w` across the backend — fixed 21/25 unformatted files; `go vet` + `go build ./...` clean.
2. `main.go` — `zap.NewProduction()` error handled (was `logger, _ := ...` risking a nil-deref on `logger.Fatal`); `defer logger.Sync()` error swallowed explicitly.
3. `go.mod` — removed the machine-specific absolute path line.
4. **Removed dead HTTP layer** — deleted `internal/handlers/*` (4 files), `internal/utils/responses.go`, `internal/dto/{receta_input,graduacion_input}.go`; ran `go mod tidy` (dropped `gin` and the orphaned `mongo-driver`). `echo` correctly remains (Wails devserver).
5. **Removed unused npm deps** — `axios`, `jsonwebtoken`, `bcryptjs`, `react-hook-form`, `zod`, `@hookform/resolvers`. Kept `date-fns` and `dayjs` (both are actually imported).
6. **Fixed hook error handling** — `error.response?.data?.message` (Axios shape) → `error.message` (Wails shape) in all 4 hooks; removed the dead `error.response.status` retry check in `queryClient.ts`.
7. **Removed all `as any` / `: any`** from `frontend/src/` — forms now use `models.X.createFrom(...)`; `RecetaForm` drops the redundant `data as any` (it was already `models.Receta`) and narrows the graduation field cast to `as GraduacionUI`.

**Result**: 37 files changed, +96 / −940 lines (net −844). `go build ./...`, `go vet ./...`, `tsc`, and `vite build` all pass.

---

## New finding surfaced during cleanup (not in Kimi's audit)

- **Frontend lint is broken**: `npm run lint` exits 1 with **351 pre-existing errors**, overwhelmingly `no-mixed-spaces-and-tabs` across files I did *not* touch (`RecetasList.tsx`, `RecetaDetail.tsx`, `Sidebar.tsx`, …). This is the TS twin of Kimi's Go formatting finding (LOW-003), which she did not flag for the frontend. The files I edited lint clean. Fixing it properly means adopting Prettier (or equivalent) and reformatting the whole frontend — a separate, larger pass.

---

## Remaining improvement plan (needs your decision)

| # | Change | Risk | Effort | Status |
|---|--------|------|--------|--------|
| 1 | CRIT-003: deterministic DB path (`os.UserConfigDir`) + backup/migration | High (data location changes) | M | pending |
| 2 | CRIT-002: block delete when recetas reference the entity (+ `PRAGMA foreign_keys=ON`) | High (behavior) | M | pending |
| 3 | CRIT-001: remove gin/handlers/dto/utils | Low | M | ✅ done |
| 4 | HIGH-006/MED-009: remove unused npm deps | Low | S | ✅ done |
| 5 | HIGH-005: fix hook error handling | Low | S | ✅ done |
| 6 | CRIT-004: remove `as any` casts | Medium | M | ✅ done |
| 7 | Fix docs (README placeholders + CLAUDE.md inaccuracies) | None | S | pending |
| 8 | LOW-002: `int` → `int64` for money | Medium (contract) | M | pending |
| 9 | NEW: adopt Prettier + fix 351 frontend lint errors | Low | L | pending |
