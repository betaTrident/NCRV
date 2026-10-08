import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured.")
  }
  return { url, publishableKey }
}

async function createClient() {
  const { url, publishableKey } = getPublicSupabaseConfig()
  const cookieStore = await cookies()

  return createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        } catch {
          // Called from a Server Component. The proxy writes refreshed cookies.
        }
      },
    },
  })
}

export { createClient }
