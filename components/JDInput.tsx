'use client';

import { useState } from 'react';
import { LoadingState } from './LoadingState';

interface JDInputProps {
  onGenerate: (jd: string) => void;
  loading: boolean;
}

function looksLikeUrl(value: string): boolean {
  const trimmed = value.trim();
  return /^https?:\/\/.+/.test(trimmed) && !trimmed.includes('\n');
}

export function JDInput({ onGenerate, loading }: JDInputProps) {
  const [jd, setJd] = useState('');
  const [fetchingUrl, setFetchingUrl] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const charCount = jd.trim().length;
  const isShort = charCount > 0 && charCount < 300 && !looksLikeUrl(jd);
  const canGenerate = charCount >= 100 && !loading && !looksLikeUrl(jd);
  const showUrlPill = looksLikeUrl(jd) && !fetchingUrl;

  function handleChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setJd(e.target.value);
    setFetchError(null);
  }

  async function handleFetchUrl() {
    setFetchingUrl(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/fetch-jd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: jd.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFetchError(data.message ?? 'Could not fetch that page. Try pasting the text instead.');
      } else {
        setJd(data.text);
      }
    } catch {
      setFetchError('Could not reach that page. Try pasting the job description text instead.');
    } finally {
      setFetchingUrl(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canGenerate) onGenerate(jd);
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* ── Navbar ── */}
      <nav className="border-b border-border bg-white sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <svg width="28" height="28" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="36" height="36" rx="10" fill="#635BFF"/>
              <path d="M9 12a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-5l-5 4v-4h-4a2 2 0 0 1-2-2V12z" fill="white"/>
              <circle cx="14" cy="16.5" r="1.5" fill="#635BFF"/>
              <circle cx="18" cy="16.5" r="1.5" fill="#635BFF"/>
              <circle cx="22" cy="16.5" r="1.5" fill="#635BFF"/>
            </svg>
            <span className="text-base font-semibold text-ink">UXR Interview Coach</span>
          </div>
          <span className="text-sm text-subtle">No sign-up. No data stored. Free.</span>
        </div>
      </nav>

      {/* ── Main content ── */}
      <main className="flex-1 w-full max-w-2xl mx-auto px-6 pt-20 pb-14">
        <div className="flex flex-col gap-10">

          {/* Hero */}
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl font-semibold text-ink tracking-tight leading-snug">
              Practice like the job<br />depends on it.
            </h1>
            <p className="text-muted text-lg leading-relaxed">
              Drop in a job description or paste a link. Get practice questions and actionable feedback to show up with confidence.
            </p>
          </div>

          {loading ? (
            <div className="flex flex-col gap-4">
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <p className="text-xs text-subtle mb-1">Analysing</p>
                <p className="text-sm text-muted truncate">
                  {looksLikeUrl(jd)
                    ? jd.trim()
                    : jd.slice(0, 100).trim() + (jd.length > 100 ? '…' : '')}
                </p>
              </div>
              <LoadingState message="Generating your questions…" />
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="relative">
                <textarea
                  value={jd}
                  onChange={handleChange}
                  placeholder="Paste the job description text, or drop in a URL (Greenhouse, Lever, Ashby, company career pages)."
                  rows={6}
                  className="w-full rounded-xl border border-border bg-surface text-ink placeholder:text-subtle text-lg leading-relaxed px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-sage/40 transition-shadow"
                />

                {showUrlPill && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-surface border border-border rounded-lg px-3 py-2 shadow-sm">
                    <p className="text-xs text-muted truncate pr-3">Job posting URL detected</p>
                    <button
                      type="button"
                      onClick={handleFetchUrl}
                      className="shrink-0 rounded-lg bg-sage text-white text-sm font-medium px-3 py-1.5 hover:bg-sage-hover transition-colors"
                    >
                      Fetch job description
                    </button>
                  </div>
                )}

                {fetchingUrl && (
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2 shadow-sm">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-sage"
                          style={{
                            animation: 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                            animationDelay: `${i * 200}ms`,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted">Fetching job description…</p>
                  </div>
                )}
              </div>

              {/* Button row */}
              <div className="flex items-center justify-end gap-4 flex-wrap">
                <div className="flex items-center gap-4">
                  {fetchError ? (
                    <p className="text-xs text-amber">{fetchError}</p>
                  ) : isShort ? (
                    <p className="text-xs text-amber">
                      Add more context — try including responsibilities and qualifications.
                    </p>
                  ) : null}

                  <button
                    type="submit"
                    disabled={!canGenerate}
                    className="shrink-0 rounded-xl bg-sage text-white text-base font-medium px-6 py-2.5 hover:bg-sage-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Start Practicing
                  </button>
                </div>
              </div>
            </form>
          )}

        </div>
      </main>
    </div>
  );
}
