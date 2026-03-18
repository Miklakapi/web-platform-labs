package betterimage

import (
	"crypto/rand"
	"crypto/sha1"
	"encoding/hex"
	"fmt"
	"math/big"
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

	if err := serveImageWithETag(c, filePath, fileName); err != nil {
		handleImageError(c, err)
		return
	}
}

func RandomHandler(c *gin.Context) {
	size := strings.TrimSpace(c.Param("size"))
	if size == "" {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "missing image size",
		})
		return
	}

	entries, err := os.ReadDir(imagesDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to read images directory",
		})
		return
	}

	suffix := "#" + size + ".jpg"
	var candidates []string

	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}

		name := entry.Name()
		if strings.HasSuffix(name, suffix) {
			candidates = append(candidates, name)
		}
	}

	if len(candidates) == 0 {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "no images found for given size",
		})
		return
	}

	index, err := cryptoRandomIndex(len(candidates))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": "failed to choose random image",
		})
		return
	}

	fileName := candidates[index]
	filePath := filepath.Join(imagesDir, fileName)

	if err := serveImageWithETag(c, filePath, fileName); err != nil {
		handleImageError(c, err)
		return
	}
}

func serveImageWithETag(c *gin.Context, filePath string, fileName string) error {
	fileInfo, err := os.Stat(filePath)
	if err != nil {
		return err
	}

	etag := buildETag(fileName, fileInfo)

	if match := c.GetHeader("If-None-Match"); match != "" && match == etag {
		c.Header("ETag", etag)
		c.Status(http.StatusNotModified)
		return nil
	}

	c.Header("ETag", etag)
	c.Header("Cache-Control", "public, max-age=3000, must-revalidate")
	c.Header("Content-Type", "image/jpeg")

	c.File(filePath)
	return nil
}

func buildETag(fileName string, fileInfo os.FileInfo) string {
	raw := fmt.Sprintf("%s:%d:%d", fileName, fileInfo.Size(), fileInfo.ModTime().UnixNano())

	sum := sha1.Sum([]byte(raw))

	return `"` + hex.EncodeToString(sum[:]) + `"`
}

func handleImageError(c *gin.Context, err error) {
	if os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "image not found",
		})
		return
	}

	c.JSON(http.StatusInternalServerError, gin.H{
		"error": "failed to read image",
	})
}

func cryptoRandomIndex(length int) (int, error) {
	n, err := rand.Int(rand.Reader, big.NewInt(int64(length)))
	if err != nil {
		return 0, err
	}

	return int(n.Int64()), nil
}
