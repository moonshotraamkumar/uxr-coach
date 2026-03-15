interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = 'Loading…' }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 py-16">
      <div className="flex gap-1.5">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-sage"
            style={{
              animation: 'pulseSoft 2.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${i * 300}ms`,
            }}
          />
        ))}
      </div>
      <p className="text-sm text-muted">{message}</p>
    </div>
  );
}
