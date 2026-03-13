# Sync shared app source from OBSCURA web frontend into obscura-mobile.
# Preserves mobile-only shell files.

param(
  [string]$WebRoot = "E:\AKINDO\OBSCURA-main\frontend\obscura-os-main",
  [string]$MobileRoot = "E:\AKINDO\obscura-mobile"
)

$ErrorActionPreference = "Stop"
$backup = Join-Path $MobileRoot ".sync-preserve"
if (Test-Path $backup) { Remove-Item $backup -Recurse -Force }
New-Item -ItemType Directory -Force -Path $backup | Out-Null

$preserve = @(
  "src\App.tsx",
  "src\main.tsx",
  "src\lib\platform.ts",
  "src\components\harmony\HarmonyAppShell.tsx",
  "src\components\mobile",
  "src\index.css"
)

foreach ($rel in $preserve) {
  $src = Join-Path $MobileRoot $rel
  if (-not (Test-Path $src)) { continue }
  $dest = Join-Path $backup $rel
  $destDir = Split-Path $dest -Parent
  New-Item -ItemType Directory -Force -Path $destDir | Out-Null
  Copy-Item $src $dest -Recurse -Force
}

foreach ($d in @("abis", "config", "contexts", "hooks", "styles", "test")) {
  $from = Join-Path $WebRoot "src\$d"
  $to = Join-Path $MobileRoot "src\$d"
  if (Test-Path $from) {
    robocopy $from $to /E /NFL /NDL /NJH /NJS /NC /NS | Out-Null
  }
}

Get-ChildItem (Join-Path $WebRoot "src\lib") -File | Where-Object { $_.Name -ne "platform.ts" } | ForEach-Object {
  Copy-Item $_.FullName (Join-Path $MobileRoot "src\lib\$($_.Name)") -Force
}

robocopy (Join-Path $WebRoot "src\components") (Join-Path $MobileRoot "src\components") /E /XD landing mobile /NFL /NDL /NJH /NJS /NC /NS | Out-Null

foreach ($p in @("PayPage.tsx", "VotePage.tsx", "CreditPage.tsx", "ContactsPage.tsx", "SettingsPage.tsx", "NotFound.tsx")) {
  Copy-Item (Join-Path $WebRoot "src\pages\$p") (Join-Path $MobileRoot "src\pages\$p") -Force
}

Copy-Item (Join-Path $WebRoot "tailwind.config.ts") (Join-Path $MobileRoot "tailwind.config.ts") -Force
Copy-Item (Join-Path $WebRoot "src\styles\harmony-workspace-forms.css") (Join-Path $MobileRoot "src\styles\harmony-workspace-forms.css") -Force
Copy-Item (Join-Path $WebRoot "src\components\brand\*") (Join-Path $MobileRoot "public\brand\") -Force
Copy-Item (Join-Path $WebRoot "public\favicon.png") (Join-Path $MobileRoot "public\favicon.png") -Force
Copy-Item (Join-Path $WebRoot "public\apple-touch-icon.png") (Join-Path $MobileRoot "public\apple-touch-icon.png") -Force

foreach ($rel in $preserve) {
  $from = Join-Path $backup $rel
  $dest = Join-Path $MobileRoot $rel
  if (Test-Path $from) {
    Copy-Item $from $dest -Recurse -Force
  }
}

# Re-apply mobile settings drawer safe-area classes on synced pages
$votePage = Join-Path $MobileRoot "src\pages\VotePage.tsx"
$vote = Get-Content $votePage -Raw
$vote = $vote -replace 'className="fixed right-0 top-0 bottom-0 z-50 w-full overflow-y-auto border-l hairline bg-card shadow-2xl sm:w-\[430px\]"', 'className="mobile-app-panel-full fixed right-0 z-[60] w-full overflow-y-auto border-l hairline bg-card shadow-2xl sm:w-[430px]"'
Set-Content $votePage $vote -NoNewline

$creditPage = Join-Path $MobileRoot "src\pages\CreditPage.tsx"
$credit = Get-Content $creditPage -Raw
$credit = $credit -replace 'className="fixed right-0 top-0 bottom-0 z-50 w-full overflow-y-auto border-l hairline bg-card shadow-2xl sm:w-\[420px\]"', 'className="mobile-app-panel-full fixed right-0 z-[60] w-full overflow-y-auto border-l hairline bg-card shadow-2xl sm:w-[420px]"'
$credit = $credit -replace 'className="sticky top-3 z-30 mb-6"', 'className="relative mb-4 md:sticky md:top-3 md:z-30 md:mb-6"'
Set-Content $creditPage $credit -NoNewline

Remove-Item $backup -Recurse -Force
Write-Host "Sync complete from $WebRoot"
