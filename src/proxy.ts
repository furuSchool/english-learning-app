import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 許可するメールアドレス一覧（環境変数で設定可能）
function getAllowedEmails(): string[] {
  const envEmails = process.env.ALLOWED_EMAILS
  if (envEmails) return envEmails.split(',').map(e => e.trim().toLowerCase())
  return []
}

export async function proxy(request: NextRequest) {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const { pathname } = request.nextUrl

  const publicPaths = ['/', '/auth/callback', '/dev']
  const isPublicPath = publicPaths.some(p => pathname === p)

  if (!user && !isPublicPath) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  // 許可リストが設定されている場合、メールアドレスを確認
  const allowedEmails = getAllowedEmails()
  if (user && allowedEmails.length > 0) {
    const userEmail = user.email?.toLowerCase() ?? ''
    if (!allowedEmails.includes(userEmail)) {
      await supabase.auth.signOut()
      const url = new URL('/', request.url)
      url.searchParams.set('error', 'unauthorized')
      return NextResponse.redirect(url)
    }
  }

  if (user && pathname === '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
}
