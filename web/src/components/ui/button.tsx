"use client"

import { Button as AntButton } from "antd"
import Link from "next/link"
import type { ComponentProps } from "react"
import { cn } from "cn"

type Appearance = { variant?: "primary" | "outline" | "quiet"; size?: "default" | "icon" }
const appearance = (variant: Appearance["variant"] = "primary", size: Appearance["size"] = "default") => cn("vx-button", `vx-button-${variant}`, size === "icon" && "vx-button-icon")

export function Button({ variant = "primary", size = "default", className, type = "button", ref, ...props }: Omit<ComponentProps<"button">, "color"> & Appearance) {
  return <AntButton {...props} ref={ref as never} htmlType={type} styles={{ root: { maxWidth: "100%", height: "auto", minHeight: 44 }, content: { whiteSpace: "normal" } }} type={variant === "primary" ? "primary" : variant === "quiet" ? "text" : "default"} className={cn(appearance(variant, size), className)} />
}

export function ButtonLink({ variant = "primary", size = "default", className, ...props }: ComponentProps<typeof Link> & Appearance) {
  return <Link {...props} className={cn(appearance(variant, size), className)} />
}
