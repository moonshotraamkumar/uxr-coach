# Project spec for UXR Interview Coach
## Project goals
- Help senior UXR job seekers (5+ years experience) prepare for interviews
- Generate craft and behavioral questions tailored to senior/staff-level roles
- Show a rubric before answering so users know what good looks like
- Provide structured feedback on written answers
## Build goal
90-minute MVP. Ship the core loop only.
## Core user flow
1. Paste JD → click Generate Questions
2. Browse 5 craft + 5 behavioral questions (blended from AI + public question banks)
3. Click a question → rubric appears (competencies, what good looks like,
   1 senior UXR example — AI-generated)
4. Write answer
5. Submit → structured feedback: what worked, what's missing,
   how to strengthen with examples from past work
## MVP scope
- JD input + Generate Questions button
- 5 craft + 5 behavioral questions
- Questions blended from AI generation + web search of public UXR question banks
  (Glassdoor, LinkedIn, UXR community forums) via Anthropic web search tool
- Expandable rubric per question
- Answer input
- Feedback panel
## Not in scope (MVP)
- Crowdsourced question scraping
- UXR finder
- Saved sessions
- Auth, database, payments
## Future versions
- Mock interview mode (timed, no rubric, feedback at end)
- Surface 1-3 UXRs at target company for insider insight
- Session history + export as PDF
- Voice answer mode
- Difficulty setting (senior / staff / principal)
- Community question bank
## Design
- Clean, minimal, professional — think Linear or Notion
- Two-panel layout: questions left, rubric + answer + feedback right
- Graceful error handling for short JDs or API failures
## Tech stack
- Next.js + Tailwind CSS + TypeScript
- Anthropic API with web_search tool enabled for question sourcing
- ANTHROPIC_API_KEY stored in .env
- Vercel deployment
- Stateless — no database needed for MVP
## Success criteria
- App generates relevant questions for a real JD
- At least some questions pulled from real public sources
- Rubric feels specific to the role, not generic
- Feedback is actionable, not fluffy
## Claude can decide
- API design, component architecture
- Rubric structure and competency taxonomy

## Mobile design requirements
- App must be fully mobile responsive
- Use Tailwind mobile-first breakpoints (sm, md, lg)
- Test every component at 375px width (iPhone SE minimum)
- On mobile (< 768px): stack layout vertically —
  questions on top, answer + feedback below
- Use tabs on mobile to switch between questions
  and answer/feedback panels
- Touch targets minimum 44px height
- No horizontal scrolling on any screen size
