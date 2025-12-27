'use client'

import Link from 'next/link'
import { VerifiedBadge } from './VerifiedBadge'
import { Award, Users } from 'lucide-react'
import { UserSearchResult } from '@/app/(dashboard)/search/actions'

interface UserSearchCardProps {
    user: UserSearchResult
}

export function UserSearchCard({ user }: UserSearchCardProps) {
    const displayName = user.display_name || user.organization_name || user.email.split('@')[0]
    const username = user.display_name || user.email.split('@')[0]

    return (
        <Link
            href={`/profile/${user.id}`}
            className="block bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md hover:border-green-300 transition-all duration-200"
        >
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md">
                        {user.avatar_url ? (
                            <img
                                src={user.avatar_url}
                                alt={displayName}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-xl font-bold text-white">
                                {displayName[0]?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                </div>

                {/* User Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                            {displayName}
                        </h3>
                        {user.is_verified && <VerifiedBadge />}
                    </div>
                    <p className="text-sm text-gray-500 truncate">@{username}</p>
                    {user.bio && (
                        <p className="text-xs text-gray-600 mt-1 line-clamp-1">{user.bio}</p>
                    )}
                </div>

                {/* Stats */}
                <div className="flex-shrink-0 text-right">
                    <div className="flex items-center gap-1 text-green-600 mb-1">
                        <Award className="h-4 w-4" />
                        <span className="text-sm font-semibold">{user.impact_score}</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-500">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-xs">{user.bytemate_count}</span>
                    </div>
                </div>
            </div>
        </Link>
    )
}
