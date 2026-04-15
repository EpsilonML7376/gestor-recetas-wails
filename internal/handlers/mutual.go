package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/services"
	"GestorRecetasWails/internal/utils"
	"go.uber.org/zap"
)

type MutualHandler struct {
	service *services.MutualService
	logger  *zap.Logger
}

func NewMutualHandler(service *services.MutualService, logger *zap.Logger) *MutualHandler {
	return &MutualHandler{
		service: service,
		logger:  logger,
	}
}

// Create maneja POST /api/mutuales
func (h *MutualHandler) Create(c *gin.Context) {
	var mutual models.Mutual

	if err := c.ShouldBindJSON(&mutual); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	result, err := h.service.Create(&mutual)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al crear mutual")
		return
	}

	utils.RespondData(c, http.StatusCreated, result)
}

// GetAll maneja GET /api/mutuales con query params para filtros y paginación
func (h *MutualHandler) GetAll(c *gin.Context) {
	var filters repositories.MutualFilters

	// Parsear parámetros de paginación
	if limitStr := c.Query("limit"); limitStr != "" {
		if limit, err := strconv.Atoi(limitStr); err == nil {
			filters.Limit = limit
		}
	}

	if offsetStr := c.Query("offset"); offsetStr != "" {
		if offset, err := strconv.Atoi(offsetStr); err == nil {
			filters.Offset = offset
		}
	}

	// Parsear búsqueda
	if search := c.Query("search"); search != "" {
		filters.Search = search
	}

	result, err := h.service.GetAll(filters)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener mutuales")
		return
	}

	// Respuesta con metadatos de paginación
	c.JSON(http.StatusOK, gin.H{
		"data":   result.Data,
		"total":  result.Total,
		"limit":  filters.Limit,
		"offset": filters.Offset,
	})
}

// GetByID maneja GET /api/mutuales/:id
func (h *MutualHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	mutual, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "mutual no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Mutual no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener mutual")
		return
	}

	utils.RespondData(c, http.StatusOK, mutual)
}

// Update maneja PUT /api/mutuales/:id
func (h *MutualHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	var mutual models.Mutual
	if err := c.ShouldBindJSON(&mutual); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	if err := h.service.Update(uint(id), &mutual); err != nil {
		if err.Error() == "mutual no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Mutual no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al actualizar mutual")
		return
	}

	utils.RespondData(c, http.StatusOK, mutual)
}

