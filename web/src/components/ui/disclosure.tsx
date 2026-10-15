"use client"

import { ChevronDown } from "lucide-react"
import { useId, useState, type ReactNode } from "react"

type DisclosureProps = { title: ReactNode; children: ReactNode; defaultOpen?: boolean }

export function Disclosure({ title, children, defaultOpen = false }: DisclosureProps) {
  const [open, setOpen] = useState(defaultOpen)
  const contentId = useId()
  return <section className="vx-disclosure">
    <button type="button" className="vx-disclosure-trigger" aria-expanded={open} aria-controls={contentId} onClick={() => setOpen((current) => !current)}>
      <span>{title}</span><ChevronDown aria-hidden="true" size={18} className={open ? "rotate-180" : undefined} />
    </button>
    {open ? <div id={contentId} className="vx-disclosure-content">{children}</div> : null}
  </section>
}
