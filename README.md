# 🚀 Trestle AI Workforce — Autonomous Multi-Agent Software Development Studio

[![Python 3.12+](https://img.shields.io/badge/Python-3.12%2B-blue.svg)](https://www.python.org/)
[![LangGraph](https://img.shields.io/badge/LangGraph-StateGraph-orange.svg)](https://github.com/langchain-ai/langgraph)
[![Claude Sonnet 4.6](https://img.shields.io/badge/Claude-Sonnet%204.6-purple.svg)](https://www.anthropic.com/)
[![Gemini 2.5 Flash](https://img.shields.io/badge/Google-Gemini%202.5%20Flash-4285F4.svg)](https://ai.google.dev/)
[![React 18](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://reactjs.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-CSS%20v4-38B2AC.svg)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20Async-47A248.svg)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Trestle** is an enterprise-grade autonomous AI software engineering platform. It accepts high-level business specifications, orchestrates a specialized multi-agent graph across market intelligence, system architecture, clean coding, and E2B microVM test verification, and autonomously ships verified codebases to GitHub with instant `.zip` downloads.

---

## 🏗️ System Architecture

```
                                    +-----------------------+
                                    |     Client Prompt     |
                                    +-----------------------+
                                                |
                                                v
                                    +-----------------------+
                                    |   Supervisor/Router   | <--- Gemini 2.5 Flash
                                    +-----------------------+
                                                |
                                                v
                                    +-----------------------+
                                    |    ResearcherAgent    | <--- Tavily Search API & Gemini 2.5 Flash
                                    +-----------------------+
                                                |
                                                v
                                    +-----------------------+
                                    |    ArchitectAgent     | <--- Claude Sonnet 4.6 & Pydantic v2
                                    +-----------------------+
                                                |
                                                v
                                    +-----------------------+
                                    |  Human-in-the-Loop    | <--- Interactive Approval Checkpoint
                                    |    Review Gateway     |      (Resume or Request Revisions)
                                    +-----------------------+
                                                |
                                        [Approved]
                                                |
                                                v
                                    +-----------------------+
                                    |    DeveloperAgent     | <--- Claude Sonnet 4.6
                                    |  (Clean Architecture) |      (Routers/Services/CRUD/Models)
                                    +-----------------------+
                                                |
                                                v
                                    +-----------------------+
                  +---------------->|    SandboxTester      | <--- E2B Firecracker MicroVM
                  |                 +-----------------------+      (pytest tests/ -v)
                  |                             |
             [Test Failed]              [100% Tests Pass]
         (Traceback Fix Loop)                   |
                  |                             v
                  |                 +-----------------------+
                  +-----------------|     DeliveryAgent     | <--- PyGithub API & ZIP Export
                                    +-----------------------+      (Private Repo & Handoff Email)
```

---

## 🌟 Key Features

### 1. 🤖 7-Node Autonomous Multi-Agent Swarm (LangGraph)
- **`Supervisor / Router`** (*Gemini 2.5 Flash*): Analyzes client prompts, extracts architectural scope, and validates complexity.
- **`Researcher Agent`** (*Gemini 2.5 Flash + Tavily API*): Discovers monetization patterns and high-demand features.
- **`System Architect Agent`** (*Claude Sonnet 4.6 + Pydantic v2*): Drafts relational database ERDs (SQLAlchemy 2.0) and OpenAPI 3.1 specifications.
- **`Human Review Gateway`**: Interactive pause checkpoint with ERD visualization allowing stakeholders to approve or request revisions.
- **`Developer Agent`** (*Claude Sonnet 4.6*): Synthesizes modular FastAPI Clean Architecture code (`routers/`, `services/`, `crud/`, `models/`, `schemas/`).
- **`Sandbox QA Tester`** (*E2B Firecracker MicroVM*): Executes `pytest tests/ -v` inside an isolated cloud sandbox with automatic self-healing traceback fix loops.
- **`Delivery Agent`** (*PyGithub API*): Automatically pushes code to private GitHub repositories and generates client handoff summaries.

### 2. 🔐 `smtplib` Email Verification & Model Access Control
- Cryptographic 6-digit OTP verification codes dispatched to user inboxes via `smtplib` with STARTTLS encryption.
- Strictly protects AI model execution (`Claude Sonnet 4.6` and `Gemini 2.5 Flash`) for verified developer accounts.

### 3. 💾 MongoDB Multi-Session Persistence & Checkpoint Resumption
- Continuous state snapshots persisted in MongoDB (`users` and `workflow_sessions` collections).
- Checkpoint resumption ensures zero lost work if processes are paused or interrupted midway.
- Multi-session history drawer allows users to switch between past projects and download previous codebases.

### 4. 📦 Instant ZIP Codebase Export
- One-click export bundling all generated FastAPI modules, SQLAlchemy models, test suites, `requirements.txt`, and quickstart `README.md`.

### 5. 🎨 Pixel-Perfect Dribbble-Standard Frontend
- Built with React 18, TypeScript, Vite, Tailwind CSS v4, and Redux Toolkit.
- Features a luxury editorial aesthetic, signature 3D radial fanned card deck, Monaco-style code viewer, and real-time terminal stream.

---

## 📂 Repository Structure

```
Trestle-AI-Workforce/
├── backend/
│   ├── pyproject.toml              # Python project configuration
│   ├── requirements.txt            # Dependency specifications
│   ├── .env.example                # Template environment variables
│   ├── src/
│   │   ├── config.py               # Settings & LLM factory (Claude Sonnet 4.6 & Gemini 2.5 Flash)
│   │   ├── database.py             # Async MongoDB layer with resilient fallback
│   │   ├── state.py                # Pydantic v2 schemas and AgentState
│   │   ├── graph.py                # LangGraph 7-node StateGraph compilation
│   │   ├── server.py               # FastAPI REST API with Auth, MongoDB, & ZIP export
│   │   ├── auth/                   # smtplib email verification & JWT authentication
│   │   ├── nodes/                  # Agent implementations (Supervisor, Architect, Coder, QA, etc.)
│   │   └── tools/                  # Tooling (E2B microVMs, Tavily search, GitHub API)
│   └── tests/                      # 22 automated Pytest unit and flow suites
│
└── frontend/
    ├── package.json                # Frontend dependencies
    ├── vite.config.ts              # Vite configuration with Tailwind CSS v4 plugin
    ├── src/
    │   ├── components/             # React components (Studio, AuthModal, 3D Card Deck, Navbar)
    │   ├── pages/                  # Route pages (Home, Studio, Agents, Solutions, Pricing)
    │   ├── store/                  # Redux Toolkit store (workflow, auth, agents, ui)
    │   └── types/                  # TypeScript data contracts
    └── public/avatars/             # 3D agent character avatars
```

---

## 🚀 Quick Start Guide

### Prerequisites
- **Python 3.12+**
- **Node.js 18+** & **npm**
- **MongoDB** (Local or MongoDB Atlas)

---

### 1. Backend Setup

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate       # Windows (or: source .venv/bin/activate on Unix)
pip install -e .
```

Configure your `.env` file in `backend/.env`:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
GOOGLE_API_KEY=your_gemini_api_key
TAVILY_API_KEY=your_tavily_api_key
E2B_API_KEY=your_e2b_api_key
GITHUB_TOKEN=your_github_token
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=trestle_agency
JWT_SECRET_KEY=your-secure-random-jwt-key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=auth@trestle.ai
```

Run tests to verify:
```bash
python -m pytest tests/ -v
# 22 passed (100% pass rate)
```

Start the backend API server:
```bash
python -m uvicorn src.server:app --reload --port 8000
```
API Documentation: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 🧪 Testing

```bash
# Backend Test Suite
cd backend
python -m pytest tests/ -v

# Frontend Production Build
cd frontend
npm run build
```

---

## 📄 License
This project is open-source and licensed under the [MIT License](LICENSE).
