# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository. **Update this file after major changes, new features, or milestones** — keep it in sync with the actual project state.

---

## 1. Project Goals

**Primary:** Build a calm, mentor-style interview prep tool for senior UX researchers.

**Emotional goal:** Feel like talking to a wise, experienced mentor who keeps you accountable and wants you to shine — not a test, not a grader.

**Scope:** Stateless MVP. No auth, no database, no payments.

**Current milestone:** v1 — Core loop: JD in → questions + rubrics → write answer → mentor feedback.

See [project_spec.md](project_spec.md) for full requirements, user flows, API contracts, and prompt strategy.

---

## 2. Architecture Overview

Stateless Next.js app. Two API routes only — no database, no auth, no persistence.

```
uxr-coach/
├── app/
│   ├── layout.tsx                  # Root layout (Inter font, metadata, bg-canvas)
│   ├── page.tsx                    # Two-panel layout — owns ALL client state
│   ├── globals.css
│   └── api/
│       ├── generate-questions/
│       │   └── route.ts            # Web search + question + rubric generation (agentic loop)
│       └── feedback/
│           └── route.ts            # Answer evaluation + mentor feedback
├── components/
│   ├── JDInput.tsx                 # Textarea + Generate button; collapses after generation
│   ├── QuestionList.tsx            # Left panel — list of 10 questions
│   ├── QuestionCard.tsx            # Individual question item (clickable, staggered animation)
│   ├── RubricPanel.tsx             # Expandable accordion: competencies + example
│   ├── AnswerInput.tsx             # Textarea + Get Feedback button
│   ├── FeedbackPanel.tsx           # 3-part feedback: what worked / missing / strengthen
│   ├── LoadingState.tsx            # Calm pulsing dots, no jarring spinners
│   └── ErrorState.tsx              # Gracious error messages with next-step suggestions
├── lib/
│   ├── anthropic.ts                # Anthropic client singleton + system prompts
│   └── types.ts                    # All shared TypeScript types (source of truth)
├── docs/
│   ├── architecture.md             # System design and data flow detail
│   └── changelog.md                # Version history
└── public/
```

**Data flow:**
- **Generate questions:** User pastes JD → `/api/generate-questions` → agentic loop (Claude web searches Prepfully/Glassdoor/LinkedIn/UXR forums + recent job postings for competencies) → returns 10 questions with rubrics as JSON
- **Get feedback:** User writes answer → `/api/feedback` → Claude evaluates against rubric → returns 3-part mentor feedback as JSON

See [docs/architecture.md](docs/architecture.md) for detailed data flow diagrams.

---

## 3. Design, Style, and UX Guidelines

### Emotional reference: Headspace-calm

Every interaction should reduce anxiety, not add to it. This user is a senior UXR in a stressful job search. The tool must feel like a safe space to practice.

### Color palette (Tailwind custom tokens)

| Token | Hex | Use |
|---|---|---|
| `canvas` | `#FAF9F7` | Page background |
| `surface` | `#F4F1EC` | Cards, panels |
| `border` | `#E8E3DB` | Dividers, input outlines |
| `ink` | `#252D2A` | Primary text |
| `muted` | `#5E7A6E` | Labels, secondary text (sage-tinted) |
| `subtle` | `#8FB5A8` | Placeholders, disabled (sage-tinted) |
| `sage` | `#7C9E8C` | Primary accent — buttons, selected state |
| `sage-hover` | `#6A8D7B` | Button hover |
| `sage-light` | `#EBF2EE` | "What landed well" bg, craft badge |
| `amber` | `#C4953A` | "What's missing" — warm, not alarming |
| `amber-light` | `#FDF6E7` | "What's missing" bg, behavioral badge |

### Interaction rules

- Questions animate in **staggered** (100ms apart) — never all at once
- Rubric accordion: smooth `max-height` CSS transition — never `display: none`
- Feedback panel: **fades in** after submission
- Loading: **3 pulsing dots** with staggered delay — never a jarring spinner
- Error messages: calm, specific, suggest next step (e.g. "That JD was a bit short — try adding the responsibilities section")

### Layout

- **Desktop:** Two-panel — left (380px question list), right (rubric + answer + feedback)
- **Mobile:** Single-column stacked; "Back to questions" button in right panel header

### UX non-negotiables

- **Show rubric BEFORE the user writes** — they deserve to know what good looks like
- **No scores, grades, or tier labels** anywhere in MVP — the emotional contract is mentorship
- **Feedback format always:** What landed well → What's missing → How to strengthen
- **Specific feedback only** — "you answered well" is not feedback. Name the thing.
- This user knows good research — generic, fluffy output will feel like an insult

---

## 4. Constraints and Policies

### Security — MUST follow

- **NEVER** expose `ANTHROPIC_API_KEY` to the client — server-side only, always in env vars
- **NEVER** commit `.env.local`, `.env.production`, or any file containing API keys
- Guard every API route: return 500 if `ANTHROPIC_API_KEY` is undefined
- Validate and sanitize all user input — never use `dangerouslySetInnerHTML`

### Code quality

- TypeScript **strict mode** — no `any` types without explicit justification in a comment
- Run `npm run lint` before every commit — no exceptions
- Run `npm run build` before pushing — must pass with zero type errors
- No UI component libraries — custom Tailwind components only
- Minimize external dependencies

### Output quality bar

- Every prompt must produce **senior-level, role-specific** output — not boilerplate
- If output feels generic, the system prompt needs improvement — fix the prompt, not the UI

---

## 5. Repo / Git Etiquette

### Hard rules

- **NEVER commit directly to `main`** — always create a feature branch first
- **NEVER force push to `main`**
- **NEVER delete files without confirming with the user first**
- **NEVER skip lint or build** before committing

### Branch naming

```
feature/description    # new features
fix/description        # bug fixes
chore/description      # config, deps, docs
```

### Workflow for every change

1. `git checkout -b feature/your-feature-name`
2. Make changes
3. `npm run lint` — must pass
4. `npm run build` — must pass with zero errors
5. Run one automated test (see §7)
6. Prompt user to do a manual test
7. `git add [specific files]` — never `git add -A` (risk of committing secrets)
8. Commit with a clear message
9. `git push -u origin feature/your-feature-name`
10. Open a PR — never merge directly

### Commit messages

- Describe **what changed and why**, not just what
- Keep focused on a single change
- Example: `feat: add RubricPanel accordion with smooth CSS transition`

---

## 6. Frequently Used Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build — also runs TypeScript type check
npm run start        # Run production build locally
npm run lint         # ESLint check

# Git workflow
git checkout -b feature/name          # Start new feature
git add [specific files]              # Stage specific files only
git push -u origin feature/name       # Push branch and set upstream

# Dependency management
npm install [package]                 # Install a new package
npm install                           # Install all dependencies from package.json
```

---

## 7. Testing and Build Instructions

### Before every commit (in order)

1. `npm run lint` — fix any ESLint errors
2. `npm run build` — fix any TypeScript errors
3. **Run one automated test** against the changed area (see below)
4. **Prompt the user to run a manual test** — describe exactly what to click and what to look for

### Automated test (MVP — run before prompting manual test)

Currently: run `npm run build` as the type-level test. As unit tests are added, run them with `npm test`.

For API routes, test with a `curl` against the running dev server:
```bash
# Test generate-questions
curl -X POST http://localhost:3000/api/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"jobDescription": "[paste a real JD here]"}' | jq .

# Test feedback
curl -X POST http://localhost:3000/api/feedback \
  -H "Content-Type: application/json" \
  -d '{"question":"...", "rubric":[...], "answer":"..."}' | jq .
```

### Manual test checklist (prompt user after automated test passes)

- [ ] Paste a real Senior UXR JD → Generate Questions → 10 questions animate in staggered
- [ ] Click a question → rubric accordion visible (closed by default)
- [ ] Expand rubric → competencies + "what good looks like" + senior example visible
- [ ] Write ≥ 20 chars → Get Feedback → 3-part feedback fades in
- [ ] Confirm: no scores, no grades, mentor tone throughout
- [ ] Short JD (< 5 words) → gracious error message suggests adding more context
- [ ] Mobile: panels stack correctly, "Back to questions" button appears

### Environment setup

Copy `.env.example` to `.env.local` and add your Anthropic API key:
```bash
cp .env.example .env.local
# then edit .env.local and add: ANTHROPIC_API_KEY=sk-ant-...
```

See [docs/architecture.md](docs/architecture.md) for full environment variable reference.

---

## 8. Keeping This File Up to Date

**Claude: after every major change, new feature, or milestone, update the relevant section of this file.**

Specifically:
- After adding a new component → update the file tree in §2
- After changing the color palette or design decisions → update §3
- After adding a new API route or changing data flow → update §2 and [docs/architecture.md](docs/architecture.md)
- After adding new commands or scripts → update §6
- After adding automated tests → update §7
- After each milestone → update the "Current milestone" line in §1 and append to [docs/changelog.md](docs/changelog.md)

When in doubt: if someone reading this file would be surprised by the current state of the code, update it.
