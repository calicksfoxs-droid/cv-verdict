# CV Verdict MVP

A bilingual Arabic/English public website for strict, evidence-based CV evaluation.

The user uploads a PDF CV, optionally adds a target role and job description, chooses report depth, and receives a realistic score from 100 with recruiter-style critique and repair steps.

## Current state
This is a **Skeleton MVP handoff package**.

Included:
- Next.js frontend.
- FastAPI backend.
- PDF text extraction.
- Basic parser.
- Temporary rule-based evaluator.
- Basic report generator.
- Full product and architecture documentation.

The current evaluator is temporary. The next milestone is to replace it with the structured Evaluation Engine described in `docs/architecture/03_EVALUATION_ENGINE.md`.

## Start here
Read in order:
1. `docs/handoff/00_START_HERE.md`
2. `PRODUCT.md`
3. `DESIGN.md`
4. `docs/prompts/CODEX_HANDOFF_PROMPT.md`
5. `docs/handoff/NEXT_STEPS.md`

## Local setup

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

The frontend expects the backend URL from `.env.local`.

## MVP rules
- PDF only.
- Target role optional.
- Job description optional.
- Arabic and English supported.
- No accounts in MVP.
- No payments in MVP.
- No OCR in MVP.
- Temporary storage only.
- User deletion must be supported.
- Do not use CVs for model training.

## Design rule
The frontend must follow the Impeccable-inspired design constitution in `docs/design/12_IMPECCABLE_FRONTEND_DESIGN.md`.

The signature UI element is the **Evidence Rail**.

Avoid generic SaaS templates, gradient text, default glassmorphism, repeated card grids, and over-rounded AI-looking components.

