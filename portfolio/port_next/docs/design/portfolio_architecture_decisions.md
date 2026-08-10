# Production-Ready Portfolio Application: Architectural Decisions & System Specification

## Document Overview
* **Status:** Approved / Baseline Architecture
* **Role:** Senior Software Architect & Developer
* **Target Application:** High-Performance Production Portfolio Web Application
* **Deployment Target:** Vercel (Edge Network / Serverless Runtime)

---

## 1. Executive Summary & Architectural Goals

The goal of this project is to build a production-ready, highly available, sub-second latency software engineering portfolio application. Beyond acting as a dynamic visual landing page, the application serves as a concrete demonstration of senior-level software architecture, production observability, strict type safety, zero-friction developer experience, and bulletproof security.

### Key Performance & Quality Targets
* **Core Web Vitals:** Sub-second Largest Contentful Paint (LCP < 1.0s), zero Cumulative Layout Shift (CLS = 0), and Interaction to Next Paint (INP < 100ms).
* **Availability & Resilience:** Edge-cached static content, graceful fallback for dynamic services, strict rate limiting, and zero single points of failure for public pages.
* **Security & Compliance:** Automated bot protection, strict Content Security Policy (CSP), parameterized queries, and OWASP Top 10 alignment.

---

## 2. Technology Stack Selection Matrix

| Architectural Layer | Selected Technology | Rationale & Architectural Justification |
| :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Hybrid rendering framework providing Static Site Generation (SSG) for project case studies, Server-Side Rendering (SSR) for dynamic tools, and Server Actions for secure form handlers. |
| **Language** | **TypeScript 5+ (Strict Mode)** | End-to-end type safety across UI components, API request/response schemas, MDX metadata, and database queries. |
| **Styling & Design System** | **Tailwind CSS + Shadcn UI (Radix Primitives)** | Utility-first, zero-runtime CSS engine paired with unstyled, accessible UI components. Allows complete styling customization without bundle bloating. |
| **Animations & FX** | **Framer Motion** | Declarative layout animations, page transition orchestration, and micro-interactions optimized for GPU acceleration. |
| **Content Engine** | **Contentlayer / MDX** | Local, version-controlled Markdown/MDX parser providing fully typed frontmatter schemas and embedding capability for live React components within case studies. |
| **Database & ORM** | **Neon (Serverless Postgres) + Prisma ORM** | PostgreSQL with instant autoscaling and connection pooling, paired with type-safe database access and migration management via Prisma. |
| **Contact & Mail** | **Resend API + Cloudflare Turnstile** | Modern email delivery API paired with lightweight, privacy-focused bot defense (non-intrusive alternative to reCAPTCHA). |
| **Rate Limiting & Caching** | **Upstash Redis** | Serverless HTTP-based Redis for token-bucket rate limiting on contact APIs and Server Actions. |
| **Observability & Analytics** | **Sentry + PostHog** | Sentry for real-time error tracking and performance profiling; PostHog for privacy-first, cookie-less user analytics and telemetry. |

---

## 3. System Architecture & Component Design

```
                               ┌─────────────────────────────────────────┐
                               │           Vercel CDN Edge               │
                               │  (Edge Caching, Route Optimization)     │
                               └────────────────────┬────────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             ▼                                      ▼                                      ▼
┌─────────────────────────┐            ┌─────────────────────────┐            ┌─────────────────────────┐
│     Static / SSG        │            │   Server Actions / API  │            │    Dynamic Content /    │
│  (Landing, Projects,    │            │  (Contact, Rate Limits, │            │    AI RAG Playground    │
│   Case Studies MDX)     │            │    Turnstile Token)     │            │  (Postgres / Vector)    │
└─────────────────────────┘            └────────────┬────────────┘            └────────────┬────────────┘
                                                    │                                      │
                                         ┌──────────┴──────────┐                ┌──────────┴──────────┐
                                         ▼                     ▼                ▼                     ▼
                                 ┌───────────────┐     ┌───────────────┐┌───────────────┐     ┌───────────────┐
                                 │ Upstash Redis │     │  Resend API   ││ Neon Postgres │     │ Vector Store  │
                                 │ (Rate Limit)  │     │ (Email Sync)  ││ (Prisma ORM)  │     │ (pgvector)    │
                                 └───────────────┘     └───────────────┘└───────────────┘     └───────────────┘
```

---

## 4. Detailed Feature Set Specification

### 4.1 Core Pages & Interactive Features
1. **Hero & Command Center:**
   * High-impact summary, active working status indicator ("Available for Architecture Consulting"), and primary action triggers.
   * Real-time metrics bar powered by cached edge state (e.g., *Uptime*, *GitHub Commits*, *System Architecture Projects*).
2. **Projects & Deep-Dive Case Studies (`/projects`, `/projects/[slug]`):**
   * Filterable project matrix by tag (e.g., *Distributed Systems*, *Full-Stack*, *Cloud Infrastructure*).
   * Interactive case study layout including dynamic table of contents, reading time estimates, code blocks with syntax highlighting, and embedded live preview components.
3. **Interactive Experience & Timeline (`/experience`):**
   * Chronological breakdown of roles, system engineering milestones, quantifiable metrics (e.g., latency reductions, scale managed), and tech stack badges.
4. **Interactive RAG AI Playground (`/assistant`):**
   * Portfolio-grounded AI assistant powered by `pgvector` / similarity search over portfolio MDX files, resume data, and architectural writings. Strictly scoped to refuse off-topic prompts.
5. **Contact Portal (`/contact`):**
   * Contact form powered by Next.js Server Actions, Zod validation, Cloudflare Turnstile token verification, and Upstash Redis rate-limiting (max 3 requests per IP per hour).

### 4.2 Security & Operational Guardrails
* **HTTP Security Headers:**
  * `Content-Security-Policy` (CSP) configured with tight script, style, and frame src rules.
  * `Strict-Transport-Security` (`max-age=63072000; includeSubDomains; preload`).
  * `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.
* **Automated CI/CD Pipeline:**
  * GitHub Actions pipeline executing `npm run lint`, `tsc --noEmit`, automated formatting verification, and Vercel Preview deployments on every Pull Request.

---

## 5. Content Blueprint & Case Study Standard

To reflect senior engineering craftsmanship, all case study content must adhere to the **3-Tier Impact Protocol**:

### Case Study Frontmatter Schema
```yaml
title: "Distributed Low-Latency Task Scheduler"
summary: "High-throughput, event-driven task processing system handling 2.5M events/day."
date: "2026-04-12"
category: "Distributed Systems"
tags: ["TypeScript", "Node.js", "Redis", "PostgreSQL", "Docker"]
featured: true
githubUrl: "https://github.com/example/task-scheduler"
liveUrl: "https://demo.taskscheduler.io"
metrics:
  - label: "Throughput"
    value: "2.5M ev/day"
  - label: "P99 Latency"
    value: "< 45ms"
  - label: "Uptime"
    value: "99.99%"
```

### Case Study Structure
1. **Executive Summary & System Context:**
   * Core problem statement, business domain background, scale metrics, and SLA/SLO constraints.
2. **Architecture & Technical Trade-Offs:**
   * Component topology diagram (Mermaid.js / SVG).
   * Detailed discussion on alternative solutions considered and trade-off rationales (e.g., *Redis Streams vs. Apache Kafka*).
3. **Quantifiable Impact & Lessons Learned:**
   * Key benchmarks, performance before vs. after, resilience testing results, and retro analysis.

---

## 6. Directory Structure Blueprint

```
.
├── .github/
│   └── workflows/
│       └── ci.yml               # CI Pipeline (Lint, Typecheck, Test, Build)
├── content/
│   ├── projects/               # MDX files for project case studies
│   └── writings/               # MDX files for tech articles / notes
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Landing / Hero
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx    # Gallery
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── api/
│   │   │   └── og/route.tsx    # Dynamic OpenGraph Image Generator
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── layout/             # Header, Footer, Navigation
│   │   ├── case-study/         # Custom MDX components
│   │   └── modules/            # Domain components (Hero, Assistant, Contact)
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── redis.ts            # Upstash Redis rate limiter
│   │   ├── resend.ts           # Resend email client
│   │   └── mdx.ts              # Contentlayer utilities
│   └── types/                  # Global TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Postgres database schema
├── contentlayer.config.ts      # MDX & Contentlayer schema definition
├── tailwind.config.ts          # Styling theme & design tokens
├── tsconfig.json               # Strict TypeScript configuration
└── package.json
```

---

## 7. Sign-off & Next Steps

* [x] **Tech Stack Finalized:** Next.js 14, TypeScript, Tailwind, Shadcn, MDX, Neon, Resend, Upstash.
* [x] **Architecture Approved:** Hybrid SSG/SSR with Server Actions & Edge Rate Limiting.
* [x] **Content Standard Established:** Structured 3-Tier Case Study Protocol.
* [ ] **Phase 1 Execution:** Initializing repository structure, ESLint/Prettier setup, and core routing shell.
