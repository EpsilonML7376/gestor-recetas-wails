package repositories_test

import (
	"testing"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestDoctorRepository_Create_FindByID_RoundTrip(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	doctor := testutil.NewDoctor()
	require.NoError(t, repo.Create(doctor))
	require.NotZero(t, doctor.ID)

	got, err := repo.FindByID(doctor.ID)
	require.NoError(t, err)
	assert.Equal(t, doctor.ID, got.ID)
	assert.Equal(t, doctor.Nombre, got.Nombre)
	assert.Equal(t, doctor.Apellido, got.Apellido)
}

func TestDoctorRepository_FindByID_NotFound(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	got, err := repo.FindByID(999)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
	assert.Nil(t, got)
}

func TestDoctorRepository_Update(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	created := testutil.NewDoctor()
	require.NoError(t, repo.Create(created))

	created.Nombre = "Marcos"
	created.Apellido = "Sosa"
	require.NoError(t, repo.Update(created))

	got, err := repo.FindByID(created.ID)
	require.NoError(t, err)
	assert.Equal(t, "Marcos", got.Nombre)
	assert.Equal(t, "Sosa", got.Apellido)
}

func TestDoctorRepository_Delete(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	created := testutil.NewDoctor()
	require.NoError(t, repo.Create(created))

	require.NoError(t, repo.Delete(created.ID))

	_, err := repo.FindByID(created.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
}

func TestDoctorRepository_FindAll_Search(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	seed := []*models.Doctor{
		testutil.NewDoctor(testutil.WithDoctorNombre("Ana"), testutil.WithDoctorApellido("Gomez")),
		testutil.NewDoctor(testutil.WithDoctorNombre("Beto"), testutil.WithDoctorApellido("Gomez")),
		testutil.NewDoctor(testutil.WithDoctorNombre("Carla"), testutil.WithDoctorApellido("Diaz")),
	}
	for _, d := range seed {
		require.NoError(t, repo.Create(d))
	}

	got, err := repo.FindAll(repositories.DoctorFilters{Search: "Gomez"})
	require.NoError(t, err)
	require.Len(t, got, 2)
	assert.Equal(t, []string{"Ana", "Beto"}, []string{got[0].Nombre, got[1].Nombre})

	none, err := repo.FindAll(repositories.DoctorFilters{Search: "zzz"})
	require.NoError(t, err)
	assert.Empty(t, none)
}

func TestDoctorRepository_Count_ConsistentWithFindAll(t *testing.T) {
	repo := repositories.NewDoctorRepository(testutil.NewTestDB(t))

	seed := []*models.Doctor{
		testutil.NewDoctor(testutil.WithDoctorNombre("Ana"), testutil.WithDoctorApellido("Gomez")),
		testutil.NewDoctor(testutil.WithDoctorNombre("Beto"), testutil.WithDoctorApellido("Gomez")),
		testutil.NewDoctor(testutil.WithDoctorNombre("Carla"), testutil.WithDoctorApellido("Diaz")),
	}
	for _, d := range seed {
		require.NoError(t, repo.Create(d))
	}

	filters := repositories.DoctorFilters{Search: "Gomez"}

	total, err := repo.Count(filters)
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)

	page, err := repo.FindAll(repositories.DoctorFilters{Search: "Gomez", Limit: 1})
	require.NoError(t, err)
	require.Len(t, page, 1, "FindAll must respect Limit")
	assert.Equal(t, "Ana", page[0].Nombre)

	all, err := repo.FindAll(filters)
	require.NoError(t, err)
	assert.Equal(t, int(total), len(all), "Count must match the unpaginated FindAll row total")
}
