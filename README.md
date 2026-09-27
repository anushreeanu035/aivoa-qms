# AIVOA - AI-Powered Deviation Intake Module
### Enterprise Quality Management System (QMS) for API Pharmaceutical Manufacturing

![AIVOA QMS](https://img.shields.io/badge/AIVOA-QMS-1351a3.svg)
![GMP Compliance](https://img.shields.io/badge/GMP-21%20CFR%20Part%20211%20%2F%20ICH%20Q10-emerald.svg)
![LangGraph](https://img.shields.io/badge/Orchestration-LangGraph-purple.svg)
![Groq](https://img.shields.io/badge/AI%20Engine-Groq%20Llama%203.3%2070B-orange.svg)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-teal.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Redux%20Toolkit-blue.svg)

---

## 1. Project Overview & Architecture

The **AI-Powered Deviation Intake Module** is an enterprise-grade solution designed for Active Pharmaceutical Ingredient (API) manufacturers. It replaces tedious, error-prone manual intake workflows with an intelligent, human-in-the-loop pipeline:

```
Deviation Document (PDF/DOCX/TXT) or Pasted Text
                   ↓
   LangGraph AI Pipeline (Groq Llama 3.3 70B)
                   ↓
   Extracts Factual Parameters (Batch, Plant, Date, Measurements)
                   ↓
   Recommends Initial Quality Impact & Severity with Justification
                   ↓
   Automatically Populates Left-Side "Log Deviation" Form
                   ↓
   User Reviews, Modifies, or Overrides AI Values
                   ↓
   Authorized Deviation Saved to Database (PostgreSQL / SQLite)
```

### Key Design Principles:
1. **AI Assistant as Primary Intake**: Users do not fill out the form by hand. They drop a batch record, test report, or paste shift notes into the AI Assistant on the right.
2. **Human Control Over Final Decisions**: The AI's severity and impact classifications are strict recommendations subject to Qualified Person (QP) / QA review.
3. **Data Integrity & Traceability**: Each field visually indicates its origin (`AI Extracted` vs. `User Edited`) complying with GMP Annex 11 / 21 CFR Part 11 principles.
4. **Deterministic Demo Mode / Fallback**: If a live Groq API key is not yet configured, the system transparently runs an intelligent deterministic pharma extraction engine and explicitly marks the session as `Demo Mode (Mock AI)` without failing.

---

## 2. Project Directory Structure

```
aivoi/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py              # FastAPI application entrypoint & CORS
│   │   ├── config.py            # Pydantic Settings & environment variables
│   │   ├── models.py            # SQLAlchemy database models (deviations table)
│   │   ├── schemas.py           # Pydantic validation schemas (AI, Form, Chat)
│   │   ├── database.py          # PostgreSQL & SQLite database engine & session
│   │   ├── document_parser.py   # PDF (pypdf), DOCX (python-docx), TXT parser
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py                 # /api/deviations/analyze, /deviations, /chat
│   │   │   ├── routes_capas.py           # /api/capas (CRUD & from-deviation)
│   │   │   ├── routes_change_controls.py # /api/change-controls (CRUD & lifecycle)
│   │   │   ├── routes_audits.py          # /api/audits (CRUD & findings tracking)
│   │   │   ├── routes_documents.py       # /api/documents (Controlled SOPs & DMS)
│   │   │   └── routes_reports.py         # /api/reports/summary & CSV export
│   │   ├── seeder.py            # GMP demonstration data seeder
│   │   └── ai/
│   │       ├── __init__.py
│   │       ├── prompts.py       # GMP & ICH Q10 extraction & chat prompts
│   │       ├── graph.py         # LangGraph StateGraph workflow & Groq client
│   │       └── chat.py          # Interactive Deviation Q&A Assistant
│   ├── venv/                    # Python virtual environment
│   ├── requirements.txt         # Backend Python dependencies
│   ├── .env.example             # Backend configuration template
│   └── run.py                   # Convenience backend server runner
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entrypoint
│   │   ├── App.jsx              # Dynamic multi-module layout container
│   │   ├── index.css            # Tailwind directives & enterprise styles
│   │   ├── store/
│   │   │   ├── index.js         # Redux Toolkit store configuration
│   │   │   └── deviationSlice.js# State slice for form, AI, chat, and module navigation
│   │   ├── components/
│   │   │   ├── Navbar.jsx                   # AIVOA QMS top navigation & health indicator
│   │   │   ├── DashboardView.jsx            # High-level QMS executive command center
│   │   │   ├── DeviationForm.jsx            # Editable deviation intake form
│   │   │   ├── AIAssistant.jsx              # AI upload, parameter extraction & chat
│   │   │   ├── CapaManagement.jsx           # ICH Q10 CAPA lifecycle tracker
│   │   │   ├── ChangeControlManagement.jsx  # Change Control management module
│   │   │   ├── AuditManagement.jsx          # Self-inspections & regulatory audit log
│   │   │   ├── DocumentManagement.jsx       # Controlled SOP and document repository
│   │   │   ├── ReportsAnalytics.jsx         # Executive metrics & regulatory CSV export
│   │   │   ├── SavedDeviationsModal.jsx     # Saved database records inspector
│   │   │   └── Toast.jsx                    # Floating notifications & feedback
│   │   └── services/
│   │       └── api.js           # Axios API client for all QMS modules
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
│
├── samples/
│   ├── deviation_sample_01.txt  # Sample raw text incident report
│   ├── deviation_sample_02.docx # Sample Word deviation document with tables
│   ├── deviation_sample_03.pdf  # Sample PDF incident document
│   ├── generate_sample_docs.py  # DOCX generator
│   └── generate_sample_pdf.py   # PDF generator
│
├── Dockerfile                   # Multi-stage production container definition
├── docker-compose.yml           # Unified container deployment (persistent SQLite)
├── docker-compose.postgres.yml  # Multi-container deployment with managed PostgreSQL
├── .dockerignore                # Production container build exclusions
├── .env.docker.example          # Docker deployment environment template
├── docker_deploy.bat            # 1-click Windows Docker container launcher
├── docker_stop.bat              # Windows Docker container shutdown script
├── docker_deploy.sh             # Linux/macOS Docker container launcher
├── docker_stop.sh               # Linux/macOS Docker container shutdown script
├── start_production.bat         # Standalone native production server launcher
├── stop_production.bat          # Stop running production server
├── start_all.bat                # Local development launcher (backend + frontend)
├── start_backend.bat            # One-click Windows backend launcher
├── start_frontend.bat           # One-click Windows frontend launcher
├── test_workflow.py             # Integration test suite
└── .env.example                 # Root environment template
```

---

## 3. How to Install Dependencies

### Prerequisites:
- Python 3.10+ (tested on Python 3.11.9)
- Node.js 18+ and npm (tested on Node v22.18.0)

### 3.1 Backend Installation:
```bash
# Navigate to backend directory
cd backend

# Create Python virtual environment (if not already created)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Linux/macOS:
source venv/bin/activate

# Install required packages
pip install -r requirements.txt
```

### 3.2 Frontend Installation:
```bash
# Navigate to frontend directory
cd frontend

# Install npm packages
npm install
```

---

## 4. How to Configure GROQ_API_KEY

1. Get a free API key from [Groq Console](https://console.groq.com/keys).
2. Copy `backend/.env.example` to `backend/.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
3. Set your API key and preferred model:
   ```env
   GROQ_API_KEY=gsk_your_actual_key_here
   GROQ_MODEL=llama-3.3-70b-versatile
   DATABASE_URL=sqlite:///./deviations.db
   ```
4. **Reliable Groq Models Supported**:
   - `llama-3.3-70b-versatile` (Default recommended: high accuracy & structured output)
   - `llama-3.1-70b-versatile`
   - `llama-3.1-8b-instant`
5. **No Key? No Problem!**
   If `GROQ_API_KEY` is omitted or empty, the application runs in **Demo Mode (Mock AI)**. It executes all 6 LangGraph workflow nodes using the intelligent pharmaceutical heuristic engine, clearly badged in the UI.

---

## 5. How to Deploy the Application

### 5.1 Docker Container Deployment (Recommended)
The project includes a multi-stage Docker build that compiles the React frontend and packages the FastAPI backend into a single, high-performance container.

#### 1-Click Launch (Windows):
Double-click `docker_deploy.bat` or run:
```bash
.\docker_deploy.bat
```

#### Manual Docker Compose:
```bash
# 1. (Optional) Set your Groq API key in .env or copy from example
cp .env.docker.example .env

# 2. Build and launch with persistent storage
docker compose up -d --build
```
- Web Application: **`http://localhost:8000`**
- Health Check: **`http://localhost:8000/api/health`**
- API Documentation: **`http://localhost:8000/docs`**

#### Deploy with Managed PostgreSQL in Docker:
```bash
docker compose -f docker-compose.postgres.yml up -d --build
```

#### To stop containers:
```bash
docker compose down
# Or double-click docker_stop.bat
```

---

### 5.2 Standalone Local Production Server (Without Docker)
To run the production-optimized build directly on your machine without development servers:
```bash
# Windows 1-click launch:
.\start_production.bat

# To stop the production server:
.\stop_production.bat
```
This builds the React static bundle into `frontend/dist/` and runs FastAPI serving both the frontend SPA and backend API on `http://localhost:8000`. If the server is already running, `start_production.bat` detects it and opens your browser without duplicate port errors.

---

### 5.3 Local Development Mode (Hot-Reload)

#### Start Backend (FastAPI):
```bash
# From project root:
.\backend\venv\Scripts\python.exe backend\run.py
```
- Server starts at: **`http://127.0.0.1:8000`**
- Interactive Swagger API docs: **`http://127.0.0.1:8000/docs`**

#### Start Frontend (React + Vite):
```bash
cd frontend
npm run dev
```
- Application opens at: **`http://localhost:3000`** (proxies `/api` requests to backend).

---

## 6. How to Configure PostgreSQL

The application uses SQLAlchemy with dual-mode support:

1. **Default (Zero-Configuration SQLite)**:
   ```env
   DATABASE_URL=sqlite:///./deviations.db
   ```
   Requires no installation. Tables are created automatically on startup.

2. **Enterprise PostgreSQL**:
   Install PostgreSQL and create a database:
   ```sql
   CREATE DATABASE aivoi_deviations;
   ```
   Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/aivoi_deviations
   ```
   SQLAlchemy will connect to PostgreSQL and create the `deviations` table automatically.

---

## 7. Example Test Input

You can test the complete workflow using any of the following:

### Quick UI Test:
Click the **"Try Sample Deviation"** button in the AI Assistant panel. It populates:
> *"During manufacturing of Batch ABC-001 on 24-Sep-2026, the temperature of Reactor R-101 exceeded the approved range of 75–80°C and reached 86°C for approximately 15 minutes. The event was identified by the production operator during routine monitoring."*

### File Upload Test:
Drag and drop any of the pre-generated sample files in the `samples/` directory:
- `samples/deviation_sample_01.txt`
- `samples/deviation_sample_02.docx`
- `samples/deviation_sample_03.pdf`

Click **"Analyze Deviation"** and watch the LangGraph pipeline execute.

---

## 8. Explanation of the AI Workflow (LangGraph)

The AI analysis is orchestrated using a deterministic 6-node LangGraph `StateGraph`:

```
   START
     ↓
1. [Input Handler]
   Validates input presence (multipart file or pasted text) and normalizes payload.
     ↓
2. [Document/Text Extraction]
   Extracts raw text streams from PDF, DOCX, or TXT without data loss or binary leaks.
     ↓
3. [Deviation Information Extraction]
   Invokes Groq Llama 3.3 (or fallback) to extract factual metadata (Site, Date, Batch, Title, Description).
     ↓
4. [Impact Analysis]
   Evaluates Critical Process Parameters (CPPs) and maps to quality domains (Product Quality, Equipment, Compliance).
     ↓
5. [Severity Recommendation]
   Classifies severity (Minor / Major / Critical) with concise GMP rationale for QP review.
     ↓
6. [GMP Validation]
   Enforces Pydantic schema constraints and emits validated structured JSON to the frontend.
     ↓
    END
```

---

## 9. Interactive Deviation Q&A Assistant

At the bottom of the AI Assistant panel, users can converse with the AI regarding the current incident:
- *"Why was Major severity recommended?"*
- *"What immediate containment actions should be taken?"*
- *"Summarize product quality risk"*

The AI provides context-grounded pharmaceutical QA guidance referencing the extracted batch and excursion parameters.

---

## 10. Assumptions & Limitations

1. **Document Structure**: OCR for scanned image-only PDFs is not included; documents must contain digital/selectable text streams.
2. **File Size Limit**: Documents up to 15MB are processed in-memory for optimal speed.
3. **Regulatory Authorization**: The AI provides triage recommendations; official GMP release disposition requires authorized electronic signature.
