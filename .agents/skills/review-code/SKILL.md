---
name: review-code
description: Reviews Glow & Go React, Express and MongoDB changes for correctness, security, accessibility, simplicity, and milestone readiness. Use after implementation, before committing, or when asked to audit code.
---

# Glow & Go — Code Review

## Read context
- Read `AGENTS.md` and `PROGRESS.md` before reviewing.
- Inspect actual changed files and, if authorized, `git diff` / `git status`.
- Review only the requested milestone or change scope. Do not edit code unless explicitly approved.

## Audit in priority order
1. **Correctness:** Compare behavior with approved acceptance criteria. Identify broken flows, null cases, unexpected API responses and invalid state transitions.
2. **Security and privacy:** Check secret handling, per-user data isolation, authentication/authorization, input validation, file handling, error exposure, and API rate limits where appropriate.
3. **Skincare safety:** Routine suggestions must follow rule-based safeguards, not solely AI outputs; product autofill requires user confirmation; avoid medical diagnoses and unsupported effectiveness claims.
4. **Frontend:** Check React state and effects, accessibility (labels, keyboard interaction, reduced motion), responsiveness, loading/empty/error states and cleanup of listeners.
5. **Backend and data:** Check REST status codes, centralized error responses, schema validation, MongoDB ownership filters, date/time handling and minimal indexes as needed.
6. **Simplicity:** Flag unrelated files, speculative abstractions, duplicate logic, unnecessary packages and large rewrites for minor changes.
7. **Verification:** Run only authorized available tests; report commands and actual outcomes. Never invent passing results.

## Required report format
- Scope reviewed; files inspected.
- Findings grouped by **Critical / High / Medium / Low**, each with file/location, evidence, impact and smallest suggested fix.
- Explicitly state **No findings** if none were detected; do not equate this with proof of bug-free code.
- Tests run and results, plus tests not run.
- Milestone readiness: **Ready / Not ready / Needs verification** with reason.
- Do not change files, commit, push, deploy or move milestones unless the user approves.
