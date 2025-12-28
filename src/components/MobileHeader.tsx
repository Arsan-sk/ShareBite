'use client'

import Link from 'next/link'
import { User } from '@supabase/supabase-js'
import NotificationDropdown from './notifications-dropdown'

interface MobileHeaderProps {
    user: User
}

export function MobileHeader({ user }: MobileHeaderProps) {
    const displayInitial = (user.email?.[0] || 'U').toUpperCase()

    return (
        <header className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 md:hidden">
            <div className="flex items-center justify-between h-14 px-4">
                {/* Logo */}
                <Link href="/feed" className="text-xl font-bold text-green-600">
                    ShareBite
                </Link>

                {/* Right side: Notifications + Avatar */}
                <div className="flex items-center gap-3">
                    <NotificationDropdown userId={user.id} />

                    <Link href="/profile" className="flex items-center">
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-sm">
                            {user.user_metadata?.avatar_url ? (
                                <img
                                    src={user.user_metadata.avatar_url}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <span className="text-sm font-bold text-white">
                                    {displayInitial}
                                </span>
                            )}
                        </div>
                    </Link>
                </div>
            </div>
        </header>
    )
}
