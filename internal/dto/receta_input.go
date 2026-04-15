package dto

import "time"

// LenteInput representa los datos de un lente en el input de la receta
type LenteInput struct {
	CristalTipo   string `json:"cristalTipo"`
	CristalPrecio int    `json:"cristalPrecio"`
	ArmazonTipo   string `json:"armazonTipo"`
	ArmazonPrecio int    `json:"armazonPrecio"`
}

type RecetaInput struct {
	Fecha        time.Time        `json:"fecha" binding:"required"`
	Notas        string           `json:"notas"`
	TieneMutual  bool             `json:"tieneMutual"`
	ClienteID    uint             `json:"clienteId" binding:"required"`
	DoctorID     uint             `json:"doctorId" binding:"required"`
	MutualID     *uint            `json:"mutualId"`
	Graduaciones []GraduacionInput `json:"graduaciones"`
	Lentes       []LenteInput     `json:"lentes"`
}
