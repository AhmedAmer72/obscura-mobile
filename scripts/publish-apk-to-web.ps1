# Copy a built Android APK into the Obscura web app public/downloads folder
# and update mobile-releases.json for the /download page.

param(
  [string]$ApkPath = "",
  [string]$Version = "",
  [string]$WebRoot = "E:\AKINDO\OBSCURA-main\frontend\obscura-os-main",
  [string]$Notes = "Pay, Vote, and Credit workspaces|WalletConnect on Arbitrum Sepolia testnet|Same FHE privacy model as the web app"
)

$ErrorActionPreference = "Stop"
$MobileRoot = Split-Path $PSScriptRoot -Parent

if (-not $Version) {
  $pkg = Get-Content (Join-Path $MobileRoot "package.json") -Raw | ConvertFrom-Json
  $Version = [string]$pkg.version
}

if (-not $ApkPath) {
  $debugApk = Join-Path $MobileRoot "android\app\build\outputs\apk\debug\app-debug.apk"
  $releaseApk = Join-Path $MobileRoot "android\app\build\outputs\apk\release\app-release.apk"
  if (Test-Path $releaseApk) { $ApkPath = $releaseApk }
  elseif (Test-Path $debugApk) { $ApkPath = $debugApk }
  else {
    throw "No APK found. Build first: npm run cap:sync; cd android; .\gradlew.bat assembleDebug"
  }
}

if (-not (Test-Path $ApkPath)) {
  throw "APK not found at $ApkPath"
}

$downloadsDir = Join-Path $WebRoot "public\downloads"
New-Item -ItemType Directory -Force -Path $downloadsDir | Out-Null

$fileName = "obscura-mobile-$Version.apk"
$destApk = Join-Path $downloadsDir $fileName
Copy-Item $ApkPath $destApk -Force

$hash = (Get-FileHash -Path $destApk -Algorithm SHA256).Hash.ToLowerInvariant()
$sizeBytes = (Get-Item $destApk).Length
$publishedAt = (Get-Date).ToString("yyyy-MM-dd")
$noteList = $Notes -split '\|' | ForEach-Object { $_.Trim() } | Where-Object { $_ }

$manifestPath = Join-Path $downloadsDir "mobile-releases.json"
$manifest = @{
  channel = "direct"
  productName = "Obscura Mobile"
  latestVersion = $Version
  releases = @(
    @{
      version = $Version
      publishedAt = $publishedAt
      label = "Android APK"
      fileName = $fileName
      downloadPath = "/downloads/$fileName"
      sizeBytes = $sizeBytes
      sha256 = $hash
      minAndroid = "8.0"
      recommended = $true
      notes = $noteList
    }
  )
  installSteps = @(
    "Download the APK on your Android phone (Chrome or your file manager).",
    "Open the file and allow installs from your browser or files app when prompted.",
    "Launch Obscura, connect your wallet, and switch to Arbitrum Sepolia."
  )
}

$manifest | ConvertTo-Json -Depth 6 | Set-Content $manifestPath -Encoding utf8

Write-Host "Published $fileName ($([math]::Round($sizeBytes / 1MB, 2)) MB)"
Write-Host "Manifest: $manifestPath"
Write-Host "Users download at: /download"
Write-Host "Direct file: /downloads/$fileName"
