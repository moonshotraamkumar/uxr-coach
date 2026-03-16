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
        'w-full text-left px-4 py-3 rounded-xl transition-all duration-200 flex flex-col gap-1',
        'opacity-0',
        visible && 'opacity-100',
        isSelected
          ? 'bg-white border border-border shadow-sm'
          : 'hover:bg-white/70 border border-transparent',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ animation: visible ? 'slideUp 0.3s ease-out forwards' : 'none' }}
    >
      {/* Question text */}
      <p className={`text-base leading-snug line-clamp-3 ${isSelected ? 'text-ink font-medium' : 'text-muted'}`}>
        {question.text}
      </p>

      {/* Source badge — only if from web */}
      {question.source === 'web' && (
        <span className="text-[10px] font-medium text-subtle mt-0.5">
          From web
        </span>
      )}
    </button>
  );
}
