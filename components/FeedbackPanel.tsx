import { FeedbackResponse } from '@/lib/types';

interface FeedbackPanelProps {
  feedback: FeedbackResponse;
}

function BulletList({ items, dotColor }: { items: string[]; dotColor: string }) {
  return (
    <ul className="flex flex-col gap-2 mt-2">
      {items.map((item, i) => (
        <li key={i} className="flex gap-3 items-start">
          <span className={`mt-[9px] w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
          <span className="text-xl text-ink leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function FeedbackPanel({ feedback }: FeedbackPanelProps) {
  return (
    <div
      className="flex flex-col gap-4"
      style={{ animation: 'fadeIn 0.4s ease-out forwards' }}
    >
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Feedback</p>

      {/* What landed well — green */}
      <div className="rounded-xl bg-green-light border border-green/20 px-5 py-4">
        <p className="text-xs font-semibold text-green uppercase tracking-wider">What landed well</p>
        <BulletList items={feedback.whatLandedWell} dotColor="bg-green" />
      </div>

      {/* What's missing — rose */}
      <div className="rounded-xl bg-amber-light border border-amber/20 px-5 py-4">
        <p className="text-xs font-semibold text-amber uppercase tracking-wider">What&apos;s missing</p>
        <BulletList items={feedback.whatIsMissing} dotColor="bg-amber" />
      </div>

      {/* How to strengthen — gold */}
      <div className="rounded-xl bg-gold-light border border-gold/20 px-5 py-4">
        <p className="text-xs font-semibold text-gold uppercase tracking-wider">How to strengthen it</p>
        <BulletList items={feedback.howToStrengthen} dotColor="bg-gold" />
      </div>
    </div>
  );
}
