// Package testutil provides shared test infrastructure for the project:
// isolated in-memory databases, hand-written mock repositories, and model
// factories. It is only imported from test code and never from production.
package testutil

import (
	"fmt"
	"sync/atomic"
	"testing"

	"GestorRecetasWails/internal/models"
	"github.com/glebarez/sqlite"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// testDBSeq yields a unique memory database name per call. A monotonic atomic
// counter is used instead of a timestamp so parallel tests can never collide.
var testDBSeq int64

// NewTestDB opens an isolated in-memory SQLite database, runs AutoMigrate for
// every model, and registers a cleanup that closes the underlying connection.
//
// Each call uses a unique named memory database (file:testdb-<n>?mode=memory)
// so concurrent tests never share state. The helper never touches the
// production datos.db file and requires no Wails runtime.
func NewTestDB(t *testing.T) *gorm.DB {
	t.Helper()

	n := atomic.AddInt64(&testDBSeq, 1)
	dsn := fmt.Sprintf("file:testdb-%d?mode=memory&cache=shared", n)

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		t.Fatalf("testutil: opening in-memory database %q: %v", dsn, err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("testutil: retrieving sql.DB handle: %v", err)
	}

	// Keep one connection alive so the shared-cache memory database survives
	// for the duration of the test instead of being dropped when the pool
	// momentarily has no open connections.
	sqlDB.SetMaxIdleConns(1)

	if err := migrateModels(db, zap.NewNop()); err != nil {
		t.Fatalf("testutil: running migrations: %v", err)
	}

	if err := sqlDB.Ping(); err != nil {
		t.Fatalf("testutil: pinging in-memory database: %v", err)
	}

	t.Cleanup(func() {
		if err := sqlDB.Close(); err != nil {
			t.Errorf("testutil: closing in-memory database: %v", err)
		}
	})

	return db
}

// migrateModels mirrors database.migrateModels so tests exercise the same
// schema without modifying production code.
func migrateModels(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Ejecutando migraciones de test...")

	err := db.AutoMigrate(
		&models.Cliente{},
		&models.Doctor{},
		&models.Mutual{},
		&models.Receta{},
		&models.Graduacion{},
		&models.Lente{},
	)
	if err != nil {
		return fmt.Errorf("error al ejecutar migraciones: %w", err)
	}

	logger.Info("Migraciones de test completadas exitosamente")
	return nil
}
