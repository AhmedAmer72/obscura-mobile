# Publish obscura-mobile to NeoCrafts-cpu and trigger APK build.
# Requires: gh CLI logged in as NeoCrafts-cpu (gh auth login)

$ErrorActionPreference = "Stop"
$Repo = "NeoCrafts-cpu/obscura-mobile"

$user = gh api user --jq .login
if ($user -ne "NeoCrafts-cpu") {
  Write-Host "Current GitHub user is '$user'. Log in as NeoCrafts-cpu first:" -ForegroundColor Yellow
  Write-Host "  gh auth login"
  exit 1
}

$exists = gh repo view $Repo --json name -q .name 2>$null
if (-not $exists) {
  Write-Host "Creating $Repo ..."
  gh repo create $Repo --public --description "Obscura mobile app (Capacitor Android)"
}

if (-not (git remote | Select-String -Quiet "^neocrafts$")) {
  git remote add neocrafts "https://github.com/$Repo.git"
}

Write-Host "Pushing master to $Repo ..."
git push -u neocrafts master

Write-Host "Starting Android build workflow ..."
gh workflow run android-build.yml -R $Repo
Start-Sleep -Seconds 10
$runId = gh run list -R $Repo -L 1 --json databaseId -q ".[0].databaseId"
Write-Host "Watching run $runId (this takes several minutes) ..."
gh run watch $runId -R $Repo --exit-status

Write-Host ""
Write-Host "Download APK:" -ForegroundColor Green
Write-Host "  https://github.com/$Repo/releases"
gh release list -R $Repo -L 3
