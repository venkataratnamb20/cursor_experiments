/**
 * Structured portfolio content. Edit this file to update site copy.
 */

export const portfolioContent = {
  profile: {
    name: 'Venkata Ratnam Bhumireddy',
    title: 'Software engineer building reliable systems',
    availability: 'Available for senior architecture roles',
    pitch:
      'I design and ship production systems with clear trade-offs, measurable reliability, and clean interfaces.',
    primaryCta: { label: 'Explore portfolio', href: '#portfolio' },
    secondaryCta: { label: 'View resume', href: '#resume' },
  },
  about: {
    heading: 'About',
    body: [
      'I focus on systems that stay understandable under load: clear boundaries, honest observability, and delivery habits that survive real production constraints.',
      'Placeholder bio — replace with career narrative, domains (distributed systems, APIs, data), and the kinds of problems you want next.',
    ],
  },
  education: [
    {
      school: 'University Name',
      degree: 'B.S. Computer Science',
      period: '2014 — 2018',
      detail: 'Placeholder — replace with institution, degree, and focus areas.',
    },
    {
      school: 'Certification / Program',
      degree: 'Cloud / Architecture credential',
      period: '2022',
      detail: 'Placeholder — add relevant certifications or continuing education.',
    },
  ],
  projects: [
    {
      title: 'Event-driven platform',
      summary:
        'Placeholder case study — high-throughput ingestion with clear SLOs and graceful degradation under burst traffic.',
      tags: ['Architecture', 'Reliability', 'APIs'],
      metrics: [
        { label: 'Throughput', value: '2.5M events/day' },
        { label: 'P99', value: '< 45ms' },
      ],
      githubUrl: 'https://github.com/',
      liveUrl: '',
    },
    {
      title: 'Observability toolkit',
      summary:
        'Placeholder — dashboards, alerts, and runbooks that cut mean time to diagnose for on-call engineers.',
      tags: ['Ops', 'DX', 'Monitoring'],
      metrics: [{ label: 'MTTR', value: '-40%' }],
      githubUrl: 'https://github.com/',
      liveUrl: '',
    },
    {
      title: 'API gateway hardening',
      summary:
        'Placeholder — auth, rate limits, and contract tests that kept partner integrations stable across releases.',
      tags: ['Security', 'APIs', 'Testing'],
      metrics: [{ label: 'Uptime', value: '99.99%' }],
      githubUrl: 'https://github.com/',
      liveUrl: '',
    },
  ],
  resume: {
    url: '#contact',
    label: 'Request full resume',
    highlights: [
      'Designed service boundaries and data flows for multi-team platforms (placeholder).',
      'Owned production incidents end-to-end: detect, mitigate, write postmortems (placeholder).',
      'Mentored engineers on testing strategy, API design, and operational readiness (placeholder).',
    ],
  },
  faq: [
    {
      question: 'What kinds of roles are you targeting?',
      answer:
        'Senior or staff-leaning roles focused on architecture, platform reliability, and shipping complex systems with clear ownership. Update this answer with your real preferences.',
    },
    {
      question: 'Are you open to remote or hybrid work?',
      answer:
        'Placeholder — state preferred locations, time zones, and remote/hybrid preferences.',
    },
    {
      question: 'How should recruiters reach you?',
      answer:
        'Use the contact form below or email directly. Include role, team context, and stack so replies stay useful.',
    },
    {
      question: 'Can you share deeper case studies?',
      answer:
        'Yes — ask via contact for architecture write-ups, metrics, and trade-off notes beyond the summaries on this page.',
    },
  ],
  contact: {
    email: 'hello@example.com',
    socials: [
      { label: 'GitHub', href: 'https://github.com/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/' },
    ],
  },
};
