package betterimage

import (
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gin-gonic/gin"
)

const imagesDir = "internal/betterimage/test_images"

func Handler(c *gin.Context) {
	name := strings.TrimSpace(c.Param("name"))
	size := strings.TrimSpace(c.Param("size"))

	if name == "" || size == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing image name or size",
		})
		return
	}

	fileName := fmt.Sprintf("%s#%s.jpg", name, size)
	filePath := filepath.Join(imagesDir, fileName)

	fileInfo, err := os.Stat(filePath)
	if err != nil {
		if os.IsNotExist(err) {
			c.JSON(http.StatusNotFound, gin.H{
				"error": "image not found",
			})
			return
		}

		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to read image",
		})
		return
	}

	etag := buildETag(fileName, fileInfo)

	if match := c.GetHeader("If-None-Match"); match != "" && match == etag {
		c.Header("ETag", etag)
		c.Status(http.StatusNotModified)
		return
	}

	c.Header("ETag", etag)
	// c.Header("Cache-Control", "no-store") // Invalid version
	c.Header("Cache-Control", "public, max-age=300, must-revalidate") // Valid version
	c.Header("Content-Type", "image/jpeg")

	c.File(filePath)
}

func buildETag(fileName string, fileInfo os.FileInfo) string {
	raw := fmt.Sprintf("%s:%d:%d", fileName, fileInfo.Size(), fileInfo.ModTime().UnixNano())

	sum := sha1.Sum([]byte(raw))

	return `"` + hex.EncodeToString(sum[:]) + `"`
}
