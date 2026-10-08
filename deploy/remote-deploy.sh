#!/usr/bin/env bash
set -Eeuo pipefail

release_id="${1:?release id is required}"
archive="${2:?archive path is required}"
app_root="/opt/wikibulz"
env_file="$app_root/app/.env"
release_root="$app_root/releases"
release_dir="$release_root/$release_id"
current_link="$app_root/current"
compose_project="wikibulz"

test -f "$archive"
test -f "$env_file"
mkdir -p "$release_root"

previous=""
if [ -e "$current_link" ] || [ -L "$current_link" ]; then
  previous="$(readlink -f "$current_link")"
fi
if [ -z "$previous" ] && [ -d "$app_root/app/source" ]; then
  previous="$app_root/app/source"
fi

if [ -e "$release_dir" ]; then
  echo "Release already exists: $release_id"
  exit 1
fi

mkdir -p "$release_dir"
tar -xzf "$archive" -C "$release_dir"
cp "$env_file" "$release_dir/.env"
chmod 600 "$release_dir/.env"

sed -i \
  's#"3000:3000"#"127.0.0.1:3002:3000"#; s#"27017:27017"#"127.0.0.1:27017:27017"#; s#"6379:6379"#"127.0.0.1:6379:6379"#' \
  "$release_dir/docker-compose.yml"
sed -i \
  's#^MONGODB_URI=.*#MONGODB_URI=mongodb://mongodb:27017/wikibulz#; s#^REDIS_URL=.*#REDIS_URL=redis://redis:6379#; s#^SITE_URL=.*#SITE_URL=https://wikibulz.com#' \
  "$release_dir/.env"

cd "$release_dir"
docker compose -p "$compose_project" up -d --build --remove-orphans
ln -sfn "$release_dir" "$current_link"

healthy=false
for _ in $(seq 1 30); do
  if curl -fsS --max-time 5 http://127.0.0.1:3002/api/health >/dev/null; then
    healthy=true
    break
  fi
  sleep 2
done

if [ "$healthy" != true ]; then
  echo "Health check failed; restoring previous release."
  if [ -n "$previous" ] && [ -d "$previous" ]; then
    cd "$previous"
    docker compose -p "$compose_project" up -d --build --remove-orphans || true
    ln -sfn "$previous" "$current_link"
  fi
  docker compose -p "$compose_project" logs --tail 100 nextjs || true
  exit 1
fi

# Nginx otherwise rejects images above its default 1MB before Next.js sees them.
if command -v nginx >/dev/null 2>&1; then
  nginx_admin=()
  if [ "$(id -u)" -ne 0 ]; then
    nginx_admin=(sudo -n)
  fi
  upload_config="/etc/nginx/conf.d/wikibulz-upload-limit.conf"
  previous_config="$(mktemp)"
  had_upload_config=false
  if "${nginx_admin[@]}" test -f "$upload_config"; then
    had_upload_config=true
    "${nginx_admin[@]}" cp "$upload_config" "$previous_config"
  fi
  printf 'client_max_body_size 12m;\n' | "${nginx_admin[@]}" tee "$upload_config" >/dev/null
  if ! "${nginx_admin[@]}" nginx -t; then
    if [ "$had_upload_config" = true ]; then
      "${nginx_admin[@]}" cp "$previous_config" "$upload_config"
    else
      "${nginx_admin[@]}" rm -f "$upload_config"
    fi
    rm -f "$previous_config"
    exit 1
  fi
  "${nginx_admin[@]}" systemctl reload nginx
  rm -f "$previous_config"
  upload_probe="$(mktemp)"
  head -c 2097152 /dev/zero > "$upload_probe"
  upload_status="$(curl -sS --max-time 20 -o /dev/null -w '%{http_code}' \
    -H 'Accept: application/json' -F "file=@$upload_probe" \
    https://wikibulz.com/control-room/api/media)"
  rm -f "$upload_probe"
  # No session: reaching the application should redirect to login, never return 413.
  if [ "$upload_status" != "303" ] && [ "$upload_status" != "307" ] && [ "$upload_status" != "401" ]; then
    echo "Upload smoke check failed: HTTP $upload_status"
    exit 1
  fi
fi

rm -f "$archive"
echo "Deployment healthy: $release_id"
