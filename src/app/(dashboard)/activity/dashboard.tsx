'use client'

import { Button } from '@/components/ui/button'
import { acceptRequest, confirmHandover, markDelivered } from './actions'
import { useState } from 'react'

export default function ActivityDashboard({ listings, pickups, incomingRequests }: { listings: any[], pickups: any[], incomingRequests: any[] }) {
    const [activeTab, setActiveTab] = useState<'listings' | 'pickups'>('listings')

    return (
        <div className="space-y-8">
            <div className="flex border-b border-gray-200">
                <button
                    onClick={() => setActiveTab('listings')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'listings' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Listings (Donations)
                </button>
                <button
                    onClick={() => setActiveTab('pickups')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'pickups' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    My Pickups (Requests)
                </button>
            </div>

            {activeTab === 'listings' && (
                <div className="space-y-8">
                    {/* Incoming Requests Section (Only relevant for Available listings) */}
                    {incomingRequests.length > 0 && (
                        <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                            <h3 className="font-semibold text-blue-900 mb-4">Incoming Requests to Review</h3>
                            <ul className="space-y-4">
                                {incomingRequests.map((req: any) => (
                                    <li key={req.id} className="bg-white p-4 rounded shadow-sm flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-gray-900">Request for: {req.listing.title}</p>
                                            <p className="text-sm text-gray-500">From: {req.volunteer_id} (Volunteer)</p>
                                            {/* Note: In real app, join profile to get name */}
                                        </div>
                                        <div className="flex space-x-2">
                                            <form action={() => acceptRequest(req.id)}>
                                                <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">Accept</Button>
                                            </form>
                                            <Button size="sm" variant="outline" className="text-red-600 border-red-200">Reject</Button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* My Listings List */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-md">
                        <ul className="divide-y divide-gray-200">
                            {listings.map((listing) => (
                                <li key={listing.id} className="p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-medium text-gray-900">{listing.title}</p>
                                            <p className="text-sm text-gray-500">Status: <span className="font-semibold">{listing.status.toUpperCase()}</span></p>
                                        </div>

                                        {/* Actions based on Status */}
                                        {listing.status === 'booked' && (
                                            <form action={() => confirmHandover(listing.id)}>
                                                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                                    Mark Picked Up (Handover)
                                                </Button>
                                            </form>
                                        )}
                                        {listing.status === 'picked_up' && (
                                            <span className="text-sm text-yellow-600 bg-yellow-50 px-2 py-1 rounded">Out for Delivery</span>
                                        )}
                                        {listing.status === 'delivered' && (
                                            <div className="flex items-center text-green-600">
                                                <span className="mr-2">✓</span>
                                                <span className="text-sm font-medium">Completed</span>
                                            </div>
                                        )}
                                    </div>
                                </li>
                            ))}
                            {listings.length === 0 && <p className="p-4 text-gray-500">No listings yet.</p>}
                        </ul>
                    </div>
                </div>
            )}

            {activeTab === 'pickups' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {pickups.map((pickup) => (
                            <li key={pickup.id} className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-900">{pickup.listing?.title}</p>
                                        <p className="text-sm text-gray-500">Status: <span className="font-semibold">{pickup.status.toUpperCase()}</span></p>
                                    </div>

                                    {/* Picker Actions */}
                                    {pickup.status === 'pending' && <span className="text-gray-500 text-sm">Waiting for approval...</span>}

                                    {pickup.status === 'accepted' && (
                                        <span className="text-blue-600 font-medium text-sm">Go to location for pickup</span>
                                    )}

                                    {pickup.status === 'picked_up' && (
                                        <form action={() => markDelivered(pickup.listing_id)}>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                                Mark Delivered (+10 Score)
                                            </Button>
                                        </form>
                                    )}

                                    {pickup.status === 'delivered' && (
                                        <div className="flex items-center text-green-600">
                                            <span className="mr-2">★</span>
                                            <span className="text-sm font-bold">Mission Accomplished (+10)</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                        {pickups.length === 0 && <p className="p-4 text-gray-500">No pickups yet.</p>}
                    </ul>
                </div>
            )}
        </div>
    )
}
