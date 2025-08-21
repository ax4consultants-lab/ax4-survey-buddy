#!/usr/bin/env bash
set -euo pipefail

APP_URL="${APP_URL:-https://ax4-surveyor-app.netlify.app}"
APP_NAME="${APP_NAME:-AX4 Surveyor}"
PACKAGE_ID="${PACKAGE_ID:-au.com.ax4.surveyor}"

KEYSTORE_FILE="${KEYSTORE_FILE:-ax4-upload-keystore.jks}"
KEY_ALIAS="${KEY_ALIAS:-ax4}"
KEYSTORE_PASS="${KEYSTORE_PASS:-changeit}"
KEY_PASS="${KEY_PASS:-$KEYSTORE_PASS}"

command -v keytool >/dev/null || { echo "keytool (from Java JDK) is required."; exit 1; }
command -v node >/dev/null   || { echo "Node is required."; exit 1; }
command -v npm  >/dev/null   || { echo "npm is required."; exit 1; }

if ! command -v bubblewrap >/dev/null; then
  npm install -g @bubblewrap/cli
fi

mkdir -p twa && cd twa

[ -f twa-manifest.json ] || cat > twa-manifest.json <<JSON
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

bubblewrap init --manifest="${APP_URL}/manifest.webmanifest" --overwrite || true

if [ ! -f "${KEYSTORE_FILE}" ]; then
  keytool -genkeypair -v     -keystore "${KEYSTORE_FILE}" -storepass "${KEYSTORE_PASS}"     -keypass "${KEY_PASS}" -alias "${KEY_ALIAS}"     -keyalg RSA -keysize 2048 -validity 36500     -dname "CN=AX4, OU=Engineering, O=AX4, L=Adelaide, S=SA, C=AU"
fi

bubblewrap build --signingKeyPath "${KEYSTORE_FILE}" --signingKeyAlias "${KEY_ALIAS}" --signingKeyPass "${KEY_PASS}" --storePass "${KEYSTORE_PASS}"

APK_PATH=$(ls -1 app/build/outputs/apk/release/*.apk | tail -n1 || true)
echo "✅ Signed APK built: $APK_PATH"

FPR=$(keytool -list -v -keystore "${KEYSTORE_FILE}" -alias "${KEY_ALIAS}" -storepass "${KEYSTORE_PASS}" | awk -F': ' '/SHA256:/{print $2}')
mkdir -p assetlinks
cat > assetlinks/assetlinks.json <<JSON
[
  {
    "relation": ["delegate_permission/common.handle_all_urls"],
    "target": {
      "namespace": "android_app",
      "package_name": "${PACKAGE_ID}",
      "sha256_cert_fingerprints": ["${FPR}"]
    }
  }
]
JSON

echo "🔐 SHA256 cert fingerprint: $FPR"
echo "📄 assetlinks template: ./twa/assetlinks/assetlinks.json"
echo "➡ Add to your site at: ${APP_URL}/.well-known/assetlinks.json"
