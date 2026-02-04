FROM postgres:18.1-alpine3.23

RUN apk add --no-cache dcron gzip

COPY backup.sh /usr/local/bin/backup.sh
COPY crontab /etc/crontabs/root

RUN chmod +x /usr/local/bin/backup.sh

RUN mkdir /backups && touch /var/log/cron.log

CMD ["crond", "-f", "-l", "2"]