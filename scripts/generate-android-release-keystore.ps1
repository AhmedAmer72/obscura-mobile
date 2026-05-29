# Generate a release keystore and print GitHub secret instructions.

$ErrorActionPreference = "Stop"
$appDir = Join-Path $PSScriptRoot "..\android\app"
$keystore = Join-Path $appDir "obscura-release.keystore"

if (-not (Get-Command keytool -ErrorAction SilentlyContinue)) {
  Write-Error "keytool not found. Install JDK 17+ and ensure keytool is on PATH."
}

if (Test-Path $keystore) {
  Write-Host "Keystore already exists: $keystore"
  Write-Host "Delete it first if you want to generate a new one."
} else {
  Push-Location $appDir
  keytool -genkeypair -v `
    -storetype PKCS12 `
    -keystore obscura-release.keystore `
    -alias obscura `
    -keyalg RSA -keysize 2048 -validity 10000
  Pop-Location
  Write-Host "Created $keystore"
}

Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Copy android/keystore.properties.example -> android/keystore.properties"
Write-Host "2. Add GitHub secrets (see PLAY_STORE.md)"
Write-Host ""
Write-Host "ANDROID_KEYSTORE_BASE64 (copied to clipboard):"
$b64 = [Convert]::ToBase64String([IO.File]::ReadAllBytes($keystore))
$b64 | Set-Clipboard
Write-Host $b64.Substring(0, [Math]::Min(80, $b64.Length)) "..."
