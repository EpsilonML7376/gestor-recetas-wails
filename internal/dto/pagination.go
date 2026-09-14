package dto

import "GestorRecetasWails/internal/models"

type PaginatedRecetas struct {
	Data  []models.Receta `json:"data"`
	Total int64           `json:"total"`
}

type PaginatedClientes struct {
	Data  []models.Cliente `json:"data"`
	Total int64            `json:"total"`
}

type PaginatedDoctores struct {
	Data  []models.Doctor `json:"data"`
	Total int64           `json:"total"`
}

type PaginatedMutuales struct {
	Data  []models.Mutual `json:"data"`
	Total int64           `json:"total"`
}
