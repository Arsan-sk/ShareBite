'use client'

import Link from 'next/link'
import { signout } from '@/app/(auth)/actions'
import { Button } from './ui/button'
import { User } from '@supabase/supabase-js'
import NotificationDropdown from './notifications-dropdown'

export default function Navbar({ user }: { user: User }) {
    return (
        <nav className="bg-white shadow">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center">
                            <Link href="/" className="text-xl font-bold text-green-600">
                                ShareBite
                            </Link>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                href="/"
                                className="border-green-500 text-gray-900 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Feed
                            </Link>
                            <Link
                                href="/activity"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Activity
                            </Link>
                            <Link
                                href="/profile"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Profile
                            </Link>
                            <Link
                                href="/leaderboard"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Leaderboard
                            </Link>
                            <Link
                                href="/dashboard"
                                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                            >
                                Dashboard
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <NotificationDropdown userId={user.id} />
                        <span className="text-sm text-gray-500 mr-4 ml-4">
                            {user.email}
                        </span>
                        <form action={signout}>
                            <Button variant="outline" size="sm">
                                Sign out
                            </Button>
                        </form>
                    </div>
                </div>
            </div>
        </nav>
    )
}
