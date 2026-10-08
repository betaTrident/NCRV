import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function AuthGroupLayout({
  children,
}: {
  children: ReactNode
}) {
  const supabase = await createClient()
  const { data } = await supabase.auth.getClaims()

  if (data?.claims) {
    redirect("/")
  }

  return children
}
