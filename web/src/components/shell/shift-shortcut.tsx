"use client"

import { usePathname } from "next/navigation"
import { ButtonLink } from "@/components/ui/button"

export function ShiftShortcut() {
  const pathname = usePathname()
  return pathname === "/shift/new"
    ? <span className="font-mono text-xs text-[var(--vx-muted)]">Your private shiftbook</span>
    : <ButtonLink href="/shift/new">Add shift</ButtonLink>
}
