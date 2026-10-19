"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
import { Tooltip } from "@/components/ui/tooltip"
import styles from "./app-shell.module.css"

type NavLinkProps = {
  href: string
  label: string
  icon: React.ReactNode
  exact?: boolean
  /** `rail` is the desktop/tablet side rail. `bottom` is the mobile bar. */
  variant?: "rail" | "bottom"
  /** The mobile "Add shift" shortcut gets an emphasized treatment. */
  prominent?: boolean
}

/**
 * Active state: tinted field, 2 px left indicator, explicit label. On the
 * collapsed icon rail the label is visually hidden but still read by
 * assistive technology.
 */
function NavLink({
  href,
  label,
  icon,
  exact = false,
  variant = "rail",
  prominent = false,
}: NavLinkProps) {
  const pathname = usePathname()
  const isActive = exact ? pathname === href : pathname.startsWith(href)

  if (variant === "bottom") {
    return (
      <Link
        href={href}
        aria-label={prominent ? "Add shift" : undefined}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[11px] font-medium text-[var(--vx-ink-soft)] transition-colors",
          isActive && "text-[var(--vx-brand)]",
          prominent &&
            "relative -mt-6 text-[var(--vx-on-deep)]"
        )}
      >
        <span
          aria-hidden="true"
          className={cn(
            "flex items-center justify-center",
            prominent
              ? "size-11 rounded-full bg-[var(--vx-brand)] text-[var(--vx-on-deep)] shadow-sm"
              : "size-5"
          )}
        >
          {icon}
        </span>
        <span className={cn(prominent && "text-[var(--vx-ink-soft)]")}>
          {label}
        </span>
      </Link>
    )
  }

  return (
    <Tooltip title={label}><Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--vx-ink-soft)] transition-colors hover:bg-[var(--vx-surface-soft)] hover:text-[var(--vx-brand)]",
        isActive &&
          "bg-[var(--vx-brand-tint)] text-[var(--vx-brand)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[var(--vx-brand)] transition-opacity",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className={cn(styles.navLabel, "truncate")}>{label}</span>
    </Link></Tooltip>
  )
}

export { NavLink }
export type { NavLinkProps }
