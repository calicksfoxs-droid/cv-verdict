# Vercel-Only Deployment

CV Verdict now runs as one Next.js application on Vercel.

## Project Settings

- Vercel project root directory: `frontend`
- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default

## API

The app uses Next.js Route Handlers on the same Vercel domain:

- `POST /api/analysis`
- `GET /api/analysis/[id]/status`
- `GET /api/analysis/[id]/report`
- `DELETE /api/analysis/[id]`

There is no Render backend and no CORS requirement.

## Environment Variables

No environment variables are required for the deterministic MVP fallback.

Optional future AI settings:

```env
AI_PROVIDER=
OPENROUTER_API_KEY=
```

Do not add real AI keys until the AI evaluator is implemented.
