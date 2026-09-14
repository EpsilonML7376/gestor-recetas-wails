package repositories

import (
	"errors"
	"fmt"
	"time"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"gorm.io/gorm"
)

type RecetaRepository struct {
	db *gorm.DB
}

func NewRecetaRepository(db *gorm.DB) *RecetaRepository {
	return &RecetaRepository{db: db}
}

type RecetaFilters struct {
	FechaDesde *time.Time
	FechaHasta *time.Time
	ClienteID  *uint
	DoctorID   *uint
	MutualID   *uint
	Limit      int
	Offset     int
}

// Create crea una nueva receta
func (r *RecetaRepository) Create(receta *models.Receta) error {
	return r.db.Create(receta).Error
}

// FindByID obtiene una receta por ID con todas sus relaciones
func (r *RecetaRepository) FindByID(id uint) (*models.Receta, error) {
	var receta models.Receta
	err := r.db.Preload("Cliente").
		Preload("Doctor").
		Preload("Mutual").
		Preload("Graduaciones").
		Preload("Lentes").
		First(&receta, id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: receta id %d", apperrors.ErrNotFound, id)
		}
		return nil, err
	}

	return &receta, nil
}

// FindAll obtiene todas las recetas con paginación y filtros
func (r *RecetaRepository) FindAll(filters RecetaFilters) ([]models.Receta, error) {
	var recetas []models.Receta

	query := r.db.Preload("Cliente").
		Preload("Doctor").
		Preload("Mutual").
		Preload("Graduaciones").
		Preload("Lentes")

	query = applyRecetaFilters(query, filters)

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}

	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	err := query.Order("fecha DESC").Find(&recetas).Error
	if err != nil {
		return nil, err
	}

	return recetas, nil
}

// Update actualiza una receta existente
func (r *RecetaRepository) Update(receta *models.Receta) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		updateData := map[string]interface{}{
			"Fecha":       receta.Fecha,
			"Notas":       receta.Notas,
			"TieneMutual": receta.TieneMutual,
			"ClienteID":   receta.ClienteID,
			"DoctorID":    receta.DoctorID,
			"MutualID":    receta.MutualID,
		}

		if err := tx.Model(&models.Receta{}).
			Where("id = ?", receta.ID).
			Updates(updateData).Error; err != nil {
			return err
		}

		// Eliminar graduaciones previas de la receta
		if err := tx.Where("receta_id = ?", receta.ID).
			Unscoped().
			Delete(&models.Graduacion{}).Error; err != nil {
			return err
		}

		// Insertar las graduaciones nuevas (si existen)
		if len(receta.Graduaciones) > 0 {
			for i := range receta.Graduaciones {
				receta.Graduaciones[i].ID = 0
				receta.Graduaciones[i].RecetaID = receta.ID
			}
			if err := tx.Create(&receta.Graduaciones).Error; err != nil {
				return err
			}
		}

		// Eliminar lentes previos de la receta
		if err := tx.Where("receta_id = ?", receta.ID).
			Unscoped().
			Delete(&models.Lente{}).Error; err != nil {
			return err
		}

		// Insertar los lentes nuevos (si existen)
		if len(receta.Lentes) > 0 {
			for i := range receta.Lentes {
				receta.Lentes[i].ID = 0
				receta.Lentes[i].RecetaID = receta.ID
			}
			if err := tx.Create(&receta.Lentes).Error; err != nil {
				return err
			}
		}

		return nil
	})
}

// Delete elimina una receta por ID
func (r *RecetaRepository) Delete(id uint) error {
	return r.db.Transaction(func(tx *gorm.DB) error {
		// Primero eliminar las graduaciones relacionadas
		if err := tx.Where("receta_id = ?", id).Delete(&models.Graduacion{}).Error; err != nil {
			return err
		}

		// Eliminar los lentes relacionados
		if err := tx.Where("receta_id = ?", id).Delete(&models.Lente{}).Error; err != nil {
			return err
		}

		// Luego eliminar la receta
		if err := tx.Delete(&models.Receta{}, id).Error; err != nil {
			return err
		}

		return nil
	})
}

// Count cuenta el total de recetas (útil para paginación)
func (r *RecetaRepository) Count(filters RecetaFilters) (int64, error) {
	var count int64
	query := r.db.Model(&models.Receta{})

	query = applyRecetaFilters(query, filters)

	err := query.Count(&count).Error
	return count, err
}

// applyRecetaFilters aplica los predicados de filtrado compartidos por FindAll
// y Count. No aplica paginación (eso es responsabilidad exclusiva de FindAll).
func applyRecetaFilters(query *gorm.DB, filters RecetaFilters) *gorm.DB {
	// Filtros de fecha
	if filters.FechaDesde != nil || filters.FechaHasta != nil {
		if filters.FechaDesde != nil && filters.FechaHasta != nil {
			startOfDayDesde := time.Date(filters.FechaDesde.Year(), filters.FechaDesde.Month(), filters.FechaDesde.Day(), 0, 0, 0, 0, filters.FechaDesde.Location())
			endOfDayHasta := time.Date(filters.FechaHasta.Year(), filters.FechaHasta.Month(), filters.FechaHasta.Day(), 23, 59, 59, 999999999, filters.FechaHasta.Location())
			query = query.Where("fecha >= ? AND fecha <= ?", startOfDayDesde, endOfDayHasta)
		} else if filters.FechaDesde != nil {
			startOfDayDesde := time.Date(filters.FechaDesde.Year(), filters.FechaDesde.Month(), filters.FechaDesde.Day(), 0, 0, 0, 0, filters.FechaDesde.Location())
			query = query.Where("fecha >= ?", startOfDayDesde)
		} else if filters.FechaHasta != nil {
			endOfDayHasta := time.Date(filters.FechaHasta.Year(), filters.FechaHasta.Month(), filters.FechaHasta.Day(), 23, 59, 59, 999999999, filters.FechaHasta.Location())
			query = query.Where("fecha <= ?", endOfDayHasta)
		}
	}

	if filters.ClienteID != nil {
		query = query.Where("cliente_id = ?", *filters.ClienteID)
	}

	if filters.DoctorID != nil {
		query = query.Where("doctor_id = ?", *filters.DoctorID)
	}

	if filters.MutualID != nil {
		query = query.Where("mutual_id = ?", *filters.MutualID)
	}

	return query
}
