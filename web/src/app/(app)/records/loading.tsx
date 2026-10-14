function RecordsLoading() {
  return (
    <div role="status" aria-label="Loading records" className="flex flex-col gap-8">
      <div className="h-20 max-w-xl rounded-[var(--vx-radius-panel)] bg-[var(--vx-line)]" />
      <div className="h-11 max-w-2xl rounded-[var(--vx-radius-control)] bg-[var(--vx-line)]" />
      <div className="h-72 rounded-[var(--vx-radius-panel)] bg-[var(--vx-line)]" />
      <span className="vx-sr-only">Loading records…</span>
    </div>
  )
}

export default RecordsLoading
