'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export function AdminNavLinks() {
    const pathname = usePathname()

    const isActive = (path: string) => {
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
        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
            <Link href="/admin/dashboard" className={linkClass('/admin/dashboard')}>
                Dashboard
            </Link>
            <Link href="/admin/verification" className={linkClass('/admin/verification')}>
                Verification
            </Link>
            <Link href="/admin/users" className={linkClass('/admin/users')}>
                User Management
            </Link>
        </div>
    )
}
