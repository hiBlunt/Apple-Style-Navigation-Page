# Stage 1: Build the Go binary
FROM golang:1.25.1-alpine AS builder

# Set working directory
WORKDIR /app

# Copy source code
COPY main.go go.mod ./

# Build the binary with optimizations (disable CGO, shrink size)
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-s -w" -o nav-server main.go

# Stage 2: Create a minimal runner image
FROM alpine:latest

WORKDIR /app

# Copy the compiled binary from the builder stage
COPY --from=builder /app/nav-server .

# Copy frontend static files and configuration defaults
COPY index.html style.css script.js config.json .auth ./

# Expose the default port
EXPOSE 8080

# Run the executable
CMD ["./nav-server", "-port", "8080", "-ip", "0.0.0.0"]
