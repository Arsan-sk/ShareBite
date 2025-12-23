'use client'

import { useEffect, useRef, useState } from 'react'

interface MapViewProps {
    pickupLocation: { lat: number; lng: number }
    userLocation: { lat: number; lng: number }
}

// This component is currently not used since MapModal now opens Google Maps directly
// Keeping for future use when we want embedded maps
export function MapView({ pickupLocation, userLocation }: MapViewProps) {
    const mapRef = useRef<HTMLDivElement>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const initMap = async () => {
            try {
                // Dynamic import to avoid SSR issues
                const { Loader } = await import('@googlemaps/js-api-loader')

                const loader = new Loader({
                    apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
                    version: 'weekly',
                    libraries: ['places']
                })

                // Use importLibrary for newer versions
                const { Map } = await loader.importLibrary('maps') as google.maps.MapsLibrary

                if (!mapRef.current) return

                // Create map centered between the two points
                const centerLat = (pickupLocation.lat + userLocation.lat) / 2
                const centerLng = (pickupLocation.lng + userLocation.lng) / 2

                const map = new Map(mapRef.current, {
                    center: { lat: centerLat, lng: centerLng },
                    zoom: 12,
                    disableDefaultUI: false,
                    zoomControl: true,
                    mapTypeControl: false,
                    streetViewControl: false,
                })

                // Add markers using google.maps
                new google.maps.Marker({
                    position: { lat: pickupLocation.lat, lng: pickupLocation.lng },
                    map,
                    title: 'Pickup Location',
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
                    }
                })

                new google.maps.Marker({
                    position: { lat: userLocation.lat, lng: userLocation.lng },
                    map,
                    title: 'Your Location',
                    icon: {
                        url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png'
                    }
                })

                // Draw a line between the two points
                new google.maps.Polyline({
                    path: [
                        { lat: userLocation.lat, lng: userLocation.lng },
                        { lat: pickupLocation.lat, lng: pickupLocation.lng },
                    ],
                    strokeColor: '#22C55E',
                    strokeOpacity: 0.8,
                    strokeWeight: 4,
                    map,
                })

                // Auto-fit bounds
                const bounds = new google.maps.LatLngBounds()
                bounds.extend({ lat: pickupLocation.lat, lng: pickupLocation.lng })
                bounds.extend({ lat: userLocation.lat, lng: userLocation.lng })
                map.fitBounds(bounds)

                setLoading(false)
            } catch (err) {
                console.error('Map loading error:', err)
                setError('Failed to load map.')
                setLoading(false)
            }
        }

        initMap()
    }, [pickupLocation, userLocation])

    if (loading) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-gray-100 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Loading map...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="w-full h-64 flex items-center justify-center bg-red-50 rounded-lg border border-red-200">
                <p className="text-red-600 text-sm">{error}</p>
            </div>
        )
    }

    return <div ref={mapRef} className="w-full h-64 rounded-lg shadow-sm" />
}
