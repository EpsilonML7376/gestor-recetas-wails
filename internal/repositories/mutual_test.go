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

func TestMutualRepository_Create_FindByID_RoundTrip(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	mutual := testutil.NewMutual()
	require.NoError(t, repo.Create(mutual))
	require.NotZero(t, mutual.ID)

	got, err := repo.FindByID(mutual.ID)
	require.NoError(t, err)
	assert.Equal(t, mutual.ID, got.ID)
	assert.Equal(t, mutual.Nombre, got.Nombre)
}

func TestMutualRepository_FindByID_NotFound(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	got, err := repo.FindByID(999)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
	assert.Nil(t, got)
}

func TestMutualRepository_Update(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	created := testutil.NewMutual()
	require.NoError(t, repo.Create(created))

	created.Nombre = "Swiss Medical"
	require.NoError(t, repo.Update(created))

	got, err := repo.FindByID(created.ID)
	require.NoError(t, err)
	assert.Equal(t, "Swiss Medical", got.Nombre)
}

func TestMutualRepository_Delete(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	created := testutil.NewMutual()
	require.NoError(t, repo.Create(created))

	require.NoError(t, repo.Delete(created.ID))

	_, err := repo.FindByID(created.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
}

func TestMutualRepository_FindAll_Search(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	seed := []*models.Mutual{
		testutil.NewMutual(testutil.WithMutualNombre("OSDE")),
		testutil.NewMutual(testutil.WithMutualNombre("OSDE Binario")),
		testutil.NewMutual(testutil.WithMutualNombre("Swiss Medical")),
	}
	for _, m := range seed {
		require.NoError(t, repo.Create(m))
	}

	got, err := repo.FindAll(repositories.MutualFilters{Search: "OSDE"})
	require.NoError(t, err)
	require.Len(t, got, 2)
	assert.Equal(t, []string{"OSDE", "OSDE Binario"}, []string{got[0].Nombre, got[1].Nombre})

	none, err := repo.FindAll(repositories.MutualFilters{Search: "zzz"})
	require.NoError(t, err)
	assert.Empty(t, none)
}

func TestMutualRepository_Count_ConsistentWithFindAll(t *testing.T) {
	repo := repositories.NewMutualRepository(testutil.NewTestDB(t))

	seed := []*models.Mutual{
		testutil.NewMutual(testutil.WithMutualNombre("OSDE")),
		testutil.NewMutual(testutil.WithMutualNombre("OSDE Binario")),
		testutil.NewMutual(testutil.WithMutualNombre("Swiss Medical")),
	}
	for _, m := range seed {
		require.NoError(t, repo.Create(m))
	}

	filters := repositories.MutualFilters{Search: "OSDE"}

	total, err := repo.Count(filters)
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)

	page, err := repo.FindAll(repositories.MutualFilters{Search: "OSDE", Limit: 1})
	require.NoError(t, err)
	require.Len(t, page, 1, "FindAll must respect Limit")
	assert.Equal(t, "OSDE", page[0].Nombre)
}
