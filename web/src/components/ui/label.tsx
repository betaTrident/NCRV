import type { ComponentProps } from "react"
import { cn } from "cn"
export function Label({className, ...props}: ComponentProps<"label">) { return <label {...props} className={cn("flex items-center gap-2 text-sm font-medium", className)} /> }
