#!/bin/bash

# ===== CONFIGURATION =====
BACKUP_DIR="/backups/dumps"
LOG_DIR="/backups/logs"
DIALOG_HEIGHT=20
DIALOG_WIDTH=60

# ===== HELPERS =====

# Checks that all required env vars are set before doing anything
check_env() {
    local missing=0
    for var in DB_HOST DB_USER DB_NAME PGPASSWORD; do
        if [ -z "${!var}" ]; then
            echo "Missing environment variable: $var"
            missing=1
        fi
    done
    if [ "$missing" -eq 1 ]; then
        dialog --title "Configuration Error" \
               --msgbox "One or more required environment variables are missing.\nCheck your .env file and docker-compose configuration." \
               $DIALOG_HEIGHT $DIALOG_WIDTH
        clear
        exit 1
    fi
}

# Shows a message box with a title and a message
msgbox() {
    dialog --title "$1" --msgbox "$2" $DIALOG_HEIGHT $DIALOG_WIDTH
}

# Runs a command and streams its output inside a dialog infobox,
# then shows success or error based on exit code
run_with_output() {
    local title="$1"
    local cmd="$2"
    local tmp
    tmp=$(mktemp)

    # Run the command, tee output to temp file and show it via dialog progressbox
    bash -c "$cmd" 2>&1 | tee "$tmp" | dialog --title "$title" \
        --progressbox "Running..." $DIALOG_HEIGHT $DIALOG_WIDTH

    # Capture exit code from the command (not from dialog)
    local exit_code=${PIPESTATUS[0]}

    if [ "$exit_code" -eq 0 ]; then
        msgbox "$title" "✓ Operation completed successfully."
    else
        dialog --title "$title" \
               --msgbox "✗ Operation failed. Check the log for details." \
               $DIALOG_HEIGHT $DIALOG_WIDTH
    fi

    rm -f "$tmp"
    return "$exit_code"
}

# ===== ACTIONS =====

# Runs backup.sh and streams its output
action_backup() {
    run_with_output "Manual Backup" "/usr/local/bin/backup.sh"
}

# Lists available backups and lets the user pick one, then runs restore.sh
action_restore() {
    # Build the list of available backups for dialog's menu widget
    local files
    files=$(ls -t "$BACKUP_DIR"/backup_*.sql.gz 2>/dev/null)

    if [ -z "$files" ]; then
        msgbox "Restore" "No backup files found in $BACKUP_DIR."
        return
    fi

    # Build menu items: each entry is "filename  date_size"
    local menu_items=()
    while IFS= read -r f; do
        local name
        name=$(basename "$f")
        local info
        info=$(du -h "$f" | cut -f1)
        menu_items+=("$name" "$info")
    done <<< "$files"

    # Show the selection menu
    local selected
    selected=$(dialog --title "Restore — Select Backup" \
                      --menu "Choose a backup file to restore:" \
                      $DIALOG_HEIGHT $DIALOG_WIDTH 10 \
                      "${menu_items[@]}" \
                      3>&1 1>&2 2>&3) || return

    # Ask for confirmation before proceeding
    dialog --title "Restore — Confirm" \
           --yesno "⚠️  WARNING: This will DROP and RECREATE '$DB_NAME'.\n\nSelected: $selected\n\nAre you sure?" \
           $DIALOG_HEIGHT $DIALOG_WIDTH || return

    # Run restore in --force mode (confirmation already handled above)
    run_with_output "Restore" "/usr/local/bin/restore.sh --force $selected"
}

# Runs validate.sh and streams its output
action_validate() {
    run_with_output "Backup Validation" "/usr/local/bin/validate.sh"
}

# Shows a submenu to pick which log file to view
action_logs() {
    local log_choice
    log_choice=$(dialog --title "View Logs" \
                        --menu "Choose a log file to view:" \
                        $DIALOG_HEIGHT $DIALOG_WIDTH 6 \
                        "backup"     "backup.log" \
                        "backup_err" "backup_error.log" \
                        "restore"    "restore.log" \
                        "validation" "backup_validation.log" \
                        "cron"       "cron.log" \
                        3>&1 1>&2 2>&3) || return

    # Map choice to actual file
    local log_file
    case "$log_choice" in
        backup)     log_file="$LOG_DIR/backup.log" ;;
        backup_err) log_file="$LOG_DIR/backup_error.log" ;;
        restore)    log_file="$LOG_DIR/restore.log" ;;
        validation) log_file="$LOG_DIR/backup_validation.log" ;;
        cron)       log_file="$LOG_DIR/cron.log" ;;
    esac

    if [ ! -f "$log_file" ] || [ ! -s "$log_file" ]; then
        msgbox "View Logs" "Log file is empty or does not exist yet:\n$log_file"
        return
    fi

    # Show log content in a scrollable textbox
    dialog --title "Log: $(basename "$log_file")" \
           --textbox "$log_file" \
           $DIALOG_HEIGHT $DIALOG_WIDTH
}

# ===== MAIN MENU LOOP =====
main_menu() {
    while true; do
        local choice
        choice=$(dialog --title "PingPulse — DB Maintenance" \
                        --cancel-label "Exit" \
                        --menu "Select an operation:" \
                        $DIALOG_HEIGHT $DIALOG_WIDTH 5 \
                        "1" "Run Manual Backup" \
                        "2" "Restore from Backup" \
                        "3" "Validate Latest Backup" \
                        "4" "View Logs" \
                        3>&1 1>&2 2>&3)

        # Exit code 1 means the user pressed "Exit"
        local exit_code=$?
        if [ "$exit_code" -ne 0 ]; then
            clear
            exit 0
        fi

        case "$choice" in
            1) action_backup ;;
            2) action_restore ;;
            3) action_validate ;;
            4) action_logs ;;
        esac
    done
}

# ===== ENTRY POINT =====
check_env
main_menu