package database

import (
	"fmt"

	"GestorRecetasWails/internal/models"
	"go.uber.org/zap"
	"github.com/glebarez/sqlite"
	"gorm.io/gorm"
)

var DB *gorm.DB

// InitDB inicializa la conexión a la base de datos SQLite
func InitDB(logger *zap.Logger) error {
	// DSN local
	dsn := "datos.db"

	var err error
	DB, err = gorm.Open(sqlite.Open(dsn), &gorm.Config{})
	if err != nil {
		return fmt.Errorf("error al conectar a la base de datos: %w", err)
	}

	logger.Info("Conexión a SQLite exitosa")

	// Migrar modelos
	if err := migrateModels(logger); err != nil {
		return err
	}

	return nil
}

// migrateModels ejecuta las migraciones automáticas
func migrateModels(logger *zap.Logger) error {
	logger.Info("Ejecutando migraciones...")

	err := DB.AutoMigrate(
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


// GetDB retorna la instancia de la base de datos
func GetDB() *gorm.DB {
	return DB
}

