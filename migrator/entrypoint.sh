#!/bin/bash
set -e

if [ -z "$DB_SOURCE" ]; then
    echo "ERROR: DB_SOURCE environment variable is not set"
    exit 1
fi

echo "Running migrations..."
migrate -path /migrations -database "$DB_SOURCE" -verbose up