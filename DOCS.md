# Obscura Mobile — App Documentation

Complete reference for the **Obscura** native mobile app: what it does, how it is built, and how to develop, configure, and ship it.

**Repo:** [https://github.com/AhmedAmer72/obscura-mobile](https://github.com/AhmedAmer72/obscura-mobile)  
**Package ID:** `finance.obscura.mobile`  
**Default network:** Arbitrum Sepolia (`421614`)

---

## Table of contents

1. [Overview](#overview)
2. [Products & features](#products--features)
3. [Mobile shell & UX](#mobile-shell--ux)
4. [Wallet, chain & privacy](#wallet-chain--privacy)
5. [Architecture](#architecture)
6. [Tech stack](#tech-stack)
7. [Configuration](#configuration)
8. [Development](#development)
9. [Building & releasing](#building--releasing)
10. [Syncing from the web app](#syncing-from-the-web-app)
11. [Testing & QA](#testing--qa)
12. [Related docs](#related-docs)

---

## Overview

Obscura Mobile is a **Capacitor-wrapped React app** that delivers the Obscura financial suite on Android (and optionally iOS). It is **not** the marketing website — that lives in the main OBSCURA monorepo at `frontend/obscura-os-main/`.

The mobile app exposes three core products through a single install:


| Product    | Route     | Purpose                                            |
| ---------- | --------- | -------------------------------------------------- |
| **Pay**    | `/pay`    | Private and public payments, automations, activity |
| **Vote**   | `/vote`   | Encrypted governance voting                        |
| **Credit** | `/credit` | Confidential lending, borrowing, vaults, risk      |


**Tagline:** *Private money, computed in the open.*

**Branding:** Forest green + sage palette (`#EEF3EA` background), Sora display font, Inter body, JetBrains Mono UI labels, Obscura logo mark.

---

## Products & features

### Pay (`/pay`)

Pay is the default landing tab. It supports two **privacy modes** toggled from the payment mode bar:

- **Public mode** — standard USDC via passkey smart account (ERC-4337) or connected wallet
- **Private mode** — encrypted **ocUSDC** flows using CoFHE (client-side FHE encryption before on-chain submission)

#### Sub-sections (horizontal chips under header)


| Section         | What it does                                                                                 |
| --------------- | -------------------------------------------------------------------------------------------- |
| **Overview**    | Dashboard, balances, reputation signals, quick actions                                       |
| **Pay**         | Send payments — public USDC or encrypted ocUSDC depending on mode                            |
| **Get Paid**    | Receive: public addresses (wallet + smart account) or encrypted invoices / stealth inbox     |
| **Automations** | Recurring and conditional flows: streams, escrows, subscriptions, payroll batches, insurance |
| **Activity**    | Transaction and payment activity feed (mode-aware)                                           |
| **Settings**    | Preferences, privacy, data export, notifications, smart account / passkey setup              |


#### Pay capabilities (high level)

- **Shield / encrypt USDC** into confidential ocUSDC
- **Unified send** — encrypted recipient, amount, and memo
- **Public USDC send** — gasless via passkey smart account when enrolled
- **Payment streams** (V2/V3) — recurring encrypted payouts
- **Escrows** — confidential escrow contracts
- **Payroll** — bulk import and batch resolver flows
- **Subscriptions & insurance** — automated recurring agreements
- **Stealth inbox & address book** — social / stealth payment resolution
- **Contacts** — saved recipients (`/pay/contacts`)
- **Smart account** — WebAuthn passkey enrollment, ERC-4337 deployment, paymaster-backed gasless public txs
- **Activity feed** — Supabase-backed notifications and on-chain events

#### Additional Pay routes

- `/pay/contacts` — contact list for quick sends
- `/pay/settings` — dedicated settings page (also available inside Pay tab)

---

### Vote (`/vote`)

Privacy-preserving governance powered by **ObscuraVote** and **ObscuraGovernor**. Individual votes are encrypted with FHE; only aggregate tallies are revealed after finalization.

See also: `[src/components/vote/VOTING_GUIDE.md](src/components/vote/VOTING_GUIDE.md)`

#### Sub-sections


| Section           | What it does                                                       |
| ----------------- | ------------------------------------------------------------------ |
| **Overview**      | Participation dashboard, active proposals snapshot, reward prompts |
| **Proposals**     | Browse, cast votes, create proposals, view finalized results       |
| **Participation** | Rewards, ballot history, delegation, vote alerts                   |
| **Advanced**      | Treasury panel, governor / timelock controls                       |


#### Proposal sub-tabs

- **Browse** — list open and historical proposals
- **Vote** — cast encrypted Yes/No on active proposals
- **Create** — submit new governance proposals
- **Results** — finalize ended votes and reveal tallies

#### Vote capabilities

- **Encrypted ballot casting** — client-side FHE before on-chain submission
- **Coercion resistance** — votes can be changed before deadline
- **Delegation** — delegate voting power to another address
- **Rewards** — participation rewards panel
- **Treasury** — treasury streaming and allocation views
- **Governor / Timelock** — executable governance controls for admins
- **Notifications** — vote alert preferences
- **Participation profile** — voter reputation and activity summary

**Eligibility note:** Users typically claim daily OBS from Pay before voting (see voting guide).

---

### Credit (`/credit`)

Confidential lending protocol with **FHE-encrypted positions**. Market data is public; personal borrow/supply amounts decrypt only when the user explicitly triggers wallet decryption.

#### Sub-sections


| Section          | What it does                                                    |
| ---------------- | --------------------------------------------------------------- |
| **Overview**     | Market summary, health factors, quick supply/borrow CTAs        |
| **Borrow**       | Borrow against collateral across configured markets             |
| **Position**     | Encrypted position view — borrow, repay, add collateral, supply |
| **Earn**         | Vault deposits — Conservative / Balanced strategies             |
| **Liquidations** | Liquidation queue and market liquidation data                   |
| **Risk**         | Protocol risk metrics and market parameters                     |


#### Credit capabilities

- **Multi-market borrowing** — USDC, WETH, OBS collateral pairs (M-86, M-70, M-50, etc.)
- **Supply & earn** — deposit into credit vaults
- **Encrypted balances** — FHE tiles; no auto-decrypt on page load
- **Reputation panel** — credit score and category signals
- **Liquidation monitoring** — public liquidation state
- **Settings drawer** — gear icon slide-over (not a main tab)

**Markets tab behavior:** Overview and market listings work without a wallet; Position requires connection + explicit decrypt.

---

## Mobile shell & UX

The app uses a **mobile-first shell** that differs from the desktop web layout.

### Navigation model

```
┌─────────────────────────────────────┐
│  Header (logo + app name + wallet)  │  ← sticky, safe-area top
├─────────────────────────────────────┤
│  Sub-nav chips (section tabs)       │  ← sticky below header
├─────────────────────────────────────┤
│                                     │
│  Page content                       │
│                                     │
├─────────────────────────────────────┤
│  Pay │ Vote │ Credit                │  ← bottom tab bar
└─────────────────────────────────────┘
```

- **One bottom tab bar** — Pay / Vote / Credit only (no duplicate nav)
- **Sub-navigation** — horizontal scrollable chips per product (not a second bottom bar)
- **Android back button** — navigates history; exits app from root
- **Route transitions** — short fade between pages (Framer Motion)

### Boot sequence

1. **Native splash** — sage `#EEF3EA` (Capacitor `SplashScreen`)
2. **Branded boot screen** — Obscura logo + tagline (~800 ms minimum)
3. **Env health check** — validates required `VITE_`* contract addresses
4. **Ready** — hides splash, renders app (or shows configuration screen)

If contract addresses are missing, **Configuration needed** screen lists the missing keys instead of failing silently.

### Mobile-only components


| File                                          | Role                                                          |
| --------------------------------------------- | ------------------------------------------------------------- |
| `src/App.tsx`                                 | Routes, tab bar visibility, onboarding modal                  |
| `src/main.tsx`                                | Adds `mobile-app` class to `<html>`                           |
| `src/lib/platform.ts`                         | `IS_MOBILE_APP`, Capacitor init, back button, keyboard resize |
| `src/components/mobile/AppBootstrap.tsx`      | Boot loader + env gate                                        |
| `src/components/mobile/MobileTabBar.tsx`      | Bottom Pay/Vote/Credit tabs                                   |
| `src/components/mobile/MobileSubNav.tsx`      | Sticky section chips                                          |
| `src/components/mobile/MobileWalletSheet.tsx` | Bottom drawer for WalletConnect                               |
| `src/components/mobile/EnvSetupScreen.tsx`    | Missing env configuration UI                                  |
| `src/components/harmony/HarmonyAppShell.tsx`  | Per-product layout (mobile branch)                            |


### Safe areas & layout CSS

When `html.mobile-app` is set, `src/index.css` applies:

- Safe-area padding for notch / home indicator
- Sticky header and sub-nav offsets (`--mobile-header-total`, `--mobile-chrome-top`)
- Tab bar height padding on content (`.mobile-app-content`)
- Toast and drawer positioning above the tab bar
- Keyboard resize via Capacitor `Keyboard.setResizeMode(Body)`

---

## Wallet, chain & privacy

### Supported chain

- **Primary:** Arbitrum Sepolia (`VITE_CHAIN_ID=421614`)
- **Fallback RPC pool** in `src/config/wagmi.ts` — publicnode, drpc, official Arbitrum, Tenderly
- Override with `VITE_ARBITRUM_SEPOLIA_RPC` for a custom endpoint

### Wallet connection

- **Native (APK):** WalletConnect-first bottom sheet — opens MetaMask, Rainbow, etc.
- **Browser dev:** Injected + WalletConnect connectors via wagmi v3
- **Network switch prompt** when not on Arbitrum Sepolia
- Truncated address shown in header via `NavRightSlot`

### Smart account (Pay)

- ERC-4337 smart account with **WebAuthn passkey**
- Paymaster for gasless **public USDC** sends
- Encrypted ocUSDC flows always use the connected wallet directly (not the smart account)

### Privacy technology


| Layer                     | Technology                                                |
| ------------------------- | --------------------------------------------------------- |
| Encrypted amounts & votes | **CoFHE SDK** (`@cofhe/sdk`) — FHE encryption client-side |
| Pay confidential token    | **ocUSDC** on Arbitrum Sepolia                            |
| Credit positions          | FHE-encrypted balances; user-triggered decrypt            |
| Vote ballots              | Encrypted on-chain; tally revealed after finalization     |


On first visit to Credit, a **How CoFHE works** onboarding modal may appear (stored in `localStorage`).

---

## Architecture

### Relationship to the web app

```
OBSCURA-main/frontend/obscura-os-main/   ← source of truth for shared UI + contracts
         │
         │  scripts/sync-from-obscura-web.ps1
         ▼
obscura-mobile/                          ← Capacitor shell + mobile-only files
         │
         │  npm run build → npx cap sync
         ▼
android/ / ios/                          ← native projects
```

Shared code (synced from web): `src/components/*`, `src/pages/*`, `src/hooks/*`, `src/config/*`, `src/abis/*`, tests.

**Preserved on sync** (never overwritten): `App.tsx`, `main.tsx`, `platform.ts`, `HarmonyAppShell.tsx`, `src/components/mobile/`*, mobile CSS in `index.css`.

### Project structure

```
obscura-mobile/
├── android/                 # Capacitor Android project (Gradle)
├── ios/                     # Capacitor iOS project (optional)
├── config/
│   └── mobile.production.env  # Committed prod config for CI builds
├── public/                  # Static assets, brand marks
├── resources/               # App icon source (1024×1024)
├── scripts/
│   ├── sync-from-obscura-web.ps1
│   └── generate-android-release-keystore.ps1
├── src/
│   ├── abis/                # Contract ABIs (incl. vote/*.json)
│   ├── components/
│   │   ├── mobile/          # Mobile-only UI
│   │   ├── harmony/         # Product shell layouts
│   │   ├── pay-v4/          # Pay forms & automations
│   │   ├── vote/            # Governance UI
│   │   ├── credit/          # Lending UI
│   │   └── wallet/          # Wallet connect
│   ├── config/              # wagmi, contracts
│   ├── contexts/            # Payment mode, preferences
│   ├── hooks/               # On-chain + feed hooks
│   ├── lib/                 # Utilities, env health, platform
│   ├── pages/               # PayPage, VotePage, CreditPage, …
│   └── test/                # Vitest suites (vote v4–v7, etc.)
├── capacitor.config.ts
├── package.json
└── vite.config.ts
```

### Data & backend services


| Service       | Env var                                       | Purpose                                               |
| ------------- | --------------------------------------------- | ----------------------------------------------------- |
| Supabase      | `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Activity feed, notifications (RLS-protected anon key) |
| Relay API     | `VITE_RELAY_URL`                              | Smart account / meta-tx relay                         |
| Notifications | `VITE_NOTIFICATIONS_URL`                      | Push / notification endpoints                         |


Production values are in `config/mobile.production.env` (safe to commit — on-chain addresses + RLS-protected anon key).

---

## Tech stack


| Layer          | Libraries                                                    |
| -------------- | ------------------------------------------------------------ |
| UI             | React 18, TypeScript, Tailwind CSS, Radix UI, Framer Motion  |
| Routing        | React Router v6                                              |
| State / data   | TanStack Query, React contexts                               |
| Web3           | wagmi v3, viem, WalletConnect, RainbowKit connectors         |
| FHE            | `@cofhe/sdk`                                                 |
| Smart accounts | `@reineira-os/sdk`, ERC-4337 factory + paymaster             |
| Native         | Capacitor 8 (Android, iOS, Splash, StatusBar, Keyboard, App) |
| Build          | Vite 5, Vitest                                               |
| CI             | GitHub Actions → Gradle `assembleDebug` / `bundleRelease`    |


---

## Configuration

### Required environment variables

At minimum, these must be valid `0x…` addresses (checked at boot via `src/lib/envHealth.ts`):

- `VITE_OBSCURA_PAY_ADDRESS`
- `VITE_OBSCURA_TOKEN_ADDRESS`
- `VITE_OBSCURA_VOTE_ADDRESS`
- `VITE_OBSCURA_STEALTH_REGISTRY_ADDRESS`
- `VITE_OBSCURA_PAYROLL_RESOLVER_V2_ADDRESS`
- `VITE_OBSCURA_PAY_STREAM_V2_ADDRESS`
- `VITE_OBSCURA_ADDRESS_BOOK_ADDRESS`
- `VITE_OBSCURA_INBOX_INDEX_ADDRESS`
- `VITE_OBSCURA_INSURANCE_SUBSCRIPTION_ADDRESS`
- `VITE_OBSCURA_SOCIAL_RESOLVER_ADDRESS`
- `VITE_OBSCURA_STEALTH_ROTATION_ADDRESS`
- `VITE_OBSCURA_CONFIDENTIAL_ESCROW_ADDRESS`
- `VITE_OBSCURA_PAY_STREAM_V3_ADDRESS`
- `VITE_OBSCURA_INSURANCE_SUBSCRIPTION_V2_ADDRESS`

Full production set (Pay, Credit, Vote, governance, Chainlink oracles): see `[config/mobile.production.env](config/mobile.production.env)`.

### Local setup

```bash
npm install
cp .env.example .env          # or copy from config/mobile.production.env
# Fill VITE_* values
npm run dev                   # http://localhost:8080
```

### CI / APK builds

GitHub Actions copies `config/mobile.production.env` → `.env.production` before `npm run build`, so release APKs ship with working contract config without manual secrets for addresses.

---

## Development

### Commands


| Command                   | Description                                        |
| ------------------------- | -------------------------------------------------- |
| `npm run dev`             | Vite dev server (browser preview)                  |
| `npm run build`           | Production web build → `dist/`                     |
| `npm run cap:sync`        | Build + `npx cap sync` (copy web assets to native) |
| `npm run cap:android`     | Sync + open Android Studio                         |
| `npm run cap:ios`         | Sync + open Xcode                                  |
| `npm run test`            | Vitest unit tests                                  |
| `npm run assets:generate` | Generate native icons from `resources/icon.png`    |


### Browser vs device

- **Browser dev** is fast for UI work; wallet and FHE flows behave best on a real device.
- **Native testing** requires debug APK or `npm run cap:android` with Android Studio.

### Capacitor config highlights

```ts
appId: "finance.obscura.mobile"
appName: "Obscura"
webDir: "dist"
SplashScreen.backgroundColor: "#EEF3EA"
launchAutoHide: false          // hidden after AppBootstrap
```

---

## Building & releasing

### Quick reference


| Artifact          | Use                            |
| ----------------- | ------------------------------ |
| `app-debug.apk`   | Side-load testing              |
| `app-release.aab` | **Google Play Console upload** |
| `app-release.apk` | Signed direct install          |


### CI (GitHub Actions)

Workflow: `.github/workflows/android-build.yml`

- Node 22, JDK 21, Temurin
- Builds debug APK always
- Signed AAB + release APK when signing secrets are configured
- Publishes GitHub Release tagged `mobile-{run_number}`

**Signing secrets** (see [PLAY_STORE.md](PLAY_STORE.md)):

- `ANDROID_KEYSTORE_BASE64`
- `ANDROID_KEYSTORE_PASSWORD`
- `ANDROID_KEY_ALIAS`
- `ANDROID_KEY_PASSWORD`

### Source repo & releases

**GitHub:** [AhmedAmer72/obscura-mobile](https://github.com/AhmedAmer72/obscura-mobile)

Latest APK releases: [https://github.com/AhmedAmer72/obscura-mobile/releases/latest](https://github.com/AhmedAmer72/obscura-mobile/releases/latest)

### Local Android build

```powershell
npm ci
cp config/mobile.production.env .env.production
npm run cap:sync
cd android
.\gradlew.bat assembleDebug    # or bundleRelease with keystore.properties
```

Output: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Syncing from the web app

When the web frontend in `OBSCURA-main` gets new features, run:

```powershell
.\scripts\sync-from-obscura-web.ps1
```

Defaults:

- Web root: `E:\AKINDO\OBSCURA-main\frontend\obscura-os-main`
- Mobile root: `E:\AKINDO\obscura-mobile`

The script copies shared source, restores mobile-only files from backup, and re-applies mobile safe-area class patches on Vote/Credit settings drawers.

After sync, review diffs in preserved files, run tests, and push to `master`.

---

## Testing & QA

### Automated tests

```bash
npm run test
```

Vote regression suites: `src/test/vote-final-v4-v5.test.ts`, `vote-final-v6.test.ts`, `vote-final-v7.test.ts`.

### Device QA checklist

Use [DEVICE_QA.md](DEVICE_QA.md) on a real Android phone before store submission. Covers install, boot, navigation, wallet, Pay/Vote/Credit flows, keyboard overlap, and env setup screen.

---

## Related docs


| Document                                                                   | Contents                                          |
| -------------------------------------------------------------------------- | ------------------------------------------------- |
| [README.md](README.md)                                                     | Quick start                                       |
| [BUILD_APK.md](BUILD_APK.md)                                               | APK build options (CI, local, browser)            |
| [PLAY_STORE.md](PLAY_STORE.md)                                             | Keystore, signing secrets, Play Console checklist |
| [DEVICE_QA.md](DEVICE_QA.md)                                               | Pre-release device checklist                      |
| [resources/README.md](resources/README.md)                                 | App icon generation                               |
| [src/components/vote/VOTING_GUIDE.md](src/components/vote/VOTING_GUIDE.md) | Vote user & admin flows                           |


---

## Versioning

CI sets Android `versionCode` = GitHub run number and `versionName` = `1.0.{run_number}`. Each Play Store upload must increment `versionCode`.

---

*Last updated to reflect master branch: Pay/Vote/Credit suite, Vote V6/V7, Capacitor 8 shell, Arbitrum Sepolia testnet, and signed AAB CI pipeline.*