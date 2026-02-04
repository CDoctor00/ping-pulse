FROM alpine:3.23

RUN apk add --no-cache curl bash

ARG MIGRATE_VERSION=v4.17.0
RUN curl -L https://github.com/golang-migrate/migrate/releases/download/${MIGRATE_VERSION}/migrate.linux-amd64.tar.gz | tar xvz && \
    mv migrate /usr/local/bin/migrate && \
    chmod +x /usr/local/bin/migrate

WORKDIR / 

COPY ./migrations /migrations