#!/bin/bash

podman stop nginx || true

podman rm nginx || true

podman build -t nginx-k .

podman run --name nginx -p 80:80 -d nginx-k

echo "Hecho"
