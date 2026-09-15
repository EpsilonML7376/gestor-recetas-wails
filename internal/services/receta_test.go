package services_test

import (
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

// recetaConLentes returns a receta whose two lentes sum to 4000
// (1000 + 2000 and 500 + 500).
func recetaConLentes() *models.Receta {
	return testutil.NewReceta(testutil.WithLentes([]models.Lente{
		*testutil.NewLente(testutil.WithCristalPrecio(1000), testutil.WithArmazonPrecio(2000)),
		*testutil.NewLente(testutil.WithCristalPrecio(500), testutil.WithArmazonPrecio(500)),
	}))
}

func TestRecetaService_GetByID_ComputesTotal(t *testing.T) {
	tests := []struct {
		name      string
		receta    *models.Receta
		wantTotal int
	}{
		{
			name:      "sums the prices of multiple lentes",
			receta:    recetaConLentes(),
			wantTotal: 4000,
		},
		{
			name:      "empty lentes yields zero",
			receta:    testutil.NewReceta(),
			wantTotal: 0,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockRecetaRepository{
				FindByIDFunc: func(uint) (*models.Receta, error) { return tt.receta, nil },
			}
			svc := services.NewRecetaService(mock, zap.NewNop())

			got, err := svc.GetByID(1)

			require.NoError(t, err)
			require.NotNil(t, got)
			assert.Equal(t, tt.wantTotal, got.TotalLente)
		})
	}
}

func TestRecetaService_GetByID_ErrorPaths(t *testing.T) {
	tests := []struct {
		name           string
		findByIDFn     func(uint) (*models.Receta, error)
		wantIsNotFound bool
		wantErr        error
	}{
		{
			name:           "missing receta maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Receta, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected error propagates unchanged",
			findByIDFn: func(uint) (*models.Receta, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockRecetaRepository{FindByIDFunc: tt.findByIDFn}
			svc := services.NewRecetaService(mock, zap.NewNop())

			got, err := svc.GetByID(1)

			if tt.wantIsNotFound {
				require.ErrorIs(t, err, apperrors.ErrNotFound)
			} else {
				require.ErrorIs(t, err, tt.wantErr)
				assert.NotErrorIs(t, err, apperrors.ErrNotFound)
			}
			assert.Nil(t, got)
		})
	}
}

func TestRecetaService_GetAll_ComputesTotals(t *testing.T) {
	recetas := []models.Receta{*recetaConLentes(), *testutil.NewReceta()}
	filters := repositories.RecetaFilters{Limit: 5, Offset: 10}

	mock := &testutil.MockRecetaRepository{
		FindAllFunc: func(repositories.RecetaFilters) ([]models.Receta, error) { return recetas, nil },
		CountFunc:   func(repositories.RecetaFilters) (int64, error) { return 2, nil },
	}
	svc := services.NewRecetaService(mock, zap.NewNop())

	got, err := svc.GetAll(filters)

	require.NoError(t, err)
	require.NotNil(t, got)
	require.Len(t, got.Data, 2)
	assert.Equal(t, 4000, got.Data[0].TotalLente, "total must be computed for each returned receta")
	assert.Equal(t, 0, got.Data[1].TotalLente)
	assert.Equal(t, int64(2), got.Total)
	assert.Equal(t, filters, mock.LastFilters, "pagination filters must reach the repository")
}

func TestRecetaService_GetAll_ErrorPaths(t *testing.T) {
	filters := repositories.RecetaFilters{}

	tests := []struct {
		name      string
		findAllFn func(repositories.RecetaFilters) ([]models.Receta, error)
		countFn   func(repositories.RecetaFilters) (int64, error)
	}{
		{
			name:      "find error propagates",
			findAllFn: func(repositories.RecetaFilters) ([]models.Receta, error) { return nil, errRepoBoom },
		},
		{
			name:      "count error propagates",
			findAllFn: func(repositories.RecetaFilters) ([]models.Receta, error) { return []models.Receta{}, nil },
			countFn:   func(repositories.RecetaFilters) (int64, error) { return 0, errRepoBoom },
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockRecetaRepository{FindAllFunc: tt.findAllFn, CountFunc: tt.countFn}
			svc := services.NewRecetaService(mock, zap.NewNop())

			got, err := svc.GetAll(filters)

			require.ErrorIs(t, err, errRepoBoom)
			assert.Nil(t, got)
		})
	}
}

func TestRecetaService_Create(t *testing.T) {
	t.Run("reloads the receta and computes the total", func(t *testing.T) {
		receta := testutil.NewReceta()
		reloaded := recetaConLentes()
		reloaded.ID = 5

		mock := &testutil.MockRecetaRepository{
			CreateFunc:   func(r *models.Receta) error { r.ID = 5; return nil },
			FindByIDFunc: func(uint) (*models.Receta, error) { return reloaded, nil },
		}
		svc := services.NewRecetaService(mock, zap.NewNop())

		got, err := svc.Create(receta)

		require.NoError(t, err)
		assert.Same(t, receta, got)
		assert.Equal(t, uint(5), got.ID)
		assert.Equal(t, 4000, got.TotalLente)
		assert.Equal(t, 1, mock.CreateCalls)
		assert.Equal(t, 1, mock.FindByIDCalls)
	})

	t.Run("create error propagates before reloading", func(t *testing.T) {
		mock := &testutil.MockRecetaRepository{CreateFunc: func(*models.Receta) error { return errRepoBoom }}
		svc := services.NewRecetaService(mock, zap.NewNop())

		got, err := svc.Create(testutil.NewReceta())

		require.ErrorIs(t, err, errRepoBoom)
		assert.Nil(t, got)
		assert.Equal(t, 1, mock.CreateCalls)
		assert.Equal(t, 0, mock.FindByIDCalls)
	})

	t.Run("reload error propagates", func(t *testing.T) {
		mock := &testutil.MockRecetaRepository{
			CreateFunc:   func(*models.Receta) error { return nil },
			FindByIDFunc: func(uint) (*models.Receta, error) { return nil, errRepoBoom },
		}
		svc := services.NewRecetaService(mock, zap.NewNop())

		got, err := svc.Create(testutil.NewReceta())

		require.ErrorIs(t, err, errRepoBoom)
		assert.Nil(t, got)
	})
}

func TestRecetaService_Update(t *testing.T) {
	existing := recetaConLentes()
	existing.ID = 7

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Receta, error)
		updateFn        func(*models.Receta) error
		wantIsNotFound  bool
		wantErr         error
		wantUpdateCalls int
		wantTotal       int
	}{
		{
			name:            "existing receta is updated, reloaded and recomputed",
			findByIDFn:      func(uint) (*models.Receta, error) { return existing, nil },
			updateFn:        func(*models.Receta) error { return nil },
			wantUpdateCalls: 1,
			wantTotal:       4000,
		},
		{
			name:           "missing receta maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Receta, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Receta, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "update error propagates",
			findByIDFn:      func(uint) (*models.Receta, error) { return existing, nil },
			updateFn:        func(*models.Receta) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantUpdateCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			incoming := testutil.NewReceta(testutil.WithNotas("Updated"))
			mock := &testutil.MockRecetaRepository{FindByIDFunc: tt.findByIDFn, UpdateFunc: tt.updateFn}
			svc := services.NewRecetaService(mock, zap.NewNop())

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
				assert.Same(t, incoming, mock.LastReceta)
			}
			if tt.wantTotal > 0 {
				assert.Equal(t, tt.wantTotal, incoming.TotalLente, "update must recompute the lente total")
			}
		})
	}
}

func TestRecetaService_Delete(t *testing.T) {
	existing := recetaConLentes()
	existing.ID = 7

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Receta, error)
		deleteFn        func(uint) error
		wantIsNotFound  bool
		wantErr         error
		wantDeleteCalls int
	}{
		{
			name:            "existing receta is deleted",
			findByIDFn:      func(uint) (*models.Receta, error) { return existing, nil },
			deleteFn:        func(uint) error { return nil },
			wantDeleteCalls: 1,
		},
		{
			name:           "missing receta maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Receta, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Receta, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "delete error propagates",
			findByIDFn:      func(uint) (*models.Receta, error) { return existing, nil },
			deleteFn:        func(uint) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantDeleteCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockRecetaRepository{FindByIDFunc: tt.findByIDFn, DeleteFunc: tt.deleteFn}
			svc := services.NewRecetaService(mock, zap.NewNop())

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

func TestRecetaService_GetTotal(t *testing.T) {
	mock := &testutil.MockRecetaRepository{
		FindByIDFunc: func(uint) (*models.Receta, error) { return recetaConLentes(), nil },
	}
	svc := services.NewRecetaService(mock, zap.NewNop())

	total, err := svc.GetTotal(1)

	require.NoError(t, err)
	assert.Equal(t, 4000, total)
}
