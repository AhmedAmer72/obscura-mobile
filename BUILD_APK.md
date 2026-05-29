# Build an Android APK / Google Play bundle

See **[PLAY_STORE.md](./PLAY_STORE.md)** for keystore setup, GitHub secrets, and Play Console upload.

## Why GitHub Actions shows no download

If Actions fails in **~3 seconds** with no logs, check the run summary. A common cause:

> **The job was not started because your account is locked due to a billing issue.**

Fix billing at https://github.com/settings/billing (free tier still requires a valid payment method on file for Actions minutes in some regions). After that, re-run **Actions → Android build → Run workflow**. The **obscura-mobile-debug-apk** artifact appears only when the job completes successfully.

---

## Option A — GitHub Actions (after billing is fixed)

1. Add signing secrets (see [PLAY_STORE.md](./PLAY_STORE.md)) for Google Play `.aab` builds.
2. Push to `master`, or manually **Run workflow** on the Android build workflow.
3. Open the completed run → **Artifacts** or **Releases** (`mobile-*` tag):
   - `obscura-mobile-debug-apk` — testing
   - `obscura-mobile-release-aab` — **Google Play upload**
   - `obscura-mobile-release-apk` — signed side-load

---

## Option B — Build on your PC

### Requirements

- Node.js 20+
- **JDK 21** ([Eclipse Temurin](https://adoptium.net/))
- Android SDK (easiest via [Android Studio](https://developer.android.com/studio))

Set `JAVA_HOME` to your JDK folder, e.g. `C:\Program Files\Eclipse Adoptium\jdk-17...`

### Commands

```powershell
cd E:\AKINDO\obscura-mobile
npm ci
npm run cap:sync
cd android
.\gradlew.bat assembleDebug
```

APK output:

```
android\app\build\outputs\apk\debug\app-debug.apk
```

Copy to your phone and install (enable “Install unknown apps” for your file manager).

### Android Studio

```powershell
npm run cap:android
```

Then **Run** on a device or emulator from Android Studio.

---

## Option C — Browser dev (no APK)

```powershell
cd E:\AKINDO\obscura-mobile
npm run dev
```

Open http://localhost:8080 on your phone (same Wi‑Fi) to preview UI — wallet/FHE still need real device testing for best results.
