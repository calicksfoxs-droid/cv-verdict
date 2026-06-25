# 11 — Deployment & Tech Stack v1.0

## Recommended stack
| Layer | Choice |
|---|---|
| Frontend | Next.js |
| Backend | FastAPI |
| Database | PostgreSQL |
| File storage | Supabase Storage or temporary local storage |
| Frontend hosting | Vercel |
| Backend hosting | Render |
| AI layer | External API, swappable provider |
| Auth | Deferred |
| Payments | Deferred |

## Why
- Python is good for PDF processing and AI orchestration.
- FastAPI is simple and strong for APIs.
- Next.js is suitable for a polished bilingual web UI.
- PostgreSQL scales better than SQLite.
- Vercel and Render are simple MVP deployment targets.
- Supabase can later add database, storage, and auth.

## Build order
1. Backend skeleton.
2. Parser.
3. Evaluation Engine.
4. Report Generator.
5. Frontend flow.
6. Privacy cleanup.
7. Testing.
8. Deployment.

## Do not add yet
- Login.
- Payments.
- OCR.
- Word upload.
- LinkedIn import.
- CV editor.
- Admin dashboard.

