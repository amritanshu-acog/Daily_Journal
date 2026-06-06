#!/usr/bin/env bash
# =============================================================================
# deploy.sh — Deploy / update Daily Journal on hpc2
# Usage:  ./deploy.sh
# =============================================================================
set -euo pipefail

# ── Config ────────────────────────────────────────────────────────────────────
APP_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
COMPOSE="docker compose"
SERVICE_APP="app"
SERVICE_NGINX="nginx"
IMAGE_TAG="daily-journal"

log()  { echo "[$(date '+%H:%M:%S')] $*"; }
fail() { echo "[ERROR] $*" >&2; exit 1; }

# ── Preflight checks ──────────────────────────────────────────────────────────
log "=== Daily Journal — Deploy ==="
cd "$APP_DIR"

command -v docker  >/dev/null || fail "docker not found"
command -v git     >/dev/null || fail "git not found"

# .env must exist (not in git — create it manually on first deploy)
if [[ ! -f ".env" ]]; then
  fail ".env not found. Create it with GOOGLE_GENERATIVE_AI_API_KEY=<your_key>"
fi

# SSL certs must be present
if [[ ! -f "/etc/ssl/aganitha/fullchain.pem" || ! -f "/etc/ssl/aganitha/privkey.pem" ]]; then
  fail "SSL certs not found at /etc/ssl/aganitha/. Place fullchain.pem and privkey.pem there."
fi

# ── Pull latest code ──────────────────────────────────────────────────────────
log "Pulling latest code from origin/master ..."
git fetch origin
git reset --hard origin/master
log "Now at: $(git log -1 --oneline)"

# ── Build new app image ───────────────────────────────────────────────────────
log "Building Docker image ..."
$COMPOSE build --no-cache "$SERVICE_APP"

# ── Rolling restart — zero downtime ──────────────────────────────────────────
log "Restarting app container ..."
$COMPOSE up -d --no-deps --force-recreate "$SERVICE_APP"

# Wait for the app healthcheck to pass before reloading nginx
log "Waiting for app to become healthy ..."
MAX_WAIT=60
WAITED=0
until $COMPOSE ps "$SERVICE_APP" | grep -q "healthy"; do
  sleep 3
  WAITED=$((WAITED + 3))
  if (( WAITED >= MAX_WAIT )); then
    fail "App did not become healthy within ${MAX_WAIT}s. Check: docker compose logs $SERVICE_APP"
  fi
  log "  ... waiting (${WAITED}s)"
done
log "App is healthy."

# ── Reload nginx (no downtime — nginx reload is graceful) ─────────────────────
log "Reloading nginx config ..."
if $COMPOSE ps "$SERVICE_NGINX" | grep -q "running"; then
  $COMPOSE exec "$SERVICE_NGINX" nginx -s reload
else
  $COMPOSE up -d --no-deps "$SERVICE_NGINX"
fi

# ── Cleanup old images ────────────────────────────────────────────────────────
log "Pruning dangling images ..."
docker image prune -f

# ── Done ──────────────────────────────────────────────────────────────────────
log "=== Deploy complete ==="
log "Site live at: https://journal.aganitha.ai"
$COMPOSE ps
