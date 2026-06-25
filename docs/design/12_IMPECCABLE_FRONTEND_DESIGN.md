# 12 — Impeccable Frontend Design Constitution

This project uses the user's Impeccable / frontend-design direction as the design constitution for the public interface.

## Design role
Treat the interface like a small studio project with a distinct identity. The user rejected generic, templated designs. The UI should not look like default SaaS, default ATS checker, or generic AI landing page.

## Subject
Product: strict CV evaluation website.
Audience: students, fresh graduates, job seekers, and entry-level applicants.
Single job of the first page: make the user trust that the site will give a serious, evidence-based CV verdict.

## Visual idea
The website should feel like an evidence desk, not a cheerful resume builder. The signature interface element is an **Evidence Rail**: a vertical proof trail showing how the system moves from document → evidence → score → decision.

## Avoid
- Generic identical card grids.
- Gradient text.
- Decorative glassmorphism.
- Warm cream SaaS background by default.
- Big hero number + tiny label template.
- Tiny uppercase eyebrow above every section.
- Numbered section markers unless the content is truly sequential.
- Over-rounded cards.
- Border plus large soft shadow ghost cards.

## Typography direction
Use typography to carry seriousness and clarity:
- Display: characterful but restrained.
- Body: highly readable Arabic/English compatible.
- Utility/data: compact and precise.

Avoid pairing two similar sans families. Pair with contrast or use one family with clear role differences.

## Color direction
Use OKLCH in final CSS where practical.
Prefer a committed, serious palette: graphite, deep blue/ink, clinical cyan or evidence amber accents. Do not default to cream or acid-green cyber style.

Example conceptual tokens:
- `--ink`: core readable text.
- `--surface`: clean surface.
- `--evidence`: accent for proof trail.
- `--risk`: critical issue color.
- `--muted`: secondary text with accessible contrast.

## Motion
Use one orchestrated motion idea:
- Evidence Rail progresses during analysis.
- Results reveal by evidence category.

Respect reduced motion. Never gate content visibility on animation.

## UX copy
Interface words should be plain and active:
- “Analyze CV” / “قيّم السيرة”.
- “Delete my file and result” / “احذف ملفي ونتيجتي”.
- Errors must explain exactly what happened and how to fix it.

## Design process before coding UI
1. Write a compact design plan.
2. Define palette, typography, layout, and signature element.
3. Critique against AI-template defaults.
4. Revise once.
5. Only then code.

