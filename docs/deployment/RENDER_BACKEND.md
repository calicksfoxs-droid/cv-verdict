# Render Backend Deployment

Deploy the FastAPI backend as a Render Web Service.

## Service Settings

- Root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`

## Environment Variables

```env
MAX_FILE_BYTES=5242880
MAX_JOB_DESCRIPTION_CHARS=12000
CORS_ORIGINS=https://cv-verdict-lilac.vercel.app
AI_PROVIDER=
AI_API_KEY=
```

`AI_API_KEY` should stay empty for the current deterministic MVP fallback. Do not add real keys unless the AI evaluator is implemented later.

## CORS

Set `CORS_ORIGINS` to the exact Vercel frontend URL. For the current production frontend:

```env
CORS_ORIGINS=https://cv-verdict-lilac.vercel.app
```

For preview deployments, add comma-separated origins only when needed:

```env
CORS_ORIGINS=https://cv-verdict.vercel.app,https://cv-verdict-git-preview.vercel.app
```

Do not use `*` for the public MVP.

## Production Checks

After deploy, these URLs must work:

```text
https://YOUR_RENDER_BACKEND.onrender.com/
https://YOUR_RENDER_BACKEND.onrender.com/health
```

Expected responses:

```json
{"service":"CV Verdict API","status":"ok"}
```

```json
{"status":"ok"}
```

`GET /api/analysis` should return `405 Method Not Allowed` because analysis creation is `POST` only.
