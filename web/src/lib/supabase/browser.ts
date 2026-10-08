import { createBrowserClient } from "@supabase/ssr"

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured.")
  }
  return { url, publishableKey }
}

function createClient() {
  const { url, publishableKey } = getPublicSupabaseConfig()
  return createBrowserClient(url, publishableKey)
}

export { createClient }
