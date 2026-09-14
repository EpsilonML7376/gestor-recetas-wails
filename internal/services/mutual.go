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

// MutualRepository defines the data access operations MutualService depends on.
// The concrete repositories.MutualRepository satisfies this interface.
type MutualRepository interface {
	Create(*models.Mutual) error
	FindAll(repositories.MutualFilters) ([]models.Mutual, error)
	FindByID(uint) (*models.Mutual, error)
	Update(*models.Mutual) error
	Delete(uint) error
	Count(repositories.MutualFilters) (int64, error)
}

type MutualService struct {
	repo   MutualRepository
	logger *zap.Logger
}

func NewMutualService(repo MutualRepository, logger *zap.Logger) *MutualService {
	return &MutualService{
		repo:   repo,
		logger: logger,
	}
}

// Create crea una nueva mutual
func (s *MutualService) Create(mutual *models.Mutual) (*models.Mutual, error) {
	if err := s.repo.Create(mutual); err != nil {
		s.logger.Error("Error al crear mutual", zap.Error(err))
		return nil, err
	}

	s.logger.Info("Mutual creada exitosamente", zap.Uint("id", mutual.ID))
	return mutual, nil
}

// GetAll obtiene todas las mutuales con filtros y paginación
func (s *MutualService) GetAll(filters repositories.MutualFilters) (*dto.PaginatedMutuales, error) {
	mutuales, err := s.repo.FindAll(filters)
	if err != nil {
		s.logger.Error("Error al obtener mutuales", zap.Error(err))
		return nil, err
	}

	// Obtener el count total para paginación
	count, err := s.repo.Count(filters)
	if err != nil {
		s.logger.Error("Error al contar mutuales", zap.Error(err))
		return nil, err
	}

	return &dto.PaginatedMutuales{Data: mutuales, Total: count}, nil
}

// GetByID obtiene una mutual por ID
func (s *MutualService) GetByID(id uint) (*models.Mutual, error) {
	mutual, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			s.logger.Warn("Mutual no encontrada", zap.Uint("id", id))
			return nil, fmt.Errorf("mutual no encontrada: %w", apperrors.ErrNotFound)
		}
		s.logger.Error("Error al obtener mutual", zap.Error(err))
		return nil, err
	}

	return mutual, nil
}

// Update actualiza una mutual
func (s *MutualService) Update(id uint, mutual *models.Mutual) error {
	// Verificar que la mutual existe
	existente, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, apperrors.ErrNotFound) {
			return fmt.Errorf("mutual no encontrada: %w", apperrors.ErrNotFound)
		}
		return err
	}

	// Mantener el ID
	mutual.ID = existente.ID

	if err := s.repo.Update(mutual); err != nil {
		s.logger.Error("Error al actualizar mutual", zap.Error(err))
		return err
	}

	s.logger.Info("Mutual actualizada exitosamente", zap.Uint("id", id))
	return nil
}

// Delete elimina un mutual
func (s *MutualService) Delete(id uint) error {
	if err := s.repo.Delete(id); err != nil {
		s.logger.Error("Error al eliminar mutual", zap.Error(err))
		return err
	}
	s.logger.Info("Mutual eliminado exitosamente", zap.Uint("id", id))
	return nil
}
