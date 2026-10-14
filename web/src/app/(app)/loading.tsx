export default function Loading() {
  return (
    <div role="status" className="flex flex-col gap-6 py-6" aria-live="polite">
      <p className="font-mono text-xs uppercase tracking-widest text-[var(--vx-muted)]">Opening your shiftbook</p>
      <p className="text-sm text-[var(--vx-ink-soft)]">Loading your private records…</p>
      <div aria-hidden="true" className="h-px w-full bg-[var(--vx-line)]" />
    </div>
  )
}
