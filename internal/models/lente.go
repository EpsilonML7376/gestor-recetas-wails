package models

type Lente struct {
	ID            uint   `gorm:"primaryKey" json:"id"`
	CristalTipo   string `json:"cristalTipo"`
	CristalPrecio int64  `json:"cristalPrecio"`
	ArmazonTipo   string `json:"armazonTipo"`
	ArmazonPrecio int64  `json:"armazonPrecio"`
	RecetaID      uint   `json:"recetaId"`
}
