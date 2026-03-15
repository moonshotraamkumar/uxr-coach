interface RoleInsightsProps {
  insights: string[];
  title?: string;
  location?: string | null;
}

export function RoleInsights({ insights, title, location }: RoleInsightsProps) {
  if (!insights.length) return null;

  return (
    <div className="flex flex-col gap-5" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
      {/* Role header */}
      {title && (
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold text-ink">{title}</p>
          {location && (
            <p className="text-sm font-medium text-muted">{location}</p>
          )}
        </div>
      )}

      {/* Stand-out insights */}
      <div className="flex flex-col gap-3">
        <p className="text-[10px] font-bold text-muted uppercase tracking-widest">
          What will make you stand out
        </p>
        <div className="rounded-xl bg-surface border border-border px-5 py-4 flex flex-col gap-3">
          {insights.map((insight, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-[7px] w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
              <p className="text-base text-ink leading-relaxed">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
