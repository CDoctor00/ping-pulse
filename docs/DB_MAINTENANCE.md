# 🔄 Database Backup & Recovery System

This document outlines the automated backup strategy and manual recovery procedures for the PingPulse PostgreSQL database. The backup system ensures data persistence and provides disaster recovery capabilities through scheduled backups, automated validation, and streamlined restore processes.

---

## 📋 Overview

The backup system operates as a dedicated Docker container (`db-maintenance`) that executes periodic full database dumps, validates their integrity, and maintains a retention policy to balance storage usage with recovery options.

### Key Features

- **Automated Daily Backups**: Scheduled via cron at 02:00
- **Integrity Validation**: Automatic post-backup verification at 03:00
- **Compression**: gzip compression to minimize storage footprint
- **Retention Policy**: Configurable retention (default: 30 days or 50 backups maximum)
- **Bind Mount Storage**: Direct host access to backup files via `./backups/` directory
- **Atomic Dumps**: Full database dumps ensuring consistent snapshots
- **Atomic Restore**: Restore wrapped in a single PostgreSQL transaction with automatic rollback on error
- **Interactive TUI**: Terminal User Interface for manual operations via `docker exec`
- **Session Separators**: Log files include session separators for easier readability

### Backup Storage

Backups and logs are stored in the **host filesystem** at `./backups/` (relative to `docker-compose.yml` location) using a bind mount, organized in two subdirectories:

```
backups/
├── dumps/    # Compressed SQL dump files (.sql.gz)
└── logs/     # All log files
```

This provides:

- ✅ Direct access from the host without `docker cp` commands
- ✅ Easy integration with external backup solutions (rsync, rclone, NAS)
- ✅ Persistence independent of Docker volume lifecycle
- ✅ Log persistence across container restarts and removals

**File Naming Convention**: `backup_YYYYMMDD_HHMMSS.sql.gz`

**Example**: `backup_20250115_020000.sql.gz` (backup created on 2025-01-15 at 02:00:00)

---

## 🤖 Automated Processes

### 1. Scheduled Backup (Daily at 02:00)

**Cron Schedule**: `0 2 * * *`

**Process Flow**:

1. **Database Health Check**
   - Executes `pg_isready` to verify database connectivity
   - Aborts if database is unreachable
2. **Backup Execution**
   - Runs `pg_dump` with `--no-owner` and `--no-acl` flags to ensure portability across different database users
   - Pipes output through `gzip` for compression
   - Saves to `/backups/dumps/backup_YYYYMMDD_HHMMSS.sql.gz`
3. **Integrity Verification**
   - Checks file exists and is not empty (size > 0 bytes)
   - Validates gzip compression integrity (`gzip -t`)
   - Removes corrupted backups automatically
4. **Logging**
   - A session separator is written at the start of each execution for easier log reading
   - Success: Logs file path and size to `/backups/logs/backup.log`
   - Failure: Logs error details to `/backups/logs/backup_error.log`
   - Sets file permissions to `644` (read-only for non-owners)
5. **Retention Policy Application**
   - Deletes backups older than `BACKUP_RETENTION_DAYS`
   - Removes oldest backups if count exceeds `BACKUP_MAX_COUNT`
   - Logs number of deleted files

**Expected Duration**: ~10-60 seconds (depending on database size)

**Success Indicators**:

- Backup file appears in `./backups/dumps/` directory
- File size is reasonable (e.g., > 1 KB for non-empty database)
- No errors in `/backups/logs/backup_error.log`

---

### 2. Automated Validation (Daily at 03:00)

**Cron Schedule**: `0 3 * * *`

**Process Flow**:

1. **Latest Backup Selection**
   - Identifies most recent `backup_*.sql.gz` file in `/backups/dumps/`
2. **File Size Check**
   - Verifies file size > 1 KB (prevents empty backups)
3. **Gzip Integrity Test**
   - Executes `gzip -t` to validate compression
4. **SQL Format Verification**
   - Extracts first 50 lines of SQL dump
   - Confirms presence of PostgreSQL dump header
5. **Age Check**
   - Ensures latest backup is < 25 hours old (allows 1-hour grace period)
6. **Result Logging**
   - A session separator is written at the start of each execution
   - Success: Logs "All validation checks passed" to `/backups/logs/backup_validation.log`
   - Failure: Logs specific failure reason and exits with error code

**Failure Response**: If validation fails, manual intervention is required. Check logs:

```bash
cat ./backups/logs/backup_validation.log
```

---

### 3. Log Rotation (Weekly, Sunday at 04:00)

**Cron Schedule**: `0 4 * * 0`

**Process**: Truncates all `.log` files in `/backups/logs/` to prevent disk space exhaustion while preserving log file structure for cron to continue writing.

---

## 🖥️ Interactive TUI

The `db-maintenance` container includes an interactive Terminal User Interface (TUI) for performing manual operations without needing to remember individual commands.

### Opening the TUI

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/tui.sh
```

### Available Operations

| Option                        | Description                                                           |
| ----------------------------- | --------------------------------------------------------------------- |
| **1. Run Manual Backup**      | Executes `backup.sh` and streams output in real time                  |
| **2. Restore from Backup**    | Shows a selectable list of available backups with confirmation prompt |
| **3. Validate Latest Backup** | Executes `validate.sh` and shows the result                           |
| **4. View Logs**              | Submenu to browse any log file in a scrollable viewer                 |
| **Exit**                      | Closes the TUI and returns to the host shell                          |

---

## 🛠️ Manual Operations (CLI)

### Viewing Available Backups

**From Host**:

```bash
ls -lht ./backups/dumps/
```

**From Container**:

```bash
docker exec pingpulse_db_maintenance ls -lht /backups/dumps/
```

**Expected Output**:

```
-rw-r--r-- 1 root root  2.3M Jan 15 02:00 backup_20250115_020000.sql.gz
-rw-r--r-- 1 root root  2.2M Jan 14 02:00 backup_20250114_020000.sql.gz
-rw-r--r-- 1 root root  2.1M Jan 13 02:00 backup_20250113_020000.sql.gz
```

---

### Manual Backup Creation

**Use Case**: Create an immediate backup before risky operations (e.g., major migrations, manual data modifications).

**Command**:

```bash
docker exec pingpulse_db_maintenance /usr/local/bin/backup.sh
```

**Expected Output**:

```
[2025-01-15 14:30:45] Starting backup...
[2025-01-15 14:30:46] Backup completed successfully: /backups/dumps/backup_20250115_143045.sql.gz (Size: 2.3M)
[2025-01-15 14:30:46] Applying retention policy (30 days, max 50 files)...
[2025-01-15 14:30:46] Backup process completed. Total backups: 8
```

**Verification**:

```bash
ls -lh ./backups/dumps/backup_$(date +%Y%m%d)*.sql.gz
```

---

### Manual Backup Validation

**Command**:

```bash
docker exec pingpulse_db_maintenance /usr/local/bin/validate.sh
```

**Expected Output**:

```
[2025-01-15 14:35:12] Starting backup validation...
[2025-01-15 14:35:12] Validating: /backups/dumps/backup_20250115_143045.sql.gz
[2025-01-15 14:35:12] ✓ File size OK: 2.3M
[2025-01-15 14:35:13] ✓ Gzip integrity OK
[2025-01-15 14:35:13] Checking SQL content...
[2025-01-15 14:35:13] ✓ SQL format OK
[2025-01-15 14:35:13] ✓ Backup age OK: 0 hours
[2025-01-15 14:35:13] ✓ All validation checks passed
```

---

## 🔄 Database Restore Procedure

### ⚠️ Critical Pre-Restore Checklist

Before initiating a restore, ensure:

1. **System is in Maintenance Mode**
   - Stop all services that write to the database
   - Notify users of potential downtime

2. **Backup the Current State** (Safety Net)
   - Even if the database is corrupted, create a final backup
   - This provides a rollback point if the restore fails

3. **Verify Restore Source**
   - Confirm the backup file exists and is valid
   - Check backup age matches intended restore point

---

### Step-by-Step Restore Process

#### **Step 1: Stop All PingPulse Services**

Stop services that interact with the database to prevent data conflicts:

```bash
docker compose stop pinger server notifier
```

**Verification**:

```bash
docker compose ps
# pinger, server, notifier should show "exited"
# database and db-maintenance should remain "running"
```

---

#### **Step 2: Create Safety Backup (Optional but Recommended)**

Even if restoring due to corruption, create a final backup of the current state:

```bash
docker exec pingpulse_db_maintenance /usr/local/bin/backup.sh
```

This creates a timestamped backup you can reference if needed. **Note the timestamp** for later reference.

---

#### **Step 3: List Available Backups**

View available restore points:

```bash
docker exec pingpulse_db_maintenance ls -lht /backups/dumps/
```

**Output Example**:

```
-rw-r--r-- 1 root root  2.3M Jan 15 14:45 backup_20250115_144500.sql.gz  ← Safety backup (just created)
-rw-r--r-- 1 root root  2.3M Jan 15 02:00 backup_20250115_020000.sql.gz  ← Latest scheduled backup
-rw-r--r-- 1 root root  2.2M Jan 14 02:00 backup_20250114_020000.sql.gz
-rw-r--r-- 1 root root  2.1M Jan 13 02:00 backup_20250113_020000.sql.gz
```

**Select the appropriate backup** based on:

- **Latest scheduled backup**: `backup_20250115_020000.sql.gz` (most recent automated backup)
- **Specific point in time**: Choose a dated backup if recovering from a known issue
- **Pre-incident backup**: If you know when the problem started

---

#### **Step 4: Execute Database Restore**

**Option A: Via TUI (Recommended)**

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/tui.sh
```

Select **"2. Restore from Backup"** and choose the desired backup from the list.

**Option B: Restore Latest Backup (CLI)**

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/restore.sh
```

**Option C: Restore Specific Backup (CLI)**

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/restore.sh backup_20250114_020000.sql.gz
```

**Option D: Restore without confirmation prompt (automated/scripted use)**

```bash
docker exec -it pingpulse_db_maintenance /usr/local/bin/restore.sh --force
```

---

#### **Step 5: Restore Confirmation Prompt**

> **Note**: This step is skipped when using `--force` or the TUI (which handles confirmation internally).

The restore script will display:

```
Selected backup: /backups/dumps/backup_20250115_020000.sql.gz
File size: 2.3M
Verifying backup integrity...
Backup integrity verified ✓

⚠️  WARNING: This will DROP and RECREATE the database 'pingpulse_db'

Are you sure you want to continue? (yes/no):
```

**Type exactly**: `yes` (lowercase, full word)

**Any other input** (including `y`, `Yes`, `YES`) will **abort** the restore.

---

#### **Step 6: Restore Process Execution**

The script wraps the entire restore in a **single PostgreSQL transaction**. If any error occurs during import, the transaction is automatically rolled back and the database is left untouched.

The script will execute the following steps automatically:

1. **Terminate Active Connections**

   ```
   Terminating existing connections...
   ```

2. **Drop Existing Database**

   ```
   Dropping database 'pingpulse_db'...
   ```

3. **Create Fresh Database**

   ```
   Creating database 'pingpulse_db'...
   ```

4. **Import Backup Data** (atomic transaction)

   ```
   Restoring backup...
   ```

5. **Verify Restore**
   ```
   ✓ Restore completed successfully
   Database contains 12 tables
   ```

**Expected Duration**: 10-120 seconds (depending on backup size)

---

#### **Step 7: Verify Database State**

**Check Table Count**:

```bash
docker exec pingpulse_db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';"
```

**Expected Output**:

```
 count
-------
    12
(1 row)
```

**Check Critical Tables**:

```bash
docker exec pingpulse_db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "
  SELECT table_name
  FROM information_schema.tables
  WHERE table_schema = 'ping_pulse'
  ORDER BY table_name;
"
```

**Expected Output**:

```
    table_name
------------------
 alarms
 configs
 hosts
 schema_migrations
 ...
```

**Verify Record Counts**:

```bash
docker exec pingpulse_db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM ping_pulse.hosts;"
docker exec pingpulse_db psql -U $POSTGRES_USER -d $POSTGRES_DB -c "SELECT COUNT(*) FROM ping_pulse.alarms;"
```

---

#### **Step 8: Restart PingPulse Services**

Once database restore is verified, restart application services:

```bash
docker compose start pinger server notifier
```

**Verification**:

```bash
docker compose ps
# All services should show "running"
```

**Check Service Logs** for successful startup:

```bash
docker compose logs -f pinger
docker compose logs -f server
docker compose logs -f notifier
```

**Expected Indicators**:

- No connection errors to database
- Services initialize configuration from database
- Pinger resumes ping routines
- Server API responds to requests

---

#### **Step 9: Functional Testing**

**Test Critical Functionality**:

1. **Frontend Access**
   - Navigate to the dashboard
   - Verify hosts are displayed
   - Check network topology graph renders correctly

2. **API Health Check**

   ```bash
   curl http://localhost:8080/api/health
   ```

3. **Database Connectivity**
   - Verify hosts list loads
   - Check alarms history is accessible
   - Confirm settings page displays configuration

4. **Monitoring Core**
   - Observe ping execution in logs
   - Verify host status updates
   - Check alarm generation (if applicable)

---

### Rollback Procedure (If Restore Fails)

Thanks to the atomic transaction, if the restore fails the database is automatically left in its previous state. However, if needed:

1. **Identify the Safety Backup** (created in Step 2):

   ```bash
   docker exec pingpulse_db_maintenance ls -lht /backups/dumps/ | grep $(date +%Y%m%d)
   ```

2. **Restore from Safety Backup**:

   ```bash
   docker exec -it pingpulse_db_maintenance /usr/local/bin/restore.sh backup_20250115_144500.sql.gz
   ```

3. **Restart Services**:
   ```bash
   docker compose restart pinger server notifier
   ```

---

## 📊 Monitoring & Troubleshooting

### Log Files

All logs are stored in `./backups/logs/` on the host and can be accessed directly or via the container:

```bash
# Backup execution log
cat ./backups/logs/backup.log

# Backup errors
cat ./backups/logs/backup_error.log

# Validation log
cat ./backups/logs/backup_validation.log

# Restore log
cat ./backups/logs/restore.log

# Cron execution log
cat ./backups/logs/cron.log
```

Each log file includes **session separators** to clearly delimit individual executions:

```
========================================
 SESSION 2025-01-15 02:00:01
========================================
[2025-01-15 02:00:01] Starting backup...
...
```

---

### Common Issues

#### **Issue: Backup File is Empty (0 bytes)**

**Symptoms**:

- Backup file exists but size is 0 KB
- Validation fails with "Backup file too small"

**Causes**:

- `pg_dump` failed but script didn't catch the error
- Database connection lost mid-dump

**Resolution**:

1. Check database connectivity:
   ```bash
   docker exec pingpulse_db_maintenance pg_isready -h database -U $DB_USER -d $DB_NAME
   ```
2. Review error log:
   ```bash
   cat ./backups/logs/backup_error.log
   ```
3. Manually trigger backup:
   ```bash
   docker exec pingpulse_db_maintenance /usr/local/bin/backup.sh
   ```

---

#### **Issue: Gzip Corruption**

**Symptoms**:

- Validation fails with "gzip integrity check failed"
- Cannot decompress backup file

**Causes**:

- Disk full during backup
- Interrupted write operation
- Storage hardware failure

**Resolution**:

1. Check disk space:
   ```bash
   df -h ./backups
   ```
2. Delete corrupted backup:
   ```bash
   rm ./backups/dumps/backup_YYYYMMDD_HHMMSS.sql.gz
   ```
3. Create new backup:
   ```bash
   docker exec pingpulse_db_maintenance /usr/local/bin/backup.sh
   ```

---

#### **Issue: Restore Fails with "Database in Use"**

**Symptoms**:

- Restore script fails at "Dropping database" step
- Error message: "database is being accessed by other users"

**Causes**:

- Application services still connected to database

**Resolution**:

1. Ensure all services are stopped:
   ```bash
   docker compose stop pinger server notifier
   ```
2. Force-terminate database connections:
   ```bash
   docker exec pingpulse_db psql -U $POSTGRES_USER -d postgres -c "
     SELECT pg_terminate_backend(pg_stat_activity.pid)
     FROM pg_stat_activity
     WHERE pg_stat_activity.datname = '$POSTGRES_DB'
       AND pid <> pg_backend_pid();
   "
   ```
3. Re-run restore:
   ```bash
   docker exec -it pingpulse_db_maintenance /usr/local/bin/restore.sh
   ```

---

#### **Issue: No Backups Available**

**Symptoms**:

- `./backups/dumps/` directory is empty
- Validation fails with "No backup files found"

**Causes**:

- Backup container never successfully completed a backup
- Retention policy deleted all backups (misconfigured retention days)
- Bind mount path incorrect

**Resolution**:

1. Verify bind mount:

   ```bash
   docker inspect pingpulse_db_maintenance | grep -A 5 Mounts
   ```

   Ensure `/backups` maps to `./backups` on host

2. Check backup logs:

   ```bash
   cat ./backups/logs/backup_error.log
   ```

3. Manually trigger backup:

   ```bash
   docker exec pingpulse_db_maintenance /usr/local/bin/backup.sh
   ```

4. Review retention configuration:
   ```bash
   docker exec pingpulse_db_maintenance env | grep BACKUP_RETENTION
   ```

---

## 🔐 Security Considerations

### Backup File Permissions

Backup files are created with `644` permissions (readable by owner and group, not writable by group/others). This prevents accidental modification while allowing read access for recovery tools.

### Sensitive Data

Database backups contain **all data**, including:

- Host configurations
- Alarm history
- User notification preferences
- Potentially sensitive network topology information

**Recommendations**:

- Store backups in secure locations with restricted access
- Consider encrypting backups if storing on untrusted media
- Implement access controls on the `./backups/` directory

**Example Encryption** (manual, if needed):

```bash
gpg --symmetric --cipher-algo AES256 ./backups/dumps/backup_20250115_020000.sql.gz
```
