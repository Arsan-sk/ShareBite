'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { EditProfileModal } from '@/components/EditProfileModal'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { Edit3, MapPin, Calendar, Mail, Phone, Briefcase, Award, Heart, Package } from 'lucide-react'
import Link from 'next/link'
import { signout } from '@/app/(auth)/actions'

interface ProfileClientProps {
    profile: any
    pendingRequest: any
}

export function ProfileClient({ profile, pendingRequest }: ProfileClientProps) {
    const [showEditModal, setShowEditModal] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0)

    // Determine Badge
    let badge = 'Newcomer'
    let badgeColor = 'bg-gray-100 text-gray-700'
    let badgeEmoji = '🌱'
    const score = profile.impact_score || 0
    if (score >= 100) { badge = 'Community Hero'; badgeColor = 'bg-yellow-100 text-yellow-800'; badgeEmoji = '🏆' }
    else if (score >= 50) { badge = 'Impact Maker'; badgeColor = 'bg-purple-100 text-purple-800'; badgeEmoji = '⭐' }
    else if (score >= 10) { badge = 'Active Contributor'; badgeColor = 'bg-green-100 text-green-800'; badgeEmoji = '🌿' }

    const handleProfileSave = () => {
        // Refresh the page to show updated data
        window.location.reload()
    }

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
            {/* Profile Header Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Cover/Banner */}
                <div className="h-28 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-500" />

                {/* Profile Info */}
                <div className="px-6 pb-6">
                    {/* Avatar + Edit Button Row */}
                    <div className="flex justify-between items-start -mt-12">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
                                {profile.avatar_url ? (
                                    <img src={profile.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                ) : (
                                    <span className="text-3xl font-bold text-white">
                                        {profile.display_name?.[0]?.toUpperCase() || profile.email?.[0]?.toUpperCase() || 'U'}
                                    </span>
                                )}
                            </div>
                        </div>
                        <Button
                            onClick={() => setShowEditModal(true)}
                            variant={null}
                            size="sm"
                            className="mt-14 bg-green-500 hover:bg-green-600 text-white font-medium transition-colors"
                        >
                            <Edit3 className="h-4 w-4 mr-1.5" />
                            Edit Profile
                        </Button>
                    </div>

                    {/* Name & Verification */}
                    <div className="mt-4">
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {profile.display_name || profile.full_name || 'User'}
                            </h1>
                            {profile.is_verified && <VerifiedBadge />}
                        </div>
                        <p className="text-gray-500 mt-0.5">@{profile.email?.split('@')[0]}</p>
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
                        {profile.phone_number && (
                            <div className="flex items-center gap-1.5">
                                <Phone className="h-4 w-4" />
                                <span>{profile.phone_number}</span>
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
                            <Package className="h-6 w-6 text-blue-500" />
                        </div>
                        <p className="text-2xl font-bold text-blue-500">{profile.meals_received || 0}</p>
                        <p className="text-xs text-gray-500 mt-1">Meals Received</p>
                    </div>
                </div>
            </div>

            {/* Verification Card */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Verification</h2>

                {profile.is_verified ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                        <div className="flex-shrink-0 bg-green-100 rounded-full p-2">
                            <svg className="h-5 w-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-green-800">Verified Account</p>
                            <p className="text-sm text-green-600">Your identity has been verified. Thank you for being a trusted member!</p>
                        </div>
                    </div>
                ) : pendingRequest ? (
                    <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100">
                        <div className="flex-shrink-0 bg-amber-100 rounded-full p-2">
                            <svg className="h-5 w-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <p className="font-medium text-amber-800">Verification Pending</p>
                            <p className="text-sm text-amber-600" suppressHydrationWarning>
                                Your application is under review. Submitted on {new Date(pendingRequest.submitted_at).toLocaleDateString()}.
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
                        <div>
                            <p className="font-medium text-gray-800">Get Verified</p>
                            <p className="text-sm text-gray-500">Verify your identity to build trust and unlock more features.</p>
                        </div>
                        <Link href="/profile/verify">
                            <Button className="bg-green-600 hover:bg-green-700 text-white">
                                Apply
                            </Button>
                        </Link>
                    </div>
                )}
            </div>

            {/* Account Info Card */}
            <div className="mt-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Account</h2>
                <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">{profile.email}</span>
                    </div>
                    {profile.location_address && (
                        <div className="flex items-start gap-3 text-sm">
                            <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                            <span className="text-gray-600">{profile.location_address}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Sign Out Button */}
            <div className="mt-8 flex justify-center">
                <form action={signout} className="w-full">
                    <Button
                        variant={null}
                        className="w-full bg-red-400 hover:bg-red-500 text-white transition-colors py-6 text-lg rounded-xl shadow-sm"
                    >
                        Sign Out
                    </Button>
                </form>
            </div>

            {/* Edit Modal */}
            <EditProfileModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                profile={profile}
                onSave={handleProfileSave}
            />
        </div>
    )
}
