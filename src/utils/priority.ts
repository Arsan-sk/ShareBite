/**
 * Priority Scoring Utilities for ShareBite Feed
 * 
 * Calculates priority scores for food listings based on:
 * - Expiry urgency (50% weight)
 * - Distance from user (35% weight)  
 * - BiteLink follow status (15% weight - future)
 */

// Priority weights
export const WEIGHTS = {
    EXPIRY: 0.50,
    DISTANCE: 0.35,
    FOLLOW: 0.15
}

// Caps for normalization
export const CAPS = {
    EXPIRY_HOURS: 48,    // After 48 hours, urgency is minimal
    DISTANCE_KM: 20      // After 20 km, distance score is 0
}

/**
 * Calculate expiry urgency score (0 → 1)
 * Higher score = more urgent (closer to expiry)
 */
export function calculateExpiryScore(expiryDate: Date | string | null): number {
    if (!expiryDate) return 0

    const now = new Date()
    const expiry = new Date(expiryDate)
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    // If already expired, score is 0 (shouldn't show)
    if (hoursLeft <= 0) return 0

    // Normalize: 1 hour left = 0.98, 48+ hours = 0
    return Math.max(0, 1 - Math.min(hoursLeft / CAPS.EXPIRY_HOURS, 1))
}

/**
 * Calculate distance score (0 → 1) 
 * Higher score = closer to user
 */
export function calculateDistanceScore(
    userLat: number | null,
    userLng: number | null,
    listingLat: number | null,
    listingLng: number | null
): number {
    // If either location is missing, return 0
    if (!userLat || !userLng || !listingLat || !listingLng) return 0

    const distanceKm = haversineDistance(userLat, userLng, listingLat, listingLng)

    // Normalize: 0 km = 1, 20+ km = 0
    return Math.max(0, 1 - Math.min(distanceKm / CAPS.DISTANCE_KM, 1))
}

/**
 * Calculate follow score (0 or 1)
 * For now returns 0 - will be implemented with BiteLink feature
 */
export function calculateFollowScore(userFollowsDonor: boolean = false): number {
    return userFollowsDonor ? 1 : 0
}

/**
 * Calculate final priority score (0 → 1)
 */
export function calculatePriorityScore(
    expiryScore: number,
    distanceScore: number,
    followScore: number = 0
): number {
    return (
        (expiryScore * WEIGHTS.EXPIRY) +
        (distanceScore * WEIGHTS.DISTANCE) +
        (followScore * WEIGHTS.FOLLOW)
    )
}

/**
 * Priority band definitions
 */
export type PriorityBand = 'critical' | 'high' | 'medium' | 'low'

export interface PriorityInfo {
    band: PriorityBand
    color: string
    bgColor: string
    label: string
    showBadge: boolean
}

/**
 * Get priority band info based on score
 */
export function getPriorityBand(score: number): PriorityInfo {
    if (score >= 0.80) {
        return {
            band: 'critical',
            color: 'text-red-700',
            bgColor: 'bg-red-100',
            label: '🔴 URGENT',
            showBadge: true
        }
    }
    if (score >= 0.60) {
        return {
            band: 'high',
            color: 'text-orange-700',
            bgColor: 'bg-orange-100',
            label: '🟠 High Priority',
            showBadge: true
        }
    }
    if (score >= 0.35) {
        return {
            band: 'medium',
            color: 'text-yellow-700',
            bgColor: 'bg-yellow-100',
            label: '🟡 Available',
            showBadge: true
        }
    }
    return {
        band: 'low',
        color: 'text-gray-500',
        bgColor: 'bg-gray-100',
        label: '',
        showBadge: false
    }
}

/**
 * Haversine formula to calculate distance between two coordinates
 * Returns distance in kilometers
 */
export function haversineDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
): number {
    const R = 6371 // Earth's radius in km

    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180)
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
    if (km < 1) {
        return `${Math.round(km * 1000)}m away`
    }
    return `${km.toFixed(1)} km away`
}

/**
 * Format time until expiry for display
 */
export function formatTimeUntilExpiry(expiryDate: Date | string): string {
    const now = new Date()
    const expiry = new Date(expiryDate)
    const hoursLeft = (expiry.getTime() - now.getTime()) / (1000 * 60 * 60)

    if (hoursLeft <= 0) return 'Expired'
    if (hoursLeft < 1) return `${Math.round(hoursLeft * 60)} min left`
    if (hoursLeft < 24) return `${Math.round(hoursLeft)} hrs left`
    return `${Math.round(hoursLeft / 24)} days left`
}
