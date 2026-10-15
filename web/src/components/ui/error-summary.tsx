type ErrorItem = { id: string; message: string }
type ErrorSummaryProps = { errors: ErrorItem[]; title?: string }

export function ErrorSummary({ errors, title = "Check the highlighted fields" }: ErrorSummaryProps) {
  if (!errors.length) return null
  return <section role="alert" aria-labelledby="error-summary-title" className="rounded-[var(--vx-radius-control)] border border-[var(--vx-rose)] bg-[var(--vx-rose-bg)] p-4"><h2 id="error-summary-title" className="text-sm font-semibold text-[var(--vx-ink)]">{title}</h2><ul className="mt-2 list-disc pl-5 text-sm text-[var(--vx-ink)]">{errors.map((error) => <li key={error.id}><a className="underline underline-offset-2" href={`#${error.id}`}>{error.message}</a></li>)}</ul></section>
}
