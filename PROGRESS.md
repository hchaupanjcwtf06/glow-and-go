# Glow & Go — Project Progress

## Project scope
A client/server skincare application with user skin profile and goals, interactive day/night virtual shelf, reviewable AI product auto-fill, environmental-data-informed routine suggestions, daily check-ins, and trend reports.

## Approved stack
- Frontend: React + Vite, Tailwind CSS, Motion for React (Framer Motion), Context API, Axios — planned Vercel deployment.
- Backend: Node.js + Express — planned Render deployment.
- Database: MongoDB Atlas.
- External services (to evaluate): Weather/UV/AQI provider, Gemini API called from backend.

## Verified current state — 2026-10-28
- Two planning files supplied for review: `.antigravityrules` and `PROGRESS.md`.
- The user's original progress note says the repository was newly initialized, but this has **not** been independently verified.
- No client/server code, installs, tests, Git history, or deployments have been verified in this review.
- PatrickJS/awesome-cursorrules has **not** been cloned into the project.

## Milestone tracker
- [ ] M0 — Verify local repo, Git status, Node/npm, and folder structure; add project instructions and `.gitignore` if needed.
- [ ] M1 — Initialize `client/` Vite React and `server/` Express; verify both run locally and backend has `/api/health`.
- [ ] M2 — Configure environment variables, CORS, API integration and safe deployment smoke tests.
- [ ] M3 — Authentication and first-login onboarding with Skin Profile + Goals.
- [ ] M4 — Product CRUD and interactive day/night virtual shelf.
- [ ] M5 — Gemini-assisted product auto-fill with user review.
- [ ] M6 — Weather/UV/AQI ingestion and rule-based daily routine suggestions.
- [ ] M7 — Daily check-in, product-use history, analytics and report caveats.
- [ ] M8 — Optional streak rewards, themes, sticker/drag-drop upgrades.

## Current focus
**M0: Verify and prepare repository before generating app code.**

## Next actions
1. Confirm which AI coding agent is used inside VS Code (Copilot, Codex, Antigravity, Cursor, or another extension) to enable the correct instruction-file loading.
2. Open the actual project root in VS Code and inspect folder tree and `git status`.
3. Add `AGENTS.md`, update `.antigravityrules` and `PROGRESS.md`; selectively adapt external rules only when needed.
4. After M0 is verified, start M1 with explicit acceptance criteria.

## Verification / tests
- Not run. No project source code was provided for local execution.

## Known issues and decisions pending
- Coding agent and its instruction-file discovery behavior have not been confirmed.
- Product data source, authentication method, API providers, and exact MongoDB schema not yet selected.
- Never include real secrets in Git, screenshots, or shared logs.

## Session log
### 2026-10-28 — Planning review
- Reviewed the two provided planning files.
- Replaced forced file-by-file commits with milestone-based commits.
- Prepared a portable `AGENTS.md` and streamlined agent-specific rules.
- No app code, commits, remote changes, or deployments performed.
