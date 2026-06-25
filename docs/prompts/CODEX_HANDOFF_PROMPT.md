# Codex / Coding Assistant Handoff Prompt

Use this prompt with a coding assistant after opening this repository.

---

You are continuing a real MVP called **CV Verdict**.

It is a bilingual Arabic/English public website for strict CV evaluation. Users upload a PDF CV, optionally add a target role and job description, choose report depth, and receive an evidence-based score from 100 with recruiter-style critique and repair steps.

## Read first
Read these files before editing code:
1. `PRODUCT.md`
2. `DESIGN.md`
3. `docs/handoff/00_START_HERE.md`
4. `docs/architecture/01_PRODUCT_SCOPE.md`
5. `docs/architecture/02_DATA_SCHEMA.md`
6. `docs/architecture/03_EVALUATION_ENGINE.md`
7. `docs/architecture/04_REPORT_GENERATOR.md`
8. `docs/design/12_IMPECCABLE_FRONTEND_DESIGN.md`

## Current project state
The repo contains:
- Next.js frontend skeleton.
- FastAPI backend skeleton.
- Temporary rule-based evaluator.
- Basic report generator.

The evaluator is not final. It must be replaced with a structured Evaluation Engine that follows the docs.

## Product rules
- Target role is optional.
- Job description is optional.
- Report language: Arabic or English.
- Free report type: short or medium.
- No accounts in MVP.
- No payments in MVP.
- No OCR in MVP.
- PDF only in MVP.
- CV files must be temporary.
- User must be able to delete their file and result.
- Do not use CVs for model training.

## Design rules
Follow the Impeccable design constitution in `docs/design/12_IMPECCABLE_FRONTEND_DESIGN.md`.
Do not make a generic SaaS template. The signature element is the Evidence Rail.
Avoid gradient text, generic card grids, decorative glassmorphism, cream SaaS background, and fake AI-looking polish.

## Engineering rules
- Keep backend and frontend separated.
- Use FastAPI for backend.
- Use Next.js for frontend.
- Use structured JSON between layers.
- Backend validates all model outputs.
- Backend calculates final score.
- No final score if extraction confidence is too low.
- No invented facts.
- No duplicate penalties.

## Immediate tasks
1. Run the project locally and identify any setup errors.
2. Improve README with exact local setup steps if missing.
3. Implement request lifecycle status cleanly.
4. Add temporary storage abstraction.
5. Improve PDF validation.
6. Improve parser output shape to match `02_DATA_SCHEMA.md`.
7. Create a clean `EvaluationResult` schema.
8. Replace temporary evaluator gradually with rubric-based scoring from `03_EVALUATION_ENGINE.md`.
9. Ensure report generator supports `free_short` and `free_medium` in Arabic and English.
10. Add tests for score math, no-invention, and duplicate penalties.

## Do not do yet
- Do not add login.
- Do not add payments.
- Do not add OCR.
- Do not add Word upload.
- Do not add dashboard/admin.
- Do not build a CV editor.

## Definition of done for next milestone
A user can upload a text-based PDF CV, choose Arabic or English, optionally leave target role empty, choose short or medium report, and get a stable report with:
- final score,
- classification,
- decision,
- top strengths,
- top issues,
- ATS summary,
- repair steps,
- delete-data action.

All scores must be validated. Reports must not invent facts.

---

