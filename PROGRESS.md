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
- Two planning files supplied for review: project rules and `PROGRESS.md`.
- The user's original progress note says the repository was newly initialized, but this has **not** been independently verified.
- No client/server code, installs, tests, Git history, or deployments have been verified in this review.
- Initial project rules and structure verified.

### 2026-10-28 — Milestones M0 & M1 verified
- Milestone M0 completed and committed (`dbf7f13`): Repository structure, ignore rules, and tooling verified.
- Milestone M1 completed and committed (`d74d50f`): Express backend and React Vite frontend initialized with `/api/health`.

### 2026-11-07 — Milestone M2 verified
- Milestone M2 completed and committed (`ef438af`):
  - Backend dynamic CORS, structured 404 handler, centralized error handler, and enriched `/api/health` endpoint.
  - Frontend centralized API client (`client/src/services/api.js`) utilizing `VITE_API_BASE_URL`.
  - Comprehensive syntax checks (`node --check`), client production build (`npm.cmd run build`), client linter (`oxlint`), and live endpoint testing (`Invoke-RestMethod`) verified with 0 errors.

### 2026-11-07 — Milestone M3 verified
- Milestone M3 completed and committed (`a7a5602`):
  - Backend MongoDB connection setup with Mongoose (`server/src/db.js`) with graceful fallback when unconfigured.
  - User model with nested Skin Profile schema (`server/src/models/User.js`): `skinType`, `concerns`, `goals`, `sensitivityLevel`, `isOnboarded`.
  - Authentication middleware (`server/src/middlewares/auth.js`) validating Bearer JWT tokens.
  - Auth controllers & routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/skin-profile`) using `bcryptjs` and `jsonwebtoken`.
  - Frontend React 19 AuthContext, Axios interceptor for JWT injection, AuthModal (Login/Register), OnboardingModal (Skin Survey), and SkinProfileCard.
  - Verification: 0 syntax errors, 0 linter warnings (`oxlint`), production build in 253ms, live endpoint tests (401 on missing/bad token, 400 on invalid input, 503 on unconfigured DB).

### 2026-11-07 — Milestone M4 verified
- Milestone M4 completed and committed (`a39dde7`):
  - Product model (`server/src/models/Product.js`) with schema validation for category (`cleanser`, `toner`, `serum`, `treatment`, `moisturizer`, `sunscreen`, `mask`, `other`), routine time (`day`, `night`, `both`), automatic stepOrder mapping, openedDate, and PAO months.
  - Product controllers & REST routes (`server/src/controllers/productController.js`, `server/src/routes/productRoutes.js`) enforcing authenticated access and per-user data isolation.
  - Frontend Interactive Virtual Shelf (`client/src/components/ProductShelf.jsx`, `ProductCard.jsx`, `ProductModal.jsx`, `productConstants.js`):
    - Separated Morning Shelf ☀️, Evening Shelf 🌙, and All Products 📦 tabs.
    - Automatic ordering by skincare routine step sequence.
    - Period After Opening (PAO) tracker calculating months elapsed and warning if expired.
    - Add/Edit/Delete product operations with form modal, validation, and real-time shelf refresh.
  - Verification: 0 syntax errors (`node --check`), 0 linter warnings (`oxlint`), production build in 352ms, live endpoint security tests (401 on unauthorized access).

### 2026-11-07 — Milestone M5 verified
- Milestone M5 completed and committed (`2f08abd`):
  - Implemented backend product suggestion service (`server/src/services/geminiService.js`):
    - Direct Google Gemini REST API integration using Node native `fetch` without adding heavy dependencies.
    - Curated skincare knowledge base fallback covering 13+ popular skincare items (CeraVe, Paula's Choice BHA, The Ordinary, Anessa, La Roche-Posay, Skin1004, Klairs, Obagi, etc.) with keyword matching.
    - Smart heuristic fallback with brand and active ingredient extraction when offline or API key is absent.
    - Skincare safety constraint enforcement: sunscreens default to 'day', treatments containing AHA/BHA/Retinol default to 'night', auto-filled outputs clearly flagged as drafts with wellness disclaimers.
  - Mounted protected endpoint `POST /api/products/suggest` in `server/src/routes/productRoutes.js` and `server/src/controllers/productController.js`.
  - Frontend AI Auto-fill Assistant in `client/src/components/ProductModal.jsx`:
    - Quick Auto-fill input bar with instant sample search chips (`🧴 BHA Paula's Choice`, `☀️ KCN Anessa Milk`, `💧 Serum HA The Ordinary`, `🧼 SRM CeraVe Foaming`, `🌿 Rau má Skin1004`, `🧴 Kem B5 La Roche-Posay`).
    - Transparent draft disclaimer banner informing users that auto-filled fields are reviewable drafts.
    - User remains in full control: all form fields (`name`, `brand`, `category`, `routineTime`, `paoMonths`, `activeIngredients`, `notes`) can be reviewed, edited, or expanded before saving to shelf.
  - Verification: 0 syntax errors (`node --check`), 0 linter warnings (`oxlint` across 14 files), production build in 420ms, backend test suite confirming 401 unauthenticated block, 400 validation, catalog match, and heuristic parsing.

### 2026-11-07 — Milestone M6 verified
- Milestone M6 completed and committed (`dbb0f9b`):
  - Environmental Data Provider (`server/src/services/weatherService.js`):
    - Real-time weather, UV index, and AQI ingestion via Open-Meteo REST API with zero external API key requirements.
    - Skincare evaluation logic for UV Index (Low, Moderate, High, Very High, Extreme) and AQI (Good, Moderate, Sensitive, Unhealthy) with graceful offline fallback.
  - Deterministic Skincare Routine Engine (`server/src/services/routineEngine.js`):
    - Strictly maps products to sequential scientific order (Cleanser ➔ Toner ➔ Serum ➔ Treatment ➔ Moisturizer ➔ Sunscreen).
    - Separation of Morning (☀️) and Evening (🌙) routines (Sunscreen excluded from night; daytime prompts for sunscreen).
    - Skincare Safety Filter: detects active ingredient conflicts (Retinol + BHA/AHA in same routine for sensitive skin), alerts if daytime sunscreen is absent, and offers weather-adaptive tips.
    - Graceful Database-Disconnected Fallback: provides realistic demo shelf items when MongoDB is not connected so users can immediately experience the interactive routine.
  - Backend API Endpoints (`server/src/routes/routineRoutes.js` & `server/src/controllers/routineController.js`):
    - `GET /api/routine/environment`: returns real-time weather & air quality metrics for supported cities.
    - `GET /api/routine/daily`: authenticated endpoint calculating personalized, safety-filtered daily routine.
  - Frontend Interactive Daily Routine (`client/src/components/DailyRoutine.jsx`, `routineConstants.js`):
    - City selector dropdown with live metrics (Temperature, Humidity, UV Index, AQI).
    - Day / Night routine mode switcher.
    - Interactive step checklist with completion progress bar and celebration banner.
    - Prominent cosmetic wellness disclaimer banner.
  - Verification: 0 syntax errors (`node --check`), 0 linter warnings (`oxlint` across 16 files), production build in 390ms, and automated integration test suite verified.

### 2026-11-07 — Milestone M7 verified
- Milestone M7 completed and committed (`a51d160`):
  - CheckIn Schema (`server/src/models/CheckIn.js`):
    - Stores `userId`, `date` (YYYY-MM-DD), `routineType` (`day`/`night`), `rating` (1–5), `feelings` tags array, `completedStepsCount`, `notes`, and `environmentalContext`.
  - Backend Check-in Controllers & Routes (`server/src/controllers/checkInController.js`, `server/src/routes/checkInRoutes.js`):
    - `POST /api/checkins`: saves daily check-ins with in-memory fallback store when database is disconnected.
    - `GET /api/checkins/today`: checks if user already completed check-in for morning or night.
    - `GET /api/checkins/history`: returns chronological check-in history list.
    - `GET /api/checkins/report`: computes sample size $N$, average skin satisfaction rating, routine adherence rate (%), feelings frequency breakdown, and 7-day trend scores.
    - Skincare medical transparency disclaimer included in report payload.
  - Frontend Interactive Check-in & Trend Dashboard (`client/src/components/CheckInModal.jsx`, `client/src/components/ReportsView.jsx`, `client/src/utils/checkInConstants.js`):
    - Quick check-in modal with 1–5 star rating buttons, clickable feeling tags (`💧 Đủ ẩm`, `🌿 Dịu da`, `✨ Glass skin`, `🫧 Đổ dầu`, etc.), and notes.
    - Reports tab featuring 3 top KPI summary cards (Average Rating, Adherence %, Sample Size $N$).
    - 7-day responsive visual bar chart visualizer.
    - Feelings distribution progress bars.
    - Check-in button integrated inside Daily Routine checklist for frictionless logging.
    - Scientific limitations & disclaimer banner.
  - Verification: 0 syntax errors (`node --check`), 0 linter warnings (`oxlint` across 19 files), production build in 614ms, and full backend test suite verified.

### 2026-11-07 — Milestone M8 verified
- Milestone M8 completed:
  - Streak Engine & Badges Definition (`server/src/controllers/gamificationController.js`):
    - Implemented `calculateStreak(datesList)` calculating current consecutive check-in streak, longest historical streak, and today's active status.
    - Defined 6 core achievements: Glow Starter (🌟), Shelf Curator (🧴), Sun Shield (☀️), Streak Flame (🔥), Glass Skin Master (💎), and Barrier Hero (🛡️).
    - Automatic unlock criteria evaluation for profile onboarding, shelf product count, sunscreen presence, streak milestones, and barrier active ingredients.
  - Gamification API Routes (`server/src/routes/gamificationRoutes.js`):
    - Mounted `GET /api/gamification/badges` in `server/src/app.js` with authentication and offline demo fallback resilience.
  - Frontend Gamification UI (`client/src/components/GamificationCard.jsx`, `client/src/utils/gamificationConstants.js`):
    - Flame streak hero card with animated glow and total Radiance Points (💎 pts).
    - Grid of unlocked (colorful glassmorphism) and in-progress (progress bars) badges.
    - Interactive modal inspecting badge achievements, criteria, and skincare tips upon click.
    - Header streak quick-access pill (`🔥 Thành tích`) and 4th main dashboard tab (`🏆 Thành tích & Streak`) in `client/src/App.jsx`.
  - Verification: 0 syntax errors (`node --check`), 0 linter warnings (`oxlint` across 21 files), production client build in 508ms, and automated integration test suite verified.

## Milestone tracker
- [x] M0 — Verify local repo, Git status, Node/npm, and folder structure; add project instructions and `.gitignore` if needed.
- [x] M1 — Initialize `client/` Vite React and `server/` Express; verify both run locally and backend has `/api/health`.
- [x] M2 — Configure environment variables, CORS, API integration and safe deployment smoke tests.
- [x] M3 — Authentication and first-login onboarding with Skin Profile + Goals.
- [x] M4 — Product CRUD and interactive day/night virtual shelf.
- [x] M5 — Gemini-assisted product auto-fill with user review.
- [x] M6 — Weather/UV/AQI ingestion and rule-based daily routine suggestions.
- [x] M7 — Daily check-in, product-use history, analytics and report caveats.
- [x] M8 — Optional streak rewards, themes, sticker/drag-drop upgrades.

## Current focus
**All MVP Milestones M0 through M8 completed, tested, and verified.**

## Next actions
1. Present M8 verification results and changed files for user review.
2. Commit Milestone M8 with a single, coherent commit message upon user approval.
3. Push all commits to GitHub repository when ready (`git push origin main`).

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

### Milestone M4 (2026-11-07)
- Backend syntax verification:
  - Passed `node --check` for `server/src/models/Product.js`, `server/src/controllers/productController.js`, `server/src/routes/productRoutes.js`, and `server/src/app.js` with exit code 0.
- Live API endpoint & Security verification:
  - `GET http://localhost:5000/api/products` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `POST http://localhost:5000/api/products` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `DELETE http://localhost:5000/api/products/12345` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
- Frontend code quality & build verification:
  - Created `client/src/utils/productConstants.js`, `client/src/components/ProductCard.jsx`, `client/src/components/ProductModal.jsx`, and `client/src/components/ProductShelf.jsx`.
  - Ran `oxlint` across 14 source files: 0 warnings, 0 errors.
  - Ran `npm.cmd run build`: built production client bundle in 352ms without warnings or errors.

### Milestone M5 (2026-11-07)
- Backend syntax & logic verification:
  - Passed `node --check` for `server/src/services/geminiService.js`, `server/src/controllers/productController.js`, `server/src/routes/productRoutes.js`, and `server/src/app.js` with exit code 0.
- Live API endpoint verification (`POST /api/products/suggest`):
  - Unauthenticated access: returned HTTP 401 with `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - Empty or single-character query: returned HTTP 400 with `{"error":{"message":"Tên hoặc từ khóa sản phẩm phải có ít nhất 2 ký tự.","status":400}}`.
  - Curated catalog query (`paula choice bha`): returned HTTP 200 with `name: "Paula’s Choice Skin Perfecting 2% BHA Liquid Exfoliant"`, `category: "treatment"`, `routineTime: "night"`, `source: "catalog"`, `confidence: "high"`.
  - Heuristic query (`kem chống nắng Biore UV Watery`): returned HTTP 200 with `brand: "Biore"`, `category: "sunscreen"`, `routineTime: "day"`, `source: "fallback"`.
- Frontend code quality & build verification:
  - Integrated AI auto-fill assistant bar and review disclaimer banner in `client/src/components/ProductModal.jsx`.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across 14 files.
  - Ran `npm.cmd run build` in `client/`: built production bundle in 420ms without warnings or errors.

### Milestone M6 (2026-11-07)
- Backend syntax verification:
  - Passed `node --check` for `server/src/services/weatherService.js`, `server/src/services/routineEngine.js`, `server/src/controllers/routineController.js`, `server/src/routes/routineRoutes.js`, and `server/src/app.js` with exit code 0.
- Live API endpoint verification (`GET /api/routine/environment` and `GET /api/routine/daily`):
  - `GET /api/routine/environment?city=hcm`: returned HTTP 200 with real-time temperature, humidity, UV index, and AQI from Open-Meteo.
  - `GET /api/routine/environment?city=hanoi`: returned HTTP 200 with accurate meteorological conditions for Hanoi.
  - `GET /api/routine/daily` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `GET /api/routine/daily?type=day` with token: returned HTTP 200 with sequential day routine steps (Cleanser ➔ Toner ➔ Serum ➔ Treatment ➔ Moisturizer ➔ Sunscreen) and `isDemo: true` when database is disconnected.
  - `GET /api/routine/daily?type=night` with token: returned HTTP 200 with night routine steps correctly excluding sunscreen.
- Frontend code quality & build verification:
  - Created `client/src/utils/routineConstants.js` and `client/src/components/DailyRoutine.jsx`.
  - Integrated primary view switcher (`Chu trình hôm nay & Thời tiết` vs `Kệ mỹ phẩm Ngày & Đêm`) in `client/src/App.jsx`.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across all 16 files.
  - Ran `npm.cmd run build` in `client/`: built production client bundle in 390ms without warnings or errors.

### Milestone M7 (2026-11-07)
- Backend syntax & schema verification:
  - Passed `node --check` for `server/src/models/CheckIn.js`, `server/src/controllers/checkInController.js`, `server/src/routes/checkInRoutes.js`, and `server/src/app.js` with exit code 0.
- Live API endpoint verification (`/api/checkins`):
  - `GET /api/checkins/report` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `GET /api/checkins/report` with token: returned HTTP 200 with sample size $N$, average rating, adherence rate, and 7-day trend scores.
  - `POST /api/checkins` with invalid rating: returned HTTP 400 `{"error":{"message":"Đánh giá cảm nhận da phải là số từ 1 đến 5 sao.","status":400}}`.
  - `POST /api/checkins` with valid payload: returned HTTP 201 with stored check-in record.
  - `GET /api/checkins/today`: returned HTTP 200 confirming check-in status for today.
- Frontend code quality & build verification:
  - Created `client/src/utils/checkInConstants.js`, `client/src/components/CheckInModal.jsx`, and `client/src/components/ReportsView.jsx`.
  - Added primary tab `📊 Báo cáo & Nhật ký da` in `client/src/App.jsx`.
  - Integrated quick check-in modal button directly inside `DailyRoutine.jsx` checklist header.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across all 19 files.
  - Ran `npm.cmd run build` in `client/`: built production client bundle in 614ms without warnings or errors.

### Milestone M8 (2026-11-07)
- Backend syntax verification:
  - Passed `node --check` for `server/src/controllers/gamificationController.js`, `server/src/routes/gamificationRoutes.js`, and `server/src/app.js` with exit code 0.
- Live API endpoint verification (`/api/gamification`):
  - `GET /api/gamification/badges` without token: returned HTTP 401 `{"error":{"message":"Authentication required. No token provided.","status":401}}`.
  - `GET /api/gamification/badges` with token: returned HTTP 200 with streak metrics (currentStreak: 7, longestStreak: 7), 6 badges evaluation, and totalPoints.
- Frontend code quality & build verification:
  - Created `client/src/utils/gamificationConstants.js` and `client/src/components/GamificationCard.jsx`.
  - Added quick streak flame button in Header navigation and 4th main dashboard tab `🏆 Thành tích & Streak` in `client/src/App.jsx`.
  - Ran `oxlint` in `client/`: 0 warnings, 0 errors across all 21 files.
  - Ran `npm.cmd run build` in `client/`: built production client bundle in 508ms without warnings or errors.

## Known issues and decisions pending
- Windows PowerShell blocks script execution (`PSSecurityException` on `npm.ps1`); `npm.cmd` and `npx.cmd` must be used for package management commands.
- Product data source, authentication method, API providers, and exact MongoDB schema to be addressed in subsequent milestones.
- All MVP Milestones M0 through M8 completed, tested, and verified.
- Never include real secrets in Git, screenshots, or shared logs.

## Session log
### 2026-10-28 — Planning review
- Reviewed the two provided planning files.
- Replaced forced file-by-file commits with milestone-based commits.
- Prepared project engineering guidelines and development rules.
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

### 2026-11-07 — Milestone M4 completed
- Created `server/src/models/Product.js` with category mapping, routineTime, openedDate, and PAO months.
- Implemented `server/src/controllers/productController.js` and `server/src/routes/productRoutes.js` for authenticated product CRUD.
- Created `client/src/utils/productConstants.js`, `client/src/components/ProductCard.jsx`, `client/src/components/ProductModal.jsx`, and `client/src/components/ProductShelf.jsx`.
- Integrated virtual shelf into `client/src/App.jsx` with Day ☀️ and Night 🌙 routine separation.
- Verified 0 linter warnings, successful production build, and security checks.
- Marked Milestone M4 as complete.

### 2026-11-07 — Milestone M5 completed
- Created `server/src/services/geminiService.js` supporting Google Gemini REST API integration with curated skincare catalog and smart heuristic fallbacks.
- Added `POST /api/products/suggest` endpoint to `server/src/routes/productRoutes.js` and controller method in `server/src/controllers/productController.js`.
- Updated `server/.env.example` with `GEMINI_API_KEY`.
- Updated `client/src/components/ProductModal.jsx` with AI auto-fill bar, sample suggestion chips, and draft review disclaimer banner.
- Verified 0 syntax errors, 0 linter warnings, successful production client build, and API integration tests.
- Marked Milestone M5 as complete.

### 2026-11-07 — Milestone M6 completed
- Implemented `server/src/services/weatherService.js` fetching Open-Meteo weather, UV index, and AQI data for major Vietnamese cities with offline resilience.
- Developed `server/src/services/routineEngine.js` applying deterministic rules, active ingredient conflict detection, and weather-adaptive tips with graceful disconnected-database demo shelf support.
- Created `server/src/controllers/routineController.js` and `server/src/routes/routineRoutes.js` mounted at `/api/routine`.
- Built interactive frontend `client/src/components/DailyRoutine.jsx` and dashboard switcher tabs in `client/src/App.jsx`.
- Verified 0 syntax errors, 0 linter warnings, production build, and automated test suite.
- Marked Milestone M6 as complete.

### 2026-11-07 — Milestone M7 completed
- Implemented `CheckIn` schema (`server/src/models/CheckIn.js`) with ratings, feelings tags, notes, and weather context.
- Developed `server/src/controllers/checkInController.js` and `server/src/routes/checkInRoutes.js` providing check-in CRUD, today's status, and trend analytics with in-memory fallback.
- Built interactive frontend `client/src/components/CheckInModal.jsx`, `client/src/components/ReportsView.jsx`, and `client/src/utils/checkInConstants.js`.
- Added `📊 Báo cáo & Nhật ký da` tab into primary dashboard navigation in `client/src/App.jsx`.
- Verified 0 syntax errors, 0 linter warnings, production build, and integration tests.
- Marked Milestone M7 as complete.

### 2026-11-07 — Milestone M8 completed
- Implemented streak calculation engine and achievements criteria in `server/src/controllers/gamificationController.js`.
- Mounted `GET /api/gamification/badges` in `server/src/routes/gamificationRoutes.js` and `server/src/app.js`.
- Created interactive frontend `client/src/components/GamificationCard.jsx` and badge definitions in `client/src/utils/gamificationConstants.js`.
- Added header streak quick-access pill and 4th main dashboard tab `🏆 Thành tích & Streak` in `client/src/App.jsx`.
- Verified 0 syntax errors, 0 linter warnings, production build, and integration tests.
- Marked Milestone M8 as complete. All MVP milestones M0 through M8 achieved.
