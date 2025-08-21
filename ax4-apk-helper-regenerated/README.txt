AX4 APK Helper (Regenerated)
==============================

This pack lets you generate an Android APK from your Netlify-hosted PWA using Bubblewrap (Trusted Web Activity).

Requirements:
- Node.js + npm
- Java JDK (for `keytool`) – only needed for signed builds
- Public HTTPS URL (e.g., https://ax4-surveyor-app.netlify.app)

Quick unsigned APK:
-------------------
APP_URL="https://ax4-surveyor-app.netlify.app" bash quick-build-apk.sh

Signed APK + asset links:
-------------------------
APP_URL="https://ax4-surveyor-app.netlify.app" \
APP_NAME="AX4 Surveyor" \
PACKAGE_ID="au.com.ax4.surveyor" \
KEYSTORE_PASS="choose-a-strong-pass" \
bash signed-build-apk.sh

Then commit the generated `assetlinks.json` to:
  /public/.well-known/assetlinks.json
in your web app repo and redeploy Netlify.

Install on device:
------------------
Transfer the APK to your Android, enable side-loading, and install.
With asset links deployed, it opens fullscreen; without, it will use a browser toolbar (still works).

Troubleshooting:
----------------
- If `bubblewrap` not found, the scripts will auto-install it.
- If the APK shows a top bar, ensure `assetlinks.json` is reachable at:
  https://YOUR_DOMAIN/.well-known/assetlinks.json
