'use client';

import { useEffect, useState } from 'react';
import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  isSelected: boolean;
  onClick: () => void;
  index: number;
}

export function QuestionCard({ question, isSelected, onClick, index }: QuestionCardProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <button
      onClick={onClick}
      className={[
        'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex flex-col gap-1.5',
        'opacity-0',
        visible && 'opacity-100',
        isSelected
          ? 'bg-surface border-l-2 border-sage'
          : 'hover:bg-surface/60 border-l-2 border-transparent',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ animation: visible ? 'slideUp 0.3s ease-out forwards' : 'none' }}
    >
      {/* Badges */}
      <div className="flex gap-1.5 flex-wrap">
        <span
          className={`text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full ${
            question.type === 'craft'
              ? 'bg-sage-light text-sage'
              : 'bg-amber-light text-amber'
          }`}
        >
          {question.type}
        </span>
        {question.source === 'web' && (
          <span className="text-[10px] font-medium uppercase tracking-wide px-2 py-0.5 rounded-full bg-surface text-subtle border border-border">
            From web
          </span>
        )}
      </div>

      {/* Question text */}
      <p className="text-sm text-ink leading-snug line-clamp-2">{question.text}</p>
    </button>
  );
}
