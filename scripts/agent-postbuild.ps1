$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $repoRoot "agent-automation\config.json"
$dispatchScript = Join-Path $PSScriptRoot "agent-hook-dispatch.ps1"

if ($env:CI -eq "true") {
  exit 0
}

if (-not (Test-Path -LiteralPath $configPath)) {
  exit 0
}

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json

if (-not $config.enabled -or -not $config.postBuildEnabled) {
  exit 0
}

& powershell.exe -ExecutionPolicy Bypass -File $dispatchScript -Trigger "post-build"
