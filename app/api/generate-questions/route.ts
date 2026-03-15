import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getGroq, isGroqConfigured, GROQ_MODEL } from '@/lib/groq';
import { getAnthropic, isAnthropicConfigured, QUESTION_GENERATION_SYSTEM_PROMPT } from '@/lib/anthropic';
import { Question, GenerateQuestionsRequest } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const useGroq = isGroqConfigured();
  const useAnthropic = isAnthropicConfigured();

  if (!useGroq && !useAnthropic) {
    return NextResponse.json(
      { error: 'CONFIG_ERROR', message: 'API key not configured.' },
      { status: 500 }
    );
  }

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

  const jd = jobDescription.slice(0, 4000);
  const userPrompt = `Here is the job description:\n\n${jd}\n\nReturn a JSON object with four fields:\n1. "title": the job title extracted from the JD (e.g. "Senior UX Researcher"). If not found, use "UX Researcher".\n2. "location": the location or work arrangement extracted from the JD (e.g. "San Francisco, CA", "Remote", "New York, NY (Hybrid)"). If not found, use null.\n3. "insights": 3-5 strings (no bullet character) — what will make a candidate stand out for THIS specific role. Be specific to the JD, not generic.\n4. "questions": exactly 5 interview questions (mix of craft and behavioral) with rubrics.\n\nJSON schema:\n{ "title": string, "location": string | null, "insights": [string], "questions": [{ "id": string, "type": "craft or behavioral", "text": string, "source": "ai", "rubric": [{ "competency": string, "whatGoodLooksLike": string, "seniorExample": string }] }] }\n\nOutput valid JSON only.`;

  let finalText = '';

  try {
    if (useGroq) {
      const response = await getGroq().chat.completions.create({
        model: GROQ_MODEL,
        max_tokens: 2500,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: QUESTION_GENERATION_SYSTEM_PROMPT },
          { role: 'user', content: userPrompt },
        ],
      });
      finalText = response.choices[0]?.message?.content ?? '';
    } else {
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
    }
  } catch (err) {
    console.error('generate-questions error:', err);
    return NextResponse.json(
      { error: 'API_ERROR', message: 'Something went wrong generating questions. Please try again.' },
      { status: 500 }
    );
  }

  let parsed: { questions: Question[]; insights?: string[]; title?: string; location?: string | null };
  try {
    const cleaned = finalText.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    parsed = JSON.parse(cleaned);
  } catch {
    console.error('JSON parse error. Raw text:', finalText.slice(0, 500));
    return NextResponse.json(
      { error: 'PARSE_ERROR', message: 'Something went wrong generating questions. Please try again.' },
      { status: 500 }
    );
  }

  const questions: Question[] = parsed.questions.map((q, i) => ({
    ...q,
    id: q.id || `q-${Date.now()}-${i}`,
  }));
  const insights: string[] = Array.isArray(parsed.insights) ? parsed.insights : [];
  const title: string = parsed.title ?? '';
  const location: string | null = parsed.location ?? null;

  return NextResponse.json({ questions, insights, title, location });
}
