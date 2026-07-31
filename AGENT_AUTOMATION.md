# Agent Automation

This repo can now trigger a two-agent workflow automatically:

1. Claude inspects the current working tree and runs the most relevant checks it can.
2. Codex reviews the same uncommitted changes and writes a code review report.

Reports are written under `agent-automation/runs/`, and the latest run summary is kept in `agent-automation/reports/latest-summary.json`.

## Commands

```bash
npm run agents:cycle
npm run agents:cycle -- -DryRun
npm run agents:watch:start
npm run agents:watch:stop
npm run agents:hooks:install
```

## Triggers

- The background watcher reacts to stabilized file changes in the working tree.
- Git hooks can trigger review runs after commits and merges.
- `postbuild` can trigger a run after `npm run build`.

## Notes

- The watcher logs to `agent-automation/logs/`.
- `agent-automation/config.json` controls whether the automation is enabled.
- The automation skips `postbuild` when `CI=true`.
