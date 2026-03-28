# ===== BUILD STAGE =====
FROM golang:1.25.4-alpine3.21 AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Copy dependency files and download modules (cached layer)
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the binary
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 \
    go build -ldflags="-s -w" -o /app/server ./cmd/main.go

# ===== RUNTIME STAGE =====
FROM alpine:3.21

# Install runtime dependencies (CA certs for HTTPS, timezone data)
RUN apk add --no-cache ca-certificates tzdata

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/server .

# Run as non-root user
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

ENTRYPOINT ["/app/server"]