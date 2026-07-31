$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$pidPath = Join-Path $repoRoot "agent-automation\state\watch.pid"

if (-not (Test-Path -LiteralPath $pidPath)) {
  Write-Host "Watcher PID file not found."
  exit 0
}

$pidValue = Get-Content -LiteralPath $pidPath -Raw

if (-not $pidValue) {
  Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
  Write-Host "Watcher PID file was empty."
  exit 0
}

$process = Get-Process -Id ([int]$pidValue) -ErrorAction SilentlyContinue
if ($null -ne $process) {
  Stop-Process -Id $process.Id -Force
}

Remove-Item -LiteralPath $pidPath -Force -ErrorAction SilentlyContinue
Write-Host "Stopped watcher PID $pidValue"
