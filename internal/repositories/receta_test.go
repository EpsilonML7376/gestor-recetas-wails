package repositories_test

import (
	"testing"
	"time"

	apperrors "GestorRecetasWails/internal/errors"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/testutil"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"go.uber.org/zap"
	"gorm.io/gorm"
)

// recetaDeps seeds the rows a Receta depends on (Cliente, Doctor, Mutual) and
// returns their real primary keys, so the integration tests exercise foreign
// keys the same way production does.
func recetaDeps(t *testing.T, db *gorm.DB) (clienteID, doctorID, mutualID uint) {
	t.Helper()

	cliente := testutil.NewCliente()
	require.NoError(t, repositories.NewClienteRepository(db, zap.NewNop()).Create(cliente))

	doctor := testutil.NewDoctor()
	require.NoError(t, repositories.NewDoctorRepository(db).Create(doctor))

	mutual := testutil.NewMutual()
	require.NoError(t, repositories.NewMutualRepository(db).Create(mutual))

	return cliente.ID, doctor.ID, mutual.ID
}

// seedReceta inserts one receta at the given instant and returns its ID.
func seedReceta(t *testing.T, repo *repositories.RecetaRepository, clienteID, doctorID uint, fecha time.Time) uint {
	t.Helper()

	receta := testutil.NewReceta(
		testutil.WithFecha(fecha),
		testutil.WithRecetaClienteID(clienteID),
		testutil.WithRecetaDoctorID(doctorID),
	)
	require.NoError(t, repo.Create(receta))
	return receta.ID
}

// day builds an explicit-UTC instant at midnight; all date fixtures use UTC so
// the inclusive-boundary comparisons in applyRecetaFilters are deterministic.
func day(y int, m time.Month, d int) time.Time {
	return time.Date(y, m, d, 0, 0, 0, 0, time.UTC)
}

func TestRecetaRepository_Create_FindByID_RoundTrip(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, mutualID := recetaDeps(t, db)

	receta := testutil.NewReceta(
		testutil.WithRecetaClienteID(clienteID),
		testutil.WithRecetaDoctorID(doctorID),
		testutil.WithMutualID(testutil.Ptr(mutualID)),
		testutil.WithTieneMutual(true),
		testutil.WithLentes([]models.Lente{
			*testutil.NewLente(),
			*testutil.NewLente(testutil.WithCristalTipo("Bifocal")),
		}),
		testutil.WithGraduaciones([]models.Graduacion{
			*testutil.NewGraduacion(),
			*testutil.NewGraduacion(testutil.WithOjo("izquierdo")),
		}),
	)
	require.NoError(t, repo.Create(receta))
	require.NotZero(t, receta.ID)

	got, err := repo.FindByID(receta.ID)
	require.NoError(t, err)
	assert.Equal(t, receta.ID, got.ID)
	assert.Equal(t, clienteID, got.Cliente.ID)
	assert.Equal(t, doctorID, got.Doctor.ID)
	require.NotNil(t, got.Mutual)
	assert.Equal(t, mutualID, got.Mutual.ID)
	assert.Len(t, got.Lentes, 2)
	assert.Len(t, got.Graduaciones, 2)
}

func TestRecetaRepository_FindByID_NotFound(t *testing.T) {
	repo := repositories.NewRecetaRepository(testutil.NewTestDB(t))

	got, err := repo.FindByID(999)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)
	assert.Nil(t, got)
}

func TestRecetaRepository_Update(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	receta := testutil.NewReceta(
		testutil.WithRecetaClienteID(clienteID),
		testutil.WithRecetaDoctorID(doctorID),
		testutil.WithLentes([]models.Lente{*testutil.NewLente()}),
	)
	require.NoError(t, repo.Create(receta))

	updatedFecha := time.Date(2024, 2, 1, 9, 0, 0, 0, time.UTC)
	receta.Fecha = updatedFecha
	receta.Notas = "Actualizado"
	receta.Lentes = []models.Lente{*testutil.NewLente(testutil.WithCristalTipo("Progresivo"))}
	require.NoError(t, repo.Update(receta))

	got, err := repo.FindByID(receta.ID)
	require.NoError(t, err)
	assert.Equal(t, "Actualizado", got.Notas)
	assert.True(t, got.Fecha.UTC().Equal(updatedFecha), "fecha must round-trip, got %s", got.Fecha)
	require.Len(t, got.Lentes, 1)
	assert.Equal(t, "Progresivo", got.Lentes[0].CristalTipo)
}

func TestRecetaRepository_FindAll_DateRange_BothBounds(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	// before, exactly at start-of-day, inside, exactly at end-of-day, after
	seedReceta(t, repo, clienteID, doctorID, time.Date(2024, 1, 9, 12, 0, 0, 0, time.UTC))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 10))
	seedReceta(t, repo, clienteID, doctorID, time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC))
	seedReceta(t, repo, clienteID, doctorID, time.Date(2024, 1, 20, 23, 59, 59, 0, time.UTC))
	seedReceta(t, repo, clienteID, doctorID, time.Date(2024, 1, 21, 0, 0, 1, 0, time.UTC))

	desde := day(2024, time.January, 10)
	hasta := day(2024, time.January, 20)
	filters := repositories.RecetaFilters{FechaDesde: &desde, FechaHasta: &hasta}

	got, err := repo.FindAll(filters)
	require.NoError(t, err)
	require.Len(t, got, 3, "inclusive bounds must keep start-of-day, inside and end-of-day rows")

	for _, r := range got {
		f := r.Fecha.UTC()
		assert.False(t, f.Before(desde), "row %s is before the lower bound", f)
		assert.False(t, f.After(hasta.Add(24*time.Hour-time.Nanosecond)), "row %s is after the upper bound", f)
	}

	total, err := repo.Count(filters)
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)
}

func TestRecetaRepository_FindAll_DateRange_DesdeOnly(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 9))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 10))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 11))

	desde := day(2024, time.January, 10)
	got, err := repo.FindAll(repositories.RecetaFilters{FechaDesde: &desde})
	require.NoError(t, err)
	require.Len(t, got, 2, "lower bound only must return rows on or after start-of-day")

	total, err := repo.Count(repositories.RecetaFilters{FechaDesde: &desde})
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
}

func TestRecetaRepository_FindAll_DateRange_HastaOnly(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 9))
	seedReceta(t, repo, clienteID, doctorID, time.Date(2024, 1, 10, 23, 59, 59, 0, time.UTC))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 11))

	hasta := day(2024, time.January, 10)
	got, err := repo.FindAll(repositories.RecetaFilters{FechaHasta: &hasta})
	require.NoError(t, err)
	require.Len(t, got, 2, "upper bound only must return rows on or before end-of-day")

	total, err := repo.Count(repositories.RecetaFilters{FechaHasta: &hasta})
	require.NoError(t, err)
	assert.Equal(t, int64(2), total)
}

func TestRecetaRepository_FindAll_EntityFilters(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, mutualID := recetaDeps(t, db)

	otherCliente := testutil.NewCliente(testutil.WithDNI("87654321"))
	require.NoError(t, repositories.NewClienteRepository(db, zap.NewNop()).Create(otherCliente))
	otherDoctor := testutil.NewDoctor(testutil.WithDoctorNombre("Otro"))
	require.NoError(t, repositories.NewDoctorRepository(db).Create(otherDoctor))

	create := func(cliente, doctor uint, mutual *uint, fecha time.Time) {
		t.Helper()
		r := testutil.NewReceta(
			testutil.WithFecha(fecha),
			testutil.WithRecetaClienteID(cliente),
			testutil.WithRecetaDoctorID(doctor),
			testutil.WithMutualID(mutual),
			testutil.WithTieneMutual(mutual != nil),
		)
		require.NoError(t, repo.Create(r))
	}

	// clienteID + doctorID + mutual
	create(clienteID, doctorID, testutil.Ptr(mutualID), day(2024, time.January, 15))
	// clienteID + otherDoctor + mutual
	create(clienteID, otherDoctor.ID, testutil.Ptr(mutualID), day(2024, time.January, 16))
	// otherCliente + doctorID, no mutual
	create(otherCliente.ID, doctorID, nil, day(2024, time.January, 17))

	t.Run("ClienteID", func(t *testing.T) {
		got, err := repo.FindAll(repositories.RecetaFilters{ClienteID: testutil.Ptr(clienteID)})
		require.NoError(t, err)
		assert.Len(t, got, 2)
	})

	t.Run("DoctorID", func(t *testing.T) {
		got, err := repo.FindAll(repositories.RecetaFilters{DoctorID: testutil.Ptr(doctorID)})
		require.NoError(t, err)
		assert.Len(t, got, 2)
	})

	t.Run("MutualID", func(t *testing.T) {
		got, err := repo.FindAll(repositories.RecetaFilters{MutualID: testutil.Ptr(mutualID)})
		require.NoError(t, err)
		require.Len(t, got, 2)
		for _, r := range got {
			require.NotNil(t, r.MutualID)
			assert.Equal(t, mutualID, *r.MutualID)
		}
	})
}

func TestRecetaRepository_Count_IgnoresPagination(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 15))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 16))
	seedReceta(t, repo, clienteID, doctorID, day(2024, time.January, 17))

	filters := repositories.RecetaFilters{FechaDesde: testutil.Ptr(day(2024, time.January, 15))}

	total, err := repo.Count(filters)
	require.NoError(t, err)
	assert.Equal(t, int64(3), total)

	limitFilter := repositories.RecetaFilters{
		FechaDesde: testutil.Ptr(day(2024, time.January, 15)),
		Limit:      1,
	}
	page, err := repo.FindAll(limitFilter)
	require.NoError(t, err)
	require.Len(t, page, 1, "FindAll must respect Limit")
	assert.Equal(t, int64(3), total, "Count must ignore pagination")
}

func TestRecetaRepository_Delete_CascadesChildren(t *testing.T) {
	db := testutil.NewTestDB(t)
	repo := repositories.NewRecetaRepository(db)
	clienteID, doctorID, _ := recetaDeps(t, db)

	receta := testutil.NewReceta(
		testutil.WithRecetaClienteID(clienteID),
		testutil.WithRecetaDoctorID(doctorID),
		testutil.WithLentes([]models.Lente{
			*testutil.NewLente(),
			*testutil.NewLente(testutil.WithCristalTipo("Bifocal")),
		}),
		testutil.WithGraduaciones([]models.Graduacion{
			*testutil.NewGraduacion(),
			*testutil.NewGraduacion(testutil.WithOjo("izquierdo")),
		}),
	)
	require.NoError(t, repo.Create(receta))
	require.NotZero(t, receta.ID)

	var lentesAntes, graduacionesAntes int64
	require.NoError(t, db.Model(&models.Lente{}).Where("receta_id = ?", receta.ID).Count(&lentesAntes).Error)
	require.NoError(t, db.Model(&models.Graduacion{}).Where("receta_id = ?", receta.ID).Count(&graduacionesAntes).Error)
	require.Equal(t, int64(2), lentesAntes)
	require.Equal(t, int64(2), graduacionesAntes)

	require.NoError(t, repo.Delete(receta.ID))

	_, err := repo.FindByID(receta.ID)
	require.Error(t, err)
	assert.ErrorIs(t, err, apperrors.ErrNotFound)

	var lentesDespues, graduacionesDespues int64
	require.NoError(t, db.Model(&models.Lente{}).Where("receta_id = ?", receta.ID).Count(&lentesDespues).Error)
	require.NoError(t, db.Model(&models.Graduacion{}).Where("receta_id = ?", receta.ID).Count(&graduacionesDespues).Error)
	assert.Zero(t, lentesDespues, "lentes must be deleted with the receta")
	assert.Zero(t, graduacionesDespues, "graduaciones must be deleted with the receta")
}
