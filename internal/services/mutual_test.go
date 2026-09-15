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

func TestMutualService_Create(t *testing.T) {
	t.Run("success returns the created mutual", func(t *testing.T) {
		mutual := testutil.NewMutual()
		mock := &testutil.MockMutualRepository{CreateFunc: func(m *models.Mutual) error {
			m.ID = 6
			return nil
		}}
		svc := services.NewMutualService(mock, zap.NewNop())

		got, err := svc.Create(mutual)

		require.NoError(t, err)
		assert.Same(t, mutual, got)
		assert.Equal(t, uint(6), got.ID)
		assert.Equal(t, 1, mock.CreateCalls)
	})

	t.Run("repository error propagates", func(t *testing.T) {
		mock := &testutil.MockMutualRepository{CreateFunc: func(*models.Mutual) error { return errRepoBoom }}
		svc := services.NewMutualService(mock, zap.NewNop())

		got, err := svc.Create(testutil.NewMutual())

		require.ErrorIs(t, err, errRepoBoom)
		assert.Nil(t, got)
		assert.Equal(t, 1, mock.CreateCalls)
	})
}

func TestMutualService_GetByID(t *testing.T) {
	mutual := testutil.NewMutual()
	mutual.ID = 8

	tests := []struct {
		name           string
		findByIDFn     func(uint) (*models.Mutual, error)
		wantIsNotFound bool
		wantErr        error
	}{
		{
			name:       "found mutual is returned",
			findByIDFn: func(uint) (*models.Mutual, error) { return mutual, nil },
		},
		{
			name:           "missing mutual maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Mutual, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected error propagates unchanged",
			findByIDFn: func(uint) (*models.Mutual, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockMutualRepository{FindByIDFunc: tt.findByIDFn}
			svc := services.NewMutualService(mock, zap.NewNop())

			got, err := svc.GetByID(8)

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
				assert.Same(t, mutual, got)
			}
			assert.Equal(t, 1, mock.FindByIDCalls)
		})
	}
}

func TestMutualService_GetAll(t *testing.T) {
	mutuales := []models.Mutual{*testutil.NewMutual()}
	filters := repositories.MutualFilters{Limit: 20, Offset: 0, Search: "osde"}

	tests := []struct {
		name      string
		findAllFn func(repositories.MutualFilters) ([]models.Mutual, error)
		countFn   func(repositories.MutualFilters) (int64, error)
		wantErr   error
		wantData  []models.Mutual
		wantTotal int64
	}{
		{
			name:      "maps data and total and forwards pagination",
			findAllFn: func(repositories.MutualFilters) ([]models.Mutual, error) { return mutuales, nil },
			countFn:   func(repositories.MutualFilters) (int64, error) { return 3, nil },
			wantData:  mutuales,
			wantTotal: 3,
		},
		{
			name:      "find error propagates",
			findAllFn: func(repositories.MutualFilters) ([]models.Mutual, error) { return nil, errRepoBoom },
			wantErr:   errRepoBoom,
		},
		{
			name:      "count error propagates",
			findAllFn: func(repositories.MutualFilters) ([]models.Mutual, error) { return mutuales, nil },
			countFn:   func(repositories.MutualFilters) (int64, error) { return 0, errRepoBoom },
			wantErr:   errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockMutualRepository{FindAllFunc: tt.findAllFn, CountFunc: tt.countFn}
			svc := services.NewMutualService(mock, zap.NewNop())

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

func TestMutualService_Update(t *testing.T) {
	existing := testutil.NewMutual()
	existing.ID = 11

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Mutual, error)
		updateFn        func(*models.Mutual) error
		wantIsNotFound  bool
		wantErr         error
		wantUpdateCalls int
	}{
		{
			name:            "existing mutual is updated and keeps its ID",
			findByIDFn:      func(uint) (*models.Mutual, error) { return existing, nil },
			updateFn:        func(*models.Mutual) error { return nil },
			wantUpdateCalls: 1,
		},
		{
			name:           "missing mutual maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Mutual, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Mutual, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "update error propagates",
			findByIDFn:      func(uint) (*models.Mutual, error) { return existing, nil },
			updateFn:        func(*models.Mutual) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantUpdateCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			incoming := testutil.NewMutual(testutil.WithMutualNombre("Updated"))
			mock := &testutil.MockMutualRepository{FindByIDFunc: tt.findByIDFn, UpdateFunc: tt.updateFn}
			svc := services.NewMutualService(mock, zap.NewNop())

			err := svc.Update(11, incoming)

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
				assert.Same(t, incoming, mock.LastMutual)
			}
		})
	}
}

func TestMutualService_Delete(t *testing.T) {
	t.Run("delegates to the repository without an existence check", func(t *testing.T) {
		mock := &testutil.MockMutualRepository{
			FindByIDFunc: func(uint) (*models.Mutual, error) {
				t.Fatal("MutualService.Delete must not call FindByID")
				return nil, nil
			},
			DeleteFunc: func(uint) error { return nil },
		}
		svc := services.NewMutualService(mock, zap.NewNop())

		require.NoError(t, svc.Delete(12))

		assert.Equal(t, 1, mock.DeleteCalls)
		assert.Equal(t, 0, mock.FindByIDCalls)
		assert.Equal(t, uint(12), mock.LastID)
	})

	t.Run("propagates the repository error unchanged", func(t *testing.T) {
		mock := &testutil.MockMutualRepository{DeleteFunc: func(uint) error { return errRepoBoom }}
		svc := services.NewMutualService(mock, zap.NewNop())

		err := svc.Delete(12)

		require.ErrorIs(t, err, errRepoBoom)
		assert.NotErrorIs(t, err, apperrors.ErrNotFound)
		assert.Equal(t, 1, mock.DeleteCalls)
	})
}
