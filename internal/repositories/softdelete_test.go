package repositories

import (
	"path/filepath"
	"testing"

	"GestorRecetasWails/internal/models"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

func setupSoftDeleteTestDB(t *testing.T) *gorm.DB {
	t.Helper()
	db, err := gorm.Open(sqlite.Open(filepath.Join(t.TempDir(), "test.db")), &gorm.Config{})
	if err != nil {
		t.Fatalf("failed to open test db: %v", err)
	}
	sqlDB, err := db.DB()
	if err != nil {
		t.Fatalf("failed to get sql.DB: %v", err)
	}
	t.Cleanup(func() { _ = sqlDB.Close() })
	if err := db.AutoMigrate(
		&models.Cliente{},
		&models.Doctor{},
		&models.Mutual{},
		&models.Receta{},
		&models.Graduacion{},
		&models.Lente{},
	); err != nil {
		t.Fatalf("failed to migrate: %v", err)
	}
	return db
}

// Soft-deleting a cliente must hide it from normal queries but keep its row.
func TestSoftDeleteClienteHidesFromQueries(t *testing.T) {
	db := setupSoftDeleteTestDB(t)
	clienteRepo := NewClienteRepository(db, nil)

	cliente := &models.Cliente{Nombre: "Juan", Apellido: "Perez", DNI: "12345678"}
	if err := clienteRepo.Create(cliente); err != nil {
		t.Fatalf("create cliente: %v", err)
	}

	if err := clienteRepo.Delete(cliente.ID); err != nil {
		t.Fatalf("delete cliente: %v", err)
	}

	// FindByID should return not-found for a soft-deleted row.
	if _, err := clienteRepo.FindByID(cliente.ID); err == nil {
		t.Fatal("expected soft-deleted cliente to be hidden from FindByID")
	}

	// FindAll should not return the soft-deleted row.
	clientes, err := clienteRepo.FindAll(ClienteFilters{})
	if err != nil {
		t.Fatalf("find all: %v", err)
	}
	if len(clientes) != 0 {
		t.Fatalf("expected 0 clientes after soft delete, got %d", len(clientes))
	}

	// The row must still physically exist (soft delete, not hard delete).
	var count int64
	if err := db.Unscoped().Model(&models.Cliente{}).Where("id = ?", cliente.ID).Count(&count).Error; err != nil {
		t.Fatalf("unscoped count: %v", err)
	}
	if count != 1 {
		t.Fatalf("expected 1 physical row after soft delete, got %d", count)
	}
}

// A receta referencing a soft-deleted cliente must still resolve that cliente.
func TestSoftDeletedClienteStillResolvedByReceta(t *testing.T) {
	db := setupSoftDeleteTestDB(t)
	clienteRepo := NewClienteRepository(db, nil)
	doctorRepo := NewDoctorRepository(db)
	recetaRepo := NewRecetaRepository(db)

	cliente := &models.Cliente{Nombre: "Juan", Apellido: "Perez", DNI: "12345678"}
	if err := clienteRepo.Create(cliente); err != nil {
		t.Fatalf("create cliente: %v", err)
	}
	doctor := &models.Doctor{Nombre: "Ana", Apellido: "Gomez"}
	if err := doctorRepo.Create(doctor); err != nil {
		t.Fatalf("create doctor: %v", err)
	}

	receta := &models.Receta{ClienteID: cliente.ID, DoctorID: doctor.ID}
	if err := recetaRepo.Create(receta); err != nil {
		t.Fatalf("create receta: %v", err)
	}

	if err := clienteRepo.Delete(cliente.ID); err != nil {
		t.Fatalf("delete cliente: %v", err)
	}

	got, err := recetaRepo.FindByID(receta.ID)
	if err != nil {
		t.Fatalf("find receta: %v", err)
	}
	if got.Cliente.ID != cliente.ID || got.Cliente.Nombre != "Juan" {
		t.Fatalf("expected receta to still resolve soft-deleted cliente, got %+v", got.Cliente)
	}
}
