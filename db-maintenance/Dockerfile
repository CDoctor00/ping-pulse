FROM postgres:18.1-alpine3.23

# Install dependencies
RUN apk add --no-cache gzip bash dialog

# Copy scripts
COPY backup.sh /usr/local/bin/backup.sh
COPY restore.sh /usr/local/bin/restore.sh
COPY validate.sh /usr/local/bin/validate.sh
COPY tui.sh /usr/local/bin/tui.sh
COPY crontab /etc/crontabs/root

# Make scripts executable
RUN chmod +x /usr/local/bin/backup.sh \
    && chmod +x /usr/local/bin/restore.sh \
    && chmod +x /usr/local/bin/validate.sh \
    && chmod +x /usr/local/bin/tui.sh

# Create directories
RUN mkdir -p /backups/dumps \
    && mkdir -p /backups/logs

# Override postgres entrypoint
ENTRYPOINT []

# Start cron in foreground
CMD ["/usr/sbin/crond", "-f", "-l", "2"]