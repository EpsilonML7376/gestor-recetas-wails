package handlers

import (
	"fmt"
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"GestorRecetasWails/internal/dto"
	"GestorRecetasWails/internal/models"
	"GestorRecetasWails/internal/repositories"
	"GestorRecetasWails/internal/services"
	"GestorRecetasWails/internal/utils"
	"go.uber.org/zap"
)

type RecetaHandler struct {
	service *services.RecetaService
	logger  *zap.Logger
}

func NewRecetaHandler(service *services.RecetaService, logger *zap.Logger) *RecetaHandler {
	return &RecetaHandler{
		service: service,
		logger:  logger,
	}
}

// mapRecetaInputToModel mapea un DTO RecetaInput al modelo Receta
func mapRecetaInputToModel(input dto.RecetaInput) models.Receta {
	receta := models.Receta{
		Fecha:       input.Fecha,
		Notas:       input.Notas,
		TieneMutual: input.TieneMutual,
		ClienteID:   input.ClienteID,
		DoctorID:    input.DoctorID,
		MutualID:    input.MutualID,
	}

	// Mapear graduaciones
	if len(input.Graduaciones) > 0 {
		receta.Graduaciones = make([]models.Graduacion, len(input.Graduaciones))
		for i, g := range input.Graduaciones {
			// Si Cil es nil, Grados debe ser nil
			var grados *int
			if g.Cil != nil {
				grados = g.Grados
			}

			receta.Graduaciones[i] = models.Graduacion{
				TipoDistancia: g.TipoDistancia,
				Ojo:           g.Ojo,
				Esf:           g.Esf,
				Cil:           g.Cil,
				Grados:        grados,
			}
		}
	}

	// Mapear lentes
	if len(input.Lentes) > 0 {
		receta.Lentes = make([]models.Lente, len(input.Lentes))
		for i, l := range input.Lentes {
			receta.Lentes[i] = models.Lente{
				CristalTipo:   l.CristalTipo,
				CristalPrecio: l.CristalPrecio,
				ArmazonTipo:   l.ArmazonTipo,
				ArmazonPrecio: l.ArmazonPrecio,
			}
		}
	}

	return receta
}

// Create maneja POST /api/recetas
func (h *RecetaHandler) Create(c *gin.Context) {
	var input dto.RecetaInput

	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	// Validar graduaciones: al menos Esf o Cil debe estar presente
	for i, g := range input.Graduaciones {
		if g.Esf == nil && g.Cil == nil {
			utils.RespondError(c, http.StatusBadRequest, fmt.Sprintf("Al menos uno de los campos (Esf o Cil) debe estar presente en la graduación %d", i+1))
			return
		}
	}

	receta := mapRecetaInputToModel(input)

	result, err := h.service.Create(&receta)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al crear receta")
		return
	}

	utils.RespondData(c, http.StatusCreated, result)
}

// GetByID maneja GET /api/recetas/:id
func (h *RecetaHandler) GetByID(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	receta, err := h.service.GetByID(uint(id))
	if err != nil {
		if err.Error() == "receta no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Receta no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener receta")
		return
	}

	utils.RespondData(c, http.StatusOK, receta)
}

// GetAll maneja GET /api/recetas con query params para filtros y paginación
func (h *RecetaHandler) GetAll(c *gin.Context) {
	var filters repositories.RecetaFilters

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

	// Parsear filtros
	if clienteIDStr := c.Query("clienteId"); clienteIDStr != "" {
		if clienteID, err := strconv.ParseUint(clienteIDStr, 10, 32); err == nil {
			id := uint(clienteID)
			filters.ClienteID = &id
		}
	}

	if doctorIDStr := c.Query("doctorId"); doctorIDStr != "" {
		if doctorID, err := strconv.ParseUint(doctorIDStr, 10, 32); err == nil {
			id := uint(doctorID)
			filters.DoctorID = &id
		}
	}

	if mutualIDStr := c.Query("mutualId"); mutualIDStr != "" {
		if mutualID, err := strconv.ParseUint(mutualIDStr, 10, 32); err == nil {
			id := uint(mutualID)
			filters.MutualID = &id
		}
	}

	if fechaDesdeStr := c.Query("fechaDesde"); fechaDesdeStr != "" {
		if fechaDesde, err := time.Parse("2006-01-02", fechaDesdeStr); err == nil {
			filters.FechaDesde = &fechaDesde
		}
	}

	if fechaHastaStr := c.Query("fechaHasta"); fechaHastaStr != "" {
		if fechaHasta, err := time.Parse("2006-01-02", fechaHastaStr); err == nil {
			filters.FechaHasta = &fechaHasta
		}
	}

	result, err := h.service.GetAll(filters)
	if err != nil {
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener recetas")
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":   result.Data,
		"total":  result.Total,
		"limit":  filters.Limit,
		"offset": filters.Offset,
	})
}

// Update maneja PUT /api/recetas/:id
func (h *RecetaHandler) Update(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	var input dto.RecetaInput
	if err := c.ShouldBindJSON(&input); err != nil {
		utils.RespondError(c, http.StatusBadRequest, "Datos inválidos: "+err.Error())
		return
	}

	// Validar graduaciones: al menos Esf o Cil debe estar presente
	for i, g := range input.Graduaciones {
		if g.Esf == nil && g.Cil == nil {
			utils.RespondError(c, http.StatusBadRequest, fmt.Sprintf("Al menos uno de los campos (Esf o Cil) debe estar presente en la graduación %d", i+1))
			return
		}
	}

	receta := mapRecetaInputToModel(input)

	if err := h.service.Update(uint(id), &receta); err != nil {
		if err.Error() == "receta no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Receta no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al actualizar receta")
		return
	}

	utils.RespondData(c, http.StatusOK, receta)
}

// Delete maneja DELETE /api/recetas/:id
func (h *RecetaHandler) Delete(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	if err := h.service.Delete(uint(id)); err != nil {
		h.logger.Error("Error al eliminar receta", zap.Uint("id", uint(id)), zap.Error(err))
		if err.Error() == "receta no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Receta no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al eliminar receta: "+err.Error())
		return
	}

	h.logger.Info("Receta eliminada exitosamente", zap.Uint("id", uint(id)))
	c.JSON(http.StatusOK, gin.H{"message": "Receta eliminada exitosamente"})
}

// GetTotal maneja GET /api/recetas/:id/total
func (h *RecetaHandler) GetTotal(c *gin.Context) {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		utils.RespondError(c, http.StatusBadRequest, "ID inválido")
		return
	}

	total, err := h.service.GetTotal(uint(id))
	if err != nil {
		if err.Error() == "receta no encontrada" {
			utils.RespondError(c, http.StatusNotFound, "Receta no encontrada")
			return
		}
		utils.RespondError(c, http.StatusInternalServerError, "Error al obtener total")
		return
	}

	c.JSON(http.StatusOK, utils.TotalResponse{Total: total})
}
