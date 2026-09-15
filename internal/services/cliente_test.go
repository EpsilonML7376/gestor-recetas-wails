package services_test

import (
	"errors"
	"testing"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/services"
	"GestorRecetasWails/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

// errRepoBoom is a generic repository failure shared by every service test file
// in this package. It is deliberately not ErrNotFound: the tests use it to prove
// that unexpected errors propagate unchanged instead of being remapped.
var errRepoBoom = errors.New("repository boom")

func TestClienteService_Create(t *testing.T) {
	tests := []struct {
		name               string
		cliente            *models.Cliente
		findByDNIFn        func(string) (*models.Cliente, error)
		createFn           func(*models.Cliente) error
		wantErr            error
		wantCreateCalls    int
		wantFindByDNICalls int
	}{
		{
			name:               "empty DNI skips the duplicate check",
			cliente:            testutil.NewCliente(testutil.WithDNI("")),
			createFn:           func(*models.Cliente) error { return nil },
			wantCreateCalls:    1,
			wantFindByDNICalls: 0,
		},
		{
			name:               "unique DNI proceeds to create",
			cliente:            testutil.NewCliente(testutil.WithDNI("99999999")),
			findByDNIFn:        func(string) (*models.Cliente, error) { return nil, apperrors.ErrNotFound },
			createFn:           func(*models.Cliente) error { return nil },
			wantCreateCalls:    1,
			wantFindByDNICalls: 1,
		},
		{
			name:               "duplicate DNI is rejected",
			cliente:            testutil.NewCliente(testutil.WithDNI("12345678")),
			findByDNIFn:        func(string) (*models.Cliente, error) { return testutil.NewCliente(), nil },
			wantErr:            apperrors.ErrDuplicate,
			wantCreateCalls:    0,
			wantFindByDNICalls: 1,
		},
		{
			name:               "non-ErrNotFound lookup error propagates",
			cliente:            testutil.NewCliente(),
			findByDNIFn:        func(string) (*models.Cliente, error) { return nil, errRepoBoom },
			wantErr:            errRepoBoom,
			wantCreateCalls:    0,
			wantFindByDNICalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockClienteRepository{
				FindByDNIFunc: tt.findByDNIFn,
				CreateFunc:    tt.createFn,
			}
			svc := services.NewClienteService(mock, zap.NewNop())

			got, err := svc.Create(tt.cliente)

			if tt.wantErr != nil {
				require.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, got)
			} else {
				require.NoError(t, err)
				assert.Same(t, tt.cliente, got)
			}
			assert.Equal(t, tt.wantCreateCalls, mock.CreateCalls)
			assert.Equal(t, tt.wantFindByDNICalls, mock.FindByDNICalls)
		})
	}
}

func TestClienteService_GetByID(t *testing.T) {
	cliente := testutil.NewCliente()

	tests := []struct {
		name           string
		findByIDFn     func(uint) (*models.Cliente, error)
		wantIsNotFound bool
		wantErr        error
	}{
		{
			name:       "found client is returned",
			findByIDFn: func(uint) (*models.Cliente, error) { return cliente, nil },
		},
		{
			name:           "missing client maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Cliente, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected error propagates unchanged",
			findByIDFn: func(uint) (*models.Cliente, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockClienteRepository{FindByIDFunc: tt.findByIDFn}
			svc := services.NewClienteService(mock, zap.NewNop())

			got, err := svc.GetByID(1)

			switch {
			case tt.wantIsNotFound:
				require.ErrorIs(t, err, apperrors.ErrNotFound)
				assert.Nil(t, got)
			case tt.wantErr != nil:
				require.ErrorIs(t, err, tt.wantErr)
				assert.NotErrorIs(t, err, apperrors.ErrNotFound)
				assert.Nil(t, got)
			default:
				require.NoError(t, err)
				assert.Same(t, cliente, got)
			}
			assert.Equal(t, 1, mock.FindByIDCalls)
		})
	}
}

func TestClienteService_Update(t *testing.T) {
	existing := testutil.NewCliente()
	existing.ID = 7

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Cliente, error)
		updateFn        func(*models.Cliente) error
		wantIsNotFound  bool
		wantErr         error
		wantUpdateCalls int
	}{
		{
			name:            "existing client is updated and keeps its ID",
			findByIDFn:      func(uint) (*models.Cliente, error) { return existing, nil },
			updateFn:        func(*models.Cliente) error { return nil },
			wantUpdateCalls: 1,
		},
		{
			name:           "missing client maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Cliente, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Cliente, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "update error propagates",
			findByIDFn:      func(uint) (*models.Cliente, error) { return existing, nil },
			updateFn:        func(*models.Cliente) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantUpdateCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			incoming := testutil.NewCliente(testutil.WithClienteNombre("Updated"))
			mock := &testutil.MockClienteRepository{FindByIDFunc: tt.findByIDFn, UpdateFunc: tt.updateFn}
			svc := services.NewClienteService(mock, zap.NewNop())

			err := svc.Update(7, incoming)

			switch {
			case tt.wantIsNotFound:
				require.ErrorIs(t, err, apperrors.ErrNotFound)
			case tt.wantErr != nil:
				require.ErrorIs(t, err, tt.wantErr)
			default:
				require.NoError(t, err)
			}
			assert.Equal(t, tt.wantUpdateCalls, mock.UpdateCalls)
			if tt.wantUpdateCalls == 1 {
				assert.Equal(t, existing.ID, incoming.ID, "service must preserve the existing record ID")
				assert.Same(t, incoming, mock.LastCliente)
			}
		})
	}
}

func TestClienteService_Delete(t *testing.T) {
	existing := testutil.NewCliente()
	existing.ID = 7

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Cliente, error)
		deleteFn        func(uint) error
		wantIsNotFound  bool
		wantErr         error
		wantDeleteCalls int
	}{
		{
			name:            "existing client is deleted",
			findByIDFn:      func(uint) (*models.Cliente, error) { return existing, nil },
			deleteFn:        func(uint) error { return nil },
			wantDeleteCalls: 1,
		},
		{
			name:           "missing client maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Cliente, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Cliente, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "delete error propagates",
			findByIDFn:      func(uint) (*models.Cliente, error) { return existing, nil },
			deleteFn:        func(uint) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantDeleteCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockClienteRepository{FindByIDFunc: tt.findByIDFn, DeleteFunc: tt.deleteFn}
			svc := services.NewClienteService(mock, zap.NewNop())

			err := svc.Delete(7)

			switch {
			case tt.wantIsNotFound:
				require.ErrorIs(t, err, apperrors.ErrNotFound)
			case tt.wantErr != nil:
				require.ErrorIs(t, err, tt.wantErr)
			default:
				require.NoError(t, err)
			}
			assert.Equal(t, tt.wantDeleteCalls, mock.DeleteCalls)
		})
	}
}

func TestClienteService_GetAll(t *testing.T) {
	clientes := []models.Cliente{*testutil.NewCliente()}
	filters := repositories.ClienteFilters{Limit: 10, Offset: 20, Search: "juan"}

	tests := []struct {
		name      string
		findAllFn func(repositories.ClienteFilters) ([]models.Cliente, error)
		countFn   func(repositories.ClienteFilters) (int64, error)
		wantErr   error
		wantData  []models.Cliente
		wantTotal int64
	}{
		{
			name:      "maps data and total and forwards pagination",
			findAllFn: func(repositories.ClienteFilters) ([]models.Cliente, error) { return clientes, nil },
			countFn:   func(repositories.ClienteFilters) (int64, error) { return 42, nil },
			wantData:  clientes,
			wantTotal: 42,
		},
		{
			name:      "find error propagates",
			findAllFn: func(repositories.ClienteFilters) ([]models.Cliente, error) { return nil, errRepoBoom },
			wantErr:   errRepoBoom,
		},
		{
			name:      "count error propagates",
			findAllFn: func(repositories.ClienteFilters) ([]models.Cliente, error) { return clientes, nil },
			countFn:   func(repositories.ClienteFilters) (int64, error) { return 0, errRepoBoom },
			wantErr:   errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockClienteRepository{FindAllFunc: tt.findAllFn, CountFunc: tt.countFn}
			svc := services.NewClienteService(mock, zap.NewNop())

			got, err := svc.GetAll(filters)

			if tt.wantErr != nil {
				require.ErrorIs(t, err, tt.wantErr)
				assert.Nil(t, got)
				return
			}
			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.wantData, got.Data)
			assert.Equal(t, tt.wantTotal, got.Total)
			assert.Equal(t, filters, mock.LastFilters, "pagination filters must reach the repository")
		})
	}
}
