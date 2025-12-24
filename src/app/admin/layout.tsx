import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { signout } from '@/app/(auth)/actions'
import { Button } from '@/components/ui/button'
import { AdminNavLinks } from '@/components/AdminNavLinks'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Double Check Role (Middleware handles redirect usually, but safety here too)
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center gap-2">
                <Link href="/admin/dashboard" className="text-xl font-bold tracking-tight text-green-600 hover:text-green-700 transition-colors">
                  ShareBite
                </Link>
              </div>
              <AdminNavLinks />
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-4">
              <div className="flex flex-col text-right">
                <span className="text-sm font-medium text-gray-900">Admin Panel</span>
                <span className="text-xs text-gray-500">{user.email}</span>
              </div>
              <form action={signout}>
                <Button variant={null} size="sm" className="bg-red-400 hover:bg-red-500 text-white transition-colors">Log Out</Button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <main className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  )
}
