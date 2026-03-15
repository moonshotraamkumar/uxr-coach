import Groq from 'groq-sdk';

// Read at runtime so env is always fresh (works on Vercel too)
function getGroqKey(): string | undefined {
  const raw = process.env.GROQ_API_KEY;
  return typeof raw === 'string' ? raw.trim() || undefined : undefined;
}

export function isGroqConfigured(): boolean {
  return Boolean(getGroqKey());
}

export function getGroq(): Groq {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error('GROQ_API_KEY not configured');
  return new Groq({ apiKey });
}

// Fast model — llama-3.3-70b-versatile gives great quality at ~2s on Groq
export const GROQ_MODEL = 'llama-3.3-70b-versatile';
