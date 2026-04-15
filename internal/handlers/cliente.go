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

type ClienteHandler struct {
	service *services.ClienteService
	logger  *zap.Logger
}

func NewClienteHandler(service *services.ClienteService, logger *zap.Logger) *ClienteHandler {
	return &ClienteHandler{
		service: service,
		logger:  logger,
	}
}

// Create maneja POST /api/clientes
func (h *ClienteHandler) Create(c *gin.Context) {
	var cliente models.Cliente

	if err := c.ShouldBindJSON(&cliente); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	result, err := h.service.Create(&cliente)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al crear cliente")
		return
	}

	utils.RespondData(c, http.StatusCreated, result)
}

// GetAll maneja GET /api/clientes con query params para filtros y paginación
func (h *ClienteHandler) GetAll(c *gin.Context) {
	var filters repositories.ClienteFilters

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
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener clientes")
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

// GetByID maneja GET /api/clientes/:id
func (h *ClienteHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	cliente, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "cliente no encontrado" {
			utils.RespondError(c, http.StatusNotFound, "Cliente no encontrado")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener cliente")
		return
	}

	utils.RespondData(c, http.StatusOK, cliente)
}

// Update maneja PUT /api/clientes/:id
func (h *ClienteHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	var cliente models.Cliente
	if err := c.ShouldBindJSON(&cliente); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	if err := h.service.Update(uint(id), &cliente); err != nil {
		if err.Error() == "cliente no encontrado" {
			utils.RespondError(c, http.StatusNotFound, "Cliente no encontrado")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al actualizar cliente")
		return
	}

	utils.RespondData(c, http.StatusOK, cliente)
}

// Delete maneja DELETE /api/clientes/:id
func (h *ClienteHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		if err.Error() == "cliente no encontrado" {
			utils.RespondError(c, http.StatusNotFound, "Cliente no encontrado")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al eliminar cliente")
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Cliente eliminado exitosamente"})
}

