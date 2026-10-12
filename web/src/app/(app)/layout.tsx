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
