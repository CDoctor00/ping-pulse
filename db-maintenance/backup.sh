#!/bin/bash
set -eo pipefail

# ===== CONFIGURATION =====
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups/dumps"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
LOG_FILE="/backups/logs/backup.log"
ERROR_LOG="/backups/logs/backup_error.log"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-7}"
MAX_BACKUPS="${BACKUP_MAX_COUNT:-30}"

# ===== FUNCTIONS =====
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$ERROR_LOG" >&2
}

# ===== BACKUP EXECUTION =====
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo " SESSION $(date +'%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
log "Starting backup..."

# Check database connection
if ! pg_isready -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -q; then
    error "Database not ready"
    exit 1
fi

# Execute backup with error capture
if pg_dump -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" --no-owner --no-acl "$DB_NAME" 2>"$ERROR_LOG.tmp" | gzip > "$BACKUP_FILE"; then

    # Verify backup file exists and is not empty
    if [ ! -s "$BACKUP_FILE" ]; then
        error "Backup file is empty"
        rm -f "$BACKUP_FILE"
        exit 1
    fi

    # Verify gzip integrity
    if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
        error "Backup file is corrupted (gzip test failed)"
        rm -f "$BACKUP_FILE"
        exit 1
    fi

    # Get file size
    FILE_SIZE=$(du -h "$BACKUP_FILE" | cut -f1)

    log "Backup completed successfully: $BACKUP_FILE (Size: $FILE_SIZE)"
    chmod 644 "$BACKUP_FILE"

    # Cleanup temp error log
    rm -f "$ERROR_LOG.tmp"

else
    error "pg_dump failed (Exit code: $?)"
    cat "$ERROR_LOG.tmp" >> "$ERROR_LOG"
    rm -f "$BACKUP_FILE" "$ERROR_LOG.tmp"
    exit 1
fi

# ===== RETENTION POLICY =====
log "Applying retention policy (${RETENTION_DAYS} days, max ${MAX_BACKUPS} files)..."

# Delete backups older than RETENTION_DAYS
DELETED_OLD=$(find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} | wc -l)
find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" -mtime +${RETENTION_DAYS} -delete
if [ "$DELETED_OLD" -gt 0 ]; then
    log "Deleted $DELETED_OLD old backup(s) (older than ${RETENTION_DAYS} days)"
fi

# Keep only MAX_BACKUPS most recent files (BusyBox-compatible)
BACKUP_COUNT=$(find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" | wc -l)
if [ "$BACKUP_COUNT" -gt "$MAX_BACKUPS" ]; then
    EXCESS=$((BACKUP_COUNT - MAX_BACKUPS))
    find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" | sort | head -n "$EXCESS" | xargs rm -f
    log "Deleted $EXCESS excess backup(s) (keeping max ${MAX_BACKUPS} files)"
fi

log "Backup process completed. Total backups: $(find "$BACKUP_DIR" -type f -name "backup_*.sql.gz" | wc -l)"