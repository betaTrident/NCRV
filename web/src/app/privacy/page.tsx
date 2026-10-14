import type { Metadata } from "next"
import { PageHeader } from "@/components/shell/page-header"
import { Panel } from "@/components/shell/panel"
import { PrivacyDocument } from "@/components/legal/privacy-document"

export const metadata: Metadata = { title: "Privacy Notice", description: "What this instance stores about you, who can see it, and how to ask for a copy or deletion." }

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ returnTo?: string | string[] }> }) {
  const params = await searchParams
  const returnTo = params.returnTo === "/signup" ? "/signup" : "/login"
  return <main className="min-h-dvh bg-[var(--vx-paper)] px-[var(--vx-pad-mobile)] py-10 sm:px-[var(--vx-pad-tablet)] sm:py-14"><div className="mx-auto flex w-full max-w-prose flex-col gap-8"><PageHeader eyebrow="PRIVACY" title="Privacy Notice" description="What this instance stores about you, who can see it, and how to ask for a copy or deletion." /><Panel className="px-5 py-6 sm:px-8 sm:py-8"><PrivacyDocument /></Panel><nav aria-label="Related pages" className="flex flex-col gap-3 text-sm text-[var(--vx-muted)]"><p>See also the <a href="/terms" className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline">Terms of Use</a>.</p><p><a href={returnTo} className="font-medium text-[var(--vx-brand)] underline-offset-2 hover:underline">Back to {returnTo === "/signup" ? "create profile" : "sign in"}</a></p></nav></div></main>
}
