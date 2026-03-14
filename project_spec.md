# Project Spec: UXR Interview Coach

> A calm, mentor-style interview prep tool for senior UX researchers. Paste a JD, get role-specific questions with rubrics, write answers, receive structured feedback that builds confidence — not anxiety.

---

## 1. Project Goal

**Primary goal:** Building an MVP

**Goal statement:**
> Help senior UXR professionals (laid off or quietly looking) prepare for interviews by generating role-specific questions, showing a rubric before each answer, and delivering warm, structured feedback — like a wise mentor who keeps you accountable and wants you to shine.

---

## 2. Milestones

### MVP (Milestone 1)

The core loop: JD in → questions + rubrics out → write answer → get feedback.

- JD input + Generate Questions button
- 10 questions (5 craft + 5 behavioral), blended from AI generation + web search of public question banks (Glassdoor, LinkedIn, UXR forums, Prepfully)
- Expandable rubric per question (2–4 competencies, what good looks like, 1 senior UXR example)
- Answer textarea per question
- Feedback panel: what worked / what's missing / how to strengthen
- Graceful error handling (short JDs, API failures)
- Responsive layout: two-panel desktop, single-column mobile
- Headspace-inspired visual design

**Leaving out of MVP:**
- Auth, accounts, saved sessions
- Database or persistence of any kind
- Payments
- Voice mode
- Mock interview mode (timed, no rubric, feedback at end)
- PDF export
- Difficulty settings (senior / staff / principal)
- Community features
- UXR finder / insider contacts

### Version 2 (Milestone 2)

- **Feedback quantification:** Rubric-anchored coaching tiers (*Developing / Ready / Standout*) per competency — framed as growth signal, not grade. Prepfully used as calibration benchmark for what "Ready" looks like at senior level.
- **Session history:** Save past answers + feedback, show progress delta ("Stronger than last time on stakeholder framing")
- **Mock interview mode:** Timed, no rubric shown during, full feedback at end
- **Difficulty settings:** Senior / Staff / Principal level toggle

### Future Versions

- **Community feature:** Connect UXRs in similar job-search situations for peer support — find a mock interview partner (local or remote), async chat, share company-specific intel. Peer support, not leaderboard. Open questions: async vs. live? Anonymous vs. named? Moderation model?
- Voice answer mode
- Surface 1–3 UXRs at target company for insider insight
- PDF export of session
- Community question bank

---

## 3. Product Requirements

### Who is this for?

**Target user:**
> Senior UX researchers (5+ years experience) who are either laid off and actively interviewing for senior/staff/principal roles, or quietly looking while employed to build a branded presence.

**User context:**
> Practicing alone, often anxious about articulating past impact. They know what good research looks like — generic, fluffy output will feel like an insult. They need a tool that feels calm and safe, not like a test or a grader.

### What problems does it solve?

1. **Articulation gap:** Senior UXRs struggle to frame their past work in terms of business impact and influence, not just methodology
2. **Relevance gap:** Generic interview prep sites don't generate questions specific enough to a particular role or company context
3. **Feedback gap:** There's no way to get structured, honest feedback on written answers outside of paying a career coach
4. **Anxiety:** Job searching is stressful — existing tools feel clinical or evaluative, making it worse

### Key user flows

**Flow 1: Generate questions from a JD**
1. User pastes a job description into the JD input
2. Clicks "Generate Questions"
3. App calls `/api/generate-questions` — Claude web searches public question banks + recent job postings for competencies, then generates 10 questions with rubrics
4. Questions animate in staggered in the left panel; JD input collapses

**Flow 2: Review a question and write an answer**
1. User clicks a question in the left panel
2. Right panel shows: question text → rubric accordion (closed by default) → answer textarea → "Get Feedback" button
3. User expands rubric to read competencies + what good looks like + senior example
4. User writes their answer in the textarea

**Flow 3: Get feedback**
1. User clicks "Get Feedback"
2. App calls `/api/feedback` with question + rubric + answer
3. Feedback panel fades in below textarea: what landed well → what's missing → how to strengthen
4. No score, no grade — mentor tone throughout

---

## 4. Technical Requirements

### Tech Stack

| Component | Choice | Notes |
|---|---|---|
| Language | TypeScript | Full-stack |
| Frontend Framework | Next.js (App Router) | |
| Styling | Tailwind CSS | |
| Component Library | None (custom) | Headspace-calm design system built in Tailwind |
| Backend Framework | Next.js API Routes | Route handlers in `app/api/` |
| Database | None | Stateless MVP — no persistence |
| Authentication | None | MVP is auth-free |
| Hosting | Vercel | |
| AI | Anthropic API — `claude-sonnet-4-6` | |
| Web Search | Anthropic `web_search` tool | Question sourcing + competency research |
| Payments | None (MVP) | |
| Email | None (MVP) | |
| Object Storage | None | |

### Technical Architecture

**System overview:**
> A stateless Next.js app. The browser sends the JD to `/api/generate-questions`, which runs two web searches (question banks + recent job postings) then calls Claude to generate questions + rubrics in one pass. The browser renders questions; when the user submits an answer, `/api/feedback` calls Claude to generate 3-part mentor feedback. No data is persisted — each session is ephemeral.

**Key components:**

| Component | Purpose |
|---|---|
| `JDInput` | Textarea + Generate button; collapses after generation |
| `QuestionList` | Left panel — lists 10 questions, highlights selected |
| `QuestionCard` | Individual question item, clickable |
| `RubricPanel` | Expandable accordion — competencies + what good looks like + example |
| `AnswerInput` | Textarea + Get Feedback button |
| `FeedbackPanel` | 3-part feedback: what worked / missing / strengthen |
| `LoadingState` | Calm loading UI (subtle pulsing, not jarring spinner) |
| `ErrorState` | Gracious error messages |

**File structure:**
```
app/
  page.tsx                    # Root — two-panel layout
  api/
    generate-questions/
      route.ts                # Web search + question + rubric generation
    feedback/
      route.ts                # Answer evaluation + mentor feedback

components/
  JDInput.tsx
  QuestionList.tsx
  QuestionCard.tsx
  RubricPanel.tsx
  AnswerInput.tsx
  FeedbackPanel.tsx
  LoadingState.tsx
  ErrorState.tsx

lib/
  anthropic.ts                # Anthropic client + system prompts
  types.ts                    # Shared TypeScript types
```

**Database schema:** None — stateless.

**API design:**

`POST /api/generate-questions`
```json
Input:  { "jobDescription": "string" }
Output: {
  "questions": [{
    "id": "string",
    "type": "craft" | "behavioral",
    "text": "string",
    "source": "ai" | "web",
    "rubric": [{
      "competency": "string",
      "whatGoodLooksLike": "string",
      "seniorExample": "string"
    }]
  }]
}
```

`POST /api/feedback`
```json
Input:  { "question": "string", "rubric": [...], "answer": "string" }
Output: {
  "whatLandedWell": "string",
  "whatIsMissing": "string",
  "howToStrengthen": "string"
}
```

**Prompt strategy:**

*Question generation system prompt:*
> You are a senior UXR hiring manager and career coach. Generate interview questions that feel like they came from the actual hiring team. Use the JD to identify research context (0→1 vs. scaled, B2B vs. consumer) and surface craft priorities. Blend web-sourced questions with AI-generated ones. Label each by source. Generate a rubric per question with 2–4 competencies — specific to senior level for this role, not generic.

*Feedback system prompt:*
> You are a warm, experienced UXR career coach. Acknowledge what genuinely worked before naming gaps. End with one concrete suggestion tied to the candidate's own story. No scores, no grades, no tier labels. Make the candidate want to revise — not feel evaluated.

**Rubric competency sources:**
1. Always include (when relevant): *Stakeholder influence & communication*, *Strategic thinking & business impact*
2. Dynamically sourced: Claude web searches Senior/Staff/Principal UXR job postings from the past 60–90 days to surface the 3–5 most commonly cited competencies, blended per session

### Infrastructure to Provision

- [x] Anthropic API key → stored in `.env.local` as `ANTHROPIC_API_KEY`
- [ ] Vercel project (deploy from repo)
- [ ] Domain (optional, post-MVP)

---

## 5. Open Questions

**Product questions:**
- [ ] Should rubric be collapsed or open by default? (Current: closed — user chooses when to look)
- [ ] Should the user be able to regenerate individual questions they don't like?
- [ ] How many questions per session is right — 10 feels right, but worth testing with real users

**Technical questions:**
- [ ] Should question generation use streaming for faster perceived performance?
- [ ] Is one API call (questions + rubrics together) better than two separate calls for latency?

---

## 6. Out of Scope (MVP)

- Auth, accounts, saved sessions, database
- Payments, subscriptions
- Voice answer mode
- Mock interview mode (timed, no rubric)
- Difficulty settings (senior / staff / principal)
- Community / peer connection features
- PDF export
- UXR finder / insider contacts at target company
- Scores, grades, or tier-based evaluation

---

## Summary

**One-liner:** Interview prep coach for senior UXRs — role-specific questions, rubrics, and mentor-style feedback.

**MVP scope:** JD input → 10 questions with rubrics (AI + web-sourced) → answer textarea → 3-part mentor feedback. Stateless, no auth, no DB.

**Tech stack:** Next.js + Tailwind + TypeScript, Anthropic API (`claude-sonnet-4-6`) with `web_search`, Vercel.

**MVP "done" looks like:** A senior UXR pastes a real JD, gets questions that feel eerily relevant, reads a rubric that raises their bar, writes an answer, and receives feedback that names a real gap and makes them want to rewrite. They feel more confident, not more anxious. They'd share it with a peer.

**Design north star:** Headspace. Calm, breathable, warm neutrals, generous whitespace. A safe space to practice, not a performance evaluation.

**Non-negotiables:** Quality output (this user knows good research), no grading/scoring, calm UI, specific feedback.
