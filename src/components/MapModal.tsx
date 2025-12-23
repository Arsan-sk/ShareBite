'use client'

import { useState, useEffect } from 'react'
import { X, MapPin, Clock, Navigation, AlertCircle, Locate, MapIcon } from 'lucide-react'
import { Button } from './ui/button'
import { Location } from '@/utils/location'
import { createClient } from '@/utils/supabase/client'

interface MapModalProps {
    isOpen: boolean
    onClose: () => void
    pickupLocation: Location
    listingTitle: string
}

export function MapModal({ isOpen, onClose, pickupLocation, listingTitle }: MapModalProps) {
    const [userLocation, setUserLocation] = useState<Location | null>(null)
    const [distance, setDistance] = useState<{ km: number; text: string; duration: string } | null>(null)
    const [locationSource, setLocationSource] = useState<'current' | 'profile' | 'none'>('none')
    const [hasProfileLocation, setHasProfileLocation] = useState(false)
    const [gettingLocation, setGettingLocation] = useState(false)

    // Check for saved profile location on modal open
    useEffect(() => {
        if (!isOpen) return

        const checkProfileLocation = async () => {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()

            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('location_lat, location_lng, location_address, location_city')
                    .eq('id', user.id)
                    .single()

                if (profile?.location_lat && profile?.location_lng) {
                    setHasProfileLocation(true)
                    const profileLoc: Location = {
                        lat: profile.location_lat,
                        lng: profile.location_lng,
                        address: profile.location_address || undefined,
                        city: profile.location_city || undefined,
                    }
                    setUserLocation(profileLoc)
                    setLocationSource('profile')
                    await calculateDistance(profileLoc)
                } else {
                    setHasProfileLocation(false)
                    setLocationSource('none')
                }
            }
        }

        checkProfileLocation()
    }, [isOpen, pickupLocation])

    const calculateDistance = async (fromLoc: Location) => {
        try {
            const res = await fetch('/api/location/distance', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    from: fromLoc,
                    to: pickupLocation,
                }),
            })
            const data = await res.json()
            setDistance({
                km: data.distanceKm,
                text: data.distanceText,
                duration: data.durationText,
            })
        } catch (err) {
            console.error('Distance calculation error:', err)
        }
    }

    // Get current location - same approach as LocationPicker
    const getCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert('Location not supported by your browser')
            return
        }

        setGettingLocation(true)
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords
                const currentLoc: Location = {
                    lat: latitude,
                    lng: longitude,
                }
                setUserLocation(currentLoc)
                setLocationSource('current')
                await calculateDistance(currentLoc)
                setGettingLocation(false)
            },
            (error) => {
                alert('Unable to get location: ' + error.message)
                setGettingLocation(false)
            }
        )
    }

    // Use saved profile location
    const useProfileLocation = async () => {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (user) {
            const { data: profile } = await supabase
                .from('profiles')
                .select('location_lat, location_lng, location_address, location_city')
                .eq('id', user.id)
                .single()

            if (profile?.location_lat && profile?.location_lng) {
                const profileLoc: Location = {
                    lat: profile.location_lat,
                    lng: profile.location_lng,
                    address: profile.location_address || undefined,
                    city: profile.location_city || undefined,
                }
                setUserLocation(profileLoc)
                setLocationSource('profile')
                await calculateDistance(profileLoc)
            }
        }
    }

    // Open directions in Google Maps
    const openDirections = () => {
        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
        const destination = `${pickupLocation.lat},${pickupLocation.lng}`
        const url = `https://www.google.com/maps/dir/${origin}/${destination}`
        window.open(url, '_blank')
    }

    // Generate embedded map URL
    const getEmbedMapUrl = () => {
        const origin = userLocation ? `${userLocation.lat},${userLocation.lng}` : ''
        const destination = `${pickupLocation.lat},${pickupLocation.lng}`

        if (userLocation) {
            return `https://www.google.com/maps/embed/v1/directions?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&origin=${origin}&destination=${destination}&mode=driving`
        } else {
            return `https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${destination}`
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {/* Header - Green theme */}
                <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white truncate pr-4">{listingTitle}</h2>
                    <button onClick={onClose} className="text-white/80 hover:text-white transition-colors p-1 rounded-full hover:bg-white/20 flex-shrink-0">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Embedded Map - Scrolls with content, increased height */}
                <div className="w-full">
                    <iframe
                        width="100%"
                        height="300"
                        style={{ border: 0, display: 'block' }}
                        loading="lazy"
                        allowFullScreen
                        referrerPolicy="no-referrer-when-downgrade"
                        src={getEmbedMapUrl()}
                    />
                </div>

                {/* Content */}
                <div className="p-5 space-y-4">
                    {/* Location Buttons */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            onClick={getCurrentLocation}
                            disabled={gettingLocation}
                            variant="outline"
                            size="sm"
                            className={`${locationSource === 'current' ? 'bg-green-100 border-green-500 text-green-700' : 'border-gray-300'}`}
                        >
                            {gettingLocation ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                                    Getting...
                                </>
                            ) : (
                                <>
                                    <Locate className="h-4 w-4 mr-1.5" />
                                    Use Current Location
                                </>
                            )}
                        </Button>

                        {hasProfileLocation && (
                            <Button
                                onClick={useProfileLocation}
                                variant="outline"
                                size="sm"
                                className={`${locationSource === 'profile' ? 'bg-blue-100 border-blue-500 text-blue-700' : 'border-gray-300'}`}
                            >
                                <MapPin className="h-4 w-4 mr-1.5" />
                                Use Saved Location
                            </Button>
                        )}
                    </div>

                    {/* Location Info Card */}
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 space-y-4 border border-green-100">
                        {/* Pickup Location */}
                        <div className="flex items-start gap-3">
                            <div className="bg-green-100 p-2 rounded-lg flex-shrink-0">
                                <MapPin className="h-5 w-5 text-green-700" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-green-700 uppercase tracking-wide">Pickup Location</span>
                                <p className="font-semibold text-gray-900 mt-0.5 text-sm break-words">{pickupLocation.address || 'Address not provided'}</p>
                            </div>
                        </div>

                        {/* Your Location */}
                        <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${locationSource !== 'none' ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                <Navigation className={`h-5 w-5 ${locationSource !== 'none' ? 'text-blue-600' : 'text-gray-400'}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Your Location</span>
                                <p className={`font-semibold mt-0.5 text-sm ${locationSource === 'none' ? 'text-gray-400' : 'text-gray-900'}`}>
                                    {locationSource === 'current' && '📍 Current Location (GPS)'}
                                    {locationSource === 'profile' && '🏠 Saved Profile Location'}
                                    {locationSource === 'none' && '— Select a location above'}
                                </p>
                            </div>
                        </div>

                        {/* Distance and Time */}
                        <div className="border-t border-green-200 pt-4 grid grid-cols-2 gap-3">
                            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-green-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Distance</span>
                                <span className="text-xl font-bold text-green-600 mt-1 block">
                                    {distance && locationSource !== 'none' ? distance.text : '—'}
                                </span>
                            </div>

                            <div className="bg-white rounded-lg p-3 text-center shadow-sm border border-green-100">
                                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">Est. Time</span>
                                <span className="text-xl font-bold text-gray-900 mt-1 block">
                                    {distance && locationSource !== 'none' ? distance.duration : '—'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* No Location Warning */}
                    {!hasProfileLocation && locationSource === 'none' && (
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <div className="text-sm">
                                <p className="font-medium text-amber-800">No saved location in profile</p>
                                <p className="text-amber-700 mt-0.5">Click "Use Current Location" to calculate distance.</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1 font-semibold">
                            Close
                        </Button>
                        <Button
                            onClick={openDirections}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                        >
                            <MapIcon className="h-4 w-4 mr-1.5" />
                            Open in Maps
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
