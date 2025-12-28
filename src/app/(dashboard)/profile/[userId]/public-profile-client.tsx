'use client'

import { VerifiedBadge } from '@/components/VerifiedBadge'
import { ByteMateButton } from '@/components/ByteMateButton'
import { MapPin, Calendar, Briefcase, Award, Heart, UserPlus, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PublicProfileClientProps {
    profile: any
    recentListings: any[]
    byteMateStatus: {
        isFollowing: boolean
        isFollowedBy: boolean
    }
}

export function PublicProfileClient({ profile, recentListings, byteMateStatus }: PublicProfileClientProps) {
    // Determine Badge
    let badge = 'Newcomer'
    let badgeColor = 'bg-gray-100 text-gray-700'
    let badgeEmoji = '🌱'
    const score = profile.impact_score || 0
    if (score >= 100) { badge = 'Community Hero'; badgeColor = 'bg-yellow-100 text-yellow-800'; badgeEmoji = '🏆' }
    else if (score >= 50) { badge = 'Impact Maker'; badgeColor = 'bg-purple-100 text-purple-800'; badgeEmoji = '⭐' }
    else if (score >= 10) { badge = 'Active Contributor'; badgeColor = 'bg-green-100 text-green-800'; badgeEmoji = '🌿' }

    const displayName = profile.display_name || profile.full_name || 'User'
    const username = profile.display_name || profile.email?.split('@')[0] || 'user'

    return (
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover/Banner */}
                <div className="h-32 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500" />

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    {/* Avatar Row */}
                    <div className="flex justify-between items-start -mt-16">
                        <div className="relative">
                            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-4xl font-bold text-white">
                                        {displayName[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Name & Verification */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {displayName}
                            </h1>
                            {profile.is_verified && <VerifiedBadge />}
                        </div>
                        <p className="text-gray-500 mt-0.5">@{username}</p>
                    </div>

                    {/* Bio */}
                    {profile.bio && (
                        <p className="mt-3 text-gray-700 leading-relaxed">{profile.bio}</p>
                    )}

                    {/* Meta Info */}
                    <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-500">
                        {profile.organization_name && (
                            <div className="flex items-center gap-1.5">
                                <Briefcase className="h-4 w-4" />
                                <span>{profile.organization_name}</span>
                            </div>
                        )}
                        {profile.location_city && (
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4" />
                                <span>{profile.location_city}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4" />
                            <span suppressHydrationWarning>Joined {new Date(profile.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                        </div>
                    </div>

                    {/* Role Badge */}
                    <div className="mt-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${badgeColor}`}>
                            {badgeEmoji} {badge}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 capitalize">{profile.role}</span>
                    </div>

                    {/* Action Buttons - Full Width Row */}
                    <div className="mt-6 flex gap-3">
                        <ByteMateButton
                            targetUserId={profile.id}
                            initialIsFollowing={byteMateStatus.isFollowing}
                            initialIsFollowedBy={byteMateStatus.isFollowedBy}
                        />
                        <Link href={`/chats?user=${profile.id}`} className="flex-1">
                            <Button
                                variant={null}
                                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 transition-colors"
                            >
                                <MessageCircle className="h-4 w-4 mr-1.5" />
                                Message
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Stats Card */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Impact Stats</h2>
                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                        <div className="flex justify-center mb-2">
                            <Award className="h-6 w-6 text-green-600" />
                        </div>
                        <p className="text-2xl font-bold text-green-600">{profile.impact_score || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Impact Score</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-amber-50 rounded-xl">
                        <div className="flex justify-center mb-2">
                            <Heart className="h-6 w-6 text-orange-500" />
                        </div>
                        <p className="text-2xl font-bold text-orange-500">{profile.total_meals_donated || profile.meals_shared || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Meals Donated</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                        <div className="flex justify-center mb-2">
                            <UserPlus className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-500">{profile.bytemate_count || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">ByteMates</p>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            {recentListings.length > 0 && (
                <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {recentListings.map(listing => (
                            <div key={listing.id} className="border border-gray-200 rounded-lg p-3 hover:border-green-300 transition-colors">
                                {listing.image_url && (
                                    <img
                                        src={listing.image_url}
                                        alt={listing.title}
                                        className="w-full h-24 object-cover rounded-md mb-2"
                                    />
                                )}
                                <h3 className="font-medium text-sm text-gray-900 line-clamp-1">{listing.title}</h3>
                                <p className="text-xs text-gray-500 mt-1">{listing.food_category || listing.food_type}</p>
                                <p className="text-xs text-gray-400 mt-1" suppressHydrationWarning>
                                    {new Date(listing.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
