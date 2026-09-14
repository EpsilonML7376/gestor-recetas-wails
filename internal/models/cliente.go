package models

type Cliente struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Nombre   string `gorm:"index" json:"nombre" binding:"required"`
	Apellido string `gorm:"index" json:"apellido" binding:"required"`
	DNI      string `gorm:"index" json:"dni"`
	Telefono string `json:"telefono"`

	Recetas []Receta `gorm:"foreignKey:ClienteID" json:"recetas,omitempty"`
}
