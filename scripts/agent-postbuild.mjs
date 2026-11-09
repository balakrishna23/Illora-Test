#!/usr/bin/env node
// Cross-platform entry point for the local agent-automation post-build hook.
// The hook itself is Windows-only dev tooling (scripts/agent-postbuild.ps1);
// on any other platform (CI, Linux hosting) this is a no-op so `npm run
// build` never fails on `powershell` being unavailable.
import { execFileSync } from "node:child_process";

if (process.platform === "win32") {
  execFileSync(
    "powershell",
    ["-ExecutionPolicy", "Bypass", "-File", "scripts/agent-postbuild.ps1"],
    { stdio: "inherit" }
  );
}
