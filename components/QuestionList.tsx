import { Question } from '@/lib/types';
import { QuestionCard } from './QuestionCard';
import { LoadingState } from './LoadingState';

interface QuestionListProps {
  questions: Question[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  loading: boolean;
  onChangeJD: () => void;
}

export function QuestionList({
  questions,
  selectedId,
  onSelect,
  loading,
  onChangeJD,
}: QuestionListProps) {
  if (loading) {
    return (
      <div className="p-4">
        <LoadingState message="Generating questions…" />
      </div>
    );
  }

  const craft = questions.filter((q) => q.type === 'craft');
  const behavioral = questions.filter((q) => q.type === 'behavioral');

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-5 pb-3 flex items-center justify-between border-b border-border">
        <span className="text-xs font-semibold text-muted uppercase tracking-wider">
          Questions
        </span>
        <button
          onClick={onChangeJD}
          className="text-xs text-subtle hover:text-muted transition-colors underline underline-offset-2"
        >
          Change JD
        </button>
      </div>

      {/* Question groups */}
      <div className="flex-1 overflow-y-auto px-2 py-3 flex flex-col gap-4">
        {craft.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1">
              Craft
            </p>
            {craft.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                isSelected={selectedId === q.id}
                onClick={() => onSelect(q.id)}
                index={i}
              />
            ))}
          </div>
        )}

        {behavioral.length > 0 && (
          <div className="flex flex-col gap-1">
            <p className="px-2 text-[10px] font-semibold uppercase tracking-wider text-subtle mb-1">
              Behavioral
            </p>
            {behavioral.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                isSelected={selectedId === q.id}
                onClick={() => onSelect(q.id)}
                index={craft.length + i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
