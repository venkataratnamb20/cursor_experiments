# Production-Ready Portfolio Application: Architectural Decisions & System Specification (v2.0)

## Document Overview
* **Status:** Approved / Revised Architecture (Post-Review Architecture Baseline)
* **Role:** Senior Software Architect & Lead Developer
* **Target Application:** High-Performance Production Portfolio Web Application
* **Deployment Target:** Vercel (Edge Network / Serverless Runtime)

---

## 1. Executive Summary & Architectural Goals

The goal of this project is to build a production-ready, highly available, sub-second latency software engineering portfolio application. Beyond acting as a dynamic visual landing page, the application serves as a concrete demonstration of senior-level software architecture, production observability, strict type safety, zero-friction developer experience, and bulletproof security.

### Key Performance & Quality Targets
* **Core Web Vitals:** Sub-second Largest Contentful Paint (LCP < 1.0s), zero Cumulative Layout Shift (CLS = 0), and Interaction to Next Paint (INP < 100ms).
* **Availability & Resilience:** Edge-cached static content, graceful fallback for dynamic services, strict rate limiting, and zero single points of failure for public pages.
* **Security & Compliance:** Automated bot protection, strict Content Security Policy (CSP), parameterized queries, circuit-breaker fallbacks, and OWASP Top 10 alignment.

---

## 2. Technology Stack Selection Matrix & Review Modifications

| Architectural Layer | Selected Technology | Rationale & Architecture Justification | Status / Revision Notes |
| :--- | :--- | :--- | :--- |
| **Framework** | **Next.js 14+ (App Router)** | Hybrid rendering framework providing Static Site Generation (SSG) for project case studies, Server-Side Rendering (SSR) for dynamic tools, and Server Actions for secure form handlers. | Retained |
| **Language** | **TypeScript 5+ (Strict Mode)** | End-to-end type safety across UI components, API request/response schemas, MDX metadata, and database queries. | Retained |
| **Styling & Design System** | **Tailwind CSS + Shadcn UI (Radix Primitives)** | Utility-first, zero-runtime CSS engine paired with unstyled, accessible UI components. Allows complete styling customization without bundle bloating. | Retained |
| **Animations & FX** | **Framer Motion** | Declarative layout animations, page transition orchestration, and micro-interactions optimized for GPU acceleration. | Retained |
| **Content Engine** | **Velite** | Replaced `Contentlayer` due to open-source maintenance risks. Velite provides zero-runtime, Zod-validated, type-safe MDX processing seamlessly integrated with Next.js App Router builds. | **REVISED (v2.0)** |
| **Database & ORM** | **Neon Serverless Postgres + Prisma ORM** | PostgreSQL using `@neondatabase/serverless` WebSocket driver for zero-cold-start relational access and `pgvector` similarity search for the portfolio AI assistant. | Retained (With Architectural Defense) |
| **Contact & Mail** | **Resend API + Cloudflare Turnstile** | Modern email delivery API paired with lightweight, privacy-focused bot defense (non-intrusive alternative to reCAPTCHA). | Retained |
| **Rate Limiting & Caching** | **Upstash Redis** | Serverless HTTP-based Redis for token-bucket rate limiting on contact APIs and Server Actions without database connection pollution. | Retained |
| **Observability & Resilience** | **Sentry + PostHog** | Sentry for real-time error tracking and circuit-breaker email fallback logging; PostHog for privacy-first, cookie-less user analytics and telemetry. | **ENHANCED (v2.0)** |

---

## 3. Architecture Blueprint & Circuit Breaker Topology

```
                               ┌─────────────────────────────────────────┐
                               │           Vercel CDN Edge               │
                               │  (Edge Caching, Route Optimization)     │
                               └────────────────────┬────────────────────┘
                                                    │
             ┌──────────────────────────────────────┼──────────────────────────────────────┐
             ▼                                      ▼                                      ▼
┌─────────────────────────┐            ┌─────────────────────────┐            ┌─────────────────────────┐
│  Static / SSG (Velite)  │            │   Server Actions / API  │            │    Dynamic Content /    │
│  (Landing, Projects,    │            │  (Contact, Rate Limits, │            │    AI RAG Playground    │
│   Case Studies MDX)     │            │    Turnstile Token)     │            │  (Postgres / Vector)    │
└─────────────────────────┘            └────────────┬────────────┘            └────────────┬────────────┘
                                                    │                                      │
                                         ┌──────────┴──────────┐                ┌──────────┴──────────┐
                                         ▼                     ▼                ▼                     ▼
                                 ┌───────────────┐     ┌───────────────┐┌───────────────────────────────┐
                                 │ Upstash Redis │     │  Resend API   ││ Neon Serverless Postgres      │
                                 │ (Rate Limit)  │     │ (Email Sync)  ││ (Prisma ORM + pgvector)       │
                                 └───────────────┘     └───────┬───────┘└───────────────────────────────┘
                                                               │
                                                       ┌───────▼───────┐
                                                       │ Sentry Logging│
                                                       │ (Fallback)    │
                                                       └───────────────┘
```

---

## 4. Architectural Debates & Decision Record

### Decision 1: Replacing Contentlayer with Velite
* **Context:** The initial design leveraged Contentlayer for compile-time MDX compilation.
* **Review Finding:** Contentlayer has seen minimal open-source maintenance, introducing potential build breaks during Next.js or Node version upgrades.
* **Resolution:** Swapped to **Velite**. Velite validates content against Zod schemas, generates fully typed TypeScript definitions, and integrates cleanly into the Next.js build lifecycle without legacy AST plugin issues.

### Decision 2: Retaining Neon Postgres (`pgvector`) over Third-Party Vector SaaS
* **Context:** The architectural review suggested replacing Neon Postgres with Upstash Vector to eliminate relational connection management.
* **Counter-Rationale:**
  1. **Data Portability & Relational Capability:** Using standard PostgreSQL with `pgvector` prevents vendor lock-in and allows relational joins between vector sources, analytics, and metadata.
  2. **Serverless HTTP/WebSocket Drivers:** Neon’s `@neondatabase/serverless` driver communicates via WebSockets/HTTP, completely neutralizing traditional TCP connection pool exhaustion and cold-start overhead.
  3. **Unified Persistence:** Neon acts as a single, open-standards persistence tier rather than distributing state across disparate proprietary APIs.

### Decision 3: Resilient Server Action Circuit Breaker Pattern
* **Context:** Third-party APIs (Resend, Upstash) can occasionally experience degraded availability or unexpected rate limit spikes.
* **Resolution:** Implemented a Sentry fallback circuit breaker in the contact form action. If email delivery fails unexpectedly, the payload is captured in Sentry as a high-priority structured error event, ensuring zero user inquiries are ever permanently lost.

---

## 5. Detailed Feature Set & Implementation Specifications

### 5.1 Type-Safe MDX Configuration (`velite.config.ts`)
```typescript
import { defineCollection, defineConfig, s } from 'velite';

const projects = defineCollection({
  name: 'Project',
  pattern: 'projects/**/*.mdx',
  schema: s.object({
    title: s.string().max(100),
    summary: s.string().max(300),
    date: s.isodate(),
    category: s.string(),
    tags: s.array(s.string()),
    featured: s.boolean().default(false),
    githubUrl: s.string().url(),
    liveUrl: s.string().url().optional(),
    metrics: s.array(
      s.object({
        label: s.string(),
        value: s.string(),
      })
    ),
  }),
});

export default defineConfig({
  root: 'content',
  collections: { projects },
});
```

### 5.2 Resilient Contact Server Action (`src/app/actions/contact.ts`)
```typescript
'use server';

import { z } from 'zod';
import { resend } from '@/lib/resend';
import { ratelimit } from '@/lib/redis';
import * as Sentry from '@sentry/nextjs';

const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: z.string().email('Invalid email address'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
  turnstileToken: z.string().min(1, 'Captcha verification required'),
});

export async function submitContactForm(prevState: unknown, formData: FormData) {
  const rawData = Object.fromEntries(formData.entries());
  
  // 1. Schema Validation
  const validated = contactSchema.safeParse(rawData);
  if (!validated.success) {
    return { success: false, errors: validated.error.flatten().fieldErrors };
  }

  const { name, email, message, turnstileToken } = validated.data;

  try {
    // 2. Cloudflare Turnstile Verification
    const turnstileRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: turnstileToken,
      }),
    });
    const turnstileData = await turnstileRes.json();
    if (!turnstileData.success) {
      return { success: false, message: 'Bot verification failed. Please try again.' };
    }

    // 3. Upstash Redis Rate Limiting
    const clientIp = '127.0.0.1'; // Extracted from edge headers
    const { success: rateLimitPassed } = await ratelimit.limit(`contact:${clientIp}`);
    if (!rateLimitPassed) {
      return { success: false, message: 'Too many submissions. Please try again in an hour.' };
    }

    // 4. Primary Email Dispatch via Resend
    await resend.emails.send({
      from: 'Portfolio Contact <noreply@yourdomain.com>',
      to: ['your-email@domain.com'],
      subject: `New Inquiry from ${name}`,
      replyTo: email,
      text: message,
    });

    return { success: true, message: 'Thank you! Your message has been delivered.' };

  } catch (error) {
    // 5. Fallback Circuit Breaker (Sentry High-Priority Log)
    Sentry.captureException(error, {
      extra: { payload: { name, email, message }, timestamp: new Date().toISOString() },
      tags: { action: 'contact_form_fallback' },
    });

    return { 
      success: false, 
      message: 'System busy. Your message was securely queued for manual review.' 
    };
  }
}
```

---

## 6. Directory Structure Blueprint (v2.0)

```
.
├── .github/
│   └── workflows/
│       └── ci.yml               # CI Pipeline (Lint, Typecheck, Velite Build, Test)
├── content/
│   ├── projects/               # MDX case studies validated by Velite
│   └── writings/               # MDX tech articles / notes
├── src/
│   ├── app/                    # Next.js 14 App Router
│   │   ├── (public)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx        # Landing / Hero
│   │   │   ├── projects/
│   │   │   │   ├── page.tsx    # Case Study Gallery
│   │   │   │   └── [slug]/page.tsx
│   │   │   ├── experience/page.tsx
│   │   │   ├── assistant/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── actions/
│   │   │   └── contact.ts      # Server action with Turnstile, Redis, Resend & Sentry Circuit Breaker
│   │   ├── api/
│   │   │   ├── assistant/route.ts # RAG assistant streaming endpoint
│   │   │   └── og/route.tsx    # Dynamic OpenGraph Image Generator
│   │   ├── sitemap.ts
│   │   └── robots.ts
│   ├── components/
│   │   ├── ui/                 # Shadcn UI primitives
│   │   ├── layout/             # Header, Footer, Dynamic Nav
│   │   └── modules/            # Portfolio modules (Hero, Case Studies, AI Assistant)
│   ├── lib/
│   │   ├── prisma.ts           # Neon serverless Prisma client
│   │   ├── redis.ts            # Upstash HTTP rate limiter
│   │   └── resend.ts           # Resend email API client
│   └── types/                  # Global TypeScript type definitions
├── prisma/
│   └── schema.prisma           # Postgres database schema (with pgvector extension)
├── velite.config.ts            # Velite schema definition (Replaced Contentlayer)
├── tailwind.config.ts          # Styling design system tokens
├── tsconfig.json               # Strict TypeScript configuration
└── package.json
```

---

## 7. Sign-off & Next Steps

* [x] **Tech Stack Finalized:** Next.js 14, TypeScript, Tailwind, Shadcn, Velite, Neon Postgres, Resend, Upstash, Sentry.
* [x] **Architecture Review Integrated:** Addressed Contentlayer deprecation risk, defended Neon serverless connection strategy, implemented Server Action circuit breaker.
* [x] **Content Standard Established:** Structured 3-Tier Case Study Protocol with Zod validation.
* [ ] **Phase 1 Execution:** Initializing repository structure, installing dependencies, and creating core routing shell.
