# CV Verdict MVP

CV Verdict is now a single Next.js application that runs fully on Vercel. Users upload a text-based PDF CV, choose Arabic or English, optionally add a target role/job description, and receive a deterministic evidence-based CV verdict from 100.

## Current Deployment Shape

- Production target: Vercel only.
- Runtime app: `frontend/` Next.js.
- API: Next.js Route Handlers under `frontend/app/api`.
- No Render backend is required.
- No CORS is required because frontend and API share the same domain.
- The old `backend/` FastAPI code remains in the repository as legacy reference, but it is not required for local run or deployment.

## MVP Scope

Included:
- PDF upload only.
- Text extraction from text-based PDFs.
- Arabic and English reports.
- Short and medium free reports.
- Analysis modes: `generic`, `role_only`, `targeted`.
- Deterministic fallback evaluator.
- Temporary in-memory result storage.
- Delete analysis action.

Excluded:
- Login.
- Payments.
- OCR.
- Database.
- Real AI engine.
- Full paid report.

## Local Run

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open:

```text
http://localhost:3000
```

## Quality Commands

```powershell
cd frontend
npm.cmd run lint
npm.cmd run build
```

## API Routes

- `POST /api/analysis`
- `GET /api/analysis/[id]/status`
- `GET /api/analysis/[id]/report`
- `DELETE /api/analysis/[id]`

## File Rules

- PDF only.
- Maximum size: `5MB`.
- Maximum pages: `3`.
- Text-based PDFs only.
- Scanned PDFs return `NO_EXTRACTABLE_TEXT`; OCR is intentionally out of scope.

## Environment Variables

No environment variables are required for the deterministic MVP fallback.

Optional future AI settings:

```env
AI_PROVIDER=
OPENROUTER_API_KEY=
```

Do not add real AI keys until the AI evaluator is implemented.

## Vercel Deployment

Recommended settings:
- Root Directory: `frontend`
- Framework Preset: Next.js
- Install Command: `npm install`
- Build Command: `npm run build`

There is no `NEXT_PUBLIC_API_URL`. The app calls its own API routes using relative URLs.

## Privacy

- Files are temporary.
- CVs are not used for training.
- The original PDF bytes are not persisted after request processing.
- Full CV text is not printed in logs.
- Results can be deleted manually.

## Known Issues

- In-memory storage is acceptable for MVP demos, but serverless instances may not share state across cold starts. A database can be added later when persistence is in scope.
- `npm audit` may report dependency advisories. Do not apply forced downgrades that break Next.js.
- `pdfjs-dist` may print optional `canvas` polyfill warnings during build. The build still succeeds and text extraction works; do not add native `canvas` unless visual PDF rendering becomes in scope.
- The evaluator is deterministic fallback logic, not the final AI-assisted evaluation engine.

## Legacy Backend

The `backend/` FastAPI implementation is no longer required for deployment. Keep it for reference until the Next.js-only MVP is stable, then decide whether to archive or delete it in a separate cleanup.
