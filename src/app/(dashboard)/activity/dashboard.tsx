'use client'

import { Button } from '@/components/ui/button'
import { acceptRequest, confirmHandover, markDelivered } from './actions'
import { useState } from 'react'
import Link from 'next/link'

export default function ActivityDashboard({ listings, pickups, incomingRequests, chatRooms }: {
    listings: any[],
    pickups: any[],
    incomingRequests: any[],
    chatRooms: any[]
}) {
    const [activeTab, setActiveTab] = useState<'listings' | 'pickups' | 'chats'>('listings')

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
                <button
                    onClick={() => setActiveTab('chats')}
                    className={`py-4 px-6 text-sm font-medium ${activeTab === 'chats' ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    Chats
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
                                        <p className="font-medium text-gray-900">{pickup.listing.title}</p>
                                        <p className="text-sm text-gray-500">Status: <span className="font-semibold">{pickup.status.toUpperCase()}</span></p>
                                    </div>

                                    {pickup.status === 'picked_up' && (
                                        <form action={() => markDelivered(pickup.id)}>
                                            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
                                                Mark as Delivered
                                            </Button>
                                        </form>
                                    )}
                                    {pickup.status === 'delivered' && (
                                        <div className="flex items-center text-green-600">
                                            <span className="mr-2">✓</span>
                                            <span className="text-sm font-medium">Delivered</span>
                                        </div>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}


            {activeTab === 'chats' && (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    {chatRooms.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="mb-4">
                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No Chats Yet</h3>
                            <p className="text-sm text-gray-500 mb-4">
                                When you accept a pickup request, a chat will automatically be created so you can coordinate with the volunteer.
                            </p>
                            <Link href="/">
                                <Button className="bg-indigo-600 hover:bg-indigo-700">
                                    Browse Food Listings
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {chatRooms.map((room: any) => {
                                const otherUser = room.donor_id === room.donor.id ? room.volunteer : room.donor
                                return (
                                    <li key={room.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                                                    {otherUser.avatar_url ? (
                                                        <img src={otherUser.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <span className="text-sm font-medium">{otherUser.display_name?.[0] || 'U'}</span>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">{otherUser.display_name || 'User'}</p>
                                                    <p className="text-sm text-gray-500">
                                                        Last message: {new Date(room.last_message_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <Link href={`/chats/${room.id}`}>
                                                <Button size="sm" variant="outline">Open Chat</Button>
                                            </Link>
                                        </div>
                                    </li>
                                )
                            })}
                        </ul>
                    )}
                </div>
            )}
        </div>
    )
}
