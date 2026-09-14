package models

type Mutual struct {
	ID     uint   `gorm:"primaryKey" json:"id"`
	Nombre string `json:"nombre" binding:"required"`

	Recetas []Receta `gorm:"foreignKey:MutualID" json:"recetas,omitempty"`
}
