package app

import (
	"dummyserver/internal/betterimage"
	"net/http"

	"github.com/gin-gonic/gin"
)

func RegisterRoutes(engine *gin.Engine) {
	engine.GET("/health", healthHandler)

	api := engine.Group("/api")
	{
		api.GET("/better-image/:name/:size", betterimage.Handler)
		api.GET("/better-image-random/:size", betterimage.RandomHandler)
	}
}

func healthHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status": "ok",
	})
}
