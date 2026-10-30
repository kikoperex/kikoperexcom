#!/usr/bin/env bash
#
# Despliega el sitio en producción vía rsync.
#
#   ./deploy.sh            # despliega
#   ./deploy.sh --dry-run  # muestra qué cambiaría, sin tocar nada
#
# Producción: nginx:alpine en Podman (contenedor web-kikoperex, puerto 8080)
# con Cloudflare Tunnel delante. El webroot es un bind mount de solo lectura,
# así que no hace falta recargar nginx: los archivos estáticos se sirven al
# instante.

set -euo pipefail

HOST="${DEPLOY_HOST:-kikoperex@192.168.1.71}"
REMOTE_DIR="${DEPLOY_PATH:-/mnt/ironwolf/kikoperexcom/data}"
SITE_URL="${SITE_URL:-https://kikoperex.com/}"

cd "$(dirname "$0")"

DRY_RUN=()
if [[ "${1:-}" == "--dry-run" ]]; then
    DRY_RUN=(--dry-run)
    echo "Modo dry-run: no se modificará nada."
fi

if [[ -n "$(git status --porcelain)" ]]; then
    echo "ERROR: hay cambios sin commitear. Commitea antes de desplegar." >&2
    exit 1
fi

REV="$(git rev-parse --short HEAD)"
echo "Desplegando $REV en $HOST:$REMOTE_DIR"

# --delete borra en el servidor lo que ya no exista en el repo, pero los
# archivos excluidos quedan protegidos.
rsync -az --delete --itemize-changes "${DRY_RUN[@]}" \
    --exclude='.git/' \
    --exclude='.gitignore' \
    --exclude='deploy.sh' \
    --exclude='docker-compose.yaml' \
    --exclude='README.md' \
    ./ "$HOST:$REMOTE_DIR/"

if (( ${#DRY_RUN[@]} )); then
    exit 0
fi

LOCAL_HASH="$(sha256sum index.html | cut -d' ' -f1)"
REMOTE_HASH="$(ssh "$HOST" "sha256sum '$REMOTE_DIR/index.html'" | cut -d' ' -f1)"
if [[ "$LOCAL_HASH" != "$REMOTE_HASH" ]]; then
    echo "ERROR: el index.html remoto no coincide con el local." >&2
    exit 1
fi
echo "Archivos sincronizados (index.html $LOCAL_HASH)."

HTTP_HASH="$(curl -fsS --max-time 15 -H 'Cache-Control: no-cache' "$SITE_URL" | sha256sum | cut -d' ' -f1)"
if [[ "$HTTP_HASH" == "$LOCAL_HASH" ]]; then
    echo "Verificación HTTP correcta."
else
    echo "Aviso: la respuesta HTTP aún no coincide (posible caché de Cloudflare)."
fi

echo "Deploy de $REV completado."
