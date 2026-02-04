#!/bin/bash

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_DIR="/backups"
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql.gz"
LOG_FILE="/var/log/backup_error.log"

echo "[$TIMESTAMP] Starting backup..."

ERROR_MSG=$(pg_dump -h database -U "$POSTGRES_USER" "$POSTGRES_DB" 2>&1 > >(gzip > "$BACKUP_FILE"))

EXIT_CODE=${PIPESTATUS[0]}

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$TIMESTAMP] Backup completed successfully: $BACKUP_FILE"
    chmod 644 "$BACKUP_FILE"
else
    echo "[$TIMESTAMP] CRITICAL ERROR (Code: $EXIT_CODE):" >&2
    echo "$ERROR_MSG" >&2
    echo "[$TIMESTAMP] $ERROR_MSG" >> "$LOG_FILE"
    
    rm -f "$BACKUP_FILE"
    exit 1
fi

# Removing files older than 7 days
find "$BACKUP_DIR" -type f -name "*.sql.gz" -mtime +7 -delete