'use client';

import { useState } from 'react';
import { LoadingState } from './LoadingState';

interface JDInputProps {
  onGenerate: (jd: string) => void;
  loading: boolean;
}

export function JDInput({ onGenerate, loading }: JDInputProps) {
  const [jd, setJd] = useState('');

  const charCount = jd.trim().length;
  const isShort = charCount > 0 && charCount < 300;
  const canGenerate = charCount >= 100 && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (canGenerate) onGenerate(jd);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-ink tracking-tight">
            UXR Interview Coach
          </h1>
          <p className="text-muted text-base">
            Paste a job description to get tailored questions, a rubric, and mentor-style feedback.
          </p>
        </div>

        {loading ? (
          <LoadingState message="Searching question banks and analysing the role…" />
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <textarea
              value={jd}
              onChange={(e) => setJd(e.target.value)}
              placeholder="Paste the full job description here — the more detail, the better the questions."
              rows={12}
              className="w-full rounded-xl border border-border bg-surface text-ink placeholder:text-subtle text-sm leading-relaxed px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-sage/40 transition-shadow"
            />

            <div className="flex items-center justify-between gap-4">
              {isShort ? (
                <p className="text-xs text-amber">
                  Add more context — try including the responsibilities and qualifications sections.
                </p>
              ) : (
                <span />
              )}

              <button
                type="submit"
                disabled={!canGenerate}
                className="shrink-0 rounded-xl bg-sage text-white text-sm font-medium px-6 py-2.5 hover:bg-sage-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate Questions
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
