param(
  [string]$Trigger = "hook"
)

$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$configPath = Join-Path $repoRoot "agent-automation\config.json"
$cycleScript = Join-Path $PSScriptRoot "agent-review-cycle.ps1"
$logsDir = Join-Path $repoRoot "agent-automation\logs"
$outPath = Join-Path $logsDir "hook-$Trigger.out.log"
$errPath = Join-Path $logsDir "hook-$Trigger.err.log"

if (-not (Test-Path -LiteralPath $logsDir)) {
  New-Item -ItemType Directory -Path $logsDir | Out-Null
}

if (-not (Test-Path -LiteralPath $configPath)) {
  exit 0
}

$config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json

if (-not $config.enabled) {
  exit 0
}

if (-not $config.postCommitEnabled) {
  exit 0
}

Start-Process -FilePath "powershell.exe" `
  -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", $cycleScript, "-Trigger", $Trigger) `
  -WindowStyle Hidden `
  -RedirectStandardOutput $outPath `
  -RedirectStandardError $errPath | Out-Null
