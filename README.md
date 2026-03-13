# Obscura Mobile

Capacitor shell for **Obscura Pay, Vote, and Credit** — separate from the marketing website in `OBSCURA-main/frontend/obscura-os-main`.

## Develop (browser)

```bash
npm install
npm run dev
```

Opens at `http://localhost:8080` — defaults to `/pay`.

## Build native projects

```bash
npm run cap:sync
```

- Android: `npm run cap:android` (requires Android Studio) or use CI.
- iOS: `npm run cap:ios` (requires Mac + Xcode) or use Codemagic / GitHub Actions.

## Environment

Add a `.env` file with the same `VITE_*` keys as the web app (relay URL, Supabase, contract addresses).

## Scope

- Pay, Vote, Credit workspace routes
- Bottom tab navigation
- No marketing landing page
