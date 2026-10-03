type PrivacyIndicatorProps = {
  className?: string
}

/**
 * Success dot plus the words "Saved privately". Status is never color alone,
 * so the text stays visible next to the dot.
 */
function PrivacyIndicator({ className }: PrivacyIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium text-[var(--vx-ink-soft)] ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full bg-[var(--vx-success)]"
      />
      Saved privately
    </span>
  )
}

export { PrivacyIndicator }
