package repositories

import (
	"GestorRecetasWails/internal/models"
	"gorm.io/gorm"
	"time"
	"go.uber.org/zap"
)

type ClienteRepository struct {
	db     *gorm.DB
	logger *zap.Logger
}

func NewClienteRepository(db *gorm.DB, logger *zap.Logger) *ClienteRepository {
	return &ClienteRepository{db: db, logger: logger}
}

type ClienteFilters struct {
	Limit  int
	Offset int
	Search string
}

// Create crea un nuevo cliente
func (r *ClienteRepository) Create(cliente *models.Cliente) error {
	return r.db.Create(cliente).Error
}

// FindAll obtiene todos los clientes con paginación y filtros
func (r *ClienteRepository) FindAll(filters ClienteFilters) ([]models.Cliente, error) {
	start := time.Now()
	var clientes []models.Cliente

	query := r.db.Model(&models.Cliente{})

	// Aplicar búsqueda
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	// Aplicar paginación
	if filters.Limit > 0 {
		query = query.Limit(filters.Limit)
	}

	if filters.Offset > 0 {
		query = query.Offset(filters.Offset)
	}

	err := query.Order("apellido ASC, nombre ASC").Find(&clientes).Error
	
	duration := time.Since(start)
	if filters.Search != "" && r.logger != nil {
		r.logger.Info("Búsqueda de clientes completada", 
			zap.String("search", filters.Search),
			zap.Duration("duration", duration),
			zap.Int("results", len(clientes)),
		)
	}

	if err != nil {
		return nil, err
	}
	return clientes, nil
}

// FindByID obtiene un cliente por ID
func (r *ClienteRepository) FindByID(id uint) (*models.Cliente, error) {
	var cliente models.Cliente
	err := r.db.First(&cliente, id).Error
	if err != nil {
		return nil, err
	}
	return &cliente, nil
}

// Update actualiza un cliente existente
func (r *ClienteRepository) Update(cliente *models.Cliente) error {
	return r.db.Save(cliente).Error
}

// Delete elimina un cliente por ID
func (r *ClienteRepository) Delete(id uint) error {
	return r.db.Delete(&models.Cliente{}, id).Error
}

// FindByDNI busca un cliente por DNI
func (r *ClienteRepository) FindByDNI(dni string) (*models.Cliente, error) {
	var cliente models.Cliente
	err := r.db.Where("dni = ?", dni).First(&cliente).Error
	if err != nil {
		return nil, err
	}
	return &cliente, nil
}

// Count cuenta el total de clientes (útil para paginación)
func (r *ClienteRepository) Count(filters ClienteFilters) (int64, error) {
	var count int64
	query := r.db.Model(&models.Cliente{})

	// Aplicar los mismos filtros que en FindAll (sin paginación)
	if filters.Search != "" {
		searchPattern := "%" + filters.Search + "%"
		query = query.Where("nombre LIKE ? OR apellido LIKE ? OR dni LIKE ?", searchPattern, searchPattern, searchPattern)
	}

	err := query.Count(&count).Error
	return count, err
}

