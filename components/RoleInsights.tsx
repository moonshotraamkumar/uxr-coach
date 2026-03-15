interface RoleInsightsProps {
  insights: string[];
}

export function RoleInsights({ insights }: RoleInsightsProps) {
  if (!insights.length) return null;

  return (
    <div className="flex flex-col gap-3" style={{ animation: 'fadeIn 0.4s ease-out forwards' }}>
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">
        What will make you stand out
      </p>
      <div className="rounded-xl bg-surface border border-border px-5 py-4 flex flex-col gap-3">
        {insights.map((insight, i) => (
          <div key={i} className="flex gap-3">
            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sage shrink-0" />
            <p className="text-sm text-ink leading-relaxed">{insight}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
