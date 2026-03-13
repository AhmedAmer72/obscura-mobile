# Obscura Mobile

Capacitor shell for **Obscura Pay, Vote, and Credit** — separate from the marketing website in `OBSCURA-main/frontend/obscura-os-main`.

**Repo:** https://github.com/AhmedAmer72/obscura-mobile

## Features

- Bottom tabs: Pay / Vote / Credit
- In-app sub-navigation as horizontal chips (no double bottom bar)
- Branded boot loading screen + native splash (sage `#EEF3EA`)
- Mobile wallet connect sheet (WalletConnect-first on native)
- Env setup screen when contract addresses are missing
- Keyboard resize + safe areas on native

## Develop (browser)

```bash
npm install
cp .env.example .env   # fill VITE_* from web app / Vercel
npm run dev
```

## Build native

```bash
npm run cap:sync
```

- Android APK via GitHub Actions → **Actions** → **Android build**
- Local: `npm run cap:android` (requires Android Studio)

## Native icons (optional)

Add `resources/icon.png` (1024×1024), then:

```bash
npm run assets:generate
```

See [resources/README.md](resources/README.md).

## Device testing

Use [DEVICE_QA.md](DEVICE_QA.md) on a real phone before store submission.
