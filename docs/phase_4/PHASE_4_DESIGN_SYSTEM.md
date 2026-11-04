# NIYAMSETU (नियमसेतु) — PHASE 4
## Unified Regulatory Design System & Component Guidelines

**System:** NIYAMSETU — AICTE Approval Workflow Automation  
**SIH 2026 Problem Statement:** PS 26262 | Team Defensor  
**Target Branch:** `dev`  
**Execution Timestamp:** 2026-11-03T20:55:00+05:30  
**Design Philosophy:** Institutional Credibility, High Contrast, Calm Authority & Zero Clutter

---

## 1. Core Visual Foundations

The NIYAMSETU design system is crafted specifically for high-stakes regulatory governance. It rejects flashy consumer gradients and generic admin dashboard templates in favor of crisp typography, structured information hierarchy, and purposeful semantic color.

```
+-------------------------------------------------------------------------------+
|                       GOVERNMENT REGULATORY PALETTE                           |
|-------------------------------------------------------------------------------|
|  Navy Primary:        #061828 (Gov Navy 900)  |  #0a2540 (Gov Navy 800)       |
|  Surface / Canvas:    #ffffff (Card Surface)  |  #f0f2f7 (App Canvas Neutral) |
|  Borders / Dividers:  #e2e8f0 (Slate 200)     |  #cbd5e1 (Slate 300)          |
|  National Saffron:    #e05a10 (Accent Orange) |  #d97706 (Amber Warning)      |
|  Statutory Green:     #0d8248 (Clearance)     |  #1d4ed8 (Primary Action Blue)|
|  Judicial Purple:     #6b21a8 (Appeals / SAC) |  #b91c1c (Adverse / Breach)   |
+-------------------------------------------------------------------------------+
```

---

## 2. Typography & Hierarchy Scale

- **Primary Body & Display Font:** `Inter`, `-apple-system`, `BlinkMacSystemFont`, `Segoe UI`, `Roboto`, `sans-serif`
- **Monospace Regulatory Font:** `JetBrains Mono`, `ui-monospace`, `SFMono-Regular`, `monospace` (Used for Application IDs, Clause Citations, PANs, Hashes, Dates, and Intakes).

| Level | CSS Classes | Font Size / Line Height | Weight | Typical Usage |
| :--- | :--- | :--- | :---: | :--- |
| **Page Title** | `text-xl font-bold text-slate-900 tracking-tight` | 20px / 28px | 700 | Primary view header on every screen. |
| **Section Header** | `text-sm font-bold text-slate-900 tracking-wide uppercase` | 14px / 20px | 700 | Form sections, table headers, drawer titles. |
| **Card Header** | `text-sm font-semibold text-slate-900` | 14px / 20px | 600 | Modal titles, sub-card headers. |
| **Body Primary** | `text-xs text-slate-700 leading-normal` | 12px / 18px | 400–500 | Table cells, field labels, descriptions. |
| **Body Secondary** | `text-[11px] text-slate-500` | 11px / 16px | 400 | Subtitles, timestamps, explanatory notes. |
| **Monospace Citation**| `font-mono text-xs font-semibold` | 12px / 16px | 600 | Clause citations, PID references, hashes. |

---

## 3. Semantic Color & Status Invariants

Never communicate regulatory status through color alone. Every status badge must combine an icon, an explicit text label, and high-contrast background/border pairing:

| Semantic Status | Background | Text Color | Border Color | Icon | Regulatory Meaning |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **Approved / Cleared** | `bg-emerald-50` | `text-emerald-900` | `border-emerald-200` | `CheckCircle2` | Statutory clearance, EoA/LoA issued, deficiency cured. |
| **In Progress / Active**| `bg-blue-50` | `text-blue-900` | `border-blue-200` | `Clock` | Application submitted, scrutiny underway, EVC scheduled. |
| **Deficiency / Warning**| `bg-amber-50` | `text-amber-900` | `border-amber-200` | `AlertTriangle` | Deficiency communicated, SLA approaching deadline. |
| **Adverse / Overdue** | `bg-rose-50` | `text-rose-900` | `border-rose-200` | `XCircle` | SLA overdue breach, rejection speaking order, un-cured deficiency. |
| **Judicial / Appeal** | `bg-purple-50` | `text-purple-900` | `border-purple-200` | `Scale` | Standing Hearing Committee (SHC) or SAC appellate review. |
| **Simulated / Demo** | `bg-slate-100` | `text-slate-700` | `border-slate-300` | `Sparkles` | Deliberate simulation badge (PAN, DSC token check). |

---

## 4. Page Architecture & Layout Standards

Every primary screen in NIYAMSETU follows a deliberate four-tier structure:
1. **Government Header Banner:**
   - Page Title and concise one-line purpose statement explaining the exact task.
   - Active Role Context pill (e.g. `Role 1: Applicant Portal`, `Role 2: Scrutiny Committee`).
   - Primary action button (e.g. "Export CSV", "New Application +", "Submit Evaluation").
2. **Contextual Filter & Search Strip:**
   - Purpose-built search and dropdown filters (Region, Stage, SLA status).
   - Direct count indicator (e.g. `Showing 6 of 12 Applications`).
3. **Primary Working Surface:**
   - Page-specific layout tailored to the role's actual job (Interactive Docket Table, Side-by-Side Review Split, Timeline Queue, Roster Matrix).
4. **Secondary Drawer / Modal:**
   - Dedicated deep inspection workspace (`ApplicationDetailModal`, `NewApplicationModal`, `CaseSummaryNoticesModal`).
