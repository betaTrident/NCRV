"use client"

import { Button as AntButton } from "antd"
import Link from "next/link"
import type { ComponentProps, ReactNode } from "react"
import { cn } from "cn"

type Appearance = { variant?: "primary" | "outline" | "quiet"; size?: "default" | "icon" }
const appearance = (variant: Appearance["variant"] = "primary", size: Appearance["size"] = "default") => cn("vx-button", `vx-button-${variant}`, size === "icon" && "vx-button-icon")

type ButtonProps = Omit<ComponentProps<typeof AntButton>, "type" | "htmlType" | "variant" | "size"> & Appearance & {
  type?: ComponentProps<"button">["type"]
}

export function Button({ variant = "primary", size = "default", className, type = "button", loading, disabled, ...props }: ButtonProps) {
  return <AntButton {...props} disabled={disabled || Boolean(loading)} loading={loading} htmlType={type} styles={{ root: { maxWidth: "100%", height: "auto", minHeight: 44 }, content: { whiteSpace: "normal" } }} type={variant === "primary" ? "primary" : variant === "quiet" ? "text" : "default"} className={cn(appearance(variant, size), className)} />
}

export function ButtonLink({ variant = "primary", size = "default", className, ...props }: ComponentProps<typeof Link> & Appearance) {
  return <Link {...props} className={cn(appearance(variant, size), className)} />
}

type IconButtonProps = Omit<ButtonProps, "size" | "children"> & {
  "aria-label": string
  children: ReactNode
}

export function IconButton({ children, ...props }: IconButtonProps) {
  return <Button {...props} size="icon">{children}</Button>
}
