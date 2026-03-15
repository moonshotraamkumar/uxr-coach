'use client';

import { RubricItem } from '@/lib/types';

interface RubricPanelProps {
  rubric: RubricItem[];
}

export function RubricPanel({ rubric }: RubricPanelProps) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
        What good looks like
      </p>
      {rubric.map((item, i) => (
        <div key={i} className="bg-surface rounded-xl border border-border px-5 py-4 flex flex-col gap-2">
          <p className="text-[10px] font-bold text-sage uppercase tracking-widest">
            {item.competency}
          </p>
          <p className="text-base text-ink leading-relaxed">{item.whatGoodLooksLike}</p>
          <div className="pl-3 border-l-2 border-sage-light mt-1">
            <p className="text-sm text-muted italic leading-relaxed">
              &ldquo;{item.seniorExample}&rdquo;
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
