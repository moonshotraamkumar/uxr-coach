'use client';

import { RubricItem } from '@/lib/types';

interface RubricPanelProps {
  rubric: RubricItem[];
}

export function RubricPanel({ rubric }: RubricPanelProps) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className="px-5 py-3 bg-surface border-b border-border">
        <span className="text-sm font-semibold text-muted uppercase tracking-wider">Rubric</span>
      </div>
      <div className="px-5 py-4 flex flex-col gap-5">
        {rubric.map((item, i) => (
          <div key={i} className="flex flex-col gap-1.5">
            <p className="text-xs font-semibold text-sage uppercase tracking-wider">
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
    </div>
  );
}
