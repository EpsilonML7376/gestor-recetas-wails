package database

import (
	"fmt"

	"GestorRecetasWails/internal/models"
	"github.com/glebarez/sqlite"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// InitDB inicializa la conexión a la base de datos SQLite y ejecuta las
// migraciones. Retorna el handle para que main lo inyecte en los repositorios.
func InitDB(logger *zap.Logger) (*gorm.DB, error) {
	// DSN local
	dsn := "datos.db"

	db, err := gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return nil, fmt.Errorf("error al conectar a la base de datos: %w", err)
	}

	logger.Info("Conexión a SQLite exitosa")

	// Migrar modelos
	if err := migrateModels(db, logger); err != nil {
		return nil, err
	}

	return db, nil
}

// migrateModels ejecuta las migraciones automáticas
func migrateModels(db *gorm.DB, logger *zap.Logger) error {
	logger.Info("Ejecutando migraciones...")

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

	logger.Info("Migraciones completadas exitosamente")
	return nil
}
