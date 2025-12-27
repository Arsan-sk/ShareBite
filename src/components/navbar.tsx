'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signout } from '@/app/(auth)/actions'
import { Button } from './ui/button'
import { User } from '@supabase/supabase-js'
import NotificationDropdown from './notifications-dropdown'
import { ChatBadge } from './ChatBadge'

export default function Navbar({ user }: { user: User }) {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/') return pathname === '/'
        return pathname.startsWith(path)
    }

    const linkClass = (path: string) => {
        const base = "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors"
        if (isActive(path)) {
            return `${base} border-green-500 text-gray-900`
        }
        return `${base} border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700`
    }

    return (
        <nav className="bg-white shadow-sm sticky top-0 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-green-600 hover:text-green-700 transition-colors">
                                ShareBite
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link href="/" className={linkClass('/')}>
                                Feed
                            </Link>
                            <Link href="/activity" className={linkClass('/activity')}>
                                Activity
                            </Link>
                            <ChatBadge userId={user.id} isActive={isActive('/chats')} />
                            <Link href="/leaderboard" className={linkClass('/leaderboard')}>
                                Leaderboard
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationDropdown userId={user.id} />

                        <Link href="/profile" className="flex items-center group">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md transition-all group-hover:ring-green-400">
                                {user.user_metadata?.avatar_url ? (
                                    <img src={user.user_metadata.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-lg font-bold text-white">
                                        {(user.email?.[0] || 'U').toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    )
}
