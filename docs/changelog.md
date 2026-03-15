# Changelog

## v1.1.0 — URL input (2026-03-14)

### Added
- Job posting URL input: paste a URL (Greenhouse, Lever, Ashby, company career pages) and click "Fetch job description" to auto-populate the JD field
  - Server-side fetch via `/api/fetch-jd` (avoids CORS, strips HTML boilerplate)
  - URL detection is automatic — pill appears when a single-line URL is pasted
  - Graceful fallback: if the site blocks the request (e.g. LinkedIn login wall), a calm error message prompts the user to paste text instead
  - Generate Questions stays disabled while a raw URL is in the field

---

## v1.0.0 — MVP (2026-03-14)

### Added
- JD input with validation (min 100 chars, truncated at 6000)
- Question generation via Anthropic API (`claude-sonnet-4-6`) with `web_search` tool
  - Searches Prepfully + public UXR question banks
  - Searches recent Senior/Staff/Principal UXR job postings for competency signals
  - Generates 5 craft + 5 behavioral questions with rubrics per question
- Rubric accordion per question (closed by default, smooth CSS transition)
  - 2–4 competencies per question: name, what good looks like, senior UXR example
  - Grounded in real hiring criteria from Google, Meta, Airbnb, GitLab, Judd Antin framework
- Answer textarea with min-length validation (20 chars)
- Mentor-style feedback via Anthropic API
  - Three sections: What landed well / What's missing / How to strengthen
  - No scores, grades, or tier labels
- Two-panel desktop layout (380px question list + right panel)
- Single-column mobile layout
- Headspace-calm design system: sage green accent, warm parchment surfaces, sage-tinted text
- Staggered question entrance animations
- Graceful error handling for short JDs, empty answers, API failures, rate limits
- `CLAUDE.md` with project guidance, design system, UX rules, git etiquette
- `docs/architecture.md` with data flow, component tree, API specs
- Stateless — no database, no auth, no persistence

### Tech stack
- Next.js 16 (App Router), TypeScript, Tailwind CSS v4
- Anthropic SDK (`@anthropic-ai/sdk`)
- Vercel deployment target
