import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropic, isAnthropicConfigured, QUESTION_GENERATION_SYSTEM_PROMPT } from '@/lib/anthropic';
import { Question, GenerateQuestionsRequest } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!isAnthropicConfigured()) {
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
  const jd = jobDescription.slice(0, 4000);

  const userPrompt = `Here is the job description:\n\n${jd}\n\nReturn a JSON object with two fields:\n1. "insights": 3–5 strings (no bullet character) — what will make a candidate stand out for THIS specific role. Be specific to the JD, not generic.\n2. "questions": exactly 5 interview questions (mix of craft and behavioral) with rubrics.\n\nJSON schema:\n{ "insights": [string], "questions": [{ "id": string, "type": "craft"|"behavioral", "text": string, "source": "ai", "rubric": [{ "competency": string, "whatGoodLooksLike": string, "seniorExample": string }] }] }\n\nOutput valid JSON only.`;

  let finalText = '';

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2500,
      system: QUESTION_GENERATION_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userPrompt }],
    });

    finalText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');
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
  let parsed: { questions: Question[]; insights?: string[] };
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

  const insights: string[] = Array.isArray(parsed.insights) ? parsed.insights : [];

  return NextResponse.json({ questions, insights });
}
