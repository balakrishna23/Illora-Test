param(
  [string]$Trigger = "manual",
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

function Write-TextFile {
  param(
    [string]$Path,
    [string]$Content
  )

  [System.IO.File]::WriteAllText($Path, $Content)
}

function Get-CommandPathOrNull {
  param([string]$Name)

  $command = Get-Command $Name -ErrorAction SilentlyContinue
  if ($null -eq $command) {
    return $null
  }

  return $command.Path
}

function Invoke-Capture {
  param(
    [string]$FilePath,
    [string[]]$ArgumentList,
    [string]$OutputPath,
    [string]$ErrorPath
  )

  # IMPORTANT: PowerShell 5.1 wraps ANY non-empty stderr line from a native
  # exe as a terminating ErrorRecord once $ErrorActionPreference = "Stop" is
  # in effect (set at the top of this script) — regardless of whether
  # stderr is merged with 2>&1 or redirected to a file. That means a
  # harmless startup warning (e.g. codex.exe's "stale arg0 temp dirs"
  # cleanup notice) throws before the real review/report output is ever
  # produced, and the catch block below saves the warning text instead of
  # the actual output. Scoping ErrorActionPreference to "Continue" for just
  # this call — and keeping stderr redirected to its own file rather than
  # merged into the pipeline — avoids both the crash and stdout corruption.
  $output = $null
  $exitCode = 1
  $previousPreference = $ErrorActionPreference

  try {
    $ErrorActionPreference = "Continue"
    $output = & $FilePath @ArgumentList 2>$ErrorPath | Out-String
    $exitCode = $LASTEXITCODE
  } catch {
    $output = $_ | Out-String
    $exitCode = 1
  } finally {
    $ErrorActionPreference = $previousPreference
  }

  Write-TextFile -Path $OutputPath -Content $output

  return @{
    ExitCode = $exitCode
    Output = $output
  }
}

function Write-ClaudeDiagnostics {
  param(
    [string]$DiagnosticsPath
  )

  $hasAnthropicKey = -not [string]::IsNullOrWhiteSpace($env:ANTHROPIC_API_KEY)
  $whoAmI = try { (whoami | Out-String).Trim() } catch { "unknown" }
  $claudeStatus = try { (claude auth status 2>&1 | Out-String).TrimEnd() } catch { ($_ | Out-String).TrimEnd() }

  $diagnostics = @"
timestamp: $((Get-Date).ToString("o"))
whoami: $whoAmI
cwd: $repoRoot
hasAnthropicApiKey: $hasAnthropicKey

claude auth status:
$claudeStatus
"@

  Write-TextFile -Path $DiagnosticsPath -Content $diagnostics
}

$repoRoot = Get-RepoRoot
$automationRoot = Join-Path $repoRoot "agent-automation"
$reportsDir = Join-Path $automationRoot "reports"
$runsDir = Join-Path $automationRoot "runs"
$stateDir = Join-Path $automationRoot "state"
$logsDir = Join-Path $automationRoot "logs"
$configPath = Join-Path $automationRoot "config.json"

Ensure-Dir -Path $automationRoot
Ensure-Dir -Path $reportsDir
Ensure-Dir -Path $runsDir
Ensure-Dir -Path $stateDir
Ensure-Dir -Path $logsDir

$config = @{
  enabled = $true
  postBuildEnabled = $true
  postCommitEnabled = $true
  watchEnabled = $true
  baseBranch = "main"
}

if (Test-Path -LiteralPath $configPath) {
  $config = Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
}

if (-not $config.enabled) {
  Write-Host "Agent automation is disabled in agent-automation/config.json."
  exit 0
}

$timestamp = Get-Date -Format "yyyy-MM-ddTHH-mm-ss.fffK"
$runId = "{0}--{1}" -f $timestamp.Replace(":", "-"), $Trigger
$runDir = Join-Path $runsDir $runId
Ensure-Dir -Path $runDir

$statusShort = git -C $repoRoot status --short
$statusText = ($statusShort | Out-String).TrimEnd()
$diffStat = git -C $repoRoot diff --stat
$diffStatText = ($diffStat | Out-String).TrimEnd()
$branch = (git -C $repoRoot branch --show-current | Out-String).Trim()

Write-TextFile -Path (Join-Path $runDir "git-status.txt") -Content $statusText
Write-TextFile -Path (Join-Path $runDir "git-diff-stat.txt") -Content $diffStatText

if ([string]::IsNullOrWhiteSpace($statusText)) {
  $summary = @{
    timestamp = (Get-Date).ToString("o")
    trigger = $Trigger
    branch = $branch
    status = "skipped"
    reason = "No working tree changes detected."
  }

  $summaryJson = $summary | ConvertTo-Json -Depth 6
  Write-TextFile -Path (Join-Path $runDir "summary.json") -Content $summaryJson
  Write-TextFile -Path (Join-Path $reportsDir "latest-summary.json") -Content $summaryJson
  Write-Host "No working tree changes detected. Skipping agent run."
  exit 0
}

if ($DryRun) {
  $summary = @{
    timestamp = (Get-Date).ToString("o")
    trigger = $Trigger
    branch = $branch
    status = "dry-run"
    runDir = $runDir
  }

  $summaryJson = $summary | ConvertTo-Json -Depth 6
  Write-TextFile -Path (Join-Path $runDir "summary.json") -Content $summaryJson
  Write-TextFile -Path (Join-Path $reportsDir "latest-summary.json") -Content $summaryJson
  Write-Host "Dry run completed at $runDir"
  exit 0
}

$claudePath = Get-CommandPathOrNull -Name "claude"
$codexPath = Get-CommandPathOrNull -Name "codex"

$claudePrompt = @"
You are the automated builder/checker for this repository.

Repository root: $repoRoot
Trigger: $Trigger
Branch: $branch

Current changed files:
$statusText

Current diff stat:
$diffStatText

Inspect the current working tree and run the most relevant verification commands for the changed work.
Do not edit any files.
Return a concise report with these sections:
1. Scope
2. Checks Run
3. Findings
4. Build Readiness
5. Recommended Next Step
"@

$claudeOutputPath = Join-Path $runDir "claude-report.txt"
$claudeErrorPath = Join-Path $runDir "claude-error.txt"
$claudeDiagnosticsPath = Join-Path $runDir "claude-diagnostics.txt"
$claudeResult = @{
  ExitCode = 1
  Output = "Claude CLI not available."
}

if ($null -ne $claudePath) {
  $claudeArgs = @(
    "-p",
    "--add-dir", $repoRoot,
    "--permission-mode", "bypassPermissions",
    "--dangerously-skip-permissions",
    "--output-format", "text",
    $claudePrompt
  )

  $claudeResult = Invoke-Capture -FilePath $claudePath -ArgumentList $claudeArgs -OutputPath $claudeOutputPath -ErrorPath $claudeErrorPath
} else {
  Write-TextFile -Path $claudeOutputPath -Content $claudeResult.Output
}

if ($claudeResult.ExitCode -ne 0) {
  Write-ClaudeDiagnostics -DiagnosticsPath $claudeDiagnosticsPath
}

$codexPrompt = @"
Review the current uncommitted changes in this repository.

Repository root: $repoRoot
Trigger: $Trigger
Branch: $branch
Base branch: $($config.baseBranch)

Claude builder report path:
$claudeOutputPath

Use the Claude report as extra context, but independently verify the code.
Prioritize bugs, regressions, missing tests, and risky behavior changes.
"@

$codexOutputPath = Join-Path $runDir "codex-review.txt"
$codexErrorPath = Join-Path $runDir "codex-error.txt"
$codexResult = @{
  ExitCode = 1
  Output = "Codex CLI not available."
}

if ($null -ne $codexPath) {
  $codexArgs = @(
    "exec",
    "review",
    "--uncommitted",
    "--base", $config.baseBranch,
    "-o", $codexOutputPath
  )

  $codexResult = Invoke-Capture -FilePath $codexPath -ArgumentList $codexArgs -OutputPath $codexOutputPath -ErrorPath $codexErrorPath
} else {
  Write-TextFile -Path $codexOutputPath -Content $codexResult.Output
}

$summary = @{
  timestamp = (Get-Date).ToString("o")
  trigger = $Trigger
  branch = $branch
  status = "completed"
  runDir = $runDir
  claude = @{
    exitCode = $claudeResult.ExitCode
    reportPath = $claudeOutputPath
  }
  codex = @{
    exitCode = $codexResult.ExitCode
    reportPath = $codexOutputPath
  }
}

$summaryJson = $summary | ConvertTo-Json -Depth 6
Write-TextFile -Path (Join-Path $runDir "summary.json") -Content $summaryJson
Write-TextFile -Path (Join-Path $reportsDir "latest-summary.json") -Content $summaryJson

Write-Host "Agent review cycle completed."
Write-Host "Claude report: $claudeOutputPath"
Write-Host "Codex review: $codexOutputPath"
