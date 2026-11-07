---
trigger: model_decision
description: "Apply when writing, refactoring or reviewing Glow & Go JavaScript, React, Express or MongoDB code. Emphasizes simplicity and evidence-based engineering."
---

# Glow & Go — Code Discipline

Core principles for clean code, anti-over-engineering, and JavaScript/TypeScript code quality; customized for this project's approved stack.

- Make only changes needed for the approved task. Prefer the smallest working approach.
- Do not introduce dependencies, design patterns or layers without a concrete use case.
- Never invent library APIs, versions, function signatures or successful test results. Check existing code or documentation.
- Favor readable names, focused functions/components, explicit error states and early returns where helpful.
- Preserve existing working behavior; avoid rewriting entire files for a local fix.
- Treat auto-suggested product attributes as unverified until the user confirms them.
- Keep secrets in backend environment variables; do not expose tokens to React or Git.
- Explain assumptions, tradeoffs, changed files, and any checks that were not performed.
- Follow `AGENTS.md` if in doubt; do not bypass user approval checkpoints.
