function RecordDetailLoading() {
  return (
    <div role="status" aria-label="Loading record" className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
      <div className="flex flex-col gap-6">
        <div className="h-52 rounded-[var(--vx-radius-panel)] bg-[var(--vx-line)]" />
        <div className="h-48 rounded-[var(--vx-radius-panel)] bg-[var(--vx-line)]" />
      </div>
      <div className="h-96 rounded-[var(--vx-radius-panel)] bg-[var(--vx-line)]" />
      <span className="vx-sr-only">Loading record…</span>
    </div>
  )
}

export default RecordDetailLoading
