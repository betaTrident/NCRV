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
