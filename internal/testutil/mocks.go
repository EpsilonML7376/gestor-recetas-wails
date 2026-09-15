package testutil

import (
	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/services"
)

// Compile-time guarantees that every mock satisfies its service interface.
// An interface change breaks the build here instead of in a distant test.
var (
	_ services.ClienteRepository = (*MockClienteRepository)(nil)
	_ services.DoctorRepository  = (*MockDoctorRepository)(nil)
	_ services.MutualRepository  = (*MockMutualRepository)(nil)
	_ services.RecetaRepository  = (*MockRecetaRepository)(nil)
)

// MockClienteRepository is a hand-written implementation of
// services.ClienteRepository. Each method delegates to its optional Func field;
// when that field is nil the method returns the zero value together with
// apperrors.ErrNotFound, so tests override only the branch under test.
type MockClienteRepository struct {
	CreateFunc    func(*models.Cliente) error
	FindAllFunc   func(repositories.ClienteFilters) ([]models.Cliente, error)
	FindByIDFunc  func(uint) (*models.Cliente, error)
	FindByDNIFunc func(string) (*models.Cliente, error)
	UpdateFunc    func(*models.Cliente) error
	DeleteFunc    func(uint) error
	CountFunc     func(repositories.ClienteFilters) (int64, error)

	// Call counters for "called / not called" assertions.
	CreateCalls    int
	FindAllCalls   int
	FindByIDCalls  int
	FindByDNICalls int
	UpdateCalls    int
	DeleteCalls    int
	CountCalls     int

	// Last arguments received, for behavioral verification.
	LastCliente *models.Cliente
	LastID      uint
	LastDNI     string
	LastFilters repositories.ClienteFilters
}

func (m *MockClienteRepository) Create(c *models.Cliente) error {
	m.CreateCalls++
	m.LastCliente = c
	if m.CreateFunc != nil {
		return m.CreateFunc(c)
	}
	return apperrors.ErrNotFound
}

func (m *MockClienteRepository) FindAll(f repositories.ClienteFilters) ([]models.Cliente, error) {
	m.FindAllCalls++
	m.LastFilters = f
	if m.FindAllFunc != nil {
		return m.FindAllFunc(f)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockClienteRepository) FindByID(id uint) (*models.Cliente, error) {
	m.FindByIDCalls++
	m.LastID = id
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(id)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockClienteRepository) FindByDNI(dni string) (*models.Cliente, error) {
	m.FindByDNICalls++
	m.LastDNI = dni
	if m.FindByDNIFunc != nil {
		return m.FindByDNIFunc(dni)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockClienteRepository) Update(c *models.Cliente) error {
	m.UpdateCalls++
	m.LastCliente = c
	if m.UpdateFunc != nil {
		return m.UpdateFunc(c)
	}
	return apperrors.ErrNotFound
}

func (m *MockClienteRepository) Delete(id uint) error {
	m.DeleteCalls++
	m.LastID = id
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return apperrors.ErrNotFound
}

func (m *MockClienteRepository) Count(f repositories.ClienteFilters) (int64, error) {
	m.CountCalls++
	m.LastFilters = f
	if m.CountFunc != nil {
		return m.CountFunc(f)
	}
	return 0, apperrors.ErrNotFound
}

// MockDoctorRepository is a hand-written implementation of
// services.DoctorRepository. See MockClienteRepository for the default-return
// and call-counting conventions.
type MockDoctorRepository struct {
	CreateFunc   func(*models.Doctor) error
	FindAllFunc  func(repositories.DoctorFilters) ([]models.Doctor, error)
	FindByIDFunc func(uint) (*models.Doctor, error)
	UpdateFunc   func(*models.Doctor) error
	DeleteFunc   func(uint) error
	CountFunc    func(repositories.DoctorFilters) (int64, error)

	CreateCalls   int
	FindAllCalls  int
	FindByIDCalls int
	UpdateCalls   int
	DeleteCalls   int
	CountCalls    int

	LastDoctor  *models.Doctor
	LastID      uint
	LastFilters repositories.DoctorFilters
}

func (m *MockDoctorRepository) Create(d *models.Doctor) error {
	m.CreateCalls++
	m.LastDoctor = d
	if m.CreateFunc != nil {
		return m.CreateFunc(d)
	}
	return apperrors.ErrNotFound
}

func (m *MockDoctorRepository) FindAll(f repositories.DoctorFilters) ([]models.Doctor, error) {
	m.FindAllCalls++
	m.LastFilters = f
	if m.FindAllFunc != nil {
		return m.FindAllFunc(f)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockDoctorRepository) FindByID(id uint) (*models.Doctor, error) {
	m.FindByIDCalls++
	m.LastID = id
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(id)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockDoctorRepository) Update(d *models.Doctor) error {
	m.UpdateCalls++
	m.LastDoctor = d
	if m.UpdateFunc != nil {
		return m.UpdateFunc(d)
	}
	return apperrors.ErrNotFound
}

func (m *MockDoctorRepository) Delete(id uint) error {
	m.DeleteCalls++
	m.LastID = id
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return apperrors.ErrNotFound
}

func (m *MockDoctorRepository) Count(f repositories.DoctorFilters) (int64, error) {
	m.CountCalls++
	m.LastFilters = f
	if m.CountFunc != nil {
		return m.CountFunc(f)
	}
	return 0, apperrors.ErrNotFound
}

// MockMutualRepository is a hand-written implementation of
// services.MutualRepository. See MockClienteRepository for the default-return
// and call-counting conventions.
type MockMutualRepository struct {
	CreateFunc   func(*models.Mutual) error
	FindAllFunc  func(repositories.MutualFilters) ([]models.Mutual, error)
	FindByIDFunc func(uint) (*models.Mutual, error)
	UpdateFunc   func(*models.Mutual) error
	DeleteFunc   func(uint) error
	CountFunc    func(repositories.MutualFilters) (int64, error)

	CreateCalls   int
	FindAllCalls  int
	FindByIDCalls int
	UpdateCalls   int
	DeleteCalls   int
	CountCalls    int

	LastMutual  *models.Mutual
	LastID      uint
	LastFilters repositories.MutualFilters
}

func (m *MockMutualRepository) Create(mu *models.Mutual) error {
	m.CreateCalls++
	m.LastMutual = mu
	if m.CreateFunc != nil {
		return m.CreateFunc(mu)
	}
	return apperrors.ErrNotFound
}

func (m *MockMutualRepository) FindAll(f repositories.MutualFilters) ([]models.Mutual, error) {
	m.FindAllCalls++
	m.LastFilters = f
	if m.FindAllFunc != nil {
		return m.FindAllFunc(f)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockMutualRepository) FindByID(id uint) (*models.Mutual, error) {
	m.FindByIDCalls++
	m.LastID = id
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(id)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockMutualRepository) Update(mu *models.Mutual) error {
	m.UpdateCalls++
	m.LastMutual = mu
	if m.UpdateFunc != nil {
		return m.UpdateFunc(mu)
	}
	return apperrors.ErrNotFound
}

func (m *MockMutualRepository) Delete(id uint) error {
	m.DeleteCalls++
	m.LastID = id
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return apperrors.ErrNotFound
}

func (m *MockMutualRepository) Count(f repositories.MutualFilters) (int64, error) {
	m.CountCalls++
	m.LastFilters = f
	if m.CountFunc != nil {
		return m.CountFunc(f)
	}
	return 0, apperrors.ErrNotFound
}

// MockRecetaRepository is a hand-written implementation of
// services.RecetaRepository. See MockClienteRepository for the default-return
// and call-counting conventions.
type MockRecetaRepository struct {
	CreateFunc   func(*models.Receta) error
	FindByIDFunc func(uint) (*models.Receta, error)
	FindAllFunc  func(repositories.RecetaFilters) ([]models.Receta, error)
	UpdateFunc   func(*models.Receta) error
	DeleteFunc   func(uint) error
	CountFunc    func(repositories.RecetaFilters) (int64, error)

	CreateCalls   int
	FindByIDCalls int
	FindAllCalls  int
	UpdateCalls   int
	DeleteCalls   int
	CountCalls    int

	LastReceta  *models.Receta
	LastID      uint
	LastFilters repositories.RecetaFilters
}

func (m *MockRecetaRepository) Create(r *models.Receta) error {
	m.CreateCalls++
	m.LastReceta = r
	if m.CreateFunc != nil {
		return m.CreateFunc(r)
	}
	return apperrors.ErrNotFound
}

func (m *MockRecetaRepository) FindByID(id uint) (*models.Receta, error) {
	m.FindByIDCalls++
	m.LastID = id
	if m.FindByIDFunc != nil {
		return m.FindByIDFunc(id)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockRecetaRepository) FindAll(f repositories.RecetaFilters) ([]models.Receta, error) {
	m.FindAllCalls++
	m.LastFilters = f
	if m.FindAllFunc != nil {
		return m.FindAllFunc(f)
	}
	return nil, apperrors.ErrNotFound
}

func (m *MockRecetaRepository) Update(r *models.Receta) error {
	m.UpdateCalls++
	m.LastReceta = r
	if m.UpdateFunc != nil {
		return m.UpdateFunc(r)
	}
	return apperrors.ErrNotFound
}

func (m *MockRecetaRepository) Delete(id uint) error {
	m.DeleteCalls++
	m.LastID = id
	if m.DeleteFunc != nil {
		return m.DeleteFunc(id)
	}
	return apperrors.ErrNotFound
}

func (m *MockRecetaRepository) Count(f repositories.RecetaFilters) (int64, error) {
	m.CountCalls++
	m.LastFilters = f
	if m.CountFunc != nil {
		return m.CountFunc(f)
	}
	return 0, apperrors.ErrNotFound
}
