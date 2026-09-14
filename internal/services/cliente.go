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

// ClienteRepository defines the data access operations ClienteService depends on.
// The concrete repositories.ClienteRepository satisfies this interface.
type ClienteRepository interface {
	Create(*models.Cliente) error
	FindAll(repositories.ClienteFilters) ([]models.Cliente, error)
	FindByID(uint) (*models.Cliente, error)
	FindByDNI(string) (*models.Cliente, error)
	Update(*models.Cliente) error
	Delete(uint) error
	Count(repositories.ClienteFilters) (int64, error)
}

type ClienteService struct {
	repo   ClienteRepository
	logger *zap.Logger
}

func NewClienteService(repo ClienteRepository, logger *zap.Logger) *ClienteService {
	return &ClienteService{
		repo:   repo,
		logger: logger,
	}
}

// Create crea un nuevo cliente
func (s *ClienteService) Create(cliente *models.Cliente) (*models.Cliente, error) {
	// No existe índice único sobre DNI: verificamos duplicados explícitamente.
	if cliente.DNI != "" {
		existente, err := s.repo.FindByDNI(cliente.DNI)
		if err == nil && existente != nil {
			s.logger.Warn("DNI duplicado", zap.String("dni", cliente.DNI))
			return nil, fmt.Errorf("%w: cliente con DNI %s ya existe", apperrors.ErrDuplicate, cliente.DNI)
		}
		if err != nil && !errors.Is(err, apperrors.ErrNotFound) {
			s.logger.Error("Error al verificar DNI duplicado", zap.Error(err))
			return nil, err
		}
	}

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
		if errors.Is(err, apperrors.ErrNotFound) {
			s.logger.Warn("Cliente no encontrado", zap.Uint("id", id))
			return nil, fmt.Errorf("cliente no encontrado: %w", apperrors.ErrNotFound)
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
		if errors.Is(err, apperrors.ErrNotFound) {
			return fmt.Errorf("cliente no encontrado: %w", apperrors.ErrNotFound)
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
		if errors.Is(err, apperrors.ErrNotFound) {
			return fmt.Errorf("cliente no encontrado: %w", apperrors.ErrNotFound)
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
