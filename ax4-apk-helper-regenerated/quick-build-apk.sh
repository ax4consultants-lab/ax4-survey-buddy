#!/usr/bin/env bash
set -euo pipefail

# ====== CONFIG ======
APP_URL="${APP_URL:-https://ax4-surveyor-app.netlify.app}"
APP_NAME="${APP_NAME:-AX4 Surveyor}"
PACKAGE_ID="${PACKAGE_ID:-au.com.ax4.surveyor}"

command -v node >/dev/null || { echo "Node is required. Install Node.js LTS and rerun."; exit 1; }
command -v npm  >/dev/null || { echo "npm is required. Install Node.js LTS and rerun."; exit 1; }

if ! command -v bubblewrap >/dev/null; then
  npm install -g @bubblewrap/cli
fi

mkdir -p twa && cd twa

if [ ! -f twa-manifest.json ]; then
  cat > twa-manifest.json <<JSON
{
  "appVersion": "1",
  "host": "${APP_URL}",
  "name": "${APP_NAME}",
  "packageId": "${PACKAGE_ID}",
  "launcherName": "${APP_NAME}",
  "display": "standalone",
  "fallbackType": "customtabs",
  "enableNotifications": false,
  "features": { "locationDelegation": true }
}
JSON
fi

bubblewrap init --manifest="${APP_URL}/manifest.webmanifest" --overwrite || true
bubblewrap build

echo "✅ Unsigned APK built:"
ls -lh ./app/build/outputs/apk/release/*.apk || true
