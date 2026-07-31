param(
  [int]$PollSeconds = 15,
  [int]$DebounceSeconds = 20,
  [switch]$DryRun
)

$ErrorActionPreference = "Stop"

function Get-RepoRoot {
  return (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
}

function Ensure-Dir {
  param([string]$Path)

  if (-not (Test-Path -LiteralPath $Path)) {
    New-Item -ItemType Directory -Path $Path | Out-Null
  }
}

function Get-Fingerprint {
  param([string]$RepoRoot)

  $status = git -C $RepoRoot status --porcelain=v1 --untracked-files=all
  $filteredStatus = $status | Where-Object {
    $_ -and
    $_ -notmatch '^\?\? agent-automation/' -and
    $_ -notmatch '^\?\? agent-bridge/messages/' -and
    $_ -notmatch '^\?\? \.agents/bridge/'
  }

  return (($filteredStatus | Out-String).TrimEnd())
}

$repoRoot = Get-RepoRoot
$automationRoot = Join-Path $repoRoot "agent-automation"
$stateDir = Join-Path $automationRoot "state"
$logsDir = Join-Path $automationRoot "logs"
$statePath = Join-Path $stateDir "watch-state.json"
$lockPath = Join-Path $stateDir "watch.lock"
$cycleScript = Join-Path $PSScriptRoot "agent-review-cycle.ps1"

Ensure-Dir -Path $automationRoot
Ensure-Dir -Path $stateDir
Ensure-Dir -Path $logsDir

$pendingFingerprint = $null
$pendingSince = $null
$lastProcessed = $null

if (Test-Path -LiteralPath $statePath) {
  try {
    $savedState = Get-Content -LiteralPath $statePath -Raw | ConvertFrom-Json
    $lastProcessed = $savedState.lastProcessed
  } catch {
    $lastProcessed = $null
  }
}

Write-Host "Agent watcher started for $repoRoot"

while ($true) {
  try {
    $currentFingerprint = Get-Fingerprint -RepoRoot $repoRoot

    if ($currentFingerprint -ne $pendingFingerprint) {
      $pendingFingerprint = $currentFingerprint
      $pendingSince = Get-Date
    }

    $hasChanges = -not [string]::IsNullOrWhiteSpace($currentFingerprint)
    $isStable = $null -ne $pendingSince -and ((Get-Date) - $pendingSince).TotalSeconds -ge $DebounceSeconds
    $needsRun = $hasChanges -and $isStable -and $currentFingerprint -ne $lastProcessed

    if ($needsRun -and -not (Test-Path -LiteralPath $lockPath)) {
      New-Item -ItemType File -Path $lockPath | Out-Null

      try {
        $args = @(
          "-ExecutionPolicy", "Bypass",
          "-File", $cycleScript,
          "-Trigger", "watch"
        )

        if ($DryRun) {
          $args += "-DryRun"
        }

        & powershell.exe @args
        $lastProcessed = $currentFingerprint

        @{
          lastProcessed = $lastProcessed
          lastRunAt = (Get-Date).ToString("o")
        } | ConvertTo-Json | Set-Content -LiteralPath $statePath
      } finally {
        Remove-Item -LiteralPath $lockPath -Force -ErrorAction SilentlyContinue
      }
    }
  } catch {
    $errorLine = "[{0}] {1}" -f (Get-Date).ToString("o"), ($_ | Out-String).Trim()
    Add-Content -LiteralPath (Join-Path $logsDir "watch-errors.log") -Value $errorLine
  }

  Start-Sleep -Seconds $PollSeconds
}
