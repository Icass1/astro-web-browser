#!/bin/bash

# export ASTRO_DATABASE_FILE=/home/icass/astro-web-browser/production_database.db

set -e
docker buildx build -t astro-web-browser -f Dockerfile .

set +e
docker stop WebBrowser
docker rm WebBrowser
docker run --name WebBrowser -d -t --restart unless-stopped -p 8081:4321 -v /home/icass/HomeDrive/root:/mnt/main -v /home/icass/HomeDrive/files2database:/usr/src/app/database astro-web-browser

# Get the directory where the script is located
SCRIPT_DIR="$(dirname "$0")"

# Define the log file in the same directory as the script
LOG_FILE="$SCRIPT_DIR/../builds.log"

# Get the current date
DATE=$(date +"%Y-%m-%d %H:%M:%S")

# Get the current Git commit hash
COMMIT_HASH=$(git rev-parse HEAD)

# Append date and commit hash to the log file
echo "$DATE - Commit: $COMMIT_HASH" >> "$LOG_FILE"