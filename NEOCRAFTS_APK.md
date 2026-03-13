# Build & download APK via [NeoCrafts-cpu](https://github.com/NeoCrafts-cpu)

Use this account if Actions billing is blocked on your personal GitHub.

## One-time setup (NeoCrafts-cpu)

1. Sign in to GitHub as **NeoCrafts-cpu**.
2. Create an empty public repo: **obscura-mobile** (no README / no .gitignore).
3. Push this project:

```powershell
cd E:\AKINDO\obscura-mobile
git remote add neocrafts https://github.com/NeoCrafts-cpu/obscura-mobile.git
git push -u neocrafts master
```

**Or import** (no local push): NeoCrafts-cpu → **New repository** → **Import a repository** →  
`https://github.com/AhmedAmer72/obscura-mobile`

## Build the APK / AAB

1. Add [signing secrets](./PLAY_STORE.md) on the repo for release `.aab` builds.
2. Open **Actions** → **Android build** → **Run workflow** (or push to `master`).
3. Wait for the green check (~5–8 min).
4. Download from **Releases** (`mobile-*` tag) or **Artifacts**:
   - `app-debug.apk` — quick testing
   - `app-release.aab` — upload to Google Play
   - `app-release.apk` — signed direct install

Public link: `https://github.com/NeoCrafts-cpu/obscura-mobile/releases/latest`

## CLI (after `gh auth login` as NeoCrafts-cpu)

```powershell
gh workflow run android-build.yml -R NeoCrafts-cpu/obscura-mobile
gh run watch -R NeoCrafts-cpu/obscura-mobile
gh release list -R NeoCrafts-cpu/obscura-mobile
```

## Local build (optional)

See [BUILD_APK.md](./BUILD_APK.md) — requires JDK 17 + Android SDK.
