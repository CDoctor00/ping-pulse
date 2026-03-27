#!/bin/bash
set -eo pipefail

# ===== CONFIGURATION =====
BACKUP_DIR="/backups/dumps"
LOG_FILE="/backups/logs/restore.log"

# ===== FUNCTIONS =====
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

error() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1" | tee -a "$LOG_FILE" >&2
}

usage() {
    echo "Usage: $0 [backup_file.sql.gz]"
    echo ""
    echo "Examples:"
    echo "  $0                              # Restore latest backup"
    echo "  $0 backup_20250115_120000.sql.gz  # Restore specific backup"
    echo ""
    echo "Available backups:"
    ls -lht "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -n 10 || echo "  No backups found"
    exit 1
}

# ===== ARGUMENT PARSING =====
if [ "$1" == "-h" ] || [ "$1" == "--help" ]; then
    usage
fi

FORCE=0
if [ "$1" == "--force" ]; then
    FORCE=1
    shift
fi

if [ -n "$1" ]; then
    if [[ "$1" == /* ]]; then
        BACKUP_FILE="$1"
    else
        BACKUP_FILE="$BACKUP_DIR/$1"
    fi
else
    BACKUP_FILE=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null | head -n 1)
    if [ -z "$BACKUP_FILE" ]; then
        error "No backup files found in $BACKUP_DIR"
        usage
    fi
fi

# ===== VALIDATION =====
if [ ! -f "$BACKUP_FILE" ]; then
    error "Backup file not found: $BACKUP_FILE"
    usage
fi

log "Selected backup: $BACKUP_FILE"
echo "" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo " SESSION $(date +'%Y-%m-%d %H:%M:%S')" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
log "Selected backup: $BACKUP_FILE"
log "File size: $(du -h "$BACKUP_FILE" | cut -f1)"

# Verify gzip integrity
log "Verifying backup integrity..."
if ! gzip -t "$BACKUP_FILE" 2>/dev/null; then
    error "Backup file is corrupted (gzip test failed)"
    exit 1
fi
log "Backup integrity verified ✓"

# ===== CONFIRMATION =====
if [ "$FORCE" -eq 0 ]; then
    echo ""
    echo "⚠️  WARNING: This will DROP and RECREATE the database '$DB_NAME'"
    echo ""
    read -p "Are you sure you want to continue? (yes/no): " CONFIRM
    if [ "$CONFIRM" != "yes" ]; then
        log "Restore cancelled by user"
        exit 0
    fi
else
    log "Running in --force mode, skipping confirmation"
fi

# ===== DATABASE CONNECTION CHECK =====
log "Checking database connection..."
if ! pg_isready -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d postgres -q; then
    error "Database server not ready"
    exit 1
fi
log "Database connection OK ✓"

# ===== RESTORE PROCESS =====
log "Starting restore process..."

# Terminate existing connections to the database
log "Terminating existing connections..."
psql -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d postgres -c "
    SELECT pg_terminate_backend(pg_stat_activity.pid)
    FROM pg_stat_activity
    WHERE pg_stat_activity.datname = '$DB_NAME'
      AND pid <> pg_backend_pid();
" > /dev/null 2>&1 || true

# Drop database
log "Dropping database '$DB_NAME'..."
dropdb -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" --if-exists "$DB_NAME"

# Create database
log "Creating database '$DB_NAME'..."
createdb -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" "$DB_NAME"

# Restore backup
log "Restoring backup..."
if gunzip -c "$BACKUP_FILE" | psql -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -1 --set ON_ERROR_STOP=1 >> "$LOG_FILE" 2>&1; then
    log "✓ Restore completed successfully"

    # Verify restore
    TABLE_COUNT=$(psql -h "${DB_HOST:-database}" -p "${DB_PORT:-5432}" -U "$DB_USER" -d "$DB_NAME" -t -c "
        SELECT COUNT(*) FROM information_schema.tables
        WHERE table_schema = 'public';
    " | xargs)

    log "Database contains $TABLE_COUNT tables"

else
    error "Restore failed - check log for details"
    exit 1
fi

log "Restore process completed"