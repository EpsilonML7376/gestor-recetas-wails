package testutil

import (
	"time"

	"GestorRecetasWails/internal/models"
)

// Ptr returns a pointer to v, handy for models and filters that use pointer
// fields (Receta.MutualID, Graduacion.Esf, RecetaFilters.FechaDesde, ...).
func Ptr[T any](v T) *T {
	return &v
}

// defaultFecha is a deterministic, non-zero date used by the receta factory.
var defaultFecha = time.Date(2024, 1, 15, 10, 30, 0, 0, time.UTC)

// NewCliente builds a Cliente with every required field populated. Options
// override individual fields without repeating boilerplate.
func NewCliente(opts ...func(*models.Cliente)) *models.Cliente {
	c := &models.Cliente{
		Nombre:   "Juan",
		Apellido: "Perez",
		DNI:      "12345678",
		Telefono: "1122334455",
	}
	for _, opt := range opts {
		opt(c)
	}
	return c
}

func WithDNI(dni string) func(*models.Cliente) {
	return func(c *models.Cliente) { c.DNI = dni }
}

func WithClienteNombre(nombre string) func(*models.Cliente) {
	return func(c *models.Cliente) { c.Nombre = nombre }
}

func WithClienteApellido(apellido string) func(*models.Cliente) {
	return func(c *models.Cliente) { c.Apellido = apellido }
}

func WithClienteTelefono(telefono string) func(*models.Cliente) {
	return func(c *models.Cliente) { c.Telefono = telefono }
}

// NewDoctor builds a Doctor with every required field populated.
func NewDoctor(opts ...func(*models.Doctor)) *models.Doctor {
	d := &models.Doctor{
		Nombre:   "Ana",
		Apellido: "Gomez",
	}
	for _, opt := range opts {
		opt(d)
	}
	return d
}

func WithDoctorNombre(nombre string) func(*models.Doctor) {
	return func(d *models.Doctor) { d.Nombre = nombre }
}

func WithDoctorApellido(apellido string) func(*models.Doctor) {
	return func(d *models.Doctor) { d.Apellido = apellido }
}

// NewMutual builds a Mutual with every required field populated.
func NewMutual(opts ...func(*models.Mutual)) *models.Mutual {
	m := &models.Mutual{
		Nombre: "OSDE",
	}
	for _, opt := range opts {
		opt(m)
	}
	return m
}

func WithMutualNombre(nombre string) func(*models.Mutual) {
	return func(m *models.Mutual) { m.Nombre = nombre }
}

// NewLente builds a Lente with sensible defaults. Lente has no binding-required
// fields, so RecetaID defaults to zero and is set through WithLenteRecetaID.
func NewLente(opts ...func(*models.Lente)) *models.Lente {
	l := &models.Lente{
		CristalTipo:   "Monofocal",
		CristalPrecio: 1000,
		ArmazonTipo:   "Metal",
		ArmazonPrecio: 2000,
	}
	for _, opt := range opts {
		opt(l)
	}
	return l
}

func WithCristalTipo(tipo string) func(*models.Lente) {
	return func(l *models.Lente) { l.CristalTipo = tipo }
}

func WithCristalPrecio(precio int) func(*models.Lente) {
	return func(l *models.Lente) { l.CristalPrecio = precio }
}

func WithArmazonTipo(tipo string) func(*models.Lente) {
	return func(l *models.Lente) { l.ArmazonTipo = tipo }
}

func WithArmazonPrecio(precio int) func(*models.Lente) {
	return func(l *models.Lente) { l.ArmazonPrecio = precio }
}

func WithLenteRecetaID(id uint) func(*models.Lente) {
	return func(l *models.Lente) { l.RecetaID = id }
}

// NewGraduacion builds a Graduacion with every required field populated.
func NewGraduacion(opts ...func(*models.Graduacion)) *models.Graduacion {
	g := &models.Graduacion{
		TipoDistancia: "lejos",
		Ojo:           "derecho",
		Esf:           Ptr(-1.25),
		Cil:           Ptr(-0.5),
		Grados:        Ptr(90),
		RecetaID:      1,
	}
	for _, opt := range opts {
		opt(g)
	}
	return g
}

func WithTipoDistancia(tipo string) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.TipoDistancia = tipo }
}

func WithOjo(ojo string) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.Ojo = ojo }
}

func WithEsf(esf *float64) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.Esf = esf }
}

func WithCil(cil *float64) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.Cil = cil }
}

func WithGrados(grados *int) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.Grados = grados }
}

func WithGraduacionRecetaID(id uint) func(*models.Graduacion) {
	return func(g *models.Graduacion) { g.RecetaID = id }
}

// NewReceta builds a Receta with every binding-required field populated. Fecha
// is deterministic and non-zero, in time.UTC.
func NewReceta(opts ...func(*models.Receta)) *models.Receta {
	r := &models.Receta{
		Fecha:     defaultFecha,
		Notas:     "Control anual",
		ClienteID: 1,
		DoctorID:  1,
	}
	for _, opt := range opts {
		opt(r)
	}
	return r
}

func WithFecha(fecha time.Time) func(*models.Receta) {
	return func(r *models.Receta) { r.Fecha = fecha }
}

func WithNotas(notas string) func(*models.Receta) {
	return func(r *models.Receta) { r.Notas = notas }
}

func WithTieneMutual(tiene bool) func(*models.Receta) {
	return func(r *models.Receta) { r.TieneMutual = tiene }
}

func WithRecetaClienteID(id uint) func(*models.Receta) {
	return func(r *models.Receta) { r.ClienteID = id }
}

func WithRecetaDoctorID(id uint) func(*models.Receta) {
	return func(r *models.Receta) { r.DoctorID = id }
}

func WithMutualID(id *uint) func(*models.Receta) {
	return func(r *models.Receta) { r.MutualID = id }
}

func WithLentes(lentes []models.Lente) func(*models.Receta) {
	return func(r *models.Receta) { r.Lentes = lentes }
}

func WithGraduaciones(graduaciones []models.Graduacion) func(*models.Receta) {
	return func(r *models.Receta) { r.Graduaciones = graduaciones }
}
