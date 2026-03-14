'use client';

import { useState } from 'react';
import { RubricItem } from '@/lib/types';

interface RubricPanelProps {
  rubric: RubricItem[];
}

// Pass key={question.id} from the parent to reset open state on question change
export function RubricPanel({ rubric }: RubricPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-border overflow-hidden">
      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-surface hover:bg-border/40 transition-colors text-left"
      >
        <span className="text-sm font-medium text-muted">View rubric</span>
        <svg
          className={`w-4 h-4 text-subtle transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Accordion content */}
      <div
        className="accordion-content"
        style={{ maxHeight: open ? '800px' : '0px', opacity: open ? 1 : 0 }}
      >
        <div className="px-5 py-4 flex flex-col gap-5 border-t border-border">
          {rubric.map((item, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <p className="text-xs font-semibold text-sage uppercase tracking-wider">
                {item.competency}
              </p>
              <p className="text-sm text-ink leading-relaxed">{item.whatGoodLooksLike}</p>
              <div className="pl-3 border-l-2 border-sage-light mt-1">
                <p className="text-xs text-muted italic leading-relaxed">
                  &ldquo;{item.seniorExample}&rdquo;
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
