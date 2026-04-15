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

type DoctorHandler struct {
	service *services.DoctorService
	logger  *zap.Logger
}

func NewDoctorHandler(service *services.DoctorService, logger *zap.Logger) *DoctorHandler {
	return &DoctorHandler{
		service: service,
		logger:  logger,
	}
}

// Create maneja POST /api/doctores
func (h *DoctorHandler) Create(c *gin.Context) {
	var doctor models.Doctor

	if err := c.ShouldBindJSON(&doctor); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	result, err := h.service.Create(&doctor)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al crear doctor")
		return
	}

	utils.RespondData(c, http.StatusCreated, result)
}

// GetAll maneja GET /api/doctores con query params para filtros y paginación
func (h *DoctorHandler) GetAll(c *gin.Context) {
	var filters repositories.DoctorFilters

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
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener doctores")
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

// GetByID maneja GET /api/doctores/:id
func (h *DoctorHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	doctor, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "doctor no encontrado" {
			utils.RespondError(c, http.StatusNotFound, "Doctor no encontrado")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener doctor")
		return
	}

	utils.RespondData(c, http.StatusOK, doctor)
}

// Update maneja PUT /api/doctores/:id
func (h *DoctorHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	var doctor models.Doctor
	if err := c.ShouldBindJSON(&doctor); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	if err := h.service.Update(uint(id), &doctor); err != nil {
		if err.Error() == "doctor no encontrado" {
			utils.RespondError(c, http.StatusNotFound, "Doctor no encontrado")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al actualizar doctor")
		return
	}

	utils.RespondData(c, http.StatusOK, doctor)
}

