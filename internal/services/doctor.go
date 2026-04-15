package services

import (
	"errors"

	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type DoctorService struct {
	repo   *repositories.DoctorRepository
	logger *zap.Logger
}

func NewDoctorService(repo *repositories.DoctorRepository, logger *zap.Logger) *DoctorService {
	return &DoctorService{
		repo:   repo,
		logger: logger,
	}
}

// Create crea un nuevo doctor
func (s *DoctorService) Create(doctor *models.Doctor) (*models.Doctor, error) {
	if err := s.repo.Create(doctor); err != nil {
		s.logger.Error("Error al crear doctor", zap.Error(err))
		return nil, err
	}

	s.logger.Info("Doctor creado exitosamente", zap.Uint("id", doctor.ID))
	return doctor, nil
}

// GetAll obtiene todos los doctores con filtros y paginación
func (s *DoctorService) GetAll(filters repositories.DoctorFilters) (*dto.PaginatedDoctores, error) {
	doctores, err := s.repo.FindAll(filters)
	if err != nil {
		s.logger.Error("Error al obtener doctores", zap.Error(err))
		return nil, err
	}

	// Obtener el count total para paginación
	count, err := s.repo.Count(filters)
	if err != nil {
		s.logger.Error("Error al contar doctores", zap.Error(err))
		return nil, err
	}

	return &dto.PaginatedDoctores{Data: doctores, Total: count}, nil
}

// GetByID obtiene un doctor por ID
func (s *DoctorService) GetByID(id uint) (*models.Doctor, error) {
	doctor, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.logger.Warn("Doctor no encontrado", zap.Uint("id", id))
			return nil, errors.New("doctor no encontrado")
		}
		s.logger.Error("Error al obtener doctor", zap.Error(err))
		return nil, err
	}

	return doctor, nil
}

// Update actualiza un doctor
func (s *DoctorService) Update(id uint, doctor *models.Doctor) error {
	// Verificar que el doctor existe
	existente, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("doctor no encontrado")
		}
		return err
	}

	// Mantener el ID
	doctor.ID = existente.ID

	if err := s.repo.Update(doctor); err != nil {
		s.logger.Error("Error al actualizar doctor", zap.Error(err))
		return err
	}

	s.logger.Info("Doctor actualizado exitosamente", zap.Uint("id", id))
	return nil
}


// Delete elimina un doctor
func (s *DoctorService) Delete(id uint) error {
if err := s.repo.Delete(id); err != nil {
s.logger.Error("Error al eliminar doctor", zap.Error(err))
return err
}
s.logger.Info("Doctor eliminado exitosamente", zap.Uint("id", id))
return nil
}
