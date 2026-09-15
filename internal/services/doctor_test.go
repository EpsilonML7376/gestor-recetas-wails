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

func TestDoctorService_Create(t *testing.T) {
	t.Run("success returns the created doctor", func(t *testing.T) {
		doctor := testutil.NewDoctor()
		mock := &testutil.MockDoctorRepository{CreateFunc: func(d *models.Doctor) error {
			d.ID = 3
			return nil
		}}
		svc := services.NewDoctorService(mock, zap.NewNop())

		got, err := svc.Create(doctor)

		require.NoError(t, err)
		assert.Same(t, doctor, got)
		assert.Equal(t, uint(3), got.ID)
		assert.Equal(t, 1, mock.CreateCalls)
	})

	t.Run("repository error propagates", func(t *testing.T) {
		mock := &testutil.MockDoctorRepository{CreateFunc: func(*models.Doctor) error { return errRepoBoom }}
		svc := services.NewDoctorService(mock, zap.NewNop())

		got, err := svc.Create(testutil.NewDoctor())

		require.ErrorIs(t, err, errRepoBoom)
		assert.Nil(t, got)
		assert.Equal(t, 1, mock.CreateCalls)
	})
}

func TestDoctorService_GetByID(t *testing.T) {
	doctor := testutil.NewDoctor()
	doctor.ID = 5

	tests := []struct {
		name           string
		findByIDFn     func(uint) (*models.Doctor, error)
		wantIsNotFound bool
		wantErr        error
	}{
		{
			name:       "found doctor is returned",
			findByIDFn: func(uint) (*models.Doctor, error) { return doctor, nil },
		},
		{
			name:           "missing doctor maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Doctor, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected error propagates unchanged",
			findByIDFn: func(uint) (*models.Doctor, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockDoctorRepository{FindByIDFunc: tt.findByIDFn}
			svc := services.NewDoctorService(mock, zap.NewNop())

			got, err := svc.GetByID(5)

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
				assert.Same(t, doctor, got)
			}
			assert.Equal(t, 1, mock.FindByIDCalls)
		})
	}
}

func TestDoctorService_GetAll(t *testing.T) {
	doctores := []models.Doctor{*testutil.NewDoctor()}
	filters := repositories.DoctorFilters{Limit: 5, Offset: 10, Search: "ana"}

	tests := []struct {
		name      string
		findAllFn func(repositories.DoctorFilters) ([]models.Doctor, error)
		countFn   func(repositories.DoctorFilters) (int64, error)
		wantErr   error
		wantData  []models.Doctor
		wantTotal int64
	}{
		{
			name:      "maps data and total and forwards pagination",
			findAllFn: func(repositories.DoctorFilters) ([]models.Doctor, error) { return doctores, nil },
			countFn:   func(repositories.DoctorFilters) (int64, error) { return 7, nil },
			wantData:  doctores,
			wantTotal: 7,
		},
		{
			name:      "find error propagates",
			findAllFn: func(repositories.DoctorFilters) ([]models.Doctor, error) { return nil, errRepoBoom },
			wantErr:   errRepoBoom,
		},
		{
			name:      "count error propagates",
			findAllFn: func(repositories.DoctorFilters) ([]models.Doctor, error) { return doctores, nil },
			countFn:   func(repositories.DoctorFilters) (int64, error) { return 0, errRepoBoom },
			wantErr:   errRepoBoom,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mock := &testutil.MockDoctorRepository{FindAllFunc: tt.findAllFn, CountFunc: tt.countFn}
			svc := services.NewDoctorService(mock, zap.NewNop())

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

func TestDoctorService_Update(t *testing.T) {
	existing := testutil.NewDoctor()
	existing.ID = 9

	tests := []struct {
		name            string
		findByIDFn      func(uint) (*models.Doctor, error)
		updateFn        func(*models.Doctor) error
		wantIsNotFound  bool
		wantErr         error
		wantUpdateCalls int
	}{
		{
			name:            "existing doctor is updated and keeps its ID",
			findByIDFn:      func(uint) (*models.Doctor, error) { return existing, nil },
			updateFn:        func(*models.Doctor) error { return nil },
			wantUpdateCalls: 1,
		},
		{
			name:           "missing doctor maps to ErrNotFound",
			findByIDFn:     func(uint) (*models.Doctor, error) { return nil, apperrors.ErrNotFound },
			wantIsNotFound: true,
		},
		{
			name:       "unexpected lookup error propagates",
			findByIDFn: func(uint) (*models.Doctor, error) { return nil, errRepoBoom },
			wantErr:    errRepoBoom,
		},
		{
			name:            "update error propagates",
			findByIDFn:      func(uint) (*models.Doctor, error) { return existing, nil },
			updateFn:        func(*models.Doctor) error { return errRepoBoom },
			wantErr:         errRepoBoom,
			wantUpdateCalls: 1,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			incoming := testutil.NewDoctor(testutil.WithDoctorNombre("Updated"))
			mock := &testutil.MockDoctorRepository{FindByIDFunc: tt.findByIDFn, UpdateFunc: tt.updateFn}
			svc := services.NewDoctorService(mock, zap.NewNop())

			err := svc.Update(9, incoming)

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
				assert.Same(t, incoming, mock.LastDoctor)
			}
		})
	}
}

func TestDoctorService_Delete(t *testing.T) {
	t.Run("delegates to the repository without an existence check", func(t *testing.T) {
		mock := &testutil.MockDoctorRepository{
			FindByIDFunc: func(uint) (*models.Doctor, error) {
				t.Fatal("DoctorService.Delete must not call FindByID")
				return nil, nil
			},
			DeleteFunc: func(uint) error { return nil },
		}
		svc := services.NewDoctorService(mock, zap.NewNop())

		require.NoError(t, svc.Delete(4))

		assert.Equal(t, 1, mock.DeleteCalls)
		assert.Equal(t, 0, mock.FindByIDCalls)
		assert.Equal(t, uint(4), mock.LastID)
	})

	t.Run("propagates the repository error unchanged", func(t *testing.T) {
		mock := &testutil.MockDoctorRepository{DeleteFunc: func(uint) error { return errRepoBoom }}
		svc := services.NewDoctorService(mock, zap.NewNop())

		err := svc.Delete(4)

		require.ErrorIs(t, err, errRepoBoom)
		assert.NotErrorIs(t, err, apperrors.ErrNotFound)
		assert.Equal(t, 1, mock.DeleteCalls)
	})
}
