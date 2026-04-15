package repositories

import (
	"GestorRecetasWails/internal/models"
	"gorm.io/gorm"
)

type DoctorRepository struct {
	db *gorm.DB
}

func NewDoctorRepository(db *gorm.DB) *DoctorRepository {
	return &DoctorRepository{db: db}
}

type DoctorFilters struct {
	Limit  int
	Offset int
	Search string
}

// Create crea un nuevo doctor
func (r *DoctorRepository) Create(doctor *models.Doctor) error {
	return r.db.Create(doctor).Error
}

// FindAll obtiene todos los doctores con paginación y filtros
func (r *DoctorRepository) FindAll(filters DoctorFilters) ([]models.Doctor, error) {
	var doctores []models.Doctor

	query := r.db.Model(&models.Doctor{})

	// Aplicar búsqueda
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ? OR apellido LIKE ?", searchPattern, searchPattern)
	}

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}

	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	err := query.Order("apellido ASC, nombre ASC").Find(&doctores).Error
	if err != nil {
		return nil, err
	}
	return doctores, nil
}

// FindByID obtiene un doctor por ID
func (r *DoctorRepository) FindByID(id uint) (*models.Doctor, error) {
	var doctor models.Doctor
	err := r.db.First(&doctor, id).Error
	if err != nil {
		return nil, err
	}
	return &doctor, nil
}

// Update actualiza un doctor existente
func (r *DoctorRepository) Update(doctor *models.Doctor) error {
	return r.db.Save(doctor).Error
}

// Count cuenta el total de doctores (útil para paginación)
func (r *DoctorRepository) Count(filters DoctorFilters) (int64, error) {
	var count int64
	query := r.db.Model(&models.Doctor{})

	// Aplicar los mismos filtros que en FindAll (sin paginación)
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ? OR apellido LIKE ?", searchPattern, searchPattern)
	}

	err := query.Count(&count).Error
	return count, err
}


// Delete elimina un doctor
func (r *DoctorRepository) Delete(id uint) error {
return r.db.Delete(&models.Doctor{}, id).Error
}
