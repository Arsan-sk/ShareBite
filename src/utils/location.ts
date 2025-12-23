export interface Location {
    lat: number
    lng: number
    address?: string
    city?: string | undefined
}

export interface DistanceResult {
    distanceKm: number
    distanceMeters: number
    durationMinutes: number
    distanceText: string
    durationText: string
}

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!

/**
 * Haversine formula for basic distance calculation (fallback when API fails)
 */
export function calculateHaversineDistance(from: Location, to: Location): number {
    const R = 6371 // Earth's radius in km
    const dLat = toRad(to.lat - from.lat)
    const dLon = toRad(to.lng - from.lng)

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(from.lat)) * Math.cos(toRad(to.lat)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
}

function toRad(degrees: number): number {
    return degrees * (Math.PI / 180)
}

/**
 * Get distance and duration using Google Maps Distance Matrix API
 */
export async function getDistanceAndTime(
    from: Location,
    to: Location
): Promise<DistanceResult> {
    try {
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${from.lat},${from.lng}&destinations=${to.lat},${to.lng}&key=${GOOGLE_MAPS_API_KEY}`

        const response = await fetch(url)
        const data = await response.json()

        if (data.status === 'OK' && data.rows[0]?.elements[0]?.status === 'OK') {
            const element = data.rows[0].elements[0]
            const distanceMeters = element.distance.value
            const durationSeconds = element.duration.value

            return {
                distanceKm: distanceMeters / 1000,
                distanceMeters,
                durationMinutes: Math.ceil(durationSeconds / 60),
                distanceText: element.distance.text,
                durationText: element.duration.text
            }
        }

        throw new Error('API returned non-OK status')
    } catch (error) {
        console.error('Google Maps API error, falling back to Haversine:', error)
        const distanceKm = calculateHaversineDistance(from, to)
        const distanceMeters = distanceKm * 1000

        return {
            distanceKm,
            distanceMeters,
            durationMinutes: Math.ceil(distanceKm * 3), // Rough estimate: 20 km/h avg
            distanceText: distanceKm < 1 ? `${distanceMeters.toFixed(0)}m` : `${distanceKm.toFixed(1)} km`,
            durationText: 'Estimated'
        }
    }
}

/**
 * Format distance for display
 */
export function formatDistance(distanceKm: number): string {
    if (distanceKm < 0.1) return '< 100m'
    if (distanceKm < 1) return `${(distanceKm * 1000).toFixed(0)}m`
    return `${distanceKm.toFixed(1)} km`
}

/**
 * Extract city from Google Maps address components
 */
export function extractCity(addressComponents: any[]): string | null {
    const cityComponent = addressComponents.find(c =>
        c.types.includes('locality') ||
        c.types.includes('administrative_area_level_2')
    )
    return cityComponent?.long_name || null
}

/**
 * Geocode an address to coordinates (server-side only)
 */
export async function geocodeAddress(address: string): Promise<Location | null> {
    try {
        console.log('[geocodeAddress] Input address:', address)
        console.log('[geocodeAddress] API Key present:', !!GOOGLE_MAPS_API_KEY)

        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`
        const response = await fetch(url)
        const data = await response.json()

        console.log('[geocodeAddress] API Status:', data.status)
        console.log('[geocodeAddress] Error Message:', data.error_message)

        if (data.status === 'OK' && data.results[0]) {
            const result = data.results[0]
            const returnValue = {
                lat: result.geometry.location.lat,
                lng: result.geometry.location.lng,
                address: result.formatted_address,
                city: extractCity(result.address_components)
            }
            console.log('[geocodeAddress] Success:', returnValue)
            return returnValue
        }

        console.log('[geocodeAddress] No results found')
        return null
    } catch (error) {
        console.error('[geocodeAddress] Error:', error)
        return null
    }
}

/**
 * Reverse geocode coordinates to address (server-side only)
 */
export async function reverseGeocode(lat: number, lng: number): Promise<{ address: string; city: string | null } | null> {
    try {
        console.log('[reverseGeocode] Starting with:', { lat, lng })
        console.log('[reverseGeocode] API Key present:', !!GOOGLE_MAPS_API_KEY)
        console.log('[reverseGeocode] API Key length:', GOOGLE_MAPS_API_KEY?.length)

        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}`
        console.log('[reverseGeocode] Calling Google Maps API...')

        const response = await fetch(url)
        const data = await response.json()

        console.log('[reverseGeocode] API Status:', data.status)
        console.log('[reverseGeocode] API Error Message:', data.error_message)
        console.log('[reverseGeocode] Results count:', data.results?.length || 0)

        if (data.status === 'OK' && data.results[0]) {
            const result = data.results[0]
            const returnValue = {
                address: result.formatted_address,
                city: extractCity(result.address_components)
            }
            console.log('[reverseGeocode] Success:', returnValue)
            return returnValue
        }

        // Fallback: return coordinates as address
        console.log('[reverseGeocode] API failed, using fallback')
        return {
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city: null
        }
    } catch (error) {
        console.error('[reverseGeocode] Error:', error)
        // Fallback: return coordinates as address
        return {
            address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
            city: null
        }
    }
}

// Default coordinates for development/testing
export const PANVEL_DEFAULT: Location = {
    lat: 19.003084,
    lng: 73.116875,
    address: "Panvel, Navi Mumbai, Maharashtra, India",
    city: "Panvel"
}
