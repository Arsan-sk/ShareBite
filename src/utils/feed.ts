/**
 * Feed Processing Utilities
 * 
 * Processes listings with priority scoring and sorting
 */

import {
    calculateExpiryScore,
    calculateDistanceScore,
    calculateFollowScore,
    calculatePriorityScore,
    getPriorityBand,
    haversineDistance,
    PriorityInfo
} from './priority'

export interface ListingWithPriority {
    id: string
    title: string
    description: string | null
    quantity: string | null
    food_type: string | null
    food_category: string | null
    expiry_date: string
    pickup_window_end: string | null
    image_url: string | null
    status: string
    address: string | null
    latitude: number | null
    longitude: number | null
    pickup_lat: number | null
    pickup_lng: number | null
    created_at: string
    donor_id: string
    donor: {
        id: string
        display_name: string | null
        organization_name: string | null
        avatar_url: string | null
        is_verified: boolean
    } | null
    // Priority fields
    priorityScore: number
    priorityInfo: PriorityInfo
    expiryScore: number
    distanceScore: number
    followScore: number
    distanceKm: number | null
}

export interface UserLocation {
    lat: number | null
    lng: number | null
}

/**
 * Process listings with priority scores
 */
export function processListingsWithPriority(
    listings: any[],
    userLocation: UserLocation,
    userFollows: string[] = [] // Array of donor IDs the user follows (future)
): ListingWithPriority[] {
    return listings.map(listing => {
        // Calculate individual scores
        const expiryScore = calculateExpiryScore(listing.expiry_date)

        // Use pickup location if available, otherwise fall back to listing location
        const listingLat = listing.pickup_lat || listing.latitude
        const listingLng = listing.pickup_lng || listing.longitude

        const distanceScore = calculateDistanceScore(
            userLocation.lat,
            userLocation.lng,
            listingLat,
            listingLng
        )

        // Calculate distance in km for display
        let distanceKm: number | null = null
        if (userLocation.lat && userLocation.lng && listingLat && listingLng) {
            distanceKm = haversineDistance(
                userLocation.lat,
                userLocation.lng,
                listingLat,
                listingLng
            )
        }

        // Follow score (future implementation)
        const followScore = calculateFollowScore(
            userFollows.includes(listing.donor_id)
        )

        // Calculate final priority
        const priorityScore = calculatePriorityScore(
            expiryScore,
            distanceScore,
            followScore
        )

        // Get priority band info
        const priorityInfo = getPriorityBand(priorityScore)

        return {
            ...listing,
            priorityScore,
            priorityInfo,
            expiryScore,
            distanceScore,
            followScore,
            distanceKm
        }
    })
}

/**
 * Sort listings by priority score (highest first)
 */
export function sortListingsByPriority(
    listings: ListingWithPriority[]
): ListingWithPriority[] {
    return [...listings].sort((a, b) => b.priorityScore - a.priorityScore)
}

/**
 * Process and sort listings in one call
 */
export function getPersonalizedFeed(
    listings: any[],
    userLocation: UserLocation,
    userFollows: string[] = []
): ListingWithPriority[] {
    const processed = processListingsWithPriority(listings, userLocation, userFollows)
    return sortListingsByPriority(processed)
}
