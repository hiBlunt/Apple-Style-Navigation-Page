package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
)

const configFile = "config.json"
const authFile = ".auth"

func noCacheHandler(h http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
		w.Header().Set("Pragma", "no-cache")
		w.Header().Set("Expires", "0")
		h.ServeHTTP(w, r)
	})
}

func main() {
	// Parse command line flags for IP and Port
	ip := flag.String("ip", "", "IP address to listen on (e.g., 127.0.0.1, 0.0.0.0)")
	port := flag.Int("port", 8080, "Port to listen on")
	flag.Parse()

	// Serve static files from the current directory with No-Cache headers
	fs := http.FileServer(http.Dir("."))
	http.Handle("/", noCacheHandler(fs))

	// API Endpoint to save config
	http.HandleFunc("/api/save-config", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		// Extract the Authorization header (should contain the hash)
		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized: Missing Authorization header", http.StatusUnauthorized)
			return
		}

		// Validate the hash against .auth file
		validHash := ""
		authData, err := os.ReadFile(authFile)
		if err == nil {
			validHash = strings.TrimSpace(string(authData))
		}

		if validHash == "" || authHeader != validHash {
			http.Error(w, "Unauthorized: Invalid password", http.StatusUnauthorized)
			return
		}

		body, err := io.ReadAll(r.Body)
		if err != nil {
			http.Error(w, "Failed to read request body", http.StatusBadRequest)
			return
		}
		defer r.Body.Close()

		// Validate it's valid JSON before writing
		var js map[string]interface{}
		if err := json.Unmarshal(body, &js); err != nil {
			http.Error(w, "Invalid JSON format", http.StatusBadRequest)
			return
		}

		// Write to config.json safely
		err = os.WriteFile(configFile, body, 0644)
		if err != nil {
			log.Printf("Failed to write %s: %v\n", configFile, err)
			http.Error(w, "Failed to save configuration", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true}`))
	})

	// API Endpoint to verify password (used by frontend for blind auth)
	http.HandleFunc("/api/verify", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		authHeader := r.Header.Get("Authorization")
		if authHeader == "" {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		validHash := ""
		authData, err := os.ReadFile(authFile)
		if err == nil {
			validHash = strings.TrimSpace(string(authData))
		}

		if validHash == "" || authHeader != validHash {
			http.Error(w, "Unauthorized", http.StatusUnauthorized)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"success":true}`))
	})

	addr := fmt.Sprintf("%s:%d", *ip, *port)
	displayHost := *ip
	if displayHost == "" {
		displayHost = "localhost"
	}

	fmt.Printf("Navigation dashboard running at http://%s:%d\n", displayHost, *port)
	log.Fatal(http.ListenAndServe(addr, nil))
}
