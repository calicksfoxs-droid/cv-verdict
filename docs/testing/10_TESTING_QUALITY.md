# 10 — Testing & Quality Plan v1.0

## Required test categories
### File tests
- Normal PDF.
- 1-page CV.
- 3-page CV.
- Large PDF.
- Password-protected PDF.
- Scanned PDF.
- Broken PDF.

### Evaluation tests
- Student with strong documented projects.
- Senior with task-only experience.
- Beautiful but ATS-bad CV.
- Generic CV targeting many roles.
- Projects without links.
- Keyword stuffing.
- No target role.
- Exaggerated claims.

### Stability test
Same CV should not vary by more than 0–3 points.

### No-invention test
Reports must not include:
- Tools not in CV/JD.
- Numbers not in CV/JD.
- Links not provided.
- Skills not shown.
- Results not claimed.

### Privacy test
- File deletes after 24 hours.
- Report deletes after 7 days.
- Manual delete works.
- Logs do not contain email/phone/full CV.

## Readiness metrics
| Metric | Target |
|---|---:|
| Score math errors | 0% |
| Invented facts | 0% |
| Duplicate penalties | 0% |
| Same-CV score drift | ≤ 3 points |
| Criteria completeness | 100% |
| Arabic/English report quality | Pass |

