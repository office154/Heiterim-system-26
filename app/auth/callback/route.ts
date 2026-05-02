import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const tokenHash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            try { cookieStore.set(name, value, options) } catch { /* ignore */ }
          })
        },
      },
    }
  )

  // PKCE code flow (password reset from browser client)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      const response = NextResponse.redirect(`${origin}/auth/set-password`)
      // Copy auth cookies to the response
      const updatedCookies = cookieStore.getAll()
      updatedCookies.forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      return response
    }
    return NextResponse.redirect(`${origin}/login?error=exchange_failed`)
  }

  // Token hash flow (OTP-based)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: type as 'recovery' | 'invite' | 'email',
    })
    if (!error) {
      const response = NextResponse.redirect(`${origin}/auth/set-password`)
      const updatedCookies = cookieStore.getAll()
      updatedCookies.forEach(({ name, value }) => {
        response.cookies.set(name, value)
      })
      return response
    }
    return NextResponse.redirect(`${origin}/login?error=verify_failed`)
  }

  // No query params: implicit/hash flow (invite emails from admin client)
  // Hash fragments are not sent to the server, so redirect to a client page that can read them
  return new Response(
    `<!DOCTYPE html><html><head><meta charset="utf-8"><script>window.location.replace('/auth/confirm' + window.location.hash + window.location.search)</script></head><body></body></html>`,
    { headers: { 'Content-Type': 'text/html' } }
  )
}
