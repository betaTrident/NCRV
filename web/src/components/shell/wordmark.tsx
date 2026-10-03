import { cn } from "cn"

type WordmarkProps = {
  className?: string
}

/**
 * `voyix` in off-white, `shift` in the light brand lavender. Intended for
 * placement on the deep-purple navigation and auth surfaces.
 */
function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-sans text-xl font-extrabold lowercase tracking-tight",
        className
      )}
    >
      <span className="text-[var(--vx-on-deep)]">voyix</span>
      <span className="text-[var(--vx-brand-light)]">shift</span>
    </span>
  )
}

export { Wordmark }
