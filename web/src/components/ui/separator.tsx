import type { ComponentProps } from "react"
import { cn } from "cn"
export function Separator({className, orientation = "horizontal", decorative = true, ...props}: ComponentProps<"div"> & {orientation?: "horizontal" | "vertical"; decorative?: boolean}) { return <div {...props} role={decorative ? "none" : "separator"} aria-orientation={decorative ? undefined : orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-px w-full" : "w-px self-stretch", className)} /> }
