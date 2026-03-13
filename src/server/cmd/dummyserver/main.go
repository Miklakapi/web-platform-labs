package main

import (
	"context"
	"dummyserver/internal/app"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
)

const PORT = "8080"

func main() {
	appCtx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	engine := gin.New()
	engine.Use(gin.Logger(), gin.Recovery(), cors())

	app.RegisterRoutes(engine)

	srv := &http.Server{
		Addr:              ":" + PORT,
		Handler:           engine,
		ReadTimeout:       10 * time.Second,
		ReadHeaderTimeout: 10 * time.Second,
	}

	go func() {
		log.Println("HTTP server started on :" + PORT)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("listen error: %v", err)
		}
	}()

	<-appCtx.Done()
	log.Println("shutdown signal received")

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := srv.Shutdown(shutdownCtx); err != nil {
		log.Printf("graceful shutdown failed: %v, forcing close", err)

		if err := srv.Close(); err != nil {
			log.Printf("forced server close failed: %v", err)
		}
	}

	log.Println("server stopped gracefully")
}

func cors() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, If-None-Match")
		c.Writer.Header().Set("Access-Control-Expose-Headers", "ETag")

		if c.Request.Method == http.MethodOptions {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
