$ErrorActionPreference = "Stop"

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$automationRoot = Join-Path $repoRoot "agent-automation"
$stateDir = Join-Path $automationRoot "state"
$logsDir = Join-Path $automationRoot "logs"
$watchScript = Join-Path $PSScriptRoot "agent-watch.ps1"
$outPath = Join-Path $logsDir "watch.out.log"
$errPath = Join-Path $logsDir "watch.err.log"
$pidPath = Join-Path $stateDir "watch.pid"

foreach ($dir in @($automationRoot, $stateDir, $logsDir)) {
  if (-not (Test-Path -LiteralPath $dir)) {
    New-Item -ItemType Directory -Path $dir | Out-Null
  }
}

if (Test-Path -LiteralPath $pidPath) {
  $existingPid = Get-Content -LiteralPath $pidPath -Raw
  if ($existingPid) {
    $existingProcess = Get-Process -Id ([int]$existingPid) -ErrorAction SilentlyContinue
    if ($null -ne $existingProcess) {
      Write-Host "Watcher already running with PID $existingPid"
      exit 0
    }
  }
}

$process = Start-Process -FilePath "powershell.exe" `
  -ArgumentList @("-ExecutionPolicy", "Bypass", "-File", $watchScript) `
  -WindowStyle Hidden `
  -RedirectStandardOutput $outPath `
  -RedirectStandardError $errPath `
  -PassThru

Set-Content -LiteralPath $pidPath -Value $process.Id
Write-Host "Started agent watcher with PID $($process.Id)"
