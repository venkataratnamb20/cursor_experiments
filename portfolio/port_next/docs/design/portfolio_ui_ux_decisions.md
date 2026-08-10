# Production-Ready Portfolio Application: Frontend UI/UX Architectural Decisions Specification

## Document Overview
* **Status:** Approved / Frontend Baseline
* **Role:** Senior Frontend Architect & Lead UI/UX Engineer
* **Target Application:** High-Performance Engineering Portfolio Web Application
* **Design Philosophy:** Minimalist, Technical, Content-Centric, High-Affordance

---

## 1. Core UI/UX Design Principles

```
                     ┌──────────────────────────────────────┐
                     │          UX Core Triad               │
                     └──────────────────┬───────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           ▼                            ▼                            ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
│  1. Signal over Noise│    │  2. High Affordance  │    │  3. Performance UX   │
├──────────────────────┤    ├──────────────────────┤    ├──────────────────────┤
│ • Zero generic text  │    │ • Clear interaction  │    │ • Instant feedback   │
│ • Data-rich visual   │    │   states (hover/focus)│   │ • Optimistic UI      │
│   components         │    │ • Readable typography│    │ • Zero CLS           │
└──────────────────────┘    └──────────────────────┘    └──────────────────────┘
```

1. **Signal over Noise:** The interface prioritizes readability, code clarity, and system topology. Visual flourishes (animations, gradients, glassmorphism) must strictly serve an informational purpose (e.g., indicating state transitions or service health) rather than decorative distraction.
2. **High Interaction Affordance:** Navigation elements, filter pills, code blocks, external links, and form inputs feature explicit, high-contrast hover, focus, and active states.
3. **Performance as a Core UX Feature:** Transitions run at 60–120 FPS. Layout shifts are strictly zero (CLS = 0) via pre-allocated aspect ratios and layout wrappers.

---

## 2. Design Tokens & Visual System

### 2.1 Color System (Dark-Mode Native & Adaptive Light Mode)
The color scale utilizes a neutral zinc/slate foundation paired with high-contrast accent colors for technical status indicators (e.g., active services, build statuses, tag highlights).

```css
/* Design Tokens - Extended CSS Variables */
:root {
  /* Neutral Foundation */
  --bg-primary: #090d16;        /* Deep Space Navy / Code Background */
  --bg-secondary: #111827;      /* Surface Card Background */
  --bg-tertiary: #1f2937;       /* Hover & Border Highlight States */

  /* Typography Colors */
  --text-primary: #f9fafb;     /* High Contrast Primary Body/Titles */
  --text-secondary: #9ca3af;   /* Subtle Metadata / Subtitles */
  --text-muted: #6b7280;       /* Form Hints / Comments */

  /* Technical Accents */
  --accent-cyan: #06b6d4;      /* System Interfaces & Interactive Links */
  --accent-emerald: #10b981;   /* Live Service Uptime / Success Badges */
  --accent-amber: #f59e0b;     /* Warnings / Trade-off Highlights */
  --accent-rose: #f43f5e;      /* Errors / Rate-Limit Alerts */
}
```

### 2.2 Typography Scale
Typography balances editorial legibility for case studies with monospaced precision for system metrics and code snippets.

| Role | Font Family | Size / Leading | Usage |
| :--- | :--- | :--- | :--- |
| **Display / Hero** | `Geist Sans` / `Inter` | `3.5rem (56px) / 1.1` | Main landing headline / value proposition |
| **Heading 1 / Title** | `Geist Sans` / `Inter` | `2.25rem (36px) / 1.2` | Case study titles, major page section headers |
| **Heading 2 / Section**| `Geist Sans` / `Inter` | `1.5rem (24px) / 1.3` | Section headings within project case studies |
| **Body / Editorial** | `Geist Sans` / `Inter` | `1.125rem (18px) / 1.6` | Case study write-ups, experience narratives |
| **Code / Technical** | `Geist Mono` / `JetBrains Mono` | `0.95rem (15.2px) / 1.5` | Code blocks, system metrics, terminal output |

---

## 3. Core Page Layouts & Component Strategy

### 3.1 Hero & Command Center (`/`)
* **Live Status Badge:** Pulsing status indicator displaying current availability (e.g., `🟢 Available for Senior Architecture Roles`).
* **Technical Metrics Bar:** Highlight bar showcasing quantifiable impact (e.g., *2.5M Events/Day*, *< 45ms P99 Latency*, *99.99% SLO*).
* **Primary CTAs:** High-contrast primary action (`Explore System Case Studies`) alongside a secondary ghost button (`Inspect Architecture Blueprint`).

### 3.2 Case Study Reading Experience (`/projects/[slug]`)
* **Sticky Table of Contents (TOC):** Side-docked scroll-spy tracking reading progress and enabling instant navigation across case study tiers (*Context*, *Architecture & Trade-offs*, *Impact*).
* **Interactive Architecture Schematics:** Client-rendered SVG / Mermaid.js diagrams with pan/zoom controls for inspecting microservice workflows.
* **Rich Code Blocks:** Syntax highlighting powered by `Shiki` (build-time rendered) featuring line highlighting, line numbers, and copy-to-clipboard feedback.

### 3.3 AI Assistant Playground (`/assistant`)
* **Streaming Responses:** Terminal-style or modern drawer window streaming response tokens in real-time.
* **Source Citations:** Interactive pill badges linking generated claims directly to relevant project case studies or resume items.

---

## 4. Motion Engineering & Animation Standards

Animations are powered by `framer-motion` and strictly limited to **transform** and **opacity** CSS properties to prevent repaints and layout recalculations.

```typescript
// src/components/ui/motion-wrapper.tsx
import { motion, Variants } from 'framer-motion';

export const FADE_UP_VARIANT: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.3, ease: [0.25, 0.4, 0.25, 1] } 
  },
};

export const STAGGER_CONTAINER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};
```

---

## 5. Accessibility (a11y) & Usability Standards

To ensure full compliance with WCAG 2.1 AA standards:

1. **Keyboard Navigability:** All interactive components (cards, filter pills, code toggles) feature clear focus rings (`ring-2 ring-accent-cyan ring-offset-2`).
2. **Screen Reader Architecture:**
   * MDX case studies utilize semantic elements (`<article>`, `<section>`, `<aside>`).
   * Dynamic content shifts (such as streaming AI responses) use `aria-live="polite"`.
3. **Contrast Compliance:** All text tokens maintain minimum contrast ratios against background tokens (Minimum `4.5:1` for body text, `3:1` for display titles).
