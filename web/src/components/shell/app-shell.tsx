import * as React from "react"
import Link from "next/link"
import { CalendarDays, Home, Plus, Receipt, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { NavLink } from "@/components/shell/nav-link"
import { PrivacyIndicator } from "@/components/shell/privacy-indicator"
import { Wordmark } from "@/components/shell/wordmark"
import styles from "./app-shell.module.css"

const PRIMARY_NAV = [
  { href: "/", label: "Overview", icon: <Home size={18} aria-hidden="true" />, exact: true },
  { href: "/records", label: "My records", icon: <Receipt size={18} aria-hidden="true" /> },
  { href: "/calendar", label: "Calendar", icon: <CalendarDays size={18} aria-hidden="true" /> },
  { href: "/settings", label: "Settings", icon: <Settings size={18} aria-hidden="true" /> },
] as const

const BOTTOM_NAV = [
  { href: "/", label: "Overview", icon: <Home size={18} aria-hidden="true" />, exact: true },
  { href: "/records", label: "Records", icon: <Receipt size={18} aria-hidden="true" /> },
  { href: "/shift/new", label: "Shift", icon: <Plus size={20} aria-hidden="true" />, prominent: true },
  { href: "/calendar", label: "Calendar", icon: <CalendarDays size={18} aria-hidden="true" /> },
  { href: "/settings", label: "Settings", icon: <Settings size={18} aria-hidden="true" /> },
] as const

type AppShellProps = {
  children: React.ReactNode
}

/**
 * Rail or bottom nav, top bar, skip link, and the single `<main>` landmark
 * for every `(app)` page.
 */
function AppShell({ children }: AppShellProps) {
  return (
    <>
      <a href="#content" className="vx-sr-only vx-skip-link">
        Skip to content
      </a>
      <div className={styles.shell}>
        <nav aria-label="Primary" className={styles.rail}>
          <div className={styles.railHeader}>
            <Link href="/" aria-label="Voyix Shift, go to overview">
              <Wordmark className={styles.railWordmark} />
            </Link>
          </div>
          <div className={styles.railNav}>
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                exact={"exact" in item ? item.exact : false}
              />
            ))}
          </div>
        </nav>
        <div className={styles.main}>
          <header className={styles.topbar}>
            <PrivacyIndicator />
            <Button asChild>
              <Link href="/shift/new">Add shift</Link>
            </Button>
          </header>
          <main id="content" tabIndex={-1} className={styles.content}>
            {children}
          </main>
          <nav aria-label="Primary" className={styles.bottomNav}>
            {BOTTOM_NAV.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                label={item.label}
                icon={item.icon}
                exact={"exact" in item ? item.exact : false}
                variant="bottom"
                prominent={"prominent" in item ? item.prominent : false}
              />
            ))}
          </nav>
        </div>
      </div>
    </>
  )
}

export { AppShell }
