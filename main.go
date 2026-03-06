package main

import (
	"log"
	"net/http"
)

func main() {
	port := "8080"

	fs := http.FileServer(http.Dir("./public"))
	http.Handle("/", fs)

	log.Printf("Serwer działa na http://0.0.0.0:%s", port)

	err := http.ListenAndServe(":"+port, nil)
	if err != nil {
		log.Fatal(err)
	}
}
