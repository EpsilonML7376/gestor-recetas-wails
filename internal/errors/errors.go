// Package errors defines shared domain sentinel errors used across repositories
// and services.
//
// Import it as `apperrors` in files that also import the standard library
// `errors` package, so both can coexist:
//
//	apperrors "GestorRecetasWails/internal/errors"
package errors

import "errors"

// ErrNotFound indicates that a requested entity does not exist.
// Repositories wrap it so callers can match with errors.Is(err, apperrors.ErrNotFound).
var ErrNotFound = errors.New("not found")

// ErrDuplicate indicates a uniqueness conflict for an entity.
// Services wrap it so callers can match with errors.Is(err, apperrors.ErrDuplicate).
var ErrDuplicate = errors.New("duplicate")
