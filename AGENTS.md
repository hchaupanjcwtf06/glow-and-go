# Glow & Go — AI Engineering Instructions

## 1. Project and source of truth
Glow & Go is a personal skincare management website with a visual day/night product shelf, user-selected skin profile and goals, daily routines informed by weather/UV/air quality, check-ins, and trend reports.
Before editing code, read `PROGRESS.md` and inspect the relevant existing files. Do not assume the repository, dependencies, deployments, or features exist unless verified. If requirements conflict, ask before changing product scope.

## 2. Approved stack
- `client/`: React with Vite, Tailwind CSS, Motion for React (Framer Motion), React Context API, Axios. Deploy to Vercel.
- `server/`: Node.js, Express, MongoDB Atlas (use a MongoDB driver or Mongoose only after agreement). Deploy to Render.
- APIs: weather/UV/air quality provider and Gemini for product data suggestions, called through the backend.
- Do not add Redux, Prisma, SQL databases, component libraries, or other major dependencies without approval. For minor dependencies, explain the need first.

## 3. Architecture and quality
- Keep client and server separate. Frontend calls backend APIs; no service credentials or AI/weather API secrets in the frontend.
- Use reusable components; keep views, application logic, HTTP requests, and data access appropriately separated. Avoid abstractions with no current use.
- REST endpoints use appropriate methods and status codes. Validate and sanitize untrusted inputs server-side, enforce access control by authenticated user, and return structured errors.
- Passwords must be securely hashed using an established library; never store raw passwords. Do not log credentials, tokens, personal notes, or secret keys.
- Store secrets in environment variables; add `.env` to `.gitignore`, maintain a redacted `.env.example`. Do not commit private keys or credentials.
- Build accessible, responsive UI: semantic HTML, keyboard operability, visible focus, meaningful labels, sufficient contrast, and reduced-motion handling for animations.
- Favor simple, readable functions; consistent naming; no unrelated refactors. Do not invent APIs, filenames, test results, or screenshots.

## 4. Skincare-specific safety and data quality
- Suggestions are wellness guidance, not diagnosis or medical treatment. Never claim that analytics prove a product causes an improvement.
- A rule-based safety filter must validate routine suggestions before display. Consider user-reported sensitivity, treatments, product ingredients/actives, and possible conflicts. When data is missing, prefer a conservative suggestion and explain uncertainty.
- UV/AQI data may influence reminders, but high AQI must not automatically trigger harsh cleansing. Do not treat AI-extracted product facts as verified.
- Product auto-fill is a draft: show matched name/variant, source or uncertainty where available, and allow user review/edit before saving. Avoid inventing product ingredients or benefits.
- Log consented, minimal data. Distinguish user-entered ratings from inferred insights; show sample size and limitations in reports.

## 5. Controlled vibe-coding workflow
1. At the start of each session, inspect `PROGRESS.md` and relevant files. Summarize verified state and propose exactly one manageable milestone.
2. Before major changes, state which files will change, why, acceptance criteria, and how to test.
3. Implement only the approved milestone; do not create unrelated features, modify stack, or deploy/push without approval.
4. Run relevant checks where available. Report exact commands and outcomes; if not run, explicitly say so.
5. Suggest a meaningful Git commit only after the milestone is coherent and checked; do not make artificial one-file commits. Never commit or push without explicit permission.
6. Update `PROGRESS.md` at session end with verified completed work, pending work, bugs/blockers, tests, and next single milestone. Never mark unchecked work as done.
7. Explain beginner-critical terminal, Git, and VS Code steps; do not assume a repository or tooling has already been created.

## 6. Initial MVP order
1. Initialize repository structure and local frontend/backend health checks.
2. Establish API integration and deployment health checks (after local validation).
3. Authentication and onboarding (Skin Profile + Goals).
4. Product CRUD and visual day/night shelf.
5. AI-assisted product draft and user verification.
6. Environmental data and deterministic routine engine.
7. Check-ins, history, reports; then optional gamification and advanced drag/drop.
