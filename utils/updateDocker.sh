#!/bin/bash

set -e
docker buildx build -t astro-web-browser -f Dockerfile .

set +e
docker stop WebBrowser
docker rm WebBrowser
docker run --name WebBrowser -d -t --restart unless-stopped -p 8080:8080 astro-web-browser