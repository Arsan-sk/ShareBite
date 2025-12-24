'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { MapModal } from '@/components/MapModal'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { CheckCircle, X, MapPin, Clock, Calendar, ChevronLeft, Package, User, Share2, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function ListingDetailsClient({ listing, isOwner, user, listingId }: any) {
    const [showMap, setShowMap] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const router = useRouter()

    const isAvailable = listing.status === 'available'

    const handleRequestPickup = async () => {
        setIsSubmitting(true)
        try {
            const supabase = createClient()
            const { data: success, error: rpcError } = await supabase.rpc('request_pickup', {
                p_listing_id: listingId,
                p_volunteer_id: user.id
            })

            if (rpcError || !success) {
                alert('Request failed or already requested')
            } else {
                setShowSuccess(true)
            }
        } catch (err) {
            alert('An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in-up">
            {/* Navigation / Header */}
            <div className="flex items-center justify-between mb-6">
                <Link
                    href="/"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Back to Feed
                </Link>
                <div className="flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide border
                        ${listing.status === 'available' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {listing.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Hero Image */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-gray-100 shadow-sm border border-gray-100 group">
                        <img
                            src={listing.image_url || '/placeholder-food.jpg'}
                            alt={listing.title}
                            className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />

                        {/* Overlay Categories */}
                        <div className="absolute bottom-4 left-4 flex gap-2">
                            {listing.food_category && (
                                <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-lg shadow-lg border border-white/20 backdrop-blur-md
                                   ${listing.food_category === 'veg' ? 'bg-green-600 text-white' :
                                        listing.food_category === 'non-veg' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>
                                    {listing.food_category === 'veg' ? '🟢 Veg' :
                                        listing.food_category === 'non-veg' ? '🔴 Non-Veg' : '🟠 Both'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title & Description */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start gap-4 mb-4">
                            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                                {listing.title}
                            </h1>
                            <ExpiryBadge expiryDate={listing.expiry_date} size="lg" />
                        </div>

                        <div className="prose prose-green max-w-none">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Description</h3>
                            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">
                                {listing.description}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Column: Sidebar Actions */}
                <div className="space-y-6">
                    {/* Donor Card */}
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-lg overflow-hidden ring-4 ring-gray-50">
                            {listing.donor?.avatar_url ? (
                                <img src={listing.donor.avatar_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                <span className="text-gray-400 font-bold">
                                    {listing.donor?.display_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">Posted by</p>
                            <div className="flex items-center gap-1.5">
                                <span className="font-bold text-gray-900 truncate text-lg">
                                    {listing.donor?.organization_name || listing.donor?.display_name || 'Anonymous'}
                                </span>
                                {listing.donor?.is_verified && <VerifiedBadge className="w-5 h-5 text-green-500" />}
                            </div>
                            <p className="text-xs font-medium text-green-600">
                                {listing.role === 'restaurant' ? 'Restaurant Partner' : listing.role === 'volunteer' ? 'Registered Volunteer' : 'Community Donor'}
                            </p>
                        </div>
                    </div>

                    {/* Details Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
                        <div className="flex items-center gap-3 pb-4 border-b border-gray-50">
                            <div className="p-2.5 bg-green-50 text-green-600 rounded-xl">
                                <Package className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Quantity</p>
                                <p className="font-bold text-gray-900">{listing.quantity} <span className="text-gray-400 font-normal">• {listing.food_type}</span></p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl mt-1">
                                <MapPin className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">Pickup Location</p>
                                <p className="font-semibold text-gray-900 text-sm mt-0.5">{listing.pickup_address || listing.address || 'Contact for address'}</p>
                                {listing.pickup_city && <p className="text-xs text-gray-500 mt-1">{listing.pickup_city}</p>}

                                {listing.pickup_lat && listing.pickup_lng && (
                                    <button
                                        onClick={() => setShowMap(true)}
                                        className="mt-3 flex items-center gap-1.5 text-xs font-bold text-green-600 hover:text-green-700 hover:underline"
                                    >
                                        View on Map &rarr;
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100 sticky top-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Share2 className="w-4 h-4" /> Ready to rescue?
                        </h3>

                        {isAvailable && !isOwner ? (
                            <button
                                onClick={handleRequestPickup}
                                disabled={isSubmitting}
                                className="w-full py-3.5 bg-gray-900 hover:bg-green-600 text-white font-bold rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                            >
                                {isSubmitting ? (
                                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        Request Pickup
                                        <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </>
                                )}
                            </button>
                        ) : isOwner ? (
                            <div className="text-center p-4 bg-gray-50 rounded-xl border border-gray-100 text-gray-500 font-medium text-sm">
                                You posted this listing
                            </div>
                        ) : (
                            <div className="text-center p-4 bg-gray-100 rounded-xl text-gray-500 font-bold">
                                No longer available
                            </div>
                        )}

                        <p className="text-[10px] text-gray-400 text-center mt-3 leading-tight">
                            By requesting, you agree to pickup within the specified time window.
                        </p>
                    </div>
                </div>
            </div>

            {/* Map Modal */}
            {listing.pickup_lat && listing.pickup_lng && (
                <MapModal
                    isOpen={showMap}
                    onClose={() => setShowMap(false)}
                    pickupLocation={{
                        lat: listing.pickup_lat,
                        lng: listing.pickup_lng,
                        address: listing.pickup_address || listing.address,
                        city: listing.pickup_city
                    }}
                    listingTitle={listing.title}
                />
            )}

            {/* Success Modal */}
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center transform scale-100 animate-scale-in">
                        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6 ring-8 ring-green-50">
                            <CheckCircle className="h-8 w-8 text-green-600" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Request Sent!</h3>
                        <p className="text-sm text-gray-600 mb-8 leading-relaxed">
                            Your pickup request for <span className="font-semibold text-gray-900">"{listing.title}"</span> has been sent.
                            The donor will be notified instantly.
                        </p>
                        <div className="space-y-3">
                            <Link href="/activity?tab=pickups" className="block w-full">
                                <Button className="w-full bg-green-600 hover:bg-green-700 h-10 rounded-xl font-bold text-white shadow-lg shadow-green-200">
                                    View My Requests
                                </Button>
                            </Link>
                            <Link href="/" className="block w-full">
                                <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-900 font-medium">
                                    Back to Feed
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

function ExpiryBadge({ expiryDate, size = 'md' }: { expiryDate: string, size?: 'md' | 'lg' }) {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    let text = ''
    let colorClass = ''
    let Icon = Clock

    if (hoursLeft <= 0) {
        text = 'Expired'
        colorClass = 'text-gray-500 bg-gray-100 border-gray-200'
    } else if (hoursLeft < 1) {
        text = `${Math.round(hoursLeft * 60)}m left`
        colorClass = 'text-red-700 bg-red-50 border-red-100 animate-pulse'
        Icon = AlertTriangle
    } else if (hoursLeft < 24) {
        text = `${Math.round(hoursLeft)}h left`
        colorClass = 'text-orange-700 bg-orange-50 border-orange-100'
        Icon = Clock
    } else {
        text = `${Math.round(hoursLeft / 24)}d left`
        colorClass = 'text-green-700 bg-green-50 border-green-100'
        Icon = Calendar
    }

    const sizeClasses = size === 'lg' ? 'px-4 py-1.5 text-sm gap-2' : 'px-2 py-1 text-[10px] gap-1'

    return (
        <span className={`inline-flex items-center rounded-full font-bold uppercase tracking-wide border ${colorClass} ${sizeClasses} shadow-sm`}>
            <Icon className={size === 'lg' ? "w-4 h-4" : "w-3 h-3"} />
            {text}
        </span>
    )
}
