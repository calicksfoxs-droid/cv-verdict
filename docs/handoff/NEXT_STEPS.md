# Next Steps

## Best path
Use this repository in VS Code / Codex / Cursor.

## Step 1 — Local run
Backend:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

## Step 2 — Fix skeleton issues
- Confirm frontend can call backend.
- Confirm PDF upload works.
- Confirm result page loads.
- Confirm delete endpoint works.

## Step 3 — Replace temporary evaluator
Create a real evaluation module:
- criteria definitions.
- scoring caps.
- issue severity.
- decision engine.
- validation.

## Step 4 — Add AI layer later
Do not rush AI. First stabilize schema and tests.

## Step 5 — Deploy MVP
- Frontend: Vercel.
- Backend: Render.
- Storage: temporary local first or Supabase Storage.
- DB: PostgreSQL when persistence is needed.

