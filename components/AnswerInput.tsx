'use client';

interface AnswerInputProps {
  questionId: string;
  value: string;
  onChange: (id: string, value: string) => void;
  onSubmit: (id: string) => void;
  loading: boolean;
}

export function AnswerInput({ questionId, value, onChange, onSubmit, loading }: AnswerInputProps) {
  const canSubmit = value.trim().length >= 20 && !loading;

  return (
    <div className="flex flex-col gap-3">
      <label className="text-xs font-semibold text-muted uppercase tracking-wider">
        Your answer
      </label>

      <textarea
        value={value}
        onChange={(e) => onChange(questionId, e.target.value)}
        placeholder="Write your answer here — a rough draft is fine. The more specific you are, the more useful the feedback."
        rows={8}
        className="w-full rounded-xl border border-border bg-surface text-ink placeholder:text-subtle text-sm leading-relaxed px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-sage/40 transition-shadow"
      />

      <div className="flex items-center justify-between">
        <p className="text-xs text-subtle">
          {value.trim().length < 20 && value.length > 0
            ? 'Keep going — a bit more detail unlocks feedback'
            : ''}
        </p>

        <button
          onClick={() => onSubmit(questionId)}
          disabled={!canSubmit}
          className="rounded-xl bg-sage text-white text-sm font-medium px-6 py-2.5 hover:bg-sage-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <>
              <span>Getting feedback</span>
              <span className="flex gap-0.5">
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    className="w-1 h-1 rounded-full bg-white"
                    style={{
                      animation: 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                      animationDelay: `${i * 200}ms`,
                    }}
                  />
                ))}
              </span>
            </>
          ) : (
            'Get Feedback'
          )}
        </button>
      </div>
    </div>
  );
}
