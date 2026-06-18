// Mandatory global states: loading skeleton, empty, error, and Render cold-start "waking up".

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" width="18" height="18">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function SkeletonBar({ className = "" }: { className?: string }) {
  return (
    <div className={`relative overflow-hidden rounded bg-ot-panel ${className}`}>
      <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/5 to-transparent" />
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 p-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <SkeletonBar key={i} className="h-20" />)}
      </div>
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <SkeletonBar className="h-[60vh]" />
        <SkeletonBar className="h-[60vh]" />
      </div>
    </div>
  );
}

export function WakingState({ attemptHint }: { attemptHint?: string }) {
  return (
    <CenterCard>
      <div className="flex items-center gap-3 text-ot-accent">
        <span className="h-3 w-3 animate-pulseSoft rounded-full bg-ot-accent" />
        <h2 className="text-lg font-semibold">Waking the backend…</h2>
      </div>
      <p className="mt-2 max-w-md text-sm text-ot-muted">
        The API is hosted on a free tier that sleeps when idle. It typically takes 30–60 seconds to
        spin up on the first request. Retrying automatically{attemptHint ? ` — ${attemptHint}` : ""}.
      </p>
    </CenterCard>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <CenterCard>
      <h2 className="text-lg font-semibold text-[#ef4444]">Can&apos;t reach the backend</h2>
      <p className="mt-2 max-w-md text-sm text-ot-muted">
        The dashboard talks only to our backend API. It didn&apos;t respond.
      </p>
      <code className="mt-3 block max-w-md break-words rounded bg-ot-bg px-2 py-1 text-xs text-ot-dim">
        {message}
      </code>
      <button
        onClick={onRetry}
        className="mt-4 rounded-md border border-ot-line bg-ot-hover px-3 py-1.5 text-sm font-medium text-ot-text hover:bg-ot-line"
      >
        Retry
      </button>
    </CenterCard>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex h-full min-h-[240px] flex-col items-center justify-center rounded-lg border border-dashed border-ot-line bg-ot-surface/40 p-8 text-center">
      <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-ot-panel text-ot-dim">✓</div>
      <p className="text-sm font-medium text-ot-text">{title}</p>
      {hint && <p className="mt-1 text-xs text-ot-muted">{hint}</p>}
    </div>
  );
}

function CenterCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <div className="rounded-xl border border-ot-border bg-ot-surface p-6 shadow-panel">{children}</div>
    </div>
  );
}
