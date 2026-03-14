import { FeedbackResponse } from '@/lib/types';

interface FeedbackPanelProps {
  feedback: FeedbackResponse;
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div
      className="flex flex-col gap-3"
      style={{ animation: 'fadeIn 0.4s ease-out forwards' }}
    >
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Feedback</p>

      {/* What landed well */}
      <div className="rounded-xl bg-sage-light px-5 py-4 flex flex-col gap-1">
        <p className="text-xs font-semibold text-sage uppercase tracking-wider">What landed well</p>
        <p className="text-sm text-ink leading-relaxed">{feedback.whatLandedWell}</p>
      </div>

      {/* What's missing */}
      <div className="rounded-xl bg-amber-light px-5 py-4 flex flex-col gap-1">
        <p className="text-xs font-semibold text-amber uppercase tracking-wider">What&apos;s missing</p>
        <p className="text-sm text-ink leading-relaxed">{feedback.whatIsMissing}</p>
      </div>

      {/* How to strengthen */}
      <div className="rounded-xl bg-surface border border-border px-5 py-4 flex flex-col gap-1">
        <p className="text-xs font-semibold text-muted uppercase tracking-wider">How to strengthen it</p>
        <p className="text-sm text-ink leading-relaxed">{feedback.howToStrengthen}</p>
      </div>
    </div>
  );
}
