# CV Verdict MVP

CV Verdict is a bilingual Arabic/English public website for strict, evidence-based CV evaluation. A user uploads a text-based PDF CV, optionally adds a target role and job description, chooses report language/depth, and receives a deterministic MVP verdict from 100.

## MVP Scope

Included now:
- PDF upload only.
- Text extraction from text-based PDFs.
- Arabic and English reports.
- Short and medium free reports.
- Generic, role-only, and targeted analysis modes.
- Deterministic fallback evaluator with score validation.
- Delete analysis action.
- Temporary in-memory storage for local MVP use.

Excluded from MVP:
- Login.
- Payments.
- OCR.
- Word upload.
- CV editor.
- Full paid report.
- Persistent database storage.

## Project Structure

- `frontend/` — Next.js app.
- `backend/` — FastAPI API.
- `docs/` — product, architecture, testing, handoff, and design documentation.
- `PRODUCT.md` — product source of truth.
- `DESIGN.md` — interface direction and Evidence Rail signature element.

## Backend Setup

Windows PowerShell:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

macOS/Linux:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend health check:

```bash
curl http://localhost:8000/health
```

## Frontend Setup

Windows PowerShell:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

macOS/Linux:

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment Variables

Frontend `frontend/.env.example`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Backend `backend/.env.example`:

```env
MAX_FILE_BYTES=5242880
MAX_JOB_DESCRIPTION_CHARS=12000
CORS_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
AI_PROVIDER=
AI_API_KEY=
```

No real API keys are required for the current MVP. If an AI API is absent, the backend uses the deterministic evaluator fallback.

## API

- `POST /api/analysis`
- `GET /api/analysis/{request_id}/status`
- `GET /api/analysis/{request_id}/report`
- `DELETE /api/analysis/{request_id}`
- `GET /health`

## File Rules

- PDF only.
- Maximum size: `5MB` by default.
- Maximum pages: `3`.
- Text-based PDFs only.
- Scanned PDFs return `NO_EXTRACTABLE_TEXT`; OCR is intentionally out of scope.
- Password-protected and corrupted PDFs are rejected.

## Quality Commands

Frontend:

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

Backend:

```powershell
cd backend
.\.venv\Scripts\python.exe -m pytest
.\.venv\Scripts\python.exe -m compileall app
```

Manual API smoke test:

```powershell
cd backend
.\.venv\Scripts\python.exe -m uvicorn app.main:app --port 8000
```

Then upload a text-based PDF through the frontend and verify report creation, error handling, and delete.

## Privacy

- Files are temporary.
- CVs are not used for training.
- The current MVP stores analysis data only in memory.
- The original PDF bytes are not persisted after request processing.
- The parser does not store full CV text in the analysis object.
- There is a user-facing delete action for the analysis result.

## Deployment Plan

Recommended MVP deployment:
- Frontend: Vercel.
- Backend: Render.
- Backend runtime: Python 3.14 works with current dependencies; Python 3.12 is also acceptable.
- Storage: keep temporary/local for MVP, then move to Supabase Storage/PostgreSQL when persistence is required.
- Configure `NEXT_PUBLIC_API_URL` to the Render backend URL.
- Configure backend `CORS_ORIGINS` to include the Vercel domain.

Deployment files and notes:
- `render.yaml` — Render backend service configuration.
- `frontend/vercel.json` — Vercel frontend configuration.
- `docs/deployment/RENDER_BACKEND.md` — backend deployment notes.
- `docs/deployment/VERCEL_FRONTEND.md` — frontend deployment notes.

Production CORS pairing:

```env
# Render backend
CORS_ORIGINS=https://your-vercel-domain.vercel.app

# Vercel frontend
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

## Completed

- Git repository initialized with `initial handoff import`.
- Frontend dependencies installed.
- Backend dependencies installed with Python 3.14-compatible versions.
- Next.js upgraded to a patched major version that builds locally.
- FastAPI endpoints implemented.
- PDF validation and text extraction path present.
- Deterministic scoring with `main_score <= 60`, `internal_score <= 40`, and `final_score <= 100`.
- Analysis modes: `generic`, `role_only`, `targeted`.
- Arabic/English short and medium reports.
- Evidence Rail interface and delete result action.
- Clear privacy copy in UI.
- Automated backend tests for API, PDF validation, reports, languages, and analysis modes.

## Known Issues

- `npm audit` currently reports a residual moderate `postcss` advisory through the Next.js dependency chain. The suggested forced fix may downgrade or break the current Next setup, so it is intentionally not applied. Re-check after the Next dependency path publishes a safe patch.
- Storage is in-memory for the current MVP. This is acceptable for a single-instance local/demo deployment but not for multi-instance production.
- The evaluator is a deterministic fallback, not the final AI-assisted evaluation engine.

## Remaining Work

- Replace deterministic fallback evaluator with a structured AI-assisted engine.
- Add production persistence and expiry jobs if the MVP needs multi-instance deployment.
- Add rate limiting before public launch.
- Re-check residual `npm audit` PostCSS warning when Next publishes a patched dependency path.
