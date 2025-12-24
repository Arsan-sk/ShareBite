'use client'

import { useState } from 'react'
import { Search, Filter, CheckCircle, XCircle, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface User {
    id: string
    email: string
    full_name: string | null
    display_name: string | null
    role: string
    is_verified: boolean
    created_at: string
    impact_score: number | null
    meals_shared: number | null
    meals_received: number | null
    phone_number: string | null
    avatar_url: string | null
}

interface UserManagementClientProps {
    users: User[]
}

export function UserManagementClient({ users }: UserManagementClientProps) {
    const [searchQuery, setSearchQuery] = useState('')
    const [roleFilter, setRoleFilter] = useState<string>('all')
    const [verifiedFilter, setVerifiedFilter] = useState<string>('all')
    const [hoveredUser, setHoveredUser] = useState<string | null>(null)

    // Filter users
    const filteredUsers = users.filter(user => {
        const matchesSearch =
            (user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.display_name?.toLowerCase().includes(searchQuery.toLowerCase()))

        const matchesRole = roleFilter === 'all' || user.role === roleFilter
        const matchesVerified = verifiedFilter === 'all' ||
            (verifiedFilter === 'verified' && user.is_verified) ||
            (verifiedFilter === 'unverified' && !user.is_verified)

        return matchesSearch && matchesRole && matchesVerified
    })

    // Get unique roles for filter
    const roles = ['all', ...Array.from(new Set(users.map(u => u.role)))]

    const roleLabels: Record<string, string> = {
        'resident': '🏠 Resident',
        'restaurant': '🍽️ Restaurant',
        'volunteer': '🤝 Volunteer',
        'ngo': '🏛️ NGO'
    }

    const roleColors: Record<string, string> = {
        'resident': 'bg-blue-100 text-blue-800',
        'restaurant': 'bg-orange-100 text-orange-800',
        'volunteer': 'bg-green-100 text-green-800',
        'ngo': 'bg-purple-100 text-purple-800'
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">User Management</h1>
                <p className="text-sm text-gray-500">View and manage all users on the platform.</p>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                {/* Search */}
                <div className="flex-1 min-w-[200px] relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by name or email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-sm"
                    />
                </div>

                {/* Role Filter */}
                <div className="relative">
                    <select
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm cursor-pointer"
                    >
                        <option value="all">All Roles</option>
                        {roles.filter(r => r !== 'all').map(role => (
                            <option key={role} value={role} className="capitalize">{role}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Verified Filter */}
                <div className="relative">
                    <select
                        value={verifiedFilter}
                        onChange={(e) => setVerifiedFilter(e.target.value)}
                        className="appearance-none pl-4 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white text-sm cursor-pointer"
                    >
                        <option value="all">All Status</option>
                        <option value="verified">Verified</option>
                        <option value="unverified">Unverified</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Results count */}
                <div className="flex items-center text-sm text-gray-500">
                    <Filter className="h-4 w-4 mr-1" />
                    {filteredUsers.length} of {users.length} users
                </div>
            </div>

            {/* User Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map(user => (
                    <div
                        key={user.id}
                        className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                        onMouseEnter={() => setHoveredUser(user.id)}
                        onMouseLeave={() => setHoveredUser(null)}
                    >
                        {/* User Header */}
                        <div className="p-4 border-b border-gray-100">
                            <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden">
                                    {user.avatar_url ? (
                                        <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                                    ) : (
                                        <span className="text-lg font-bold text-white">
                                            {(user.display_name || user.full_name || user.email)?.[0]?.toUpperCase() || 'U'}
                                        </span>
                                    )}
                                </div>

                                {/* Name & Email */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">
                                            {user.display_name || user.full_name || 'Unknown'}
                                        </h3>
                                        {user.is_verified && (
                                            <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Role & Status */}
                        <div className="px-4 py-3 flex items-center justify-between bg-gray-50">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                                {roleLabels[user.role] || user.role}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${user.is_verified
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-gray-100 text-gray-600'
                                }`}>
                                {user.is_verified ? '✓ Verified' : 'Unverified'}
                            </span>
                        </div>

                        {/* Stats (shown on hover) */}
                        <div className={`px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100 transition-all duration-300 ${hoveredUser === user.id ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0 overflow-hidden py-0'
                            }`}>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div>
                                    <p className="text-lg font-bold text-green-600">{user.impact_score || 0}</p>
                                    <p className="text-xs text-gray-500">Impact</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-orange-500">{user.meals_shared || 0}</p>
                                    <p className="text-xs text-gray-500">Shared</p>
                                </div>
                                <div>
                                    <p className="text-lg font-bold text-blue-500">{user.meals_received || 0}</p>
                                    <p className="text-xs text-gray-500">Received</p>
                                </div>
                            </div>
                        </div>

                        {/* Joined Date */}
                        <div className="px-4 py-2 text-xs text-gray-400 border-t border-gray-100">
                            Joined {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredUsers.length === 0 && (
                <div className="text-center py-12 bg-white rounded-xl border-2 border-dashed border-gray-200">
                    <XCircle className="mx-auto h-12 w-12 text-gray-300" />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                    <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    )
}
