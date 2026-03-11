package app

import (
	"dummyserver/internal/betterimage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(engine *gin.Engine) {
	engine.GET("/health", healthHandler)

	engine.POST("/api/auth/refresh", refreshHandler)

	api := engine.Group("/api")
	api.Use(requireAccessToken())
	{
		api.GET("/better-image", betterimage.Handler)
	}
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
