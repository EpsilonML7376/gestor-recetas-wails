package services

import (
	"errors"

	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/dto"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

type ClienteService struct {
	repo   *repositories.ClienteRepository
	logger *zap.Logger
}

func NewClienteService(repo *repositories.ClienteRepository, logger *zap.Logger) *ClienteService {
	return &ClienteService{
		repo:   repo,
		logger: logger,
	}
}

// Create crea un nuevo cliente
func (s *ClienteService) Create(cliente *models.Cliente) (*models.Cliente, error) {
	if err := s.repo.Create(cliente); err != nil {
		s.logger.Error("Error al crear cliente", zap.Error(err))
		return nil, err
	}

	s.logger.Info("Cliente creado exitosamente", zap.Uint("id", cliente.ID))
	return cliente, nil
}

// GetAll obtiene todos los clientes con filtros y paginación
func (s *ClienteService) GetAll(filters repositories.ClienteFilters) (*dto.PaginatedClientes, error) {
	clientes, err := s.repo.FindAll(filters)
	if err != nil {
		s.logger.Error("Error al obtener clientes", zap.Error(err))
		return nil, err
	}

	// Obtener el count total para paginación
	count, err := s.repo.Count(filters)
	if err != nil {
		s.logger.Error("Error al contar clientes", zap.Error(err))
		return nil, err
	}

	return &dto.PaginatedClientes{Data: clientes, Total: count}, nil
}

// GetByID obtiene un cliente por ID
func (s *ClienteService) GetByID(id uint) (*models.Cliente, error) {
	cliente, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			s.logger.Warn("Cliente no encontrado", zap.Uint("id", id))
			return nil, errors.New("cliente no encontrado")
		}
		s.logger.Error("Error al obtener cliente", zap.Error(err))
		return nil, err
	}

	return cliente, nil
}

// Update actualiza un cliente
func (s *ClienteService) Update(id uint, cliente *models.Cliente) error {
	// Verificar que el cliente existe
	existente, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cliente no encontrado")
		}
		return err
	}

	// Mantener el ID
	cliente.ID = existente.ID

	if err := s.repo.Update(cliente); err != nil {
		s.logger.Error("Error al actualizar cliente", zap.Error(err))
		return err
	}

	s.logger.Info("Cliente actualizado exitosamente", zap.Uint("id", id))
	return nil
}

// Delete elimina un cliente
func (s *ClienteService) Delete(id uint) error {
	// Verificar que existe
	_, err := s.repo.FindByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return errors.New("cliente no encontrado")
		}
		return err
	}

	if err := s.repo.Delete(id); err != nil {
		s.logger.Error("Error al eliminar cliente", zap.Error(err))
		return err
	}

	s.logger.Info("Cliente eliminado exitosamente", zap.Uint("id", id))
	return nil
}

