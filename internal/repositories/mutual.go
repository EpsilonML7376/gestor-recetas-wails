package repositories

import (
	"errors"
	"fmt"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"gorm.io/gorm"
)

type MutualRepository struct {
	db *gorm.DB
}

func NewMutualRepository(db *gorm.DB) *MutualRepository {
	return &MutualRepository{db: db}
}

type MutualFilters struct {
	Limit  int
	Offset int
	Search string
}

// Create crea una nueva mutual
func (r *MutualRepository) Create(mutual *models.Mutual) error {
	return r.db.Create(mutual).Error
}

// FindAll obtiene todas las mutuales con paginación y filtros
func (r *MutualRepository) FindAll(filters MutualFilters) ([]models.Mutual, error) {
	var mutuales []models.Mutual

	query := r.db.Model(&models.Mutual{})

	// Aplicar búsqueda
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ?", searchPattern)
	}

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}

	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	err := query.Order("nombre ASC").Find(&mutuales).Error
	if err != nil {
		return nil, err
	}
	return mutuales, nil
}

// FindByID obtiene una mutual por ID
func (r *MutualRepository) FindByID(id uint) (*models.Mutual, error) {
	var mutual models.Mutual
	err := r.db.First(&mutual, id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, fmt.Errorf("%w: mutual id %d", apperrors.ErrNotFound, id)
		}
		return nil, err
	}
	return &mutual, nil
}

// Update actualiza una mutual existente
func (r *MutualRepository) Update(mutual *models.Mutual) error {
	return r.db.Save(mutual).Error
}

// Count cuenta el total de mutuales (útil para paginación)
func (r *MutualRepository) Count(filters MutualFilters) (int64, error) {
	var count int64
	query := r.db.Model(&models.Mutual{})

	// Aplicar los mismos filtros que en FindAll (sin paginación)
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ?", searchPattern)
	}

	err := query.Count(&count).Error
	return count, err
}

// Delete elimina un mutual
func (r *MutualRepository) Delete(id uint) error {
	return r.db.Delete(&models.Mutual{}, id).Error
}
