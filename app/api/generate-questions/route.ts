import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { anthropic, QUESTION_GENERATION_SYSTEM_PROMPT } from '@/lib/anthropic';
import { Question, GenerateQuestionsRequest } from '@/lib/types';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Guard: API key must be configured
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: 'CONFIG_ERROR', message: 'API key not configured.' },
      { status: 500 }
    );
  }

  // Parse and validate input
  let body: GenerateQuestionsRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { jobDescription } = body;

  if (!jobDescription || jobDescription.trim().length < 100) {
    return NextResponse.json(
      {
        error: 'SHORT_JD',
        message:
          "That job description is a bit short. Try adding the full responsibilities and qualifications sections — the more context, the better the questions.",
      },
      { status: 422 }
    );
  }

  // Truncate very long JDs to avoid token bloat
  const jd = jobDescription.slice(0, 6000);

  const userPrompt = `Here is the job description:\n\n${jd}\n\nPlease:\n1. Search for UXR interview questions at: https://prepfully.com/interview-questions/r/ux-researcher — find 3–5 real questions to blend in (label these source: "web")\n2. Search for recent Senior/Staff/Principal UXR job postings (last 60–90 days) to identify the 3–5 most prominent competencies right now\n3. Generate exactly 10 interview questions with rubrics as JSON matching this schema: { "questions": [{ "id": string, "type": "craft"|"behavioral", "text": string, "source": "ai"|"web", "rubric": [{ "competency": string, "whatGoodLooksLike": string, "seniorExample": string }] }] }\n\nOutput valid JSON only.`;

  // Agentic loop to resolve web_search tool calls
  const messages: Anthropic.MessageParam[] = [
    { role: 'user', content: userPrompt },
  ];

  let finalText = '';

  try {
    while (true) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-6',
        max_tokens: 8000,
        tools: [
          {
            type: 'web_search_20250305' as const,
            name: 'web_search',
          },
        ],
        tool_choice: { type: 'auto' as const },
        system: QUESTION_GENERATION_SYSTEM_PROMPT,
        messages,
      });

      if (response.stop_reason === 'end_turn') {
        finalText = response.content
          .filter((b): b is Anthropic.TextBlock => b.type === 'text')
          .map((b) => b.text)
          .join('');
        break;
      }

      if (response.stop_reason === 'tool_use') {
        // Add assistant response to conversation
        messages.push({ role: 'assistant', content: response.content });

        // Acknowledge all tool_use blocks (web_search results are server-side)
        const toolResults: Anthropic.ToolResultBlockParam[] = response.content
          .filter((b): b is Anthropic.ToolUseBlock => b.type === 'tool_use')
          .map((b) => ({
            type: 'tool_result' as const,
            tool_use_id: b.id,
            content: '',
          }));

        messages.push({ role: 'user', content: toolResults });
        continue;
      }

      // max_tokens or unexpected stop — break out gracefully
      break;
    }
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'RATE_LIMIT', message: 'Too many requests — please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json(
        { error: 'AUTH_ERROR', message: 'API authentication failed. Check your API key.' },
        { status: 401 }
      );
    }
    console.error('generate-questions error:', err);
    return NextResponse.json(
      { error: 'API_ERROR', message: 'Something went wrong generating questions. Please try again.' },
      { status: 500 }
    );
  }

  // Parse JSON response — defensive
  let parsed: { questions: Question[] };
  try {
    const cleaned = finalText
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('JSON parse error. Raw text:', finalText.slice(0, 500));
    return NextResponse.json(
      { error: 'PARSE_ERROR', message: 'Something went wrong generating questions. Please try again.' },
      { status: 500 }
    );
  }

  // Ensure all questions have stable IDs
  const questions: Question[] = parsed.questions.map((q, i) => ({
    ...q,
    id: q.id || `q-${Date.now()}-${i}`,
  }));

  return NextResponse.json({ questions });
}
