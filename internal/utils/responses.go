package utils

import "github.com/gin-gonic/gin"

type ErrorResponse struct {
	Message string `json:"message"`
}

type SuccessResponse struct {
	Data interface{} `json:"data"`
}

type TotalResponse struct {
	Total int `json:"total"`
}

// RespondError envía una respuesta de error estándar
func RespondError(c *gin.Context, statusCode int, message string) {
	c.JSON(statusCode, ErrorResponse{Message: message})
}

// RespondSuccess envía una respuesta exitosa estándar
func RespondSuccess(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, SuccessResponse{Data: data})
}

// RespondData envía datos directamente sin envolver
func RespondData(c *gin.Context, statusCode int, data interface{}) {
	c.JSON(statusCode, data)
}

