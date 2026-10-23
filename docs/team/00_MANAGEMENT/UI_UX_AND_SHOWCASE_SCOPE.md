# UI/UX and professional repository deliverables (not a separate rewrite)

## Approach
Keep existing functioning layout and build. Aim for clean government-grade credibility, not heavy animation. Use Tailwind/Lucide/Recharts already present; large JS bundle from audit 845.67 kB (227.94 kB gzip) suggests avoiding heavy UI kits/animation libraries without measurement. Manual UI smoke still pending due Playwright Chrome GPU startup failure.

## Priority screens
1. Dashboard: actor-scoped live counts, pending owner, overdue/due dates, direct next-actions; distinguish real/synthetic data.
2. Applications list + new application: category/session/accreditation input, validation, evidence progress, clear save/submit and errors.
3. Dossier: source-pinned "Why this route?", timeline, signed checklist/D1-D2-C3, next legal action, conditional EVC and decision; never fake verified claims.
4. EVC and compliance: eligibility explanation, submitted/verified, real file versions and due origin.

## Visual system
- Neutral navy/blue + teal status accent; consistent spacing (8px scale), readable form typography, clear contrast, keyboard/focus.
- Motion 120–220ms for hover, drawer, modal and status feedback; obey prefers-reduced-motion. No parallax, glowing confetti, animated approval/legal decisions.
- Reuse component styling patterns from shadcn/ui/IBM Carbon/UX4G as *references*; never copy proprietary assets or install unrelated full systems blindly.
- Empty/error/loading/access denied/policy-review-needed states all required.

## After prototype stabilized — GitHub showcase
`README.md` with real screenshots and accurate status; `docs/ARCHITECTURE.md`, `docs/FEATURES_AND_STATUS.md` (B01–B14 traceability), `docs/RESEARCH_AND_RULES.md`, `docs/DEMO_GUIDE.md`, `assets/` real screenshots/video, `.github/workflows/ci.yml` only after actual test runner fix, PR template. No green fake badges, invented deployment URL or certified integration claims.
