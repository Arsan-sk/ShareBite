import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Navbar from '@/components/navbar'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { MobileHeader } from '@/components/MobileHeader'

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect('/login')
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Desktop Navigation */}
            <div className="hidden md:block">
                <Navbar user={user} />
            </div>

            {/* Mobile Header */}
            <div className="block md:hidden">
                <MobileHeader user={user} />
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 md:mt-0 mt-14 mb-20 md:mb-0">
                {children}
            </main>

            {/* Mobile Bottom Navigation */}
            <MobileBottomNav />
        </div>
    )
}
