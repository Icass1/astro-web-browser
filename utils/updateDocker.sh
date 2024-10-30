#!/bin/bash

# export ASTRO_DATABASE_FILE=/home/icass/astro-web-browser/production_database.db

set -e
docker buildx build -t astro-web-browser -f Dockerfile .

set +e
docker stop WebBrowser
docker rm WebBrowser
docker run --name WebBrowser -d -t --restart unless-stopped -p 8081:4321 -v /home/icass/HomeDrive/root:/mnt/main -v /home/icass/HomeDrive/files2database:/usr/src/app/database astro-web-browser