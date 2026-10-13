# Shared layouts

## `src/app/layout.tsx`

Root document layout: loads Manrope and IBM Plex Mono, globals, and document metadata.

```tsx
import type { Metadata } from "next";
import { Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "Voyix Workspace",
  description: "A private night-differential shiftbook.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${ibmPlexMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

```

## `src/app/(app)/layout.tsx`

Authenticated route-group guard and application shell wrapper.

```tsx
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { AppShell } from "@/components/shell/app-shell"
import { getRequestClaims } from "@/lib/supabase/server"

export default async function AppGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data } = await getRequestClaims()

  if (!data?.claims) {
    redirect("/login")
  }

  return <AppShell>{children}</AppShell>
}

```

## `src/app/(auth)/layout.tsx`

Auth route-group guard that redirects signed-in users to overview.

```tsx
import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { getRequestClaims } from "@/lib/supabase/server"

export default async function AuthGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const { data } = await getRequestClaims()

  if (data?.claims) {
    redirect("/")
  }

  return children
}

```

## `src/components/shell/app-shell.tsx`

Persistent desktop rail, sticky top bar, mobile bottom navigation, skip link, and main landmark.

```tsx
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
            <Link href="/" aria-label="Voyix Workspace, go to overview">
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

```

## `src/components/shell/app-shell.module.css`

Responsive shell geometry: 244px rail, narrower tablet/icon rails, 54px mobile header, and 63px bottom navigation.

```css
.shell {
  display: flex;
  min-height: 100dvh;
  background: var(--vx-paper);
}

.rail {
  width: var(--vx-rail);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
  background: var(--vx-brand-deep);
  padding: 24px 16px;
  position: sticky;
  top: 0;
  height: 100dvh;
}

.railHeader {
  padding: 0 8px;
}

.railWordmark {
  white-space: nowrap;
  letter-spacing: -0.045em;
}

.railNav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.rail :focus-visible {
  outline-color: var(--vx-brand-light);
}

.main {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.topbar {
  height: var(--vx-topbar);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding: 0 var(--vx-pad-desktop);
  border-bottom: 1px solid var(--vx-line);
  position: sticky;
  top: 0;
  background: var(--vx-surface);
  z-index: 10;
}

.content {
  flex: 1;
  width: 100%;
  max-width: var(--vx-content);
  margin: 0 auto;
  padding: var(--vx-pad-desktop);
}

.bottomNav {
  display: none;
}

/* 900-1119px: narrower rail, tighter page gutters */
@media (max-width: 1119px) {
  .rail {
    width: var(--vx-rail-tablet);
  }

  .topbar {
    padding: 0 var(--vx-pad-tablet);
  }

  .content {
    padding: var(--vx-pad-tablet);
  }
}

/* 640-899px: icon-only rail, labels stay for assistive tech only */
@media (max-width: 899px) {
  .rail {
    width: var(--vx-rail-icon);
    padding: 24px 8px;
    align-items: center;
  }

  .railHeader {
    padding: 0;
  }

  .railWordmark {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  .railNav {
    width: 100%;
    align-items: center;
  }

  .navLabel {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
}

/* < 640px: no side rail, compact header, bottom nav */
@media (max-width: 639px) {
  .rail {
    display: none;
  }

  .topbar {
    height: var(--vx-header-mobile);
    padding: 0 var(--vx-pad-mobile);
  }

  .content {
    padding: var(--vx-pad-mobile);
    padding-bottom: calc(
      var(--vx-bottom-nav) + env(safe-area-inset-bottom) + var(--vx-pad-mobile)
    );
  }

  .bottomNav {
    display: flex;
    align-items: center;
    justify-content: space-around;
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    height: calc(var(--vx-bottom-nav) + env(safe-area-inset-bottom));
    padding: 0 8px env(safe-area-inset-bottom);
    background: var(--vx-surface);
    border-top: 1px solid var(--vx-line);
    z-index: 20;
  }
}

/* < 370px: tightest gutters, banners stack (handled by page content) */
@media (max-width: 369px) {
  .topbar {
    padding: 0 var(--vx-pad-xs);
  }

  .content {
    padding: var(--vx-pad-xs);
    padding-bottom: calc(
      var(--vx-bottom-nav) + env(safe-area-inset-bottom) + var(--vx-pad-xs)
    );
  }
}

```

## `src/components/shell/auth-split.tsx`

Shared deep-purple authentication story panel and centered form column.

```tsx
import * as React from "react"
import { Wordmark } from "@/components/shell/wordmark"

type AuthSplitProps = {
  title: string
  description: string
  children: React.ReactNode
}

/**
 * Deep-purple story column, form column, stacked on small screens. The
 * story column carries the brand voice; `children` is the form column and
 * owns the page's single `h1`.
 */
function AuthSplit({ title, description, children }: AuthSplitProps) {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <div className="flex flex-col justify-between gap-10 bg-[var(--vx-brand-deep)] px-6 py-10 sm:px-10 lg:w-[42%] lg:px-14 lg:py-16">
        <Wordmark />
        <div className="flex max-w-sm flex-col gap-3">
          <p className="text-xl font-semibold text-[var(--vx-on-deep)] sm:text-2xl">
            {title}
          </p>
          <p className="text-sm text-[var(--vx-brand-light)]">{description}</p>
        </div>
        <p className="text-xs text-[var(--vx-brand-light)]/80">
          A private record, not a payroll system.
        </p>
      </div>
      <div className="flex flex-1 items-center justify-center px-6 py-10 sm:px-10 lg:px-16">
        <div className="w-full max-w-sm">{children}</div>
      </div>
    </div>
  )
}

export { AuthSplit }
export type { AuthSplitProps }

```

## `src/components/shell/wordmark.tsx`

Lowercase two-tone brand wordmark for deep-purple surfaces.

```tsx
import { cn } from "cn"

type WordmarkProps = {
  className?: string
}

/**
 * `voyix` in off-white, `workspace` in the light brand lavender. Intended for
 * placement on the deep-purple navigation and auth surfaces.
 */
function Wordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-sans text-xl font-extrabold lowercase tracking-tight",
        className
      )}
    >
      <span className="text-[var(--vx-on-deep)]">voyix</span>
      <span className="text-[var(--vx-brand-light)]">workspace</span>
    </span>
  )
}

export { Wordmark }

```

## `src/components/shell/nav-link.tsx`

Client navigation item with exact/prefix active state for rail and bottom navigation.

```tsx
"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "cn"
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
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 rounded-lg py-1.5 text-[10px] font-medium text-[var(--vx-ink-soft)] transition-colors",
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
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--vx-brand-light)] transition-colors hover:bg-[color-mix(in_srgb,var(--vx-on-deep)_10%,transparent)] hover:text-[var(--vx-on-deep)]",
        isActive &&
          "bg-[color-mix(in_srgb,var(--vx-on-deep)_10%,transparent)] text-[var(--vx-on-deep)]"
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-[var(--vx-brand-light)] transition-opacity",
          isActive ? "opacity-100" : "opacity-0"
        )}
      />
      <span aria-hidden="true" className="flex size-5 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className={cn(styles.navLabel, "truncate")}>{label}</span>
    </Link>
  )
}

export { NavLink }
export type { NavLinkProps }

```

## `src/components/shell/privacy-indicator.tsx`

Persistent saved-privately status in the application top bar.

```tsx
type PrivacyIndicatorProps = {
  className?: string
}

/**
 * Success dot plus the words "Saved privately". Status is never color alone,
 * so the text stays visible next to the dot.
 */
function PrivacyIndicator({ className }: PrivacyIndicatorProps) {
  return (
    <span
      className={`inline-flex items-center gap-2 text-xs font-medium text-[var(--vx-ink-soft)] ${className ?? ""}`}
    >
      <span
        aria-hidden="true"
        className="size-2 rounded-full bg-[var(--vx-success)]"
      />
      Saved privately
    </span>
  )
}

export { PrivacyIndicator }

```

