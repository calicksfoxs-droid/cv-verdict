# CV Verdict — Start Here

This package is a handoff bundle for continuing the CV evaluation website with a coding assistant such as Codex, VS Code Copilot, Cursor, or another internal developer agent.

## Product in one sentence
A bilingual Arabic/English public website that lets users upload a PDF CV, optionally provide a target role and job description, and receive a strict evidence-based CV evaluation from 100 with clear repair steps.

## Current status
This is a Skeleton MVP, not the final production site.

Included:
- Next.js frontend skeleton.
- FastAPI backend skeleton.
- PDF upload and text extraction path.
- Basic parser.
- Temporary rule-based evaluator.
- Basic report generator.
- Arabic/English UI direction.
- Core product, architecture, security, AI strategy, report, testing, and design documentation.

Not final yet:
- Real AI Evaluation Engine.
- Production-grade persistence.
- Full report generation.
- Deployment configuration.
- API key management.
- OCR.
- Accounts.
- Payments.

## Critical rule
Do not turn this into a generic ATS checker. The core product is strict human-style CV evaluation: evidence, credibility, recruiter objections, bullet-point quality, measurable results, and clear repair actions.

## How to continue
1. Read `PRODUCT.md` and `DESIGN.md`.
2. Read `docs/prompts/CODEX_HANDOFF_PROMPT.md`.
3. Read the architecture docs in order.
4. Run the frontend and backend locally.
5. Replace the temporary rule-based evaluator with the real structured Evaluation Engine.

## Recommended first coding target
Backend first:
- Stabilize API models.
- Add temporary storage.
- Improve parser.
- Build a structured evaluator interface.
- Keep current frontend working.

Then frontend:
- Polish landing/upload/results using the Impeccable design direction.
- Add robust error and empty states.

## MVP boundaries
Do not add these yet:
- Login/accounts.
- Payments.
- OCR.
- Word file support.
- LinkedIn import.
- CV editor.
- Admin dashboard.
- Bulk recruitment.

