"use client"

import { Input as AntInput } from "antd"
import type { ComponentProps } from "react"
import { cn } from "cn"

export function Input({ className, ref, type, ...props }: Omit<ComponentProps<"input">, "size">) {
  // Native date/time controls retain browser editing and FormData semantics.
  if (type === "date" || type === "time") return <input {...props} ref={ref} type={type} className={cn("vx-input", className)} />
  return <AntInput {...props} type={type} ref={ref ? (instance) => { const node = instance?.input ?? null; if (typeof ref === "function") ref(node); else ref.current = node } : undefined} className={cn("vx-input", className)} />
}
