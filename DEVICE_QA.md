# Device QA checklist

Run on a **real Android device** using the debug APK from GitHub Actions (`Android build` workflow) or `npm run cap:android`.

## Install

- [ ] APK installs without errors
- [ ] App icon shows sage background (after asset generate)

## Launch and branding

- [ ] Native splash shows sage background
- [ ] Branded boot screen (Obscura mark + tagline) appears briefly
- [ ] App lands on **Pay** home

## Navigation

- [ ] Bottom tabs: Pay / Vote / Credit — only one bottom bar visible
- [ ] Pay sub-sections appear as **horizontal chips** under header (not a second bottom bar)
- [ ] Switching tabs preserves expected screen
- [ ] Android back button navigates history or exits app from root

## Wallet

- [ ] Tap **Connect** opens bottom sheet
- [ ] WalletConnect opens external wallet app (MetaMask / Rainbow)
- [ ] Returning to Obscura restores session
- [ ] **Switch network** appears if not on Arbitrum Sepolia
- [ ] Connected address shows truncated in header

## Pay (testnet)

- [ ] View balance / activity feed loads
- [ ] Shield USDC flow starts (CoFHE encrypt step visible)
- [ ] Send private payment completes or shows clear error
- [ ] Keyboard does not cover submit buttons on send forms

## Vote

- [ ] Proposal list loads
- [ ] Can open a proposal and cast vote (when wallet connected)

## Credit

- [ ] Overview loads
- [ ] Supply or borrow form usable on phone width

## Environment

- [ ] With missing `.env`, setup screen lists missing keys (not silent failure)
- [ ] With valid `.env`, app passes boot into Pay

## Notes

Record device model, Android version, wallet app used, and any failures below:

```
Device:
Android:
Wallet:
Issues:
```
