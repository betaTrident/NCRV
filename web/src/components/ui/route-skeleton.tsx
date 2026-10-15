type RouteSkeletonProps = { lines?: number; className?: string; label?: string }

export function RouteSkeleton({ lines = 3, className, label = "Loading page content" }: RouteSkeletonProps) {
  return <section aria-busy="true" aria-label={label} className={`rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-surface)] p-6 ${className ?? ""}`}>
    <div className="h-3 w-24 rounded bg-[var(--vx-surface-inset)]" />
    <div className="mt-4 h-8 max-w-sm rounded bg-[var(--vx-surface-inset)]" />
    <div className="mt-6 grid gap-3">{Array.from({ length: lines }, (_, index) => <div key={index} className="h-11 rounded-[var(--vx-radius-control)] bg-[var(--vx-surface-inset)]" />)}</div>
  </section>
}
