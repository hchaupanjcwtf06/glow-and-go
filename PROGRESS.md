# Glow & Go — Project Progress

## Project scope
A client/server skincare application with user skin profile and goals, interactive day/night virtual shelf, reviewable AI product auto-fill, environmental-data-informed routine suggestions, daily check-ins, and trend reports.

## Approved stack
- Frontend: React + Vite, Tailwind CSS, Motion for React (Framer Motion), Context API, Axios — planned Vercel deployment.
- Backend: Node.js + Express — planned Render deployment.
- Database: MongoDB Atlas.
- External services (to evaluate): Weather/UV/AQI provider, Gemini API called from backend.

## Verified current state
### 2026-10-28 — Initial state & Planning
- Two planning files supplied for review: `.antigravityrules` and `PROGRESS.md`.
- The user's original progress note says the repository was newly initialized, but this has **not** been independently verified.
- No client/server code, installs, tests, Git history, or deployments have been verified in this review.
- PatrickJS/awesome-cursorrules has **not** been cloned into the project.

### 2026-10-28 — Milestones M0 & M1 verified
- Milestone M0 completed and committed (`f471317`): Repository structure, ignore rules, and tooling verified.
- Milestone M1 completed and committed (`5a1ceed`): Express backend and React Vite frontend initialized with `/api/health`.

### 2026-11-07 — Milestone M2 verified
- Milestone M2 completed and committed (`7d89bdd`):
  - Backend dynamic CORS, structured 404 handler, centralized error handler, and enriched `/api/health` endpoint.
  - Frontend centralized API client (`client/src/services/api.js`) utilizing `VITE_API_BASE_URL`.
  - Comprehensive syntax checks (`node --check`), client production build (`npm.cmd run build`), client linter (`oxlint`), and live endpoint testing (`Invoke-RestMethod`) verified with 0 errors.

### 2026-11-07 — Milestone M3 verified
- Milestone M3 completed and committed (`0c3004b`):
  - Backend MongoDB connection setup with Mongoose (`server/src/db.js`) with graceful fallback when unconfigured.
  - User model with nested Skin Profile schema (`server/src/models/User.js`): `skinType`, `concerns`, `goals`, `sensitivityLevel`, `isOnboarded`.
  - Authentication middleware (`server/src/middlewares/auth.js`) validating Bearer JWT tokens.
  - Auth controllers & routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/skin-profile`) using `bcryptjs` and `jsonwebtoken`.
  - Frontend React 19 AuthContext, Axios interceptor for JWT injection, AuthModal (Login/Register), OnboardingModal (Skin Survey), and SkinProfileCard.
  - Verification: 0 syntax errors, 0 linter warnings (`oxlint`), production build in 253ms, live endpoint tests (401 on missing/bad token, 400 on invalid input, 503 on unconfigured DB).

## Milestone tracker
- [x] M0 — Verify local repo, Git status, Node/npm, and folder structure; add project instructions and `.gitignore` if needed.
- [x] M1 — Initialize `client/` Vite React and `server/` Express; verify both run locally and backend has `/api/health`.
- [x] M2 — Configure environment variables, CORS, API integration and safe deployment smoke tests.
- [x] M3 — Authentication and first-login onboarding with Skin Profile + Goals.
- [ ] M4 — Product CRUD and interactive day/night virtual shelf.
- [ ] M5 — Gemini-assisted product auto-fill with user review.
- [ ] M6 — Weather/UV/AQI ingestion and rule-based daily routine suggestions.
- [ ] M7 — Daily check-in, product-use history, analytics and report caveats.
- [ ] M8 — Optional streak rewards, themes, sticker/drag-drop upgrades.

## Current focus
**M3 completed and committed (`0c3004b`). Ready for planning Milestone M4.**

## Next actions
1. Present M3 verification results and changed files for user review.
2. Suggest a single, coherent Git commit message for Milestone M3.
3. Await user approval before committing or planning Milestone M4.

## Verification / tests
### Milestones M0 & M1 (2026-10-28)
- Runtime verification: Node.js `v24.22.0` and npm `11.19.1` verified via `node -v` and `npm.cmd -v`.
- Ignore rules verification:
  - Positive tests (`git check-ignore -v` and `git check-ignore -q`): verified `.env`, `client/.env`, `server/.env`, `client/.env.local`, `server/.env.production`, `node_modules/`, `client/node_modules`, `server/node_modules`, `client/dist/` are correctly ignored (exit code 0).
  - Negative tests (`git check-ignore -q`): verified `.env.example`, `client/.env.example`, `server/.env.example` are NOT ignored and can be safely committed (exit code 1).
- Backend verification:
  - `server/src/app.js` and `server/src/index.js` configured with ES Modules (`"type": "module"`), Express, CORS, and dotenv.
  - Started on port 5000 (`npm.cmd start`).
  - Tested `GET http://localhost:5000/api/health` via `Invoke-RestMethod`: returned HTTP 200 with `{ "status": "ok", "service": "glow-and-go-backend", "timestamp": "..." }`.
- Frontend & Proxy verification:
  - Initialized `client/` using official Vite React JavaScript template (`npm.cmd create vite@latest client -- --template react`).
  - Integrated Tailwind CSS v4 using official `@tailwindcss/vite` plugin and `@import "tailwindcss";` in `src/index.css`.
  - Configured Vite dev server on port 3000 with `/api` proxy targeting `http://localhost:5000`.
  - Tested `GET http://localhost:3000/api/health` via `Invoke-RestMethod` and `curl.exe`: returned HTTP 200 with matching backend payload, verifying proxy and CORS transparency.
- Production build verification:
  - Executed `npm.cmd run build` in `client/`: built in 300ms without errors, producing `dist/index.html`, `dist/assets/index-*.css` (containing Tailwind v4 utility styles), and `dist/assets/index-*.js`.
- Repository status: Untracked changes are strictly contained within `client/` and `server/` source files and `PROGRESS.md`.

### Milestone M2 (2026-11-07)
- Runtime verification: Node.js `v24.22.0` and npm `11.19.1` verified.
- Backend syntax verification:
  - `node --check server/src/app.js` and `node --check server/src/index.js`: passed with exit code 0.
- Backend API & error handling verification:
  - Started backend service (`node server/src/index.js`).
  - Tested `GET http://localhost:5000/api/health` via `Invoke-RestMethod`: returned HTTP 200 with `{ status: "ok", service: "glow-and-go-backend", environment: "development", uptime: 4, timestamp: "..." }`.
  - Tested `GET http://localhost:5000/api/non-existent` via `Invoke-RestMethod`: correctly captured HTTP 404 with structured JSON payload `{"error": {"message": "Route not found", "status": 404}}`.
- Frontend code quality & build verification:
  - Created centralized Axios service in `client/src/services/api.js` using `import.meta.env.VITE_API_BASE_URL || '/api'`.
  - Updated `client/src/App.jsx` to consume `api.get('/health')` and handle error response objects.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across all files.
  - Ran `npm.cmd run build` in `client/`: built production bundle in 594ms producing `dist/index.html`, `dist/assets/index-*.css`, and `dist/assets/index-*.js`.
- Environment files:
  - `client/.env.example` and `server/.env.example` documented with comments for dev proxy and production deployment.

### Milestone M3 (2026-11-07)
- Dependencies verification:
  - Installed `mongoose` (ODM), `bcryptjs` (password hashing), and `jsonwebtoken` (auth tokens) in `server/`.
- Backend syntax verification:
  - Passed `node --check` for `server/src/db.js`, `server/src/models/User.js`, `server/src/middlewares/auth.js`, `server/src/controllers/authController.js`, `server/src/routes/authRoutes.js`, `server/src/app.js`, and `server/src/index.js` with exit code 0.
- Live API endpoint & Auth verification:
  - `GET http://localhost:5000/api/health`: returned HTTP 200 with `{ status: "ok", database: "disconnected", ... }` confirming graceful fallback when `MONGODB_URI` is unconfigured.
  - `GET http://localhost:5000/api/auth/me` without Authorization header: returned HTTP 401 with `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `GET http://localhost:5000/api/auth/me` with invalid Bearer token: returned HTTP 401 with `{"error":{"message":"Invalid authentication token.","status":401}}`.
  - `POST http://localhost:5000/api/auth/register` with short name: returned HTTP 400 with `{"error":{"message":"Name is required and must be at least 2 characters long.","status":400}}`.
  - `POST http://localhost:5000/api/auth/login` with missing fields: returned HTTP 400 with `{"error":{"message":"Email and password are required.","status":400}}`.
  - `POST http://localhost:5000/api/auth/register` when DB is disconnected: returned HTTP 503 with `{"error":{"message":"Database is currently unavailable. Please verify MONGODB_URI configuration.","status":503}}`.
- Frontend code quality & build verification:
  - Implemented `AuthContext`, `useAuth`, Axios interceptors, `AuthModal`, `OnboardingModal`, and `SkinProfileCard`.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across all 10 source files.
  - Executed `npm.cmd run build` in `client/`: built production bundle in 253ms without errors.

## Known issues and decisions pending
- Windows PowerShell blocks script execution (`PSSecurityException` on `npm.ps1`); `npm.cmd` and `npx.cmd` must be used for package management commands.
- Product data source, authentication method, API providers, and exact MongoDB schema to be addressed in subsequent milestones.
- Milestone M3 completed: MongoDB Atlas connection string (`MONGODB_URI`) can be set in `server/.env` when connecting to active Atlas cluster.
- Never include real secrets in Git, screenshots, or shared logs.

## Session log
### 2026-10-28 — Planning review
- Reviewed the two provided planning files.
- Replaced forced file-by-file commits with milestone-based commits.
- Prepared a portable `AGENTS.md` and streamlined agent-specific rules.
- No app code, commits, remote changes, or deployments performed.

### 2026-10-28 — Milestone M0 completed
- Verified Git repository status, Node.js (`v24.22.0`), and npm (`11.19.1`).
- Created root `.gitignore` protecting root, client, and server `.env` files while allowing `.env.example` files to be committed.
- Created project `README.md` documenting tech stack, architecture, Windows PowerShell notes, and milestones.
- Ran comprehensive `git check-ignore` checks confirming ignore and exemption rules work as expected.
- Verified no application code was generated and no dependencies were installed.
- Marked Milestone M0 as complete.

### 2026-10-28 — Milestone M1 completed
- Initialized `server/` with Express, CORS, and dotenv using ES Modules.
- Created minimal Express health check endpoint `GET /api/health` returning status, service, and timestamp.
- Initialized `client/` using official Vite React template (`create-vite` v9.3.3) with React 19.
- Added Axios and configured Tailwind CSS v4 with `@tailwindcss/vite` and `@import "tailwindcss";`.
- Configured Vite dev server on port 3000 with `/api` proxy targeting `http://localhost:5000`.
- Created minimal status UI in `client/src/App.jsx` styled with Tailwind utility classes.
- Verified backend health endpoint directly on port 5000 and via Vite proxy on port 3000.
- Verified frontend production build (`npm.cmd run build`) with zero errors.
- Added `client/.env.example` and `server/.env.example`.
- Confirmed zero skincare features, database connections, external APIs, or deployments.
- Marked Milestone M1 as complete.

### 2026-11-07 — Milestone M2 completed
- Configured dynamic CORS in `server/src/app.js` with `CLIENT_ORIGIN` support.
- Added structured 404 handler and central error handling middleware in Express.
- Extended `/api/health` to report `environment` and `uptime`.
- Created centralized Axios client in `client/src/services/api.js`.
- Updated `client/src/App.jsx` to fetch health data via the API client service and display uptime/environment.
- Verified backend endpoints, 404 handling, oxlint, and client production build.
- Updated `.env.example` files for client and server.
- Marked Milestone M2 as complete.

### 2026-11-07 — Milestone M3 completed
- Added Mongoose connection module `server/src/db.js` with graceful fallback for unconfigured environments.
- Implemented `server/src/models/User.js` with schema validation for `skinType`, `concerns`, `goals`, `sensitivityLevel`, and `isOnboarded`.
- Created `server/src/middlewares/auth.js` for JWT Bearer verification.
- Implemented `server/src/controllers/authController.js` and `server/src/routes/authRoutes.js` (`/register`, `/login`, `/me`, `/skin-profile`).
- Configured `client/src/services/api.js` request interceptor for automated JWT token attachment and 401 handling.
- Built React AuthContext (`client/src/context/`), AuthModal (Đăng ký / Đăng nhập), OnboardingModal (Khảo sát hồ sơ làn da), and SkinProfileCard.
- Updated `client/src/App.jsx` to provide interactive authentication flow and onboarding completion.
- Verified all endpoints with `Invoke-RestMethod`, verified `oxlint` (0 errors, 0 warnings), and verified `npm.cmd run build` (253ms).
- Marked Milestone M3 as complete.
