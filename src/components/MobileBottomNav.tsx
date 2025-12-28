'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, PlusCircle, MessageCircle, Activity } from 'lucide-react'
import { motion } from 'framer-motion'

export function MobileBottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/feed') return pathname === '/feed' || pathname === '/'
        return pathname.startsWith(path)
    }

    const tabs = [
        { path: '/feed', icon: Home, label: 'Feed' },
        { path: '/search', icon: Search, label: 'Search' },
        { path: '/listings/create', icon: PlusCircle, label: 'Share' },
        { path: '/chats', icon: MessageCircle, label: 'Chats' },
        { path: '/activity', icon: Activity, label: 'Activity' },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 md:hidden">
            {/* Safe area padding for iOS notch */}
            <div className="pb-safe">
                <div className="flex items-center justify-around h-16 px-2">
                    {tabs.map((tab) => {
                        const Icon = tab.icon
                        const active = isActive(tab.path)

                        return (
                            <Link
                                key={tab.path}
                                href={tab.path}
                                className="flex flex-col items-center justify-center flex-1 h-full relative"
                            >
                                {/* Active indicator */}
                                {active && (
                                    <motion.div
                                        layoutId="activeTab"
                                        className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-green-500 rounded-full"
                                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    />
                                )}

                                {/* Icon */}
                                <Icon
                                    className={`h-6 w-6 transition-colors ${active ? 'text-green-600' : 'text-gray-400'
                                        }`}
                                />

                                {/* Label */}
                                <span
                                    className={`text-xs mt-1 font-medium transition-colors ${active ? 'text-green-600' : 'text-gray-500'
                                        }`}
                                >
                                    {tab.label}
                                </span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
