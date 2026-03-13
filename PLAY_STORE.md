# Google Play — Obscura Mobile

Upload target: **Android App Bundle (`.aab`)**, not the debug APK.

## 1. One-time: create a release keystore

Run once on your machine (keep the file and passwords safe — losing them blocks future updates):

```powershell
cd E:\AKINDO\obscura-mobile\android\app
keytool -genkeypair -v `
  -storetype PKCS12 `
  -keystore obscura-release.keystore `
  -alias obscura `
  -keyalg RSA -keysize 2048 -validity 10000
```

Copy `android/keystore.properties.example` → `android/keystore.properties` and fill in the same passwords for local builds.

## 2. Add GitHub Actions secrets

Repo → **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret | Value |
|--------|--------|
| `ANDROID_KEYSTORE_BASE64` | Base64 of `obscura-release.keystore` (see below) |
| `ANDROID_KEYSTORE_PASSWORD` | Keystore password |
| `ANDROID_KEY_ALIAS` | `obscura` (or your alias) |
| `ANDROID_KEY_PASSWORD` | Key password |

Encode the keystore (PowerShell):

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("E:\AKINDO\obscura-mobile\android\app\obscura-release.keystore")) | Set-Clipboard
```

Paste clipboard into `ANDROID_KEYSTORE_BASE64`.

## 3. Build in CI

1. **Actions** → **Android build** → **Run workflow** (or push to `master`).
2. When secrets are set, the release includes:
   - `app-debug.apk` — side-load testing
   - `app-release.aab` — **upload this to Google Play**
   - `app-release.apk` — signed release for direct install
3. Download from **Releases** (`mobile-*` tag) or workflow **Artifacts**.

Without signing secrets, CI still publishes the debug APK only.

## 4. Google Play Console checklist

1. Register at [Google Play Console](https://play.google.com/console) — **$25 one-time**.
2. **Create app** → name **Obscura**, default language, app/game type.
3. **App content** (complete all):
   - Privacy policy URL: your live site `/privacy` (e.g. `https://your-domain/privacy`)
   - App access (login/demo account if needed)
   - Ads declaration
   - Content rating questionnaire
   - Target audience
   - Data safety form (wallet + network usage)
4. **Store listing**:
   - Short & full description
   - Icon 512×512 (use `resources/icon.png` or brand mark)
   - Feature graphic 1024×500
   - Phone screenshots (min 2) — use your Pay / splash captures
5. **Release** → **Testing** → **Internal testing** (recommended first):
   - Create release → upload **`app-release.aab`**
   - Add tester emails
   - Review and roll out
6. After internal QA → **Closed testing** → **Open testing** → **Production**.

## 5. Version numbers

CI sets `versionCode` = GitHub `run_number` and `versionName` = `1.0.{run_number}`.

Each Play upload must have a **higher versionCode** than the previous release.

## 6. Local signed build (optional)

```powershell
cd E:\AKINDO\obscura-mobile
npm ci
cp config/mobile.production.env .env.production
npm run build
npx cap sync android
cd android
.\gradlew.bat bundleRelease
```

Output: `android\app\build\outputs\bundle\release\app-release.aab`

## 7. Public download link (before Play approval)

Use GitHub Releases latest:

`https://github.com/AhmedAmer72/obscura-mobile/releases/latest`

Attach **`app-release.apk`** (signed) or **`app-debug.apk`** (testing). Link from your landing page **Mobile suite** section.

After Play approval, replace with the Play Store URL.
