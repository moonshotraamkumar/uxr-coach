# Architecture

## Overview

UXR Interview Coach is a stateless Next.js app. No database, no auth, no persistence. Every session is ephemeral — nothing is stored between page loads.

Two server-side API routes handle all AI interactions. The browser owns all session state via React `useState`.

---

## Data Flow

### Flow 1 — Generate Questions

```
Browser
  │
  ├─ User pastes JD → clicks "Generate Questions"
  │
  └─ POST /api/generate-questions { jobDescription }
       │
       ├─ Validate: reject if JD < 100 chars (422 SHORT_JD)
       │
       └─ Agentic loop with claude-sonnet-4-6 + web_search tool
            │
            ├─ Search 1: Prepfully + public UXR question banks
            ├─ Search 2: Recent Senior/Staff/Principal UXR job postings (last 60–90 days)
            │
            └─ Generate 10 questions (5 craft + 5 behavioral) with rubrics
                 │
                 └─ Return JSON: { questions: Question[] }
                      │
                      └─ Browser renders questions in left panel (staggered animation)
                           Auto-selects first question
```

### Flow 2 — Get Feedback

```
Browser
  │
  ├─ User writes answer → clicks "Get Feedback"
  │
  └─ POST /api/feedback { question, rubric, answer }
       │
       ├─ Validate: reject if answer < 20 chars (422 EMPTY_ANSWER)
       │
       └─ Single claude-sonnet-4-6 call (no tool use)
            │
            └─ Return JSON: { whatLandedWell, whatIsMissing, howToStrengthen }
                 │
                 └─ Browser fades in FeedbackPanel
```

---

## Key Architectural Decisions

**Stateless by design**
No database means no user data stored, no privacy concerns, no infrastructure to manage. Each session is isolated. Trade-off: no session history (post-MVP feature).

**Agentic loop for question generation**
The Anthropic SDK does not automatically resolve `tool_use` blocks — we implement a `while` loop that pushes assistant messages back and acknowledges tool results until `stop_reason === 'end_turn'`. The `web_search` tool is server-side at Anthropic — we don't receive or forward search results, we just acknowledge the tool call.

**Non-streaming for both routes**
Both API responses are structured JSON that must be parsed atomically. Streaming partial JSON is fragile. Instead, loading states (pulsing dots) cover the perceived latency gap client-side.

**All state in `page.tsx`**
No global state library (Redux, Zustand, Context). All `useState` hooks live in `app/page.tsx` and are passed as props. The component tree is shallow enough that this is maintainable.

**`key` prop for accordion reset**
`RubricPanel` uses `key={question.id}` to force a React remount when the selected question changes, resetting the `open` state to `false` without needing a `useEffect`.

---

## Component Tree

```
page.tsx (client, owns all state)
├── JDInput              — phase: 'input' | 'loading-questions'
└── [two-panel layout]   — phase: 'questions'
    ├── QuestionList
    │   └── QuestionCard (×10)
    └── [right panel]
        ├── RubricPanel  (key={question.id})
        ├── AnswerInput
        ├── ErrorState   (conditional)
        └── FeedbackPanel (conditional)
```

---

## API Routes

### `POST /api/generate-questions`

| Property | Value |
|---|---|
| Runtime | Node.js (server-side) |
| Max duration | 60s (`export const maxDuration = 60`) |
| Model | `claude-sonnet-4-6` |
| Tools | `web_search_20250305` |
| Tool choice | `auto` |
| Max tokens | 8000 |
| Input validation | JD must be ≥ 100 chars; truncated to 6000 chars |

### `POST /api/feedback`

| Property | Value |
|---|---|
| Runtime | Node.js (server-side) |
| Max duration | 30s |
| Model | `claude-sonnet-4-6` |
| Tools | None |
| Max tokens | 1000 |
| Input validation | Answer must be ≥ 20 chars |

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `ANTHROPIC_API_KEY` | Yes | Anthropic API key — server-side only, never exposed to client |

---

## Deployment

Target: Vercel (free tier for personal projects).

**Important for Vercel Hobby plan:** Serverless functions have a 10-second timeout on Hobby. The `generate-questions` route can take 20–30s due to web search. Either:
- Upgrade to Vercel Pro (`maxDuration = 60` works on Pro)
- Or reduce to one web search call to fit within 10s

`maxDuration = 60` is already set in the route file — deploy to Vercel Pro for the full experience.
