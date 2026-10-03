import * as React from "react"
import { cn } from "cn"

/**
 * Surface, 1 px line, 14 px radius, modest shadow. A page is a stack of
 * panels on the paper canvas — panels never nest inside panels.
 */
function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="panel"
      className={cn(
        "rounded-[var(--vx-radius-panel)] border border-[var(--vx-line)] bg-[var(--vx-surface)] shadow-sm",
        className
      )}
      {...props}
    />
  )
}

export { Panel }
