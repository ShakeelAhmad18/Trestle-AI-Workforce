# 🚀 Trestle AI Workforce — Frontend Studio (React + TypeScript + Vite)

A pixel-perfect, Dribbble-standard enterprise web application built with **React 18**, **TypeScript**, **Vite**, **Tailwind CSS v4**, **Redux Toolkit**, and **React Router DOM**.

This frontend serves as the interactive control room and luxury showcase for the **Trestle Autonomous AI Software Engineering Agency**, connecting directly to the Python LangGraph backend to orchestrate multi-agent software development workflows in real time.

---

## 🎨 Design System & Visual Highlights

```
+---------------------------------------------------------------------------------------------+
|  Trestle           Solutions   Agents ▾   Enterprise   Pricing   Studio        Login  [Get Started] |
+---------------------------------------------------------------------------------------------+
|                                                                                             |
|                                    [ BEST TRAINED AGENTS ]                                  |
|                                                                                             |
|                                      Orchestrate your                                       |
|                                     AI Workforce                                            |
|                                                                                             |
|                Deploy autonomous agents to code, research, and manage workflows instantly.   |
|                                                                                             |
|                                                                                             |
|                  [PLANNER]    [ORCHESTRATOR]    [ARCHITECT]    [CODER]    [SENTRY]          |
|                   (tilt -32°)   (tilt -16°)      (center 0°)   (tilt +16°) (tilt +32°)       |
|                                                                                             |
|                                                                                             |
|                          TRUSTED BY:  Walmart   Swiggy   Netlify   BBVA   Atlassian         |
+---------------------------------------------------------------------------------------------+
```

### 1. Luxury Editorial Typography & Theme
- **Fonts**: *Newsreader* (luxury editorial display serif), *Plus Jakarta Sans* (crisp UI body), and *JetBrains Mono* (code editor & terminal).
- **Color Tokens**: Obsidian backdrops (`#0a0a0c`, `#121217`), radiant orange accents (`#ff6b35`, `#ff5722`), subtle borders (`rgba(255,255,255,0.08)`), and ambient spotlights.
- **Glassmorphism**: Multi-layered backdrop blurs (`backdrop-blur-xl`), glowing halos, and 3D card perspective elevations.

### 2. Signature 3D Fanned Radial Arc Deck
- Pixel-perfect curved card arc matching modern AI design standards:
  - **Planner** (tilt -32°, -340px) — Gemini 2.5 Flash
  - **Orchestrator** (tilt -16°, -170px) — Gemini 2.5 Flash
  - **Architect** (tilt 0°, elevated center card) — Claude Sonnet 4.6
  - **Coder** (tilt +16°, +170px) — Claude Sonnet 4.6
  - **Sentry** (tilt +32°, +340px) — Claude Sonnet 4.6
- Interactive hover effects: elevates card, straightens rotation to 0°, highlights border, and activates accent glow.

---

## ⚡ Interactive Enterprise Agent Studio & Persistence

The live Studio route (`/studio`) connects seamlessly with MongoDB and LangGraph:

### Studio Features:
1. **Multi-Session Project History Drawer**:
   - Slide-out drawer listing all past project generations stored in MongoDB.
   - Shows status badges, file counts, relative timestamps, and one-click session loading.
2. **Instant `.zip` Source Code Export**:
   - Generates and downloads a complete zip archive containing all generated FastAPI Clean Architecture files (`app/`, `tests/`, `requirements.txt`, `README.md`).
3. **Checkpoint Resumption Banner**:
   - If a project was interrupted or paused midway, the Studio detects the state snapshot and allows immediate resumption from the exact last node.
4. **Human-in-the-Loop Architecture Modal**:
   - Visualizes synthesized database ERD and OpenAPI 3.1 endpoints.
   - Allows users to approve and trigger code generation or submit revision requests.
5. **Monaco-Style Clean Code Editor**:
   - Multi-file tree explorer with syntax highlighting and copy-to-clipboard for every generated module.
6. **E2B MicroVM Pytest Sandbox Terminal**:
   - Real-time terminal emulator displaying sandbox test outputs, pass rates, and traceback fix attempts.

---

## 🔒 User Authentication & Security

- **Glassmorphic Auth Modal**: Tabbed Login, Registration, and 6-Digit Email OTP Verification.
- **`smtplib` Email Integration**: Verification codes dispatched directly to user inboxes.
- **Redux State Management (`authSlice.ts`)**: Manages JWT Bearer tokens and automatically attaches authorization headers to all Axios requests.
- **Gated Access**: Protects AI developer agent model execution for email-verified accounts.

---

## 🚀 Running the Frontend

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Start Vite Dev Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Production Build
```bash
npm run build
```
Builds optimized production assets in `dist/`.
