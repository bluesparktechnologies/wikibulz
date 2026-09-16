#!/usr/bin/env bash
set -Eeuo pipefail

release_id="${1:?release id is required}"
archive="${2:?archive path is required}"
app_root="/opt/dite"
app_dir="$app_root/app"
release_root="$app_root/releases"
release_dir="$release_root/$release_id"
current_link="$app_root/current"
service_name="dite-web"

test -f "$archive"
test -f "$app_dir/.env"
test -n "$release_id"
mkdir -p "$release_root"

previous=""
if [ -e "$current_link" ] || [ -L "$current_link" ]; then
  previous="$(readlink -f "$current_link")"
fi

if [ ! -e "$current_link" ] && [ ! -L "$current_link" ]; then
  initial_dir="$release_root/manual-initial"
  if [ ! -e "$initial_dir" ]; then
    cp -a "$app_dir" "$initial_dir"
  fi
  ln -s "$initial_dir" "$current_link"
  previous="$initial_dir"
fi

if [ -e "$release_dir" ]; then
  echo "Release already exists: $release_id"
  exit 1
fi

mkdir -p "$release_dir"
tar -xzf "$archive" -C "$release_dir"
cp "$app_dir/.env" "$release_dir/.env"
chmod 600 "$release_dir/.env"

cd "$release_dir"
node "$release_dir/deploy/sync-editorial-mailbox.mjs" "$release_dir/.env"
npm ci --omit=dev --no-audit --no-fund

sudo tee "/etc/systemd/system/$service_name.service" >/dev/null <<'UNIT'
[Unit]
Description=WikiBulz Next.js web
After=network-online.target mongod.service
Wants=network-online.target

[Service]
Type=simple
User=aradhysharmably
WorkingDirectory=/opt/dite/current
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start -- -p 3001 -H 127.0.0.1
Restart=always
RestartSec=5
KillSignal=SIGINT
NoNewPrivileges=true
PrivateTmp=true

[Install]
WantedBy=multi-user.target
UNIT

sudo systemctl daemon-reload
ln -s "$release_dir" "$current_link.next"
mv -Tf "$current_link.next" "$current_link"
sudo systemctl restart "$service_name"

healthy=false
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:3001/ >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [ "$healthy" != true ]; then
  echo "Health check failed; restoring previous release."
  if [ -n "$previous" ] && [ -e "$previous" ]; then
    ln -s "$previous" "$current_link.rollback"
    mv -Tf "$current_link.rollback" "$current_link"
    sudo systemctl restart "$service_name"
  fi
  sudo journalctl -u "$service_name" -n 80 --no-pager || true
  exit 1
fi

rm -f "$archive"
echo "Deployment healthy: $release_id"
