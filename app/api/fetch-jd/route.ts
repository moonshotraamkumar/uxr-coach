import { NextRequest, NextResponse } from 'next/server';

export const maxDuration = 15;

function extractText(html: string): string {
  const text = html
    // Remove entire blocks that are never JD content
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')
    // Self-closing <br> variants → newline
    .replace(/<br\s*\/?>/gi, '\n')
    // Block closing tags → newline (keeps paragraphs readable)
    .replace(/<\/(p|div|li|h[1-6]|section|article|blockquote|tr)>/gi, '\n')
    // Opening block tags that signal a new line
    .replace(/<(p|div|li|h[1-6]|section|article|blockquote|tr)[^>]*>/gi, '\n')
    // All remaining tags → empty string (not a space, to avoid word-splitting)
    .replace(/<[^>]+>/g, '')
    // Decode common HTML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2019;/g, '\u2019')
    .replace(/&rsquo;/g, '\u2019')
    .replace(/&lsquo;/g, '\u2018')
    .replace(/&rdquo;/g, '\u201D')
    .replace(/&ldquo;/g, '\u201C')
    .replace(/&nbsp;/g, ' ')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&#\d+;/g, ' ')   // numeric entities we don't handle → space
    .replace(/&[a-z]+;/g, ' ') // any remaining named entities → space
    // Trim each line (removes leading spaces left by stripped opening tags)
    .split('\n')
    .map((line) => line.trim())
    .join('\n')
    // Collapse 3+ blank lines to 2
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  return text.slice(0, 8000);
}

function isValidUrl(raw: string): boolean {
  try {
    const url = new URL(raw.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: 'Invalid request body.' }, { status: 400 });
  }

  const { url } = body;

  if (!url || !isValidUrl(url)) {
    return NextResponse.json({ message: 'A valid http/https URL is required.' }, { status: 422 });
  }

  try {
    const response = await fetch(url.trim(), {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      // Don't follow redirects to login pages silently
      redirect: 'follow',
    });

    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        return NextResponse.json(
          {
            message:
              "This site blocked the request (login required or access denied). Try copying the job description text directly.",
          },
          { status: 422 }
        );
      }
      return NextResponse.json(
        { message: `Failed to fetch page (HTTP ${response.status}). Try copying the text instead.` },
        { status: 422 }
      );
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return NextResponse.json(
        { message: 'URL does not point to a readable page. Try copying the job description text.' },
        { status: 422 }
      );
    }

    const html = await response.text();
    const text = extractText(html);

    if (text.length < 100) {
      return NextResponse.json(
        {
          message:
            "Couldn't extract enough text from that page (it may require a login). Try copying the job description text.",
        },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    // ENOTFOUND, ECONNREFUSED, etc.
    if (message.includes('fetch failed') || message.includes('ENOTFOUND')) {
      return NextResponse.json(
        { message: "Couldn't reach that URL. Check the link or paste the job description text instead." },
        { status: 422 }
      );
    }
    console.error('[fetch-jd]', err);
    return NextResponse.json({ message: 'Something went wrong fetching that page.' }, { status: 500 });
  }
}
