import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

function getPublicSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured.")
  }
  return { url, publishableKey }
}

/**
 * Exchanges the PKCE `code` from a Supabase auth email link (password
 * reset) for a session, then redirects to `next`. Supabase's hosted auth
 * server verifies the original token and appends `code` itself; this
 * route only completes the handoff so the destination page has a session
 * before it renders its form.
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const next = requestUrl.searchParams.get("next") ?? "/"
  const expiredUrl = new URL("/reset-password", requestUrl.origin)
  expiredUrl.searchParams.set("error", "expired")

  if (!code) {
    return NextResponse.redirect(expiredUrl)
  }

  const { url, publishableKey } = getPublicSupabaseConfig()
  const response = NextResponse.redirect(new URL(next, requestUrl.origin))

  const supabase = createServerClient(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options)
        })
      },
    },
  })

  const { error } = await supabase.auth.exchangeCodeForSession(code)
  if (error) {
    return NextResponse.redirect(expiredUrl)
  }

  return response
}
