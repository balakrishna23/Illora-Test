# Agent Bridge

This repo now includes a tiny shared message bridge for Codex and Claude.

Messages are stored as one JSON file per message in `agent-bridge/messages/`, which avoids file-lock contention between separate agent sessions.

## Commands

```bash
npm run agent:send -- --from codex --to claude --message "Can you review the new admin flow?"
npm run agent:inbox -- --agent claude
npm run agent:thread -- --a codex --b claude
```

## Notes

- Use short agent ids like `codex` and `claude`.
- The bridge is append-only and human-readable.
- `inbox` filters by recipient, and `thread` shows both directions.
- The script still reads the older `.agents/bridge/messages.jsonl` log if it exists.
