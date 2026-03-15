import { NextResponse } from 'next/server';
import { isAnthropicConfigured } from '@/lib/anthropic';

/**
 * GET /api/health — Check if server-side env (e.g. ANTHROPIC_API_KEY) is configured.
 * Does not expose the key. Use this to verify Vercel env vars after deploy.
 */
export async function GET() {
  return NextResponse.json({ configured: isAnthropicConfigured() });
}
