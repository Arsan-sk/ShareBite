'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CheckCircle, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function AdminMobileNav() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (path: string) => pathname.startsWith(path)

    const navItems = [
        { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { path: '/admin/users', icon: Users, label: 'Users' },
        { path: '/admin/verification', icon: CheckCircle, label: 'Verification' },
    ]

    return (
        <>
            {/* Mobile Menu Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-200"
            >
                {isOpen ? (
                    <X className="h-6 w-6 text-gray-700" />
                ) : (
                    <Menu className="h-6 w-6 text-gray-700" />
                )}
            </button>

            {/* Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="md:hidden fixed inset-0 bg-black/50 z-40"
                    />
                )}
            </AnimatePresence>

            {/* Slide-out Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ x: '-100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '-100%' }}
                        transition={{ type: 'spring', damping: 20 }}
                        className="md:hidden fixed left-0 top-0 bottom-0 w-64 bg-white shadow-xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            <div className="mb-8 mt-12">
                                <h2 className="text-2xl font-bold text-red-600">Admin Panel</h2>
                                <p className="text-sm text-gray-500 mt-1">ShareBite Management</p>
                            </div>

                            <nav className="space-y-2">
                                {navItems.map((item) => {
                                    const Icon = item.icon
                                    const active = isActive(item.path)

                                    return (
                                        <Link
                                            key={item.path}
                                            href={item.path}
                                            onClick={() => setIsOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${active
                                                    ? 'bg-red-50 text-red-600 font-medium'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                                }`}
                                        >
                                            <Icon className="h-5 w-5" />
                                            <span>{item.label}</span>
                                        </Link>
                                    )
                                })}
                            </nav>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
