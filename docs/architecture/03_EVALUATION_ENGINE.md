# 03 — Evaluation Engine v1.0

## Purpose
Convert the long strict CV-evaluation prompt into a stable system that can be tested and used in a public website.

## Engine type
Hybrid:
```text
Deterministic backend rules
+
AI content judgment
+
Validation layer
```

The AI should not be trusted to calculate the final result alone.

## Evaluation modes
- `targeted`: target role and/or job description exists.
- `role_only`: target role exists, no job description.
- `generic`: no target role, no job description.

Generic evaluation is allowed, but it must warn that job-fit scoring is limited.

## Core analyzers
- Evidence Engine.
- Candidate Context Engine.
- Target Clarity Detector.
- Bullet Point Analyzer.
- Number Quality Analyzer.
- ATS Analyzer.
- Credibility Review.
- Penalty Engine.
- Decision Engine.
- Score Validator.

## Fact vs Claim vs Judgment
Example:
```json
{
  "fact": "The CV states that 1,600 images were produced.",
  "claim_status": "acceptable_but_needs_support",
  "evaluation_judgment": "Useful production-volume evidence, but not proof of quality or business impact."
}
```

## Main criteria — 60 points
| Criterion | Points |
|---|---:|
| Job alignment and target clarity | 10 |
| Experience and achievements strength | 10 |
| Measurable numbers and results | 7 |
| Clarity of titles, organizations, dates, credibility | 5 |
| Professional summary strength | 6 |
| ATS and keywords | 7 |
| First 10-second readability | 5 |
| No exaggeration / unsupported info | 4 |
| Project quality, links, outcomes | 3 |
| General professionalism | 3 |
| Total | 60 |

## Internal criteria — 40 points
| Criterion | Points |
|---|---:|
| Bullet point quality | 8 |
| Language and grammar | 5 |
| Skill depth and relevance | 5 |
| Section structure | 5 |
| Visual consistency and formatting | 5 |
| Education and certifications | 4 |
| Recruiter objections and risks | 5 |
| Small details | 3 |
| Total | 40 |

## Score caps
Apply caps after base scoring:
- No role and no job description: max 84.
- Role only, no job description: max 89.
- Projects are core evidence but no portfolio/GitHub/demo/case study: max 84.
- No measurable impact metrics: max 84.
- Unsupported large professional claims: max 84.
- Poor extraction confidence: no final score if below threshold.

## Decision labels
Only one final decision:
1. جاهز للتقديم الآن.
2. قابل للتقديم بعد تعديلات محدودة.
3. يحتاج إلى تعديلات جوهرية قبل التقديم.
4. يحتاج إلى إعادة بناء كاملة.

## Severity
- Critical: blocks trust or application readiness.
- High: strongly reduces interview probability.
- Medium: useful improvement but not blocking alone.
- Low: detail-level polish.

## AI call strategy
MVP target: 2–3 calls.
1. Content analysis / parsing assistance.
2. Evaluation judgment.
3. Report wording if needed.

Do not use separate agents for every criterion in the MVP.

