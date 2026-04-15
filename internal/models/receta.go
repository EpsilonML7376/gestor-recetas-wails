package models

import "time"

type Receta struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	Fecha       time.Time `json:"fecha" binding:"required"`
	Notas       string    `json:"notas"`
	TieneMutual bool      `json:"tieneMutual"`

	// Campo virtual para el total (no se guarda en BD)
	TotalLente int `gorm:"-" json:"total"`

	// Foreign Keys
	ClienteID uint  `json:"clienteId" binding:"required"`
	DoctorID  uint  `json:"doctorId" binding:"required"`
	MutualID  *uint `json:"mutualId"` // nullable

	// Relaciones
	Cliente Cliente `gorm:"foreignKey:ClienteID" json:"cliente,omitempty"`
	Doctor  Doctor  `gorm:"foreignKey:DoctorID" json:"doctor,omitempty"`
	Mutual  *Mutual `gorm:"foreignKey:MutualID" json:"mutual,omitempty"`

	Graduaciones []Graduacion `gorm:"foreignKey:RecetaID" json:"graduaciones,omitempty"`
	Lentes       []Lente      `gorm:"foreignKey:RecetaID" json:"lentes,omitempty"`
}
