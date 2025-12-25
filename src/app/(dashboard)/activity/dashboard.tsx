'use client'

import { Button } from '@/components/ui/button'
import { acceptRequest, confirmHandover, markDelivered } from './actions'
import { useState, useTransition } from 'react'
import Link from 'next/link'

export default function ActivityDashboard({ listings, pickups, incomingRequests }: {
    listings: any[],
    pickups: any[],
    incomingRequests: any[]
}) {
    const [activeTab, setActiveTab] = useState<'listings' | 'pickups'>('listings')

    return (
        <div className="space-y-8">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'listings' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Listings (Donations)
                </button>
                <button
                    onClick={() => setActiveTab('pickups')}
                    className={`py-4 px-6 text-sm font-medium transition-colors ${activeTab === 'pickups' ? 'border-b-2 border-green-500 text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Pickups (Requests)
                </button>
            </div>

            {activeTab === 'listings' && (
                <div className="space-y-8">
                    {/* Incoming Requests Section */}
                    {incomingRequests.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-4">Incoming Requests to Review</h3>
                            <ul className="space-y-4">
                                {incomingRequests.map((req: any) => (
                                    <li key={req.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                                        <div className="flex justify-between items-start gap-4">
                                            <div className="flex-1">
                                                {/* User Info - Like Feed Card */}
                                                <div className="flex items-center mb-3">
                                                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium text-gray-600">
                                                        {req.volunteer?.full_name?.[0] || req.volunteer?.email?.[0]?.toUpperCase() || 'U'}
                                                    </div>
                                                    <div className="ml-3">
                                                        <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                                                            {req.volunteer?.email || 'Unknown User'}
                                                            {req.volunteer?.is_verified && (
                                                                <svg className="inline-block" width="16" height="16" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                                    <circle cx="9" cy="9" r="9" fill="#10B981" />
                                                                    <path d="M6 9L8 11L12 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                                </svg>
                                                            )}
                                                        </p>
                                                        <p className="text-xs text-gray-500 capitalize">{req.volunteer?.role || 'Volunteer'}</p>
                                                    </div>
                                                </div>

                                                {/* Request Info */}
                                                <p className="text-base font-semibold text-gray-900 ml-13">
                                                    Request for: <span className="text-indigo-600">{req.listing.title}</span>
                                                </p>
                                            </div>

                                            <div className="flex space-x-2 flex-shrink-0">
                                                <form action={() => acceptRequest(req.id)}>
                                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                                                </form>
                                                <Button size="sm" variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">Reject</Button>
                                            </div>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* My Listings List */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-xl">
                        <ul className="divide-y divide-gray-100">
                            {listings.length === 0 ? (
                                <li className="p-8 text-center text-gray-500">
                                    No listings yet. Start sharing food to see them here!
                                </li>
                            ) : listings.map((listing) => {
                                // Find active volunteer for name display
                                const activePickup = listing.pickups?.find((p: any) =>
                                    ['accepted', 'picked_up', 'delivered'].includes(p.status)
                                )
                                const volunteer = activePickup?.volunteer
                                const status = listing.status;

                                return (
                                    <li key={listing.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 border-b-2 border-gray-200 last:border-b-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-lg font-semibold text-gray-900">{listing.title}</h4>
                                                    {/* Only show badge for available status */}
                                                    {status === 'available' && (
                                                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-green-50 text-green-700 border-green-200">
                                                            AVAILABLE
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Show volunteer name if not available */}
                                                {volunteer && status !== 'available' && (
                                                    <p className="text-xs text-gray-500 mt-2">
                                                        Volunteer: <span className="font-medium text-gray-700">{volunteer.display_name || volunteer.email}</span>
                                                    </p>
                                                )}
                                            </div>

                                            {/* Actions */}
                                            <div className="ml-6 flex items-center">
                                                {status === 'booked' && (
                                                    <form action={() => confirmHandover(listing.id)}>
                                                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                                                            Confirm Handover
                                                        </Button>
                                                    </form>
                                                )}
                                                {status === 'picked_up' && (
                                                    <span className="text-sm font-medium text-yellow-600 flex items-center bg-yellow-50 px-3 py-1 rounded-full">
                                                        <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
                                                        Out for Delivery
                                                    </span>
                                                )}
                                                {status === 'delivered' && (
                                                    <div className="flex items-center text-green-600 bg-green-50 px-3 py-1 rounded-full">
                                                        <span className="mr-1.5 font-bold">✓</span>
                                                        <span className="text-sm font-medium">Completed</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'pickups' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-xl">
                    <ul className="divide-y divide-gray-100">
                        {pickups.length === 0 ? (
                            <li className="p-8 text-center text-gray-500">
                                No pickups yet. Request food from the feed to see them here!
                            </li>
                        ) : pickups.map((pickup) => {
                            const donor = pickup.listing?.donor
                            return (
                                <li key={pickup.id} className="p-6 hover:bg-gradient-to-r hover:from-gray-50 hover:to-white transition-all duration-200 border-b-2 border-gray-200 last:border-b-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div>
                                                <h4 className="text-lg font-semibold text-gray-900 mb-1">{pickup.listing.title}</h4>
                                                {/* Show donor name */}
                                                {donor && (
                                                    <p className="text-xs text-gray-500">
                                                        From: <span className="font-medium text-gray-700">{donor.display_name || donor.email}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="ml-6 flex items-center gap-4">
                                            {/* Unified Status Badge */}
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${pickup.status === 'pending' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                                                pickup.status === 'accepted' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                                    pickup.status === 'picked_up' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                                        'bg-green-50 text-green-700 border-green-200'
                                                }`}>
                                                {pickup.status === 'pending' ? 'Waiting Approval' :
                                                    pickup.status === 'accepted' ? 'Approved for Pickup' :
                                                        pickup.status === 'picked_up' ? 'Out for Delivery' :
                                                            'Delivered'}
                                            </span>

                                            {/* Actions */}
                                            {pickup.status === 'picked_up' && (
                                                <PickupAction
                                                    action={markDelivered}
                                                    id={pickup.listing_id}
                                                    label="Mark Delivered"
                                                />
                                            )}
                                        </div>
                                    </div>
                                </li>
                            )
                        })}
                    </ul>
                </div>
            )}
        </div>
    )
}

function PickupAction({ action, id, label }: { action: (id: string) => Promise<void>, id: string, label: string }) {
    const [isPending, startTransition] = useTransition()

    return (
        <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white disabled:opacity-50 min-w-[140px]"
            disabled={isPending}
            onClick={() => startTransition(() => action(id))}
        >
            {isPending ? (
                <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Updating...
                </>
            ) : label}
        </Button>
    )
}
