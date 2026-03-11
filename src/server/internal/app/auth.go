package app

import (
	"encoding/base64"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
)

// This authentication mechanism is intentionally simplified because the server acts as a dummy API for browser-platform experiments.
// The goal is to support features like Service Worker request interception, header manipulation and token refresh flows without
// introducing full authentication infrastructure.
//
// Cookies are intentionally not used here. Access tokens must be sent through the Authorization header so the frontend (and service workers)
// can intercept, modify and retry requests. This makes it easier to experiment with client-side networking patterns.

type refreshTokenRequest struct {
	RefreshToken string `json:"refreshToken"`
}

type refreshTokenResponse struct {
	AccessToken      string    `json:"accessToken"`
	RefreshToken     string    `json:"refreshToken"`
	AccessExpiresAt  time.Time `json:"accessExpiresAt"`
	AccessTTLSeconds int64     `json:"accessTtlSeconds"`
}

func refreshHandler(c *gin.Context) {
	var request refreshTokenRequest

	if err := c.ShouldBindJSON(&request); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid request body",
		})
		return
	}

	if strings.TrimSpace(request.RefreshToken) != AppRefreshToken {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "invalid refresh token",
		})
		return
	}

	accessToken, expiresAt := generateAccessToken()

	c.JSON(http.StatusOK, refreshTokenResponse{
		AccessToken:      accessToken,
		RefreshToken:     AppRefreshToken,
		AccessExpiresAt:  expiresAt,
		AccessTTLSeconds: int64(AccessTokenTTL.Seconds()),
	})
}

func requireAccessToken() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := strings.TrimSpace(c.GetHeader("Authorization"))

		if !strings.HasPrefix(authHeader, "Bearer ") {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid authorization header",
			})
			return
		}

		token := strings.TrimSpace(strings.TrimPrefix(authHeader, "Bearer "))

		if !validateAccessToken(token) {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
				"error": "invalid or expired access token",
			})
			return
		}

		c.Next()
	}
}

func generateAccessToken() (string, time.Time) {
	expiresAt := time.Now().Add(AccessTokenTTL)
	expUnix := expiresAt.Unix()

	payload := strconv.FormatInt(expUnix, 10)
	token := "at_" + base64.RawURLEncoding.EncodeToString([]byte(payload))

	return token, expiresAt
}

func validateAccessToken(token string) bool {
	if !strings.HasPrefix(token, "at_") {
		return false
	}

	encoded := strings.TrimPrefix(token, "at_")

	decoded, err := base64.RawURLEncoding.DecodeString(encoded)
	if err != nil {
		return false
	}

	expUnix, err := strconv.ParseInt(string(decoded), 10, 64)
	if err != nil {
		return false
	}

	return time.Now().Unix() <= expUnix
}
