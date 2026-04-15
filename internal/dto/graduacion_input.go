package dto

type GraduacionInput struct {
	TipoDistancia string   `json:"tipoDistancia" binding:"required,oneof=lejos cerca"`
	Ojo           string   `json:"ojo" binding:"required,oneof=derecho izquierdo"`
	Esf           *float64 `json:"esf"`
	Cil           *float64 `json:"cil"`
	Grados        *int     `json:"grados"`
}
