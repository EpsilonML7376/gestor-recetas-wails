package models

type Graduacion struct {
	ID            uint     `gorm:"primaryKey" json:"id"`
	TipoDistancia string   `json:"tipoDistancia" binding:"required,oneof=lejos cerca"` // lejos | cerca
	Ojo           string   `json:"ojo" binding:"required,oneof=derecho izquierdo"`     // derecho | izquierdo

	Esf    *float64 `json:"esf"`
	Cil    *float64 `json:"cil"`
	Grados *int     `json:"grados"`

	RecetaID uint `json:"recetaId" binding:"required"`
}
