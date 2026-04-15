package models

type Doctor struct {
	ID       uint   `gorm:"primaryKey" json:"id"`
	Nombre   string `json:"nombre" binding:"required"`
	Apellido string `json:"apellido" binding:"required"`

	Recetas []Receta `gorm:"foreignKey:DoctorID" json:"recetas,omitempty"`
}

