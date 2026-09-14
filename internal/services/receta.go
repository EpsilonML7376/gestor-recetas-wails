package services

import (
	"errors"
	"fmt"

	"GestorRecetasWails/internal/dto"
	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"go.uber.org/zap"
)

// RecetaRepository defines the data access operations RecetaService depends on.
// The concrete repositories.RecetaRepository satisfies this interface.
type RecetaRepository interface {
	Create(*models.Receta) error
	FindByID(uint) (*models.Receta, error)
	FindAll(repositories.RecetaFilters) ([]models.Receta, error)
	Update(*models.Receta) error
	Delete(uint) error
	Count(repositories.RecetaFilters) (int64, error)
}

type RecetaService struct {
	repo   RecetaRepository
	logger *zap.Logger
}

func NewRecetaService(repo RecetaRepository, logger *zap.Logger) *RecetaService {
	return &RecetaService{
		repo:   repo,
		logger: logger,
	}
}

// calcularTotal calcula el total sumando todos los lentes
func (s *RecetaService) calcularTotal(receta *models.Receta) {
	total := 0
	for _, lente := range receta.Lentes {
		total += lente.CristalPrecio + lente.ArmazonPrecio
	}
	receta.TotalLente = total
}

// Create crea una nueva receta
func (s *RecetaService) Create(receta *models.Receta) (*models.Receta, error) {
	if err := s.repo.Create(receta); err != nil {
		s.logger.Error("Error al crear receta", zap.Error(err))
		return nil, err
	}

	// Recargar con relaciones y calcular total
	recetaCompleta, err := s.repo.FindByID(receta.ID)
	if err != nil {
		return nil, err
	}

	s.calcularTotal(recetaCompleta)
	*receta = *recetaCompleta

	s.logger.Info("Receta creada exitosamente", zap.Uint("id", receta.ID))
	return receta, nil
}

// GetByID obtiene una receta por ID
func (s *RecetaService) GetByID(id uint) (*models.Receta, error) {
	receta, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			s.logger.Warn("Receta no encontrada", zap.Uint("id", id))
			return nil, fmt.Errorf("receta no encontrada: %w", apperrors.ErrNotFound)
		}
		s.logger.Error("Error al obtener receta", zap.Error(err))
		return nil, err
	}

	// Calcular total
	s.calcularTotal(receta)

	return receta, nil
}

// GetAll obtiene todas las recetas con filtros y paginación
func (s *RecetaService) GetAll(filters repositories.RecetaFilters) (*dto.PaginatedRecetas, error) {
	recetas, err := s.repo.FindAll(filters)
	if err != nil {
		s.logger.Error("Error al obtener recetas", zap.Error(err))
		return nil, err
	}

	// Calcular total para cada receta
	for i := range recetas {
		s.calcularTotal(&recetas[i])
	}

	// Obtener el count total para paginación
	count, err := s.repo.Count(filters)
	if err != nil {
		s.logger.Error("Error al contar recetas", zap.Error(err))
		return nil, err
	}

	return &dto.PaginatedRecetas{Data: recetas, Total: count}, nil
}

// Update actualiza una receta
func (s *RecetaService) Update(id uint, receta *models.Receta) error {
	// Verificar que la receta existe
	existente, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return fmt.Errorf("receta no encontrada: %w", apperrors.ErrNotFound)
		}
		return err
	}

	// Mantener el ID
	receta.ID = existente.ID

	if err := s.repo.Update(receta); err != nil {
		s.logger.Error("Error al actualizar receta", zap.Error(err))
		return err
	}

	// Recargar con relaciones y calcular total
	recetaActualizada, err := s.repo.FindByID(id)
	if err != nil {
		return err
	}

	s.calcularTotal(recetaActualizada)
	*receta = *recetaActualizada

	s.logger.Info("Receta actualizada exitosamente", zap.Uint("id", id))
	return nil
}

// Delete elimina una receta
func (s *RecetaService) Delete(id uint) error {
	// Verificar que existe
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return fmt.Errorf("receta no encontrada: %w", apperrors.ErrNotFound)
		}
		return err
	}

	if err := s.repo.Delete(id); err != nil {
		s.logger.Error("Error al eliminar receta", zap.Error(err))
		return err
	}

	s.logger.Info("Receta eliminada exitosamente", zap.Uint("id", id))
	return nil
}

// GetTotal obtiene solo el total de una receta
func (s *RecetaService) GetTotal(id uint) (int, error) {
	receta, err := s.GetByID(id)
	if err != nil {
		return 0, err
	}

	return receta.TotalLente, nil
}
