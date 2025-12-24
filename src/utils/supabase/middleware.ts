import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    // 1. Protect Admin Routes (Unauth -> Login)
    if (request.nextUrl.pathname.startsWith('/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/login'
      url.searchParams.set('message', 'Please log in to access Admin Panel')
      return NextResponse.redirect(url)
    }
  }

  if (user) {
    // Fetch Profile Role from DB (Safety Check)
    // Note: Ideally we use custom claims, but DB check is safer for critical changes
    // However, in middleware, DB calls can be expensive. 
    // We will trust metadata first for speed, or do a quick rpc/select if feasible.
    // For now, let's query the profile aggressively to ensure security.

    // We can't easily use 'supabase' client here for DB query mixed with Auth unless we are careful.
    // Let's rely on user metadata which we sync on login/creation.
    // If we need stricter update, we update metadata on profile change.

    // Actually, simpler: Let's query public.profiles using the client we have.
    // Note: Policies must allow this read. "Public profiles are viewable by everyone" covers it.

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    const role = profile?.role || 'resident'
    const isAdmin = role === 'admin'
    const isOnAdminPath = request.nextUrl.pathname.startsWith('/admin')

    // 2. Admin User Rules
    if (isAdmin) {
      // If Admin is NOT on admin path (e.g. visiting / or /activity), Redirect to Admin Dashboard
      // Exception: Maybe /profile settings? Requirements say "Admin must not share UI... Redirect only to /admin/dashboard"
      // So strict enforcement:
      if (!isOnAdminPath && !request.nextUrl.pathname.startsWith('/auth') && request.nextUrl.pathname !== '/admin/dashboard') {
        // Avoid loop if already there
        const url = request.nextUrl.clone()
        url.pathname = '/admin/dashboard'
        return NextResponse.redirect(url)
      }
    }

    // 3. Regular User Rules (Protect Admin Path & Redirect Root)
    if (!isAdmin) {
      if (isOnAdminPath) {
        const url = request.nextUrl.clone()
        url.pathname = '/' // Kick back to home -> which will redirect to /feed
        return NextResponse.redirect(url)
      }

      // Redirect logged-in users from Landing Page to Feed
      // User specifically requested this behavior: "even if its / path after login its should be feed"
      if (request.nextUrl.pathname === '/') {
        if (user.role === 'authenticated') {
          const url = request.nextUrl.clone()
          url.pathname = '/feed'
          return NextResponse.redirect(url)
        }
      }
    }
  }

  // 4. Protect Private Routes (Guest -> Landing Page)
  // If user is NOT logged in, and tries to visit /feed, redirect to /
  if (!user && request.nextUrl.pathname.startsWith('/feed')) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
