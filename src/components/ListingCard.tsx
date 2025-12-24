'use client'

import React from 'react'
import { VerifiedBadge } from './VerifiedBadge'
import { MapPin, Package, Clock, Calendar } from 'lucide-react'

export interface ListingCardProps {
    listing: any
}

export function ListingCard({ listing }: ListingCardProps) {
    if (!listing) return null
    if (!listing.priorityInfo) return null

    return (
        <div className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full border border-gray-100">

            {/* Header: User Info - Highlighted */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-gray-50 bg-white/50 backdrop-blur-sm z-10">
                <div className="relative flex-shrink-0">
                    <div className="h-9 w-9 rounded-full bg-gray-100 flex items-center justify-center text-xs overflow-hidden ring-2 ring-white shadow-sm ring-offset-1 ring-offset-green-50">
                        {listing.donor?.avatar_url ? (
                            <img src={listing.donor.avatar_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                            <span className="text-gray-600 font-bold">
                                {listing.donor?.display_name?.[0]?.toUpperCase() || 'U'}
                            </span>
                        )}
                    </div>
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold text-gray-900 truncate max-w-[140px]">
                            {listing.donor?.organization_name || listing.donor?.display_name || 'Anonymous'}
                        </p>
                        {/* Fixed Verified Badge with strict sizing and Green Color */}
                        {listing.donor?.is_verified && (
                            <div className="flex-shrink-0">
                                <VerifiedBadge className="w-4 h-4 text-green-500" />
                            </div>
                        )}
                    </div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-green-700">
                        {listing.role === 'restaurant' ? 'Restaurant' : listing.role === 'volunteer' ? 'Volunteer' : 'Donor'}
                    </p>
                </div>
            </div>

            {/* Image Area */}
            <div className="relative h-44 bg-gray-100 overflow-hidden">
                <img
                    src={listing.image_url || '/placeholder-food.jpg'}
                    alt={listing.title}
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 ease-in-out"
                />

                {/* Overlays */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />

                {/* Priority Badge */}
                {listing.priorityInfo.band === 'critical' && (
                    <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-600 text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg animate-pulse">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                            Urgent
                        </span>
                    </div>
                )}

                {/* Category Badge */}
                <div className="absolute bottom-3 left-3 flex gap-2">
                    {listing.food_category && (
                        <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide rounded-md shadow-sm border border-white/20 backdrop-blur-md
                           ${listing.food_category === 'veg' ? 'bg-green-600 text-white' :
                                listing.food_category === 'non-veg' ? 'bg-red-600 text-white' : 'bg-orange-600 text-white'}`}>
                            {listing.food_category === 'veg' ? 'Veg' :
                                listing.food_category === 'non-veg' ? 'Non-Veg' : 'Both'}
                        </span>
                    )}
                </div>
            </div>

            {/* Content Body */}
            <div className="p-4 flex-1 flex flex-col">
                {/* Title & Expiry Row */}
                <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 group-hover:text-green-700 transition-colors">
                        {listing.title}
                    </h3>
                    {/* Expiry Badge */}
                    <div className="flex-shrink-0 pt-0.5">
                        <ExpiryDisplay expiryDate={listing.expiry_date} />
                    </div>
                </div>

                {/* Description - Darker Text */}
                <p className="text-xs text-gray-600 font-medium line-clamp-2 mb-4 leading-relaxed">
                    {listing.description}
                </p>

                {/* Footer: Location & Quantity - Visual Hierarchy Focus */}
                <div className="mt-auto grid grid-cols-2 gap-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-2 group/loc">
                        <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600 group-hover/loc:bg-blue-100 transition-colors">
                            <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <div className="flex flex-col">
                            {/* Darker Labels */}
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Location</span>
                            <span className="text-xs font-bold text-gray-800 truncate max-w-[100px]" title={listing.pickup_city}>
                                {listing.distanceKm !== null
                                    ? (listing.distanceKm < 1 ? '<1 km' : `${listing.distanceKm.toFixed(1)} km`)
                                    : listing.pickup_city || 'Nearby'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 justify-end group/qty">
                        <div className="flex flex-col items-end">
                            {/* Darker Labels */}
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wide">Quantity</span>
                            <span className="text-xs font-bold text-gray-900 truncate">
                                {listing.quantity}
                            </span>
                        </div>
                        <div className="p-1.5 rounded-lg bg-green-50 text-green-600 group-hover/qty:bg-green-100 transition-colors">
                            <Package className="w-3.5 h-3.5" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Action Button - Dark to Green Style */}
            <div className="p-4 pt-0">
                <a
                    href={`/listings/${listing.id}`}
                    className="block w-full py-2.5 bg-gray-900 hover:bg-green-600 text-white text-center text-sm font-bold rounded-xl shadow-md transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 group-hover:bg-green-600"
                >
                    Request Pickup
                </a>
            </div>
        </div>
    )
}

function ExpiryDisplay({ expiryDate }: { expiryDate: string }) {
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
        Icon = Clock
    } else if (hoursLeft < 24) {
        text = `${Math.round(hoursLeft)}h left`
        colorClass = 'text-orange-700 bg-orange-50 border-orange-100'
        Icon = Clock
    } else {
        text = `${Math.round(hoursLeft / 24)}d left`
        colorClass = 'text-green-700 bg-green-50 border-green-100'
        Icon = Calendar
    }

    return (
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wide border ${colorClass}`}>
            <Icon className="w-3 h-3" />
            {text}
        </span>
    )
}
