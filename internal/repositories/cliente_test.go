package repositories_test

import (
	"testing"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
)

// These tests exercise ClienteRepository against a real in-memory SQLite
// database (testutil.NewTestDB). They are black-box: they import the
// repositories package as an external consumer and therefore cannot reach
// unexported helpers.

func TestClienteRepository_Create_FindByID_RoundTrip(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	cliente := testutil.NewCliente()
	require.NoError(t, repo.Create(cliente))
	require.NotZero(t, cliente.ID, "GORM must populate the primary key after insert")

	got, err := repo.FindByID(cliente.ID)
	require.NoError(t, err)
	assert.Equal(t, cliente.ID, got.ID)
	assert.Equal(t, cliente.Nombre, got.Nombre)
	assert.Equal(t, cliente.Apellido, got.Apellido)
	assert.Equal(t, cliente.DNI, got.DNI)
	assert.Equal(t, cliente.Telefono, got.Telefono)
}

func TestClienteRepository_FindByID_NotFound(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	got, err := repo.FindByID(999)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
	assert.Nil(t, got)
}

func TestClienteRepository_FindByDNI(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	created := testutil.NewCliente(testutil.WithDNI("30123456"))
	require.NoError(t, repo.Create(created))

	t.Run("existing DNI is returned", func(t *testing.T) {
		got, err := repo.FindByDNI("30123456")
		require.NoError(t, err)
		assert.Equal(t, created.ID, got.ID)
		assert.Equal(t, "30123456", got.DNI)
	})

	t.Run("missing DNI maps to ErrNotFound", func(t *testing.T) {
		got, err := repo.FindByDNI("00000000")
		require.Error(t, err)
		assert.ErrorIs(t, err, apperrors.ErrNotFound)
		assert.Nil(t, got)
	})
}

func TestClienteRepository_Update(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	created := testutil.NewCliente()
	require.NoError(t, repo.Create(created))

	created.Nombre = "Juana"
	created.Apellido = "Martinez"
	created.Telefono = "5555555555"
	require.NoError(t, repo.Update(created))

	got, err := repo.FindByID(created.ID)
	require.NoError(t, err)
	assert.Equal(t, "Juana", got.Nombre)
	assert.Equal(t, "Martinez", got.Apellido)
	assert.Equal(t, "5555555555", got.Telefono)
}

func TestClienteRepository_Delete(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	created := testutil.NewCliente()
	require.NoError(t, repo.Create(created))

	require.NoError(t, repo.Delete(created.ID))

	_, err := repo.FindByID(created.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
}

func TestClienteRepository_FindAll_Search(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	seed := []*models.Cliente{
		testutil.NewCliente(testutil.WithClienteNombre("Ana"), testutil.WithClienteApellido("Gomez"), testutil.WithDNI("11111111")),
		testutil.NewCliente(testutil.WithClienteNombre("Beto"), testutil.WithClienteApellido("Gomez"), testutil.WithDNI("22222222")),
		testutil.NewCliente(testutil.WithClienteNombre("Carla"), testutil.WithClienteApellido("Diaz"), testutil.WithDNI("33333333")),
	}
	for _, c := range seed {
		require.NoError(t, repo.Create(c))
	}

	tests := []struct {
		name  string
		query string
		want  []string // expected nombres, in repository ordering
	}{
		{name: "matches apellido", query: "Gomez", want: []string{"Ana", "Beto"}},
		{name: "matches nombre", query: "Carla", want: []string{"Carla"}},
		{name: "matches dni partially", query: "2222", want: []string{"Beto"}},
		{name: "no matches returns empty slice", query: "zzz", want: nil},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got, err := repo.FindAll(repositories.ClienteFilters{Search: tt.query})
			require.NoError(t, err)

			nombres := make([]string, 0, len(got))
			for _, c := range got {
				nombres = append(nombres, c.Nombre)
			}
			if tt.want == nil {
				assert.Empty(t, nombres)
				return
			}
			assert.Equal(t, tt.want, nombres)
		})
	}
}

func TestClienteRepository_FindAll_Ordering_ByApellidoThenNombre(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	seed := []*models.Cliente{
		testutil.NewCliente(testutil.WithClienteNombre("Zoe"), testutil.WithClienteApellido("Alvarez")),
		testutil.NewCliente(testutil.WithClienteNombre("Bruno"), testutil.WithClienteApellido("Alvarez")),
		testutil.NewCliente(testutil.WithClienteNombre("Ana"), testutil.WithClienteApellido("Benitez")),
	}
	for _, c := range seed {
		require.NoError(t, repo.Create(c))
	}

	got, err := repo.FindAll(repositories.ClienteFilters{})
	require.NoError(t, err)
	require.Len(t, got, 3)

	assert.Equal(t, []string{"Bruno", "Zoe", "Ana"},
		[]string{got[0].Nombre, got[1].Nombre, got[2].Nombre})
}

func TestClienteRepository_Count_IgnoresPagination(t *testing.T) {
	repo := repositories.NewClienteRepository(testutil.NewTestDB(t), zap.NewNop())

	seed := []*models.Cliente{
		testutil.NewCliente(testutil.WithClienteNombre("Ana"), testutil.WithClienteApellido("Gomez")),
		testutil.NewCliente(testutil.WithClienteNombre("Beto"), testutil.WithClienteApellido("Gomez")),
		testutil.NewCliente(testutil.WithClienteNombre("Carla"), testutil.WithClienteApellido("Diaz")),
	}
	for _, c := range seed {
		require.NoError(t, repo.Create(c))
	}

	filters := repositories.ClienteFilters{Search: "Gomez"}

	total, err := repo.Count(filters)
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)

	page, err := repo.FindAll(repositories.ClienteFilters{Search: "Gomez", Limit: 1})
	require.NoError(t, err)
	require.Len(t, page, 1, "FindAll must respect Limit")
	assert.Equal(t, "Ana", page[0].Nombre)
}
