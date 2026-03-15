import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { getAnthropic, isAnthropicConfigured, FEEDBACK_SYSTEM_PROMPT } from '@/lib/anthropic';
import { FeedbackRequest, FeedbackResponse } from '@/lib/types';

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!isAnthropicConfigured()) {
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

  // Build rubric context string
  const rubricText = rubric
    .map(
      (r) =>
        `Competency: ${r.competency}\nWhat good looks like: ${r.whatGoodLooksLike}\nSenior example: ${r.seniorExample}`
    )
    .join('\n\n');

  try {
    const response = await getAnthropic().messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1000,
      system: FEEDBACK_SYSTEM_PROMPT,
      messages: [
        {
          role: 'user',
          content: `Question: ${question}\n\nRubric:\n${rubricText}\n\nCandidate answer:\n${answer}\n\nProvide feedback as JSON with keys: whatLandedWell, whatIsMissing, howToStrengthen. Each value must be an array of short bullet strings.`,
        },
      ],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('');

    const cleaned = text
      .replace(/^```json\n?/, '')
      .replace(/\n?```$/, '')
      .trim();

    const feedback: FeedbackResponse = JSON.parse(cleaned);
    return NextResponse.json(feedback);
  } catch (err) {
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json(
        { error: 'RATE_LIMIT', message: 'Too many requests — please wait a moment and try again.' },
        { status: 429 }
      );
    }
    if (err instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'PARSE_ERROR', message: 'Something went wrong. Please try again.' },
        { status: 500 }
      );
    }
    console.error('feedback error:', err);
    return NextResponse.json(
      { error: 'API_ERROR', message: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}
