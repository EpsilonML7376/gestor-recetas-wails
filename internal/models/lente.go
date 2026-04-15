package models

type Lente struct {
	ID             uint   `gorm:"primaryKey" json:"id"`
	CristalTipo    string `json:"cristalTipo"`
	CristalPrecio  int    `json:"cristalPrecio"`
	ArmazonTipo    string `json:"armazonTipo"`
	ArmazonPrecio  int    `json:"armazonPrecio"`
	RecetaID       uint   `json:"recetaId"`
}
