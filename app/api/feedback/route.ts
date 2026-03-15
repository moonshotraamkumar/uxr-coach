import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getGroq, isGroqConfigured, GROQ_MODEL } from '@/lib/groq';
import { getAnthropic, isAnthropicConfigured, FEEDBACK_SYSTEM_PROMPT } from '@/lib/anthropic';
import { FeedbackRequest, FeedbackResponse } from '@/lib/types';

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

  let body: FeedbackRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'INVALID_REQUEST', message: 'Invalid request body.' },
      { status: 400 }
    );
  }

  const { question, rubric, answer } = body;

  if (!answer || answer.trim().length < 20) {
    return NextResponse.json(
      {
        error: 'EMPTY_ANSWER',
        message: "Write a bit more before getting feedback — even a rough draft works.",
      },
      { status: 422 }
    );
  }

  const rubricText = rubric
    .map(
      (r) =>
        `Competency: ${r.competency}\nWhat good looks like: ${r.whatGoodLooksLike}\nSenior example: ${r.seniorExample}`
    )
    .join('\n\n');

  const userContent = `Question: ${question}\n\nRubric:\n${rubricText}\n\nCandidate answer:\n${answer}\n\nProvide feedback as JSON with keys: whatLandedWell, whatIsMissing, howToStrengthen. Each value must be an array of short bullet strings.`;

  let text = '';
  try {
    if (useGroq) {
      const response = await getGroq().chat.completions.create({
        model: GROQ_MODEL,
        max_tokens: 1000,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: FEEDBACK_SYSTEM_PROMPT },
          { role: 'user', content: userContent },
        ],
      });
      text = response.choices[0]?.message?.content ?? '';
    } else {
      const response = await getAnthropic().messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: FEEDBACK_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userContent }],
      });
      text = response.content
        .filter((b): b is Anthropic.TextBlock => b.type === 'text')
        .map((b) => b.text)
        .join('');
    }
  } catch (err) {
    console.error('feedback error:', err);
    return NextResponse.json(
      { error: 'API_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }

  try {
    const cleaned = text.replace(/^```json\n?/, '').replace(/\n?```$/, '').trim();
    const feedback: FeedbackResponse = JSON.parse(cleaned);
    return NextResponse.json(feedback);
  } catch {
    return NextResponse.json(
      { error: 'PARSE_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
