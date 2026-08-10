/**
 * Structured portfolio content. Edit this file to update site copy.
 * Primary brand: Staff Analog IC Design Engineer (resume).
 * Agentic ML block is an explicit portfolio demo, not CV employment.
 */

export const portfolioContent = {
  /**
   * Public site origin for canonical / Open Graph / sitemap.
   * Set this to your real HTTPS origin before publishing (no trailing slash).
   */
  site: {
    origin: 'https://venkataratnamb20.github.io/cursor_experiments',
    ogImagePath: '/assets/og-default.svg',
  },
  profile: {
    name: 'Venkata Ratnam Bhumireddy',
    title: 'Staff Analog IC Design Engineer',
    availability: 'Open to senior analog / mixed-signal IC design roles',
    pitch:
      '14+ years designing mixed-signal ASICs — SAR ADCs, PMICs, ADPLLs, and SerDes — from architecture through layout and tape-out across 180nm to 14nm CMOS.',
    primaryCta: { label: 'Explore portfolio', href: '#portfolio' },
    secondaryCta: { label: 'View resume', href: '#resume' },
  },
  hero: {
    videoUrl: './assets/hero-loop.mp4',
    posterUrl: './assets/hero-poster.jpg',
    attribution:
      'Hero still: Unsplash (circuit imagery). Hero loop: Pexels motherboard clip by Tima Miroshnichenko (free license). Project stills: Unsplash.',
  },
  about: {
    heading: 'About',
    body: [
      'I am a Staff Analog IC Design Engineer at Vishay Siliconix in Cork, focused on optical sensors and encoders. Earlier roles at MCCI, GateLength, Analog Semiconductors, and NXP covered SAR ADCs, high-speed buck converter power paths, RF digital PLLs, SerDes transmitters, bandgaps, LDOs, and crystal oscillators.',
      'Hands-on ownership spans schematic design, simulation, layout collaboration, IO ring assembly, and tape-out. Technology nodes from 180nm down to 14nm. Alongside silicon work, I continue coursework in AI, ML, and generative AI, and maintain a portfolio-demo practice in agentic systems.',
    ],
  },
  education: [
    {
      school: 'Dhirubhai Ambani Institute of ICT (DA-IICT), Gandhinagar, India',
      degree: 'Masters Degree, VLSI',
      period: '2010 — 2012',
      detail:
        'Thesis: Design of Low Power and High-Speed Comparator with Sub-32nm Double Gate MOSFET. Subjects: Analog/Digital CMOS IC Design, Signals and Systems. CGPA 7.8/10.',
    },
    {
      school: 'GVP PG College, Visakhapatnam, India',
      degree: 'Master of Science, Electronics',
      period: '2006 — 2008',
      detail:
        'Semiconductor devices, analog and digital electronics. Thesis: Industrial Timer and Controller using 8051 microcontroller (68.48%).',
    },
    {
      school: 'Sri Venkateswara University, Tirupati, India',
      degree: 'Bachelor of Science, Electronics',
      period: '2003 — 2006',
      detail: 'Mathematics, Physics, Electronics. Percentage 72.30%.',
    },
  ],
  experience: [
    {
      kind: 'role',
      period: '2022/06 — Present',
      role: 'Staff, Analog IC Design Engineer',
      company: 'Vishay Siliconix, Cork, Ireland',
      bullets: [
        'Design of optical sensors and optical encoders for production silicon.',
      ],
    },
    {
      kind: 'role',
      period: '2017/07 — 2022/06',
      role: 'Senior Research Engineer',
      company: 'MCCI, Cork, Ireland',
      bullets: [
        'Low-power SAR ADC for PMIC at 180nm.',
        'Design/layout of high-speed buck converter power path at 28nm (2019–2020).',
        'High-speed 16 GHz RF digital PLL at 28nm with 0.6 ps rms jitter (2017–2019).',
      ],
    },
    {
      kind: 'role',
      period: '2015/02 — 2017/07',
      role: 'Senior Design Engineer',
      company: 'GateLength Technology Pvt Ltd, Bangalore, India',
      bullets: [
        'Analysis and performance improvements of 16 Gbps and 32 Gbps SerDes Tx at 14nm.',
        'Clock-path and data-path optimization; macro and top-level characterization.',
        'Layout support for performance closure.',
      ],
    },
    {
      kind: 'role',
      period: '2014/10 — 2014/12',
      role: 'Consultant Engineer',
      company: 'Analog Semiconductors, Bangalore, India',
      bullets: [
        '1.6 GHz CMOS comparator for 100 MSPS 14-bit SAR ADC at 65nm.',
        'Top-level ADC integration support and layout guidance.',
      ],
    },
    {
      kind: 'role',
      period: '2012/10 — 2014/12',
      role: 'Design Engineer',
      company: 'NXP Semiconductors India Pvt Ltd, Bangalore, India',
      bullets: [
        'Bandgap reference, POR, pulse generator, and ring oscillator for switched regulator at 140nm.',
        'LDO design, simulation, and characterization at 65nm.',
        'Debug and verification of 32 MHz CMOS crystal oscillator at 140nm.',
      ],
    },
    {
      kind: 'role',
      period: '2011/09 — 2012/07',
      role: 'Junior Research Fellow',
      company: 'Dhirubhai Ambani Institute of ICT, Gandhinagar, India',
      bullets: [
        'Low-power high-speed comparator research with sub-32nm double-gate MOSFET.',
        'IEEE ICCAS 2013 publication (Kuala Lumpur).',
      ],
    },
    {
      kind: 'role',
      period: '2008/11 — 2010/07',
      role: 'Lecturer',
      company: 'Yuva Educational Society, Ongole, India',
      bullets: [
        'Taught ECE subjects for GATE preparation; assessment and student mentoring.',
      ],
    },
    {
      kind: 'demo',
      label: 'Portfolio demo',
      period: 'Portfolio demo',
      role: 'Senior ML Engineer — Agentic AI Systems',
      company: 'Independent portfolio demonstration (not CV employment)',
      bullets: [
        'Design multi-agent workflows: planner, tool-using workers, and critic loops with explicit handoff contracts.',
        'Ground agents with retrieval (RAG), structured tool schemas, and evaluation harnesses for groundedness and task success.',
        'Prototype production-minded agent stacks using open frameworks (AutoGen, CrewAI) with observability and failure recovery.',
      ],
    },
  ],
  projects: [
    {
      title: '16 GHz all-digital PLL for SerDes',
      summary:
        'Part of the team that designed a 16 GHz ADPLL at 28nm targeting SerDes applications, achieving 0.6 ps rms jitter.',
      tags: ['ADPLL', 'RF', '28nm', 'SerDes'],
      metrics: [
        { label: 'Frequency', value: '16 GHz' },
        { label: 'Jitter', value: '0.6 ps rms' },
      ],
      imageUrl: './assets/project-silicon.jpg',
      githubUrl: 'https://github.com/microsoft/autogen',
      liveUrl: '',
    },
    {
      title: '100 MHz PMIC ASIC tape-out',
      summary:
        'Designed and taped out a 100 MHz PMIC ASIC with ~90% efficiency at 28nm for an H2020 project, including high-speed buck converter power-path work.',
      tags: ['PMIC', 'Power', '28nm', 'Tape-out'],
      metrics: [
        { label: 'Clock', value: '100 MHz' },
        { label: 'Efficiency', value: '~90%' },
      ],
      imageUrl: './assets/project-lab.jpg',
      githubUrl: 'https://github.com/crewAIInc/crewAI',
      liveUrl: '',
    },
    {
      title: 'AutoGen multi-agent orchestration (placeholder)',
      summary:
        'Portfolio placeholder exploring conversational multi-agent patterns, tool calling, and human-in-the-loop control using Microsoft AutoGen.',
      tags: ['Agentic AI', 'AutoGen', 'Python'],
      metrics: [{ label: 'Focus', value: 'Multi-agent' }],
      imageUrl: './assets/project-agents.jpg',
      githubUrl: 'https://github.com/microsoft/autogen',
      liveUrl: 'https://github.com/microsoft/autogen',
    },
    {
      title: 'CrewAI role-based agent crews (placeholder)',
      summary:
        'Portfolio placeholder for role-based agent crews — researcher, engineer, and reviewer agents collaborating on structured deliverables.',
      tags: ['Agentic AI', 'CrewAI', 'Evals'],
      metrics: [{ label: 'Pattern', value: 'Crew roles' }],
      imageUrl: './assets/project-agents.jpg',
      githubUrl: 'https://github.com/crewAIInc/crewAI',
      liveUrl: 'https://github.com/crewAIInc/crewAI',
    },
  ],
  resume: {
    url: './assets/resume.pdf',
    label: 'Download full resume (PDF)',
    highlights: [
      'Staff / senior mixed-signal ASIC ownership: optical sensors, SAR ADC, PMIC, ADPLL, and SerDes Tx across 180nm–14nm.',
      'End-to-end silicon delivery: architecture, design, simulation, layout collaboration, IO ring, and tape-out.',
      'Published IEEE ICCAS 2013 comparator research; ongoing AI/ML and generative AI coursework.',
      'Portfolio demo (not CV employment): Senior ML Engineer practice for agentic AI systems — see Experience.',
    ],
  },
  faq: [
    {
      question: 'What kinds of roles are you targeting?',
      answer:
        'Senior or staff analog / mixed-signal IC design roles — ADCs, PMICs, PLLs, SerDes, sensors — with clear ownership from architecture through silicon bring-up. I am also open to conversations about applied ML and agentic systems where silicon and AI intersect.',
    },
    {
      question: 'Are you open to remote or hybrid work?',
      answer:
        'Based in Cork, Ireland. Open to Ireland and EU hybrid or on-site lab roles; remote-friendly collaboration for documentation, modeling, and cross-site reviews.',
    },
    {
      question: 'How should recruiters reach you?',
      answer:
        'Use the contact form or email venkata.ratnam.in17@gmail.com. Include role, process node/domain, and team context. LinkedIn: linkedin.com/in/venkata-ratnam-bhumireddy.',
    },
    {
      question: 'Is the Senior ML / agentic AI section real employment?',
      answer:
        'No. It is labeled Portfolio demo — independent exploration of multi-agent systems using public frameworks. My CV employment history is analog / mixed-signal IC design.',
    },
  ],
  contact: {
    email: 'venkata.ratnam.in17@gmail.com',
    socials: [
      {
        label: 'LinkedIn',
        href: 'https://www.linkedin.com/in/venkata-ratnam-bhumireddy',
      },
      {
        label: 'GitHub (placeholders)',
        href: 'https://github.com/microsoft/autogen',
      },
    ],
  },
  mediaAttribution: [
    'Unsplash photographs used under the Unsplash License (https://unsplash.com/license). See assets/ATTRIBUTION.md.',
    'Hero video: Pexels free stock (motherboard close-up) — see assets/ATTRIBUTION.md.',
    'GitHub project links are public placeholders for portfolio demonstration.',
  ],
};
