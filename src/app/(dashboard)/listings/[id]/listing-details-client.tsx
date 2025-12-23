'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { VerifiedBadge } from '@/components/VerifiedBadge'
import { MapModal } from '@/components/MapModal'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

export function ListingDetailsClient({ listing, isOwner, user, listingId }: any) {
    const [showMap, setShowMap] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const isAvailable = listing.status === 'available'

    // Format date safely to avoid hydration mismatch
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr)
        return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
    }

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
                window.location.href = '/?success=Request sent successfully'
            }
        } catch (err) {
            alert('An error occurred')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between">
                    <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">Food Listing Details</h3>
                        <p className="mt-1 max-w-2xl text-sm text-gray-500 flex items-center gap-1">
                            Posted by {listing.donor?.organization_name || listing.donor?.display_name}
                            {listing.donor?.is_verified && <VerifiedBadge />}
                        </p>
                    </div>
                    <div>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${listing.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                            {listing.status.toUpperCase()}
                        </span>
                    </div>
                </div>
                <div className="border-t border-gray-200">
                    <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Title</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.title}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Description</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.description}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Image</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                {listing.image_url ? (
                                    <img src={listing.image_url} alt="Food" className="h-48 w-auto rounded-md object-cover" />
                                ) : (
                                    <span className="text-gray-400">No image provided</span>
                                )}
                            </dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Quantity / Type</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{listing.quantity} • {listing.food_type}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Expiry</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2" suppressHydrationWarning>
                                {formatDate(listing.expiry_date)}
                            </dd>
                        </div>

                        {/* Location Section with Map Button */}
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                            <dt className="text-sm font-medium text-gray-500">Pickup Location</dt>
                            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{listing.pickup_address || listing.address || 'Contact for address'}</p>
                                        {listing.pickup_city && (
                                            <p className="text-gray-600 text-xs mt-1">📍 {listing.pickup_city}</p>
                                        )}
                                    </div>
                                    {listing.pickup_lat && listing.pickup_lng && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setShowMap(true)}
                                            className="flex-shrink-0 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 font-semibold"
                                        >
                                            � View Details
                                        </Button>
                                    )}
                                </div>
                            </dd>
                        </div>
                    </dl>
                </div>
                <div className="px-4 py-5 sm:px-6 flex justify-end space-x-3">
                    <Link href="/">
                        <Button variant="outline">Back to Feed</Button>
                    </Link>
                    {isAvailable && !isOwner && (
                        <Button
                            onClick={handleRequestPickup}
                            className="bg-green-600 hover:bg-green-700 text-white"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Pickup Request'}
                        </Button>
                    )}
                    {isOwner && (
                        <Button variant="outline" disabled>You posted this</Button>
                    )}
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
        </>
    )
}
