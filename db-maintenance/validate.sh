#!/bin/bash
set -eo pipefail

# ===== CONFIGURATION =====
BACKUP_DIR="/backups/dumps"
LOG_FILE="/backups/logs/backup_validation.log"

# ===== FUNCTIONS =====
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

# ===== VALIDATION =====
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo " SESSION $(date +'%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
log "Starting backup validation..."

LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -n 1)

if [ -z "$LATEST_BACKUP" ]; then
    error "No backup files found"
    exit 1
fi

log "Validating: $LATEST_BACKUP"

# Check file size (should be > 1KB)
FILE_SIZE=$(stat -f%z "$LATEST_BACKUP" 2>/dev/null || stat -c%s "$LATEST_BACKUP" 2>/dev/null)
if [ "$FILE_SIZE" -lt 1024 ]; then
    error "Backup file too small ($FILE_SIZE bytes)"
    exit 1
fi
log "✓ File size OK: $(du -h "$LATEST_BACKUP" | cut -f1)"

# Verify gzip integrity
if ! gzip -t "$LATEST_BACKUP" 2>/dev/null; then
    error "Gzip integrity check failed"
    exit 1
fi
log "✓ Gzip integrity OK"

# Extract and check SQL content
log "Checking SQL content..."
if ! gunzip -c "$LATEST_BACKUP" | head -n 50 | grep -q "PostgreSQL database dump"; then
    error "Invalid SQL dump format"
    exit 1
fi
log "✓ SQL format OK"

# Check backup age (should be < 25 hours)
BACKUP_AGE_HOURS=$(( ( $(date +%s) - $(stat -f%m "$LATEST_BACKUP" 2>/dev/null || stat -c%Y "$LATEST_BACKUP" 2>/dev/null) ) / 3600 ))
if [ "$BACKUP_AGE_HOURS" -gt 25 ]; then
    error "Latest backup is too old ($BACKUP_AGE_HOURS hours)"
    exit 1
fi
log "✓ Backup age OK: $BACKUP_AGE_HOURS hours"

log "✓ All validation checks passed"