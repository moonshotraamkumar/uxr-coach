interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl bg-amber-light border border-amber/20 px-5 py-4 flex flex-col gap-2">
      <p className="text-sm text-amber font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="text-sm text-muted underline underline-offset-2 hover:text-ink transition-colors self-start"
        >
          Try again
        </button>
      )}
    </div>
  );
}
