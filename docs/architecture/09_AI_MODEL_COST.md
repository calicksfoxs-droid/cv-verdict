# 09 — AI Model Strategy & Cost Plan v1.0

## Goal
Keep the product almost-free by avoiding unnecessary AI calls.

## Division of labor
Backend handles:
- File validation.
- Page count.
- Email/phone/link detection.
- Score arithmetic.
- Duplicate penalty detection.
- Output validation.

AI handles:
- Content judgment.
- Achievement vs task classification.
- Credibility interpretation.
- Summary and issue wording.
- Bullet rewrite suggestions.

## AI calls
MVP target:
- 2–3 calls per analysis.

Cheap mode:
1. Content analysis + evaluation.
2. Report generation.

Better mode:
1. Parsing/content analysis.
2. Evaluation judgment.
3. Report generation.

Avoid in MVP:
- One agent per criterion.
- OCR.
- Deep multi-pass audits for free users.

## Cost reduction
- PDF only.
- Max page count.
- Cache.
- No OCR.
- Structured JSON.
- Backend-generated tables.
- Short/medium report options.
- Full report later.

